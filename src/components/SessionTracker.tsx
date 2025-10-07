'use client'

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { SessionController } from '../controllers/sessionController';

export function SessionTracker() {
  const { isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      SessionController.updateActivity();
    };
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isAuthenticated]);
  
  return null;
}
