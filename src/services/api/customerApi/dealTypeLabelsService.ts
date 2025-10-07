import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Deal Type Labels API Service
export const dealTypeLabelsService = {
  // Get deal type labels
  getLabels: async (language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DEAL_TYPE}?language.equals=${language}`
    )
    return response.data
  },

  // Get deal type labels by config ID
  getLabelByConfigId: async (configId: string, language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DEAL_TYPE}?configId.equals=${configId}&language.equals=${language}`
    )
    return response.data
  },

  // Create deal type label
  createLabel: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DEAL_TYPE, data)
    return response.data
  },

  // Update deal type label
  updateLabel: async (id: string, data: any) => {
    const response = await apiClient.put(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DEAL_TYPE}/${id}`, data)
    return response.data
  },

  // Delete deal type label
  deleteLabel: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DEAL_TYPE}/${id}`)
    return response.data
  },

  // Get all available languages for deal type labels
  getAvailableLanguages: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DEAL_TYPE}/languages`)
    return response.data
  },
}
