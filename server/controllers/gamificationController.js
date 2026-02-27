const Student = require("../schemas/Student"); // Verify path matches your schemas folder
const CreditTransaction = require("../models/CreditTransaction");
const ActivityLog = require("../models/ActivityLog");
const Badge = require("../models/Badge");
const BadgeService = require("../services/BadgeService");
const PowerUp = require("../models/PowerUp");

/**
 * Get Power-ups
 */
exports.getPowerUps = async (req, res) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ message: "Unauthorized" });

    const [allPowerUps, student] = await Promise.all([
      PowerUp.find({ isActive: true }).sort({ cost: 1 }),
      Student.findById(studentId).select(
        "gamification.ownedPowerUps gamification.totalCredits",
      ),
    ]);

    if (!student) return res.status(404).json({ message: "Student not found" });

    const ownedMap = new Map();
    student.gamification?.ownedPowerUps?.forEach((p) => {
      ownedMap.set(p.powerUpId, p);
    });

    const powerUpsWithStatus = allPowerUps.map((p) => {
      const ownedInfo = ownedMap.get(p.powerUpId);
      return {
        ...p.toObject(),
        isOwned: !!ownedInfo,
        expiresAt: ownedInfo?.expiresAt || null, // Include expiration
        ownedCount: student.gamification.ownedPowerUps.filter(
          (op) => op.powerUpId === p.powerUpId,
        ).length,
        canAfford: (student.gamification.totalCredits || 0) >= p.cost,
      };
    });

    res.json({
      success: true,
      powerUps: powerUpsWithStatus,
      balance: student.gamification.totalCredits || 0,
    });
  } catch (error) {
    console.error("Get PowerUps Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Purchase Power-up
 */
exports.purchasePowerUp = async (req, res) => {
  try {
    const studentId = req.user?.id;
    const { powerUpId } = req.body;

    if (!studentId) return res.status(401).json({ message: "Unauthorized" });
    if (!powerUpId)
      return res.status(400).json({ message: "Power-up ID required" });

    const powerUp = await PowerUp.findOne({ powerUpId });
    if (!powerUp)
      return res.status(404).json({ message: "Power-up not found" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if ((student.gamification.totalCredits || 0) < powerUp.cost) {
      return res.status(400).json({ message: "Insufficient credits" });
    }

    // 1. Deduct Credits & Add Power-up
    student.gamification.totalCredits -= powerUp.cost;

    const expiry =
      powerUp.durationHours > 0
        ? new Date(Date.now() + powerUp.durationHours * 60 * 60 * 1000)
        : null;

    student.gamification.ownedPowerUps.push({
      powerUpId: powerUp.powerUpId,
      purchasedAt: new Date(),
      expiresAt: expiry,
      isActive: true,
    });

    // 2. Log Transaction
    const transaction = new CreditTransaction({
      studentId,
      amount: -powerUp.cost,
      type: "STORE_PURCHASE",
      message: `Purchased Power-up: ${powerUp.name}`,
      referenceId: powerUp._id,
      referenceModel: "PowerUp",
    });

    // 3. Log Activity
    const log = new ActivityLog({
      actorId: studentId,
      actorName: student.name || student.studentName,
      verb: "PURCHASED",
      object: powerUp.name,
      targetName: "Power-up",
      visibility: "PUBLIC",
      schoolId: student.school_id,
    });

    // Push to progressLog for analytics
    student.progressLog.push({
      action: "purchase_powerup",
      refId: powerUp.powerUpId,
      refTitle: powerUp.name,
      completedAt: new Date(),
    });

    await Promise.all([student.save(), transaction.save(), log.save()]);

    res.json({
      success: true,
      message: `Successfully purchased ${powerUp.name}`,
      newBalance: student.gamification.totalCredits,
      powerUp:
        student.gamification.ownedPowerUps[
          student.gamification.ownedPowerUps.length - 1
        ],
    });
  } catch (error) {
    console.error("Purchase PowerUp Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Award credits to a student and log the transaction
 */

/**
 * Sync Badges
 */
exports.syncBadges = async (req, res) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ message: "Unauthorized" });

    const newBadges = await BadgeService.syncAllBadges(studentId);

    res.json({
      success: true,
      newBadgesCount: newBadges.length,
      newBadges,
    });
  } catch (error) {
    console.error("Sync Badges Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.awardCredits = async (
  studentId,
  amount,
  reason,
  type,
  referenceId = null,
  referenceModel = null,
) => {
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
    const { type = "alltime", limit = 50 } = req.query;
    const userSchoolId = req.user?.school_id || 1;
    const userId = req.user?.id;

    let leaderboard = [];
    let userRank = null;
    let totalStats = { count: 0 };

    // Common Date calculation
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    if (type === "weekly") {
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
            class: { $first: "$student.class" },
            score: { $sum: "$amount" },
          },
        },
        { $sort: { score: -1 } },
        { $limit: parseInt(limit) },
      ]);

      // Count unique participants this week
      const weeklyStats = await CreditTransaction.aggregate([
        { $match: { timestamp: { $gte: startOfWeek } } },
        {
          $lookup: {
            from: "students",
            localField: "studentId",
            foreignField: "_id",
            as: "student",
          },
        },
        { $match: { "student.school_id": userSchoolId } },
        { $group: { _id: "$studentId" } },
        { $count: "count" },
      ]);
      totalStats.count = weeklyStats[0]?.count || 0;

      // Find user rank if not in top list
      if (userId) {
        const topRank = leaderboard.findIndex(
          (s) => s._id.toString() === userId,
        );
        if (topRank !== -1) {
          userRank = topRank + 1;
        } else {
          // Calculate individual rank
          const userWeekly = await CreditTransaction.aggregate([
            {
              $match: {
                studentId: new mongoose.Types.ObjectId(userId),
                timestamp: { $gte: startOfWeek },
              },
            },
            { $group: { _id: "$studentId", score: { $sum: "$amount" } } },
          ]);
          const userScore = userWeekly[0]?.score || 0;
          const rankings = await CreditTransaction.aggregate([
            { $match: { timestamp: { $gte: startOfWeek } } },
            {
              $lookup: {
                from: "students",
                localField: "studentId",
                foreignField: "_id",
                as: "student",
              },
            },
            { $match: { "student.school_id": userSchoolId } },
            { $group: { _id: "$studentId", score: { $sum: "$amount" } } },
            { $match: { score: { $gt: userScore } } },
            { $count: "rank" },
          ]);
          userRank = (rankings[0]?.rank || 0) + 1;
        }
      }
    } else if (type === "class") {
      leaderboard = await Student.aggregate([
        { $match: { school_id: userSchoolId, status: "Active" } },
        {
          $group: {
            _id: "$class",
            className: { $first: "$class" },
            studentCount: { $sum: 1 },
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
            score: { $round: ["$avgCredits", 0] },
          },
        },
      ]);

      const classCount = await Student.distinct("class", {
        school_id: userSchoolId,
      });
      totalStats.count = classCount.length;

      if (userId) {
        const student = await Student.findById(userId).select("class");
        if (student) {
          const topRank = leaderboard.findIndex(
            (c) => c.name === student.class,
          );
          if (topRank !== -1) {
            userRank = topRank + 1;
          } else {
            // Find class rank manually
            const classRankings = await Student.aggregate([
              { $match: { school_id: userSchoolId, status: "Active" } },
              {
                $group: {
                  _id: "$class",
                  avgCredits: { $avg: "$gamification.totalCredits" },
                },
              },
              { $match: { _id: student.class } },
            ]);
            if (classRankings.length > 0) {
              const myAvg = classRankings[0].avgCredits;
              const betterClasses = await Student.aggregate([
                { $match: { school_id: userSchoolId, status: "Active" } },
                {
                  $group: {
                    _id: "$class",
                    avgCredits: { $avg: "$gamification.totalCredits" },
                  },
                },
                { $match: { avgCredits: { $gt: myAvg } } },
                { $count: "rank" },
              ]);
              userRank = (betterClasses[0]?.rank || 0) + 1;
            }
          }
        }
      }
    } else {
      // All-Time
      leaderboard = await Student.find({
        school_id: userSchoolId,
        status: "Active",
      })
        .sort({ "gamification.totalCredits": -1 })
        .limit(parseInt(limit))
        .select("name avatar gamification.totalCredits class")
        .lean();

      leaderboard = leaderboard.map((s) => ({
        _id: s._id,
        name: s.name,
        avatar: s.avatar,
        score: s.gamification?.totalCredits || 0,
        class: s.class,
      }));

      totalStats.count = await Student.countDocuments({
        school_id: userSchoolId,
        status: "Active",
      });

      if (userId) {
        const topRank = leaderboard.findIndex(
          (s) => s._id.toString() === userId,
        );
        if (topRank !== -1) {
          userRank = topRank + 1;
        } else {
          const student = await Student.findById(userId).select(
            "gamification.totalCredits",
          );
          if (student) {
            userRank =
              (await Student.countDocuments({
                school_id: userSchoolId,
                status: "Active",
                "gamification.totalCredits": {
                  $gt: student.gamification.totalCredits,
                },
              })) + 1;
          }
        }
      }
    }

    res.json({
      success: true,
      leaderboard,
      userRank,
      totalStudents: totalStats.count,
    });
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
      const earnedInfo = earnedBadgeMap.get(badge.id); // Use badge.id string (e.g. SPEED_MASTER)
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

/**
 * Get Marketplace Items
 */
exports.getMarketplaceItems = async (req, res) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ message: "Unauthorized" });

    const MarketplaceItem = require("../models/MarketplaceItem");

    // Check if items exist, if not seed some
    let items = await MarketplaceItem.find({ isActive: true }).sort({
      cost: 1,
    });

    if (items.length === 0) {
      const defaultItems = [
        {
          itemId: "theme_dark",
          name: "Dark Mode",
          description: "Standard high-contrast dark interface.",
          cost: 60,
          type: "theme",
          iconName: "Moon",
          color: "gray",
        },
        {
          itemId: "theme_colorful",
          name: "Modern Theme",
          description: "A balanced vibrant color palette.",
          cost: 30,
          type: "theme",
          iconName: "Palette",
          color: "blue",
        },
        {
          itemId: "avatar_pack_1",
          name: "Elite Avatar Pack",
          description: "Unlock professional academic avatar assets.",
          cost: 100,
          type: "avatar",
          iconName: "Image",
          color: "blue",
        },
        {
          itemId: "focus_audio",
          name: "Focus Audio",
          description: "Ambient study soundscapes for concentration.",
          cost: 40,
          type: "music",
          iconName: "Music",
          color: "blue",
        },
      ];
      await MarketplaceItem.insertMany(defaultItems);
      items = await MarketplaceItem.find({ isActive: true }).sort({ cost: 1 });
    }

    const student = await Student.findById(studentId).select(
      "gamification.purchasedMarketplaceItems gamification.totalCredits",
    );
    if (!student) return res.status(404).json({ message: "Student not found" });

    const purchasedMap = new Set(
      student.gamification.purchasedMarketplaceItems.map((p) => p.itemId),
    );

    const itemsWithStatus = items.map((item) => ({
      ...item.toObject(),
      isOwned: purchasedMap.has(item.itemId),
      canAfford: (student.gamification.totalCredits || 0) >= item.cost,
    }));

    res.json({
      success: true,
      items: itemsWithStatus,
      balance: student.gamification.totalCredits || 0,
    });
  } catch (error) {
    console.error("Get Marketplace Items Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Purchase Marketplace Item
 */
exports.purchaseMarketplaceItem = async (req, res) => {
  try {
    const studentId = req.user?.id;
    const { itemId } = req.body;

    if (!studentId) return res.status(401).json({ message: "Unauthorized" });
    if (!itemId) return res.status(400).json({ message: "Item ID required" });

    const MarketplaceItem = require("../models/MarketplaceItem");
    const item = await MarketplaceItem.findOne({ itemId });
    if (!item) return res.status(404).json({ message: "Item not found" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Check if already owned
    const alreadyOwned = student.gamification.purchasedMarketplaceItems.some(
      (p) => p.itemId === itemId,
    );
    if (alreadyOwned)
      return res.status(400).json({ message: "Item already owned" });

    if ((student.gamification.totalCredits || 0) < item.cost) {
      return res.status(400).json({ message: "Insufficient credits" });
    }

    // Deduct credits and add to collection
    student.gamification.totalCredits -= item.cost;
    student.gamification.purchasedMarketplaceItems.push({
      itemId: item.itemId,
      itemType: item.type,
      purchasedAt: new Date(),
      metadata: item.metadata,
    });

    // Log Transaction
    const transaction = new CreditTransaction({
      studentId,
      amount: -item.cost,
      type: "STORE_PURCHASE",
      message: `Purchased from Marketplace: ${item.name}`,
      referenceId: item._id,
      referenceModel: "MarketplaceItem",
    });

    // Log Progress for analytics
    student.progressLog.push({
      action: "purchase_powerup", // Reusing for generic purchases
      refId: item.itemId,
      refTitle: item.name,
      completedAt: new Date(),
    });

    await Promise.all([student.save(), transaction.save()]);

    res.json({
      success: true,
      message: `Successfully purchased ${item.name}`,
      newBalance: student.gamification.totalCredits,
      purchasedItem:
        student.gamification.purchasedMarketplaceItems[
          student.gamification.purchasedMarketplaceItems.length - 1
        ],
    });
  } catch (error) {
    console.error("Purchase Marketplace Item Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
