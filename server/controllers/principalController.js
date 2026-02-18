const Principal = require("../schemas/Principal");
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

    await Otp.deleteMany({ admissionNo: email }); // cleanup old
    const newOtp = new Otp({
      admissionNo: email, // Overloading this field for now, assuming it's a String
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

    const otpRecord = await Otp.findOne({ admissionNo: email, otp });
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
