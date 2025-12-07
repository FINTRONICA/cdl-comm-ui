// Request type for assign/unassign roles and groups
export interface AssignUnassignRolesGroupsRequest {
  userId: string;
  roles?: string[];
  groups?: string[];
}
import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'
import { Permission, GroupMappingResponse, PageableRequest } from '@/types/permissions'
import { UserWithRolesAndGroups, GetUsersWithRolesAndGroupsResponse, adaptUserToLegacy, Role, AuthGroup } from '@/types/userManagement'

// Full AuthAdminUser interface based on your API response
export interface AuthAdminUser {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  emailVerified: boolean
  attributes?: Record<string, string[]>
  userProfileMetadata?: any
  self?: string
  createdTimestamp?: number
  enabled?: boolean
  federationLink?: string
  serviceAccountClientId?: string
  credentials?: Array<{
    id: string
    type: string
    userLabel: string
    createdDate: number
    secretData: string
    credentialData: string
    priority: number
    value: string
    temporary: boolean
    federationLink: string
  }>
  disableableCredentialTypes?: string[]
  requiredActions?: string[]
  federatedIdentities?: Array<{
    identityProvider: string
    userId: string
    userName: string
  }>
  realmRoles?: string[]
  clientRoles?: Record<string, string[]>
  clientConsents?: Array<{
    clientId: string
    grantedClientScopes: string[]
    createdDate: number
    lastUpdatedDate: number
  }>
  notBefore?: number
  groups?: string[]
  access?: Record<string, boolean>
}

// Paginated response interface
export interface PaginatedResponse<T> {
  content: T[]
  page: {
    size: number
    totalElements: number
    totalPages: number
    number: number
  }
  // Add other pagination fields if your API returns them
}

// For user creation, include all required fields
export interface CreateAuthAdminUserRequest {
  username: string
  firstName: string
  lastName: string
  email: string
  emailVerified?: boolean
  attributes?: Record<string, string[]>
  enabled?: boolean
  credentials?: Array<{
    type: string
    value: string
    temporary?: boolean
  }>
  realmRoles?: string[]
  groups?: string[]
  // Add other fields as needed
}

// types/authAdminUser.ts
export interface AuthAdminUserUpdateRequest {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  emailVerified: boolean
  attributes?: Record<string, string[]>
  userProfileMetadata?: {
    attributes: Array<{
      name: string
      displayName: string
      required: boolean
      readOnly: boolean
      annotations?: Record<string, unknown>
      validators?: Record<string, Record<string, unknown>>
      group?: string
      multivalued?: boolean
    }>
    groups: Array<{
      name: string
      displayHeader: string
      displayDescription: string
      annotations?: Record<string, unknown>
    }>
  }
  self?: string
  createdTimestamp?: number
  enabled: boolean
  federationLink?: string
  serviceAccountClientId?: string
  credentials?: Array<{
    id: string
    type: string
    userLabel?: string
    createdDate?: number
    secretData?: string
    credentialData?: string
    priority?: number
    value?: string
    temporary?: boolean
    federationLink?: string
  }>
  disableableCredentialTypes?: string[]
  requiredActions?: string[]
  federatedIdentities?: Array<{
    identityProvider: string
    userId: string
    userName: string
  }>
  realmRoles?: string[]
  clientRoles?: Record<string, string[]>
  clientConsents?: Array<{
    clientId: string
    grantedClientScopes: string[]
    createdDate?: number
    lastUpdatedDate?: number
  }>
  notBefore?: number
  groups?: string[]
  access?: Record<string, boolean>
}

  

// Table data interface for UI
export interface UserManagementData {
  userName: string
  userId: string
  username: string // Add username field to preserve the actual username
  emailId: string
  roleName: string[]
  status: string
  [key: string]: unknown // <-- Add this line
}

// Mapper: New API user to table user
export function mapUserWithRolesAndGroupsToTable(
  user: UserWithRolesAndGroups
): UserManagementData {
  return {
    userName: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
    userId: user.userId || '', // Use the actual UUID userId for API calls
    username: user.username || '', // Preserve the actual username for display
    emailId: user.email || '',
    roleName: user.roles.map(role => role.name),
    status: 'ACTIVE', // Default status since new API doesn't provide this
  }
}

// Legacy mapper: API user to table user (for backward compatibility)
export function mapAuthAdminUserToTable(
  user: AuthAdminUser
): UserManagementData {
  return {
    userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    userId: user.username || '',
    username: user.username || '', // Add username field for consistency
    emailId: user.email || '',
    roleName: user.realmRoles || [],
    status: user.enabled ? 'ACTIVE' : 'CLOSED',
  }
}

class AuthAdminUserService {
  // Assign roles and groups to user (bulk)
  async assignRolesPermissions(data: AssignUnassignRolesGroupsRequest): Promise<void> {
    const url = buildApiUrl(API_ENDPOINTS.AUTH_ADMIN_USER.ASSIGN_ROLES_PERMISSIONS_API);
    await apiClient.post(url, data);
  }

