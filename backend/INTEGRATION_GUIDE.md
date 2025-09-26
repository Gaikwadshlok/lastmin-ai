# LastMin AI - Backend Integration Guide

## 📊 Backend API Overview

The LastMin AI backend is now **fully operational** on **http://localhost:5000** with comprehensive API endpoints for all application features.

### 🚀 Server Status
- ✅ **Status**: Running successfully
- 🔗 **URL**: http://localhost:5000
- 📚 **API Docs**: http://localhost:5000/api
- 💚 **Health Check**: http://localhost:5000/health
- 🗄️ **Database**: MongoDB (Connected)

---

## 🛠️ API Endpoints Reference

### 🔐 Authentication Routes (`/api/auth`)
```
POST   /api/auth/register          # User registration
POST   /api/auth/login             # User login
GET    /api/auth/profile           # Get user profile
PUT    /api/auth/profile           # Update profile
POST   /api/auth/change-password   # Change password
POST   /api/auth/logout            # Logout user
```

### 👥 User Management (`/api/users`)
```
GET    /api/users                  # Get all users (admin)
GET    /api/users/:id              # Get user by ID
PUT    /api/users/:id              # Update user
DELETE /api/users/:id              # Delete user
GET    /api/users/:id/analytics    # User analytics
```

### 📁 File Upload (`/api/upload`)
```
POST   /api/upload                 # Upload documents
GET    /api/upload/user            # Get user's documents
GET    /api/upload/:id             # Get document by ID
DELETE /api/upload/:id             # Delete document
GET    /api/upload/:id/download    # Download document
```

### 🤖 AI Services (`/api/ai`)
```
POST   /api/ai/chat                # Chat with AI
POST   /api/ai/analyze             # Analyze document content
POST   /api/ai/summarize           # Generate summaries
POST   /api/ai/generate-quiz       # Generate quiz questions
GET    /api/ai/usage               # AI usage statistics
```

### 📝 Quiz Management (`/api/quiz`)
```
GET    /api/quiz                   # Get all quizzes
GET    /api/quiz/:id               # Get quiz by ID
POST   /api/quiz                   # Create new quiz
POST   /api/quiz/:id/submit        # Submit quiz attempt
GET    /api/quiz/attempts/me       # Get user's attempts
GET    /api/quiz/:id/stats         # Quiz statistics
```

### 📓 Notes Management (`/api/notes`)
```
GET    /api/notes                  # Get user's notes
GET    /api/notes/:id              # Get note by ID
POST   /api/notes                  # Create new note
PUT    /api/notes/:id              # Update note
DELETE /api/notes/:id              # Delete note
PATCH  /api/notes/:id/pin          # Toggle pin status
PATCH  /api/notes/:id/share        # Update sharing settings
GET    /api/notes/:id/versions     # Get note versions
GET    /api/notes/stats/overview   # Notes statistics
```

---

## 🔌 Frontend Integration Steps

### 1. Update API Base URL
Create or update your API configuration in the frontend:

```javascript
// src/config/api.js
const API_BASE_URL = 'http://localhost:5000/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default API_BASE_URL;
```

### 2. Create API Service Layer
Update your existing API calls to use the new backend endpoints:

```javascript
// src/services/authService.js
import axios from 'axios';
import API_BASE_URL from '../config/api.js';

const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  timeout: 10000,
});

// Add auth token to requests
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (userData) => authAPI.post('/register', userData),
  login: (credentials) => authAPI.post('/login', credentials),
  getProfile: () => authAPI.get('/profile'),
  updateProfile: (data) => authAPI.put('/profile', data),
  changePassword: (passwords) => authAPI.post('/change-password', passwords),
  logout: () => authAPI.post('/logout'),
};
```

### 3. Update Component Integration

#### Authentication Components
Update your Login/Signup components to use the new API:

