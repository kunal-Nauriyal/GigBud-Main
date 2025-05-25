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

// ✅ Fixed /me route to return complete user data
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

export default router;