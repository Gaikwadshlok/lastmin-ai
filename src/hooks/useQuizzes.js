import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizService } from '@/services/quizService.js';
export const quizzesKeys = {
    all: ['quizzes'],
    list: (filters) => ['quizzes', 'list', filters],
    detail: (id) => ['quizzes', 'detail', id],
    attempts: ['quizAttempts']
};
export const useQuizzes = (filters) => useQuery({
    queryKey: quizzesKeys.list(filters),
    queryFn: () => quizService.getQuizzes(filters).then(r => r.data.data || r.data)
});
export const useQuiz = (id) => useQuery({
    queryKey: id ? quizzesKeys.detail(id) : quizzesKeys.detail('unknown'),
    queryFn: () => (id ? quizService.getQuiz(id).then(r => r.data.data || r.data) : Promise.resolve(null)),
    enabled: !!id
});
export const useCreateQuiz = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload) => quizService.createQuiz(payload).then(r => r.data.data || r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: quizzesKeys.all })
    });
};
