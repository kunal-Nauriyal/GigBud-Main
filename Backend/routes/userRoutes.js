import express from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  refreshToken
} from '../controllers/userControllers.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/user/profile/:id', authMiddleware, getProfile);

export default router;
