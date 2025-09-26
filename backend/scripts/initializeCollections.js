import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Document from '../models/Document.js';
import GeneratedDocument from '../models/GeneratedDocument.js';
import User from '../models/User.js';
import connectDB from '../config/database.js';

// Load env vars
dotenv.config();

const initializeCollections = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Get existing user or create a sample user
    let sampleUser = await User.findOne({ email: 'test@example.com' });
    if (!sampleUser) {
      sampleUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword123', // In real app, this should be hashed
        isVerified: true
      });
      await sampleUser.save();
      console.log('Created sample user');
    }

    // Create sample uploaded documents
    const sampleDocuments = [
      {
        title: 'Introduction to Data Structures',
        description: 'A comprehensive guide to data structures and algorithms',
        filename: 'data-structures-guide.pdf',
        originalName: 'Data Structures Guide.pdf',
        filePath: '/uploads/data-structures-guide.pdf',
        fileType: 'pdf',
        fileSize: 2500000, // 2.5MB
        mimeType: 'application/pdf',
        extractedText: 'Data structures are fundamental concepts in computer science. Arrays provide O(1) access time...',
        summary: 'Overview of arrays, linked lists, stacks, queues, trees, and graphs',
        processingStatus: 'completed',
        user: sampleUser._id,
        subject: 'Computer Science',
        tags: ['data-structures', 'algorithms', 'programming'],
        aiAnalysis: {
          wordCount: 1500,
          readingTime: 8,
          complexity: 'moderate'
        }
      },
      {
        title: 'Machine Learning Basics',
        description: 'Introduction to machine learning concepts',
        filename: 'ml-basics.pdf',
        originalName: 'Machine Learning Basics.pdf',
        filePath: '/uploads/ml-basics.pdf',
        fileType: 'pdf',
        fileSize: 3200000, // 3.2MB
        mimeType: 'application/pdf',
        extractedText: 'Machine learning is a subset of artificial intelligence. Supervised learning uses labeled data...',
        summary: 'Introduction to supervised, unsupervised, and reinforcement learning',
        processingStatus: 'completed',
        user: sampleUser._id,
        subject: 'Machine Learning',
        tags: ['machine-learning', 'ai', 'data-science'],
        aiAnalysis: {
          wordCount: 2100,
          readingTime: 11,
          complexity: 'complex'
        }
      },
      {
        title: 'Web Development Fundamentals',
        description: 'HTML, CSS, and JavaScript basics',
        filename: 'web-dev-fundamentals.pdf',
        originalName: 'Web Development Fundamentals.pdf',
        filePath: '/uploads/web-dev-fundamentals.pdf',
        fileType: 'pdf',
        fileSize: 1800000, // 1.8MB
        mimeType: 'application/pdf',
        extractedText: 'Web development involves creating websites and web applications. HTML provides structure...',
        summary: 'Core concepts of HTML, CSS, JavaScript, and modern web development',
        processingStatus: 'processing',
        user: sampleUser._id,
        subject: 'Web Development',
        tags: ['html', 'css', 'javascript', 'web-development'],
        aiAnalysis: {
          wordCount: 1200,
          readingTime: 6,
          complexity: 'simple'
        }
      }
    ];

    // Insert documents if they don't exist
    for (const docData of sampleDocuments) {
      const existingDoc = await Document.findOne({ 
        filename: docData.filename, 
        user: sampleUser._id 
      });
      
      if (!existingDoc) {
        const doc = new Document(docData);
        await doc.save();
        console.log(`Created document: ${doc.title}`);
      }
    }

    // Get created documents
    const createdDocs = await Document.find({ user: sampleUser._id });

    // Create sample generated documents
    const sampleGeneratedDocs = [
      {
        title: 'Study Notes - Data Structures Guide',
        content: `# Data Structures Study Notes

## Overview
This document contains comprehensive study notes on data structures and algorithms.

## Key Concepts

### Arrays
- **Definition**: A collection of elements stored in contiguous memory locations
- **Time Complexity**: 
  - Access: O(1)
  - Search: O(n)
  - Insertion: O(n)
  - Deletion: O(n)
- **Use Cases**: When you need fast access to elements by index

### Linked Lists
- **Definition**: A linear data structure where elements are stored in nodes
- **Types**: Singly linked, doubly linked, circular
- **Time Complexity**:
  - Access: O(n)
  - Search: O(n)
  - Insertion: O(1) at known position
  - Deletion: O(1) at known position

### Stacks
- **Definition**: LIFO (Last In, First Out) data structure
- **Operations**: Push, Pop, Peek, IsEmpty
- **Applications**: Function calls, expression evaluation, undo operations

### Queues
- **Definition**: FIFO (First In, First Out) data structure
- **Types**: Simple queue, circular queue, priority queue
- **Applications**: BFS, scheduling, buffer for data streams

## Practice Problems
1. Implement a stack using arrays
2. Reverse a linked list
3. Check for balanced parentheses using stack
4. Implement BFS using queue

## Summary
Understanding data structures is crucial for efficient algorithm design and problem-solving.`,
        sourceDocument: createdDocs[0]?._id,
        generationType: 'notes',
        generationMethod: 'ai-gemini',
        user: sampleUser._id,
        subject: 'Computer Science',
        tags: ['study-notes', 'data-structures', 'ai-generated'],
        status: 'completed',
        generatedAt: new Date(),
        analysis: {
          wordCount: 250,
          readingTime: 2,
          structure: {
            headers: 8,
            bulletPoints: 15,
            codeBlocks: 0
          }
        },
        quality: {
          aiConfidence: 0.92,
          completeness: 0.88
        }
      },
      {
        title: 'Study Notes - Machine Learning Basics',
        content: `# Machine Learning Study Notes

## Introduction
Machine learning is a powerful subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed.

## Types of Machine Learning

### 1. Supervised Learning
- **Definition**: Learning with labeled training data
- **Examples**: 
  - Classification (spam detection, image recognition)
  - Regression (price prediction, temperature forecasting)
- **Algorithms**: Linear Regression, Decision Trees, Random Forest, SVM

### 2. Unsupervised Learning
- **Definition**: Finding patterns in data without labels
- **Examples**:
  - Clustering (customer segmentation)
  - Dimensionality reduction (PCA)
- **Algorithms**: K-means, Hierarchical clustering, DBSCAN

### 3. Reinforcement Learning
- **Definition**: Learning through interaction with environment
- **Examples**: Game playing, robotics, autonomous vehicles
- **Key Concepts**: Agent, environment, rewards, policy

## Key Concepts

### Training Process
1. **Data Collection**: Gather relevant datasets
2. **Data Preprocessing**: Clean, normalize, and prepare data
3. **Model Selection**: Choose appropriate algorithm
4. **Training**: Feed data to the model
5. **Evaluation**: Test model performance
6. **Deployment**: Use model for predictions

### Model Evaluation
- **Accuracy**: Percentage of correct predictions
- **Precision**: True positives / (True positives + False positives)
- **Recall**: True positives / (True positives + False negatives)
- **F1-Score**: Harmonic mean of precision and recall

## Best Practices
- Always validate your model with unseen data
- Avoid overfitting by using regularization
- Feature engineering is crucial for model performance
- Start simple, then increase complexity

## Summary
Machine learning is transforming industries by enabling data-driven decision making and automation.`,
        sourceDocument: createdDocs[1]?._id,
        generationType: 'notes',
        generationMethod: 'ai-gemini',
        user: sampleUser._id,
        subject: 'Machine Learning',
        tags: ['study-notes', 'machine-learning', 'ai-generated'],
        status: 'completed',
        generatedAt: new Date(),
        analysis: {
          wordCount: 320,
          readingTime: 3,
          structure: {
            headers: 12,
            bulletPoints: 18,
            codeBlocks: 0
          }
        },
        quality: {
          aiConfidence: 0.89,
          completeness: 0.91
        }
      },
      {
        title: 'Summary - Web Development Fundamentals',
        content: `# Web Development Summary

## Core Technologies

### HTML (HyperText Markup Language)
- Provides the structure and content of web pages
- Uses tags to define elements like headings, paragraphs, links
- Semantic HTML improves accessibility and SEO

### CSS (Cascading Style Sheets)
- Controls the visual presentation and layout
- Includes colors, fonts, spacing, positioning
- Responsive design for different screen sizes

### JavaScript
- Adds interactivity and dynamic behavior
- Manipulates DOM elements
- Handles user events and API calls

## Modern Web Development
- **Frameworks**: React, Vue, Angular
- **Build Tools**: Webpack, Vite, Parcel
- **Version Control**: Git and GitHub
- **Deployment**: Netlify, Vercel, AWS

## Best Practices
- Write semantic, accessible HTML
- Use responsive design principles
- Optimize for performance and SEO
- Follow security best practices

This summary covers the essential concepts for getting started with web development.`,
        sourceDocument: createdDocs[2]?._id,
        generationType: 'summary',
        generationMethod: 'ai-gemini',
        user: sampleUser._id,
        subject: 'Web Development',
        tags: ['summary', 'web-development', 'ai-generated'],
        status: 'generating', // This one is still being processed
        analysis: {
          wordCount: 180,
          readingTime: 1,
          structure: {
            headers: 6,
            bulletPoints: 12,
            codeBlocks: 0
          }
        },
        quality: {
          aiConfidence: 0.85,
          completeness: 0.75
        }
      }
    ];

    // Insert generated documents if they don't exist
    for (const genDocData of sampleGeneratedDocs) {
      if (genDocData.sourceDocument) {
        const existingGenDoc = await GeneratedDocument.findOne({
          title: genDocData.title,
          user: sampleUser._id
        });
        
        if (!existingGenDoc) {
          const genDoc = new GeneratedDocument(genDocData);
          await genDoc.save();
          console.log(`Created generated document: ${genDoc.title}`);
          
          // Update source document to reference this generated document
          const sourceDoc = await Document.findById(genDocData.sourceDocument);
          if (sourceDoc) {
            const materialType = genDocData.generationType + 's';
            if (!sourceDoc.generatedMaterials) {
              sourceDoc.generatedMaterials = {};
            }
            if (!sourceDoc.generatedMaterials[materialType]) {
              sourceDoc.generatedMaterials[materialType] = [];
            }
            sourceDoc.generatedMaterials[materialType].push(genDoc._id);
            await sourceDoc.save();
          }
        }
      }
    }

    console.log('✅ Database initialization completed!');
    console.log('📊 Collections created:');
    console.log('  - documents (uploaded files)');
    console.log('  - generatedDocuments (AI-generated content)');
    console.log('  - users (user accounts)');
    
    // Show collection stats
    const docCount = await Document.countDocuments();
    const genDocCount = await GeneratedDocument.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log('\n📈 Collection counts:');
    console.log(`  - documents: ${docCount}`);
    console.log(`  - generatedDocuments: ${genDocCount}`);
    console.log(`  - users: ${userCount}`);

  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    process.exit();
  }
};

// Run the initialization
initializeCollections();