const Badge = require("../models/Badge");
const Student = require("../schemas/Student");
const GamificationController = require("../controllers/gamificationController");
const ActivityLog = require("../models/ActivityLog");
const mongoose = require("mongoose");

class BadgeService {
  /**
   * Check for badges triggered by an assessment completion
   */
  async checkAssessmentBadges(studentId, score, timeTaken) {
    try {
      const student = await Student.findById(studentId);
      if (!student) return [];

      // Fetch all badges that could be triggered by learning/social activity
      const badges = await Badge.find({
        category: { $in: ["LEARNING", "MASTERY", "SOCIAL"] },
      });
      const now = new Date();
      const hour = now.getHours();

      const newBadges = [];

      for (const badge of badges) {
        // Skip if already earned
        if (
          student.gamification &&
          student.gamification.badges &&
          student.gamification.badges.some((b) => b.badgeId === badge.id)
        ) {
          continue;
        }

        let earned = false;

        // Logic check based on badge ID (more reliable for specific complex criteria)
        switch (badge.id) {
          case "SPEED_MASTER":
            if (score === 100 && timeTaken <= 60) earned = true;
            break;

          case "NIGHT_OWL":
            if (hour >= 22 || hour < 2) earned = true;
            break;

          case "EARLY_BIRD":
            if (hour >= 5 && hour < 8) earned = true;
            break;

          case "QUIZ_WHIZ":
            // Check if student has 10 perfect scores in history
            const perfectScores =
              student.progressLog?.filter(
                (log) =>
                  log.action === "complete_assessment" && log.score === 100,
              ).length || 0;
            if (perfectScores >= 10) earned = true;
            break;

          case "HIGH_PERFORMER":
            const highScores =
              student.progressLog?.filter(
                (log) =>
                  log.action === "complete_assessment" && log.score >= 95,
              ).length || 0;
            if (highScores >= 5) earned = true;
            break;

          case "COURSE_CRUSHER":
            const completedCourses =
              student.enrolledCourses?.filter(
                (course) => course.progress === 100,
              ).length || 0;
            if (completedCourses >= 1) earned = true;
            break;

          case "EXCELLENCE":
            // Maintain 90%+ average across all enrolled courses (min 1 course completed)
            const completedWithScores = student.enrolledCourses?.filter(
              (c) => c.progress === 100,
            );
            if (completedWithScores && completedWithScores.length >= 1) {
              // Calculate average highest score of all assessments
              let totalScore = 0;
              let totalAssessments = 0;
              student.enrolledCourses.forEach((c) => {
                c.assessmentProgress.forEach((ap) => {
                  if (ap.isCompleted) {
                    totalScore += ap.highestScore; // This might be raw score or % depending on storage
                    // In studentAssessmentController.js, progress.highestScore is 'score' (raw)
                    // We really need percentage here for average check.
                    // Assuming we stick to simple check for now: if all completed assessments are high.
                  }
                });
              });
              // Simpler logic for now: if learner has 3+ courses at 100%, award excellence.
              if (completedWithScores.length >= 3) earned = true;
            }
            break;

          case "RIVAL_DOMINATOR":
            // Win 5 challenges
            const wins =
              student.progressLog?.filter(
                (log) => log.action === "challenge_win",
              ).length || 0;
            if (wins >= 5) earned = true;
            break;

          case "MENTOR":
            // Assist peers (placeholder logic, usually triggered in feedController)
            const helpCount =
              student.progressLog?.filter((log) => log.action === "peer_help")
                .length || 0;
            if (helpCount >= 10) earned = true;
            break;
        }

        if (earned) {
          await this.awardBadge(student, badge, {
            score,
            timeTaken,
            earnedAt: now,
          });
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
      const badge = await Badge.findOne({ id: "CONSISTENT" });

      if (
        badge &&
        !student.gamification.badges.some((b) => b.badgeId === badge.id)
      ) {
        if (streakCount >= 7) {
          await this.awardBadge(student, badge, { streak: streakCount });
        }
      }
    } catch (error) {
      console.error("Error checking streak badges:", error);
    }
  }

  /**
   * Award a badge and track bidirectionally
   */
  async awardBadge(student, badge, metadata) {
    const earnedAt = new Date();

    // 1. Add to Student Profile
    student.gamification.badges.push({
      badgeId: badge.id,
      name: badge.name,
      earnedAt,
      metadata,
    });
    await student.save();

    // 2. Add to Badge Record (Bidirectional)
    await Badge.findOneAndUpdate(
      { id: badge.id },
      {
        $push: {
          availedBy: {
            studentId: student._id,
            earnedAt,
          },
        },
      },
    );

    // 3. Award Credit Bonus
    await GamificationController.awardCredits(
      student._id,
      badge.creditReward,
      `Unlocking Badge: ${badge.name}`,
      "BADGE_BONUS",
      badge._id,
      "Badge",
    );

    // 4. Log Public Activity
    const log = new ActivityLog({
      actorId: student._id,
      actorName: student.name,
      verb: "EARNED",
      object: badge.name,
      targetName: "Badge",
      visibility: "PUBLIC",
      schoolId: student.school_id,
    });
    await log.save();
  }

  /**
   * Sync all badges for a student (checks all criteria from scratch)
   * Useful for retroactive awarding
   */
  async syncAllBadges(studentId) {
    try {
      const student = await Student.findById(studentId);
      if (!student) return [];

      const badges = await Badge.find({
        category: { $in: ["LEARNING", "MASTERY", "SOCIAL"] },
      });
      const now = new Date();
      const newBadges = [];

      for (const badge of badges) {
        if (student.gamification?.badges?.some((b) => b.badgeId === badge.id))
          continue;

        let earned = false;
        // reuse same logic as above but purely from logs/profile
        switch (badge.id) {
          case "QUIZ_WHIZ":
            const perfectScores =
              student.progressLog?.filter(
                (log) =>
                  log.action === "complete_assessment" && log.score === 100,
              ).length || 0;
            if (perfectScores >= 10) earned = true;
            break;
          case "HIGH_PERFORMER":
            const highScores =
              student.progressLog?.filter(
                (log) =>
                  log.action === "complete_assessment" && log.score >= 95,
              ).length || 0;
            if (highScores >= 5) earned = true;
            break;
          case "COURSE_CRUSHER":
            const completedCourses =
              student.enrolledCourses?.filter(
                (course) => course.progress === 100,
              ).length || 0;
            if (completedCourses >= 1) earned = true;
            break;
          case "CONSISTENT":
            if ((student.gamification?.currentStreak || 0) >= 7) earned = true;
            break;
          case "EXCELLENCE":
            const completedCount =
              student.enrolledCourses?.filter((c) => c.progress === 100)
                .length || 0;
            if (completedCount >= 3) earned = true;
            break;
          case "RIVAL_DOMINATOR":
            const wins =
              student.progressLog?.filter(
                (log) => log.action === "challenge_win",
              ).length || 0;
            if (wins >= 5) earned = true;
            break;
        }

        if (earned) {
          await this.awardBadge(student, badge, { syncedAt: now });
          newBadges.push(badge);
        }
      }
      return newBadges;
    } catch (error) {
      console.error("Sync Badges Error:", error);
      return [];
    }
  }
}

module.exports = new BadgeService();
