import { useMutation } from '@tanstack/react-query';
import { aiService } from '@/services/aiService.js';
export const useAIChat = () => useMutation({
    mutationFn: (payload) => aiService.chat(payload.message, payload.context || '').then(r => r.data.data || r.data)
});
