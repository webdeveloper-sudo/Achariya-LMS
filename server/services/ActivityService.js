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
  actorRole = "student",
}) => {
  try {
    const student = await Student.findById(actorId).select(
      "studentName school_id",
    );
    if (!student) return;

    const log = new ActivityLog({
      actorId,
      actorName: student.studentName,
      actorRole,
      verb,
      object,
      targetName,
      visibility,
      schoolId: student.school_id,
      timestamp: new Date(),
      interactions: { likes: [], comments: [] },
    });

    await log.save();
    return log;
  } catch (error) {
    console.error("Activity Log Error:", error);
  }
};

/**
 * Get Activity Feed
 * @param {string} studentId - The student specific feed (prioritize same school)
 * @param {number} limit
 */
exports.getFeed = async (studentId, limit = 50) => {
  try {
    const student = await Student.findById(studentId).select("school_id");
    if (!student) return [];

    const userSchoolId = student.school_id;

    // Aggregation for prioritized feed
    const feed = await ActivityLog.aggregate([
      {
        $match: {
          visibility: "PUBLIC",
        },
      },
      {
        $addFields: {
          // Priority 1: Same school, Priority 0: Other schools
          isSameSchool: {
            $cond: [{ $eq: ["$schoolId", userSchoolId] }, 1, 0],
          },
        },
      },
      {
        $sort: {
          isSameSchool: -1, // Same school first
          timestamp: -1, // Then newest first
        },
      },
      { $limit: limit },
      {
        // Join with Student to get avatar
        $lookup: {
          from: "students",
          localField: "actorId",
          foreignField: "_id",
          as: "actorInfo",
        },
      },
      {
        $addFields: {
          actorAvatar: { $arrayElemAt: ["$actorInfo.avatar", 0] },
        },
      },
      {
        $project: {
          actorInfo: 0,
          isSameSchool: 0,
        },
      },
    ]);

    return feed;
  } catch (error) {
    console.error("Get Feed Error:", error);
    return [];
  }
};
