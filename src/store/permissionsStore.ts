import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Permission } from '@/types/permissions'
import { authAdminUserService } from '@/services/api/authAdminUserService'

interface PermissionsState {
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

export const usePermissionsStore = create<PermissionsState>()(
  persist(
    (set, get) => ({
      permissions: [],
      permissionMap: new Map(),
      isLoading: false,
      error: null,
      lastFetched: null,
      
      setPermissions: (permissions) => {
        
        const permissionMap = new Map<string, Permission>()
        permissions.forEach(permission => {
          permissionMap.set(permission.name, permission)
        })
        
        set({ 
          permissions, 
          permissionMap,
          lastFetched: Date.now(),
          error: null 
        })
     
      },
      
      fetchUserPermissions: async (userId: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const permissions = await authAdminUserService.getUserPermissionsSimple(userId)
          get().setPermissions(permissions)
          set({ isLoading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch permissions'
          set({ 
            isLoading: false, 
            error: errorMessage,
            permissions: [],
            permissionMap: new Map()
          })
          
        }
      },
      
      clearPermissions: () => 
        set({ 
          permissions: [], 
          permissionMap: new Map(),
          error: null, 
          lastFetched: null 
        }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
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
    }),
    {
      name: 'permissions-storage',
      partialize: (state) => ({
        permissions: state.permissions,
        lastFetched: state.lastFetched,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.permissions && Array.isArray(state.permissions)) {
          // Rebuild the permission map after rehydration
          const permissionMap = new Map<string, Permission>()
          state.permissions.forEach(permission => {
            permissionMap.set(permission.name, permission)
          })
          state.permissionMap = permissionMap
          
        }
      },
    }
  )
)

// Utility functions for permission checking outside of components
export const checkPermission = (permissionName: string): boolean => {
  return usePermissionsStore.getState().hasPermission(permissionName)
}

export const checkAnyPermission = (permissionNames: string[]): boolean => {
  return usePermissionsStore.getState().hasAnyPermission(permissionNames)
}

export const checkAllPermissions = (permissionNames: string[]): boolean => {
  return usePermissionsStore.getState().hasAllPermissions(permissionNames)
}

// Specific permission group helpers
export const getBuildPartnerPermissions = () => {
  const store = usePermissionsStore.getState()
  const buildPartnerPerms = store.getPermissionsByPrefix('build_partner_')
  
  return {
    all: buildPartnerPerms,
    canCreate: store.hasPermission('build_partner_create'),
    canView: store.hasPermission('build_partner_view'),
    canUpdate: store.hasPermission('build_partner_update'),
    canDelete: store.hasPermission('build_partner_delete'),
  }
}

export const getCapitalPartnerPermissions = () => {
  const store = usePermissionsStore.getState()
  return store.getPermissionsByPrefix('capital_partner_')
}

export const getUserManagementPermissions = () => {
  const store = usePermissionsStore.getState()
  return store.getPermissionsByPrefix('user_management_')
}

// Hook for easy permission checking in components
export const usePermissionCheck = () => {
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
  } = usePermissionsStore()
  
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

// Hook for loading permissions
export const usePermissionsLoader = () => {
  const { fetchUserPermissions, isLoading, error, clearPermissions } = usePermissionsStore()
  
  return {
    fetchUserPermissions,
    isLoading,
    error,
    clearPermissions,
  }
}
