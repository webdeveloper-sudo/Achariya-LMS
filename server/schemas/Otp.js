const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    trim: true,
  },
  admissionNo: {
    type: String,
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

// Index to quickly look up OTPs by identifier
otpSchema.index({ identifier: 1 });

module.exports = mongoose.model("Otp", otpSchema);
