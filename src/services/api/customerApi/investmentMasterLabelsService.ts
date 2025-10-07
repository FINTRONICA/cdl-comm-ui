import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Investment Master Labels API Service
export const investmentMasterLabelsService = {
  // Get investment master labels
  getLabels: async (language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.INVESTMENT_MASTER}?language.equals=${language}`
    )
    return response.data
  },

  // Get investment master labels by config ID
  getLabelByConfigId: async (configId: string, language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.INVESTMENT_MASTER}?configId.equals=${configId}&language.equals=${language}`
    )
    return response.data
  },

  // Create investment master label
  createLabel: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.INVESTMENT_MASTER, data)
    return response.data
  },

  // Update investment master label
  updateLabel: async (id: string, data: any) => {
    const response = await apiClient.put(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.INVESTMENT_MASTER}/${id}`, data)
    return response.data
  },

  // Delete investment master label
  deleteLabel: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.INVESTMENT_MASTER}/${id}`)
    return response.data
  },

  // Get all available languages for investment master labels
  getAvailableLanguages: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.INVESTMENT_MASTER}/languages`)
    return response.data
  },
}
