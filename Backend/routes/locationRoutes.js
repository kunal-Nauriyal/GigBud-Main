import express from 'express';
import { getNearbyTasks, updateUserLocation } from '../controllers/locationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/tasks/nearby', authMiddleware, getNearbyTasks);
router.post('/location/update', authMiddleware, updateUserLocation);

export default router;
