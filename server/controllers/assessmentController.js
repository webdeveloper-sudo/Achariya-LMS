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

    // 1. Map Questions
    const rawQuestions = req.body.questions || [];
    const questions = rawQuestions.map((q, idx) => ({
      questionNo: q.questionNumber || idx + 1,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options || [],
      answer: q.correctAnswer, // Frontend sends correctAnswer
      mark: Number(q.marks) || 1, // Frontend sends marks
      explanation: q.explanation,
    }));

    // 2. Calculate Total Marks
    const totalMarks = questions.reduce((sum, q) => sum + (q.mark || 0), 0);

    // 3. Convert Duration (Frontend sends minutes, Backend stores seconds)
    // If frontend sends conversion logic, it might come as seconds, but usually we standardize here.
    // My frontend code sends 'duration' as a Number (minutes).
    const durationInSeconds = (Number(req.body.duration) || 0) * 60;

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
      totalMarks,
      duration: durationInSeconds,
      attempts: Number(req.body.attemptsAllowed) || 3, // Frontend sends attemptsAllowed
      totalCredits: Number(req.body.credits) || 0, // Frontend sends credits
      questions,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
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

    // Optional: Transform back to frontend format if needed?
    // Frontend `loadAssessment` expects:
    // duration (mins), attempts (attemptsAllowed), credits, questions(correctAnswer, marks)
    // I should arguably transform it here on READ to avoid breaking frontend logic,
    // OR create a transformer helper.
    // Let's do a simple transformation on the fly to match frontend expectations.

    const transformed = assessment.toObject();
    transformed.duration = Math.floor(transformed.duration / 60); // Seconds -> Mins
    transformed.attemptsAllowed = transformed.attempts; // Map back
    transformed.credits = transformed.totalCredits; // Map back
    transformed.questions = transformed.questions.map((q) => ({
      ...q,
      questionNumber: q.questionNo,
      marks: q.mark,
      correctAnswer: q.answer,
    }));
    // Note: passingMarks, assessmentType might be missing. Frontend handles defaults.

    res.status(200).json({ success: true, data: transformed });
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

    // Update fields
    if (req.body.title) assessment.title = req.body.title;
    if (req.body.description !== undefined)
      assessment.description = req.body.description;

    if (req.body.duration) {
      assessment.duration = Number(req.body.duration) * 60; // Mins -> Seconds
    }

    if (req.body.attemptsAllowed !== undefined) {
      assessment.attempts = Number(req.body.attemptsAllowed);
    }

    if (req.body.credits !== undefined) {
      assessment.totalCredits = Number(req.body.credits);
    }

    if (req.body.isActive !== undefined)
      assessment.isActive = req.body.isActive;

    // Process Questions
    if (req.body.questions) {
      const rawQuestions = req.body.questions;
      assessment.questions = rawQuestions.map((q, idx) => ({
        questionNo: q.questionNumber || idx + 1,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options || [],
        answer: q.correctAnswer,
        mark: Number(q.marks) || 1,
        explanation: q.explanation,
      }));

      // Recalc Total Marks
      assessment.totalMarks = assessment.questions.reduce(
        (sum, q) => sum + (q.mark || 0),
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
