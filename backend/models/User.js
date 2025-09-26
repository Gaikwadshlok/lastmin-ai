import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Study preferences
  studyPreferences: {
    subjects: [{
      type: String,
      trim: true
    }],
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    studyReminders: {
      type: Boolean,
      default: true
    },
    preferredStudyTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      default: 'evening'
    }
  },

  // Study statistics
  studyStats: {
    totalStudyTime: {
      type: Number,
      default: 0 // in minutes
    },
    documentsUploaded: {
      type: Number,
      default: 0
    },
    quizzesCompleted: {
      type: Number,
      default: 0
    },
    averageQuizScore: {
      type: Number,
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    },
    lastStudyDate: {
      type: Date,
      default: null
    }
  },

  // Settings
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'dark'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      studyReminders: {
        type: Boolean,
        default: true
      },
      quizResults: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'private'
      },
      dataSharing: {
        type: Boolean,
        default: false
      }
    }
  },

  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
// email has unique: true above; Mongoose creates index automatically.
// Avoid duplicate index definition that can cause warnings.
userSchema.index({ createdAt: -1 });
userSchema.index({ 'studyStats.lastStudyDate': -1 });

// Virtual for user's full study profile
userSchema.virtual('studyProfile').get(function() {
  return {
    totalDocuments: this.studyStats.documentsUploaded,
    totalQuizzes: this.studyStats.quizzesCompleted,
    averageScore: this.studyStats.averageQuizScore,
    studyStreak: this.studyStats.streakDays,
    totalStudyHours: Math.round(this.studyStats.totalStudyTime / 60 * 10) / 10
  };
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  
  next();
});

// Instance method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to update study stats
userSchema.methods.updateStudyStats = function(updates) {
  Object.keys(updates).forEach(key => {
    if (this.studyStats[key] !== undefined) {
      this.studyStats[key] = updates[key];
    }
  });
  
  // Update last study date
  this.studyStats.lastStudyDate = new Date();
  
  return this.save();
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Static method to get user analytics
userSchema.statics.getUserAnalytics = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        avgStudyTime: { $avg: '$studyStats.totalStudyTime' },
        totalDocuments: { $sum: '$studyStats.documentsUploaded' },
        totalQuizzes: { $sum: '$studyStats.quizzesCompleted' }
      }
    }
  ]);
};

const User = mongoose.model('User', userSchema);

export default User;
