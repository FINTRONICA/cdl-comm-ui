import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Investment Master API Service
export const investmentMasterService = {
  // Get all investment masters
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.INVESTMENT_MASTER.GET_ALL)
    return response.data
  },

  // Get investment master by ID
  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.INVESTMENT_MASTER.GET_BY_ID(id))
    return response.data
  },

  // Create new investment master
  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.INVESTMENT_MASTER.SAVE, data)
    return response.data
  },

  // Update investment master
  update: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.INVESTMENT_MASTER.UPDATE(id), data)
    return response.data
  },

  // Delete investment master
  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.INVESTMENT_MASTER.DELETE(id))
    return response.data
  },

  // Soft delete investment master
  softDelete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.INVESTMENT_MASTER.SOFT_DELETE(id))
    return response.data
  },

  // Find all investment masters with filters
  findAll: async (filters?: any) => {
    const response = await apiClient.post(API_ENDPOINTS.INVESTMENT_MASTER.FIND_ALL, filters)
    return response.data
  },
}
