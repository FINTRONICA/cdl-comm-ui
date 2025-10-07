// User Management API Types

export interface Role {
    id: string
    name: string
}

export interface Group {
    id: string
    name: string
}

// Group/Permission interface for the groups API
export interface AuthGroup {
    id: string
    name: string
    path: string
    parentId: string | null
    subGroupCount: number
    subGroups: AuthGroup[]
    attributes: Record<string, unknown>
    realmRoles: string[]
    clientRoles: Record<string, unknown>
    access: {
        view: boolean
        viewMembers: boolean
        manageMembers: boolean
        manage: boolean
        manageMembership: boolean
    }
}

export interface UserWithRolesAndGroups {
  userId: string;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  roles: Role[];
  groups: Group[];
}

export interface UserManagementResponse {
  users: UserWithRolesAndGroups[];
  totalCount?: number;
  page?: number;
  size?: number;
}

// Legacy user type for backward compatibility
export interface LegacyUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'investor';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Utility type to convert new user format to legacy format
export type UserAdapter = (user: UserWithRolesAndGroups) => LegacyUser;

// Helper function to adapt new user format to legacy format
export const adaptUserToLegacy: UserAdapter = (user: UserWithRolesAndGroups): LegacyUser => {
  // Determine primary role based on roles array
  const primaryRole = user.roles.find(role => 
    role.name === 'ROLE_ADMIN' || 
    role.name === 'ROLE_MAKER' || 
    role.name === 'ROLE_CHECKER'
  );
  
  let legacyRole: 'admin' | 'user' | 'investor' = 'user';
  
  if (primaryRole) {
    switch (primaryRole.name) {
      case 'ROLE_ADMIN':
        legacyRole = 'admin';
        break;
      case 'ROLE_BUILD_PARTNER':
        legacyRole = 'investor';
        break;
      default:
        legacyRole = 'user';
    }
  }

  return {
    id: user.userId,
    email: user.email,
    name: `${user.firstname} ${user.lastname}`,
    role: legacyRole,
    isActive: true, // Default to active since new API doesn't provide this
    createdAt: new Date().toISOString(), // Default since new API doesn't provide this
    updatedAt: new Date().toISOString(), // Default since new API doesn't provide this
  };
};

// Type for API response
export type GetUsersWithRolesAndGroupsResponse = UserWithRolesAndGroups[];
