import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Business Sub Segment Labels API Service
export const businessSubSegmentLabelsService = {
  // Get business sub segment labels
  getLabels: async (language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BUSINESS_SUB_SEGMENT}?language.equals=${language}`
    )
    return response.data
  },

  // Get business sub segment labels by config ID
  getLabelByConfigId: async (configId: string, language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BUSINESS_SUB_SEGMENT}?configId.equals=${configId}&language.equals=${language}`
    )
    return response.data
  },

  // Create business sub segment label
  createLabel: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BUSINESS_SUB_SEGMENT, data)
    return response.data
  },

  // Update business sub segment label
  updateLabel: async (id: string, data: any) => {
    const response = await apiClient.put(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BUSINESS_SUB_SEGMENT}/${id}`, data)
    return response.data
  },

  // Delete business sub segment label
  deleteLabel: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BUSINESS_SUB_SEGMENT}/${id}`)
    return response.data
  },

  // Get all available languages for business sub segment labels
  getAvailableLanguages: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BUSINESS_SUB_SEGMENT}/languages`)
    return response.data
  },
}
