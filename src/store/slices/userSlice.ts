import { type StateCreator } from 'zustand'
import { type User } from '@/types'

export interface UserSlice {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const userSlice: StateCreator<UserSlice> = (set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  setUser: (user) => set({
    user,
    isAuthenticated: !!user,
    error: null,
  }),
  
  updateUser: (updates) => {
    const { user } = get()
    if (user) {
      set({
        user: { ...user, ...updates },
      })
    }
  },
  
  logout: () => set({
    user: null,
    isAuthenticated: false,
    error: null,
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
}) 