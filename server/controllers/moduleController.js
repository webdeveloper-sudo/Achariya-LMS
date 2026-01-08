const Module = require("../models/Module");
const Course = require("../models/Course");

// Generate ID: MOD-{courseId}-M{number}
const generateModuleId = async (courseIdStr, courseObjectId) => {
  // Get count of modules in this course to generate sequence
  const count = await Module.countDocuments({ courseId: courseObjectId });
  const num = (count + 1).toString().padStart(2, "0");
  return `MOD-${courseIdStr.split("-")[2] || "XXX"}-M${num}`;
};

exports.createModule = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    let course = await Course.findOne({
      $or: [{ _id: courseId }, { courseId: courseId }],
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    const moduleId = await generateModuleId(course.courseId, course._id);
    const currentModulesCount = await Module.countDocuments({
      courseId: course._id,
    });

    // Extract fields from body. The frontend now sends full objects/urls.
    const newModule = await Module.create({
      moduleId,
      courseId: course._id,
      title: req.body.title,
      description: req.body.description,
      sequenceOrder: currentModulesCount + 1,
      credits: req.body.credits,
      estimatedDuration: req.body.estimatedDuration,
      status: req.body.status,
      postedBy: req.user.id,

      // Complex Objects - Mapped directly from JSON payload
      videoTutorial: req.body.videoTutorial,

      // Audio: { url, title, duration, fileSize, mimeType, hasTranscript, transcriptPath }
      audioContent: req.body.audioContent,

      // Notes: { fileName, filePath, fileSize, mimeType, uploadedOn }
      moduleNotes: req.body.moduleNotes,

      // Infographics: Array of { url, title, order }
      infographics: req.body.infographics || [],

      pptEmbedUrl: req.body.pptEmbedUrl,
      prerequisites: req.body.prerequisites,
    });

    // Add to course
    course.modules.push(newModule._id);
    course.totalCredits = (course.totalCredits || 0) + (newModule.credits || 0);
    await course.save();

    res.status(201).json({ success: true, data: newModule });
  } catch (err) {
    next(err);
  }
};

exports.getModulesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findOne({
      $or: [{ _id: courseId }, { courseId: courseId }],
    });

    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    const modules = await Module.find({ courseId: course._id, isActive: true })
      .sort({ sequenceOrder: 1 })
      .populate("assessments");

    res.status(200).json({ success: true, data: modules });
  } catch (err) {
    next(err);
  }
};

exports.getModuleById = async (req, res, next) => {
  try {
    const module = await Module.findOne({
      $or: [{ _id: req.params.moduleId }, { moduleId: req.params.moduleId }],
    })
      .populate("assessments")
      .populate("courseId", "title");

    if (!module)
      return res
        .status(404)
        .json({ success: false, error: "Module not found" });

    res.status(200).json({ success: true, data: module });
  } catch (err) {
    next(err);
  }
};

exports.updateModule = async (req, res, next) => {
  try {
    let module = await Module.findOne({
      $or: [{ _id: req.params.moduleId }, { moduleId: req.params.moduleId }],
    });

    if (!module)
      return res
        .status(404)
        .json({ success: false, error: "Module not found" });

    const oldCredits = module.credits || 0;

    // Update fields - Explicit mapping ensures security and correctness
    const cleanBody = req.body;

    // Simple Fields
    if (cleanBody.title) module.title = cleanBody.title;
    if (cleanBody.description) module.description = cleanBody.description;
    if (cleanBody.credits !== undefined) module.credits = cleanBody.credits;
    if (cleanBody.estimatedDuration)
      module.estimatedDuration = cleanBody.estimatedDuration;
    if (cleanBody.status) module.status = cleanBody.status;
    if (cleanBody.isActive !== undefined) module.isActive = cleanBody.isActive;
    if (cleanBody.pptEmbedUrl !== undefined)
      module.pptEmbedUrl = cleanBody.pptEmbedUrl;

    // Complex Objects - Replace logic is acceptable as frontend sends full state
    if (cleanBody.videoTutorial) module.videoTutorial = cleanBody.videoTutorial;
    if (cleanBody.moduleNotes) module.moduleNotes = cleanBody.moduleNotes;
    if (cleanBody.audioContent) module.audioContent = cleanBody.audioContent;
    if (cleanBody.infographics) module.infographics = cleanBody.infographics;
    if (cleanBody.prerequisites) module.prerequisites = cleanBody.prerequisites;

    await module.save();

    // If credits changed, update course
    if (cleanBody.credits !== undefined && cleanBody.credits !== oldCredits) {
      const course = await Course.findById(module.courseId);
      if (course) {
        const creditDiff = cleanBody.credits - oldCredits;
        course.totalCredits += creditDiff;
        course.lastUpdatedOn = Date.now();
        await course.save();
      }
    }

    res.status(200).json({ success: true, data: module });
  } catch (err) {
    next(err);
  }
};

exports.deleteModule = async (req, res, next) => {
  try {
    const module = await Module.findOne({
      $or: [{ _id: req.params.moduleId }, { moduleId: req.params.moduleId }],
    });

    if (!module)
      return res
        .status(404)
        .json({ success: false, error: "Module not found" });

    const dependentModules = await Module.find({ prerequisites: module._id });
    if (dependentModules.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete module. It is a prerequisite for other modules.",
      });
    }

    // Remove from course
    const course = await Course.findById(module.courseId);
    if (course) {
      course.modules = course.modules.filter(
        (m) => m.toString() !== module._id.toString()
      );
      course.totalCredits -= module.credits || 0;
      await course.save();
    }

    await Module.deleteOne({ _id: module._id });

    // Note: File deletions from S3/Disk not implemented here.
    // Since we use the central Asset Upload system, files persist unless explicitly cleaned up.

    res.status(200).json({ success: true, message: "Module deleted" });
  } catch (err) {
    next(err);
  }
};

exports.reorderModules = async (req, res, next) => {
  try {
    const { moduleIds } = req.body;
    for (let i = 0; i < moduleIds.length; i++) {
      await Module.updateOne({ _id: moduleIds[i] }, { sequenceOrder: i + 1 });
    }
    res.status(200).json({ success: true, message: "Modules reordered" });
  } catch (err) {
    next(err);
  }
};
