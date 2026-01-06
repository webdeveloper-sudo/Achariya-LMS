const Course = require("../models/Course");
const Module = require("../models/Module");
const Assessment = require("../models/Assessment");

// Helper to generate IDs
const generateCourseId = async () => {
  const count = await Course.countDocuments();
  const year = new Date().getFullYear();
  const num = (count + 1).toString().padStart(3, "0");
  return `CRS-${year}-${num}`;
};

// @desc    Create new course
// @route   POST /api/admin/courses
// @access  Private/Admin
exports.createCourse = async (req, res, next) => {
  try {
    const { title, subjectCode, description, thumbnail } = req.body;

    const courseId = await generateCourseId();

    const course = await Course.create({
      courseId,
      title,
      subjectCode,
      description,
      thumbnail,
      gradesEligible: req.body.gradesEligible,
      eligibleSchools: req.body.eligibleSchools,
      assignedTeachers: req.body.assignedTeachers,
      status: req.body.status || "draft",
      postedBy: req.user.id,
    });

    // Initial Module creation removed as per new frontend logic

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all courses
// @route   GET /api/admin/courses
// @access  Private/Admin
exports.getAllCourses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      grade,
      school,
      sort,
    } = req.query;

    // Build filter
    let query = { isActive: true }; // Default only active

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subjectCode: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "All") {
      query.status = status; // draft, published, archived
    }

    if (grade && grade !== "All") {
      query.gradesEligible = grade;
    }

    if (school) {
      query.eligibleSchools = school;
    }

    // Build sort
    let sortOption = { createdAt: -1 }; // Default newset
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "title_asc") sortOption = { title: 1 };
    else if (sort === "title_desc") sortOption = { title: -1 };

    const skip = (page - 1) * limit;

    const courses = await Course.find(query)
      .populate("assignedTeachers", "name email") // Adjust fields based on Teacher/User model
      .populate("eligibleSchools", "name") // Adjust based on School model
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      count: courses.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
      data: courses,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single course
// @route   GET /api/admin/courses/:courseId
// @access  Private/Admin
exports.getCourseById = async (req, res, next) => {
  try {
    // Search by courseId (string) or _id (ObjectId)
    // Prompt implies usage of generated courseId in implementation, but param might be _id.
    // Usually safer to check both or assume _id for efficiency if frontend uses _id.
    // Let's assume the route param is the _id or custom courseId.
    // The prompt says "Get single course with complete details including populated modules"

    let course = await Course.findOne({
      $or: [{ _id: req.params.courseId }, { courseId: req.params.courseId }],
    })
      .populate({
        path: "modules",
        options: { sort: { sequenceOrder: 1 } },
        // Populate nested assessments if needed? prompt says "Populate modules array with full module data"
      })
      .populate("assignedTeachers", "name email")
      .populate("eligibleSchools", "name location");

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (err) {
    // If req.params.courseId is not a valid ObjectId and we query _id, it throws CastError
    // We can handle that or let errorMiddleware handle it
    if (err.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        error: "Course not found",
        statusCode: 404,
      });
    }
    next(err);
  }
};

// @desc    Update course
// @route   PUT /api/admin/courses/:courseId
// @access  Private/Admin
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findOne({
      $or: [{ _id: req.params.courseId }, { courseId: req.params.courseId }],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
        statusCode: 404,
      });
    }

    // Update fields
    const fieldsToUpdate = [
      "title",
      "subjectCode",
      "description",
      "thumbnail",
      "gradesEligible",
      "eligibleSchools",
      "assignedTeachers",
      "status",
      "isActive",
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    // Recalculate total credits if modules changed?
    // The modules array is usually updated via module creation/deletion, not direct course update.
    // But if we allow reordering via updateCourse (unlikely, mostly via specialized route), we might check.
    // Here we just save the direct updates.

    await course.save();

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete course (Soft delete)
// @route   DELETE /api/admin/courses/:courseId
// @access  Private/Admin
exports.deleteCourse = async (req, res, next) => {
  try {
    let course = await Course.findOne({
      $or: [{ _id: req.params.courseId }, { courseId: req.params.courseId }],
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    course.isActive = false;
    await course.save();

    // Also soft delete modules?
    if (course.modules && course.modules.length > 0) {
      await Module.updateMany(
        { _id: { $in: course.modules } },
        { isActive: false }
      );
      // And assessments?
      // Fetch modules first to get their IDs if we need deeper cascading,
      // but Module.updateMany handles the flag. Assessment updates would require finding assessments linked to those modules.
      // For strict correctness:
      const modules = await Module.find({ _id: { $in: course.modules } });
      const moduleIds = modules.map((m) => m._id);
      await Assessment.updateMany(
        { moduleId: { $in: moduleIds } },
        { isActive: false }
      );
    }

    res
      .status(200)
      .json({ success: true, message: "Course deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// @desc    Update status
// @route   PATCH /api/admin/courses/:courseId/status
// @access  Private/Admin
exports.updateCourseStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // draft, published, archived

    let course = await Course.findOne({
      $or: [{ _id: req.params.courseId }, { courseId: req.params.courseId }],
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    if (
      status === "published" &&
      (!course.modules || course.modules.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        error: "Cannot publish a course with no modules",
      });
    }

    course.status = status;
    await course.save();

    res.status(200).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};
