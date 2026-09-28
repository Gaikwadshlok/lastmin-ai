// Quiz Service
// src/services/quizService.js
import apiClient from './apiClient.js';

export const quizService = {
  // Get all quizzes
  getQuizzes: (params = {}) => apiClient.get('/quiz', { params }),

  // Get quiz by ID
  getQuiz: (id) => apiClient.get(`/quiz/${id}`),

  // Create new quiz
  createQuiz: (quizData) => apiClient.post('/quiz', quizData),

  // Submit quiz attempt
  submitQuiz: (quizId, answers, timeSpent = 0) =>
    apiClient.post(`/quiz/${quizId}/submit`, { answers, timeSpent }),

  // Get user's quiz attempts
  getUserAttempts: (params = {}) => apiClient.get('/quiz/attempts/me', { params }),

  // Get quiz statistics
  getQuizStats: (quizId) => apiClient.get(`/quiz/${quizId}/stats`),
};

export default quizService;
