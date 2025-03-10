import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();


export const connectDB = async () => {
    try{
        const URL = process.env.MONGODB_URI;
        if(!URL){
            throw new Error("MongoDB URL is required");
        }
        const conn = await mongoose.connect(URL);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }catch(err){
        console.log("Database connection failed: ", err);
    }
}

