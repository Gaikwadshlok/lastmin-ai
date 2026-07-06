// Notes Service
// src/services/notesService.js
import axios from 'axios';
import API_BASE_URL from '../config/api.js';

const notesAPI = axios.create({
  baseURL: `${API_BASE_URL}/notes`,
  timeout: 15000,
});

// Add auth token to requests
notesAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const notesService = {
  // Get user's notes with optional filters
  getNotes: (params = {}) => notesAPI.get('/', { params }),
  
  // Get notes by document ID
  getNotesByDocument: (documentId) => notesAPI.get(`/document/${documentId}`),
  
  // Get note by ID
  getNote: (id) => notesAPI.get(`/${id}`),
  
  // Generate notes from document (AI-powered or manual)
  generateNotesFromDocument: (documentId, noteData) => notesAPI.post(`/generate/${documentId}`, noteData),
  
  // Update note
  updateNote: (id, noteData) => notesAPI.put(`/${id}`, noteData),
  
  // Delete note
  deleteNote: (id) => notesAPI.delete(`/${id}`),
  
  // Legacy compatibility methods
  createNote: (noteData) => {
    // If documentId is provided, use the new generate endpoint
    if (noteData.documentId || noteData.sourceDocument) {
      const docId = noteData.documentId || noteData.sourceDocument;
      return notesAPI.post(`/generate/${docId}`, noteData);
    }
    // For standalone notes, we'd need a separate endpoint
    throw new Error('Creating notes without a source document is not currently supported');
  },
  
  generateNotes: (documentId, title, subject, content = '', tags = []) => {
    return notesAPI.post(`/generate/${documentId}`, {
      title,
      subject,
      content,
      tags
    });
  }
};

export default notesService;
