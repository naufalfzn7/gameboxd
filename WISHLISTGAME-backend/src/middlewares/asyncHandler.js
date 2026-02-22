const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    const statusCode = err.statusCode || err.status || 500;
    console.error("Request error:", err);
    res.status(statusCode).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  });
};

export default asyncHandler;
