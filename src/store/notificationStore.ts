import { create } from 'zustand'

export interface NotificationState {
  notifications: Notification[]
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  autoClose?: boolean
}

export interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
}

export type NotificationStore = NotificationState & NotificationActions

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification: Notification = {
      id,
      autoClose: true,
      duration: 4000,
      ...notification,
    }

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }))

    // Auto-remove notification after duration
    if (newNotification.autoClose && newNotification.duration) {
      setTimeout(() => {
        get().removeNotification(id)
      }, newNotification.duration)
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  clearAllNotifications: () => {
    set({ notifications: [] })
  },
}))

// Convenience hooks for different notification types
export const useSuccessNotification = () => {
  const addNotification = useNotificationStore((state) => state.addNotification)
  
  return (title: string, message?: string) => {
    addNotification({
      type: 'success',
      title,
      ...(message && { message }),
    })
  }
}

export const useErrorNotification = () => {
  const addNotification = useNotificationStore((state) => state.addNotification)
  
  return (title: string, message?: string) => {
    addNotification({
      type: 'error',
      title,
      duration: 6000, // Longer duration for errors
      ...(message && { message }),
    })
  }
}

export const useWarningNotification = () => {
  const addNotification = useNotificationStore((state) => state.addNotification)
  
  return (title: string, message?: string) => {
    addNotification({
      type: 'warning',
      title,
      ...(message && { message }),
    })
  }
}

export const useInfoNotification = () => {
  const addNotification = useNotificationStore((state) => state.addNotification)
  
  return (title: string, message?: string) => {
    addNotification({
      type: 'info',
      title,
      ...(message && { message }),
    })
  }
}

export default useNotificationStore
