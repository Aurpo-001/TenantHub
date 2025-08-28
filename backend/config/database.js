// backend/config/database.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDatabase = async () => {
  try {
    // support either MONGODB_URI or MONGO_URI
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) throw new Error('Missing MONGODB_URI/MONGO_URI in .env');

    const conn = await mongoose.connect(uri, {
      // modern drivers don’t need extra options, left here for clarity
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDatabase;
