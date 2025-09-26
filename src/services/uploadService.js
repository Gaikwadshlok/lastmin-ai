// Upload Service
// src/services/uploadService.js
import axios from 'axios';
import API_BASE_URL from '../config/api.js';

const uploadAPI = axios.create({
  baseURL: `${API_BASE_URL}/upload`,
  timeout: 30000, // Longer timeout for file uploads
});

// Add auth token to requests
uploadAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadService = {
  // Upload document
  uploadDocument: (formData) => uploadAPI.post('/document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Get user's documents
  getUserDocuments: (params = {}) => uploadAPI.get('/documents', { params }),
  
  // Get document by ID
  getDocument: (id) => uploadAPI.get(`/documents/${id}`),
  
  // Delete document
  deleteDocument: (id) => uploadAPI.delete(`/documents/${id}`),
  
  // Download document
  downloadDocument: (id) => uploadAPI.get(`/documents/${id}/download`, {
    responseType: 'blob'
  }),
};

export default uploadService;
