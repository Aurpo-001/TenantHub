const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDatabase = async () => {
  try {
    // support either MONGODB_URI or MONGO_URI
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.error('Missing MONGODB_URI/MONGO_URI in .env');
      process.exit(1);
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDatabase;