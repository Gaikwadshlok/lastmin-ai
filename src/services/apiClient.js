// Shared API Client
// src/services/apiClient.js
//
// Single axios instance with auth interceptor. All service modules
// import this instead of creating their own axios.create().

import axios from 'axios';
import API_BASE_URL from '../config/api.js';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handler — redirect on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on auth pages
      if (!['/login', '/signup', '/'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
