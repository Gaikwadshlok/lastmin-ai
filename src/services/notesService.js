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
  // Get user's notes
  getNotes: (params = {}) => notesAPI.get('/', { params }),
  
  // Get note by ID
  getNote: (id) => notesAPI.get(`/${id}`),
  
  // Create new note
  createNote: (noteData) => notesAPI.post('/', noteData),
  
  // Update note
  updateNote: (id, noteData) => notesAPI.put(`/${id}`, noteData),
  
  // Delete note
  deleteNote: (id) => notesAPI.delete(`/${id}`),
  
  // Toggle pin status
  togglePin: (id) => notesAPI.patch(`/${id}/pin`),
  
  // Update sharing settings
  updateSharing: (id, shareSettings) => notesAPI.patch(`/${id}/share`, shareSettings),
  
  // Get note versions
  getNoteVersions: (id) => notesAPI.get(`/${id}/versions`),
  
  // Get notes statistics
  getNotesStats: () => notesAPI.get('/stats/overview'),
};

export default notesService;
