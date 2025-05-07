import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 7+ no longer requires useNewUrlParser or useUnifiedTopology
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connection established');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 Mongoose connection closed due to app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);

    if (error.name === 'MongooseServerSelectionError') {
      console.error('⚠️ Server selection error - check your network or MongoDB server status');
    } else if (error.name === 'MongoParseError') {
      console.error('⚠️ URI format error - check your MONGO_URI syntax');
    } else if (error.name === 'MongoNetworkError') {
      console.error('⚠️ Network error - check your internet or VPN/firewall settings');
    }

    process.exit(1);
  }
};

export default connectDB;
