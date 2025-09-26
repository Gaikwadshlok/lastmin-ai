import mongoose from 'mongoose';

const generatedDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Generated document title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  
  // Source document reference
  sourceDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: [true, 'Source document is required']
  },
  
  // Generation metadata
  generationType: {
    type: String,
    enum: ['notes', 'summary', 'flashcards', 'quiz', 'outline'],
    required: [true, 'Generation type is required']
  },
  generationMethod: {
    type: String,
    enum: ['ai-gemini', 'ai-gpt', 'ai-claude', 'manual'],
    default: 'ai-gemini'
  },
  generationPrompt: {
    type: String,
    trim: true
  },
  
  // Content analysis
  analysis: {
    wordCount: {
      type: Number,
      default: 0
    },
    readingTime: {
      type: Number,
      default: 0 // in minutes
    },
    structure: {
      headers: {
        type: Number,
        default: 0
      },
      bulletPoints: {
        type: Number,
        default: 0
      },
      codeBlocks: {
        type: Number,
        default: 0
      },
      mathEquations: {
        type: Number,
        default: 0
      }
    }
  },
  
  // User and organization
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [100, 'Subject cannot be more than 100 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot be more than 50 characters']
  }],
  
  // Status and processing
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed', 'archived'],
    default: 'generating'
  },
  processingError: {
    type: String,
    default: null
  },
  generatedAt: {
    type: Date,
    default: null
  },
  
  // Access and sharing
  isPublic: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'comment', 'edit'],
      default: 'read'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  shareSettings: {
    allowComments: {
      type: Boolean,
      default: false
    },
    allowEditing: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  
  // Version control
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    content: String,
    modifiedAt: Date,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changeDescription: String
  }],
  
  // Statistics
  stats: {
    viewCount: {
      type: Number,
      default: 0
    },
    shareCount: {
      type: Number,
      default: 0
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    lastAccessed: {
      type: Date,
      default: null
    },
    studyTime: {
      type: Number,
      default: 0 // in minutes
    }
  },
  
  // Quality metrics
  quality: {
    aiConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    userRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    completeness: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    }
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
generatedDocumentSchema.index({ user: 1, createdAt: -1 });
generatedDocumentSchema.index({ sourceDocument: 1 });
generatedDocumentSchema.index({ generationType: 1 });
generatedDocumentSchema.index({ status: 1 });
generatedDocumentSchema.index({ subject: 1 });
generatedDocumentSchema.index({ tags: 1 });
generatedDocumentSchema.index({ title: 'text', content: 'text' });
generatedDocumentSchema.index({ isPublic: 1, isActive: 1 });
generatedDocumentSchema.index({ isPinned: -1, lastModified: -1 });

// Virtual for formatted file size
generatedDocumentSchema.virtual('contentSizeFormatted').get(function() {
  const bytes = Buffer.byteLength(this.content, 'utf8');
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for reading time formatted
generatedDocumentSchema.virtual('readingTimeFormatted').get(function() {
  const minutes = this.analysis.readingTime;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
});

// Pre-save middleware
generatedDocumentSchema.pre('save', function(next) {
  // Update analysis if content is modified
  if (this.isModified('content') && this.content) {
    this.analysis.wordCount = this.content.split(/\s+/).length;
    // Estimate reading time (average 200 words per minute)
    this.analysis.readingTime = Math.ceil(this.analysis.wordCount / 200);
    
    // Count structure elements
    this.analysis.structure.headers = (this.content.match(/^#+\s/gm) || []).length;
    this.analysis.structure.bulletPoints = (this.content.match(/^[\s]*[-*+]\s/gm) || []).length;
    this.analysis.structure.codeBlocks = (this.content.match(/```/g) || []).length / 2;
    this.analysis.structure.mathEquations = (this.content.match(/\$.*?\$/g) || []).length;
  }
  
  // Update lastModified
  this.lastModified = new Date();
  
  next();
});

// Instance methods
generatedDocumentSchema.methods.incrementView = function() {
  this.stats.viewCount += 1;
  this.stats.lastAccessed = new Date();
  return this.save();
};

generatedDocumentSchema.methods.addStudyTime = function(minutes) {
  this.stats.studyTime += minutes;
  return this.save();
};

generatedDocumentSchema.methods.createVersion = function(changeDescription = '') {
  this.previousVersions.push({
    version: this.version,
    content: this.content,
    modifiedAt: this.lastModified,
    modifiedBy: this.user,
    changeDescription
  });
  this.version += 1;
  return this.save();
};

generatedDocumentSchema.methods.shareWith = function(userId, permission = 'read') {
  const existingShare = this.sharedWith.find(share => 
    share.user.toString() === userId.toString()
  );
  
  if (existingShare) {
    existingShare.permission = permission;
    existingShare.sharedAt = new Date();
  } else {
    this.sharedWith.push({
      user: userId,
      permission,
      sharedAt: new Date()
    });
  }
  
  this.stats.shareCount += 1;
  return this.save();
};

// Static methods
generatedDocumentSchema.statics.findByUser = function(userId, options = {}) {
  const query = { user: userId, isActive: true };
  
  if (options.generationType) query.generationType = options.generationType;
  if (options.subject) query.subject = options.subject;
  if (options.status) query.status = options.status;
  if (options.tags) query.tags = { $in: options.tags };
  if (options.sourceDocument) query.sourceDocument = options.sourceDocument;
  
  return this.find(query)
    .populate('user', 'name email')
    .populate('sourceDocument', 'title originalName fileType')
    .sort({ isPinned: -1, lastModified: -1 });
};

generatedDocumentSchema.statics.findBySourceDocument = function(documentId, userId = null) {
  const query = { sourceDocument: documentId, isActive: true };
  if (userId) query.user = userId;
  
  return this.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

generatedDocumentSchema.statics.getStatsByUser = async function(userId) {
  return await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId), isActive: true } },
    {
      $group: {
        _id: null,
        totalGenerated: { $sum: 1 },
        totalWords: { $sum: '$analysis.wordCount' },
        avgWordCount: { $avg: '$analysis.wordCount' },
        totalViews: { $sum: '$stats.viewCount' },
        totalStudyTime: { $sum: '$stats.studyTime' },
        byType: {
          $push: '$generationType'
        },
        byStatus: {
          $push: '$status'
        },
        pinnedCount: {
          $sum: { $cond: ['$isPinned', 1, 0] }
        }
      }
    }
  ]);
};

const GeneratedDocument = mongoose.model('GeneratedDocument', generatedDocumentSchema);

export default GeneratedDocument;