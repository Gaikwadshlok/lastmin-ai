import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import GeneratedDocument from '../models/GeneratedDocument.js';
import Document from '../models/Document.js';
import { chatCompletion, analyze, summarize, quizQuestions } from '../services/aiService.js';
import { searchWeb } from '../services/webScraper.js';

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
    .optional(),
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

    // Verify source document exists and user has access (if sourceDocumentId is provided)
    let sourceDocument = null;
    if (sourceDocumentId) {
      sourceDocument = await Document.findById(sourceDocumentId);
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
    }

    // Generate content using AI service or use provided content
    let generatedContent = '';
    
    try {
      // Check if content is provided directly (from Study Hub)
      if (req.body.content) {
        generatedContent = req.body.content;
      } else if (sourceDocument) {
        // Generate content based on type using AI for document-based generation
        switch (generationType) {
          case 'notes':
            generatedContent = await generateSampleNotes(sourceDocument);
            break;
          case 'summary':
            generatedContent = await generateSampleSummary(sourceDocument);
            break;
          case 'outline':
            generatedContent = await generateSampleOutline(sourceDocument);
            break;
          default:
            generatedContent = `Generated ${generationType} content for ${sourceDocument.originalName}`;
        }
      } else {
        // For standalone generation without source document
        generatedContent = `Generated ${generationType} content: ${title}`;
      }

      // Create generated document with content already generated
      const generatedDocument = new GeneratedDocument({
        title: title || (sourceDocument ? 
          `${generationType.charAt(0).toUpperCase() + generationType.slice(1)} - ${sourceDocument.originalName}` :
          `${generationType.charAt(0).toUpperCase() + generationType.slice(1)} - Generated Content`
        ),
        content: generatedContent,
        sourceDocument: sourceDocumentId || undefined,
        generationType,
        generationMethod,
        generationPrompt,
        user: req.user.id,
        subject: subject || (sourceDocument ? sourceDocument.subject : 'General'),
        tags: [...tags, 'ai-generated', generationType],
        status: 'completed',
        generatedAt: new Date(),
        quality: {
          aiConfidence: 0.85,
          completeness: 0.9
        }
      });

      await generatedDocument.save();

      // Update source document to reference this generated document (only if source exists)
      if (sourceDocument) {
        if (!sourceDocument.generatedMaterials[generationType + 's']) {
          sourceDocument.generatedMaterials[generationType + 's'] = [];
        }
        sourceDocument.generatedMaterials[generationType + 's'].push(generatedDocument._id);
        await sourceDocument.save();
      }

      res.status(201).json({
        success: true,
        data: { 
          document: generatedDocument,
          message: 'Document generation completed successfully'
        }
      });

    } catch (aiError) {
      console.error('AI generation error:', aiError);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to generate content',
          type: 'AI Generation Error'
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// Helper functions for AI-powered generation with web research
async function generateSampleNotes(sourceDocument) {
  try {
    if (!sourceDocument.extractedText || sourceDocument.extractedText.trim().length === 0) {
      return `# Study Notes: ${sourceDocument.originalName}

## 📄 Document Processing Status
**Processing Status:** ${sourceDocument.processingStatus || 'Unknown'}

## ⚠️ No Text Content Available
No text content was extracted from this document. This may be because:

### Possible Reasons:
- 📸 **Image-based PDF**: Document contains scanned images rather than selectable text
- 🔒 **Protected Document**: File is encrypted or password-protected
- 📱 **Unsupported Format**: File format may not support text extraction
- 🔧 **Processing Error**: Text extraction failed during upload

### Recommended Solutions:
1. **Re-upload**: Try uploading the document again
2. **Convert Format**: Convert scanned PDFs to text-searchable PDFs using OCR tools
3. **Text Format**: Upload as .txt or .docx format if possible
4. **Manual Input**: Copy and paste the content into Study Hub for generation

### Alternative Options:
- Use **Topic Notes** in Study Hub to generate content on the subject
- Upload a different version of the document
- Contact support if the issue persists

---
*Generated on ${new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}*`;
    }

    console.log(`[Notes] 🔍 Generating enhanced notes with web research for: ${sourceDocument.originalName}`);

    // Step 1: Extract key topics from the document
    const topicExtractionPrompt = `Analyze the following document and identify 2-3 main topics or key concepts that would benefit from additional web research for comprehensive study notes:

Document: ${sourceDocument.originalName}
Content: ${sourceDocument.extractedText.slice(0, 4000)}

Return only the main topics as a simple list, one per line, without explanations. Focus on concepts that students would need current, detailed explanations for.`;

    const topicsResponse = await chatCompletion(topicExtractionPrompt);
    const topics = topicsResponse.split('\n').filter(topic => topic.trim().length > 0).slice(0, 3);
    
    console.log(`[Notes] 📚 Identified topics for research:`, topics);

    // Step 2: Research each topic on the web
    let webResearchContent = '';
    const researchedTopics = [];

    for (const topic of topics) {
      try {
        console.log(`[Notes] 🌐 Researching: ${topic.trim()}`);
        const searchQuery = topic.trim().replace(/^[-•]\s*/, ''); // Remove bullet points
        const webResult = await searchWeb(searchQuery);
        
        if (webResult && webResult.success && webResult.content) {
          researchedTopics.push({
            topic: searchQuery,
            content: webResult.content.substring(0, 1000), // Limit content length
            source: webResult.url
          });
          console.log(`[Notes] ✅ Found web content for: ${searchQuery}`);
        } else {
          console.log(`[Notes] ⚠️ No web content found for: ${searchQuery}`);
        }
      } catch (error) {
        console.log(`[Notes] ❌ Web research failed for "${topic}": ${error.message}`);
      }
    }

    // Step 3: Create web research section
    if (researchedTopics.length > 0) {
      webResearchContent = '\n\n## 🌐 Enhanced Information from Web Research\n\n';
      researchedTopics.forEach((research, index) => {
        webResearchContent += `### ${index + 1}. ${research.topic}\n`;
        webResearchContent += `${research.content}\n`;
        webResearchContent += `*Source: ${research.source}*\n\n`;
      });
    }

    // Step 4: Generate comprehensive notes combining document + web research
    const enhancedPrompt = `Create comprehensive study notes combining the document content with additional web research. Structure the notes for effective learning:

**Original Document:** ${sourceDocument.originalName}
**Document Content:** ${sourceDocument.extractedText.slice(0, 6000)}

**Additional Web Research:**
${researchedTopics.map(r => `${r.topic}: ${r.content.substring(0, 500)}`).join('\n\n')}

Create detailed study notes with:
1. Clear overview and introduction
2. Key concepts with enhanced explanations
3. Important details and definitions
4. Practical examples and applications
5. Study questions and review points
6. Integration of web research insights

Make the notes comprehensive, accurate, and study-focused.`;

    const aiResponse = await chatCompletion(enhancedPrompt);
    
    // Step 5: Combine everything into final notes
    let finalNotes = `# 📚 Enhanced Study Notes: ${sourceDocument.originalName}\n\n`;
    finalNotes += aiResponse;
    
    if (researchedTopics.length > 0) {
      finalNotes += webResearchContent;
      finalNotes += '\n---\n';
      finalNotes += `*Generated on ${new Date().toLocaleDateString()} using AI analysis + web research*\n`;
      finalNotes += `*Document source: ${sourceDocument.originalName} (${Math.round(sourceDocument.extractedText.length / 1000)}k characters)*\n`;
      finalNotes += `*Web sources: ${researchedTopics.map(r => r.source).join(', ')}*`;
    } else {
      finalNotes += '\n---\n';
      finalNotes += `*Generated on ${new Date().toLocaleDateString()} using AI analysis*\n`;
      finalNotes += `*Source: ${sourceDocument.originalName} (${Math.round(sourceDocument.extractedText.length / 1000)}k characters)*\n`;
      finalNotes += '*Note: Web research was attempted but no additional sources were accessible.*';
    }

    console.log(`[Notes] ✅ Generated enhanced notes with ${researchedTopics.length} web sources`);
    return finalNotes;

  } catch (error) {
    console.error('Error generating enhanced notes:', error);
    // Fallback to basic notes if AI fails
    return `# Study Notes: ${sourceDocument.originalName}

## Content Summary
${sourceDocument.extractedText ? sourceDocument.extractedText.substring(0, 1000) + '...' : 'No content available'}

## Key Points
This document contains important information that can be studied for better understanding of the subject matter.

*Note: Enhanced AI generation encountered an issue. Showing basic content extraction.*

---
*Generated on ${new Date().toLocaleDateString()}*`;
  }
}

async function generateSampleSummary(sourceDocument) {
  try {
    if (!sourceDocument.extractedText || sourceDocument.extractedText.trim().length === 0) {
      return `# Summary: ${sourceDocument.originalName}

## Notice
No text content available for summarization.

---
*Generated on ${new Date().toLocaleDateString()}*`;
    }

    console.log(`[Summary] 🔍 Generating enhanced summary with web verification for: ${sourceDocument.originalName}`);

    // Generate initial AI summary
    const aiSummary = await summarize(sourceDocument.extractedText, 'detailed');
    
    // Extract one key topic for web verification
    const verificationPrompt = `From this summary, identify the single most important topic that would benefit from current web information for accuracy:

Summary: ${aiSummary.substring(0, 1000)}

Return only the main topic name, no explanations.`;

    const keyTopic = await chatCompletion(verificationPrompt);
    
    // Try to get current web information for verification
    let webVerification = '';
    try {
      console.log(`[Summary] 🌐 Verifying topic: ${keyTopic.trim()}`);
      const webResult = await searchWeb(keyTopic.trim());
      
      if (webResult && webResult.success && webResult.content) {
        webVerification = `\n\n## 🔍 Current Information Verification\n\n**Topic:** ${keyTopic.trim()}\n\n${webResult.content.substring(0, 600)}...\n\n*Verified from: ${webResult.url}*`;
        console.log(`[Summary] ✅ Added web verification for: ${keyTopic.trim()}`);
      }
    } catch (error) {
      console.log(`[Summary] ⚠️ Web verification failed: ${error.message}`);
    }
    
    return `# 📄 Enhanced Summary: ${sourceDocument.originalName}

${aiSummary}${webVerification}

---
*Generated on ${new Date().toLocaleDateString()} using AI analysis${webVerification ? ' + web verification' : ''}*
*Source: ${sourceDocument.originalName}*`;

  } catch (error) {
    console.error('Error generating enhanced summary:', error);
    return `# Summary: ${sourceDocument.originalName}

## Content Overview
${sourceDocument.extractedText ? sourceDocument.extractedText.substring(0, 800) + '...' : 'No content available'}

*Note: Enhanced AI generation encountered an issue. Showing basic content.*

---
*Generated on ${new Date().toLocaleDateString()}*`;
  }
}

async function generateSampleOutline(sourceDocument) {
  try {
    if (!sourceDocument.extractedText || sourceDocument.extractedText.trim().length === 0) {
      return `# Outline: ${sourceDocument.originalName}

## Notice
No text content available for outline generation.

---
*Generated on ${new Date().toLocaleDateString()}*`;
    }

    const prompt = `Create a detailed outline from the following document content. Structure it with clear hierarchical organization using roman numerals, letters, and numbers:

Document: ${sourceDocument.originalName}
Content: ${sourceDocument.extractedText.slice(0, 6000)}

Create a comprehensive outline that captures the main structure and key topics of the document.`;

    const aiOutline = await chatCompletion(prompt);
    
    return `# Outline: ${sourceDocument.originalName}

${aiOutline}

---
*Generated on ${new Date().toLocaleDateString()} using AI analysis*
*Source: ${sourceDocument.originalName}*`;

  } catch (error) {
    console.error('Error generating AI outline:', error);
    return `# Outline: ${sourceDocument.originalName}

## I. Main Content
   A. Key topics from the document
   B. Important concepts covered

## II. Supporting Details
   A. Additional information
   B. Related concepts

*Note: AI generation encountered an issue. Showing basic structure.*

---
*Generated on ${new Date().toLocaleDateString()}*`;
  }
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