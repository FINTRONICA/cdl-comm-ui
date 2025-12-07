import { useCallback, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { EnhancedSessionService } from '@/services/enhancedSessionService';

export const useSessionAwareAutoSave = (options: {
  interval?: number;
  debounceMs?: number;
  onSave: (data: any) => Promise<void>;
  onError?: (error: Error) => void;
  enabled?: boolean;
}) => {
  const { interval = 30000, debounceMs = 2000, onSave, onError, enabled = true } = options;
  const formContext = useFormContext();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<number>(0);

  const debouncedSave = useCallback((data: any) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Check if session is still valid before saving
        if (EnhancedSessionService.checkSessionTimeout()) {
          console.warn('Session expired, skipping auto-save');
          return;
        }

        await onSave(data);
        lastSaveRef.current = Date.now();
        
        // Update session activity after successful save
        EnhancedSessionService.updateActivity();
      } catch (error) {
        onError?.(error as Error);
      }
    }, debounceMs);
  }, [onSave, onError, debounceMs]);

  useEffect(() => {
    if (!enabled || !formContext) return;

    const { watch } = formContext;
    const subscription = watch((data) => {
      debouncedSave(data);
    });

    return () => {
      subscription.unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [enabled, formContext, debouncedSave]);

  return {
    lastSaveTime: lastSaveRef.current,
    isSessionValid: !EnhancedSessionService.checkSessionTimeout()
  };
};
