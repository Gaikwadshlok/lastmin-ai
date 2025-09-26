import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesService } from '@/services/notesService.js';

export const notesKeys = {
  all: ['notes'] as const,
  list: (filters?: any) => ['notes', 'list', filters] as const,
  detail: (id: string) => ['notes', 'detail', id] as const,
  stats: ['notes', 'stats'] as const
};

export const useNotes = (filters?: any) => useQuery({
  queryKey: notesKeys.list(filters),
  queryFn: () => notesService.getNotes(filters).then(r => r.data.data || r.data)
});

export const useNote = (id?: string) => useQuery({
  queryKey: id ? notesKeys.detail(id) : notesKeys.detail('unknown'),
  queryFn: () => (id ? notesService.getNote(id).then(r => r.data.data || r.data) : Promise.resolve(null)),
  enabled: !!id
});

export const useCreateNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => notesService.createNote(payload).then(r => r.data.data || r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: notesKeys.all })
  });
};
