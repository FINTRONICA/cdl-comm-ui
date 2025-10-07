import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Deal Subtype API Service
export const dealSubtypeService = {
  // Get all deal subtypes
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.DEAL_SUBTYPE.GET_ALL)
    return response.data
  },

  // Get deal subtype by ID
  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.DEAL_SUBTYPE.GET_BY_ID(id))
    return response.data
  },

  // Create new deal subtype
  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.DEAL_SUBTYPE.SAVE, data)
    return response.data
  },

  // Update deal subtype
  update: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.DEAL_SUBTYPE.UPDATE(id), data)
    return response.data
  },

  // Delete deal subtype
  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.DEAL_SUBTYPE.DELETE(id))
    return response.data
  },

  // Soft delete deal subtype
  softDelete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.DEAL_SUBTYPE.SOFT_DELETE(id))
    return response.data
  },

  // Find all deal subtypes with filters
  findAll: async (filters?: any) => {
    const response = await apiClient.post(API_ENDPOINTS.DEAL_SUBTYPE.FIND_ALL, filters)
    return response.data
  },
}
