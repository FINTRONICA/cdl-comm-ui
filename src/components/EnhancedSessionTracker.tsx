'use client'

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { EnhancedSessionService } from '../services/enhancedSessionService';
import { JWTParser } from '../utils/jwtParser';
import { getAuthCookies, clearAuthCookies } from '../utils/cookieUtils';

export function EnhancedSessionTracker() {
  const { isAuthenticated } = useAuthStore();
  const warningShownRef = useRef(false);
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Start enhanced session management
    EnhancedSessionService.startSession();
    
    const events = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart',
      'click', 'input', 'change', 'focus', 'blur'
    ];
    
    const handleActivity = () => {
      EnhancedSessionService.updateActivity();
      warningShownRef.current = false; // Reset warning when user is active
    };
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });
    
    // Enhanced visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        const { token } = getAuthCookies();
        
        if (token && JWTParser.isExpired(token)) {
          // Try to refresh token first
          EnhancedSessionService.extendSession().catch(() => {
            // If refresh fails, handle session expiry
            useAuthStore.getState().clearUser();
            clearAuthCookies();
            
            const currentPath = window.location.pathname;
            if (currentPath !== '/login') {
              import('../utils/navigation').then(({ serviceNavigation }) => {
                serviceNavigation.goToLogin(currentPath);
              });
            }
          });
        }
      }
    };
    
    // Session warning handler
    const handleSessionWarning = () => {
      if (EnhancedSessionService.shouldShowWarning() && !warningShownRef.current) {
        warningShownRef.current = true;
        showSessionWarning();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check for session warnings every 30 seconds
    const warningInterval = setInterval(handleSessionWarning, 30000);
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(warningInterval);
      EnhancedSessionService.destroy();
    };
  }, [isAuthenticated]);
  
  return null;
}

function showSessionWarning() {
  // Create a custom warning dialog
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  dialog.innerHTML = `
    <div style="background: white; padding: 20px; border-radius: 8px; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Session Expiring Soon</h3>
      <p style="margin: 0 0 20px 0; color: #666; line-height: 1.5;">Your session will expire in 5 minutes due to inactivity. Would you like to extend your session?</p>
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button id="extend-session" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Extend Session</button>
        <button id="logout-now" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Logout</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);
  
  dialog.querySelector('#extend-session')?.addEventListener('click', () => {
    EnhancedSessionService.extendSession();
    document.body.removeChild(dialog);
  });
  
  dialog.querySelector('#logout-now')?.addEventListener('click', () => {
    EnhancedSessionService.handleSessionExpiry();
    document.body.removeChild(dialog);
  });
}
