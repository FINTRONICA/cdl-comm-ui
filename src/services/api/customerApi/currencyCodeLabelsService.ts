import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Currency Code Labels API Service
export const currencyCodeLabelsService = {
  // Get currency code labels
  getLabels: async (language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.CURRENCY_CODE}?language.equals=${language}`
    )
    return response.data
  },

  // Get currency code labels by config ID
  getLabelByConfigId: async (configId: string, language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.CURRENCY_CODE}?configId.equals=${configId}&language.equals=${language}`
    )
    return response.data
  },

  // Create currency code label
  createLabel: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.CURRENCY_CODE, data)
    return response.data
  },

  // Update currency code label
  updateLabel: async (id: string, data: any) => {
    const response = await apiClient.put(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.CURRENCY_CODE}/${id}`, data)
    return response.data
  },

  // Delete currency code label
  deleteLabel: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.CURRENCY_CODE}/${id}`)
    return response.data
  },

  // Get all available languages for currency code labels
  getAvailableLanguages: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.CURRENCY_CODE}/languages`)
    return response.data
  },
}
