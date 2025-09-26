# LastMin AI Backend

## 🚀 Backend Integration - Phase 2

This is the backend API for LastMin AI, providing authentication, file processing, AI integration, and data management.

## 📋 Features

### ✅ **Core Features**
- **User Authentication** - JWT-based auth with registration, login, profile management
- **File Upload & Processing** - Multi-format document support (PDF, DOCX, TXT, Images)
- **AI Integration** - OpenAI integration for content analysis and generation
- **Database Management** - MongoDB with Mongoose ODM
- **Security** - Rate limiting, CORS, helmet, input validation
- **Error Handling** - Comprehensive error handling and logging

### 🔐 **Authentication System**
- User registration and login
- JWT token management
- Password hashing with bcrypt
- Account lockout protection
- Profile management
- Role-based access control

### 📁 **File Management**
- Document upload with validation
- Text extraction from various formats
- AI-powered content analysis
- File metadata management
- Secure file storage

### 🤖 **AI Integration**
- OpenAI GPT integration
- Content summarization
- Study material generation
- Quiz question generation
- Contextual AI responses

## 🛠️ **Setup Instructions**

### 1. **Install Dependencies**
```bash
cd backend
npm install
```

### 2. **Environment Configuration**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
```

### 3. **Required Environment Variables**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/lastmin-ai

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

### 4. **Database Setup**
- Install MongoDB locally or use MongoDB Atlas
- Update MONGODB_URI in .env
- Database will be created automatically on first connection

### 5. **Start the Server**
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

## 📡 **API Endpoints**

### **Authentication (`/api/auth`)**
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user
- `PUT /profile` - Update profile
- `PUT /password` - Change password
- `POST /logout` - Logout
- `POST /refresh` - Refresh token

### **Users (`/api/users`)**
- `GET /` - Get all users (admin)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user

### **File Upload (`/api/upload`)**
- `POST /document` - Upload document
- `GET /documents` - Get user documents
- `GET /documents/:id` - Get document by ID
- `DELETE /documents/:id` - Delete document

### **AI Services (`/api/ai`)**
- `POST /analyze` - Analyze document content
- `POST /chat` - AI chat responses
- `POST /summarize` - Generate summaries
- `POST /generate-quiz` - Generate quiz questions

### **Quiz (`/api/quiz`)**
- `POST /` - Create quiz
- `GET /:id` - Get quiz
- `POST /:id/submit` - Submit quiz answers
- `GET /results/:id` - Get quiz results

### **Notes (`/api/notes`)**
- `POST /` - Create notes
- `GET /` - Get user notes
- `PUT /:id` - Update notes
- `DELETE /:id` - Delete notes

## 🏗️ **Project Structure**
```
backend/
├── config/
│   └── database.js          # Database connection
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── errorHandler.js      # Error handling
│   └── notFound.js          # 404 handler
├── models/
│   ├── User.js              # User model
│   ├── Document.js          # Document model
│   ├── Quiz.js              # Quiz model
│   └── Note.js              # Notes model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management
│   ├── upload.js            # File upload
│   ├── ai.js                # AI services
│   ├── quiz.js              # Quiz management
│   └── notes.js             # Notes management
├── utils/
│   ├── fileProcessor.js     # File processing utilities
│   ├── aiService.js         # OpenAI integration
│   └── emailService.js      # Email utilities
├── uploads/                 # File storage directory
├── .env.example             # Environment template
├── server.js                # Main server file
└── package.json             # Dependencies
```

## 🔧 **Development**

### **Available Scripts**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run build` - Build for production

### **Testing**
```bash
npm test
```

### **Debugging**
The server includes comprehensive logging and error handling. Check console output for debugging information.

## 🚀 **Deployment**

### **Environment Variables for Production**
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-super-secure-production-jwt-secret
OPENAI_API_KEY=your-openai-api-key
PORT=5000
```

### **Deployment Platforms**
- **Heroku**: Easy deployment with MongoDB Atlas
- **Vercel**: Serverless deployment
- **DigitalOcean**: VPS deployment
- **AWS**: EC2 or Lambda deployment

## 📝 **API Documentation**

Visit `http://localhost:5000/api` for API endpoint documentation.

## 🔐 **Security Features**

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API rate limiting
- **Input Validation** - Request validation with Joi
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt password hashing
- **Account Lockout** - Brute force protection

## 🤝 **Integration with Frontend**

Update your frontend API calls to point to:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## 📞 **Support**

For backend-related issues:
- Check server logs
- Verify environment variables
- Ensure database connection
- Check API endpoint documentation

---

**Phase 2 Backend Integration Complete!** 🎉
