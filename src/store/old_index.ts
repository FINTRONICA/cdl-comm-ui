// Zustand store configuration
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useMemo } from 'react'
import { userSlice, type UserSlice } from './slices/userSlice'
import { projectSlice, type ProjectSlice } from './slices/projectSlice'
import { transactionSlice, type TransactionSlice } from './slices/transactionSlice'
import { uiSlice, type UISlice } from './slices/uiSlice'

// Combined store type
export type AppStore = UserSlice & ProjectSlice & TransactionSlice & UISlice

// Create the main store
export const useAppStore = create<AppStore>()(
  persist(
    (...a) => {
      const user = userSlice(...a)
      const project = projectSlice(...a)
      const transaction = transactionSlice(...a)
      const ui = uiSlice(...a)

      return {
        ...user,
        ...project,
        ...transaction,
        ...ui,
      }
    },
    {
      name: 'escrow-store',
      storage: createJSONStorage(() => {
        // Handle SSR - return null for localStorage on server
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return localStorage
      }),
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
        language: state.language,
      }),
    }
  )
)

// Store selectors for better performance - memoized to prevent infinite loops
export const useUser = () => useAppStore((state) => state.user)
export const useProjects = () => useAppStore((state) => state.projects)
export const useTransactions = () => useAppStore((state) => state.transactions)

export const useUI = () => {
  const theme = useAppStore((state) => state.theme)
  const language = useAppStore((state) => state.language)
  const sidebarOpen = useAppStore((state) => state.sidebarOpen)
  const modalOpen = useAppStore((state) => state.modalOpen)
  const modalType = useAppStore((state) => state.modalType)
  const notifications = useAppStore((state) => state.notifications)

  return useMemo(
    () => ({
      theme,
      language,
      sidebarOpen,
      modalOpen,
      modalType,
      notifications,
    }),
    [theme, language, sidebarOpen, modalOpen, modalType, notifications]
  )
}

// Store actions - memoized to prevent infinite loops
export const useUserActions = () => {
  const setUser = useAppStore((state) => state.setUser)
  const updateUser = useAppStore((state) => state.updateUser)
  const logout = useAppStore((state) => state.logout)

  return useMemo(
    () => ({
      setUser,
      updateUser,
      logout,
    }),
    [setUser, updateUser, logout]
  )
}

export const useProjectActions = () => {
  const setProjects = useAppStore((state) => state.setProjects)
  const addProject = useAppStore((state) => state.addProject)
  const updateProject = useAppStore((state) => state.updateProject)
  const deleteProject = useAppStore((state) => state.deleteProject)

  return useMemo(
    () => ({
      setProjects,
      addProject,
      updateProject,
      deleteProject,
    }),
    [setProjects, addProject, updateProject, deleteProject]
  )
}

export const useTransactionActions = () => {
  const setTransactions = useAppStore((state) => state.setTransactions)
  const addTransaction = useAppStore((state) => state.addTransaction)
  const updateTransaction = useAppStore((state) => state.updateTransaction)
  const deleteTransaction = useAppStore((state) => state.deleteTransaction)

  return useMemo(
    () => ({
      setTransactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
    }),
    [setTransactions, addTransaction, updateTransaction, deleteTransaction]
  )
}

export const useUIActions = () => {
  const setTheme = useAppStore((state) => state.setTheme)
  const setLanguage = useAppStore((state) => state.setLanguage)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const setModalOpen = useAppStore((state) => state.setModalOpen)
  const addNotification = useAppStore((state) => state.addNotification)
  const removeNotification = useAppStore((state) => state.removeNotification)

  return useMemo(
    () => ({
      setTheme,
      setLanguage,
      toggleSidebar,
      setSidebarOpen,
      setModalOpen,
      addNotification,
      removeNotification,
    }),
    [setTheme, setLanguage, toggleSidebar, setSidebarOpen, setModalOpen, addNotification, removeNotification]
  )
}
