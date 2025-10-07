import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Document API Service
export const documentService = {
  // Get all documents
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.DOCUMENT.GET_ALL)
    return response.data
  },

  // Get document by ID
  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.DOCUMENT.GET_BY_ID(id))
    return response.data
  },

  // Create new document
  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.DOCUMENT.SAVE, data)
    return response.data
  },

  // Update document
  update: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.DOCUMENT.UPDATE(id), data)
    return response.data
  },

  // Delete document
  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.DOCUMENT.DELETE(id))
    return response.data
  },

  // Soft delete document
  softDelete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.DOCUMENT.SOFT_DELETE(id))
    return response.data
  },

  // Find all documents with filters
  findAll: async (filters?: any) => {
    const response = await apiClient.post(API_ENDPOINTS.DOCUMENT.FIND_ALL, filters)
    return response.data
  },
}
