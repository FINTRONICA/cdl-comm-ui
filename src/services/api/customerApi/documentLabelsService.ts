import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Document Labels API Service
export const documentLabelsService = {
  // Get document labels
  getLabels: async (language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DOCUMENT}?language.equals=${language}`
    )
    return response.data
  },

  // Get document labels by config ID
  getLabelByConfigId: async (configId: string, language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DOCUMENT}?configId.equals=${configId}&language.equals=${language}`
    )
    return response.data
  },

  // Create document label
  createLabel: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DOCUMENT, data)
    return response.data
  },

  // Update document label
  updateLabel: async (id: string, data: any) => {
    const response = await apiClient.put(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DOCUMENT}/${id}`, data)
    return response.data
  },

  // Delete document label
  deleteLabel: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DOCUMENT}/${id}`)
    return response.data
  },

  // Get all available languages for document labels
  getAvailableLanguages: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DOCUMENT}/languages`)
    return response.data
  },
}
