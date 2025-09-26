import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { chatCompletion, analyze, summarize, quizQuestions, fetchWebContent, chatCompletionWithWebAccess } from '../services/aiService.js';
import Document from '../models/Document.js';

const router = express.Router();

// Dev-only unauthenticated chat endpoint for quick testing
if (process.env.NODE_ENV !== 'production') {
  router.post('/chat-test', [
    body('message')
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ max: 1000 })
      .withMessage('Message cannot exceed 1000 characters'),
    body('context')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Context cannot exceed 5000 characters')
  ], async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
      }

      const { message, context } = req.body;
      const response = await chatCompletion(message, context);

      return res.json({ success: true, data: { response, timestamp: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  });
}

// Gemini integration wrappers (fall back errors handled below)

// @desc    Chat with AI
// @route   POST /api/ai/chat
// @access  Private
router.post('/chat', protect, [
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
  body('context')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Context cannot exceed 5000 characters')
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          type: 'Validation Error',
          details: errors.array()
        }
      });
    }

    const { message, context } = req.body;

    // Generate AI response
  const response = await chatCompletion(message, context);

    res.json({
      success: true,
      data: {
        response,
        timestamp: new Date().toISOString(),
  model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        usage: {
          promptTokens: message.length + (context?.length || 0),
          completionTokens: response.length,
          totalTokens: message.length + (context?.length || 0) + response.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Analyze document content
// @route   POST /api/ai/analyze
// @access  Private
router.post('/analyze', protect, [
  body('text')
    .notEmpty()
    .withMessage('Text content is required'),
  body('documentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid document ID')
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          type: 'Validation Error',
          details: errors.array()
        }
      });
    }

    const { text, documentId } = req.body;

    // Analyze content with AI (structured attempt)
  const analysisResult = await analyze(text);
  const analysis = analysisResult;

    // If documentId provided, update document with analysis when structured
    if (documentId && analysis.structured) {
      try {
        await Document.findByIdAndUpdate(documentId, {
          $set: {
            difficulty: analysis.difficulty || 'intermediate',
            keyTopics: (analysis.keyTopics || []).map(t => ({ topic: t.topic || t.name || '', confidence: t.importance || t.importanceScore || 0, relevance: t.importance || 0 })),
            summary: analysis.concepts ? analysis.concepts.map(c => `${c.name}: ${c.definition}`).join('\n') : '',
            'aiAnalysis.wordCount': analysis.wordCount || 0,
            'aiAnalysis.readingTime': analysis.readingTimeMinutes || 0,
            'aiAnalysis.concepts': (analysis.concepts || []).map(c => ({ name: c.name, definition: c.definition, importance: c.importance }))
          }
        }, { new: true });
      } catch (e) {
        console.warn('[AI] Failed to persist document analysis:', e.message);
      }
    }

    res.json({
      success: true,
      data: {
        analysis,
        processedAt: new Date().toISOString(),
        textLength: text.length,
        estimatedReadingTime: Math.ceil(text.split(' ').length / 200)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Generate summary
// @route   POST /api/ai/summarize
// @access  Private
router.post('/summarize', protect, [
  body('text')
    .notEmpty()
    .withMessage('Text content is required'),
  body('type')
    .optional()
    .isIn(['brief', 'detailed', 'bullet-points'])
    .withMessage('Summary type must be brief, detailed, or bullet-points')
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          type: 'Validation Error',
          details: errors.array()
        }
      });
    }

    const { text, type = 'detailed' } = req.body;

    // Generate summary
  const summaryText = await summarize(text, type);
  const summaryData = { summary: summaryText };

    res.json({
      success: true,
      data: {
        ...summaryData,
        type,
        generatedAt: new Date().toISOString(),
        originalLength: text.length,
        compressionRatio: summaryData.summary.length / text.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Generate quiz questions
// @route   POST /api/ai/generate-quiz
// @access  Private
router.post('/generate-quiz', protect, [
  body('text')
    .notEmpty()
    .withMessage('Text content is required'),
  body('questionCount')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Question count must be between 1 and 20'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'mixed'])
    .withMessage('Difficulty must be easy, medium, hard, or mixed')
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          type: 'Validation Error',
          details: errors.array()
        }
      });
    }

    const { text, questionCount = 5, difficulty = 'mixed' } = req.body;

    // Generate quiz questions
  const quizResult = await quizQuestions(text, questionCount);
  const questions = Array.isArray(quizResult) ? quizResult : quizResult.parsed || [];
  const rawQuiz = quizResult.raw && !Array.isArray(quizResult) ? quizResult.raw : undefined;

    res.json({
      success: true,
      data: {
  questions,
  raw: rawQuiz,
        metadata: {
          totalQuestions: questions.length,
          difficulty,
          sourceLength: text.length,
          generatedAt: new Date().toISOString(),
          estimatedTime: questions.length * 2 // 2 minutes per question
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get AI usage statistics
// @route   GET /api/ai/usage
// @access  Private
router.get('/usage', protect, async (req, res, next) => {
  try {
    // Mock usage statistics
    const usage = {
      totalRequests: 150,
      chatRequests: 89,
      analysisRequests: 35,
      summaryRequests: 18,
      quizRequests: 8,
      tokensUsed: 45230,
      averageResponseTime: 1.2, // seconds
      lastRequest: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 minutes ago
    };

    res.json({
      success: true,
      data: { usage }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Fetch web content via Chrome extension
// @route   POST /api/ai/web-content
// @access  Private
router.post('/web-content', protect, [
  body('url')
    .notEmpty()
    .withMessage('URL is required')
    .isURL()
    .withMessage('Valid URL is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { url } = req.body;
    console.log(`[AI Route] Fetching web content for: ${url}`);

    const content = await fetchWebContent(url);
    
    if (!content) {
      return res.status(503).json({
        success: false,
        error: {
          message: 'Failed to fetch web content. Make sure the Chrome extension bridge is running.',
          hint: 'Start the bridge server with: cd chrome-extension && npm start'
        }
      });
    }

    res.json({
      success: true,
      data: {
        content,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[AI Route] Web content fetch error:', error);
    next(error);
  }
});

// @desc    Chat with AI using web content for enhanced context
// @route   POST /api/ai/chat-web
// @access  Private
router.post('/chat-web', protect, [
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
  body('urls')
    .optional()
    .isArray()
    .withMessage('URLs must be an array'),
  body('urls.*')
    .optional()
    .isURL()
    .withMessage('Each URL must be valid'),
  body('context')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Context cannot exceed 5000 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { message, context = '', urls = [] } = req.body;
    console.log(`[AI Route] Chat with web access - URLs: ${urls.length}`);

    const response = await chatCompletionWithWebAccess(message, context, urls);

    res.json({
      success: true,
      data: {
        response,
        urlsFetched: urls.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[AI Route] Chat with web access error:', error);
    next(error);
  }
});

export default router;
