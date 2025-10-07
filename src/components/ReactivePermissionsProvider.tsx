'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { usePermissionsStorageSync } from '@/store/reactivePermissionsStore'

/**
 * Provider component that initializes the reactive permissions system
 * This component should be placed high in the component tree to ensure
 * permissions are synced across all components
 */
export const ReactivePermissionsProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const { isAuthenticated, userId } = useAuthStore()

  // Enable reactive permissions storage sync
  usePermissionsStorageSync()

  useEffect(() => {}, [isAuthenticated, userId])

  return <>{children}</>
}

/**
 * Hook to manually trigger permission refresh
 * Useful for admin panels or when permissions are updated externally
 */
export const usePermissionRefresh = () => {
  const { userId, fetchUserPermissions } = useAuthStore()

  const refreshPermissions = async () => {
    if (userId) {
      await fetchUserPermissions(userId)
    } else {
    }
  }

  return { refreshPermissions }
}

/**
 * Component that provides a manual refresh button for permissions
 * Useful for testing or admin interfaces
 */
export const PermissionRefreshButton: React.FC<{
  className?: string
  children?: React.ReactNode
}> = ({ className = '', children = 'Refresh Permissions' }) => {
  const { refreshPermissions } = usePermissionRefresh()

  return (
    <button
      onClick={refreshPermissions}
      className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${className}`}
    >
      {children}
    </button>
  )
}
