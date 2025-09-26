import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Mock notes storage - in production, this would use MongoDB
let notes = [
  {
    id: '1',
    title: 'Introduction to Calculus',
    content: '# Introduction to Calculus\n\nCalculus is a branch of mathematics focused on limits, functions, derivatives, integrals, and infinite series.\n\n## Key Concepts:\n- Derivatives: Rate of change\n- Integrals: Area under curves\n- Limits: Approaching values\n\n## Applications:\n- Physics: Motion and forces\n- Economics: Optimization\n- Engineering: Design and analysis',
    subject: 'Mathematics',
    tags: ['calculus', 'derivatives', 'integrals', 'limits'],
    documentId: null, // Not linked to a document
    userId: 'user123',
    isPublic: false,
    isPinned: true,
    lastModified: new Date('2024-01-20'),
    createdAt: new Date('2024-01-15'),
    wordCount: 89,
    readingTime: 1, // minutes
    version: 1,
    collaborators: [],
    shareSettings: {
      allowComments: false,
      allowEditing: false,
      expiresAt: null
    }
  },
  {
    id: '2',
    title: 'Study Notes - Chapter 5',
    content: '## Chapter 5: Data Structures\n\n### Arrays\n- Fixed size collection\n- Indexed access: O(1)\n- Insertion/Deletion: O(n)\n\n### Linked Lists\n- Dynamic size\n- Sequential access: O(n)\n- Insertion/Deletion: O(1) at known position\n\n### Trees\n- Hierarchical structure\n- Binary trees, BST, AVL\n- Search: O(log n) for balanced trees',
    subject: 'Computer Science',
    tags: ['data-structures', 'arrays', 'linked-lists', 'trees'],
    documentId: 'doc123',
    userId: 'user123',
    isPublic: true,
    isPinned: false,
    lastModified: new Date('2024-01-18'),
    createdAt: new Date('2024-01-18'),
    wordCount: 67,
    readingTime: 1,
    version: 2,
    collaborators: ['user456'],
    shareSettings: {
      allowComments: true,
      allowEditing: false,
      expiresAt: new Date('2024-12-31')
    }
  }
];

let noteVersions = [
  {
    id: '1',
    noteId: '2',
    version: 1,
    content: '## Chapter 5: Data Structures\n\n### Arrays\n- Fixed size collection\n- Indexed access: O(1)',
    modifiedBy: 'user123',
    modifiedAt: new Date('2024-01-18'),
    changeDescription: 'Initial version'
  }
];

