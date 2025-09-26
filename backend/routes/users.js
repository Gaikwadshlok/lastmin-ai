import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const users = await User.find(filter)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
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

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          type: 'Not Found'
        }
      });
    }

    // Only admin or the user themselves can view full profile
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to view this profile',
          type: 'Forbidden'
        }
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin or Own Profile
router.put('/:id', protect, async (req, res, next) => {
  try {
    // Only admin or the user themselves can update profile
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to update this profile',
          type: 'Forbidden'
        }
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          type: 'Not Found'
        }
      });
    }

    const { name, email, studyPreferences, settings, role, isActive } = req.body;

    // Update allowed fields
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Email is already taken',
            type: 'Duplicate Entry'
          }
        });
      }
      user.email = email;
      user.isEmailVerified = false;
    }

    if (studyPreferences) {
      user.studyPreferences = { ...user.studyPreferences, ...studyPreferences };
    }

    if (settings) {
      user.settings = { ...user.settings, ...settings };
    }

    // Only admin can update role and isActive
    if (req.user.role === 'admin') {
      if (role !== undefined) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
    }

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          studyPreferences: user.studyPreferences,
          settings: user.settings
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          type: 'Not Found'
        }
      });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete your own account',
          type: 'Bad Request'
        }
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user analytics
// @route   GET /api/users/analytics/overview
// @access  Private/Admin
router.get('/analytics/overview', protect, authorize('admin'), async (req, res, next) => {
  try {
    const analytics = await User.getUserAnalytics();

    res.json({
      success: true,
      data: { analytics: analytics[0] || {} }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
