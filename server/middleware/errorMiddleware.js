const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Check for Mongoose validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      statusCode: 400,
      details: errors,
    });
  }

  // Check for Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: "Duplicate field value entered",
      statusCode: 400,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: err.message || "Server Error",
    statusCode: statusCode,
    details: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