// @desc    Get user's notes
// @route   GET /api/notes
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      subject,
      search,
      tags,
      documentId,
      sortBy = 'lastModified',
      sortOrder = 'desc',
      isPinned,
      isPublic
    } = req.query;

    let userNotes = notes.filter(note => 
      note.userId === req.user.id || 
      note.collaborators.includes(req.user.id) ||
      (note.isPublic && isPublic === 'true')
    );

    // Apply filters
    if (subject) {
      userNotes = userNotes.filter(note => 
        note.subject.toLowerCase().includes(subject.toLowerCase())
      );
    }

    if (search) {
      userNotes = userNotes.filter(note =>
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (tags) {
      const tagArray = tags.split(',');
      userNotes = userNotes.filter(note =>
        tagArray.some(tag => note.tags.includes(tag.trim()))
      );
    }

    if (documentId) {
      userNotes = userNotes.filter(note => note.documentId === documentId);
    }

    if (isPinned !== undefined) {
      userNotes = userNotes.filter(note => note.isPinned === (isPinned === 'true'));
    }

    // Sort notes
    userNotes.sort((a, b) => {
      // Always show pinned notes first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
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
    const paginatedNotes = userNotes.slice(startIndex, endIndex);

    // Return summary for list view (not full content)
    const noteSummaries = paginatedNotes.map(note => ({
      id: note.id,
      title: note.title,
      subject: note.subject,
      tags: note.tags,
      documentId: note.documentId,
      isPublic: note.isPublic,
      isPinned: note.isPinned,
      lastModified: note.lastModified,
      createdAt: note.createdAt,
      wordCount: note.wordCount,
      readingTime: note.readingTime,
      version: note.version,
      collaborators: note.collaborators,
      preview: note.content.substring(0, 200) + (note.content.length > 200 ? '...' : ''),
      isOwner: note.userId === req.user.id
    }));

    res.json({
      success: true,
      data: {
        notes: noteSummaries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(userNotes.length / limit),
          totalNotes: userNotes.length,
          hasNext: endIndex < userNotes.length,
          hasPrev: startIndex > 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get note by ID
// @route   GET /api/notes/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const note = notes.find(n => n.id === req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Note not found',
          type: 'Not Found'
        }
      });
    }

    // Check permissions
    const hasAccess = note.userId === req.user.id || 
                     note.collaborators.includes(req.user.id) ||
                     note.isPublic;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          type: 'Forbidden'
        }
      });
    }

    res.json({
      success: true,
      data: { 
        note: {
          ...note,
          isOwner: note.userId === req.user.id,
          canEdit: note.userId === req.user.id || 
                  (note.collaborators.includes(req.user.id) && note.shareSettings.allowEditing)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
router.post('/', protect, [
  body('title')
    .notEmpty()
    .withMessage('Note title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .notEmpty()
    .withMessage('Note content is required'),
  body('subject')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Subject cannot exceed 50 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('documentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid document ID'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
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
      content,
      subject = 'General',
      tags = [],
      documentId = null,
      isPublic = false,
      isPinned = false
    } = req.body;

    // Calculate word count and reading time
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

    const newNote = {
      id: String(notes.length + 1),
      title,
      content,
      subject,
      tags: Array.isArray(tags) ? tags : [],
      documentId,
      userId: req.user.id,
      isPublic,
      isPinned,
      lastModified: new Date(),
      createdAt: new Date(),
      wordCount,
      readingTime,
      version: 1,
      collaborators: [],
      shareSettings: {
        allowComments: false,
        allowEditing: false,
        expiresAt: null
      }
    };

    notes.push(newNote);

    res.status(201).json({
      success: true,
      data: { note: newNote }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
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
    .isLength({ max: 50 })
    .withMessage('Subject cannot exceed 50 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
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

    const noteIndex = notes.findIndex(n => n.id === req.params.id);

    if (noteIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Note not found',
          type: 'Not Found'
        }
      });
    }

    const note = notes[noteIndex];

    // Check permissions
    const canEdit = note.userId === req.user.id || 
                   (note.collaborators.includes(req.user.id) && note.shareSettings.allowEditing);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          type: 'Forbidden'
        }
      });
    }

    // Save current version if content is being changed
    if (req.body.content && req.body.content !== note.content) {
      noteVersions.push({
        id: String(noteVersions.length + 1),
        noteId: note.id,
        version: note.version,
        content: note.content,
        modifiedBy: req.user.id,
        modifiedAt: note.lastModified,
        changeDescription: req.body.changeDescription || `Version ${note.version}`
      });
    }

    // Update note
    const updates = req.body;
    const updatedNote = { ...note, ...updates };

    // Recalculate word count and reading time if content changed
    if (updates.content) {
      updatedNote.wordCount = updates.content.split(/\s+/).length;
      updatedNote.readingTime = Math.ceil(updatedNote.wordCount / 200);
      updatedNote.version = note.version + 1;
    }

    updatedNote.lastModified = new Date();

    notes[noteIndex] = updatedNote;

    res.json({
      success: true,
      data: { note: updatedNote }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const noteIndex = notes.findIndex(n => n.id === req.params.id);

    if (noteIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Note not found',
          type: 'Not Found'
        }
      });
    }

    const note = notes[noteIndex];

    // Only owner can delete notes
    if (note.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Only the note owner can delete this note',
          type: 'Forbidden'
        }
      });
    }

    // Remove note and its versions
    notes.splice(noteIndex, 1);
    noteVersions = noteVersions.filter(v => v.noteId !== req.params.id);

    res.json({
      success: true,
      data: { message: 'Note deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Toggle note pin status
// @route   PATCH /api/notes/:id/pin
// @access  Private
router.patch('/:id/pin', protect, async (req, res, next) => {
  try {
    const noteIndex = notes.findIndex(n => n.id === req.params.id);

    if (noteIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Note not found',
          type: 'Not Found'
        }
      });
    }

    const note = notes[noteIndex];

    // Only owner can pin/unpin notes
    if (note.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Only the note owner can pin/unpin this note',
          type: 'Forbidden'
        }
      });
    }

    notes[noteIndex].isPinned = !note.isPinned;
    notes[noteIndex].lastModified = new Date();

    res.json({
      success: true,
      data: { 
        note: notes[noteIndex],
        message: `Note ${notes[noteIndex].isPinned ? 'pinned' : 'unpinned'} successfully`
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Share note / Update sharing settings
// @route   PATCH /api/notes/:id/share
// @access  Private
router.patch('/:id/share', protect, [
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('collaborators')
    .optional()
    .isArray()
    .withMessage('Collaborators must be an array'),
  body('shareSettings.allowComments')
    .optional()
    .isBoolean()
    .withMessage('allowComments must be a boolean'),
  body('shareSettings.allowEditing')
    .optional()
    .isBoolean()
    .withMessage('allowEditing must be a boolean'),
  body('shareSettings.expiresAt')
    .optional()
    .isISO8601()
    .withMessage('expiresAt must be a valid date')
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

    const noteIndex = notes.findIndex(n => n.id === req.params.id);

    if (noteIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Note not found',
          type: 'Not Found'
        }
      });
    }

    const note = notes[noteIndex];

    // Only owner can modify sharing settings
    if (note.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Only the note owner can modify sharing settings',
          type: 'Forbidden'
        }
      });
    }

    const { isPublic, collaborators, shareSettings } = req.body;

    if (isPublic !== undefined) {
      notes[noteIndex].isPublic = isPublic;
    }

    if (collaborators !== undefined) {
      notes[noteIndex].collaborators = collaborators;
    }

    if (shareSettings) {
      notes[noteIndex].shareSettings = { ...note.shareSettings, ...shareSettings };
    }

    notes[noteIndex].lastModified = new Date();

    res.json({
      success: true,
      data: { 
        note: notes[noteIndex],
        message: 'Sharing settings updated successfully'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get note versions
// @route   GET /api/notes/:id/versions
// @access  Private
router.get('/:id/versions', protect, async (req, res, next) => {
  try {
    const note = notes.find(n => n.id === req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Note not found',
          type: 'Not Found'
        }
      });
    }

    // Check permissions
    const hasAccess = note.userId === req.user.id || 
                     note.collaborators.includes(req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          type: 'Forbidden'
        }
      });
    }

    const versions = noteVersions
      .filter(v => v.noteId === req.params.id)
      .sort((a, b) => b.version - a.version);

    res.json({
      success: true,
      data: { versions }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get notes statistics
// @route   GET /api/notes/stats
// @access  Private
router.get('/stats/overview', protect, async (req, res, next) => {
  try {
    const userNotes = notes.filter(note => note.userId === req.user.id);
    
    const stats = {
      totalNotes: userNotes.length,
      publicNotes: userNotes.filter(n => n.isPublic).length,
      pinnedNotes: userNotes.filter(n => n.isPinned).length,
      totalWordCount: userNotes.reduce((sum, n) => sum + n.wordCount, 0),
      averageWordCount: userNotes.length > 0 
        ? Math.round(userNotes.reduce((sum, n) => sum + n.wordCount, 0) / userNotes.length) 
        : 0,
      subjectBreakdown: userNotes.reduce((acc, note) => {
        acc[note.subject] = (acc[note.subject] || 0) + 1;
        return acc;
      }, {}),
      mostUsedTags: userNotes
        .flatMap(n => n.tags)
        .reduce((acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        }, {}),
      recentActivity: userNotes
        .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
        .slice(0, 5)
        .map(note => ({
          id: note.id,
          title: note.title,
          lastModified: note.lastModified,
          action: 'modified'
        }))
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
