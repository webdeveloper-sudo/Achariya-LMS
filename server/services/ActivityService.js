const ActivityLog = require("../models/ActivityLog");
const Student = require("../schemas/Student");

/**
 * Log an activity
 * @param {string} actorId - ID of the student performing the action
 * @param {string} verb - EARNED, COMPLETED, CHALLENGED, WON, JOINED
 * @param {string} object - The object of the action (e.g., "10 Credits", "Calculus Quiz")
 * @param {string} targetName - Optional detailed target name
 * @param {string} visibility - PUBLIC, FRIENDS, PRIVATE
 */
exports.logActivity = async ({
  actorId,
  verb,
  object,
  targetName,
  visibility = "PUBLIC",
}) => {
  try {
    const student = await Student.findById(actorId).select(
      "studentName school_id",
    );
    if (!student) return;

    const log = new ActivityLog({
      actorId,
      actorName: student.studentName,
      verb,
      object,
      targetName,
      visibility,
      schoolId: student.school_id,
      timestamp: new Date(),
    });

    await log.save();
    return log;
  } catch (error) {
    console.error("Activity Log Error:", error);
  }
};

/**
 * Get Activity Feed
 * @param {string} studentId - The student specific feed (friends + self + rivals)
 * @param {number} limit
 */
exports.getFeed = async (studentId, limit = 20) => {
  try {
    const student = await Student.findById(studentId);
    if (!student) return [];

    // For now, simple global feed of same school OR just self/rivals
    // Let's do a broader feed for engagement: Same School

    const feed = await ActivityLog.find({
      schoolId: student.school_id,
      visibility: "PUBLIC",
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate("actorId", "avatar"); // If actorId ref is Student

    // Remap to frontend-friendly format if needed
    return feed;
  } catch (error) {
    console.error("Get Feed Error:", error);
    return [];
  }
};
