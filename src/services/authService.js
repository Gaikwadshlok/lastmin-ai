// Authentication Service
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

// Handle response errors
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (userData) => authAPI.post('/register', userData),
  login: (credentials) => authAPI.post('/login', credentials),
  getProfile: () => authAPI.get('/profile'),
  updateProfile: (data) => authAPI.put('/profile', data),
  changePassword: (passwords) => authAPI.post('/change-password', passwords),
  logout: () => authAPI.post('/logout'),
};

export default authService;
