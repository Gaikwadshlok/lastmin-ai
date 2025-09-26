// Generated Document Service
// src/services/generatedDocumentService.js
import axios from 'axios';
import API_BASE_URL from '../config/api.js';

const generatedDocAPI = axios.create({
  baseURL: `${API_BASE_URL}/generated-documents`,
  timeout: 15000,
});

// Add auth token to requests
generatedDocAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const generatedDocumentService = {
  // Get user's generated documents
  getGeneratedDocuments: (params = {}) => generatedDocAPI.get('/', { params }),
  
  // Get generated document by ID
  getGeneratedDocument: (id) => generatedDocAPI.get(`/${id}`),
  
  // Generate document from source
  generateDocument: (data) => generatedDocAPI.post('/generate', data),
  
  // Update generated document
  updateGeneratedDocument: (id, data) => generatedDocAPI.put(`/${id}`, data),
  
  // Delete generated document
  deleteGeneratedDocument: (id) => generatedDocAPI.delete(`/${id}`),
  
  // Get documents by source document
  getBySourceDocument: (sourceDocId) => generatedDocAPI.get(`/source/${sourceDocId}`),
  
  // Toggle pin status
  togglePin: (id) => generatedDocAPI.patch(`/${id}/pin`),
  
  // Update sharing settings
  updateSharing: (id, shareSettings) => generatedDocAPI.patch(`/${id}/share`, shareSettings),
  
  // Get document versions
  getVersions: (id) => generatedDocAPI.get(`/${id}/versions`),
  
  // Create new version
  createVersion: (id, changeDescription) => generatedDocAPI.post(`/${id}/versions`, { changeDescription }),
  
  // Rate document
  rateDocument: (id, rating) => generatedDocAPI.patch(`/${id}/rate`, { rating }),
  
  // Get statistics
  getStats: () => generatedDocAPI.get('/stats'),
  
  // Bulk operations
  bulkDelete: (ids) => generatedDocAPI.post('/bulk/delete', { ids }),
  bulkUpdateTags: (ids, tags) => generatedDocAPI.post('/bulk/update-tags', { ids, tags }),
  
  // Export document
  exportDocument: (id, format = 'pdf') => generatedDocAPI.get(`/${id}/export`, {
    params: { format },
    responseType: 'blob'
  }),
};

export default generatedDocumentService;