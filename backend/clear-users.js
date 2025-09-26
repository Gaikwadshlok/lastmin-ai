import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function clearUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all users
    const result = await mongoose.connection.db.collection('users').deleteMany({});
    console.log(`Deleted ${result.deletedCount} user accounts`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database cleared and connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

clearUsers();
