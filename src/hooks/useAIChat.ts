import { useMutation } from '@tanstack/react-query';
import { aiService } from '@/services/aiService.js';

export const useAIChat = () => useMutation({
  mutationFn: (payload: { message: string; context?: string }) =>
    aiService.chat(payload.message, payload.context || '').then(r => r.data.data || r.data)
});
