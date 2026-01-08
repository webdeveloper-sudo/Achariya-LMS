const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      unique: true,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    sequenceOrder: {
      type: Number,
      required: true,
    },
    moduleNotes: {
      fileName: String,
      filePath: String,
      fileSize: Number,
      mimeType: String,
      uploadedOn: Date,
    },
    videoTutorial: {
      url: String,
      title: String,
      duration: String,
      thumbnail: String,
      platform: String,
    },
    audioContent: {
      url: String,
      title: String,
      duration: String,
      fileSize: Number,
      mimeType: String,
      hasTranscript: Boolean,
      transcriptPath: String,
    },
    // Replaced pptSlides array with simple Embed URL
    pptEmbedUrl: {
      type: String,
      trim: true,
    },
    infographics: [
      {
        url: { type: String },
        title: { type: String },
        order: { type: Number },
      },
    ],
    credits: {
      type: Number,
      required: true,
      default: 0,
    },
    estimatedDuration: {
      type: String,
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module",
      },
    ],
    assessments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assessment",
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
    },
    postedOn: {
      type: Date,
      default: Date.now,
    },
    lastUpdatedOn: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Module", moduleSchema);
