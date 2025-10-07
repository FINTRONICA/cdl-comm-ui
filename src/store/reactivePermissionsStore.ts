import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Permission } from '@/types/permissions'
import { authAdminUserService } from '@/services/api/authAdminUserService'
import { useLocalStorageListener } from '@/hooks/useReactiveLocalStorage'
import { useEffect } from 'react'

interface ReactivePermissionsState {
  permissions: Permission[]
  permissionMap: Map<string, Permission>
  isLoading: boolean
  error: string | null
  lastFetched: number | null
  
  // Actions
  setPermissions: (permissions: Permission[]) => void
  fetchUserPermissions: (userId: string) => Promise<void>
  clearPermissions: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  refreshFromStorage: () => void
  
  // Generic permission checkers
  hasPermission: (permissionName: string) => boolean
  hasAnyPermission: (permissionNames: string[]) => boolean
  hasAllPermissions: (permissionNames: string[]) => boolean
  getPermission: (permissionName: string) => Permission | undefined
  getPermissionsByPattern: (pattern: RegExp) => Permission[]
  
  // Get all permissions data
  getAllPermissions: () => Permission[]
  getPermissionNames: () => string[]
  getPermissionPaths: () => string[]
  
  // Permission groups helpers
  getPermissionsByPrefix: (prefix: string) => Permission[]
  getPermissionsBySuffix: (suffix: string) => Permission[]
}

// Storage key for permissions
const PERMISSIONS_STORAGE_KEY = 'permissions-storage'

// Helper function to get permissions from localStorage
const getPermissionsFromStorage = (): { permissions: Permission[], lastFetched: number | null } => {
  if (typeof window === 'undefined') {
    return { permissions: [], lastFetched: null }
  }
  
  try {
    const stored = localStorage.getItem(PERMISSIONS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        permissions: parsed.state?.permissions || [],
        lastFetched: parsed.state?.lastFetched || null
      }
    }
  } catch (error) {
    console.error('Error reading permissions from localStorage:', error)
  }
  
  return { permissions: [], lastFetched: null }
}

// Helper function to save permissions to localStorage
const savePermissionsToStorage = (permissions: Permission[], lastFetched: number | null) => {
  if (typeof window === 'undefined') return
  
  try {
    const storageData = {
      state: {
        permissions,
        lastFetched
      },
      version: 0
    }
    localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(storageData))
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('permissions-updated', {
      detail: { permissions, lastFetched }
    }))
  } catch (error) {
    console.error('Error saving permissions to localStorage:', error)
  }
}

export const useReactivePermissionsStore = create<ReactivePermissionsState>()(
  subscribeWithSelector((set, get) => {
    // Initialize from localStorage
    const { permissions: initialPermissions, lastFetched: initialLastFetched } = getPermissionsFromStorage()
    const initialPermissionMap = new Map<string, Permission>()
    initialPermissions.forEach(permission => {
      initialPermissionMap.set(permission.name, permission)
    })

    return {
      permissions: initialPermissions,
      permissionMap: initialPermissionMap,
      isLoading: false,
      error: null,
      lastFetched: initialLastFetched,
      
      setPermissions: (permissions) => {
        const permissionMap = new Map<string, Permission>()
        permissions.forEach(permission => {
          permissionMap.set(permission.name, permission)
        })
        
        const lastFetched = Date.now()
        
        set({ 
          permissions, 
          permissionMap,
          lastFetched,
          error: null 
        })
        
        // Save to localStorage and notify other components
        savePermissionsToStorage(permissions, lastFetched)
      },
      
      fetchUserPermissions: async (userId: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const permissions = await authAdminUserService.getUserPermissionsSimple(userId)
          
          // Use setPermissions which will update localStorage and trigger events
          get().setPermissions(permissions)
          set({ isLoading: false })          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch permissions'
          console.error('❌ [Reactive Permissions] Error fetching permissions:', error)
          
          set({ 
            isLoading: false, 
            error: errorMessage,
            permissions: [],
            permissionMap: new Map()
          })
          
          // Also clear localStorage on error
          savePermissionsToStorage([], null)
        }
      },
      
      clearPermissions: () => {
        set({ 
          permissions: [], 
          permissionMap: new Map(),
          error: null, 
          lastFetched: null 
        })
        
        // Clear from localStorage
        savePermissionsToStorage([], null)
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      refreshFromStorage: () => {
        const { permissions, lastFetched } = getPermissionsFromStorage()
        const permissionMap = new Map<string, Permission>()
        permissions.forEach(permission => {
          permissionMap.set(permission.name, permission)
        })
        
        set({ 
          permissions, 
          permissionMap, 
          lastFetched 
        })
      },
      
      hasPermission: (permissionName: string) => {
        const { permissionMap } = get()
        return permissionMap.has(permissionName)
      },
      
      hasAnyPermission: (permissionNames: string[]) => {
        const { permissionMap } = get()
        return permissionNames.some(name => permissionMap.has(name))
      },
      
      hasAllPermissions: (permissionNames: string[]) => {
        const { permissionMap } = get()
        return permissionNames.every(name => permissionMap.has(name))
      },
      
      getPermission: (permissionName: string) => {
        const { permissionMap } = get()
        return permissionMap.get(permissionName)
      },
      
      getPermissionsByPattern: (pattern: RegExp) => {
        const { permissions } = get()
        return permissions.filter(permission => pattern.test(permission.name))
      },
      
      getAllPermissions: () => {
        return get().permissions
      },
      
      getPermissionNames: () => {
        const { permissions } = get()
        return permissions.map(permission => permission.name)
      },
      
      getPermissionPaths: () => {
        const { permissions } = get()
        return permissions.map(permission => permission.path)
      },
      
      getPermissionsByPrefix: (prefix: string) => {
        const { permissions } = get()
        return permissions.filter(permission => permission.name.startsWith(prefix))
      },
      
      getPermissionsBySuffix: (suffix: string) => {
        const { permissions } = get()
        return permissions.filter(permission => permission.name.endsWith(suffix))
      },
    }
  })
)

