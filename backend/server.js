const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');

dotenv.config();

// Connect to database
connectDatabase().catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📱 API Base URL: http://localhost:${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Error: ${err.message}`);
    // Close server & exit process
    server.close(() => {
        process.exit(1);
    });
});