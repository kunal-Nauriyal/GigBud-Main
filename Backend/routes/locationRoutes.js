import express from 'express';
import { getNearbyTasks, updateUserLocation, searchLocations } from '../controllers/locationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Existing routes
router.get('/tasks/nearby', authMiddleware, getNearbyTasks);
router.post('/location/update', authMiddleware, updateUserLocation);

// 🔍 New: Search locations (cities/colleges) as you type
router.get('/search', searchLocations); 
export default router;
