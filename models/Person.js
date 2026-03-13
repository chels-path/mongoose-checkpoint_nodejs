// models/Person.js
// This file defines the Person schema and model for MongoDB

const mongoose = require('mongoose');

/**
 * Person Schema Definition
 * Defines the structure and validation rules for Person documents
 */
const personSchema = new mongoose.Schema({
    // Name field - required string
    name: {
        type: String,
        required: [true, 'Name is required'], // Custom error message if missing
        trim: true, // Remove whitespace from both ends
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    
    // Age field - number with validation
    age: {
        type: Number,
        min: [0, 'Age cannot be negative'],
        max: [150, 'Age cannot exceed 150'],
        validate: {
            validator: Number.isInteger,
            message: 'Age must be an integer'
        }
    },
    
    // Favorite foods field - array of strings
    favoriteFoods: {
        type: [String],
        validate: {
            validator: function(foods) {
                // Ensure all items in array are strings
                return foods.every(food => typeof food === 'string');
            },
            message: 'All favorite foods must be strings'
        },
        default: [] // Default to empty array if not provided
    },
    
    // Optional: Add timestamps to track when documents are created/updated
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    // Optional: Add email field with validation
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    }
});

// Create and export the Person model
// The model will create a 'people' collection in MongoDB (automatically pluralized)
const Person = mongoose.model('Person', personSchema);

module.exports = Person;
