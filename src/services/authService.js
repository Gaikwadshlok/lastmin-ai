// Authentication Service
// src/services/authService.js
import apiClient from './apiClient.js';

export const authService = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  changePassword: (passwords) => apiClient.post('/auth/change-password', passwords),
  logout: () => apiClient.post('/auth/logout'),
};

export default authService;
