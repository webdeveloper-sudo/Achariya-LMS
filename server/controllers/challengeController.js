const SystemChallenge = require("../models/SystemChallenge");
const Student = require("../schemas/Student");
const ActivityService = require("../services/ActivityService");
const GamificationController = require("./gamificationController");

// ─────────────────────────────────────────────
// Helper: compute the period start for daily/weekly
// ─────────────────────────────────────────────
const getPeriodStart = (type) => {
  const now = new Date();
  if (type === "daily") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  } else {
    // weekly — start of the current week (Monday 00:00)
    const d = new Date(now);
    const day = d.getDay(); // 0=Sun
    const diff = day === 0 ? -6 : 1 - day; // shift to Monday
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
};

// ─────────────────────────────────────────────
// ADMIN: Get all challenges
// ─────────────────────────────────────────────
exports.adminGetChallenges = async (req, res) => {
  try {
    const challenges = await SystemChallenge.find().sort({
      type: 1,
      createdAt: 1,
    });
    res.json({ success: true, challenges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Create challenge
// ─────────────────────────────────────────────
exports.adminCreateChallenge = async (req, res) => {
  try {
    const { title, description, icon, type, criteria, reward, isActive } =
      req.body;

    if (!title || !description || !type || !criteria?.action || !reward) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const challenge = new SystemChallenge({
      title,
      description,
      icon,
      type,
      criteria,
      reward,
      isActive: isActive !== undefined ? isActive : true,
    });
    await challenge.save();
    res.status(201).json({ success: true, challenge });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Update challenge
// ─────────────────────────────────────────────
exports.adminUpdateChallenge = async (req, res) => {
  try {
    const challenge = await SystemChallenge.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!challenge)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, challenge });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Delete challenge
// ─────────────────────────────────────────────
exports.adminDeleteChallenge = async (req, res) => {
  try {
    const challenge = await SystemChallenge.findByIdAndDelete(req.params.id);
    if (!challenge)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Challenge deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// STUDENT: Get challenges with live progress
// ─────────────────────────────────────────────
exports.getStudentChallenges = async (req, res) => {
  try {
    const studentId = req.user.id;
    const [challenges, student] = await Promise.all([
      SystemChallenge.find({ isActive: true }).sort({ type: 1, createdAt: 1 }),
      Student.findById(studentId).select(
        "progressLog claimedChallenges gamification",
      ),
    ]);

    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    const now = new Date();

    const evaluated = challenges.map((ch) => {
      const periodStart = getPeriodStart(ch.type);
      const windowStart = new Date(
        now - ch.criteria.timeWindowHours * 60 * 60 * 1000,
      );

      // For login_streak we derive from gamification, not progressLog
      let progress = 0;
      if (ch.criteria.action === "login_streak") {
        progress = student.gamification?.currentStreak || 0;
      } else {
        // Filter progressLog entries within the time window
        const relevantLogs = (student.progressLog || []).filter((log) => {
          if (log.action !== ch.criteria.action) return false;
          if (new Date(log.completedAt) < windowStart) return false;
          // For assessment min-score filter
          if (
            ch.criteria.action === "complete_assessment" &&
            ch.criteria.minScore > 0 &&
            (log.score || 0) < ch.criteria.minScore
          )
            return false;
          // For speed filter
          if (
            ch.criteria.maxMinutes > 0 &&
            (log.durationMinutes || 0) > ch.criteria.maxMinutes
          )
            return false;
          return true;
        });
        progress = relevantLogs.length;
      }

      const total = ch.criteria.count;
      const isComplete = progress >= total;

      // Check if already claimed this period
      const alreadyClaimed = (student.claimedChallenges || []).some((cc) => {
        return (
          cc.challengeId.toString() === ch._id.toString() &&
          new Date(cc.periodStart) >= periodStart
        );
      });

      return {
        _id: ch._id,
        title: ch.title,
        description: ch.description,
        icon: ch.icon,
        type: ch.type,
        reward: ch.reward,
        progress: Math.min(progress, total),
        total,
        completed: isComplete,
        claimed: alreadyClaimed,
        criteria: ch.criteria,
      };
    });

    // Separate daily/weekly
    const daily = evaluated.filter((c) => c.type === "daily");
    const weekly = evaluated.filter((c) => c.type === "weekly");

    // Countdown until reset
    const now2 = new Date();
    const endOfDay = new Date(now2);
    endOfDay.setHours(23, 59, 59, 999);
    const dailyResetMs = endOfDay - now2;

    const endOfWeek = new Date(now2);
    const daysUntilSunday = 7 - (now2.getDay() === 0 ? 7 : now2.getDay());
    endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
    endOfWeek.setHours(23, 59, 59, 999);
    const weeklyResetMs = endOfWeek - now2;

    res.json({
      success: true,
      daily,
      weekly,
      resets: { dailyMs: dailyResetMs, weeklyMs: weeklyResetMs },
    });
  } catch (err) {
    console.error("getStudentChallenges error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// STUDENT: Claim challenge reward
// ─────────────────────────────────────────────
exports.claimChallengeReward = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id: challengeId } = req.params;

    const [challenge, student] = await Promise.all([
      SystemChallenge.findById(challengeId),
      Student.findById(studentId).select(
        "progressLog claimedChallenges gamification",
      ),
    ]);

    if (!challenge)
      return res
        .status(404)
        .json({ success: false, message: "Challenge not found" });
    if (!challenge.isActive)
      return res
        .status(400)
        .json({ success: false, message: "Challenge is no longer active" });
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    const now = new Date();
    const periodStart = getPeriodStart(challenge.type);

    // Already claimed this period?
    const alreadyClaimed = (student.claimedChallenges || []).some((cc) => {
      return (
        cc.challengeId.toString() === challengeId.toString() &&
        new Date(cc.periodStart) >= periodStart
      );
    });
    if (alreadyClaimed) {
      return res
        .status(400)
        .json({ success: false, message: "Already claimed for this period" });
    }

    // Verify challenge is actually complete
    const windowStart = new Date(
      now - challenge.criteria.timeWindowHours * 60 * 60 * 1000,
    );
    let progress = 0;
    if (challenge.criteria.action === "login_streak") {
      progress = student.gamification?.currentStreak || 0;
    } else {
      progress = (student.progressLog || []).filter((log) => {
        if (log.action !== challenge.criteria.action) return false;
        if (new Date(log.completedAt) < windowStart) return false;
        if (
          challenge.criteria.action === "complete_assessment" &&
          challenge.criteria.minScore > 0 &&
          (log.score || 0) < challenge.criteria.minScore
        )
          return false;
        if (
          challenge.criteria.maxMinutes > 0 &&
          (log.durationMinutes || 0) > challenge.criteria.maxMinutes
        )
          return false;
        return true;
      }).length;
    }

    if (progress < challenge.criteria.count) {
      return res.status(400).json({
        success: false,
        message: `Challenge not yet complete (${progress}/${challenge.criteria.count})`,
      });
    }

    // Award credits
    await GamificationController.awardCredits(
      studentId,
      challenge.reward,
      `Challenge Completed: ${challenge.title}`,
      "CHALLENGE",
      challenge._id,
      "SystemChallenge",
    );

    // 4. Log to social feed automatically
    await ActivityService.logActivity({
      actorId: studentId,
      verb: "WON",
      object: challenge.title,
      targetName: "Weekly Objective",
      visibility: "PUBLIC",
    });

    // Record claim
    await Student.findByIdAndUpdate(studentId, {
      $push: {
        claimedChallenges: {
          challengeId: challenge._id,
          claimedAt: now,
          periodStart,
        },
      },
    });

    res.json({
      success: true,
      message: `🎉 Reward claimed! +${challenge.reward} credits`,
      creditsAwarded: challenge.reward,
    });
  } catch (err) {
    console.error("claimChallengeReward error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
