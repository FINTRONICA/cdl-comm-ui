import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// Ledger Account API Service
export const ledgerAccountService = {
  // Get all ledger accounts
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.LEDGER_ACCOUNT.GET_ALL)
    return response.data
  },

  // Get ledger account by ID
  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.LEDGER_ACCOUNT.GET_BY_ID(id))
    return response.data
  },

  // Create new ledger account
  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.LEDGER_ACCOUNT.SAVE, data)
    return response.data
  },

  // Update ledger account
  update: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.LEDGER_ACCOUNT.UPDATE(id), data)
    return response.data
  },

  // Delete ledger account
  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.LEDGER_ACCOUNT.DELETE(id))
    return response.data
  },

  // Soft delete ledger account
  softDelete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.LEDGER_ACCOUNT.SOFT_DELETE(id))
    return response.data
  },

  // Find all ledger accounts with filters
  findAll: async (filters?: any) => {
    const response = await apiClient.post(API_ENDPOINTS.LEDGER_ACCOUNT.FIND_ALL, filters)
    return response.data
  },
}
