import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Product Program API Service
export const productProgramService = {
  // Get all product programs
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCT_PROGRAM.GET_ALL)
    return response.data
  },

  // Get product program by ID
  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCT_PROGRAM.GET_BY_ID(id))
    return response.data
  },

  // Create new product program
  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.PRODUCT_PROGRAM.SAVE, data)
    return response.data
  },

  // Update product program
  update: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.PRODUCT_PROGRAM.UPDATE(id), data)
    return response.data
  },

  // Delete product program
  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.PRODUCT_PROGRAM.DELETE(id))
    return response.data
  },

  // Soft delete product program
  softDelete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.PRODUCT_PROGRAM.SOFT_DELETE(id))
    return response.data
  },

  // Find all product programs with filters
  findAll: async (filters?: any) => {
    const response = await apiClient.post(API_ENDPOINTS.PRODUCT_PROGRAM.FIND_ALL, filters)
    return response.data
  },
}
