import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Deal Segment Labels API Service
export const dealSegmentLabelsService = {
  // Get deal segment labels
  getLabels: async (language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DEAL_SEGMENT}?language.equals=${language}`
    )
    return response.data
  },

  // Get deal segment labels by config ID
  getLabelByConfigId: async (configId: string, language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DEAL_SEGMENT}?configId.equals=${configId}&language.equals=${language}`
    )
    return response.data
  },

  // Create deal segment label
  createLabel: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DEAL_SEGMENT, data)
    return response.data
  },

  // Update deal segment label
  updateLabel: async (id: string, data: any) => {
    const response = await apiClient.put(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DEAL_SEGMENT}/${id}`, data)
    return response.data
  },

  // Delete deal segment label
  deleteLabel: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DEAL_SEGMENT}/${id}`)
    return response.data
  },

  // Get all available languages for deal segment labels
  getAvailableLanguages: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.DEAL_SEGMENT}/languages`)
    return response.data
  },
}
