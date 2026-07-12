import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`⚡ Connected to MongoDB Server Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Database Engine Error: ${error.message}`);
    process.exit(1); // Force kills the terminal loop process execution immediately on crash
  }
};

export default connectDB;
