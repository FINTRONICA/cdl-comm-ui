import type { AssignUnassignRolesGroupsRequest } from '@/services/api/authAdminUserService'
// Assign roles and groups (bulk)
export function useAssignRolesPermissions() {
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore((state) => state.userId)
  const fetchUserPermissions = usePermissionsStore((state) => state.fetchUserPermissions)
  
  return useMutation({
    mutationFn: (data: AssignUnassignRolesGroupsRequest) => authAdminUserService.assignRolesPermissions(data),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [AUTH_ADMIN_USERS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [AUTH_ADMIN_USERS_QUERY_KEY, 'roles-groups', variables.userId] })
      if (currentUserId && variables.userId === currentUserId) {
        try {
          await fetchUserPermissions(currentUserId)
        } catch (error) {
        }
      }
    },
    retry: 2,
  })
}

export function useUnassignRolesPermissions() {
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore((state) => state.userId)
  const fetchUserPermissions = usePermissionsStore((state) => state.fetchUserPermissions)
  
  return useMutation({
    mutationFn: (data: AssignUnassignRolesGroupsRequest) => authAdminUserService.unassignRolesPermissions(data),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [AUTH_ADMIN_USERS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [AUTH_ADMIN_USERS_QUERY_KEY, 'roles-groups', variables.userId] })
      if (currentUserId && variables.userId === currentUserId) {
        try {
          await fetchUserPermissions(currentUserId)
        } catch (error) {
        }
      }
    },
    retry: 2,
  })
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  authAdminUserService,
  type UserManagementData,
  type PaginatedResponse,
  type AuthAdminUser,
  type CreateAuthAdminUserRequest,
  type AuthAdminUserUpdateRequest,
} from '@/services/api/authAdminUserService'
import { UserWithRolesAndGroups, Role, AuthGroup } from '@/types/userManagement'
import { useAuthStore } from '@/store/authStore'
import { usePermissionsStore } from '@/store/permissionsStore'

export const AUTH_ADMIN_USERS_QUERY_KEY = 'authAdminUsers'

// Get all users (paginated, mapped for table)
export function useAuthAdminUsers(page = 0, size = 100) {
  return useQuery<{ content: UserManagementData[]; page: PaginatedResponse<UserWithRolesAndGroups>['page'] }>({
    queryKey: [AUTH_ADMIN_USERS_QUERY_KEY, { page, size }],
    queryFn: () => authAdminUserService.getAll(page, size),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

// Get user by ID
export function useAuthAdminUser(id: string) {
  return useQuery<AuthAdminUser>({
    queryKey: [AUTH_ADMIN_USERS_QUERY_KEY, id],
    queryFn: () => authAdminUserService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Create user
export function useCreateAuthAdminUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAuthAdminUserRequest) => authAdminUserService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTH_ADMIN_USERS_QUERY_KEY] })
    },
    retry: 1,
  })
}

// Update user
export function useUpdateAuthAdminUser() {
  const queryClient = useQueryClient()

  return useMutation<
    Awaited<ReturnType<typeof authAdminUserService.update>>,
    Error,
    { id: string; updates: AuthAdminUserUpdateRequest }
  >({
    mutationFn: ({ id, updates }) => authAdminUserService.update(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [AUTH_ADMIN_USERS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [AUTH_ADMIN_USERS_QUERY_KEY, id] })
    },
    retry: 1,
  })
}


// Delete user
export function useDeleteAuthAdminUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => authAdminUserService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTH_ADMIN_USERS_QUERY_KEY] })
    },
    retry: 1,
  })
}

// Get user roles and groups
export function useUserRolesAndGroups(userId: string) {
  return useQuery<UserWithRolesAndGroups | null>({
    queryKey: [AUTH_ADMIN_USERS_QUERY_KEY, 'roles-groups', userId],
    queryFn: () => authAdminUserService.getUserRolesAndGroups(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Get all available roles
export function useAllAvailableRoles() {
  return useQuery<Role[]>({
    queryKey: ['allAvailableRoles'],
    queryFn: () => authAdminUserService.getAllAvailableRoles(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  })
}

// Get all available groups
export function useAllAvailableGroups() {
  return useQuery<AuthGroup[]>({
    queryKey: ['allAvailableGroups'],
    queryFn: () => authAdminUserService.getAllAvailableGroups(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  })
}

// Assign role to user
export function useAssignRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      authAdminUserService.assignRole(userId, roleId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: [AUTH_ADMIN_USERS_QUERY_KEY, 'roles-groups', userId] })
      queryClient.invalidateQueries({ queryKey: [AUTH_ADMIN_USERS_QUERY_KEY] })
    },
    retry: 1,
  })
}

// Remove role from user
export function useRemoveRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      authAdminUserService.removeRole(userId, roleId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: [AUTH_ADMIN_USERS_QUERY_KEY, 'roles-groups', userId] })
      queryClient.invalidateQueries({ queryKey: [AUTH_ADMIN_USERS_QUERY_KEY] })
    },
    retry: 1,
  })
}

// Assign group to user
export function useAssignGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, groupId }: { userId: string; groupId: string }) =>
      authAdminUserService.assignGroup(userId, groupId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: [AUTH_ADMIN_USERS_QUERY_KEY, 'roles-groups', userId] })
      queryClient.invalidateQueries({ queryKey: [AUTH_ADMIN_USERS_QUERY_KEY] })
    },
    retry: 1,
  })
}

// Remove group from user
export function useRemoveGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, groupId }: { userId: string; groupId: string }) =>
      authAdminUserService.removeGroup(userId, groupId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: [AUTH_ADMIN_USERS_QUERY_KEY, 'roles-groups', userId] })
      queryClient.invalidateQueries({ queryKey: [AUTH_ADMIN_USERS_QUERY_KEY] })
    },
    retry: 1,
  })
}
