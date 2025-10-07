import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Beneficiary API Service
export const beneficiaryService = {
  // Get all beneficiaries
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.BENEFICIARY.GET_ALL)
    return response.data
  },

  // Get beneficiary by ID
  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.BENEFICIARY.GET_BY_ID(id))
    return response.data
  },

  // Create new beneficiary
  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.BENEFICIARY.SAVE, data)
    return response.data
  },

  // Update beneficiary
  update: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.BENEFICIARY.UPDATE(id), data)
    return response.data
  },

  // Delete beneficiary
  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.BENEFICIARY.DELETE(id))
    return response.data
  },

  // Soft delete beneficiary
  softDelete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.BENEFICIARY.SOFT_DELETE(id))
    return response.data
  },

  // Find all beneficiaries with filters
  findAll: async (filters?: any) => {
    const response = await apiClient.post(API_ENDPOINTS.BENEFICIARY.FIND_ALL, filters)
    return response.data
  },
}
