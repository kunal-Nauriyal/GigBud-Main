// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

// Connect to MongoDB
connectDB(); // This function should call mongoose.connect without deprecated options

// Middlewares
app.use(cors());
app.use(express.json()); // Parses incoming JSON
app.use('/uploads', express.static('uploads')); // Optional: to serve uploaded files

// API Routes
app.use('/api/auth', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/notification', notificationRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
