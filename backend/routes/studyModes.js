// Study Modes Routes - Question Banks, Topic Notes, Notes to Questions
import express from 'express';
import { protect } from '../middleware/auth.js';
import { chatCompletionWithWebAccess, chatCompletion } from '../services/aiService.js';

const router = express.Router();

// Answer Question Bank
router.post('/answer-questions', protect, async (req, res) => {
  try {
    const { questions, context = '' } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Questions array is required'
      });
    }

    // Format questions for AI processing
    const questionText = questions.map((q, index) => 
      `Question ${index + 1}: ${q}`
    ).join('\n\n');

    const prompt = `QUESTION BANK MODE: Please provide detailed, comprehensive answers to each of the following questions. For each question, give a thorough explanation with key points, examples where applicable, and clear reasoning. Format your response as:

Question 1: [question]
Answer: [detailed answer with explanations and examples]

Question 2: [question]  
Answer: [detailed answer with explanations and examples]

Continue this format for all questions.

Questions to answer:
${questionText}

Additional context: ${context}`;

        const response = await chatCompletion(prompt, context);
    
    res.json({
      success: true,
      data: {
        answers: response.data?.response || response,
        questionCount: questions.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Question bank error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate answers',
      error: error.message
    });
  }
});

// Generate Topic Notes
router.post('/generate-notes', protect, async (req, res) => {
  try {
    const { topic, subject = '', level = 'intermediate', includeExamples = true } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required'
      });
    }

    const prompt = `COMPREHENSIVE NOTES GENERATION MODE: Create detailed, well-structured study notes for the topic "${topic}"${subject ? ` in ${subject}` : ''}.

Please organize the notes with the following structure:

1. INTRODUCTION & OVERVIEW
   - Brief introduction to the topic
   - Why this topic is important
   - Key learning objectives

2. KEY CONCEPTS & DEFINITIONS
   - Important terms and their definitions
   - Core concepts explained clearly

3. DETAILED EXPLANATIONS
   - In-depth explanation of main points
   - How concepts relate to each other
   - Important theories or principles

4. EXAMPLES & APPLICATIONS
   - Real-world examples
   - Practical applications
   - Case studies (if applicable)

5. IMPORTANT FORMULAS/PROCESSES
   - Key formulas (if applicable)
   - Step-by-step processes
   - Problem-solving approaches

6. SUMMARY & KEY TAKEAWAYS
   - Main points to remember
   - Critical concepts for exams
   - Common mistakes to avoid

Make the notes comprehensive but easy to understand for ${level} level students. ${includeExamples ? 'Include plenty of examples and practical applications.' : 'Focus on theoretical concepts.'} Use clear, simple language and organize information logically.

Topic: ${topic}`;

    // Use web access for more current and comprehensive information
    const response = await chatCompletionWithWebAccess(prompt, '', []);
    
    res.json({
      success: true,
      data: {
        notes: response.data?.response || response.data?.data?.response || response,
        topic,
        subject,
        level,
        timestamp: new Date().toISOString(),
        wordCount: (response.data?.response || response.data?.data?.response || response).split(' ').length
      }
    });

  } catch (error) {
    console.error('Notes generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate notes',
      error: error.message
    });
  }
});

// Generate Questions from Notes
router.post('/notes-to-questions', protect, async (req, res) => {
  try {
    const { notes, questionTypes = ['mcq', 'short', 'long'], questionCount = 10, difficulty = 'mixed' } = req.body;

    if (!notes) {
      return res.status(400).json({
        success: false,
        message: 'Notes content is required'
      });
    }

    const typeDescriptions = {
      mcq: 'Multiple Choice Questions (with 4 options and correct answer)',
      short: 'Short Answer Questions (2-3 sentence answers expected)',
      long: 'Long Answer/Essay Questions (detailed explanations required)',
      application: 'Application-based Questions (practical problem-solving)',
      definition: 'Definition Questions (key terms and concepts)'
    };

    const selectedTypes = questionTypes.map(type => typeDescriptions[type] || type).join(', ');

    const prompt = `QUESTION BANK GENERATION MODE: Based on the provided study notes/content, create a comprehensive question bank with ${questionCount} questions.

Generate the following types of questions: ${selectedTypes}

For each question type, follow this format:

MULTIPLE CHOICE QUESTIONS:
Q1: [Question text]
a) [Option A]
b) [Option B] 
c) [Option C]
d) [Option D]
Correct Answer: [Letter] - [Brief explanation]

SHORT ANSWER QUESTIONS:
Q1: [Question text]
Expected Answer: [2-3 sentence model answer]

LONG ANSWER QUESTIONS:
Q1: [Question text]
Key Points to Cover: [List main points student should include]

Make questions at ${difficulty} difficulty level. Ensure questions cover different aspects of the content and test various levels of understanding (recall, comprehension, application, analysis).

Study Notes/Content:
${notes}`;

    const response = await chatCompletion(prompt, '');
    
    res.json({
      success: true,
      data: {
        questionBank: response.data?.response || response,
        questionCount,
        questionTypes,
        difficulty,
        timestamp: new Date().toISOString(),
        sourceWordCount: notes.split(' ').length
      }
    });

  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate questions',
      error: error.message
    });
  }
});

// Get Study Mode Templates
router.get('/templates', protect, async (req, res) => {
  try {
    const templates = {
      questionBank: {
        name: "Question Bank Answering",
        description: "Submit multiple questions and get detailed answers",
        example: {
          questions: [
            "What is photosynthesis and why is it important?",
            "Explain the difference between mitosis and meiosis.",
            "How does the water cycle work?"
          ]
        }
      },
      topicNotes: {
        name: "Topic Notes Generation", 
        description: "Generate comprehensive study notes for any topic",
        example: {
          topic: "Photosynthesis in Plants",
          subject: "Biology",
          level: "high school"
        }
      },
      notesToQuestions: {
        name: "Notes to Question Bank",
        description: "Convert your notes into practice questions",
        example: {
          notes: "Your study notes content here...",
          questionTypes: ["mcq", "short", "long"],
          questionCount: 15
        }
      }
    };

    res.json({
      success: true,
      data: templates
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message
    });
  }
});

export default router;