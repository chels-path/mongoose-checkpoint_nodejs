// database/connection.js
// This file handles the MongoDB connection using Mongoose

const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

/**
 * Establishes connection to MongoDB Atlas using Mongoose
 * The connection URI is stored in environment variable MONGO_URI
 * Options useNewUrlParser and useUnifiedTopology are required for MongoDB driver
 */
const connectDB = async () => {
    try {
        // Connect to MongoDB using the URI from .env file
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,      // Use the new URL parser
            useUnifiedTopology: true    // Use the new Server Discovery and Monitoring engine
        });
        console.log('✅ MongoDB connected successfully!');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        // Exit process with failure if connection fails
        process.exit(1);
    }
};

// Export the connection function
module.exports = connectDB;
