const mongoose = require('mongoose');
const { seedProperties } = require('../seeders/propertySeeder');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const runSeeders = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Run property seeder
        await seedProperties();
        
        console.log('🎉 Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

runSeeders();