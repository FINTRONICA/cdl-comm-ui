import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Product Program Labels API Service
export const productProgramLabelsService = {
  // Get product program labels
  getLabels: async (language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.PRODUCT_PROGRAM}?language.equals=${language}`
    )
    return response.data
  },

  // Get product program labels by config ID
  getLabelByConfigId: async (configId: string, language: string = 'EN') => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.PRODUCT_PROGRAM}?configId.equals=${configId}&language.equals=${language}`
    )
    return response.data
  },

  // Create product program label
  createLabel: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.PRODUCT_PROGRAM, data)
    return response.data
  },

  // Update product program label
  updateLabel: async (id: string, data: any) => {
    const response = await apiClient.put(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.PRODUCT_PROGRAM}/${id}`, data)
    return response.data
  },

  // Delete product program label
  deleteLabel: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.PRODUCT_PROGRAM}/${id}`)
    return response.data
  },

  // Get all available languages for product program labels
  getAvailableLanguages: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.PRODUCT_PROGRAM}/languages`)
    return response.data
  },
}
