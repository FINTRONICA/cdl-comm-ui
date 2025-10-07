import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Beneficiary Labels API Service
export const beneficiaryLabelsService = {
  // Get beneficiary labels
  getLabels: async (language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BENEFICIARY}?language.equals=${language}`
    )
    return response.data
  },

  // Get beneficiary labels by config ID
  getLabelByConfigId: async (configId: string, language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BENEFICIARY}?configId.equals=${configId}&language.equals=${language}`
    )
    return response.data
  },

  // Create beneficiary label
  createLabel: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BENEFICIARY, data)
    return response.data
  },

  // Update beneficiary label
  updateLabel: async (id: string, data: any) => {
    const response = await apiClient.put(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BENEFICIARY}/${id}`, data)
    return response.data
  },

  // Delete beneficiary label
  deleteLabel: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BENEFICIARY}/${id}`)
    return response.data
  },

  // Get all available languages for beneficiary labels
  getAvailableLanguages: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BENEFICIARY}/languages`)
    return response.data
  },
}
