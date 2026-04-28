const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
      statusCode,
    },
  });
};

module.exports = errorMiddleware;