```javascript
// In Login.tsx or Login.jsx
const handleLogin = async (formData) => {
  try {
    const response = await authService.login(formData);
    const { token, user } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update auth context or state
    setAuthState({ isAuthenticated: true, user, token });
    
    navigate('/dashboard');
  } catch (error) {
    console.error('Login failed:', error.response?.data?.error?.message);
    setError(error.response?.data?.error?.message || 'Login failed');
  }
};
```

#### File Upload Integration
```javascript
// src/services/uploadService.js
import axios from 'axios';
import API_BASE_URL from '../config/api.js';

const uploadAPI = axios.create({
  baseURL: `${API_BASE_URL}/upload`,
  timeout: 30000, // Longer timeout for file uploads
});

export const uploadService = {
  uploadDocument: (formData) => uploadAPI.post('/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getUserDocuments: (params) => uploadAPI.get('/user', { params }),
  getDocument: (id) => uploadAPI.get(`/${id}`),
  deleteDocument: (id) => uploadAPI.delete(`/${id}`),
  downloadDocument: (id) => uploadAPI.get(`/${id}/download`, {
    responseType: 'blob'
  }),
};
```

#### AI Chat Integration
```javascript
// src/services/aiService.js
export const aiService = {
  chat: (message, context) => axios.post(`${API_BASE_URL}/ai/chat`, { 
    message, 
    context 
  }),
  analyzeDocument: (text, documentId) => axios.post(`${API_BASE_URL}/ai/analyze`, { 
    text, 
    documentId 
  }),
  generateSummary: (text, type) => axios.post(`${API_BASE_URL}/ai/summarize`, { 
    text, 
    type 
  }),
  generateQuiz: (text, questionCount, difficulty) => 
    axios.post(`${API_BASE_URL}/ai/generate-quiz`, { 
      text, 
      questionCount, 
      difficulty 
    }),
};
```

### 4. Update Environment Variables
Create or update your frontend `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000
```

### 5. CORS Configuration
The backend is already configured to accept requests from `http://localhost:8080` (your frontend URL).

---

## 🔒 Authentication Flow

### Token-Based Authentication
1. **Login**: User receives JWT token
2. **Storage**: Token stored in localStorage
3. **Requests**: Token sent in Authorization header
4. **Validation**: Backend validates token on protected routes

### Implementation Example:
```javascript
// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setAuthState({
        isAuthenticated: true,
        user: JSON.parse(user),
        token,
        loading: false
      });
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        loading: false
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 🧪 Testing the Integration

### 1. Test API Endpoints
```bash
# Health Check
curl http://localhost:5000/health

# API Documentation
curl http://localhost:5000/api

# Test Registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### 2. Frontend Testing
1. Start backend: `cd backend && node server.js`
2. Start frontend: `cd .. && npm run dev`
3. Test user registration and login
4. Test file upload functionality
5. Test AI chat features

---

## 📋 Integration Checklist

- ✅ Backend server running on port 5000
- ✅ MongoDB connected and operational
- ✅ All API routes implemented and tested
- ✅ CORS configured for frontend requests
- ✅ Authentication system with JWT tokens
- ✅ File upload with multer configuration
- ✅ Error handling and validation
- ✅ Rate limiting and security middleware

### Next Steps for Frontend Integration:
1. 🔄 Update API service layer in frontend
2. 🔐 Implement authentication flow
3. 📁 Connect file upload components
4. 🤖 Integrate AI chat functionality
5. 📝 Connect quiz and notes features
6. 🧪 Test complete application flow

---

## 🚀 Ready for Phase 2 Development!

Your LastMin AI backend is now **production-ready** with:
- ✅ Complete RESTful API
- ✅ Secure authentication system
- ✅ File handling capabilities
- ✅ AI service integration points
- ✅ Comprehensive error handling
- ✅ MongoDB database integration

The backend is ready to support all frontend features and can handle the complete application workflow from user registration to AI-powered study assistance.
