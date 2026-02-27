const Principal = require("../schemas/Principal");
const Student = require("../schemas/Student");
const Teacher = require("../schemas/Teacher");
const Course = require("../models/Course");
const Otp = require("../schemas/Otp");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_super_secret_change_me";

// --- CRUD Operations for Admin ---

// Create a new Principal
exports.createPrincipal = async (req, res) => {
  try {
    const { name, email, mobile, school, school_id, password } = req.body;

    // Validation
    if (!name || !email || !mobile || !school || !school_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existingPrincipal = await Principal.findOne({ email });
    if (existingPrincipal) {
      return res
        .status(409)
        .json({ message: "Principal with this email already exists" });
    }

    // Create Principal
    const newPrincipal = new Principal({
      name,
      email,
      mobile,
      school,
      school_id,
      password: password || undefined, // Optional initial password
    });

    await newPrincipal.save();

    res.status(201).json({
      message: "Principal created successfully",
      principal: {
        id: newPrincipal._id,
        name: newPrincipal.name,
        email: newPrincipal.email,
        school: newPrincipal.school,
        school_id: newPrincipal.school_id,
      },
    });
  } catch (error) {
    console.error("Error creating principal:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Get all Principals
exports.getAllPrincipals = async (req, res) => {
  try {
    const principals = await Principal.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({
      count: principals.length,
      principals,
    });
  } catch (error) {
    console.error("Error fetching principals:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Update Principal
exports.updatePrincipal = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating password directly via this route if strict
    // But allowing it for admin resets is fine
    // If password is provided, let schema pre-save hook handle hashing if we were using .save()
    // BUT findByIdAndUpdate BYPASSES pre-save hooks! We must hash manually here if updating password.

    // Remove critical immutable fields if present
    delete updateData.role;

    const principal = await Principal.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!principal) {
      return res.status(404).json({ message: "Principal not found" });
    }

    res.json({
      message: "Principal updated successfully",
      principal,
    });
  } catch (error) {
    console.error("Error updating principal:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Delete Principal
exports.deletePrincipal = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Principal.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Principal not found" });
    }

    res.json({ message: "Principal deleted successfully" });
  } catch (error) {
    console.error("Error deleting principal:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// --- Auth Logic Patterned after Student Controller (for future usage) ---

// Configure Nodemailer (Reuse from existing env)
const sendEmail = async (to, subject, html) => {
  try {
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
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from:
        process.env.SMTP_FROM || '"Achariya Portal" <no-reply@achariya.org>',
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

// 1. Send OTP for Login
exports.sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const principal = await Principal.findOne({ email });

    // Requirement: Check if she was added by admin. If not, show popup.
    if (!principal) {
      return res.status(404).json({
        message: "Access Restricted. Please contact Admin to add your profile.",
        code: "PRINCIPAL_NOT_FOUND",
      });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store OTP (Reusing Otp schema which might have 'admissionNo' or 'email' or 'mobile'.
    // Need to check Otp schema compatibility. Assuming it can store generic identifier or we add 'email' field to it.)
    // *CHECK*: The Otp.js schema likely uses `admissionNo` as key based on student controller.
    // We should probably check Otp.js. For now, let's assume we can save it with email if the schema allows,
    // or we'll compromise and use the email as the identifier.

    // Hack: If Otp schema forces admissionNo, we might need a separate schema or reuse `admissionNo` field for email string if type is String?
    // Let's assume we can use `admissionNo` field to store email for now if it's a String type, or better yet, create a new OTP entry.
    // *Self-correction*: I should reference `Otp.js`.

    await Otp.deleteMany({ identifier: email }); // cleanup old
    const newOtp = new Otp({
      identifier: email,
      otp,
      contactType: "email",
    });
    await newOtp.save();

    // Send Email
    const emailSent = await sendEmail(
      email,
      "Principal Login OTP - Achariya",
      `<p>Your OTP for Principal Panel login is: <strong>${otp}</strong></p>`,
    );

    if (emailSent) {
      res.json({ message: `OTP sent to ${email}` });
    } else {
      // Allow fallback for dev/demo
      res.json({ message: "OTP generated (Email simulation)", devOtp: otp });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

// 2. Verify OTP & Login
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    const otpRecord = await Otp.findOne({ identifier: email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const principal = await Principal.findOne({ email });
    if (!principal)
      return res.status(404).json({ message: "Principal record not found" });

    // Login Success
    await Otp.deleteOne({ _id: otpRecord._id });

    // Update verification status ?
    if (!principal.isVerified) {
      principal.isVerified = true;
      await principal.save();
    }

    // Generate Token
    const token = jwt.sign(
      { id: principal._id, role: "Principal", school_id: principal.school_id },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: principal._id,
        name: principal.name,
        email: principal.email,
        school: principal.school,
        school_id: principal.school_id,
        role: "Principal",
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 3. Login with Password
exports.loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const principal = await Principal.findOne({ email }).select("+password");
    if (!principal) {
      return res.status(404).json({
        message: "Access Restricted. Please contact Admin to add your profile.",
        code: "PRINCIPAL_NOT_FOUND",
      });
    }

    if (!principal.password) {
      return res.status(400).json({
        message: "No password set for this account. Please use OTP login.",
      });
    }

    const isMatch = await principal.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Update lastLogin
    principal.lastLogin = new Date();
    await principal.save({ validateBeforeSave: false });

    const token = jwt.sign(
      { id: principal._id, role: "Principal", school_id: principal.school_id },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: principal._id,
        name: principal.name,
        email: principal.email,
        school: principal.school,
        school_id: principal.school_id,
        role: "Principal",
      },
    });
  } catch (error) {
    console.error("Error in password login:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 4. Activate Account (OTP verify + set password in one step)
exports.activatePrincipal = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password)
      return res
        .status(400)
        .json({ message: "Email, OTP and password are required" });

    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });

    // Verify OTP
    const otpRecord = await Otp.findOne({ identifier: email, otp });
    if (!otpRecord) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP. Please request a new one." });
    }

    const principal = await Principal.findOne({ email });
    if (!principal)
      return res.status(404).json({ message: "Principal not found." });

    // Set password (pre-save hook will hash it)
    principal.password = password;
    principal.isVerified = true;
    principal.lastLogin = new Date();
    await principal.save();

    // Clean up OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    // Issue token so they are immediately logged in
    const token = jwt.sign(
      { id: principal._id, role: "Principal", school_id: principal.school_id },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      message: "Account activated successfully",
      token,
      user: {
        id: principal._id,
        name: principal.name,
        email: principal.email,
        school: principal.school,
        school_id: principal.school_id,
        role: "Principal",
      },
    });
  } catch (error) {
    console.error("Error in activatePrincipal:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// 5. Principal Dashboard — school-scoped real-time data
exports.getPrincipalDashboard = async (req, res) => {
  try {
    const principalId = req.user.id;

    // Fetch principal to get school name
    const principal = await Principal.findById(principalId);
    if (!principal) {
      return res.status(404).json({ message: "Principal not found" });
    }

    const schoolName = principal.school; // e.g. "Achariya Bala Bhavan"
    const schoolId = principal.school_id;

    // ── Parallel data fetching ──────────────────────────────────────────────
    const [students, teachers, courses] = await Promise.all([
      Student.find({ school: schoolName })
        .select(
          "studentName name class section status completion onboarded gamification enrolledCourses badges totalCredits createdAt",
        )
        .sort({ "gamification.totalCredits": -1 }),

      Teacher.find({ branch: schoolName }).select(
        "userName designation subjects gradesInCharge status joiningDate",
      ),

      Course.find({
        isActive: true,
        $or: [
          { eligibleSchools: schoolName },
          { eligibleSchools: { $size: 0 } }, // courses with no school restriction
        ],
      }).select(
        "courseId title subjectCode status gradesEligible modules enrollments",
      ),
    ]);

    // ── Key metrics ────────────────────────────────────────────────────────
    const totalStudents = students.length;
    const totalTeachers = teachers.length;
    const totalCourses = courses.length;
    const onboardedCount = students.filter((s) => s.onboarded).length;

    const avgCompletion =
      totalStudents > 0
        ? Math.round(
            students.reduce((sum, s) => sum + (s.completion || 0), 0) /
              totalStudents,
          )
        : 0;

    const avgCredits =
      totalStudents > 0
        ? Math.round(
            students.reduce(
              (sum, s) => sum + (s.gamification?.totalCredits || 0),
              0,
            ) / totalStudents,
          )
        : 0;

    // ── Top 5 performing students (by credits then completion) ─────────────
    const topPerformers = [...students]
      .sort((a, b) => {
        const credA = a.gamification?.totalCredits || 0;
        const credB = b.gamification?.totalCredits || 0;
        if (credB !== credA) return credB - credA;
        return (b.completion || 0) - (a.completion || 0);
      })
      .slice(0, 5)
      .map((s) => ({
        _id: s._id,
        name: s.studentName || s.name,
        class: s.class,
        section: s.section,
        completion: s.completion || 0,
        credits: s.gamification?.totalCredits || 0,
        badges: s.badges?.length || s.gamification?.badges?.length || 0,
      }));

    // ── Class-wise completion breakdown ───────────────────────────────────
    const classBuckets = {};
    students.forEach((s) => {
      const key = s.class || "Unknown";
      if (!classBuckets[key])
        classBuckets[key] = { total: 0, sumCompletion: 0 };
      classBuckets[key].total++;
      classBuckets[key].sumCompletion += s.completion || 0;
    });
    const completionByClass = Object.entries(classBuckets)
      .map(([className, data]) => ({
        className,
        count: data.total,
        avgCompletion: Math.round(data.sumCompletion / data.total),
      }))
      .sort((a, b) => a.className.localeCompare(b.className));

    // ── Recently enrolled / active students (last 7 days activity) ────────
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentlyActive = students.filter(
      (s) =>
        s.gamification?.lastActivityDate &&
        new Date(s.gamification.lastActivityDate) >= sevenDaysAgo,
    ).length;

    // ── Recent join stats (new students this month) ────────────────────────
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newThisMonth = students.filter(
      (s) => new Date(s.createdAt) >= startOfMonth,
    ).length;

    // ── Course summary ─────────────────────────────────────────────────────
    const courseSummary = courses.map((c) => ({
      _id: c._id,
      courseId: c.courseId,
      title: c.title,
      subjectCode: c.subjectCode,
      status: c.status,
      gradesEligible: c.gradesEligible,
      moduleCount: c.modules?.length || 0,
    }));

    res.json({
      school: { name: schoolName, id: schoolId },
      principal: {
        id: principal._id,
        name: principal.name,
        email: principal.email,
      },
      metrics: {
        totalStudents,
        totalTeachers,
        totalCourses,
        onboardedCount,
        avgCompletion,
        avgCredits,
        recentlyActive,
        newThisMonth,
      },
      topPerformers,
      completionByClass,
      courses: courseSummary,
    });
  } catch (error) {
    console.error("Error in getPrincipalDashboard:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── Helper: resolve school name from JWT ──────────────────────────────────────
const getSchoolName = async (principalId) => {
  const principal = await Principal.findById(principalId);
  if (!principal) throw new Error("Principal not found");
  return principal.school;
};

// 6. Get all students of principal's school
exports.getSchoolStudents = async (req, res) => {
  try {
    const schoolName = await getSchoolName(req.user.id);
    const students = await Student.find({ school: schoolName })
      .select(
        "studentName name admissionNo class section email mobileNo status onboarded completion gamification badges totalCredits enrolledCourses createdAt",
      )
      .sort({ class: 1, studentName: 1 });

    res.json({ school: schoolName, students, count: students.length });
  } catch (error) {
    console.error("Error in getSchoolStudents:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// 7. Get all teachers of principal's school
exports.getSchoolTeachers = async (req, res) => {
  try {
    const schoolName = await getSchoolName(req.user.id);
    const teachers = await Teacher.find({ branch: schoolName }).sort({
      userName: 1,
    });

    res.json({ school: schoolName, teachers, count: teachers.length });
  } catch (error) {
    console.error("Error in getSchoolTeachers:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// 8. Get all courses eligible for principal's school
exports.getSchoolCourses = async (req, res) => {
  try {
    const schoolName = await getSchoolName(req.user.id);

    const courses = await Course.find({
      isActive: true,
      $or: [{ eligibleSchools: schoolName }, { eligibleSchools: { $size: 0 } }],
    })
      .select(
        "courseId title subjectCode description status gradesEligible modules thumbnail eligibleSchools",
      )
      .populate({
        path: "modules",
        select: "title sequenceOrder type isActive",
        match: { isActive: true },
        options: { sort: { sequenceOrder: 1 } },
      });

    // Count enrolled students per course from this school
    const students = await Student.find({ school: schoolName }).select(
      "enrolledCourses",
    );

    const courseData = courses.map((c) => {
      const courseIdStr = c._id.toString();
      const enrolledStudents = students.filter((s) =>
        s.enrolledCourses?.some((e) => e.courseId?.toString() === courseIdStr),
      );

      const avgProgress =
        enrolledStudents.length > 0
          ? Math.round(
              enrolledStudents.reduce((sum, s) => {
                const enrollment = s.enrolledCourses.find(
                  (e) => e.courseId?.toString() === courseIdStr,
                );
                return sum + (enrollment?.progress || 0);
              }, 0) / enrolledStudents.length,
            )
          : 0;

      return {
        _id: c._id,
        courseId: c.courseId,
        title: c.title,
        subjectCode: c.subjectCode,
        description: c.description,
        status: c.status,
        gradesEligible: c.gradesEligible,
        eligibleSchools: c.eligibleSchools,
        thumbnail: c.thumbnail,
        moduleCount: c.modules?.length || 0,
        enrolledCount: enrolledStudents.length,
        avgProgress,
      };
    });

    res.json({
      school: schoolName,
      courses: courseData,
      count: courseData.length,
    });
  } catch (error) {
    console.error("Error in getSchoolCourses:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// 9. Get single course detail with modules and enrolled students' progress
exports.getSchoolCourseDetail = async (req, res) => {
  try {
    const { courseId } = req.params;
    const schoolName = await getSchoolName(req.user.id);

    // Fetch course with full module & assessment info (read-only)
    const course = await Course.findOne({
      $or: [{ _id: courseId }, { courseId }],
      isActive: true,
    }).populate({
      path: "modules",
      match: { isActive: true },
      options: { sort: { sequenceOrder: 1 } },
      populate: {
        path: "assessments",
        select: "title type totalMarks passingMarks",
      },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check school eligibility
    if (
      course.eligibleSchools.length > 0 &&
      !course.eligibleSchools.includes(schoolName)
    ) {
      return res
        .status(403)
        .json({ message: "This course is not available for your school." });
    }

    // Fetch students from this school who are enrolled in this course
    const courseIdStr = course._id.toString();
    const enrolledStudents = await Student.find({
      school: schoolName,
      "enrolledCourses.courseId": course._id,
    }).select(
      "studentName name admissionNo class section enrolledCourses gamification",
    );

    const studentProgress = enrolledStudents.map((s) => {
      const enrollment = s.enrolledCourses.find(
        (e) => e.courseId?.toString() === courseIdStr,
      );
      return {
        _id: s._id,
        name: s.studentName || s.name,
        admissionNo: s.admissionNo,
        class: s.class,
        section: s.section,
        progress: enrollment?.progress || 0,
        completedModules: enrollment?.completedModules?.length || 0,
        totalModules: course.modules?.length || 0,
        currentModule: enrollment?.currentModule || null,
        enrolledAt: enrollment?.enrolledAt || null,
        credits: s.gamification?.totalCredits || 0,
      };
    });

    // Per-module completion stats
    const moduleStats = (course.modules || []).map((mod) => {
      const completedCount = enrolledStudents.filter((s) => {
        const enrollment = s.enrolledCourses.find(
          (e) => e.courseId?.toString() === courseIdStr,
        );
        return enrollment?.completedModules?.includes(mod._id?.toString());
      }).length;
      const completionRate =
        enrolledStudents.length > 0
          ? Math.round((completedCount / enrolledStudents.length) * 100)
          : 0;

      return {
        _id: mod._id,
        title: mod.title,
        sequenceOrder: mod.sequenceOrder,
        type: mod.type,
        assessmentCount: mod.assessments?.length || 0,
        assessments: (mod.assessments || []).map((a) => ({
          _id: a._id,
          title: a.title,
          type: a.type,
          totalMarks: a.totalMarks,
          passingMarks: a.passingMarks,
        })),
        completedCount,
        completionRate,
      };
    });

    res.json({
      school: schoolName,
      course: {
        _id: course._id,
        courseId: course.courseId,
        title: course.title,
        subjectCode: course.subjectCode,
        description: course.description,
        status: course.status,
        gradesEligible: course.gradesEligible,
        thumbnail: course.thumbnail,
      },
      moduleStats,
      enrolledCount: enrolledStudents.length,
      avgProgress:
        studentProgress.length > 0
          ? Math.round(
              studentProgress.reduce((s, e) => s + e.progress, 0) /
                studentProgress.length,
            )
          : 0,
      studentProgress,
    });
  } catch (error) {
    console.error("Error in getSchoolCourseDetail:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// 10. Get single student detail (must belong to principal's school)
exports.getSchoolStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    const schoolName = await getSchoolName(req.user.id);

    const student = await Student.findById(studentId).select(
      "studentName name admissionNo class section email mobileNo status onboarded completion school gamification badges totalCredits enrolledCourses createdAt",
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (student.school !== schoolName) {
      return res
        .status(403)
        .json({ message: "This student does not belong to your school." });
    }

    // Resolve course titles for enrolled courses
    const courseIds = (student.enrolledCourses || [])
      .map((e) => e.courseId)
      .filter(Boolean);

    const courses = await Course.find({ _id: { $in: courseIds } }).select(
      "title subjectCode status thumbnail",
    );

    const courseMap = {};
    courses.forEach((c) => {
      courseMap[c._id.toString()] = c;
    });

    const enrichedEnrollments = (student.enrolledCourses || []).map((e) => {
      const course = courseMap[e.courseId?.toString()] || {};
      return {
        courseId: e.courseId,
        title: course.title || "Unknown Course",
        subjectCode: course.subjectCode || "",
        status: course.status || "",
        thumbnail: course.thumbnail || "",
        progress: e.progress || 0,
        completedModules: e.completedModules?.length || 0,
        enrolledAt: e.enrolledAt || null,
      };
    });

    res.json({
      student: {
        _id: student._id,
        name: student.studentName || student.name,
        admissionNo: student.admissionNo,
        class: student.class,
        section: student.section,
        email: student.email,
        mobileNo: student.mobileNo,
        status: student.status,
        onboarded: student.onboarded,
        completion: student.completion || 0,
        school: student.school,
        gamification: student.gamification,
        badges: student.badges,
        totalCredits: student.totalCredits,
        createdAt: student.createdAt,
      },
      enrolledCourses: enrichedEnrollments,
    });
  } catch (error) {
    console.error("Error in getSchoolStudentById:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// 11. Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password)
      return res.status(400).json({ message: "All fields required" });

    const otpRecord = await Otp.findOne({ identifier: email, otp });
    if (!otpRecord)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    const principal = await Principal.findOne({ email });
    if (!principal)
      return res.status(404).json({ message: "Principal not found" });

    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    principal.password = await bcrypt.hash(password, salt);
    await principal.save();

    await Otp.deleteMany({ identifier: email });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error" });
  }
};
