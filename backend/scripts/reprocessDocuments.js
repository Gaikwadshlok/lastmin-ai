import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import Document from '../models/Document.js';
import { extractTextFromFile, validateExtractedText } from '../utils/textExtraction.js';

// ES6 module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lastminai-dev';

async function reprocessAllDocuments() {
  try {
    console.log('🔄 Starting document reprocessing script...');
    console.log('📍 Connecting to MongoDB:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all documents that need text extraction
    const documentsToProcess = await Document.find({
      $or: [
        { extractedText: { $exists: false } },
        { extractedText: '' },
        { processingStatus: { $in: ['pending', 'failed'] } }
      ],
      fileType: { $in: ['pdf', 'docx', 'txt'] }
    });

    console.log(`📊 Found ${documentsToProcess.length} documents to reprocess`);

    if (documentsToProcess.length === 0) {
      console.log('✅ No documents need reprocessing');
      return;
    }

    let processed = 0;
    let successful = 0;
    let failed = 0;
    let notFound = 0;

    for (const doc of documentsToProcess) {
      try {
        console.log(`\n📄 Processing: ${doc.originalName} (${doc.fileType})`);
        
        // Check if file exists
        if (!fs.existsSync(doc.filePath)) {
          console.log(`❌ File not found: ${doc.filePath}`);
          notFound++;
          
          // Update document status
          doc.processingStatus = 'file_not_found';
          await doc.save();
          continue;
        }

        // Extract text
        const rawText = await extractTextFromFile(doc.filePath, doc.fileType);
        const { isValid, cleanText } = validateExtractedText(rawText);
        
        if (isValid) {
          doc.extractedText = cleanText;
          doc.processingStatus = 'completed';
          await doc.save();
          
          console.log(`✅ Success - ${cleanText.length} characters extracted`);
          successful++;
        } else {
          doc.processingStatus = 'failed';
          await doc.save();
          
          console.log(`⚠️ Failed - no meaningful content found`);
          failed++;
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${doc.originalName}:`, error.message);
        
        // Update document status
        doc.processingStatus = 'failed';
        await doc.save();
        failed++;
      }
      
      processed++;
      
      // Progress indicator
      if (processed % 5 === 0) {
        console.log(`📊 Progress: ${processed}/${documentsToProcess.length} processed`);
      }
    }

    console.log('\n📊 Reprocessing Summary:');
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📂 File not found: ${notFound}`);
    console.log(`📋 Total processed: ${processed}`);

  } catch (error) {
    console.error('❌ Reprocessing script error:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('👋 Disconnected from MongoDB');
    }
  }
}

// Run the script
reprocessAllDocuments().then(() => {
  console.log('🏁 Reprocessing script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});