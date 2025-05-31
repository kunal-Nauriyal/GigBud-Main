// routes/userRoutes.js
import express from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  refreshToken
} from '../controllers/userControllers.js';

import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/userModel.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/user/profile/:id', authMiddleware, getProfile);

// ✅ Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        age: user.age,
        profession: user.profession,
        phone: user.phone,
        phoneVerified: user.phoneVerified || false,
        emailVerified: user.emailVerified || false,
        role: user.role || 'user',
        location: user.location,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching user data'
    });
  }
});

// ✅ Update user profile
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, email, avatar, age, profession, phone } = req.body;

    // Allow updating all profile fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;
    if (age !== undefined) user.age = age;
    if (profession !== undefined) user.profession = profession;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        age: user.age,
        profession: user.profession,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Simple verification endpoints
router.post('/verify-email', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.emailVerified = true;
    await user.save();
    
    res.json({ 
      success: true,
      message: 'Email verified successfully'
    });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ success: false, message: 'Failed to verify email' });
  }
});

router.post('/verify-phone', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.phoneVerified = true;
    await user.save();
    
    res.json({ 
      success: true,
      message: 'Phone verified successfully'
    });
  } catch (err) {
    console.error('Phone verification error:', err);
    res.status(500).json({ success: false, message: 'Failed to verify phone' });
  }
});

export default router;