import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Country Code Labels API Service
export const countryCodeLabelsService = {
  // Get country code labels
  getLabels: async (language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.COUNTRY_CODE}?language.equals=${language}`
    )
    return response.data
  },

  // Get country code labels by config ID
  getLabelByConfigId: async (configId: string, language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.COUNTRY_CODE}?configId.equals=${configId}&language.equals=${language}`
    )
    return response.data
  },

  // Create country code label
  createLabel: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.COUNTRY_CODE, data)
    return response.data
  },

  // Update country code label
  updateLabel: async (id: string, data: any) => {
    const response = await apiClient.put(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.COUNTRY_CODE}/${id}`, data)
    return response.data
  },

  // Delete country code label
  deleteLabel: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.COUNTRY_CODE}/${id}`)
    return response.data
  },

  // Get all available languages for country code labels
  getAvailableLanguages: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.COUNTRY_CODE}/languages`)
    return response.data
  },
}
