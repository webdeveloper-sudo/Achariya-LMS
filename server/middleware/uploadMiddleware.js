const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const createDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // We need courseId and moduleId from params or body to organize files
    // If not available (e.g., initial course creation), might need a temp folder or just generic 'uploads/coursedata/temp'
    const courseId =
      req.params.courseId || req.body.courseId || "uncategorized";
    const moduleId = req.params.moduleId || req.body.moduleId || "general";

    let type = "misc";
    if (file.mimetype === "application/pdf") type = "notes";
    else if (
      file.mimetype.includes("powerpoint") ||
      file.mimetype.includes("presentation")
    )
      type = "slides";
    else if (file.mimetype.includes("audio")) type = "audio";
    else if (file.mimetype.includes("image")) type = "thumbnail";

    const uploadPath = path.join(
      __dirname,
      "..",
      "uploads",
      "coursedata",
      courseId,
      moduleId,
      type
    );
    createDirectory(uploadPath);

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Sanitized filename: timestamp-name
    const sanitizedName = file.originalname
      .replace(/[^a-z0-9.]/gi, "_")
      .toLowerCase();
    cb(null, `${Date.now()}-${sanitizedName}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Validate file types
  if (file.fieldname === "notes") {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed for notes"), false);
  } else if (file.fieldname === "slides") {
    if (
      file.mimetype === "application/vnd.ms-powerpoint" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )
      cb(null, true);
    else cb(new Error("Only PPT/PPTX files are allowed for slides"), false);
  } else if (file.fieldname === "audio") {
    if (["audio/mpeg", "audio/wav", "audio/x-m4a"].includes(file.mimetype))
      cb(null, true);
    else cb(new Error("Only MP3, WAV, M4A files are allowed for audio"), false);
  } else if (file.fieldname === "thumbnail") {
    if (["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype))
      cb(null, true);
    else cb(new Error("Only JPG, PNG files are allowed for thumbnails"), false);
  } else {
    // Generic allow if not specific fieldname matches (or add strict rules)
    cb(null, true);
  }
};

const limits = {
  fileSize: 100 * 1024 * 1024, // 100MB max default, can refine per type if needed
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
});

module.exports = upload;
