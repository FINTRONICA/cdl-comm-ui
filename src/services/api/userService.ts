import { apiClient } from '@/lib/apiClient'
import type { User, PaginatedResponse } from '@/types'
import { API_ENDPOINTS, buildApiUrl, buildPaginationParams } from '@/constants'

export interface CreateUserRequest {
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'user' | 'investor'
  phoneNumber?: string
  avatar?: string
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  avatar?: string
  isActive?: boolean
}

export class UserService {
  async getUsers(page = 0, size = 20): Promise<PaginatedResponse<User>> {
    const params = buildPaginationParams(page, size)
    const queryString = new URLSearchParams(params).toString()
    return apiClient.get<PaginatedResponse<User>>(`${buildApiUrl(API_ENDPOINTS.APPLICATION_USER.FIND_ALL)}?${queryString}`)
  }

  async getUser(id: string): Promise<User> {
    return apiClient.get<User>(buildApiUrl(API_ENDPOINTS.APPLICATION_USER.GET_BY_ID(id)))
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    return apiClient.post<User>(buildApiUrl(API_ENDPOINTS.APPLICATION_USER.SAVE), data)
  }

  async updateUser(id: string, updates: UpdateUserRequest): Promise<User> {
    return apiClient.put<User>(buildApiUrl(API_ENDPOINTS.APPLICATION_USER.UPDATE(id)), updates)
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(buildApiUrl(API_ENDPOINTS.APPLICATION_USER.DELETE(id)))
  }
}

export const userService = new UserService() 