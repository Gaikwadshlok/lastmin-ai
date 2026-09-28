// Notes Service
// src/services/notesService.js
import apiClient from './apiClient.js';

export const notesService = {
  // Get user's notes with optional filters
  getNotes: (params = {}) => apiClient.get('/notes', { params }),

  // Get notes by document ID
  getNotesByDocument: (documentId) => apiClient.get(`/notes/document/${documentId}`),

  // Get note by ID
  getNote: (id) => apiClient.get(`/notes/${id}`),

  // Generate notes from document (AI-powered or manual)
  generateNotesFromDocument: (documentId, noteData) =>
    apiClient.post(`/notes/generate/${documentId}`, noteData),

  // Update note
  updateNote: (id, noteData) => apiClient.put(`/notes/${id}`, noteData),

  // Delete note
  deleteNote: (id) => apiClient.delete(`/notes/${id}`),

  // Legacy compatibility methods
  createNote: (noteData) => {
    // If documentId is provided, use the new generate endpoint
    if (noteData.documentId || noteData.sourceDocument) {
      const docId = noteData.documentId || noteData.sourceDocument;
      return apiClient.post(`/notes/generate/${docId}`, noteData);
    }
    // For standalone notes, we'd need a separate endpoint
    throw new Error('Creating notes without a source document is not currently supported');
  },

  generateNotes: (documentId, title, subject, content = '', tags = []) => {
    return apiClient.post(`/notes/generate/${documentId}`, {
      title,
      subject,
      content,
      tags,
    });
  },
};

export default notesService;
