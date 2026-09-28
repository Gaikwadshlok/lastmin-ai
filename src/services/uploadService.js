// Upload Service
// src/services/uploadService.js
import apiClient from './apiClient.js';

// Upload requests get a longer timeout
const UPLOAD_TIMEOUT = 30000;

export const uploadService = {
  // Upload document
  uploadDocument: (formData) =>
    apiClient.post('/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: UPLOAD_TIMEOUT,
    }),

  // Get user's documents
  getUserDocuments: (params = {}) => apiClient.get('/upload/documents', { params }),

  // Get document by ID
  getDocument: (id) => apiClient.get(`/upload/documents/${id}`),

  // Delete document
  deleteDocument: (id) => apiClient.delete(`/upload/documents/${id}`),

  // Download document
  downloadDocument: (id) =>
    apiClient.get(`/upload/documents/${id}/download`, { responseType: 'blob' }),

  // Reprocess document text extraction
  reprocessDocument: (id) => apiClient.post(`/upload/documents/${id}/reprocess`),
};

export default uploadService;
