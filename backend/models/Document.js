import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  
  // File information
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    enum: ['pdf', 'docx', 'txt', 'image']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },

  // Document content and analysis
  extractedText: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    default: ''
  },
  keyTopics: [{
    topic: String,
    confidence: Number,
    relevance: Number
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  
  // Processing status
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingError: {
    type: String,
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  },

  // AI Analysis
  aiAnalysis: {
    wordCount: {
      type: Number,
      default: 0
    },
    readingTime: {
      type: Number,
      default: 0 // in minutes
    },
    complexity: {
      type: String,
      enum: ['simple', 'moderate', 'complex'],
      default: 'moderate'
    },
    subjects: [{
      name: String,
      confidence: Number
    }],
    concepts: [{
      name: String,
      definition: String,
      importance: {
        type: Number,
        min: 1,
        max: 10
      }
    }]
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

  // Access and sharing
  isPublic: {
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

  // Study materials generated
  studyMaterials: {
    notes: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      default: null
    },
    flashcards: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flashcard'
    }],
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      default: null
    }
  },

  // Statistics
  stats: {
    viewCount: {
      type: Number,
      default: 0
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    quizzesTaken: {
      type: Number,
      default: 0
    },
    lastAccessed: {
      type: Date,
      default: null
    }
  },

  // Metadata
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
documentSchema.index({ user: 1, createdAt: -1 });
documentSchema.index({ title: 'text', description: 'text', extractedText: 'text' });
documentSchema.index({ subject: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ processingStatus: 1 });
documentSchema.index({ isPublic: 1, isActive: 1 });

// Virtual for file size in human readable format
documentSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for reading time formatted
documentSchema.virtual('readingTimeFormatted').get(function() {
  const minutes = this.aiAnalysis.readingTime;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
});

// Pre-save middleware
documentSchema.pre('save', function(next) {
  // Update word count if extracted text is available
  if (this.isModified('extractedText') && this.extractedText) {
    this.aiAnalysis.wordCount = this.extractedText.split(/\s+/).length;
    // Estimate reading time (average 200 words per minute)
    this.aiAnalysis.readingTime = Math.ceil(this.aiAnalysis.wordCount / 200);
  }
  
  next();
});

// Instance methods
documentSchema.methods.incrementView = function() {
  this.stats.viewCount += 1;
  this.stats.lastAccessed = new Date();
  return this.save();
};

documentSchema.methods.incrementDownload = function() {
  this.stats.downloadCount += 1;
  return this.save();
};

documentSchema.methods.shareWith = function(userId, permission = 'read') {
  // Check if already shared with this user
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
  
  return this.save();
};

// Static methods
documentSchema.statics.findByUser = function(userId, options = {}) {
  const query = { user: userId, isActive: true };
  
  if (options.subject) query.subject = options.subject;
  if (options.tags) query.tags = { $in: options.tags };
  
  return this.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

documentSchema.statics.findPublic = function(options = {}) {
  const query = { isPublic: true, isActive: true };
  
  if (options.subject) query.subject = options.subject;
  if (options.search) {
    query.$text = { $search: options.search };
  }
  
  return this.find(query)
    .populate('user', 'name')
    .sort({ createdAt: -1 });
};

documentSchema.statics.getAnalytics = async function(userId = null) {
  const matchStage = userId ? { user: mongoose.Types.ObjectId(userId) } : {};
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalDocuments: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
        avgWordCount: { $avg: '$aiAnalysis.wordCount' },
        avgReadingTime: { $avg: '$aiAnalysis.readingTime' },
        totalViews: { $sum: '$stats.viewCount' },
        totalDownloads: { $sum: '$stats.downloadCount' },
        fileTypes: {
          $push: '$fileType'
        },
        subjects: {
          $push: '$subject'
        }
      }
    }
  ]);
};

const Document = mongoose.model('Document', documentSchema);

export default Document;
