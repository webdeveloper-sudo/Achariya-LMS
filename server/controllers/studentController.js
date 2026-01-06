const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const Student = require("../schemas/Student");

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
          student.school
      );

    if (mappedData.length === 0) {
      const detectedHeaders = jsonData[0] ? Object.keys(jsonData[0]) : [];
      return res.status(400).json({
        message:
          "No valid student data found. Required columns: S. NO., ADM NO, STUDENT NAME, CLASS, SECTION, MOBILE NO.",
        detectedHeaders,
      });
    }

    res.json({
      message: "File uploaded and parsed successfully",
      fileId: req.file.filename,
      data: mappedData,
      count: mappedData.length,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res
      .status(500)
      .json({ message: "Error processing file: " + error.message });
  }
};

// Save students to database
exports.saveStudents = async (req, res) => {
  try {
    const { students, fileId, school } = req.body;
    console.log(
      "📥 saveStudents called. Incoming students:",
      Array.isArray(students) ? students.length : 0
    );

    if (!school) {
      return res.status(400).json({
        message: "School is required. Please select a school before saving.",
      });
    }

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: "No student data provided" });
    }

    let saved = 0;
    let skipped = 0;
    const errors = [];

    for (const studentData of students) {
      try {
        if (
          !studentData.serialNo ||
          !studentData.admissionNo ||
          !studentData.studentName ||
          !studentData.class ||
          !studentData.section ||
          !studentData.mobileNo
        ) {
          skipped++;
          errors.push({
            admissionNo: studentData.admissionNo,
            error: "Missing mandatory fields",
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
            school,
            serialNo: studentData.serialNo,
            status: studentData.status || "Active",
            credits: studentData.credits || 0,
            school_id: studentData.school_id || 1,
          });
          await newStudent.save();
          saved++;
        }
      } catch (error) {
        skipped++;
        errors.push({
          admissionNo: studentData.admissionNo,
          error: error.message,
        });
      }
    }

    // Optionally delete the uploaded file after processing
    if (fileId) {
      const filePath = path.join(
        __dirname,
        "../uploads/studentdata/documents",
        fileId
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    console.log(
      "✅ saveStudents completed. Saved:",
      saved,
      "Skipped:",
      skipped
    );
    if (errors.length) {
      console.log("⚠️ saveStudents errors (first 5):", errors.slice(0, 5));
    }

    res.json({
      message: "Students saved successfully",
      saved,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error saving students:", error);
    res
      .status(500)
      .json({ message: "Error saving students: " + error.message });
  }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Student deleted successfully",
      student: deletedStudent,
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res
      .status(500)
      .json({ message: "Error deleting student: " + error.message });
  }
};

// Create a single student
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

    const newStudent = new Student({
      ...studentData,
      studentName: studentData.name, // Ensure consistency
      status: studentData.status || "Active",
      serialNo: studentData.serialNo || Date.now().toString(), // Fallback for serialNo
    });

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
