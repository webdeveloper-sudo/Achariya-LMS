const Student = require("../schemas/Student");
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
    const initiatorId = req.user.id;
    const {
      opponentId,
      type = "DAILY_STREAK",
      targetValue = 7,
      durationDays = 7,
    } = req.body;

    // Validation
    if (!opponentId)
      return res.status(400).json({ message: "Opponent required" });

    // Check if open challenge already exists
    const existing = await Challenge.findOne({
      $or: [
        { initiatorId, opponentId, status: { $in: ["PENDING", "ACTIVE"] } },
        {
          initiatorId: opponentId,
          opponentId: initiatorId,
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
      initiatorId,
      opponentId,
      title: `Challenge: ${type}`,
      description: `Race to ${targetValue}!`,
      type,
      targetValue,
      status: "PENDING",
      endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
    });

    await challenge.save();

    // Add to pending requests of opponent?
    // Using the 'social.pendingRequests' in Student schema is good practice
    await Student.findByIdAndUpdate(opponentId, {
      $push: {
        "social.pendingRequests": {
          from: initiatorId,
          type: "RIVAL", // or CHALLENGE specifically if we differentiate
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

    if (challenge.opponentId.toString() !== userId) {
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
      Student.findByIdAndUpdate(challenge.initiatorId, {
        $addToSet: { "social.rivals": challenge.opponentId },
      }),
      Student.findByIdAndUpdate(challenge.opponentId, {
        $addToSet: { "social.rivals": challenge.initiatorId },
        $pull: { "social.pendingRequests": { from: challenge.initiatorId } }, // Remove request
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
      $or: [{ initiatorId: studentId }, { opponentId: studentId }],
    })
      .populate("initiatorId", "studentName avatar")
      .populate("opponentId", "studentName avatar");

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
