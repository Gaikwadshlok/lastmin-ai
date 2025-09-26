const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found - ${req.originalUrl}`,
      type: 'Not Found',
      availableRoutes: {
        auth: '/api/auth',
        users: '/api/users',
        upload: '/api/upload',
        ai: '/api/ai',
        quiz: '/api/quiz',
        notes: '/api/notes'
      },
      suggestion: 'Check the API documentation for available endpoints'
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  });
};

export { notFound };