// Hook to automatically sync with localStorage changes
export const usePermissionsStorageSync = () => {
  const refreshFromStorage = useReactivePermissionsStore(state => state.refreshFromStorage)
  
  useLocalStorageListener(
    PERMISSIONS_STORAGE_KEY,
    (newValue, oldValue) => {
      refreshFromStorage()
    },
    { syncAcrossTabs: true }
  )
  
  // Also listen for custom permissions-updated events
  useEffect(() => {
    const handlePermissionsUpdate = (event: CustomEvent) => {
      refreshFromStorage()
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('permissions-updated', handlePermissionsUpdate as EventListener)
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('permissions-updated', handlePermissionsUpdate as EventListener)
      }
    }
  }, [refreshFromStorage])
}

// Utility functions for permission checking outside of components
export const checkReactivePermission = (permissionName: string): boolean => {
  return useReactivePermissionsStore.getState().hasPermission(permissionName)
}

export const checkReactiveAnyPermission = (permissionNames: string[]): boolean => {
  return useReactivePermissionsStore.getState().hasAnyPermission(permissionNames)
}

export const checkReactiveAllPermissions = (permissionNames: string[]): boolean => {
  return useReactivePermissionsStore.getState().hasAllPermissions(permissionNames)
}

// Hook for easy permission checking in components with reactivity
export const useReactivePermissionCheck = () => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermission,
    getPermissionsByPattern,
    getPermissionsByPrefix,
    getPermissionsBySuffix,
    getAllPermissions,
    getPermissionNames,
  } = useReactivePermissionsStore()
  
  // Enable storage sync
  usePermissionsStorageSync()
  
  return {
    // Basic checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Data getters
    getPermission,
    getPermissionsByPattern,
    getPermissionsByPrefix,
    getPermissionsBySuffix,
    getAllPermissions,
    getPermissionNames,
    
    // Convenience methods for common patterns
    canCreate: (module: string) => hasPermission(`${module}_create`),
    canView: (module: string) => hasPermission(`${module}_view`),
    canUpdate: (module: string) => hasPermission(`${module}_update`),
    canDelete: (module: string) => hasPermission(`${module}_delete`),
    
    // Module-specific permissions
    buildPartner: {
      canCreate: hasPermission('build_partner_create'),
      canView: hasPermission('build_partner_view'),
      canUpdate: hasPermission('build_partner_update'),
      canDelete: hasPermission('build_partner_delete'),
    },
  }
}

// Hook for loading permissions with reactivity
export const useReactivePermissionsLoader = () => {
  const { fetchUserPermissions, isLoading, error, clearPermissions } = useReactivePermissionsStore()
  
  // Enable storage sync
  usePermissionsStorageSync()
  
  return {
    fetchUserPermissions,
    isLoading,
    error,
    clearPermissions,
  }
}

// Utility function to manually trigger permission refresh and localStorage update
export const triggerPermissionRefresh = async (userId: string) => {
  
  try {
    // Fetch fresh permissions from API using the correct endpoint
    // This calls: /auth-admin-user/auth/users/{userId}/group-mapping?page=0&size=1000
    const permissions = await authAdminUserService.getUserPermissionsSimple(userId)
    
    // Update the store and localStorage
    useReactivePermissionsStore.getState().setPermissions(permissions)
    
    // Force dispatch localStorage change event for cross-component updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('localStorage-change', {
        detail: { 
          key: PERMISSIONS_STORAGE_KEY, 
          value: {
            state: {
              permissions,
              lastFetched: Date.now()
            },
            version: 0
          }
        }
      }))
      
      // Also dispatch the permissions-updated event
      window.dispatchEvent(new CustomEvent('permissions-updated', {
        detail: { permissions, lastFetched: Date.now() }
      }))
    }
    
    return permissions
  } catch (error) {
    console.error('❌ [Permission Trigger] Failed to refresh permissions:', error)
    throw error
  }
}
