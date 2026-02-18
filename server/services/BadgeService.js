const Badge = require("../models/Badge");
const Student = require("../schemas/Student");
const GamificationController = require("../controllers/gamificationController");
const ActivityLog = require("../models/ActivityLog");

class BadgeService {
  /**
   * Check for badges triggered by an assessment completion
   */
  async checkAssessmentBadges(studentId, score, timeTaken) {
    try {
      const student = await Student.findById(studentId);
      const badges = await Badge.find({ category: "LEARNING" });

      const newBadges = [];

      for (const badge of badges) {
        // Skip if already earned
        if (student.gamification.badges.some((b) => b.badgeId === badge.id))
          continue;

        let earned = false;

        // Logic check
        if (badge.criteria.type === "SCORE") {
          if (score >= badge.criteria.threshold) earned = true;
          // Specific check for "Perfect Score"
          if (badge.criteria.target === "QUIZ_PERFECT" && score === 100)
            earned = true;
        } else if (badge.criteria.type === "TIME") {
          // Time criteria (e.g. under 120 seconds)
          if (timeTaken <= badge.criteria.threshold) earned = true;
        }

        if (earned) {
          await this.awardBadge(student, badge, { score, timeTaken });
          newBadges.push(badge);
        }
      }

      return newBadges;
    } catch (error) {
      console.error("Error checking assessment badges:", error);
      return [];
    }
  }

  /**
   * Check for badges triggered by streak updates
   */
  async checkStreakBadges(studentId, streakCount) {
    try {
      const student = await Student.findById(studentId);
      const badges = await Badge.find({ category: "MASTERY" }); // Assuming Streak is Mastery/Engagement

      for (const badge of badges) {
        if (student.gamification.badges.some((b) => b.badgeId === badge.id))
          continue;

        if (
          badge.criteria.type === "STREAK" &&
          streakCount >= badge.criteria.threshold
        ) {
          await this.awardBadge(student, badge, { streak: streakCount });
        }
      }
    } catch (error) {
      console.error("Error checking streak badges:", error);
    }
  }

  /**
   * Internal method to award a badge
   */
  async awardBadge(student, badge, metadata) {
    // 1. Add to Student Profile
    student.gamification.badges.push({
      badgeId: badge.id,
      name: badge.name,
      earnedAt: new Date(),
      metadata,
    });
    await student.save();

    // 2. Award Credit Bonus
    await GamificationController.awardCredits(
      student._id,
      badge.creditReward,
      `Unlocking Badge: ${badge.name}`,
      "BADGE_BONUS",
    );

    // 3. Log Public Activity
    const log = new ActivityLog({
      actorId: student._id,
      actorName: student.name,
      verb: "EARNED",
      object: badge.name, // "Speed Demon"
      targetName: "Badge",
      visibility: "PUBLIC",
      schoolId: student.school_id,
    });
    await log.save();
  }
}

module.exports = new BadgeService();
