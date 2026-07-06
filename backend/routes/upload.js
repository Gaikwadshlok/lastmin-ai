import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { protect } from '../middleware/auth.js';
import Document from '../models/Document.js';
import { extractTextFromFile, validateExtractedText } from '../utils/textExtraction.js';

const router = express.Router();

// ES6 module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, TXT, and image files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter
});

// @desc    Upload document
// @route   POST /api/upload/document
// @access  Private
router.post('/document', protect, upload.single('document'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No file uploaded',
          type: 'Bad Request'
        }
      });
    }

    const { title, description, subject, tags } = req.body;

    // Determine file type
    let fileType;
    switch (req.file.mimetype) {
      case 'application/pdf':
        fileType = 'pdf';
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        fileType = 'docx';
        break;
      case 'text/plain':
        fileType = 'txt';
        break;
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        fileType = 'image';
        break;
      default:
        fileType = 'unknown';
    }

    // Extract text content from the uploaded file
    let extractedText = '';
    let processingStatus = 'pending';
    
    try {
      console.log(`[Upload] 📄 Starting text extraction for ${fileType} file: ${req.file.originalname}`);
      
      if (['pdf', 'docx', 'txt'].includes(fileType)) {
        const rawText = await extractTextFromFile(req.file.path, fileType);
        const { isValid, cleanText } = validateExtractedText(rawText);
        
        if (isValid) {
          extractedText = cleanText;
          processingStatus = 'completed';
          console.log(`[Upload] ✅ Text extraction successful - ${extractedText.length} characters`);
        } else {
          processingStatus = 'failed';
          console.log(`[Upload] ⚠️ Text extraction failed - no meaningful content found`);
        }
      } else {
        processingStatus = 'not_applicable';
        console.log(`[Upload] ℹ️ Text extraction not applicable for file type: ${fileType}`);
      }
    } catch (error) {
      processingStatus = 'failed';
      console.error(`[Upload] ❌ Text extraction error:`, error.message);
    }

    // Create document record with extracted text
    const document = await Document.create({
      title: title || req.file.originalname,
      description: description || '',
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileType: fileType,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      user: req.user.id,
      subject: subject || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      extractedText: extractedText,
      processingStatus: processingStatus
    });

    // Update user document count
    req.user.studyStats.documentsUploaded += 1;
    await req.user.save();

    console.log(`[Upload] 📊 Document created with processing status: ${processingStatus}`);
    if (extractedText.length > 0) {
      console.log(`[Upload] 📝 Extracted text preview: ${extractedText.substring(0, 200)}...`);
    }

    res.status(201).json({
      success: true,
      message: 'Document uploaded and processed successfully',
      data: {
        document: {
          id: document._id,
          title: document.title,
          description: document.description,
          filename: document.filename,
          originalName: document.originalName,
          fileType: document.fileType,
          fileSize: document.fileSize,
          fileSizeFormatted: document.fileSizeFormatted,
          subject: document.subject,
          tags: document.tags,
          processingStatus: document.processingStatus,
          uploadedAt: document.uploadedAt,
          hasExtractedText: extractedText.length > 0,
          extractedTextLength: extractedText.length
        }
      }
    });
  } catch (error) {
    // Clean up uploaded file if database operation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

// @desc    Get user documents
// @route   GET /api/upload/documents
// @access  Private
router.get('/documents', protect, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    // Build filter
    const filter = { user: req.user.id, isActive: true };
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.fileType) filter.fileType = req.query.fileType;
    if (req.query.tags) filter.tags = { $in: req.query.tags.split(',') };

    const documents = await Document.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .select('-filePath'); // Don't expose file system path

    const total = await Document.countDocuments(filter);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get document by ID
// @route   GET /api/upload/documents/:id
// @access  Private
router.get('/documents/:id', protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('user', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Document not found',
          type: 'Not Found'
        }
      });
    }

    // Check if user owns document or if it's public
    if (document.user._id.toString() !== req.user.id && !document.isPublic) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to access this document',
          type: 'Forbidden'
        }
      });
    }

    // Increment view count
    await document.incrementView();

    res.json({
      success: true,
      data: { document }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update document
// @route   PUT /api/upload/documents/:id
// @access  Private
router.put('/documents/:id', protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Document not found',
          type: 'Not Found'
        }
      });
    }

    // Check if user owns document
    if (document.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to update this document',
          type: 'Forbidden'
        }
      });
    }

    const { title, description, subject, tags, isPublic } = req.body;

    // Update allowed fields
    if (title) document.title = title;
    if (description !== undefined) document.description = description;
    if (subject !== undefined) document.subject = subject;
    if (tags) document.tags = tags.split(',').map(tag => tag.trim());
    if (isPublic !== undefined) document.isPublic = isPublic;

    await document.save();

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: { document }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Re-process document text extraction
// @route   POST /api/upload/documents/:id/reprocess
// @access  Private
router.post('/documents/:id/reprocess', protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Document not found',
          type: 'Not Found'
        }
      });
    }

    // Check if user owns the document
    if (document.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          type: 'Forbidden'
        }
      });
    }

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Original file not found on server',
          type: 'Not Found'
        }
      });
    }

    // Re-extract text
    let extractedText = '';
    let processingStatus = 'pending';
    
    try {
      console.log(`[Reprocess] 🔄 Re-extracting text for: ${document.originalName}`);
      
      if (['pdf', 'docx', 'txt'].includes(document.fileType)) {
        const rawText = await extractTextFromFile(document.filePath, document.fileType);
        const { isValid, cleanText } = validateExtractedText(rawText);
        
        if (isValid) {
          extractedText = cleanText;
          processingStatus = 'completed';
          console.log(`[Reprocess] ✅ Re-extraction successful - ${extractedText.length} characters`);
        } else {
          processingStatus = 'failed';
          console.log(`[Reprocess] ⚠️ Re-extraction failed - no meaningful content found`);
        }
      } else {
        processingStatus = 'not_applicable';
      }
    } catch (error) {
      processingStatus = 'failed';
      console.error(`[Reprocess] ❌ Re-extraction error:`, error.message);
    }

    // Update document with new extracted text
    document.extractedText = extractedText;
    document.processingStatus = processingStatus;
    document.lastModified = new Date();
    await document.save();

    res.json({
      success: true,
      message: 'Document reprocessed successfully',
      data: {
        processingStatus,
        hasExtractedText: extractedText.length > 0,
        extractedTextLength: extractedText.length
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Delete document
// @route   DELETE /api/upload/documents/:id
// @access  Private
router.delete('/documents/:id', protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Document not found',
          type: 'Not Found'
        }
      });
    }

    // Check if user owns document
    if (document.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to delete this document',
          type: 'Forbidden'
        }
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete document from database
    await Document.findByIdAndDelete(req.params.id);

    // Update user document count
    req.user.studyStats.documentsUploaded = Math.max(0, req.user.studyStats.documentsUploaded - 1);
    await req.user.save();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Download document
// @route   GET /api/upload/documents/:id/download
// @access  Private
router.get('/documents/:id/download', protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Document not found',
          type: 'Not Found'
        }
      });
    }

    // Check if user owns document or if it's public
    if (document.user.toString() !== req.user.id && !document.isPublic) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to download this document',
          type: 'Forbidden'
        }
      });
    }

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'File not found on server',
          type: 'File Not Found'
        }
      });
    }

    // Increment download count
    await document.incrementDownload();

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimeType);

    // Stream file to response
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

export default router;
