const Student = require("../schemas/Student"); // Verify path matches your schemas folder
const CreditTransaction = require("../models/CreditTransaction");
const ActivityLog = require("../models/ActivityLog");
const Badge = require("../models/Badge");

/**
 * Award credits to a student and log the transaction
 */
exports.awardCredits = async (studentId, amount, reason, type, referenceId = null, referenceModel = null) => {
  try {
    if (!amount || amount <= 0) return null;

    // 1. Create Transaction
    const transaction = new CreditTransaction({
      studentId,
      amount,
      type,
      message: reason,
      referenceId,
      referenceModel,
    });
    await transaction.save();

    // 2. Update Student Profile
    const student = await Student.findByIdAndUpdate(
      studentId,
      { $inc: { "gamification.totalCredits": amount } },
      { new: true },
    );

    if (!student) return { success: false, error: "Student not found" };

    // 3. Log Activity (Optional, if substantial)
    if (amount >= 10) {
      const log = new ActivityLog({
        actorId: studentId,
        actorName: student.name,
        verb: "EARNED",
        object: `${amount} Credits`,
        targetName: reason,
        visibility: "PUBLIC",
        schoolId: student.school_id,
      });
      await log.save();
    }

    return {
      success: true,
      newBalance: student.gamification.totalCredits,
      transactionId: transaction._id,
    };
  } catch (error) {
    console.error("Error awarding credits:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get Leaderboard
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'all', limit = 50 } = req.query;
    const userSchoolId = req.user?.school_id || 1; // Fallback if no user

    let leaderboard = [];

    if (type === "weekly") {
      const startOfWeek = new Date();
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

      leaderboard = await CreditTransaction.aggregate([
        {
          $lookup: {
            from: "students",
            localField: "studentId",
            foreignField: "_id",
            as: "student",
          },
        },
        { $unwind: "$student" },
        {
          $match: {
            timestamp: { $gte: startOfWeek },
            "student.school_id": userSchoolId,
          },
        },
        {
          $group: {
            _id: "$studentId",
            name: { $first: "$student.name" },
            avatar: { $first: "$student.avatar" },
            score: { $sum: "$amount" },
          },
        },
        { $sort: { score: -1 } },
        { $limit: parseInt(limit) },
      ]);
    } else if (type === "class") {
      leaderboard = await Student.aggregate([
        { $match: { school_id: userSchoolId } },
        {
          $group: {
            _id: "$class",
            className: { $first: "$class" },
            studentCount: { $sum: 1 },
            totalCredits: { $sum: "$gamification.totalCredits" },
            avgCredits: { $avg: "$gamification.totalCredits" },
          },
        },
        { $sort: { avgCredits: -1 } },
        { $limit: parseInt(limit) },
        {
          $project: {
            _id: 1,
            name: "$className",
            studentCount: 1,
            avgCredits: { $round: ["$avgCredits", 0] },
            totalCredits: 1,
            score: "$avgCredits",
          },
        },
      ]);
    } else {
      // All-Time
      const students = await Student.find({ school_id: userSchoolId })
        .sort({ "gamification.totalCredits": -1 })
        .limit(parseInt(limit))
        .select("name gamification.totalCredits gamification.badges class");

      leaderboard = students.map((s) => ({
        _id: s._id,
        name: s.name,
        score: s.gamification?.totalCredits || 0,
        class: s.class,
        badges: s.gamification?.badges?.length || 0,
      }));
    }

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Wallet History
 */
exports.getWallet = async (req, res) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ message: "Unauthorized" });

    const [history, student] = await Promise.all([
      CreditTransaction.find({ studentId }).sort({ timestamp: -1 }).limit(100),
      Student.findById(studentId).select("gamification.totalCredits"),
    ]);

    res.json({
      success: true,
      balance: student?.gamification?.totalCredits || 0,
      history,
    });
  } catch (error) {
    console.error("Wallet error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Badges
 */
exports.getBadges = async (req, res) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ message: "Unauthorized" });

    const [allBadges, student] = await Promise.all([
      Badge.find({}).sort({ creditReward: 1 }),
      Student.findById(studentId).select("gamification.badges"),
    ]);

    if (!student) return res.status(404).json({ message: "Student not found" });

    const earnedBadgeMap = new Map();
    student.gamification?.badges?.forEach((b) => {
      earnedBadgeMap.set(b.badgeId.toString(), b);
    });

    const badgesWithStatus = allBadges.map((badge) => {
      const earnedInfo = earnedBadgeMap.get(badge._id.toString());
      return {
        ...badge.toObject(),
        isEarned: !!earnedInfo,
        earnedAt: earnedInfo?.earnedAt || null,
      };
    });

    res.json({
      success: true,
      badges: badgesWithStatus,
      totalEarned: student.gamification?.badges?.length || 0,
    });
  } catch (error) {
    console.error("Get Badges Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
