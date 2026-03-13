// server.js
// Main application file demonstrating all MongoDB/Mongoose operations

const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./database/connection');
const Person = require('./models/Person');

// Connect to MongoDB
connectDB();

/**
 * Helper function to wait for database connection
 * Ensures operations run only after successful connection
 */
const waitForConnection = async () => {
    if (mongoose.connection.readyState === 0) {
        console.log('Waiting for database connection...');
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
};

/**
 * Main function to run all MongoDB operations
 * Demonstrates all required CRUD operations
 */
const runMongoOperations = async () => {
    try {
        // Wait for database connection
        await waitForConnection();

        // 1. CREATE AND SAVE A SINGLE PERSON
        console.log('\n📝 1. Creating and saving a single person...');
        
        // Create a new Person instance
        const john = new Person({
            name: 'John Doe',
            age: 30,
            favoriteFoods: ['pizza', 'pasta'],
            email: 'john@example.com'
        });

        // Save the person to database
        const savedPerson = await john.save();
        console.log('✅ Person saved successfully:', savedPerson);

        // 2. CREATE MULTIPLE PEOPLE WITH model.create()
        console.log('\n📝 2. Creating multiple people...');
        
        const arrayOfPeople = [
            {
                name: 'Alice Smith',
                age: 25,
                favoriteFoods: ['sushi', 'ramen'],
                email: 'alice@example.com'
            },
            {
                name: 'Bob Johnson',
                age: 35,
                favoriteFoods: ['steak', 'potatoes'],
                email: 'bob@example.com'
            },
            {
                name: 'Charlie Brown',
                age: 28,
                favoriteFoods: ['hamburger', 'fries'],
                email: 'charlie@example.com'
            },
            {
                name: 'Mary Wilson',
                age: 32,
                favoriteFoods: ['salad', 'soup'],
                email: 'mary@example.com'
            },
            {
                name: 'Mary Johnson', // Another Mary for deleteMany test
                age: 29,
                favoriteFoods: ['burritos', 'tacos'],
                email: 'mary.j@example.com'
            }
        ];

        // Create all people at once
        const createdPeople = await Person.create(arrayOfPeople);
        console.log(`✅ Created ${createdPeople.length} people successfully`);

        // 3. USE model.find() TO SEARCH BY NAME
        console.log('\n🔍 3. Finding all people with name "Mary"...');
        
        const marys = await Person.find({ name: 'Mary Wilson' });
        console.log('Found Marys:', marys);

        // 4. USE model.findOne() TO FIND BY FAVORITE FOOD
        console.log('\n🔍 4. Finding one person who likes "burritos"...');
        
        const burritoLover = await Person.findOne({ favoriteFoods: 'burritos' });
        console.log('Person who likes burritos:', burritoLover);

        // 5. USE model.findById() TO FIND BY ID
        console.log('\n🔍 5. Finding person by ID...');
        
        if (createdPeople.length > 0) {
            const firstPersonId = createdPeople[0]._id;
            const personById = await Person.findById(firstPersonId);
            console.log('Person found by ID:', personById);
        }

        // 6. CLASSIC UPDATE: FIND, EDIT, THEN SAVE
        console.log('\n📝 6. Performing classic update (find, edit, save)...');
        
        // Find a person (let's use Charlie)
        const charlie = await Person.findOne({ name: 'Charlie Brown' });
        if (charlie) {
            console.log('Found Charlie:', charlie);
            
            // Add "hamburger" to favorite foods (if not already there)
            if (!charlie.favoriteFoods.includes('hamburger')) {
                charlie.favoriteFoods.push('hamburger');
                
                // For Mixed type arrays, mark as modified
                // (Not necessary here since we defined as [String])
                // charlie.markModified('favoriteFoods');
                
                // Save the updated document
                const updatedCharlie = await charlie.save();
                console.log('Updated Charlie with hamburger:', updatedCharlie);
            } else {
                console.log('Charlie already likes hamburger');
            }
        }

        // 7. USE findOneAndUpdate() FOR NEW UPDATES
        console.log('\n📝 7. Using findOneAndUpdate() to update age...');
        
        // Find Alice by name and update her age to 20
        const updatedAlice = await Person.findOneAndUpdate(
            { name: 'Alice Smith' }, // Search criteria
            { age: 20 }, // Update
            { new: true } // Return the updated document
        );
        console.log('Updated Alice (age now 20):', updatedAlice);

        // 8. DELETE ONE DOCUMENT USING findByIdAndRemove()
        console.log('\n🗑️ 8. Deleting a person by ID...');
        
        if (createdPeople.length > 1) {
            const personToDelete = createdPeople[1]; // Bob
            const deletedPerson = await Person.findByIdAndRemove(personToDelete._id);
            console.log('Deleted person:', deletedPerson);
        }

        // 9. DELETE MANY DOCUMENTS WITH model.remove()
        console.log('\n🗑️ 9. Deleting all people named "Mary"...');
        
        // Delete all documents where name is "Mary" (case-sensitive)
        const deleteResult = await Person.deleteMany({ name: 'Mary Wilson' });
        console.log('Delete operation result:', deleteResult);
        console.log(`Removed ${deleteResult.deletedCount} people named Mary`);

        // 10. CHAIN SEARCH QUERY HELPERS
        console.log('\n🔍 10. Complex query: Find people who like burritos, sort by name, limit to 2, hide age...');
        
        const burritoLovers = await Person.find({ favoriteFoods: 'burritos' })
            .sort({ name: 1 }) // Sort by name in ascending order (1 = asc, -1 = desc)
            .limit(2) // Limit to 2 results
            .select({ name: 1, favoriteFoods: 1, _id: 0 }) // Select only name and favoriteFoods, exclude age and _id
            .exec(); // Execute the query
        
        console.log('Burrito lovers (limited, sorted, filtered):', burritoLovers);

        // ADDITIONAL DEMONSTRATIONS

        // Find people above certain age
        console.log('\n🔍 Finding people above age 25...');
        const adults = await Person.find({ age: { $gt: 25 } })
            .select('name age')
            .exec();
        console.log('People above 25:', adults);

        // Update multiple documents
        console.log('\n📝 Updating all people...');
        const updateManyResult = await Person.updateMany(
            {}, // Empty filter means all documents
            { $inc: { age: 1 } } // Increment age by 1 for everyone
        );
        console.log('Update many result:', updateManyResult);

        // Count documents
        console.log('\n📊 Counting documents...');
        const totalCount = await Person.countDocuments();
        console.log('Total people in database:', totalCount);

        console.log('\n✅ All MongoDB operations completed successfully!');

    } catch (error) {
        console.error('❌ Error during MongoDB operations:', error);
    } finally {
        // Close the database connection
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
};

// Run the operations
runMongoOperations();

// Alternative: Using Promises and callbacks for specific operations
// This demonstrates the callback pattern mentioned in the instructions

/**
 * Example using callbacks (for reference)
 */
const demonstrateCallbacks = () => {
    // Create a new person using callback pattern
    const jane = new Person({
        name: 'Jane Doe',
        age: 27,
        favoriteFoods: ['cake', 'ice cream']
    });

    jane.save((err, data) => {
        if (err) {
            console.error('Error saving Jane:', err);
        } else {
            console.log('Jane saved successfully (callback style):', data);
        }
    });
};

// Uncomment to run callback example
// demonstrateCallbacks();

// Handle process termination
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Database connection closed due to app termination');
    process.exit(0);
});
