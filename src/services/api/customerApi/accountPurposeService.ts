import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Account Purpose API Service
export const accountPurposeService = {
  // Get all account purposes
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ACCOUNT_PURPOSE.GET_ALL)
    return response.data
  },

  // Get account purpose by ID
  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.ACCOUNT_PURPOSE.GET_BY_ID(id))
    return response.data
  },

  // Create new account purpose
  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.ACCOUNT_PURPOSE.SAVE, data)
    return response.data
  },

  // Update account purpose
  update: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.ACCOUNT_PURPOSE.UPDATE(id), data)
    return response.data
  },

  // Delete account purpose
  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.ACCOUNT_PURPOSE.DELETE(id))
    return response.data
  },

  // Soft delete account purpose
  softDelete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.ACCOUNT_PURPOSE.SOFT_DELETE(id))
    return response.data
  },

  // Find all account purposes with filters
  findAll: async (filters?: any) => {
    const response = await apiClient.post(API_ENDPOINTS.ACCOUNT_PURPOSE.FIND_ALL, filters)
    return response.data
  },
}
