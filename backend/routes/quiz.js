import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Mock quiz storage - in production, this would use MongoDB
let quizzes = [
  {
    id: '1',
    title: 'Sample Mathematics Quiz',
    description: 'Basic algebra and geometry concepts',
    subject: 'Mathematics',
    difficulty: 'medium',
    questions: [
      {
        id: 'q1',
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1,
        explanation: '2 + 2 equals 4, which is basic addition.',
        points: 10
      },
      {
        id: 'q2',
        question: 'What is the area of a circle with radius 5?',
        options: ['25π', '10π', '15π', '20π'],
        correctAnswer: 0,
        explanation: 'Area = πr², so with radius 5, area = π × 5² = 25π',
        points: 15
      }
    ],
    timeLimit: 30, // minutes
    passingScore: 70,
    attempts: 245,
    averageScore: 78.5,
    createdBy: 'system',
    createdAt: new Date('2024-01-15'),
    isPublic: true,
    tags: ['algebra', 'geometry', 'basic-math']
  }
];

let quizAttempts = [
  {
    id: '1',
    quizId: '1',
    userId: 'user123',
    score: 85,
    totalQuestions: 2,
    correctAnswers: 2,
    timeSpent: 15, // minutes
    answers: [
      { questionId: 'q1', selectedAnswer: 1, isCorrect: true, timeSpent: 5 },
      { questionId: 'q2', selectedAnswer: 0, isCorrect: true, timeSpent: 10 }
    ],
    completedAt: new Date(),
    feedback: 'Excellent work! You have a strong understanding of basic mathematical concepts.'
  }
];

