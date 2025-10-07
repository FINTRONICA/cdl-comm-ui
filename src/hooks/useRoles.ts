import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { 
  roleService, 
  type Role, 
  type CreateRoleRequest, 
  type UpdateRoleRequest 
} from '@/services/api/roleService'
import { useIsAuthenticated } from './useAuthQuery'

export const ROLES_QUERY_KEY = 'roles'

// Hook to fetch all roles with pagination and filters
export function useRoles(page = 0, size = 20, search?: string) {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY, { page, size, search }],
    queryFn: async () => {
      const result = await roleService.getRoles({ page, size, ...(search && { search }) })
      return result
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3, // Banking: retry on failure
  })
}

// Hook to fetch a single role by name
export function useRole(roleName: string) {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY, roleName],
    queryFn: () => roleService.getRoleByName(roleName),
    enabled: !!roleName, // Only run if roleName exists
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Hook to create a new role
export function useCreateRole() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateRoleRequest) => roleService.createRole(data),
    onSuccess: () => {
      // Invalidate and refetch roles list
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] })
    },
    retry: 2, // Banking: retry on failure
  })
}

// Hook to update an existing role
export function useUpdateRole() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ roleName, updates }: { roleName: string; updates: UpdateRoleRequest }) => 
      roleService.updateRole(roleName, updates),
    onSuccess: (_, { roleName }) => {
      // Invalidate both the list and the specific role
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY, roleName] })
    },
    retry: 2,
  })
}

// Hook to delete a role
export function useDeleteRole() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (roleName: string) => roleService.deleteRole(roleName),
    onSuccess: () => {
      // Invalidate roles list after deletion
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] })
    },
    retry: 2,
  })
}

// Hook to check if role exists
export function useCheckRoleExists() {
  return useMutation({
    mutationFn: (roleName: string) => roleService.checkRoleExists(roleName),
    retry: 1, // Don't retry existence checks
  })
}

// Hook to refetch all roles data (useful for manual refresh)
export function useRefreshRoles() {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] })
  }
}

// Hook to search roles
export function useSearchRoles() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (searchTerm: string) => roleService.getRoles({ search: searchTerm }),
    onSuccess: (data) => {
      // Update cache with search results
      queryClient.setQueryData([ROLES_QUERY_KEY, { search: true }], data)
    },
    retry: 2,
  })
}

// Unified role management hook
export function useRoleManager() {
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()
  const checkRoleExists = useCheckRoleExists()
  const refreshRoles = useRefreshRoles()

  const createRoleDirect = useCallback(async (data: CreateRoleRequest) => {
    // Create the role directly without checking existence
    return await createRole.mutateAsync(data)
  }, [createRole])

  const updateRoleWithValidation = useCallback(async (
    roleName: string, 
    updates: UpdateRoleRequest
  ) => {
    // If name is being updated, check if new name already exists
    if (updates.name && updates.name !== roleName) {
      const exists = await checkRoleExists.mutateAsync(updates.name)
      if (exists) {
        throw new Error('Role name already exists')
      }
    }
    
    // Update the role
    return await updateRole.mutateAsync({ roleName, updates })
  }, [updateRole, checkRoleExists])

  return {
    // CRUD operations
    createRole: createRoleDirect,
    updateRole: updateRoleWithValidation,
    deleteRole: deleteRole.mutateAsync,
    checkRoleExists: checkRoleExists.mutateAsync,
    refreshRoles,
    
    // Loading states
    isCreating: createRole.isPending,
    isUpdating: updateRole.isPending,
    isDeleting: deleteRole.isPending,
    isChecking: checkRoleExists.isPending,
    
    // Error states
    createError: createRole.error,
    updateError: updateRole.error,
    deleteError: deleteRole.error,
    checkError: checkRoleExists.error,
    
    // Combined loading state
    isLoading: createRole.isPending || updateRole.isPending || deleteRole.isPending || checkRoleExists.isPending,
    
    // Combined error state
    error: createRole.error || updateRole.error || deleteRole.error || checkRoleExists.error,
  }
}

// Hook for role validation
export function useRoleValidation() {
  const checkRoleExists = useCheckRoleExists()
  
  const validateRoleName = useCallback(async (
    name: string, 
    excludeRoleName?: string
  ): Promise<{ isValid: boolean; error?: string }> => {
    // Basic validation
    if (!name || name.trim().length === 0) {
      return {
        isValid: false,
        error: 'Role name is required',
      }
    }

    if (name.trim().length < 2) {
      return {
        isValid: false,
        error: 'Role name must be at least 2 characters',
      }
    }

    if (name.trim().length > 50) {
      return {
        isValid: false,
        error: 'Role name must be less than 50 characters',
      }
    }

    // Check naming convention (uppercase with underscores)
    if (!/^[A-Z_][A-Z0-9_]*$/.test(name.trim())) {
      return {
        isValid: false,
        error: 'Role name must start with uppercase letter and contain only uppercase letters, numbers, and underscores (e.g., ROLE_ADMIN)',
      }
    }

    // Check for reserved names
    const reservedNames = ['ROOT', 'ADMIN', 'USER', 'GUEST', 'SYSTEM']
    if (reservedNames.includes(name.trim().toUpperCase())) {
      return {
        isValid: false,
        error: 'This role name is reserved and cannot be used',
      }
    }

    // If we're editing and the name hasn't changed, it's valid
    if (excludeRoleName && name === excludeRoleName) {
      return { isValid: true }
    }

    // Check if role already exists
    try {
      const exists = await checkRoleExists.mutateAsync(name.trim())
      if (exists) {
        return {
          isValid: false,
          error: 'Role name already exists',
        }
      }
    } catch (error: any) {
      return {
        isValid: false,
        error: 'Failed to check role availability',
      }
    }

    return { isValid: true }
  }, [checkRoleExists])

  return {
    validateRoleName,
    isChecking: checkRoleExists.isPending,
    error: checkRoleExists.error,
  }
}
