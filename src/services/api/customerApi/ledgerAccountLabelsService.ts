import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Ledger Account Labels API Service
export const ledgerAccountLabelsService = {
  // Get ledger account labels
  getLabels: async (language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.LEDGER_ACCOUNT}?language.equals=${language}`
    )
    return response.data
  },

  // Get ledger account labels by config ID
  getLabelByConfigId: async (configId: string, language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.LEDGER_ACCOUNT}?configId.equals=${configId}&language.equals=${language}`
    )
    return response.data
  },

  // Create ledger account label
  createLabel: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.LEDGER_ACCOUNT, data)
    return response.data
  },

  // Update ledger account label
  updateLabel: async (id: string, data: any) => {
    const response = await apiClient.put(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.LEDGER_ACCOUNT}/${id}`, data)
    return response.data
  },

  // Delete ledger account label
  deleteLabel: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.LEDGER_ACCOUNT}/${id}`)
    return response.data
  },

  // Get all available languages for ledger account labels
  getAvailableLanguages: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.LEDGER_ACCOUNT}/languages`)
    return response.data
  },
}
