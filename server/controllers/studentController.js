const XLSX = require("xlsx");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Student = require("../schemas/Student");
const Otp = require("../schemas/Otp");
const Course = require("../models/Course"); // Ensure this path is correct based on file structure
const Module = require("../models/Module");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// LAZY LOAD: Don't require gamificationController at top level to avoid circular dependency
// const GamificationController = require("./gamificationController");
// const BadgeService = require("../services/BadgeService");
const ActivityLog = require("../models/ActivityLog");

const JWT_SECRET = process.env.JWT_SECRET || "dev_super_secret_change_me";

// Upload and parse Excel file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const school = req.body.school;
    if (!school) {
      return res.status(400).json({
        message: "School is required. Please select a school before uploading.",
      });
    }

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

    const toSafeString = (value) =>
      value === undefined || value === null ? "" : String(value).trim();

    const normalizeKey = (key) =>
      key
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[\s._-]+/g, "");

    // Map Excel data to student format with flexible headers
    const mappedData = jsonData
      .map((row) => {
        // Normalize all keys once
        const normalizedRow = Object.fromEntries(
          Object.entries(row).map(([k, v]) => [normalizeKey(k), v]),
        );

        const getSerialNo = () => {
          return (
            normalizedRow["sno"] ||
            normalizedRow["sno."] ||
            normalizedRow["S. NO."] ||
            normalizedRow["s.no"] ||
            normalizedRow["snumber"] ||
            normalizedRow["serial"] ||
            normalizedRow["serialno"] ||
            normalizedRow["serialnumber"] ||
            normalizedRow["s"]
          );
        };

        const getAdmissionNo = () => {
          return (
            normalizedRow["admno"] ||
            normalizedRow["ADM NO"] ||
            normalizedRow["admissionno"] ||
            normalizedRow["admissionnumber"] ||
            normalizedRow["admission"] ||
            normalizedRow["admissionno"] ||
            normalizedRow["admission_no"] ||
            normalizedRow["admissionnumber"] ||
            normalizedRow["admissionnumber"]
          );
        };

        const getStudentName = () => {
          return (
            normalizedRow["studentname"] ||
            normalizedRow["STUDENT NAME"] ||
            normalizedRow["name"] ||
            normalizedRow["student"] ||
            normalizedRow["student_name"]
          );
        };

        const getClass = () => {
          return (
            normalizedRow["class"] ||
            normalizedRow["CLASS"] ||
            normalizedRow["grade"] ||
            normalizedRow["std"] ||
            normalizedRow["standard"]
          );
        };

        const getSection = () => {
          return (
            normalizedRow["section"] ||
            normalizedRow["SECTION"] ||
            normalizedRow["sec"]
          );
        };

        const getEmail = () => {
          return (
            normalizedRow["email"] ||
            normalizedRow["EMAIL"] ||
            normalizedRow["emailid"] ||
            normalizedRow["mail"]
          );
        };

        const getMobileNo = () => {
          return (
            normalizedRow["mobileno"] ||
            normalizedRow["MOBILE NO"] ||
            normalizedRow["mobile"] ||
            normalizedRow["mobile_no"] ||
            normalizedRow["mobilenumber"] ||
            normalizedRow["phone"] ||
            normalizedRow["phoneno"] ||
            normalizedRow["phone_no"] ||
            normalizedRow["contact"] ||
            normalizedRow["contactno"]
          );
        };

        return {
          admissionNo: toSafeString(getAdmissionNo()),
          studentName: toSafeString(getStudentName()),
          class: toSafeString(getClass()),
          section: toSafeString(getSection()),
          mobileNo: toSafeString(getMobileNo()),
          email: toSafeString(getEmail()),
          serialNo: toSafeString(getSerialNo()),
          school,
        };
      })
      .filter(
        (student) =>
          student.serialNo &&
          student.admissionNo &&
          student.studentName &&
          student.class &&
          student.section &&
          student.mobileNo &&
          student.school && // email can be optional for legacy rows but ideally required now? prompt says "REVIEW EXCELL SHEET WITH EMAIL FIELD" implying mandatory.
          // Let's strictly require email if 'email' logic returns something, or filter if empty?
          // If we make it mandatory in schema, we must filter here?
          // Let's filter here to be safe.
          student.email,
      );

    if (mappedData.length === 0) {
      const detectedHeaders = jsonData[0] ? Object.keys(jsonData[0]) : [];
      return res.status(400).json({
        message:
          "No valid student data found. Required columns: S. NO., ADM NO, STUDENT NAME, CLASS, SECTION, MOBILE NO, EMAIL.",
        detectedHeaders,
      });
    }
    let saved = 0;
    let skipped = 0;
    const errors = [];

    for (const studentData of mappedData) {
      if (
        !studentData.serialNo ||
        !studentData.admissionNo ||
        !studentData.studentName ||
        !studentData.class ||
        !studentData.section ||
        !studentData.mobileNo ||
        !studentData.email
      ) {
        skipped++;
        errors.push({
          admissionNo: studentData.admissionNo,
          error: "Missing mandatory fields (including email)",
        });
        continue;
      }

      // Check if student already exists by admission number
      const existingStudent = await Student.findOne({
        admissionNo: studentData.admissionNo,
      });

      if (existingStudent) {
        // Update existing student
        Object.assign(existingStudent, {
          studentName: studentData.studentName,
          name: studentData.studentName,
          class: studentData.class,
          section: studentData.section,
          mobileNo: studentData.mobileNo,
          email: studentData.email, // Update email
          school,
          serialNo: studentData.serialNo || existingStudent.serialNo,
          status: studentData.status || existingStudent.status,
          school_id: studentData.school_id || existingStudent.school_id,
        });
        await existingStudent.save();
        saved++;
      } else {
        // Create new student
        const newStudent = new Student({
          admissionNo: studentData.admissionNo,
          studentName: studentData.studentName,
          name: studentData.studentName,
          class: studentData.class,
          section: studentData.section,
          mobileNo: studentData.mobileNo,
          email: studentData.email,
          school,
          serialNo: studentData.serialNo,
          status: studentData.status || "Active",
          totalCredits: studentData.credits || 0, // Map flat credit to totalCredits
          credits: [], // Initialize empty array? Or no credits yet.
          school_id: studentData.school_id || 1,
        });
        await newStudent.save();
        saved++;
      }
    }

    res.status(200).json({
      message: "File processing completed",
      saved,
      skipped,
      errors,
      total: mappedData.length,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res
      .status(500)
      .json({ message: "Error processing file: " + error.message });
  }
};
// Create Student
exports.createStudent = async (req, res) => {
  try {
    const studentData = req.body;

    // Validation
    const requiredFields = [
      "admissionNo",
      "name",
      "class",
      "section",
      "mobileNo",
      "email", // Added email
      "school",
    ];
    const missingFields = requiredFields.filter((field) => !studentData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check for existing student
    const existingStudent = await Student.findOne({
      admissionNo: studentData.admissionNo,
    });
    if (existingStudent) {
      return res
        .status(409)
        .json({ message: "Student with this Admission No already exists" });
    }

    // Check for duplicate email
    const existingByEmail = await Student.findOne({ email: studentData.email });
    if (existingByEmail) {
      return res
        .status(409)
        .json({ message: "Student with this Email already exists" });
    }

    const newStudent = new Student({
      ...studentData,
      studentName: studentData.name, // Ensure consistency
      status: studentData.status || "Active",
      serialNo: studentData.serialNo || Date.now().toString(), // Fallback for serialNo
    }); // Schema defaults handle credits/badges

    await newStudent.save();

    res.status(201).json({
      message: "Student created successfully",
      student: newStudent,
    });
  } catch (error) {
    console.error("Error creating student:", error);
    res
      .status(500)
      .json({ message: "Error creating student: " + error.message });
  }
};

// Update a student
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating _id
    delete updateData._id;

    // Handle password update if provided (Admin Reset)
    if (updateData.password && updateData.password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
      // If admin resets password, should we mark as onboarded?
      // User said: "IF THE STUDENT NOT ONBOARDED HIDE THE STUDENT PASSWORD FIELDS...".
      // "UPDATE THE ADMINSTUDENTEDITFORM COMPONENT WITH HIS ORIGINAL FIELD PASSOWRDS THAT ADMIN CAN EASILY UPDATE HIS PASSWORD FOR ANY OF THE STUDENT"
      // If admin sets password technically they are 'onboarded' credentials-wise, but maybe not process-wise.
      // Let's assume this just updates the credential.
    } else {
      delete updateData.password; // Don't accidentally overwrite with empty string
    }

    // Check for duplicate admissionNo/email if changed
    if (updateData.admissionNo) {
      const existing = await Student.findOne({
        admissionNo: updateData.admissionNo,
        _id: { $ne: id },
      });
      if (existing)
        return res.status(409).json({ message: "Admission No already in use" });
    }
    if (updateData.email) {
      const existingEmail = await Student.findOne({
        email: updateData.email,
        _id: { $ne: id },
      });
      if (existingEmail)
        return res.status(409).json({ message: "Email already in use" });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res
      .status(500)
      .json({ message: "Error updating student: " + error.message });
  }
};

