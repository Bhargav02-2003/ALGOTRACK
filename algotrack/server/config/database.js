import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// The user provided this Mongo URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://panchalbhargav73_db_user:TNyYbmWFA2YRRNgO@cluster0.4wenkf3.mongodb.net/algotrack?retryWrites=true&w=majority&appName=Cluster0';

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

export default mongoose;
