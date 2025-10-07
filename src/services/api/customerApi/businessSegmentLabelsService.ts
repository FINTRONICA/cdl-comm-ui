import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Business Segment Labels API Service
export const businessSegmentLabelsService = {
  // Get business segment labels
  getLabels: async (language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BUSINESS_SEGMENT}?language.equals=${language}`
    )
    return response.data
  },

  // Get business segment labels by config ID
  getLabelByConfigId: async (configId: string, language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BUSINESS_SEGMENT}?configId.equals=${configId}&language.equals=${language}`
    )
    return response.data
  },

  // Create business segment label
  createLabel: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BUSINESS_SEGMENT, data)
    return response.data
  },

  // Update business segment label
  updateLabel: async (id: string, data: any) => {
    const response = await apiClient.put(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BUSINESS_SEGMENT}/${id}`, data)
    return response.data
  },

  // Delete business segment label
  deleteLabel: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BUSINESS_SEGMENT}/${id}`)
    return response.data
  },

  // Get all available languages for business segment labels
  getAvailableLanguages: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BUSINESS_SEGMENT}/languages`)
    return response.data
  },
}
