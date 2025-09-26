import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Remove deprecated options - mongoose 6+ handles these automatically
    });

    console.log(`
📊 MongoDB Connected Successfully!
🔗 Host: ${conn.connection.host}
📝 Database: ${conn.connection.name}
🆔 Connection ID: ${conn.connection.id}
    `);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('📊 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during MongoDB disconnection:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️  Continuing without database - some features may not work');
    
    // Don't exit, continue without database for development
    // process.exit(1);
  }
};

export default connectDB;
