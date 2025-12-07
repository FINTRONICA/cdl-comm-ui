import { create } from 'zustand';
import { User } from '@/types/auth';
import { setAuthCookies, getAuthCookies, clearAuthCookies } from '@/utils/cookieUtils';
import { useReactivePermissionsStore } from './reactivePermissionsStore';
import { JWTParser } from '@/utils/jwtParser';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  setUser: (user: User | null) => void;
  setAuth: (user: User, token: string, userId?: string, refreshToken?: string) => Promise<void>;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  initializeFromCookies: () => void;
  logout: () => void;
  fetchUserPermissions: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  userId: null,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setAuth: async (user, token, userId, refreshToken) => {
    set({ user, token, isAuthenticated: true, userId: userId || null });
    setAuthCookies(token, user.role, user.name, user.email, refreshToken);
    
    // Fetch user permissions after successful authentication
    // Try to get userId from parameter, JWT token, or fallback
    const userIdToUse = userId || get().userId;
    if (userIdToUse) {
      await get().fetchUserPermissions(userIdToUse);
    } else {
      console.warn('No user ID available to fetch permissions');
    }
  },
  
  clearUser: () => {
    set({ user: null, token: null, isAuthenticated: false, userId: null });
    // Clear permissions when user logs out
    useReactivePermissionsStore.getState().clearPermissions();
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  // CLIENT-SIDE AUTH RESTORATION: Called on app initialization when user returns
  // This runs after middleware validation, restoring auth state from cookies
  initializeFromCookies: async () => {
    try {
      const { token, userType, userName, userId } = getAuthCookies();
      
      if (token && userType && userName && userId) {
    
        // Double-check token expiration (backup to middleware check)
        if (JWTParser.isExpired(token)) {
          get().clearUser();
          clearAuthCookies();
          
          // Redirect to login with current path as redirect parameter
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const isLoginPage = currentPath === '/login';
            
            if (!isLoginPage) {
              // Use dynamic import to avoid circular dependencies
              import('@/utils/navigation').then(({ serviceNavigation }) => {
                serviceNavigation.goToLogin(currentPath);
              });
            }
          }
          return;
        }
        
        // Parse JWT token to get the correct user ID
        const tokenInfo = JWTParser.extractUserInfo(token);
        const actualUserId = tokenInfo?.userId || userId; // Fallback to cookie userId if JWT parsing fails
        
        
        // Reconstruct user object from cookies
        const user: User = {
          name: userName,
          email: userId, // Using userId as email since that's how it's stored in cookies
          role: userType,
          permissions: [] // Will be fetched separately
        };
        
        // Restore auth state in Zustand store
        set({ 
          user, 
          token, 
          isAuthenticated: true, 
          userId: actualUserId // Use the correct user ID from JWT
        });
        
        // Fetch user permissions using the correct user ID from JWT
        await get().fetchUserPermissions(actualUserId);
      } else {
     
      }
    } catch (error) {
    
      get().clearUser();
      clearAuthCookies();
    }
  },
  
  logout: () => {
    get().clearUser();
    clearAuthCookies();
    // Clear permissions on logout
    useReactivePermissionsStore.getState().clearPermissions();
  },
  
  fetchUserPermissions: async (userId: string) => {
    try {
      await useReactivePermissionsStore.getState().fetchUserPermissions(userId);
    } catch (error) {
      throw error
    }
  }
}));
