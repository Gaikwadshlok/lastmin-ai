import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { mockChatCompletion, mockAnalyze, mockSummarize, mockQuizQuestions } from './mockAI.js';
import mixtralService from './mixtralService.js';

let genAI; let model; let openai; let initialized = false;

function ensureProviders() {
  if (initialized) return;
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  // Check Mixtral first
  if (mixtralService.isConfigured()) {
    console.log('[AI] Mixtral initialized successfully');
  } else if (geminiKey && geminiKey !== 'your-gemini-api-key-here') {
    try {
      genAI = new GoogleGenerativeAI(geminiKey);
      model = genAI.getGenerativeModel({ model: modelName });
      console.log('[AI] Gemini initialized successfully');
    } catch (e) {
      console.error('[AI] Gemini initialization error:', e.message);
    }
  } else if (openaiKey && openaiKey !== 'your-openai-api-key-here' && !openaiKey.startsWith('sk-abcd') && !openaiKey.startsWith('sk-efgh')) {
    try {
      openai = new OpenAI({ apiKey: openaiKey });
      console.log('[AI] OpenAI initialized successfully');
    } catch (e) {
      console.error('[AI] OpenAI initialization error:', e.message);
    }
  } else {
    console.log('[AI] No valid API keys found - using mock responses for development');
  }
  initialized = true;
}

async function safeGenerate(prompt, generationConfig = {}) {
  ensureProviders();
  
  // Try Mixtral first
  if (mixtralService.isConfigured()) {
    try {
      return await mixtralService.chatCompletion(prompt);
    } catch (error) {
      console.error('[AI] Mixtral error, falling back to other providers:', error.message);
    }
  }
  
  // Fallback to Gemini
  if (model) {
    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig });
    return result.response.text();
  }
  
  // Fallback to OpenAI
  if (openai) {
    const chat = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: generationConfig.temperature ?? parseFloat(process.env.GEMINI_TEMPERATURE || '0.7')
    });
    return chat.choices[0].message.content;
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
      console.error('[AI] Mixtral chat error, falling back:', error.message);
    }
  }
  
  // Fallback to other providers or mock
  if (!model && !openai) return await mockChatCompletion(message, context);
  const prompt = context ? `${context}\n\nUser Question: ${message}` : message;
  return safeGenerate(prompt, { temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7') });
}

export async function summarize(text, type = 'detailed') {
  ensureProviders();
  if (!model && !openai) return await mockSummarize(text, type);
  const style = type === 'brief' ? 'Provide a concise 3 sentence summary.' : type === 'bullet-points' ? 'Return 5-8 bullet points.' : 'Provide a thorough yet compact study summary.';
  const prompt = `${style}\n\nText:\n${text.slice(0, 12000)}`; // guard length
  const out = await safeGenerate(prompt, { temperature: 0.5 });
  return out;
}

export async function analyze(text) {
  ensureProviders();
  
  // Try Mixtral first
  if (mixtralService.isConfigured()) {
    try {
      return await mixtralService.analyze(text);
    } catch (error) {
      console.error('[AI] Mixtral analyze error, falling back:', error.message);
    }
  }
  
  // Fallback to other providers or mock
  if (!model && !openai) return await mockAnalyze(text);
  const prompt = `Return ONLY valid JSON with this shape: {"difficulty":"beginner|intermediate|advanced","keyTopics":[{"topic":"","importance":1-10}],"concepts":[{"name":"","definition":"","importance":1-10}],"wordCount":number,"readingTimeMinutes":number}. Analyze this study material and fill fields. Text:\n${text.slice(0, 12000)}`;
  const raw = await safeGenerate(prompt, { temperature: 0.4 });
  // Attempt to parse JSON strictly
  const jsonStart = raw.indexOf('{');
  const jsonEnd = raw.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    try {
      const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
      return { structured: true, ...parsed };
    } catch (e) {
      // fallthrough
    }
  }
  return { structured: false, raw };
}

export async function quizQuestions(text, count = 5) {
  ensureProviders();
  if (!model && !openai) return await mockQuizQuestions(text, count);
  const prompt = `Return ONLY JSON array of ${count} objects each: {"question":"","options":["","","",""],"correctIndex":0-3,"explanation":"","difficulty":"easy|medium|hard"}. Create diverse multiple-choice questions from: \n${text.slice(0, 8000)}`;
  const raw = await safeGenerate(prompt, { temperature: 0.7 });
  try {
    const jsonStart = raw.indexOf('[');
    const jsonEnd = raw.lastIndexOf(']');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
      // Basic validation
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(q => q && typeof q.question === 'string' && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4);
        if (cleaned.length) return cleaned;
      }
    }
  } catch (e) {
    console.warn('[AI] Quiz JSON parse issue');
  }
  return { raw, parsed: [] };
}
