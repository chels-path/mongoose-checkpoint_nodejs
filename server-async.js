// server-async.js
// Alternative implementation using async/await with comprehensive error handling

const mongoose = require('mongoose');
require('dotenv').config();
const Person = require('./models/Person');

/**
 * Connect to MongoDB with retry logic
 */
const connectWithRetry = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('✅ Connected to MongoDB');
            return true;
        } catch (error) {
            console.log(`❌ Connection attempt ${i + 1} failed. ${retries - i - 1} retries left.`);
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw new Error('Failed to connect to MongoDB after multiple attempts');
};

/**
 * Main function with all operations
 */
const main = async () => {
    try {
        // Connect to database
        await connectWithRetry();

        // Clear existing data for clean demonstration
        await Person.deleteMany({});
        console.log('🧹 Cleared existing data');

        // 1. Create a single person
        const person1 = new Person({
            name: 'John Smith',
            age: 25,
            favoriteFoods: ['pizza', 'pasta']
        });
        const savedPerson1 = await person1.save();
        console.log('✅ Created:', savedPerson1.name);

        // 2. Create multiple people
        const people = [
            { name: 'Mary Jane', age: 30, favoriteFoods: ['sushi', 'burritos'] },
            { name: 'Mary Lou', age: 28, favoriteFoods: ['burritos', 'tacos'] },
            { name: 'Peter Pan', age: 22, favoriteFoods: ['hamburger', 'fries'] },
            { name: 'Wendy Darling', age: 24, favoriteFoods: ['salad', 'soup'] }
        ];
        const createdPeople = await Person.create(people);
        console.log(`✅ Created ${createdPeople.length} people`);

        // 3. Find by name
        const marys = await Person.find({ name: /Mary/i });
        console.log(`🔍 Found ${marys.length} people named Mary`);

        // 4. Find by favorite food
        const burritoEaters = await Person.findOne({ favoriteFoods: 'burritos' });
        console.log('🔍 Found burrito eater:', burritoEaters?.name);

        // 5. Find by ID
        if (createdPeople.length > 0) {
            const person = await Person.findById(createdPeople[0]._id);
            console.log('🔍 Found by ID:', person?.name);
        }

        // 6. Classic update
        const peter = await Person.findOne({ name: 'Peter Pan' });
        if (peter) {
            peter.favoriteFoods.push('hamburger');
            const updated = await peter.save();
            console.log('📝 Updated Peter:', updated.favoriteFoods);
        }

        // 7. FindOneAndUpdate
        const updatedWendy = await Person.findOneAndUpdate(
            { name: 'Wendy Darling' },
            { age: 25 },
            { new: true }
        );
        console.log('📝 Updated Wendy age:', updatedWendy?.age);

        // 8. Delete by ID
        if (createdPeople.length > 1) {
            const deleted = await Person.findByIdAndDelete(createdPeople[1]._id);
            console.log('🗑️ Deleted:', deleted?.name);
        }

        // 9. Delete many
        const deleteResult = await Person.deleteMany({ name: /Mary/i });
        console.log(`🗑️ Deleted ${deleteResult.deletedCount} Marys`);

        // 10. Chain query
        const results = await Person.find({ favoriteFoods: 'hamburger' })
            .sort('name')
            .limit(2)
            .select('name favoriteFoods')
            .exec();
        console.log('🔍 Query results:', results);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
    }
};

// Run the application
main();