  // Unassign roles and groups from user (bulk)
  async unassignRolesPermissions(data: AssignUnassignRolesGroupsRequest): Promise<void> {
    const url = buildApiUrl(API_ENDPOINTS.AUTH_ADMIN_USER.UNASSIGN_ROLES_PERMISSIONS_API);
    await apiClient.post(url, data);
  }
  async getAll(
    page = 0,
    size = 20
  ): Promise<{
    content: UserManagementData[]
    page: PaginatedResponse<UserWithRolesAndGroups>['page']
  }> {
    // Note: The new API endpoint doesn't use pagination parameters
    const url = buildApiUrl(API_ENDPOINTS.AUTH_ADMIN_USER.GET_ALL)
    
    // The new API returns users with roles and groups structure
    const response = await apiClient.get<GetUsersWithRolesAndGroupsResponse>(url)
   
    
    // Transform the direct array response to paginated format
    const allUsers = Array.isArray(response) ? response : []
    const mappedContent = allUsers.map(mapUserWithRolesAndGroupsToTable)
    
    // Calculate pagination info based on the array
    const totalElements = allUsers.length
    const totalPages = Math.ceil(totalElements / size)
    const startIndex = page * size
    const endIndex = startIndex + size
    const paginatedContent = mappedContent.slice(startIndex, endIndex)
    
    return {
      content: paginatedContent,
      page: {
        size: size,
        totalElements: totalElements,
        totalPages: totalPages,
        number: page,
      },
    }
  }
  async getById(id: string): Promise<AuthAdminUser> {
    const url = buildApiUrl(API_ENDPOINTS.AUTH_ADMIN_USER.GET_BY_ID(id))
    return apiClient.get<AuthAdminUser>(url)
  }

  async create(data: CreateAuthAdminUserRequest): Promise<AuthAdminUser> {
    const url = buildApiUrl(API_ENDPOINTS.AUTH_ADMIN_USER.SAVE)
    return apiClient.post<AuthAdminUser>(url, data)
  }

  async update(
    id: string,
    data: AuthAdminUserUpdateRequest
  ): Promise<AuthAdminUser> {
    const url = buildApiUrl(API_ENDPOINTS.AUTH_ADMIN_USER.UPDATE(id))
    return apiClient.put<AuthAdminUser>(url, data)
  }

  async delete(id: string): Promise<void> {
    const url = buildApiUrl(API_ENDPOINTS.AUTH_ADMIN_USER.DELETE(id))
    return apiClient.delete(url)
  }

  async findAll(): Promise<AuthAdminUser[]> {
    const url = buildApiUrl(API_ENDPOINTS.AUTH_ADMIN_USER.FIND_ALL)
    return apiClient.get<AuthAdminUser[]>(url)
  }

  async getUserPermissions(
    userId: string,
    pageable: PageableRequest = { page: 0, size: 20 }
  ): Promise<GroupMappingResponse | Permission[]> {
    const url = buildApiUrl(API_ENDPOINTS.AUTH_ADMIN_USER.GROUP_MAPPING(userId))
    return apiClient.get<GroupMappingResponse | Permission[]>(url, {
      params: {
        page: pageable.page,
        size: pageable.size,
        ...(pageable.sort && { sort: pageable.sort }),
      },
    })
  }

  async getUserPermissionsSimple(userId: string): Promise<Permission[]> {
    const response = await this.getUserPermissions(userId, { page: 0, size: 1000 })
  
    // Handle direct array response or paginated response
    const permissions = Array.isArray(response) ? response : (response.content || [])
    return permissions
  }

  async getUserRolesAndGroups(userId: string): Promise<UserWithRolesAndGroups | null> {
    // First get all users with roles and groups
    const url = buildApiUrl(API_ENDPOINTS.AUTH_ADMIN_USER.GET_ALL)
    const response = await apiClient.get<GetUsersWithRolesAndGroupsResponse>(url)
    
    // Find the specific user by userId
    const allUsers = Array.isArray(response) ? response : []
    const user = allUsers.find(u => u.userId === userId)
    
    if (!user) {
      return null
    }
    
    return user
  }

  async getAllAvailableRoles(): Promise<Role[]> {
    const url = buildApiUrl(API_ENDPOINTS.AUTH_ADMIN_USER.GET_ALL_ROLES)
    const response = await apiClient.get<Role[]>(url)
    return response
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    const url = buildApiUrl(API_ENDPOINTS.AUTH_ADMIN_USER.ASSIGN_ROLE(userId, roleId))
    await apiClient.post(url)
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    const url = buildApiUrl(API_ENDPOINTS.AUTH_ADMIN_USER.REMOVE_ROLE(userId, roleId))
    await apiClient.delete(url)
  }

  async getAllAvailableGroups(): Promise<AuthGroup[]> {
    const url = buildApiUrl(API_ENDPOINTS.AUTH_ADMIN_GROUP.GET_ALL)
    const response = await apiClient.get<AuthGroup[]>(url)
    return response
  }

  async assignGroup(userId: string, groupId: string): Promise<void> {
    const url = buildApiUrl(API_ENDPOINTS.AUTH_ADMIN_GROUP.ASSIGN_GROUP(userId, groupId))
    await apiClient.post(url)
  }

  async removeGroup(userId: string, groupId: string): Promise<void> {
    const url = buildApiUrl(API_ENDPOINTS.AUTH_ADMIN_GROUP.REMOVE_GROUP(userId, groupId))
    await apiClient.delete(url)
  }
}
export const authAdminUserService = new AuthAdminUserService()
