import { type StateCreator } from 'zustand'
import { type Theme } from '@/types'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  createdAt: Date
}

export interface UISlice {
  theme: Theme
  language: string
  sidebarOpen: boolean
  modalOpen: boolean
  modalType: string | null
  notifications: Notification[]
  setTheme: (theme: Theme) => void
  setLanguage: (language: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setModalOpen: (open: boolean, type?: string) => void
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const uiSlice: StateCreator<UISlice> = (set, get) => ({
  theme: 'light',
  language: 'en',
  sidebarOpen: false,
  modalOpen: false,
  modalType: null,
  notifications: [],
  
  setTheme: (theme) => {
    set({ theme })
    // DOM manipulation should be handled in the ThemeProvider component
  },
  
  setLanguage: (language) => set({ language }),
  
  toggleSidebar: () => {
    const { sidebarOpen } = get()
    set({ sidebarOpen: !sidebarOpen })
  },
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setModalOpen: (open, type) => set({
    modalOpen: open,
    modalType: type || null,
  }),
  
  addNotification: (notification) => {
    const { notifications } = get()
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    }
    
    set({ notifications: [...notifications, newNotification] })
    
    // Auto-remove notification after duration
    if (notification.duration) {
      setTimeout(() => {
        const { notifications: currentNotifications } = get()
        set({
          notifications: currentNotifications.filter(n => n.id !== newNotification.id),
        })
      }, notification.duration)
    }
  },
  
  removeNotification: (id) => {
    const { notifications } = get()
    set({
      notifications: notifications.filter(notification => notification.id !== id),
    })
  },
  
  clearNotifications: () => set({ notifications: [] }),
}) 