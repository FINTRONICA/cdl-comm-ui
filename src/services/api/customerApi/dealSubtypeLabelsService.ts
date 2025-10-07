import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Deal Subtype Labels API Service
export const dealSubtypeLabelsService = {
  // Get deal subtype labels
  getLabels: async (language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DEAL_SUBTYPE}?language.equals=${language}`
    )
    return response.data
  },

  // Get deal subtype labels by config ID
  getLabelByConfigId: async (configId: string, language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DEAL_SUBTYPE}?configId.equals=${configId}&language.equals=${language}`
    )
    return response.data
  },

  // Create deal subtype label
  createLabel: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DEAL_SUBTYPE, data)
    return response.data
  },

  // Update deal subtype label
  updateLabel: async (id: string, data: any) => {
    const response = await apiClient.put(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DEAL_SUBTYPE}/${id}`, data)
    return response.data
  },

  // Delete deal subtype label
  deleteLabel: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DEAL_SUBTYPE}/${id}`)
    return response.data
  },

  // Get all available languages for deal subtype labels
  getAvailableLanguages: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DEAL_SUBTYPE}/languages`)
    return response.data
  },
}
