import express from 'express';
import { sendNotification, getNotifications } from '../controllers/notificationController.js';

const router = express.Router();

router.post('/notify/user', sendNotification);
router.get('/notifications', getNotifications);

export default router;
