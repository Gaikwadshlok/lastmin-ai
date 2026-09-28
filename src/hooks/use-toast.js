// Toast compatibility layer — wraps Sonner's toast with the old
// { title, description, variant } API so existing call sites don't change.
// src/hooks/use-toast.js

import { toast as sonnerToast } from 'sonner';

function toast({ title, description, variant, ...rest } = {}) {
  const message = title || description || '';
  const opts = {};
  if (title && description) {
    opts.description = description;
  }

  if (variant === 'destructive') {
    return sonnerToast.error(message, opts);
  }
  return sonnerToast.success(message, opts);
}

function useToast() {
  return { toast };
}

export { useToast, toast };
