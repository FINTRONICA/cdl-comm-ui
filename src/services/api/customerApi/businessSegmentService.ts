import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Business Segment API Service
export const businessSegmentService = {
  // Get all business segments
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.BUSINESS_SEGMENT.GET_ALL)
    return response.data
  },

  // Get business segment by ID
  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.BUSINESS_SEGMENT.GET_BY_ID(id))
    return response.data
  },

  // Create new business segment
  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.BUSINESS_SEGMENT.SAVE, data)
    return response.data
  },

  // Update business segment
  update: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.BUSINESS_SEGMENT.UPDATE(id), data)
    return response.data
  },

  // Delete business segment
  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.BUSINESS_SEGMENT.DELETE(id))
    return response.data
  },

  // Soft delete business segment
  softDelete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.BUSINESS_SEGMENT.SOFT_DELETE(id))
    return response.data
  },

  // Find all business segments with filters
  findAll: async (filters?: any) => {
    const response = await apiClient.post(API_ENDPOINTS.BUSINESS_SEGMENT.FIND_ALL, filters)
    return response.data
  },
}