// @desc    Get all quizzes
// @route   GET /api/quiz
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      subject,
      difficulty,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let filteredQuizzes = [...quizzes];

    // Apply filters
    if (subject) {
      filteredQuizzes = filteredQuizzes.filter(quiz => 
        quiz.subject.toLowerCase().includes(subject.toLowerCase())
      );
    }

    if (difficulty) {
      filteredQuizzes = filteredQuizzes.filter(quiz => quiz.difficulty === difficulty);
    }

    if (search) {
      filteredQuizzes = filteredQuizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(search.toLowerCase()) ||
        quiz.description.toLowerCase().includes(search.toLowerCase()) ||
        quiz.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Sort quizzes
    filteredQuizzes.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const order = sortOrder === 'desc' ? -1 : 1;
      
      if (aValue < bValue) return -1 * order;
      if (aValue > bValue) return 1 * order;
      return 0;
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedQuizzes = filteredQuizzes.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        quizzes: paginatedQuizzes.map(quiz => ({
          ...quiz,
          questions: quiz.questions.length // Don't expose questions in list view
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredQuizzes.length / limit),
          totalQuizzes: filteredQuizzes.length,
          hasNext: endIndex < filteredQuizzes.length,
          hasPrev: startIndex > 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get quiz by ID
// @route   GET /api/quiz/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const quiz = quizzes.find(q => q.id === req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Quiz not found',
          type: 'Not Found'
        }
      });
    }

    // Remove correct answers from questions for quiz taking
    const quizForTaking = {
      ...quiz,
      questions: quiz.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        points: q.points
      }))
    };

    res.json({
      success: true,
      data: { quiz: quizForTaking }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new quiz
// @route   POST /api/quiz
// @access  Private
router.post('/', protect, [
  body('title')
    .notEmpty()
    .withMessage('Quiz title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('subject')
    .notEmpty()
    .withMessage('Subject is required'),
  body('difficulty')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
  body('questions.*.question')
    .notEmpty()
    .withMessage('Question text is required'),
  body('questions.*.options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Questions must have 2-6 options'),
  body('questions.*.correctAnswer')
    .isInt({ min: 0 })
    .withMessage('Correct answer index is required'),
  body('timeLimit')
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage('Time limit must be between 1 and 180 minutes')
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

    const {
      title,
      description,
      subject,
      difficulty,
      questions,
      timeLimit = 30,
      passingScore = 70,
      isPublic = false,
      tags = []
    } = req.body;

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (question.correctAnswer >= question.options.length) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Question ${i + 1}: Correct answer index is out of range`,
            type: 'Validation Error'
          }
        });
      }
    }

    const newQuiz = {
      id: String(quizzes.length + 1),
      title,
      description,
      subject,
      difficulty,
      questions: questions.map((q, index) => ({
        id: `q${index + 1}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        points: q.points || 10
      })),
      timeLimit,
      passingScore,
      attempts: 0,
      averageScore: 0,
      createdBy: req.user.id,
      createdAt: new Date(),
      isPublic,
      tags
    };

    quizzes.push(newQuiz);

    res.status(201).json({
      success: true,
      data: { quiz: newQuiz }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Submit quiz attempt
// @route   POST /api/quiz/:id/submit
// @access  Private
router.post('/:id/submit', protect, [
  body('answers')
    .isArray()
    .withMessage('Answers array is required'),
  body('answers.*.questionId')
    .notEmpty()
    .withMessage('Question ID is required for each answer'),
  body('answers.*.selectedAnswer')
    .isInt({ min: 0 })
    .withMessage('Selected answer index is required'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a positive number')
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

    const quiz = quizzes.find(q => q.id === req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Quiz not found',
          type: 'Not Found'
        }
      });
    }

    const { answers, timeSpent = 0 } = req.body;

    // Validate answers
    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Number of answers must match number of questions',
          type: 'Validation Error'
        }
      });
    }

    // Grade the quiz
    let totalScore = 0;
    let correctAnswers = 0;
    const gradedAnswers = [];

    for (const answer of answers) {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      
      if (!question) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Question ${answer.questionId} not found`,
            type: 'Validation Error'
          }
        });
      }

      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
        totalScore += question.points;
      }

      gradedAnswers.push({
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0,
        explanation: question.explanation,
        timeSpent: answer.timeSpent || 0
      });
    }

    const maxPossibleScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);
    const passed = percentageScore >= quiz.passingScore;

    // Create attempt record
    const attempt = {
      id: String(quizAttempts.length + 1),
      quizId: quiz.id,
      userId: req.user.id,
      score: percentageScore,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      timeSpent,
      answers: gradedAnswers,
      completedAt: new Date(),
      passed,
      feedback: passed 
        ? 'Congratulations! You passed the quiz.' 
        : `You scored ${percentageScore}%. You need ${quiz.passingScore}% to pass. Keep studying!`
    };

    quizAttempts.push(attempt);

    // Update quiz statistics
    quiz.attempts++;
    const allAttempts = quizAttempts.filter(a => a.quizId === quiz.id);
    quiz.averageScore = allAttempts.reduce((sum, a) => sum + a.score, 0) / allAttempts.length;

    res.json({
      success: true,
      data: { attempt }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's quiz attempts
// @route   GET /api/quiz/attempts
// @access  Private
router.get('/attempts/me', protect, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      quizId,
      sortBy = 'completedAt',
      sortOrder = 'desc'
    } = req.query;

    let userAttempts = quizAttempts.filter(attempt => attempt.userId === req.user.id);

    if (quizId) {
      userAttempts = userAttempts.filter(attempt => attempt.quizId === quizId);
    }

    // Sort attempts
    userAttempts.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const order = sortOrder === 'desc' ? -1 : 1;
      
      if (aValue < bValue) return -1 * order;
      if (aValue > bValue) return 1 * order;
      return 0;
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedAttempts = userAttempts.slice(startIndex, endIndex);

    // Add quiz information to attempts
    const attemptsWithQuizInfo = paginatedAttempts.map(attempt => {
      const quiz = quizzes.find(q => q.id === attempt.quizId);
      return {
        ...attempt,
        quizTitle: quiz?.title || 'Unknown Quiz',
        quizSubject: quiz?.subject || 'Unknown'
      };
    });

    res.json({
      success: true,
      data: {
        attempts: attemptsWithQuizInfo,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(userAttempts.length / limit),
          totalAttempts: userAttempts.length,
          hasNext: endIndex < userAttempts.length,
          hasPrev: startIndex > 0
        },
        stats: {
          totalAttempts: userAttempts.length,
          averageScore: userAttempts.length > 0 
            ? userAttempts.reduce((sum, a) => sum + a.score, 0) / userAttempts.length 
            : 0,
          passedQuizzes: userAttempts.filter(a => a.passed).length
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get quiz statistics
// @route   GET /api/quiz/:id/stats
// @access  Private
router.get('/:id/stats', protect, async (req, res, next) => {
  try {
    const quiz = quizzes.find(q => q.id === req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Quiz not found',
          type: 'Not Found'
        }
      });
    }

    const quizAttemptsList = quizAttempts.filter(a => a.quizId === quiz.id);
    
    const stats = {
      totalAttempts: quiz.attempts,
      averageScore: quiz.averageScore,
      passRate: quizAttemptsList.length > 0 
        ? (quizAttemptsList.filter(a => a.passed).length / quizAttemptsList.length) * 100
        : 0,
      averageTimeSpent: quizAttemptsList.length > 0
        ? quizAttemptsList.reduce((sum, a) => sum + a.timeSpent, 0) / quizAttemptsList.length
        : 0,
      scoreDistribution: {
        '0-20': quizAttemptsList.filter(a => a.score <= 20).length,
        '21-40': quizAttemptsList.filter(a => a.score > 20 && a.score <= 40).length,
        '41-60': quizAttemptsList.filter(a => a.score > 40 && a.score <= 60).length,
        '61-80': quizAttemptsList.filter(a => a.score > 60 && a.score <= 80).length,
        '81-100': quizAttemptsList.filter(a => a.score > 80).length
      },
      questionAnalysis: quiz.questions.map(question => {
        const questionAttempts = quizAttemptsList.flatMap(a => 
          a.answers.filter(ans => ans.questionId === question.id)
        );
        
        return {
          questionId: question.id,
          question: question.question,
          correctPercentage: questionAttempts.length > 0
            ? (questionAttempts.filter(a => a.isCorrect).length / questionAttempts.length) * 100
            : 0,
          averageTimeSpent: questionAttempts.length > 0
            ? questionAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / questionAttempts.length
            : 0
        };
      })
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
