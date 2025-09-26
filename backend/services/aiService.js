// AI Service - Mixtral Only Integration
import { mockChatCompletion, mockAnalyze, mockSummarize, mockQuizQuestions } from './mockAI.js';
import mixtralService from './mixtralService.js';

let initialized = false;

function ensureProviders() {
  if (initialized) return;
  
  // Check Mixtral configuration
  if (mixtralService.isConfigured()) {
    console.log('[AI] ✅ Mixtral initialized successfully with API key');
  } else {
    console.log('[AI] ⚠️  No valid Mixtral API key found - using mock responses for development');
  }
  
  initialized = true;
}

// Function to reset initialization (called after env vars are loaded)
export function resetInitialization() {
  initialized = false;
  console.log('[AI] 🔄 Resetting AI service initialization...');
  // Reload Mixtral configuration with new environment variables
  mixtralService.reloadConfig();
}

async function safeGenerate(prompt, generationConfig = {}) {
  ensureProviders();
  
  // Try Mixtral first
  if (mixtralService.isConfigured()) {
    try {
      return await mixtralService.chatCompletion(prompt);
    } catch (error) {
      console.error('[AI] Mixtral error, falling back to mock:', error.message);
    }
  }
  
  // Fallback to mock for development
  return await mockChatCompletion(prompt);
}

export async function chatCompletion(message, context = '') {
  ensureProviders();
  
  // Try Mixtral first
  if (mixtralService.isConfigured()) {
    try {
      return await mixtralService.chatCompletion(message, context);
    } catch (error) {
      console.error('[AI] Mixtral chat error, falling back to mock:', error.message);
    }
  }
  
  // Fallback to mock
  return await mockChatCompletion(message, context);
}

export async function summarize(text, type = 'detailed') {
  ensureProviders();
  
  // Try Mixtral first
  if (mixtralService.isConfigured()) {
    try {
      const style = type === 'brief' ? 'Provide a concise 3 sentence summary.' : 
                   type === 'bullet-points' ? 'Return 5-8 bullet points.' : 
                   'Provide a thorough yet compact study summary.';
      const prompt = `${style}\n\nText:\n${text.slice(0, 12000)}`;
      return await mixtralService.chatCompletion(prompt);
    } catch (error) {
      console.error('[AI] Mixtral summarize error, falling back to mock:', error.message);
    }
  }
  
  // Fallback to mock
  return await mockSummarize(text, type);
}

export async function analyze(text) {
  ensureProviders();
  
  // Try Mixtral first
  if (mixtralService.isConfigured()) {
    try {
      return await mixtralService.analyze(text);
    } catch (error) {
      console.error('[AI] Mixtral analyze error, falling back to mock:', error.message);
    }
  }
  
  // Fallback to mock
  return await mockAnalyze(text);
}

export async function quizQuestions(content, numQuestions = 5) {
  ensureProviders();
  
  // Try Mixtral first
  if (mixtralService.isConfigured()) {
    try {
      return await mixtralService.generateQuiz(content, numQuestions);
    } catch (error) {
      console.error('[AI] Mixtral quiz error, falling back to mock:', error.message);
    }
  }
  
  // Fallback to mock
  return await mockQuizQuestions(content, numQuestions);
}

// Export default for backward compatibility
export default {
  chatCompletion,
  summarize,
  analyze,
  quizQuestions
};