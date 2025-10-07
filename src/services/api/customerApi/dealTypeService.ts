import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Deal Type API Service
export const dealTypeService = {
  // Get all deal types
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.DEAL_TYPE.GET_ALL)
    return response.data
  },

  // Get deal type by ID
  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.DEAL_TYPE.GET_BY_ID(id))
    return response.data
  },

  // Create new deal type
  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.DEAL_TYPE.SAVE, data)
    return response.data
  },

  // Update deal type
  update: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.DEAL_TYPE.UPDATE(id), data)
    return response.data
  },

  // Delete deal type
  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.DEAL_TYPE.DELETE(id))
    return response.data
  },

  // Soft delete deal type
  softDelete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.DEAL_TYPE.SOFT_DELETE(id))
    return response.data
  },

  // Find all deal types with filters
  findAll: async (filters?: any) => {
    const response = await apiClient.post(API_ENDPOINTS.DEAL_TYPE.FIND_ALL, filters)
    return response.data
  },
}
