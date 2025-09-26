import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizService } from '@/services/quizService.js';

export const quizzesKeys = {
  all: ['quizzes'] as const,
  list: (filters?: any) => ['quizzes', 'list', filters] as const,
  detail: (id: string) => ['quizzes', 'detail', id] as const,
  attempts: ['quizAttempts'] as const
};

export const useQuizzes = (filters?: any) => useQuery({
  queryKey: quizzesKeys.list(filters),
  queryFn: () => quizService.getQuizzes(filters).then(r => r.data.data || r.data)
});

export const useQuiz = (id?: string) => useQuery({
  queryKey: id ? quizzesKeys.detail(id) : quizzesKeys.detail('unknown'),
  queryFn: () => (id ? quizService.getQuiz(id).then(r => r.data.data || r.data) : Promise.resolve(null)),
  enabled: !!id
});

export const useCreateQuiz = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => quizService.createQuiz(payload).then(r => r.data.data || r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: quizzesKeys.all })
  });
};
