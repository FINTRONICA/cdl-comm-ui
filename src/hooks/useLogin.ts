import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin as useLoginMutation } from './useAuthQuery';
import { LoginCredentials } from '../types/auth';
import { SessionService } from '../services/sessionService';

export interface LoginState {
  isLoading: boolean;
  error: string;
  success: string;
}

export interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  state: LoginState;
  clearError: () => void;
  clearSuccess: () => void;
}

export function useLogin(): UseLoginReturn {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  
  const [state, setState] = useState<LoginState>({
    isLoading: false,
    error: '',
    success: ''
  });

  const login = async (credentials: LoginCredentials) => {
    // Validate input
    if (!credentials.username || !credentials.password) {
      setState(prev => ({ ...prev, error: 'Please fill in all fields' }));
      return;
    }

    if (credentials.username.length < 3) {
      setState(prev => ({ ...prev, error: 'Username must be at least 3 characters long' }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: '', 
      success: '' 
    }));

    try {
      // Use React Query mutation
      await loginMutation.mutateAsync(credentials);

      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        success: 'Login successful! Redirecting...' 
      }));
      
      console.log('About to redirect to dashboard...');
      
      // Start session service for client-side session management
      SessionService.startSession();
      
      // Use replace instead of push to avoid navigation history issues
      router.replace('/dashboard');

    } catch (error: unknown) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle different error types
      const errorData = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
      if (errorData?.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (errorData?.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (errorData?.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (errorData?.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (errorData?.response?.data?.message) {
        errorMessage = errorData.response.data.message;
      }

      setState(prev => ({ 
        ...prev, 
        error: errorMessage 
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: '' }));
  };

  const clearSuccess = () => {
    setState(prev => ({ ...prev, success: '' }));
  };

  return {
    login,
    state: {
      ...state,
      isLoading: state.isLoading || loginMutation.isPending
    },
    clearError,
    clearSuccess
  };
} 