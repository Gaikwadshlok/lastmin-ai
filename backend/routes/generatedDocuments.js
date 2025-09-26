import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import GeneratedDocument from '../models/GeneratedDocument.js';
import Document from '../models/Document.js';
import { chatCompletion, analyze, summarize, quizQuestions } from '../services/aiService.js';

const router = express.Router();

// @desc    Get user's generated documents
// @route   GET /api/generated-documents
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      generationType,
      status,
      subject,
      search,
      tags,
      sourceDocument,
      sortBy = 'lastModified',
      sortOrder = 'desc',
      isPinned
    } = req.query;

    const options = {
      generationType,
      status,
      subject,
      tags: tags ? tags.split(',') : undefined,
      sourceDocument
    };

    // Remove undefined values
    Object.keys(options).forEach(key => 
      options[key] === undefined && delete options[key]
    );

    let query = GeneratedDocument.findByUser(req.user.id, options);

    // Add search if provided
    if (search) {
      query = query.find({
        $text: { $search: search }
      });
    }

    // Add pinned filter
    if (isPinned !== undefined) {
      query = query.find({ isPinned: isPinned === 'true' });
    }

    // Apply sorting
    const sortObj = {};
    if (sortBy !== 'isPinned') { // isPinned is handled in findByUser
      sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
      query = query.sort(sortObj);
    }

    // Execute query with pagination
    const startIndex = (page - 1) * limit;
    const documents = await query
      .skip(startIndex)
      .limit(parseInt(limit))
      .exec();

    // Get total count for pagination
    const total = await GeneratedDocument.countDocuments({
      user: req.user.id,
      isActive: true,
      ...options
    });

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalDocuments: total,
          hasNext: startIndex + documents.length < total,
          hasPrev: startIndex > 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get generated document by ID
