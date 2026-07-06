import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import GeneratedDocument from '../models/GeneratedDocument.js';
import Document from '../models/Document.js';

const router = express.Router();

// Get all notes for the authenticated user
router.get('/', protect, async (req, res) => {
  try {
    const { documentId, subject, tags, limit = 50, page = 1 } = req.query;
    
    // Build query
    const query = {
      user: req.user.id,
      generationType: 'notes',
      isActive: true
    };
    
    // Filter by document if specified
    if (documentId) {
      query.sourceDocument = documentId;
    }
    
    // Filter by subject if specified
    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }
    
    // Filter by tags if specified
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }
    
    const notes = await GeneratedDocument
      .find(query)
      .populate('sourceDocument', 'title filename fileType')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const totalNotes = await GeneratedDocument.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        notes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalNotes,
          totalPages: Math.ceil(totalNotes / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch notes',
        type: 'Server Error'
      }
    });
  }
});

// Get notes by document ID
router.get('/document/:documentId', protect, async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // Verify the document exists and belongs to the user
    const document = await Document.findOne({
      _id: documentId,
      user: req.user.id
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Document not found',
          type: 'Not Found'
        }
      });
    }
    
    const notes = await GeneratedDocument
      .find({
        sourceDocument: documentId,
        user: req.user.id,
        generationType: 'notes',
        isActive: true
      })
      .populate('sourceDocument', 'title filename fileType')
      .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      data: {
        notes,
        document: {
          id: document._id,
          title: document.title,
          filename: document.filename
        }
      }
    });
  } catch (error) {
    console.error('Get notes by document error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch notes for document',
        type: 'Server Error'
      }
    });
  }
});

// Get a specific note by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    const note = await GeneratedDocument
      .findOne({
        _id: id,
        user: req.user.id,
        generationType: 'notes',
        isActive: true
      })
      .populate('sourceDocument', 'title filename fileType extractedText');
    
    if (!note) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Note not found',
          type: 'Not Found'
        }
      });
    }
    
    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Get note by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch note',
        type: 'Server Error'
      }
    });
  }
});

// Create new notes linked to a document
router.post('/generate/:documentId', protect, [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required'),
  body('subject')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Subject cannot exceed 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('generationPrompt')
    .optional()
    .isString()
], async (req, res) => {
  try {
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
    
    const { documentId } = req.params;
    const { title, content, subject, tags = [], generationPrompt } = req.body;
    
    // Verify the document exists and belongs to the user
    const document = await Document.findOne({
      _id: documentId,
      user: req.user.id
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Document not found',
          type: 'Not Found'
        }
      });
    }
    
    // Calculate content analysis
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
    
    // Count structure elements
    const headers = (content.match(/^#+\s/gm) || []).length;
    const bulletPoints = (content.match(/^[\*\-\+]\s/gm) || []).length;
    const codeBlocks = (content.match(/```/g) || []).length / 2;
    const mathEquations = (content.match(/\$.*?\$/g) || []).length;
    
    // Create the generated notes
    const notes = new GeneratedDocument({
      title,
      content,
      sourceDocument: documentId,
      generationType: 'notes',
      generationMethod: generationPrompt ? 'ai-gemini' : 'manual',
      generationPrompt,
      user: req.user.id,
      subject: subject || document.subject || '',
      tags,
      analysis: {
        wordCount,
        readingTime,
        structure: {
          headers,
          bulletPoints,
          codeBlocks,
          mathEquations
        }
      }
    });
    
    await notes.save();
    
    // Add the notes reference to the document
    await Document.findByIdAndUpdate(documentId, {
      $push: {
        'generatedMaterials.notes': notes._id
      },
      $set: {
        'stats.lastAccessed': new Date()
      }
    });
    
    // Populate the source document info
    await notes.populate('sourceDocument', 'title filename fileType');
    
    res.status(201).json({
      success: true,
      data: notes
    });
  } catch (error) {
    console.error('Create notes error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create notes',
        type: 'Server Error'
      }
    });
  }
});

// Update a note
router.put('/:id', protect, [
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .optional()
    .notEmpty()
    .withMessage('Content cannot be empty'),
  body('subject')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Subject cannot exceed 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
], async (req, res) => {
  try {
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
    
    const { id } = req.params;
    const updates = req.body;
    
    // Calculate new content analysis if content is being updated
    if (updates.content) {
      const wordCount = updates.content.split(/\s+/).filter(word => word.length > 0).length;
      const readingTime = Math.ceil(wordCount / 200);
      
      const headers = (updates.content.match(/^#+\s/gm) || []).length;
      const bulletPoints = (updates.content.match(/^[\*\-\+]\s/gm) || []).length;
      const codeBlocks = (updates.content.match(/```/g) || []).length / 2;
      const mathEquations = (updates.content.match(/\$.*?\$/g) || []).length;
      
      updates.analysis = {
        wordCount,
        readingTime,
        structure: {
          headers,
          bulletPoints,
          codeBlocks,
          mathEquations
        }
      };
    }
    
    const note = await GeneratedDocument
      .findOneAndUpdate(
        {
          _id: id,
          user: req.user.id,
          generationType: 'notes'
        },
        updates,
        { new: true, runValidators: true }
      )
      .populate('sourceDocument', 'title filename fileType');
    
    if (!note) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Note not found',
          type: 'Not Found'
        }
      });
    }
    
    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update note',
        type: 'Server Error'
      }
    });
  }
});

// Delete a note
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    const note = await GeneratedDocument.findOneAndDelete({
      _id: id,
      user: req.user.id,
      generationType: 'notes'
    });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Note not found',
          type: 'Not Found'
        }
      });
    }
    
    // Remove the note reference from the source document
    if (note.sourceDocument) {
      await Document.findByIdAndUpdate(note.sourceDocument, {
        $pull: {
          'generatedMaterials.notes': id
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete note',
        type: 'Server Error'
      }
    });
  }
});

export default router;