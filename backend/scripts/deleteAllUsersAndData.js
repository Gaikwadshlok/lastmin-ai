#!/usr/bin/env node
/*
  deleteAllUsersAndData.js
  One-off script to delete all users and related user-owned data from local/dev DB.
  WARNING: Destructive. You confirmed NO BACKUP and to proceed.
*/
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lastminai-dev';

async function run() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to run in production mode. Set NODE_ENV to non-production to proceed.');
    process.exit(1);
  }

  console.log('Connecting to', uri);
  await mongoose.connect(uri);

  const db = mongoose.connection.db;

  try {
    // Print counts before deletion
    const usersCount = await db.collection('users').countDocuments();
    const documentsCount = await db.collection('documents').countDocuments().catch(() => 0);
    const generatedCount = await db.collection('generateddocuments').countDocuments().catch(() => 0);

    console.log('Counts before deletion:');
    console.log('  users:', usersCount);
    console.log('  documents:', documentsCount);
    console.log('  generateddocuments:', generatedCount);

    // Delete all user-owned data
    console.log('\nDeleting all users and related data...');
    await db.collection('documents').deleteMany({}).catch(() => {});
    await db.collection('generateddocuments').deleteMany({}).catch(() => {});
    await db.collection('users').deleteMany({}).catch(() => {});

    // Verify counts after deletion
    const usersAfter = await db.collection('users').countDocuments().catch(() => 0);
    const documentsAfter = await db.collection('documents').countDocuments().catch(() => 0);
    const generatedAfter = await db.collection('generateddocuments').countDocuments().catch(() => 0);

    console.log('\nCounts after deletion:');
    console.log('  users:', usersAfter);
    console.log('  documents:', documentsAfter);
    console.log('  generateddocuments:', generatedAfter);

    console.log('\nDeletion complete.');
  } catch (err) {
    console.error('Error during deletion:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
