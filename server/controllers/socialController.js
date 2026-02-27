const Student = require("../schemas/Student");
const Teacher = require("../schemas/Teacher");
const Principal = require("../schemas/Principal");
const ActivityLog = require("../models/ActivityLog");
const Challenge = require("../models/Challenge");
const ActivityService = require("../services/ActivityService");
const mongoose = require("mongoose");

/**
 * Get Potential Rivals (Discovery) - V2 with Weighted Scoring
 * Finds students based on multi-factor scoring algorithm
 */
exports.getPotentialRivals = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await Student.findById(studentId).populate(
      "enrolledCourses.courseId",
      "_id",
    );

    if (!student) return res.status(404).json({ message: "Student not found" });

    const currentCredits = student.gamification.totalCredits || 0;
    const userClass = student.class;
    const userCourseIds = student.enrolledCourses
      .map((ec) => ec.courseId?._id?.toString())
      .filter(Boolean);

    // Exclude self and existing connections
    const excludeIds = [
      student._id,
      ...(student.social.rivals || []),
      ...(student.social.friends || []),
    ];

    // Get all potential candidates from same school
    const candidates = await Student.find({
      _id: { $nin: excludeIds },
      school_id: student.school_id,
    })
      .populate("enrolledCourses.courseId", "_id")
      .select(
        "studentName class gamification.totalCredits gamification.rank gamification.badges gamification.lastActivityDate avatar enrolledCourses",
      )
      .lean();

    // Calculate weighted score for each candidate
    const scoredCandidates = candidates.map((candidate) => {
      let score = 0;

      // 1. Class Match (+50 points)
      if (candidate.class === userClass) {
        score += 50;
      }

      // 2. Course Overlap (+10 per shared course)
      const candidateCourseIds = candidate.enrolledCourses
        .map((ec) => ec.courseId?._id?.toString())
        .filter(Boolean);
      const sharedCourses = userCourseIds.filter((id) =>
        candidateCourseIds.includes(id),
      );
      score += sharedCourses.length * 10;

      // 3. Skill Match (Credit proximity, scaled scoring)
      const candidateCredits = candidate.gamification?.totalCredits || 0;
      const creditDiff = Math.abs(currentCredits - candidateCredits);
      if (creditDiff <= 100) {
        score += 30; // Very close skill level
      } else if (creditDiff <= 300) {
        score += 15; // Moderate skill proximity
      } else if (creditDiff <= 500) {
        score += 5; // Distant but still relevant
      }

      // 4. Activity Recency (+20 if active in last 24h)
      const lastActivity = candidate.gamification?.lastActivityDate;
      if (lastActivity) {
        const hoursSinceActivity =
          (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60);
        if (hoursSinceActivity <= 24) {
          score += 20;
        }
      }

      // 5. Course Progress Proximity (+30 if within 15% of same course)
      if (sharedCourses.length > 0) {
        const primaryCourseId = sharedCourses[0];
        const userProg =
          student.enrolledCourses.find(
            (c) => c.courseId?._id?.toString() === primaryCourseId,
          )?.progress || 0;
        const candidateProg =
          candidate.enrolledCourses.find(
            (c) => c.courseId?._id?.toString() === primaryCourseId,
          )?.progress || 0;

        const pDiff = Math.abs(userProg - candidateProg);
        if (pDiff <= 10) score += 30;
        else if (pDiff <= 25) score += 15;
      }

      return {
        ...candidate,
        matchScore: score,
      };
    });

    // Sort by score (highest first) and limit to top 10
    const topRivals = scoredCandidates
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10)
      .map(({ enrolledCourses, ...rest }) => rest); // Remove enrolledCourses from response

    res.json({ rivals: topRivals });
  } catch (error) {
    console.error("Get Rivals Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create a Challenge
 */
exports.createChallenge = async (req, res) => {
  try {
    const initiator = req.user.id;
    const {
      opponentId: opponent,
      type = "DAILY_STREAK",
      targetValue = 7,
      durationDays = 7,
    } = req.body;

    // Validation
    if (!opponent)
      return res.status(400).json({ message: "Opponent required" });

    // Check if open challenge already exists
    const existing = await Challenge.findOne({
      $or: [
        { initiator, opponent, status: { $in: ["PENDING", "ACTIVE"] } },
        {
          initiator: opponent,
          opponent: initiator,
          status: { $in: ["PENDING", "ACTIVE"] },
        },
      ],
    });

    if (existing) {
      return res.status(400).json({
        message:
          "An active or pending challenge already exists with this student.",
      });
    }

    const challenge = new Challenge({
      initiator,
      opponent,
      title: `Challenge: ${type.replace(/_/g, " ")}`,
      description: `Target Objective: ${targetValue}`,
      type,
      targetValue,
      status: "PENDING",
      endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
    });

    await challenge.save();

    // Add to pending requests of opponent
    await Student.findByIdAndUpdate(opponent, {
      $push: {
        "social.pendingRequests": {
          from: initiator,
          type: "RIVAL",
          createdAt: new Date(),
        },
      },
    });

    res.status(201).json({ success: true, challenge });
  } catch (error) {
    console.error("Create Challenge Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Accept Challenge
 */
exports.acceptChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge)
      return res.status(404).json({ message: "Challenge not found" });

    if (challenge.opponent.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to accept this challenge" });
    }

    if (challenge.status !== "PENDING") {
      return res.status(400).json({ message: "Challenge is not pending" });
    }

    challenge.status = "ACTIVE";
    challenge.startDate = new Date();
    await challenge.save();

    // Add to rivals list for both if not already there
    await Promise.all([
      Student.findByIdAndUpdate(challenge.initiator, {
        $addToSet: { "social.rivals": challenge.opponent },
      }),
      Student.findByIdAndUpdate(challenge.opponent, {
        $addToSet: { "social.rivals": challenge.initiator },
        $pull: { "social.pendingRequests": { from: challenge.initiator } }, // Remove request
      }),
    ]);

    res.json({ success: true, challenge });
  } catch (error) {
    console.error("Accept Challenge Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get My Challenges
 */
exports.getMyChallenges = async (req, res) => {
  try {
    const studentId = req.user.id;
    const challenges = await Challenge.find({
      $or: [{ initiator: studentId }, { opponent: studentId }],
    })
      .populate("initiator", "studentName avatar")
      .populate("opponent", "studentName avatar");

    res.json({ challenges });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get Activity Feed
 */
exports.getFeed = async (req, res) => {
  try {
    const studentId = req.user.id;
    const feed = await ActivityService.getFeed(studentId);
    res.json({ feed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Like/Unlike an activity
 */
exports.likeActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role || "student"; // Default to student if not specified

    const activity = await ActivityLog.findById(activityId);
    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    // Ensure interactions object exists
    if (!activity.interactions) {
      activity.interactions = { likes: [], comments: [] };
    }

    const likeIndex = activity.interactions.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike
      activity.interactions.likes.splice(likeIndex, 1);
    } else {
      // Like
      activity.interactions.likes.push(userId);
      // Set the model based on role for mongoose refPath
      activity.interactions.likeModel =
        userRole === "teacher"
          ? "Teacher"
          : userRole === "principal"
            ? "Principal"
            : "Student";
    }

    await activity.save();
    res.json({ success: true, likes: activity.interactions.likes });
  } catch (error) {
    console.error("Like Activity Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Add a comment to an activity
 * Restricted to Teachers and Principals
 */
exports.commentOnActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role || "student";

    // Restriction check
    if (userRole !== "teacher" && userRole !== "principal") {
      return res
        .status(403)
        .json({ message: "Only teachers and principals can comment." });
    }

    if (!text)
      return res.status(400).json({ message: "Comment text is required." });

    const activity = await ActivityLog.findById(activityId);
    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    // Get user name for caching in comment
    let userName = "User";
    if (userRole === "teacher") {
      const teacher = await Teacher.findById(userId);
      userName = teacher?.teacherName || "Teacher";
    } else if (userRole === "principal") {
      const principal = await Principal.findById(userId);
      userName = principal?.principalName || "Principal";
    }

    const comment = {
      userId,
      userName,
      userRole,
      text,
      createdAt: new Date(),
    };

    if (!activity.interactions) {
      activity.interactions = { likes: [], comments: [] };
    }

    activity.interactions.comments.push(comment);
    await activity.save();

    res.json({ success: true, comment });
  } catch (error) {
    console.error("Comment Activity Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Share an achievement to the social feed
 */
exports.shareAchievement = async (req, res) => {
  try {
    const { title, type } = req.body;
    const actorId = req.user.id;
    const actorRole = req.user.role || "student";

    // Validate
    if (!title || !type)
      return res.status(400).json({ message: "Title and type are required." });

    const log = await ActivityService.logActivity({
      actorId,
      verb: "POSTED",
      object: title,
      targetName: type,
      visibility: "PUBLIC",
      actorRole,
    });

    res.json({ success: true, activity: log });
  } catch (error) {
    console.error("Share Achievement Error:", error);
    res.status(500).json({ message: error.message });
  }
};
