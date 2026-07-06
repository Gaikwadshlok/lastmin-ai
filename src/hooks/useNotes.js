import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesService } from '@/services/notesService.js';
export const notesKeys = {
    all: ['notes'],
    list: (filters) => ['notes', 'list', filters],
    detail: (id) => ['notes', 'detail', id],
    byDocument: (documentId) => ['notes', 'byDocument', documentId],
    stats: ['notes', 'stats']
};
export const useNotes = (filters) => useQuery({
    queryKey: notesKeys.list(filters),
    queryFn: () => notesService.getNotes(filters).then(r => r.data.data || r.data)
});
export const useNotesByDocument = (documentId) => useQuery({
    queryKey: documentId ? notesKeys.byDocument(documentId) : notesKeys.byDocument('unknown'),
    queryFn: () => (documentId ? notesService.getNotesByDocument(documentId).then(r => r.data.data || r.data) : Promise.resolve(null)),
    enabled: !!documentId
});
export const useNote = (id) => useQuery({
    queryKey: id ? notesKeys.detail(id) : notesKeys.detail('unknown'),
    queryFn: () => (id ? notesService.getNote(id).then(r => r.data.data || r.data) : Promise.resolve(null)),
    enabled: !!id
});
export const useCreateNote = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload) => notesService.createNote(payload).then(r => r.data.data || r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: notesKeys.all })
    });
};
export const useGenerateNotesFromDocument = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ documentId, noteData }) => notesService.generateNotesFromDocument(documentId, noteData).then(r => r.data.data || r.data),
        onSuccess: (data, variables) => {
            qc.invalidateQueries({ queryKey: notesKeys.all });
            qc.invalidateQueries({ queryKey: notesKeys.byDocument(variables.documentId) });
        }
    });
};
