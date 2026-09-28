// Generated Document Service
// src/services/generatedDocumentService.js
import apiClient from './apiClient.js';

export const generatedDocumentService = {
  // Get user's generated documents
  getGeneratedDocuments: (params = {}) => apiClient.get('/generated-documents', { params }),

  // Get notes specifically
  getNotes: (params = {}) =>
    apiClient.get('/generated-documents', { params: { ...params, generationType: 'notes' } }),

  // Get generated document by ID
  getGeneratedDocument: (id) => apiClient.get(`/generated-documents/${id}`),

  // Generate document from source
  generateDocument: (data) => apiClient.post('/generated-documents/generate', data),

  // Update generated document
  updateGeneratedDocument: (id, data) => apiClient.put(`/generated-documents/${id}`, data),

  // Delete generated document
  deleteGeneratedDocument: (id) => apiClient.delete(`/generated-documents/${id}`),

  // Get documents by source document
  getBySourceDocument: (sourceDocId) => apiClient.get(`/generated-documents/source/${sourceDocId}`),

  // Toggle pin status
  togglePin: (id) => apiClient.patch(`/generated-documents/${id}/pin`),

  // Update sharing settings
  updateSharing: (id, shareSettings) => apiClient.patch(`/generated-documents/${id}/share`, shareSettings),

  // Get document versions
  getVersions: (id) => apiClient.get(`/generated-documents/${id}/versions`),

  // Create new version
  createVersion: (id, changeDescription) =>
    apiClient.post(`/generated-documents/${id}/versions`, { changeDescription }),

  // Rate document
  rateDocument: (id, rating) => apiClient.patch(`/generated-documents/${id}/rate`, { rating }),

  // Get statistics
  getStats: () => apiClient.get('/generated-documents/stats'),

  // Bulk operations
  bulkDelete: (ids) => apiClient.post('/generated-documents/bulk/delete', { ids }),
  bulkUpdateTags: (ids, tags) => apiClient.post('/generated-documents/bulk/update-tags', { ids, tags }),

  // Export document
  exportDocument: (id, format = 'pdf') =>
    apiClient.get(`/generated-documents/${id}/export`, {
      params: { format },
      responseType: 'blob',
    }),
};

export default generatedDocumentService;