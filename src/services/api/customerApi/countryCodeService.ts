import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Country Code API Service
export const countryCodeService = {
  // Get all country codes
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.COUNTRY_CODE.GET_ALL)
    return response.data
  },

  // Get country code by ID
  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.COUNTRY_CODE.GET_BY_ID(id))
    return response.data
  },

  // Create new country code
  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.COUNTRY_CODE.SAVE, data)
    return response.data
  },

  // Update country code
  update: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.COUNTRY_CODE.UPDATE(id), data)
    return response.data
  },

  // Delete country code
  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.COUNTRY_CODE.DELETE(id))
    return response.data
  },

  // Soft delete country code
  softDelete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.COUNTRY_CODE.SOFT_DELETE(id))
    return response.data
  },

  // Find all country codes with filters
  findAll: async (filters?: any) => {
    const response = await apiClient.post(API_ENDPOINTS.COUNTRY_CODE.FIND_ALL, filters)
    return response.data
  },
}
