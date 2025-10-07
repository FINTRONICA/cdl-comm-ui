import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Currency Code API Service
export const currencyCodeService = {
  // Get all currency codes
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.CURRENCY_CODE.GET_ALL)
    return response.data
  },

  // Get currency code by ID
  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.CURRENCY_CODE.GET_BY_ID(id))
    return response.data
  },

  // Create new currency code
  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.CURRENCY_CODE.SAVE, data)
    return response.data
  },

  // Update currency code
  update: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.CURRENCY_CODE.UPDATE(id), data)
    return response.data
  },

  // Delete currency code
  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.CURRENCY_CODE.DELETE(id))
    return response.data
  },

  // Soft delete currency code
  softDelete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.CURRENCY_CODE.SOFT_DELETE(id))
    return response.data
  },

  // Find all currency codes with filters
  findAll: async (filters?: any) => {
    const response = await apiClient.post(API_ENDPOINTS.CURRENCY_CODE.FIND_ALL, filters)
    return response.data
  },
}
