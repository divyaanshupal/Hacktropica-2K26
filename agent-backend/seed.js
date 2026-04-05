const mongoose = require('mongoose');
// Update this path if your Employee model is located elsewhere
const Employee = require('./models/Task'); 

// Replace with your actual MongoDB connection string
const MONGO_URI = "mongodb+srv://dbUser7:zZfbF6xOfGI9MoaK@cluster0.2vj0jih.mongodb.net/?appName=Cluster0";

const dummyEmployees = [
{
  "title": "Implement Redis Caching Layer for Main Feed",
  "description": "Reduce primary database load by implementing a distributed Redis caching layer for the main user activity feed API.",
  "assignedTo": [
    "69d108beb3b1cf3775862abd"
  ],
  "criticality": 6,
  "status": "open",
  "sector": [
    "Backend Developer",
  ]
}
];

const seedDatabase = async () => {
  try {
    // 1. Connect to MongoDB
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to MongoDB.');

    // 2. Clear existing records (Optional, but good for clean seeding)
    console.log('Clearing existing employees to prevent duplicates...');
    await Employee.deleteMany({});
    
    // 3. Insert the dummy data
    console.log('Injecting 5 dummy employees into the Swarm...');
    const result = await Employee.insertMany(dummyEmployees);
    console.log(`Success! Inserted ${result.length} employees.`);

  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    // 4. Disconnect from MongoDB to exit the script gracefully
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
};

// Execute the seed function
seedDatabase();