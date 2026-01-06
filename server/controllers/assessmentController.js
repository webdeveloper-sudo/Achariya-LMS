const Assessment = require("../models/Assessment");
const Module = require("../models/Module");
const Course = require("../models/Course");

const generateAssessmentId = async (moduleIdStr, moduleObjectId) => {
  const count = await Assessment.countDocuments({ moduleId: moduleObjectId });
  const num = (count + 1).toString().padStart(2, "0");
  // Using simple split might fail if ID format changes, but good for now per prompt
  const modIdPart = moduleIdStr.split("-")[1] || "XXX";
  return `ASS-${modIdPart}-Q${num}`;
};

exports.createAssessment = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const module = await Module.findOne({
      $or: [{ _id: moduleId }, { moduleId: moduleId }],
    });

    if (!module)
      return res
        .status(404)
        .json({ success: false, error: "Module not found" });

    // Calculate total marks
    const questions = req.body.questions || [];
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

    const assessmentId = await generateAssessmentId(
      module.moduleId,
      module._id
    );

    const assessment = await Assessment.create({
      assessmentId,
      moduleId: module._id,
      courseId: module.courseId,
      title: req.body.title,
      description: req.body.description,
      assessmentType: req.body.assessmentType,
      totalMarks,
      passingMarks: req.body.passingMarks,
      duration: req.body.duration,
      questions,
      attemptsAllowed: req.body.attemptsAllowed,
      showCorrectAnswers: req.body.showCorrectAnswers,
      randomizeQuestions: req.body.randomizeQuestions,
      postedBy: req.user.id,
    });

    // Add to module
    module.assessments.push(assessment._id);
    await module.save();

    res.status(201).json({ success: true, data: assessment });
  } catch (err) {
    next(err);
  }
};

exports.getAssessmentsByModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const module = await Module.findOne({
      $or: [{ _id: moduleId }, { moduleId: moduleId }],
    });
    if (!module)
      return res
        .status(404)
        .json({ success: false, error: "Module not found" });

    const assessments = await Assessment.find({ moduleId: module._id });
    res.status(200).json({ success: true, data: assessments });
  } catch (err) {
    next(err);
  }
};

exports.getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await Assessment.findOne({
      $or: [
        { _id: req.params.assessmentId },
        { assessmentId: req.params.assessmentId },
      ],
    })
      .populate("moduleId", "title")
      .populate("courseId", "title");

    if (!assessment)
      return res
        .status(404)
        .json({ success: false, error: "Assessment not found" });

    res.status(200).json({ success: true, data: assessment });
  } catch (err) {
    next(err);
  }
};

exports.updateAssessment = async (req, res, next) => {
  try {
    let assessment = await Assessment.findOne({
      $or: [
        { _id: req.params.assessmentId },
        { assessmentId: req.params.assessmentId },
      ],
    });

    if (!assessment)
      return res
        .status(404)
        .json({ success: false, error: "Assessment not found" });

    const fields = [
      "title",
      "description",
      "assessmentType",
      "duration",
      "questions",
      "passingMarks",
      "attemptsAllowed",
      "showCorrectAnswers",
      "randomizeQuestions",
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) assessment[f] = req.body[f];
    });

    // Recalc total marks if questions changed
    if (req.body.questions) {
      assessment.totalMarks = req.body.questions.reduce(
        (sum, q) => sum + (q.marks || 0),
        0
      );
    }

    await assessment.save();
    res.status(200).json({ success: true, data: assessment });
  } catch (err) {
    next(err);
  }
};

exports.deleteAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findOne({
      $or: [
        { _id: req.params.assessmentId },
        { assessmentId: req.params.assessmentId },
      ],
    });

    if (!assessment)
      return res
        .status(404)
        .json({ success: false, error: "Assessment not found" });

    // Remove from module
    const module = await Module.findById(assessment.moduleId);
    if (module) {
      module.assessments = module.assessments.filter(
        (a) => a.toString() !== assessment._id.toString()
      );
      await module.save();
    }

    await Assessment.deleteOne({ _id: assessment._id });
    res.status(200).json({ success: true, message: "Assessment deleted" });
  } catch (err) {
    next(err);
  }
};
