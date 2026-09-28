// AI Service
// src/services/aiService.js
import apiClient from './apiClient.js';

// AI requests get a longer timeout
const AI_TIMEOUT = 30000;

export const aiService = {
  // Chat with AI
  chat: (message, context = '') =>
    apiClient.post('/ai/chat', { message, context }, { timeout: AI_TIMEOUT }),

  // Analyze document content
  analyzeDocument: (text, documentId = null) =>
    apiClient.post('/ai/analyze', { text, documentId }, { timeout: AI_TIMEOUT }),

  // Generate summary
  generateSummary: (text, type = 'detailed') =>
    apiClient.post('/ai/summarize', { text, type }, { timeout: AI_TIMEOUT }),

  // Generate quiz questions
  generateQuiz: (text, questionCount = 5, difficulty = 'mixed') =>
    apiClient.post('/ai/generate-quiz', { text, questionCount, difficulty }, { timeout: AI_TIMEOUT }),

  // Get AI usage statistics
  getUsage: () => apiClient.get('/ai/usage'),
};

export default aiService;