// @route   GET /api/generated-documents/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const document = await GeneratedDocument.findById(req.params.id)
      .populate('user', 'name email')
      .populate('sourceDocument', 'title originalName fileType fileSizeFormatted');

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Generated document not found',
          type: 'Not Found'
        }
      });
    }

    // Check permissions
    const hasAccess = document.user._id.toString() === req.user.id || 
                     document.sharedWith.some(share => share.user.toString() === req.user.id) ||
                     document.isPublic;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          type: 'Forbidden'
        }
      });
    }

    // Increment view count
    await document.incrementView();

    res.json({
      success: true,
      data: { 
        document: {
          ...document.toJSON(),
          isOwner: document.user._id.toString() === req.user.id,
          canEdit: document.user._id.toString() === req.user.id || 
                  document.sharedWith.some(share => 
                    share.user.toString() === req.user.id && share.permission === 'edit'
                  )
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Generate document from source
// @route   POST /api/generated-documents/generate
// @access  Private
router.post('/generate', protect, [
  body('sourceDocumentId')
    .notEmpty()
    .withMessage('Source document ID is required'),
  body('generationType')
    .isIn(['notes', 'summary', 'flashcards', 'quiz', 'outline'])
    .withMessage('Invalid generation type'),
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('generationPrompt')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Generation prompt cannot exceed 1000 characters')
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
      sourceDocumentId, 
      generationType, 
      title, 
      subject,
      tags = [],
      generationPrompt,
      generationMethod = 'ai-gemini'
    } = req.body;

    // Verify source document exists and user has access
    const sourceDocument = await Document.findById(sourceDocumentId);
    if (!sourceDocument) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Source document not found',
          type: 'Not Found'
        }
      });
    }

    if (sourceDocument.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied to source document',
          type: 'Forbidden'
        }
      });
    }

    // Create initial generated document with generating status
    const generatedDocument = new GeneratedDocument({
      title: title || `${generationType.charAt(0).toUpperCase() + generationType.slice(1)} - ${sourceDocument.originalName}`,
      content: '', // Will be filled by AI
      sourceDocument: sourceDocumentId,
      generationType,
      generationMethod,
      generationPrompt,
      user: req.user.id,
      subject: subject || sourceDocument.subject,
      tags: [...tags, 'ai-generated', generationType],
      status: 'generating'
    });

    await generatedDocument.save();

    // Start AI generation process (asynchronous)
    try {
      // In a real implementation, this would call your AI service
      // For now, we'll simulate the process
      let generatedContent = '';
      
      switch (generationType) {
        case 'notes':
          generatedContent = generateSampleNotes(sourceDocument);
          break;
        case 'summary':
          generatedContent = generateSampleSummary(sourceDocument);
          break;
        case 'outline':
          generatedContent = generateSampleOutline(sourceDocument);
          break;
        default:
          generatedContent = `Generated ${generationType} content for ${sourceDocument.originalName}`;
      }

      // Update document with generated content
      generatedDocument.content = generatedContent;
      generatedDocument.status = 'completed';
      generatedDocument.generatedAt = new Date();
      generatedDocument.quality.aiConfidence = 0.85;
      generatedDocument.quality.completeness = 0.9;

      await generatedDocument.save();

      // Update source document to reference this generated document
      if (!sourceDocument.generatedMaterials[generationType + 's']) {
        sourceDocument.generatedMaterials[generationType + 's'] = [];
      }
      sourceDocument.generatedMaterials[generationType + 's'].push(generatedDocument._id);
      await sourceDocument.save();

    } catch (aiError) {
      // Handle AI generation failure
      generatedDocument.status = 'failed';
      generatedDocument.processingError = aiError.message;
      await generatedDocument.save();
    }

    res.status(201).json({
      success: true,
      data: { 
        document: generatedDocument,
        message: 'Document generation started successfully'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions for sample generation
function generateSampleNotes(sourceDocument) {
  return `# Study Notes: ${sourceDocument.originalName}

## Overview
This document contains comprehensive study notes generated from your uploaded file.

## Key Concepts
- Main topics extracted from the source material
- Important definitions and explanations
- Key points for exam preparation

## Detailed Analysis
${sourceDocument.extractedText ? 
  sourceDocument.extractedText.substring(0, 500) + '...' : 
  'Content analysis based on document structure and metadata'}

## Study Questions
1. What are the main concepts covered in this material?
2. How do the different topics relate to each other?
3. What are the practical applications of this knowledge?

## Summary
These notes provide a structured overview of the material for effective studying and review.

---
*Generated on ${new Date().toLocaleDateString()} using AI analysis*`;
}

function generateSampleSummary(sourceDocument) {
  return `# Summary: ${sourceDocument.originalName}

## Executive Summary
This document summarizes the key points from the uploaded material.

## Main Points
- Core concepts and ideas
- Essential information for quick review
- Critical takeaways

## Conclusion
${sourceDocument.extractedText ? 
  'Based on the analysis of the source material...' : 
  'Summary generated from document structure and metadata'}

---
*Generated on ${new Date().toLocaleDateString()} using AI analysis*`;
}

function generateSampleOutline(sourceDocument) {
  return `# Outline: ${sourceDocument.originalName}

## I. Introduction
   A. Background information
   B. Purpose and scope

## II. Main Content Areas
   A. Primary concepts
   B. Secondary topics
   C. Supporting details

## III. Key Insights
   A. Important findings
   B. Critical analysis

## IV. Conclusion
   A. Summary of main points
   B. Implications and applications

---
*Generated on ${new Date().toLocaleDateString()} using AI analysis*`;
}

// @desc    Update generated document
// @route   PUT /api/generated-documents/:id
// @access  Private
router.put('/:id', protect, [
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .optional()
    .notEmpty()
    .withMessage('Content cannot be empty')
], async (req, res, next) => {
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

    const document = await GeneratedDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Generated document not found',
          type: 'Not Found'
        }
      });
    }

    // Check permissions
    const canEdit = document.user.toString() === req.user.id || 
                   document.sharedWith.some(share => 
                     share.user.toString() === req.user.id && share.permission === 'edit'
                   );

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          type: 'Forbidden'
        }
      });
    }

    // Create version if content is being changed
    if (req.body.content && req.body.content !== document.content) {
      await document.createVersion(req.body.changeDescription || `Version ${document.version + 1}`);
    }

    // Update document
    Object.assign(document, req.body);
    await document.save();

    res.json({
      success: true,
      data: { document }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete generated document
// @route   DELETE /api/generated-documents/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const document = await GeneratedDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Generated document not found',
          type: 'Not Found'
        }
      });
    }

    // Only owner can delete
    if (document.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Only the document owner can delete this document',
          type: 'Forbidden'
        }
      });
    }

    // Soft delete
    document.isActive = false;
    await document.save();

    // Remove reference from source document
    const sourceDoc = await Document.findById(document.sourceDocument);
    if (sourceDoc) {
      const materialType = document.generationType + 's';
      if (sourceDoc.generatedMaterials[materialType]) {
        sourceDoc.generatedMaterials[materialType] = 
          sourceDoc.generatedMaterials[materialType].filter(id => 
            id.toString() !== document._id.toString()
          );
        await sourceDoc.save();
      }
    }

    res.json({
      success: true,
      data: { message: 'Generated document deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get documents by source document
// @route   GET /api/generated-documents/source/:sourceDocId
// @access  Private
router.get('/source/:sourceDocId', protect, async (req, res, next) => {
  try {
    const documents = await GeneratedDocument.findBySourceDocument(
      req.params.sourceDocId, 
      req.user.id
    );

    res.json({
      success: true,
      data: { documents }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Toggle pin status
// @route   PATCH /api/generated-documents/:id/pin
// @access  Private
router.patch('/:id/pin', protect, async (req, res, next) => {
  try {
    const document = await GeneratedDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Generated document not found',
          type: 'Not Found'
        }
      });
    }

    if (document.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Only the document owner can pin/unpin this document',
          type: 'Forbidden'
        }
      });
    }

    document.isPinned = !document.isPinned;
    await document.save();

    res.json({
      success: true,
      data: { 
        document,
        message: `Document ${document.isPinned ? 'pinned' : 'unpinned'} successfully`
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user statistics
// @route   GET /api/generated-documents/stats
// @access  Private
router.get('/stats', protect, async (req, res, next) => {
  try {
    const stats = await GeneratedDocument.getStatsByUser(req.user.id);
    
    res.json({
      success: true,
      data: { stats: stats[0] || {} }
    });
  } catch (error) {
    next(error);
  }
});

export default router;