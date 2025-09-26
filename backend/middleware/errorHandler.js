const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('❌ Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      status: 404,
      error: 'Not Found'
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = {
      message,
      status: 400,
      error: 'Duplicate Entry'
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      status: 400,
      error: 'Validation Error'
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      message,
      status: 401,
      error: 'Unauthorized'
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      message,
      status: 401,
      error: 'Unauthorized'
    };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = {
      message,
      status: 400,
      error: 'File Upload Error'
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = {
      message,
      status: 400,
      error: 'File Upload Error'
    };
  }

  // OpenAI API errors
  if (err.response && err.response.status === 429) {
    const message = 'AI service rate limit exceeded. Please try again later.';
    error = {
      message,
      status: 429,
      error: 'Rate Limit Exceeded'
    };
  }

  if (err.response && err.response.status === 401) {
    const message = 'AI service authentication failed';
    error = {
      message,
      status: 500,
      error: 'AI Service Error'
    };
  }

  // Default error response
  const statusCode = error.status || err.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const errorType = error.error || 'Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      type: errorType,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  });
};

export { errorHandler };