// Get all students
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.json({
      students,
      count: students.length,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res
      .status(500)
      .json({ message: "Error fetching students: " + error.message });
  }
};

// Delete all students
exports.deleteAllStudents = async (req, res) => {
  try {
    const result = await Student.deleteMany({});
    await Otp.deleteMany({}); // Also clear OTPs

    res.status(200).json({
      message: `Successfully deleted all students and OTPs.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting all students:", error);
    res
      .status(500)
      .json({ message: "Error deleting students: " + error.message });
  }
};

// --- Student Authentication & Dashboard Endpoints ---

// 1. Verify Admission
exports.verifyAdmission = async (req, res) => {
  try {
    const { admissionNo } = req.body;

    if (!admissionNo) {
      return res.status(400).json({ message: "Admission number is required" });
    }

    const student = await Student.findOne({ admissionNo });

    if (!student) {
      // In a real app, you might be vague, but requirement says "direct to admin cell" if not found
      return res.status(404).json({
        message:
          "Admission number not found. Please contact the Admin Cell for assistance.",
      });
    }

    // Return masked contact info
    const maskEmail = (email) => {
      if (!email) return null;
      const [local, domain] = email.split("@");
      if (!local || !domain) return email;
      const start = local.substring(0, 2);
      const end = local.substring(local.length - 1);
      return `${start}***${end}@${domain}`;
    };

    const maskMobile = (mobile) => {
      if (!mobile) return null;
      return (
        mobile.substring(0, 2) + "******" + mobile.substring(mobile.length - 2)
      );
    };

    res.json({
      message: "Student found",
      student: {
        admissionNo: student.admissionNo,
        studentName: student.studentName,
        maskedEmail: maskEmail(student.email),
        maskedMobile: maskMobile(student.mobileNo),
        hasEmail: !!student.email,
        hasMobile: !!student.mobileNo,
        isRegistered: student.onboarded, // Check if already onboarded flag is set
        onboarded: student.onboarded, // Direct access
      },
    });
  } catch (error) {
    console.error("Error verifying admission:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};

// Configure Twilio for SMS
const twilio = require("twilio");
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Function to send SMS
const sendSms = async (to, body) => {
  try {
    if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
      console.warn("⚠️ Twilio credentials missing. SMS not sent.");
      return false;
    }

    // Ensure number has country code, default to +91 if missing (assuming India based on context)
    let formattedTo = to.trim();
    if (!formattedTo.startsWith("+")) {
      formattedTo = "+91" + formattedTo;
    }

    const message = await twilioClient.messages.create({
      body: body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedTo,
    });

    console.log("SMS sent: %s", message.sid);
    return true;
  } catch (error) {
    console.error("Error sending SMS:", error);
    return false;
  }
};

// Configure Nodemailer
const nodemailer = require("nodemailer");

// Function to send email
const sendEmail = async (to, subject, html) => {
  try {
    // Check if SMTP credentials exist
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      console.warn("⚠️ SMTP credentials missing. Email not sent.");
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from:
        process.env.SMTP_FROM || '"Achariya Portal" <no-reply@achariya.org>',
      to,
      subject,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

// 2. Send OTP
exports.sendOtp = async (req, res) => {
  try {
    const { admissionNo, contactType } = req.body; // contactType: 'mobile' or 'email'

    if (!admissionNo || !contactType) {
      return res
        .status(400)
        .json({ message: "Admission number and contact type are required" });
    }

    const student = await Student.findOne({ admissionNo });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store OTP
    await Otp.deleteMany({ identifier: admissionNo });

    const newOtp = new Otp({
      identifier: admissionNo,
      admissionNo: admissionNo,
      otp,
      contactType,
    });
    await newOtp.save();

    let message = `OTP generated.`;

    if (contactType === "email") {
      if (student.email) {
        const sent = await sendEmail(
          student.email,
          "Your Achariya Portal OTP",
          `<p>Your OTP for verification is: <strong>${otp}</strong></p><p>This code is valid for 10 minutes.</p>`,
        );
        if (sent) {
          message = `OTP sent successfully to your registered email ending in **${student.email.slice(
            -4,
          )}.`;
        } else {
          // Fallback if email fails (likely due to missing config in this env)
          console.warn(
            "Email sending failed or skipped. OTP is still generated.",
          );
          message = "Failed to send email. Check server logs.";
        }
      } else {
        return res
          .status(400)
          .json({ message: "No email address found for this student." });
      }
    } else if (contactType === "mobile") {
      if (student.mobileNo) {
        const sent = await sendSms(
          student.mobileNo,
          `Your Achariya Portal OTP is: ${otp}. Valid for 10 minutes.`,
        );

        if (sent) {
          message = `OTP sent successfully to your mobile number ending in **${student.mobileNo.slice(
            -4,
          )}.`;
        } else {
          // Fallback for demo/dev if no Twilio (keep user moving)
          // console.warn("Twilio failed/missing. OTP generated internally.");
          // message = "SMS service unavailable. Please check server logs.";

          // CRITICAL: If SMS fails in production, user sees error.
          // But since user "PREFERS TOO MUCH", I will assume they might config it.
          // If not, I return the message indicating failure but do NOT show OTP (secure).
          message = "Failed to send SMS. Please contact admin or try Email.";
        }
      } else {
        return res
          .status(400)
          .json({ message: "No mobile number found for this student." });
      }
    }

    res.json({
      message: message,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

// --- PUBLIC PROFILE ENDPOINT ---
exports.getPublicProfile = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Find student but exclude sensitive fields
    const student = await Student.findById(studentId)
      .select(
        "studentName class section avatar gamification enrolledCourses badges totalCredits currentStreak longestStreak",
      )
      .lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get recent activity for this student
    const recentActivity = await ActivityLog.find({
      actorId: studentId,
      visibility: "PUBLIC",
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    // Map to simple response
    const profileResponse = {
      profile: {
        id: student._id,
        name: student.studentName,
        class: student.class,
        section: student.section,
        avatar: student.avatar,
        credits: student.totalCredits || 0,
        streak: student.currentStreak || 0,
        badges: student.gamification?.badges || [],
        enrolledCount: student.enrolledCourses?.length || 0,
        rank: student.gamification?.rank || "Novice",
      },
      activity: recentActivity,
      isOwner: req.user.id === studentId,
    };

    // Requirement: Show powerups ONLY to owner
    if (req.user.id === studentId) {
      // Find powerup definitions to get icons/names if needed,
      // but student.gamification.ownedPowerUps already has cached name or we can link.
      // Let's populate details manually or just send the array if it's sufficient.
      profileResponse.profile.powerUps =
        student.gamification?.ownedPowerUps || [];
    }

    res.json(profileResponse);
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ message: "Error fetching student profile" });
  }
};

// 3. Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { admissionNo, otp } = req.body;

    if (!admissionNo || !otp) {
      return res
        .status(400)
        .json({ message: "Admission number and OTP are required" });
    }

    const otpRecord = await Otp.findOne({ identifier: admissionNo, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP valid
    // Delete OTP record after successful use
    await Otp.deleteOne({ _id: otpRecord._id });

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// 4. Complete Onboarding (Set Password)
exports.completeOnboarding = async (req, res) => {
  try {
    const { admissionNo, password } = req.body;

    if (!admissionNo || !password) {
      return res
        .status(400)
        .json({ message: "Admission number and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const student = await Student.findOne({ admissionNo });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update student
    student.password = hashedPassword;
    student.status = "Active";
    student.onboardedAt = new Date();
    student.onboarded = true;

    // Assign random avatar if none exists
    if (!student.avatar) {
      const avatarIndex = Math.floor(Math.random() * 10) + 1;
      student.avatar = `/uploads/avatars/avatar_${avatarIndex}.png`;
    }

    // Initialize/Reset credits for onboarding
    student.credits = [
      {
        amount: 5,
        message: "Successfully onboarded to the Achariya LMS",
        date: new Date(),
      },
    ];
    student.totalCredits = 5;

    // Initialize Badges
    student.badges = ["Rookie"];

    student.currentStreak = 1;

    await student.save();

    // Generate Token
    const token = jwt.sign(
      { id: student._id, admissionNo: student.admissionNo, role: "Student" },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Onboarding complete! Welcome aboard.",
      token,
      student: {
        admissionNo: student.admissionNo,
        name: student.studentName,
        credits: student.totalCredits,
        status: student.status,
        onboarded: true,
      },
      redirect: "/student/dashboard", // Explicitly tell frontend where to go
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    res.status(500).json({ message: "Error completing onboarding" });
  }
};

// 5. Login
exports.login = async (req, res) => {
  try {
    const { admissionNo, password } = req.body;

    if (!admissionNo || !password) {
      return res
        .status(400)
        .json({ message: "Admission number and password are required" });
    }

    // Find student and select password
    const student = await Student.findOne({ admissionNo }).select("+password");
    if (!student) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if onboarded
    if (!student.onboarded && !student.password) {
      // If never onboarded (no password set), they shouldn't use login endpoint usually.
      // But if they have a password manually set by admin but not "onboarded" flag?
      // Let's rely on the flag as requested.
      return res.status(403).json({
        message: "Account not activated. Please complete onboarding.",
        details: "NOT_ONBOARDED",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // --- NEW GAMIFICATION LOGIC ---
    // Lazy load to avoid circular dependency
    const gamificationController = require("./gamificationController");
    const BadgeService = require("../services/BadgeService");

    const now = new Date();
    const lastActivity = student.gamification.lastActivityDate
      ? new Date(student.gamification.lastActivityDate)
      : null;

    let streakCount = student.gamification.currentStreak || 0;

    if (lastActivity) {
      // Check difference in days (reset at midnight)
      const lastDate = new Date(lastActivity);
      lastDate.setHours(0, 0, 0, 0);
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(today - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive Day
        streakCount++;
        // Award Streak Bonus
        const bonus = streakCount >= 7 ? 10 : 5; // Higher bonus for week+
        await gamificationController.awardCredits(
          student._id,
          bonus,
          `Daily Streak Bonus (Day ${streakCount})`,
          "DAILY_STREAK",
        );
      } else if (diffDays > 1) {
        // Broken Streak
        streakCount = 1;
        await gamificationController.awardCredits(
          student._id,
          5,
          "Daily Login Bonus",
          "DAILY_STREAK",
        );
      }
      // If diffDays === 0, same day, no bonus
    } else {
      // First ever login equivalent
      streakCount = 1;
      await gamificationController.awardCredits(
        student._id,
        10,
        "Welcome Bonus! First Activity.",
        "DAILY_STREAK",
      );
    }

    // Log check-in for analytics heatmap
    const lastDateStr = lastActivity
      ? lastActivity.toISOString().split("T")[0]
      : null;
    const todayStr = now.toISOString().split("T")[0];

    if (lastDateStr !== todayStr) {
      student.progressLog.push({
        action: "daily_checkin",
        completedAt: now,
        refTitle: "Daily Attendance",
      });
    }

    student.gamification.lastActivityDate = now;

    // Check Badge Triggers
    await BadgeService.checkStreakBadges(student._id, streakCount);

    await student.save();

    // --- END GAMIFICATION LOGIC ---

    // Generate Token
    const token = jwt.sign(
      { id: student._id, admissionNo: student.admissionNo, role: "Student" },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      token,
      student: {
        id: student._id,
        admissionNo: student.admissionNo,
        name: student.studentName,
        email: student.email,
        credits: student.totalCredits,
        creditHistory: student.credits,
        badges: student.badges,
        currentStreak: student.currentStreak,
        lastLoginAt: student.lastLoginAt,
        role: "Student",
        enrolledCourses: student.enrolledCourses || [],
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

// 6. Enroll in Course
exports.enrollCourse = async (req, res) => {
  try {
    const { admissionNo, courseId } = req.body;

    if (!admissionNo || !courseId) {
      return res
        .status(400)
        .json({ message: "Admission No and Course ID required" });
    }

    const student = await Student.findOne({ admissionNo });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Check if already enrolled
    // enrolledCourses is a Mongoose DocumentArray, we can use .some() or .id() if we had ids, but here courseId is ref
    const isEnrolled = student.enrolledCourses.some(
      (c) => c.courseId.toString() === courseId,
    );

    if (isEnrolled) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    // Fetch Course Title (Optional but good for quick display without population)
    const Course = require("../models/Course"); // Ensure loaded
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    student.enrolledCourses.push({
      courseId: courseId,
      title: course.title,
      enrolledAt: new Date(),
      completedModules: [],
      progress: 0,
    });

    await student.save();

    res.json({
      message: "Enrollment successful",
      enrolledCourse:
        student.enrolledCourses[student.enrolledCourses.length - 1],
    });
  } catch (error) {
    console.error("Error enrolling course:", error);
    res.status(500).json({ message: "Error enrolling course" });
  }
};

// 6. Get Dashboard Data
exports.getDashboard = async (req, res) => {
  try {
    // req.user is set by authenticate middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      profile: {
        name: student.studentName,
        admissionNo: student.admissionNo,

        // Gamification Mappings (Backward Compatibility + New Data)
        credits: student.gamification.totalCredits || 0,
        creditHistory: student.credits, // Legacy history
        currentStreak: student.gamification.currentStreak || 0,
        longestStreak: student.gamification.longestStreak || 0,
        badges: student.gamification.badges.length || 0, // Send count for dashboard summary

        // Full Object
        gamification: student.gamification,

        quiz_avg: student.quiz_avg,
        completion: student.completion,
        enrolledCourses: student.enrolledCourses || [],
      },
      // We could fetch courses here or separate endpoint.
      // Prompt says "GET /api/courses" is separate.
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
};

// 7. Get All Courses (for dashboard)
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).sort({ createdAt: -1 }); // Adjust sort as needed
    res.json({
      courses,
      count: courses.length,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Error fetching courses" });
  }
};

// 8. Get Single Course (Public/Student)
exports.getCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Check if valid ObjectId or custom string
    let course = await Course.findOne({
      $or: [{ _id: courseId }, { courseId: courseId }],
    }).populate({
      path: "modules",
      options: { sort: { sequenceOrder: 1 } }, // Ensure modules are sorted
    });

    if (!course) {
      // Try simple findById if just created and not indexed by custom ID yet?
      // Or if the $or fails for non-ObjectId strings in _id field (CastError usually separate)
      // If courseId is valid ObjectId string, findById works.
      // Let's rely on the query above.
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    // Handle CastError for ObjectId
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Course not found" });
    }
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Error fetching course" });
  }
};

// 9. Get Single Module (Public/Student)
exports.getModule = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    // Validate IDs
    if (
      !moduleId ||
      moduleId === "null" ||
      moduleId === "undefined" ||
      !mongoose.Types.ObjectId.isValid(moduleId)
    ) {
      return res.status(404).json({ message: "Invalid Module ID" });
    }

    // Find Module
    const module = await Module.findOne({
      _id: moduleId,
      courseId: courseId,
    }).populate("assessments");

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    res.json({
      success: true,
      data: module,
    });
  } catch (error) {
    // Handle CastError explicitly
    if (error.name === "CastError" || error.kind === "ObjectId") {
      return res.status(404).json({ message: "Module not found" });
    }
    console.error("Error fetching module:", error);
    res.status(500).json({ message: "Error fetching module" });
  }
};

// 10. Get Student Progress
exports.getStudentProgress = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const studentId = req.user.id;
    const student = await Student.findById(studentId)
      .populate("enrolledCourses.courseId", "title thumbnail")
      .lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const now = new Date();

    // --- 1. Weekly Activity & Heatmap Data ---
    const activityMap = {}; // date_str -> { count: 0, time: 0, quizzes: 0 }

    // Initialize last 7 days in map for graph
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      last7Days.push({ date: dateStr, day: dayName });
      // Pre-fill map for these days so we have 0s
      if (!activityMap[dateStr]) {
        activityMap[dateStr] = {
          count: 0,
          time: 0,
          quizzes: 0,
          completion: 0,
        };
      }
    }

    // Process logs
    (student.progressLog || []).forEach((log) => {
      if (!log.completedAt) return;
      const dateStr = new Date(log.completedAt).toISOString().split("T")[0];

      if (!activityMap[dateStr]) {
        activityMap[dateStr] = {
          count: 0,
          time: 0,
          quizzes: 0,
          completion: 0,
        };
      }

      activityMap[dateStr].count += 1;
      activityMap[dateStr].time += log.durationMinutes || 0;

      if (log.action === "complete_assessment") {
        activityMap[dateStr].quizzes += 1;
      }
    });

    // Format for Weekly Graph (Last 7 days reverse chronological -> chronological)
    const weeklyActivity = last7Days.reverse().map((d) => {
      const data = activityMap[d.date];
      const completion = Math.min(100, (data.count / 5) * 100);
      return {
        day: d.day,
        completion: Math.round(completion),
        quizzes: data.quizzes,
        timeSpent: data.time,
      };
    });

    // --- 2. Timeline (Recent Activity) ---
    // Take last 10 activities from progressLog
    const timeline = (student.progressLog || [])
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 10)
      .map((log) => ({
        id: log._id,
        action: log.action,
        refTitle: log.refTitle,
        score: log.score,
        date: log.completedAt,
      }));

    // Format for Heatmap (Ensure we send data for the whole year)
    const heatmapData = Object.keys(activityMap).map((date) => ({
      date: date,
      count: activityMap[date].count,
    }));

    // --- 3. Course Progress ---
    const courseProgress = (student.enrolledCourses || []).map((c) => ({
      id: c.courseId ? c.courseId._id : c._id,
      title: c.title || (c.courseId ? c.courseId.title : "Unknown Course"),
      progress: c.progress || 0,
      lastAccessed: c.lastAccessed || c.enrolledAt,
    }));

    // --- 4. Quiz Performance ---
    let totalQuizzes = 0;
    let totalScoreVal = 0;
    let perfectScores = 0;

    (student.enrolledCourses || []).forEach((course) => {
      if (course.assessmentProgress) {
        course.assessmentProgress.forEach((assess) => {
          const bestScore = assess.highestScore || 0;
          if (assess.attempts > 0) {
            totalQuizzes++;
            totalScoreVal += bestScore;
            if (bestScore === 100) perfectScores++;
          }
        });
      }
    });

    const avgScore =
      totalQuizzes > 0 ? Math.round(totalScoreVal / totalQuizzes) : 0;

    res.json({
      weeklyActivity,
      timeline, // New field
      heatmapData,
      courseProgress,
      quizStats: {
        averageScore: avgScore,
        completedQuizzes: totalQuizzes,
        perfectScores: perfectScores,
      },
      signupDate: student.createdAt,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ message: "Error fetching progress" });
  }
};

// 6. Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { admissionNo, otp, password } = req.body;

    if (!admissionNo || !otp || !password) {
      return res
        .status(400)
        .json({ message: "Admission number, OTP and password are required" });
    }

    const otpRecord = await Otp.findOne({ identifier: admissionNo, otp }); // Notice I changed it to identifier in Otp schema earlier
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const student = await Student.findOne({ admissionNo });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(password, salt);
    await student.save();

    await Otp.deleteMany({ identifier: admissionNo });

    res.json({ message: "Password reset successfully! You can now log in." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};
