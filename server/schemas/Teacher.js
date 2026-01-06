const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      // Mandatory from Excel
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userName: {
      // Mandatory from Excel
      type: String,
      required: true,
      trim: true,
    },
    joiningDate: {
      // Mandatory from Excel
      type: Date,
      required: true,
    },
    branch: {
      // Mandatory from Excel
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      // Mandatory from Excel
      type: String,
      required: true,
      trim: true,
    },

    // Additional Mandatory Fields
    subjects: {
      type: [String],
      default: [],
    },
    qualifications: {
      type: String,
      default: "",
    },
    gradesInCharge: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      default: "",
    },

    // Optional fields
    mobileNo: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    coursesAssigned: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive", "On Leave"],
    },
  },
  {
    timestamps: true,
  }
);

const Teacher = mongoose.model("Teacher", teacherSchema);

module.exports = Teacher;
