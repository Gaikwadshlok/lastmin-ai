// Study Modes Service - Question Banks, Topic Notes, Notes to Questions
import { apiConfig } from '@/config/api.js';

export const studyModesService = {
  // Answer Question Bank
  async answerQuestions(questions, context = '') {
    try {
      const response = await fetch(`${apiConfig.baseURL}/study/answer-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ questions, context })
      });

      if (!response.ok) {
        throw new Error('Failed to get answers');
      }

      return await response.json();
    } catch (error) {
      console.error('Question answering error:', error);
      throw error;
    }
  },

  // Generate Topic Notes
  async generateNotes(topic, options = {}) {
    try {
      const { subject, level = 'intermediate', includeExamples = true } = options;
      
      const response = await fetch(`${apiConfig.baseURL}/study/generate-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          topic, 
          subject, 
          level, 
          includeExamples 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate notes');
      }

      return await response.json();
    } catch (error) {
      console.error('Notes generation error:', error);
      throw error;
    }
  },

  // Generate Questions from Notes
  async generateQuestionsFromNotes(notes, options = {}) {
    try {
      const { 
        questionTypes = ['mcq', 'short', 'long'], 
        questionCount = 10, 
        difficulty = 'mixed' 
      } = options;
      
      const response = await fetch(`${apiConfig.baseURL}/study/notes-to-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          notes, 
          questionTypes, 
          questionCount, 
          difficulty 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      return await response.json();
    } catch (error) {
      console.error('Question generation error:', error);
      throw error;
    }
  },

  // Get Study Mode Templates
  async getTemplates() {
    try {
      const response = await fetch(`${apiConfig.baseURL}/study/templates`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      return await response.json();
    } catch (error) {
      console.error('Templates fetch error:', error);
      throw error;
    }
  }
};

export default studyModesService;