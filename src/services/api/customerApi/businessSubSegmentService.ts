import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Business Sub Segment API Service
export const businessSubSegmentService = {
  // Get all business sub segments
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.BUSINESS_SUB_SEGMENT.GET_ALL)
    return response.data
  },

  // Get business sub segment by ID
  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.BUSINESS_SUB_SEGMENT.GET_BY_ID(id))
    return response.data
  },

  // Create new business sub segment
  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.BUSINESS_SUB_SEGMENT.SAVE, data)
    return response.data
  },

  // Update business sub segment
  update: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.BUSINESS_SUB_SEGMENT.UPDATE(id), data)
    return response.data
  },

  // Delete business sub segment
  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.BUSINESS_SUB_SEGMENT.DELETE(id))
    return response.data
  },

  // Soft delete business sub segment
  softDelete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.BUSINESS_SUB_SEGMENT.SOFT_DELETE(id))
    return response.data
  },

  // Find all business sub segments with filters
  findAll: async (filters?: any) => {
    const response = await apiClient.post(API_ENDPOINTS.BUSINESS_SUB_SEGMENT.FIND_ALL, filters)
    return response.data
  },
}
