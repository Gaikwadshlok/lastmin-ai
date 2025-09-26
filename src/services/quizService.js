// Quiz Service
// src/services/quizService.js
import axios from 'axios';
import API_BASE_URL from '../config/api.js';

const quizAPI = axios.create({
  baseURL: `${API_BASE_URL}/quiz`,
  timeout: 15000,
});

// Add auth token to requests
quizAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const quizService = {
  // Get all quizzes
  getQuizzes: (params = {}) => quizAPI.get('/', { params }),
  
  // Get quiz by ID
  getQuiz: (id) => quizAPI.get(`/${id}`),
  
  // Create new quiz
  createQuiz: (quizData) => quizAPI.post('/', quizData),
  
  // Submit quiz attempt
  submitQuiz: (quizId, answers, timeSpent = 0) => 
    quizAPI.post(`/${quizId}/submit`, { answers, timeSpent }),
  
  // Get user's quiz attempts
  getUserAttempts: (params = {}) => quizAPI.get('/attempts/me', { params }),
  
  // Get quiz statistics
  getQuizStats: (quizId) => quizAPI.get(`/${quizId}/stats`),
};

export default quizService;
