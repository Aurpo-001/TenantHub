const app = require('./app');
const connectDatabase = require('./config/database');

// Connect to database
connectDatabase();

const PORT = process.env.PORT || 1903;

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