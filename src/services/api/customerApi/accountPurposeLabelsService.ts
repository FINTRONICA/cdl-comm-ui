import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Account Purpose Labels API Service
export const accountPurposeLabelsService = {
  // Get account purpose labels
  getLabels: async (language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.ACCOUNT_PURPOSE}?language.equals=${language}`
    )
    return response.data
  },

  // Get account purpose labels by config ID
  getLabelByConfigId: async (configId: string, language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.ACCOUNT_PURPOSE}?configId.equals=${configId}&language.equals=${language}`
    )
    return response.data
  },

  // Create account purpose label
  createLabel: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.ACCOUNT_PURPOSE, data)
    return response.data
  },

  // Update account purpose label
  updateLabel: async (id: string, data: any) => {
    const response = await apiClient.put(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.ACCOUNT_PURPOSE}/${id}`, data)
    return response.data
  },

  // Delete account purpose label
  deleteLabel: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.ACCOUNT_PURPOSE}/${id}`)
    return response.data
  },

  // Get all available languages for account purpose labels
  getAvailableLanguages: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.ACCOUNT_PURPOSE}/languages`)
    return response.data
  },
}
