const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const Student = require("../schemas/Student");
const Otp = require("../schemas/Otp");
const Course = require("../models/Course"); // Ensure this path is correct based on file structure
const Module = require("../models/Module");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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
          Object.entries(row).map(([k, v]) => [normalizeKey(k), v])
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
          student.email
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
      { new: true, runValidators: true }
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
    await Otp.deleteMany({ admissionNo });

    const newOtp = new Otp({
      admissionNo,
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
          `<p>Your OTP for verification is: <strong>${otp}</strong></p><p>This code is valid for 10 minutes.</p>`
        );
        if (sent) {
          message = `OTP sent successfully to your registered email ending in **${student.email.slice(
            -4
          )}.`;
        } else {
          // Fallback if email fails (likely due to missing config in this env)
          console.warn(
            "Email sending failed or skipped. OTP is still generated."
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
          `Your Achariya Portal OTP is: ${otp}. Valid for 10 minutes.`
        );

        if (sent) {
          message = `OTP sent successfully to your mobile number ending in **${student.mobileNo.slice(
            -4
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

// 3. Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { admissionNo, otp } = req.body;

    if (!admissionNo || !otp) {
      return res
        .status(400)
        .json({ message: "Admission number and OTP are required" });
    }

    const otpRecord = await Otp.findOne({ admissionNo, otp });

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
      { expiresIn: "7d" }
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

    // Daily Check-in Logic
    const now = new Date();
    const lastLogin = student.lastLoginAt
      ? new Date(student.lastLoginAt)
      : null;
    let creditsAwarded = 0;

    // Simple Rolling 24h Check Strategy
    if (lastLogin) {
      const diffTime = Math.abs(now - lastLogin);
      const diffHours = diffTime / (1000 * 60 * 60);

      if (diffHours >= 24 && diffHours < 48) {
        // Streak Continue
        student.currentStreak = (student.currentStreak || 0) + 1;
        student.credits.push({
          amount: 1,
          message: "Daily Streak Bonus",
          date: now,
        });
        student.totalCredits = (student.totalCredits || 0) + 1;
        creditsAwarded = 1;
      } else if (diffHours >= 48) {
        // Streak Broken
        student.currentStreak = 1;
        student.credits.push({
          amount: 1,
          message: "Daily Login Bonus (New Streak)",
          date: now,
        });
        student.totalCredits = (student.totalCredits || 0) + 1;
        creditsAwarded = 1;
      }
      // Else < 24h, do nothing
    } else {
      // First login
      if (student.currentStreak === 0) {
        student.currentStreak = 1;
        // Note: Maybe don't award credit here if they just got 5 for onboarding?
        // Logic: If lastLogin is null, it might be right after onboarding.
        // Onboarding logic sets `lastLoginAt`? No, it sets `onboardedAt`.
        // Let's check time since `onboardedAt` if `lastLoginAt` is null.
        const onboardTime = student.onboardedAt
          ? new Date(student.onboardedAt)
          : null;
        if (onboardTime) {
          const diffOnboard = Math.abs(now - onboardTime) / (1000 * 60 * 60);
          if (diffOnboard > 24) {
            student.credits.push({
              amount: 1,
              message: "Welcome Back! First Login Bonus",
              date: now,
            });
            student.totalCredits = (student.totalCredits || 0) + 1;
          }
        }
      }
    }

    student.lastLoginAt = now;

    // Update Longest Streak
    if (student.currentStreak > (student.longestStreak || 0)) {
      student.longestStreak = student.currentStreak;
    }

    await student.save();

    // Generate Token
    const token = jwt.sign(
      { id: student._id, admissionNo: student.admissionNo, role: "Student" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      student: {
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
      (c) => c.courseId.toString() === courseId
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
        credits: student.totalCredits, // Fix: Send total credits (number) not history
        creditHistory: student.credits, // Send history separately
        currentStreak: student.currentStreak,
        longestStreak: student.longestStreak,
        badges: student.badges, // existing field
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

    // Find Module
    const module = await Module.findOne({
      _id: moduleId,
      courseId: courseId,
    });

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    res.json({
      success: true,
      data: module,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Module not found" });
    }
    console.error("Error fetching module:", error);
    res.status(500).json({ message: "Error fetching module" });
  }
};
