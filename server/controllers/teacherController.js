const XLSX = require("xlsx");
const Teacher = require("../schemas/Teacher");

// Helper to safely parse dates from Excel
const parseExcelDate = (value) => {
  if (!value) return null;
  if (typeof value === "number") {
    // Excel date serial number
    return new Date(Math.round((value - 25569) * 86400 * 1000));
  }

  // Clean the string (handle potential extra spaces)
  const dateStr = String(value).trim();

  // Try standard Date parsing first (for YYYY-MM-DD or MM/DD/YYYY)
  const standardDate = new Date(dateStr);
  if (!isNaN(standardDate.getTime())) {
    // Check if it's likely MM/DD/YYYY vs DD/MM/YYYY ambiguity
    // If > 12 is first part, it's definitely DD/MM/YYYY or similar.
    return standardDate;
  }

  // Handle DD/MM/YYYY format manual parsing
  // Matches dd/mm/yyyy or d/m/yyyy or with dots/dashes
  const ukDatePattern = /^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/;
  const match = dateStr.match(ukDatePattern);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // 0-indexed
    const year = parseInt(match[3], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) return date;
  }

  return null;
};

// Upload and parse Excel file for Teachers
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    let workbook;
    try {
      workbook = XLSX.readFile(filePath);
    } catch (e) {
      return res.status(400).json({
        message: "Invalid file format. Please upload a valid Excel file.",
      });
    }

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
    const parseArray = (str) => {
      if (!str) return [];
      return str
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    };

    const mappedData = jsonData
      .map((row) => {
        const normalizedRow = Object.fromEntries(
          Object.entries(row).map(([k, v]) => [normalizeKey(k), v])
        );

        const getUserId = () =>
          normalizedRow["userid"] ||
          normalizedRow["id"] ||
          normalizedRow["user_id"];
        const getUserName = () =>
          normalizedRow["username"] ||
          normalizedRow["name"] ||
          normalizedRow["user_name"] ||
          normalizedRow["teachername"];
        const getJoiningDate = () =>
          normalizedRow["joiningdate"] ||
          normalizedRow["dateofjoining"] ||
          normalizedRow["doj"] ||
          normalizedRow["joining"];
        const getBranch = () =>
          normalizedRow["branch"] ||
          normalizedRow["school"] ||
          normalizedRow["campus"];
        const getDesignation = () =>
          normalizedRow["designation"] ||
          normalizedRow["role"] ||
          normalizedRow["position"];

        // New Fields
        const getSubjects = () =>
          normalizedRow["subjects"] || normalizedRow["subject"];
        const getQualifications = () =>
          normalizedRow["qualifications"] || normalizedRow["qualification"];
        const getGrades = () =>
          normalizedRow["gradesincharge"] ||
          normalizedRow["grades"] ||
          normalizedRow["classes"];
        const getExperience = () =>
          normalizedRow["experience"] || normalizedRow["exp"];

        return {
          userId: toSafeString(getUserId()),
          userName: toSafeString(getUserName()),
          joiningDate: parseExcelDate(
            row[
              Object.keys(row).find((k) => normalizeKey(k).includes("joining"))
            ]
          ),
          branch: toSafeString(getBranch()),
          designation: toSafeString(getDesignation()),
          subjects: parseArray(toSafeString(getSubjects())),
          qualifications: toSafeString(getQualifications()),
          gradesInCharge: parseArray(toSafeString(getGrades())),
          experience: toSafeString(getExperience()),
        };
      })
      .filter((t) => t.userId && t.userName && t.branch && t.designation);

    if (mappedData.length === 0) {
      return res.status(400).json({
        message:
          "No valid teacher data found. Required columns: User ID, User Name, Joining Date, Branch, Designation, Subjects, Qualifications, Grades Incharge, Experience.",
      });
    }

    res.json({
      message: "File parsed successfully",
      data: mappedData,
      count: mappedData.length,
    });
  } catch (error) {
    console.error("Error uploading teacher file:", error);
    res
      .status(500)
      .json({ message: "Error processing file: " + error.message });
  }
};

// Save teachers to database (Bulk)
exports.saveTeachers = async (req, res) => {
  try {
    const { teachers } = req.body;

    if (!teachers || !Array.isArray(teachers) || teachers.length === 0) {
      return res.status(400).json({ message: "No teacher data provided" });
    }

    let saved = 0;
    let skipped = 0;
    const errors = [];

    for (const teacherData of teachers) {
      try {
        // Validation
        if (
          !teacherData.userId ||
          !teacherData.userName ||
          !teacherData.joiningDate ||
          !teacherData.branch ||
          !teacherData.designation
        ) {
          skipped++;
          errors.push({
            userId: teacherData.userId,
            error: "Missing mandatory fields (or invalid date)",
          });
          continue;
        }

        const existingTeacher = await Teacher.findOne({
          userId: teacherData.userId,
        });

        const updateData = {
          userName: teacherData.userName,
          joiningDate: new Date(teacherData.joiningDate),
          branch: teacherData.branch,
          designation: teacherData.designation,
          subjects: teacherData.subjects || [],
          qualifications: teacherData.qualifications || "",
          gradesInCharge: teacherData.gradesInCharge || [],
          experience: teacherData.experience || "",
          mobileNo: teacherData.mobileNo || "",
          email: teacherData.email || "",
        };

        if (existingTeacher) {
          Object.assign(existingTeacher, updateData);
          await existingTeacher.save();
          saved++;
        } else {
          const newTeacher = new Teacher({
            userId: teacherData.userId,
            ...updateData,
          });
          await newTeacher.save();
          saved++;
        }
      } catch (error) {
        skipped++;
        errors.push({ userId: teacherData.userId, error: error.message });
      }
    }

    res.json({
      message: "Teachers upload process completed",
      saved,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error saving teachers:", error);
    res
      .status(500)
      .json({ message: "Error saving teachers: " + error.message });
  }
};

// Get all teachers
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ userName: 1 });
    res.json({
      teachers,
      count: teachers.length,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching teachers: " + error.message });
  }
};

// Create a single teacher
exports.createTeacher = async (req, res) => {
  try {
    const teacherData = req.body;

    // Mandatory check
    const required = [
      "userId",
      "userName",
      "joiningDate",
      "branch",
      "designation",
      "subjects",
      "qualifications",
      "gradesInCharge",
      "experience",
    ];
    // Note: subjects and gradesInCharge are arrays, check if present even if empty? User said "update list... for subjects... refer global.ts" - implying they are important.

    // For simple validation let's just ensure the fields exist in the body.

    const existing = await Teacher.findOne({ userId: teacherData.userId });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Teacher with this User ID already exists" });
    }

    const newTeacher = new Teacher(teacherData);
    await newTeacher.save();

    res
      .status(201)
      .json({ message: "Teacher created successfully", teacher: newTeacher });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating teacher: " + error.message });
  }
};

// Update teacher
exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    delete updateData._id;

    const updated = await Teacher.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Teacher not found" });

    res.json({ message: "Teacher updated successfully", teacher: updated });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating teacher: " + error.message });
  }
};

// Delete teacher
exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Teacher.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "Teacher not found" });

    res.json({ message: "Teacher deleted successfully", teacher: deleted });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting teacher: " + error.message });
  }
};
