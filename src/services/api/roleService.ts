import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'
import { apiClient } from '@/lib/apiClient';

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  scopeParamRequired?: boolean | null;
  composite: boolean;
  composites?: any | null;
  clientRole: boolean;
  containerId: string;
  attributes?: any | null;
}

export interface CreateRoleRequest {
  name: string;
}

export interface CreateRoleResponse {
  message?: string;
  role: Role;
}

export interface UpdateRoleRequest {
  name?: string;
}

class RoleService {
  /**
   * Create a new role
   */
  async createRole(data: CreateRoleRequest): Promise<CreateRoleResponse> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH_ADMIN_USER.CREATE_ROLE,
        data
      ) as { data: CreateRoleResponse };
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error(error.response.data.error || 'Role already exists');
      }
      throw new Error(error.response?.data?.error || 'Failed to create role');
    }
  }

  /**
   * Get all roles
   */
  async getRoles(params: { page?: number; size?: number; search?: string } = {}): Promise<Role[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.size !== undefined) queryParams.append('size', params.size.toString());
      if (params.search) queryParams.append('search', params.search);

      const url = buildApiUrl(API_ENDPOINTS.AUTH_ADMIN_USER.GET_ALL_ROLES) + 
        (queryParams.toString() ? `?${queryParams.toString()}` : '');

      const response = await apiClient.get(url);
      
      // The API returns the array directly, not wrapped in a data property
      const result = Array.isArray(response) ? response : (Array.isArray((response as any).data) ? (response as any).data : []);
      return result;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch roles');
    }
  }

  /**
   * Get role by name
   */
  async getRoleByName(roleName: string): Promise<Role> {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.AUTH_ADMIN_USER.GET_ROLE_BY_NAME(roleName)
      ) as { data: Role };
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Role not found');
      }
      throw new Error(error.response?.data?.error || 'Failed to fetch role');
    }
  }

  /**
   * Update role
   */
  async updateRole(roleName: string, data: UpdateRoleRequest): Promise<Role> {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.AUTH_ADMIN_USER.GET_ROLE_BY_NAME(roleName),
        data
      ) as { data: Role };
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Role not found');
      }
      if (error.response?.status === 409) {
        throw new Error('Role name already exists');
      }
      throw new Error(error.response?.data?.error || 'Failed to update role');
    }
  }

  /**
   * Delete role
   */
  async deleteRole(roleName: string): Promise<void> {
    try {
      await apiClient.delete(
        API_ENDPOINTS.AUTH_ADMIN_USER.GET_ROLE_BY_NAME(roleName)
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Role not found');
      }
      throw new Error(error.response?.data?.error || 'Failed to delete role');
    }
  }

  /**
   * Check if role exists
   */
  async checkRoleExists(roleName: string): Promise<boolean> {
    try {
      await this.getRoleByName(roleName);
      return true;
    } catch (error: any) {
      if (error.message === 'Role not found') {
        return false;
      }
      throw error;
    }
  }
}

export const roleService = new RoleService();
