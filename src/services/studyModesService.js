// Study Modes Service - Question Banks, Topic Notes, Notes to Questions
// src/services/studyModesService.js
import apiClient from './apiClient.js';

export const studyModesService = {
  // Answer Question Bank
  answerQuestions: (questions, context = '') =>
    apiClient.post('/study/answer-questions', { questions, context }).then((r) => r.data),

  // Generate Topic Notes
  generateNotes: (topic, options = {}) => {
    const { subject, level = 'intermediate', includeExamples = true } = options;
    return apiClient
      .post('/study/generate-notes', { topic, subject, level, includeExamples })
      .then((r) => r.data);
  },

  // Generate Questions from Notes
  generateQuestionsFromNotes: (notes, options = {}) => {
    const {
      questionTypes = ['mcq', 'short', 'long'],
      questionCount = 10,
      difficulty = 'mixed',
    } = options;
    return apiClient
      .post('/study/notes-to-questions', { notes, questionTypes, questionCount, difficulty })
      .then((r) => r.data);
  },

  // Get Study Mode Templates
  getTemplates: () => apiClient.get('/study/templates').then((r) => r.data),
};

export default studyModesService;