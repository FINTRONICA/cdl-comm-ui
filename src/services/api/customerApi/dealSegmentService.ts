import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Deal Segment API Service
export const dealSegmentService = {
  // Get all deal segments
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.DEAL_SEGMENT.GET_ALL)
    return response.data
  },

  // Get deal segment by ID
  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.DEAL_SEGMENT.GET_BY_ID(id))
    return response.data
  },

  // Create new deal segment
  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.DEAL_SEGMENT.SAVE, data)
    return response.data
  },

  // Update deal segment
  update: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.DEAL_SEGMENT.UPDATE(id), data)
    return response.data
  },

  // Delete deal segment
  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.DEAL_SEGMENT.DELETE(id))
    return response.data
  },

  // Soft delete deal segment
  softDelete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.DEAL_SEGMENT.SOFT_DELETE(id))
    return response.data
  },

  // Find all deal segments with filters
  findAll: async (filters?: any) => {
    const response = await apiClient.post(API_ENDPOINTS.DEAL_SEGMENT.FIND_ALL, filters)
    return response.data
  },
}
