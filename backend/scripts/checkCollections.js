#!/usr/bin/env node
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lastminai-dev';

async function run() {
  console.log('Connecting to', uri);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  try {
    const collections = await db.listCollections().toArray();
    if (!collections || collections.length === 0) {
      console.log('No collections found in database.');
    } else {
      console.log('Collections and counts:');
      for (const c of collections) {
        const name = c.name;
        let count = 0;
        try {
          count = await db.collection(name).countDocuments();
        } catch (err) {
          count = `error: ${err.message}`;
        }
        console.log(`  ${name}: ${count}`);
      }
    }
  } catch (err) {
    console.error('Error listing collections:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
