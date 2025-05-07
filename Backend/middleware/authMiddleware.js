import jwt from 'jsonwebtoken';
import mongoose from 'mongoose'; // ✅ Needed for ObjectId conversion
import Blacklist from '../models/Blacklist.js';
import User from '../models/userModel.js';
import { errorResponse } from '../views/responseTemplates.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authorization token missing or malformed', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(res, 'Access denied. Token missing', 401);
    }

    const blacklisted = await Blacklist.findOne({ token });
    if (blacklisted) {
      return errorResponse(res, 'Session expired. Please login again', 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET not set in environment variables');
      return errorResponse(res, 'Server configuration error', 500);
    }

    const decoded = jwt.verify(token, secret);
    console.log('✅ Decoded JWT:', decoded);

    const userId =
      decoded?.id ||
      decoded?.userId ||
      decoded?.user?._id ||
      decoded?.user?.id;

    console.log('✅ Extracted userId:', userId);

    if (!userId) {
      return errorResponse(res, 'Invalid token payload: user ID not found', 401);
    }

    // ✅ Convert to ObjectId explicitly
    const objectId = new mongoose.Types.ObjectId(userId);

    console.log('🔍 Looking for user ID:', objectId);

    const user = await User.findById(objectId);

    if (!user) {
      console.log('❌ User not found in DB');
      return errorResponse(res, 'Unauthorized: user not found', 401);
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role || 'user',
    };

    next();
  } catch (error) {
    console.error('❌ Authentication error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired. Please login again', 401);
    }

    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token', 401);
    }

    return errorResponse(res, 'Authentication failed', 401);
  }
};

export default authMiddleware;
