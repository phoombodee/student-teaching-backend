const mongoose = require('mongoose');

// Global flag to track if using mock database
let useMockDatabase = false;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 5000,
    });
    console.log('✓ MongoDB connected successfully');
    useMockDatabase = false;
    return true;
  } catch (error) {
    console.log('⚠ MongoDB connection failed:', error.message);
    console.log('📝 Falling back to in-memory database');
    console.log('   Note: Data will NOT persist after server restart\n');
    useMockDatabase = true;
    return false;
  }
};

module.exports = connectDB;
module.exports.useMockDatabase = () => useMockDatabase;
module.exports.setMockDatabase = (value) => { useMockDatabase = value; };

