import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'
import { apiClient } from '@/lib/apiClient';

export interface Group {
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

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface CreateGroupResponse {
  message?: string;
  group: Group;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
}

class GroupService {
  /**
   * Create a new group
   */
  async createGroup(data: CreateGroupRequest): Promise<CreateGroupResponse> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH_ADMIN_GROUP.CREATE_GROUP,
        data
      ) as { data: CreateGroupResponse };
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error(error.response.data.error || 'Group already exists');
      }
      throw new Error(error.response?.data?.error || 'Failed to create group');
    }
  }

  /**
   * Get all groups
   */
  async getGroups(params: { page?: number; size?: number; search?: string } = {}): Promise<Group[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.size !== undefined) queryParams.append('size', params.size.toString());
      if (params.search) queryParams.append('search', params.search);

      const url = buildApiUrl(API_ENDPOINTS.AUTH_ADMIN_GROUP.GET_ALL_GROUPS) + 
        (queryParams.toString() ? `?${queryParams.toString()}` : '');

      const response = await apiClient.get(url);
      
      // The API returns the array directly, not wrapped in a data property
      const result = Array.isArray(response) ? response : (Array.isArray((response as any).data) ? (response as any).data : []);
      return result;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch groups');
    }
  }

  /**
   * Get group by name
   */
  async getGroupByName(groupName: string): Promise<Group> {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.AUTH_ADMIN_GROUP.GET_GROUP_BY_NAME(groupName)
      ) as { data: Group };
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Group not found');
      }
      throw new Error(error.response?.data?.error || 'Failed to fetch group');
    }
  }

  /**
   * Update group
   */
  async updateGroup(groupId: string, data: UpdateGroupRequest): Promise<Group> {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.AUTH_ADMIN_GROUP.UPDATE(groupId),
        data
      ) as { data: Group };
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Group not found');
      }
      if (error.response?.status === 409) {
        throw new Error('Group name already exists');
      }
      throw new Error(error.response?.data?.error || 'Failed to update group');
    }
  }

  /**
   * Delete group
   */
  async deleteGroup(groupId: string): Promise<void> {
    try {
      await apiClient.delete(
        API_ENDPOINTS.AUTH_ADMIN_GROUP.DELETE(groupId)
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Group not found');
      }
      throw new Error(error.response?.data?.error || 'Failed to delete group');
    }
  }

  /**
   * Check if group exists
   */
  async checkGroupExists(groupName: string): Promise<boolean> {
    try {
      await this.getGroupByName(groupName);
      return true;
    } catch (error: any) {
      if (error.message === 'Group not found') {
        return false;
      }
      throw error;
    }
  }
}

export const groupService = new GroupService();
