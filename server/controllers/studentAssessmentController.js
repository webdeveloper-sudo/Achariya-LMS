const Student = require("../schemas/Student");
const Assessment = require("../models/Assessment");
const Module = require("../models/Module");
const Course = require("../models/Course");
const mongoose = require("mongoose");
const GamificationController = require("./gamificationController");
const BadgeService = require("../services/BadgeService");

// Get Assessment Details (with 3rd attempt logic)
exports.getAssessmentForStudent = async (req, res) => {
  try {
    const { studentId, assessmentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res
        .status(404)
        .json({ success: false, message: "Assessment not found" });
    }

    // Find progress
    let attemptsUsed = 0;

    // Iterate through enrolled courses to find the assessment progress
    // Note: We don't know exact courseId here easily unless passed, but we can search or pass it.
    // Ideally, pass courseId in params or body for optimization.
    // For now, let's look through all enrolled courses.
    // Optimization: Just check assessmentProgress if we can finding it.

    // Better strategy: We need to know which course context this is in to find the specific progress record
    // efficiently if the student is enrolled in multiple courses.
    // Assuming for now we just look for the assessmentId in any course.

    let progressRecord = null;
    for (const course of student.enrolledCourses) {
      const found = course.assessmentProgress.find(
        (ap) => ap.assessmentId.toString() === assessmentId,
      );
      if (found) {
        progressRecord = found;
        break;
      }
    }

    if (progressRecord) {
      // Check for Stale Progress (Assessment updated after last attempt)
      // Logic: If assessment.updatedAt > last history entry date
      const lastAttempt =
        progressRecord.history.length > 0
          ? progressRecord.history[progressRecord.history.length - 1].date
          : null;

      const assessmentDate = assessment.updatedAt || assessment.createdAt; // Use updatedAt if available

      if (
        lastAttempt &&
        assessmentDate &&
        new Date(assessmentDate) > new Date(lastAttempt)
      ) {
        // RESET PROGRESS
        console.log(
          "Assessment updated since last attempt. Resetting progress for student:",
          studentId,
        );
        progressRecord.attempts = 0;
        progressRecord.history = [];
        progressRecord.isCompleted = false;
        progressRecord.highestScore = 0;
        attemptsUsed = 0;

        // Perform the save update in DB
        // We need to save the student document
        // Since we modified 'progressRecord' which is a subdocument reference?
        // JS references work, but we need to call student.save()
        await student.save();
      } else {
        attemptsUsed = progressRecord.attempts;
      }
    }

    // Determine if we should show hints (Attempt 3 => attemptsUsed == 2)
    const showHints = attemptsUsed >= 2;

    // Filter questions based on permissions
    // If not showing hints/explanations, strip them?
    // Actually, usually frontend requests explanations separately or we send them but hide in UI.
    // But requirement says "hints and explanations for every question on that module" ON third attempt.
    // So we should probably send them ONLY if showHints is true to prevent cheating in prev attempts.

    const questionsToSend = assessment.questions.map((q) => {
      const qObj = q.toObject();
      if (!showHints) {
        delete qObj.explanation;
        delete qObj.hint;
        // If we want to hide correct answer too, we should, but usually frontend needs it for instant feedback?
        // Or better, backend grades it.
        // Assuming Frontend grades it for now based on previous context, but strictly we should grade on backend.
        // Given the "AdminAssessmentUpload" sends correctAnswer to frontend, likely frontend handles grading?
        // Let's send everything but Explanation/Hint unless showHints is true.
      }
      return qObj;
    });

    res.json({
      success: true,
      data: {
        ...assessment.toObject(),
        questions: questionsToSend,
        attemptsUsed,
        showHints,
      },
    });
  } catch (error) {
    console.error("Get Assessment Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Submit Assessment
exports.submitAssessment = async (req, res) => {
  try {
    const { studentId, assessmentId } = req.params;
    const { score, totalMarks, moduleId, courseId, timeTaken = 0 } = req.body;

    const student = await Student.findById(studentId);
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    // Find Enrolled Course
    const enrolledCourse = student.enrolledCourses.find(
      (c) => c.courseId.toString() === courseId,
    );
    if (!enrolledCourse)
      return res
        .status(404)
        .json({ success: false, message: "Course enrollment not found" });

    // Find or Create Progress Record
    let progressIndex = enrolledCourse.assessmentProgress.findIndex(
      (ap) => ap.assessmentId.toString() === assessmentId,
    );

    if (progressIndex === -1) {
      enrolledCourse.assessmentProgress.push({
        assessmentId,
        moduleId,
        attempts: 0,
        highestScore: 0,
        isCompleted: false,
        history: [],
      });
      progressIndex = enrolledCourse.assessmentProgress.length - 1;
    }

    const progress = enrolledCourse.assessmentProgress[progressIndex];

    // Check Attempts (Frontend should block, but backend safety)
    if (progress.attempts >= 3) {
      // Allow if just retrying for practice? Requirement says "Block submission until 100% achieved"
      // If they already passed, maybe allow re-attempt?
      // If they haven't passed and used 3 attempts, they are in the "Attempt 3 loop" until 100%.
      // So we DON'T block if they haven't passed yet.
      if (progress.isCompleted) {
        // Optional: Block retries after completion? Or allow for practice?
        // Let's allow for practice but not increment attempts to infinity or mess up logic.
        // For now, let's proceed.
      }
    }

    // Attempt Logic
    // If it's the 3rd attempt (current attempts = 2) or more, strict 100% is enforced by frontend blocking.
    // Backend also validates.
    const percentage = (score / totalMarks) * 100;

    if (progress.attempts >= 2 && percentage < 100) {
      // 3rd Attempt or later: Must score 100%
      // Note: progress.attempts is 0-indexed count of *completed* attempts?
      // No, usually 'attempts' in DB is count of attempts made.
      // If attempts=0, this is 1st attempt.
      // If attempts=2, this is 3rd attempt.
      return res.status(400).json({
        success: false,
        message: "You must score 100% on the 3rd attempt to pass.",
        isThirdAttemptFailed: true,
      });
    }

    // Update Progress Details
    progress.attempts += 1;
    progress.history.push({ score, date: new Date() });
    if (score > progress.highestScore) {
      progress.highestScore = score;
    }

    // Completion Logic: Module Complete = ALL assessments @ 100% (3rd attempt enforced)
    // This implies 100% is the target for ANY attempt to be "Completed".
    const passed = percentage === 100;

    let creditsAwarded = 0;
    let moduleCompleted = false;
    // Collect progressLog entries — written atomically AFTER student.save()
    const progressLogEntries = [];

    if (passed && !progress.isCompleted) {
      progress.isCompleted = true;

      // Award Credits (Assessment specific)
      const assessment = await Assessment.findById(assessmentId);
      const points = (assessment && assessment.credits) || 10;

      if (points > 0) {
        await GamificationController.awardCredits(
          student._id,
          points,
          `Completed Assessment: ${assessment.title}`,
          "QUIZ_PASS",
          assessment._id,
          "Assessment",
        );
        creditsAwarded += points;
      }

      // Queue progressLog entry — will be written atomically below
      progressLogEntries.push({
        action: "complete_assessment",
        refId: assessmentId,
        refTitle: assessment?.title || "Assessment",
        score: percentage,
        durationMinutes: 0,
        completedAt: new Date(),
      });

      // Bonus: Perfect Score on First Attempt
      if (progress.attempts === 1 && passed) {
        await GamificationController.awardCredits(
          student._id,
          5,
          "First Try Bonus!",
          "QUIZ_PERFECT",
          assessment._id,
          "Assessment",
        );
        creditsAwarded += 5;
      }
    }

    if (passed) {
      // We expect moduleId to be the _id (ObjectId) of the module from frontend params
      // Try to find module by _id first, if not valid ObjectId, try custom moduleId
      let moduleDoc = null;
      if (mongoose.Types.ObjectId.isValid(moduleId)) {
        moduleDoc = await Module.findById(moduleId);
      } else {
        moduleDoc = await Module.findOne({ moduleId });
      }

      if (moduleDoc && moduleDoc.assessments) {
        // IDs of all assessments in this module
        const rawModuleAssessmentIds = moduleDoc.assessments.map((id) =>
          id.toString(),
        );

        // Robustness: Only count assessments that actually exist in the DB
        // Fetch valid assessments
        const validAssessments = await Assessment.find({
          _id: { $in: rawModuleAssessmentIds },
        }).select("_id");

        const validAssessmentIds = validAssessments.map((a) =>
          a._id.toString(),
        );

        // Check if student has completed all of them
        const completedCount = enrolledCourse.assessmentProgress.filter(
          (ap) =>
            validAssessmentIds.includes(ap.assessmentId.toString()) &&
            ap.isCompleted,
        ).length;

        // Use validAssessmentIds.length as the denominator
        if (
          validAssessmentIds.length > 0 &&
          completedCount === validAssessmentIds.length
        ) {
          moduleCompleted = true;

          // Mark Module as Completed in Student Record
          const moduleObjectId = moduleDoc._id.toString();

          const alreadyCompleted = enrolledCourse.completedModules.some(
            (m) => (m.moduleId || m) === moduleObjectId,
          );

          if (!alreadyCompleted) {
            enrolledCourse.completedModules.push({
              moduleId: moduleObjectId,
              completedAt: new Date(),
            });

            // Award Module Credits
            const modulePoints = moduleDoc.credits || 20;
            await GamificationController.awardCredits(
              student._id,
              modulePoints,
              `Completed Module: ${moduleDoc.title}`,
              "MODULE_COMPLETION",
              moduleDoc._id,
              "Module",
            );
            creditsAwarded += modulePoints;

            // Queue progressLog entry
            progressLogEntries.push({
              action: "complete_module",
              refId: moduleObjectId,
              refTitle: moduleDoc.title || "Module",
              score: 0,
              durationMinutes: 0,
              completedAt: new Date(),
            });
          }
        }
      }

      // --- UPDATE ACCESSED STUDENTS IN ASSESSMENT ---
      const assessmentDoc = await Assessment.findById(assessmentId);
      if (assessmentDoc) {
        const studentEntryIndex = assessmentDoc.accessedStudents.findIndex(
          (s) => s.studentId.toString() === studentId,
        );

        if (studentEntryIndex > -1) {
          assessmentDoc.accessedStudents[studentEntryIndex].attempts += 1;
          assessmentDoc.accessedStudents[studentEntryIndex].lastScore = score;
          assessmentDoc.accessedStudents[studentEntryIndex].lastAttemptedAt =
            new Date();
        } else {
          assessmentDoc.accessedStudents.push({
            studentId: student._id,
            admissionNo: student.admissionNo,
            attempts: 1,
            lastScore: score,
            lastAttemptedAt: new Date(),
          });
        }
        await assessmentDoc.save();
      }

      // --- CHECK COURSE PROGRESS ---
      const activeCourseModules = await Module.countDocuments({
        courseId: courseId,
        isActive: true,
      });

      const activeModuleIds = await Module.find({
        courseId: courseId,
        isActive: true,
      }).select("_id");

      const activeModuleIdStrings = activeModuleIds.map((m) =>
        m._id.toString(),
      );
      const totalModules = activeModuleIds.length;

      const completedModulesList = enrolledCourse.completedModules;
      let completedModulesCount = 0;

      if (completedModulesList && completedModulesList.length > 0) {
        completedModulesCount = activeModuleIdStrings.filter((mId) =>
          completedModulesList.some((m) => (m.moduleId || m) === mId),
        ).length;
      }

      const newProgress =
        totalModules > 0
          ? Math.round((completedModulesCount / totalModules) * 100)
          : 0;

      enrolledCourse.progress = Math.min(newProgress, 100);

      // Queue course completion progressLog entry if newly complete
      if (enrolledCourse.progress === 100) {
        // We check DB state (not in-memory) later; queue unconditionally and
        // the $push is idempotent enough for our purposes (challengeController
        // de-dupes by action+refId when evaluating).
        progressLogEntries.push({
          action: "complete_course",
          refId: courseId,
          refTitle: enrolledCourse.title || "Course",
          score: 0,
          durationMinutes: 0,
          completedAt: new Date(),
        });
      }
    }

    // Save the core progress changes (assessmentProgress + completedModules + enrolledCourse.progress)
    // NOTE: Do NOT mutate student.progressLog before here — awardCredits() calls findByIdAndUpdate
    // which bumps __v, causing a VersionError if we then call student.save() with stale __v.
    await student.save();

    // Now atomically push all queued progressLog entries (separate update avoids VersionError)
    if (progressLogEntries.length > 0) {
      await Student.findByIdAndUpdate(student._id, {
        $push: { progressLog: { $each: progressLogEntries } },
      });
    }

    // Check for Badges (Now that all progress and logs are saved)
    const newBadges = await BadgeService.checkAssessmentBadges(
      student._id,
      percentage,
      timeTaken,
    );

    res.json({
      success: true,
      passed,
      creditsAwarded,
      attempts: progress.attempts,
      isCompleted: progress.isCompleted,
      moduleCompleted, // Flag for frontend confetti
      courseProgress: enrolledCourse.progress,
      newBadges, // Send new badges to frontend for popup
    });
  } catch (error) {
    console.error("Submit Assessment Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
