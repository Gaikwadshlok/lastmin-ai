// AI Service
// src/services/aiService.js
import axios from 'axios';
import API_BASE_URL from '../config/api.js';

const aiAPI = axios.create({
  baseURL: `${API_BASE_URL}/ai`,
  timeout: 30000,
});

// Add auth token to requests
aiAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const aiService = {
  // Chat with AI
  chat: (message, context = '') => aiAPI.post('/chat', { 
    message, 
    context 
  }),
  
  // Analyze document content
  analyzeDocument: (text, documentId = null) => aiAPI.post('/analyze', { 
    text, 
    documentId 
  }),
  
  // Generate summary
  generateSummary: (text, type = 'detailed') => aiAPI.post('/summarize', { 
    text, 
    type 
  }),
  
  // Generate quiz questions
  generateQuiz: (text, questionCount = 5, difficulty = 'mixed') => 
    aiAPI.post('/generate-quiz', { 
      text, 
      questionCount, 
      difficulty 
    }),
    
  // Get AI usage statistics
  getUsage: () => aiAPI.get('/usage'),
};

export default aiService;
