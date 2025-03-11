import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dbConnect = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        
        if (!MONGODB_URI) {
            throw new Error('Please define MONGODB_URI environment variable');
        }

        // Configure MongoDB options
        const options = {
            maxPoolSize: 10, // Limit pool size for Vercel serverless
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        };

        // Check if we already have a connection
        if (mongoose.connection.readyState >= 1) {
            return;
        }

        const conn = await mongoose.connect(MONGODB_URI, options);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export default dbConnect;