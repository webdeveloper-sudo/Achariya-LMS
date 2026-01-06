const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  admissionNo: {
    type: String,
    required: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  contactType: {
    type: String,
    enum: ["mobile", "email"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // 10 minutes in seconds. MongoDB will automatically delete documents after this time.
  },
});

// Index to quickly look up OTPs by admission number
otpSchema.index({ admissionNo: 1 });

module.exports = mongoose.model("Otp", otpSchema);
