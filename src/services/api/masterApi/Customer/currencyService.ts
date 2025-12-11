import { apiClient } from '@/lib/apiClient'
import {
  buildApiUrl,
  buildPaginationParams,
  API_ENDPOINTS,
} from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'

export interface TaskStatusDTO {
  id: number
  code: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  deleted: boolean
  enabled: boolean
}

export interface Currency {
  id: number
  uuid?: string
  description: string
  isEnabled: boolean
  taskStatusDTO?: TaskStatusDTO | null
  enabled: boolean
  deleted: boolean
}

export interface CreateCurrencyRequest {
  uuid?: string
  description: string
  isEnabled: boolean
  taskStatusDTO?: { id: number } | null
  enabled?: boolean
  deleted?: boolean
}

export interface UpdateCurrencyRequest {
  id?: number
  uuid?: string
  description?: string
  isEnabled?: boolean
  taskStatusDTO?: { id: number } | null
  enabled?: boolean
  deleted?: boolean
}

export interface CurrencyFilters {
  description?: string
}

export class CurrencyService {
  async getCurrencies(
    page = 0,
    size = 20,
    filters?: CurrencyFilters
  ): Promise<PaginatedResponse<Currency>> {
    const apiFilters: Record<string, string> = {}
    if (filters?.description) {
      apiFilters['description.contains'] = filters.description
    }

    const baseUrl = buildApiUrl('/currency')
    const allParams = {
      'deleted.equals': 'false',
      'enabled.equals': 'true',
      ...buildPaginationParams(page, size),
      ...apiFilters,
    }
    const url = `${baseUrl}?${new URLSearchParams(allParams).toString()}`

    try {
      const result = await apiClient.get<PaginatedResponse<Currency>>(url)
      return (
        result || {
          content: [],
          page: {
            size: 0,
            number: page,
            totalElements: 0,
            totalPages: 0,
          },
        }
      )
    } catch (error) {
      throw error
    }
  }

  async getCurrency(id: string): Promise<Currency> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_CURRENCY.GET_BY_ID(id))
      const result = await apiClient.get<Currency>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async createCurrency(data: CreateCurrencyRequest): Promise<Currency> {
    try {
      const result = await apiClient.post<Currency>(
        buildApiUrl(API_ENDPOINTS.MASTER_CURRENCY.SAVE),
        data
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async updateCurrency(
    id: string,
    updates: UpdateCurrencyRequest
  ): Promise<Currency> {
    try {
      const result = await apiClient.put<Currency>(
        buildApiUrl(API_ENDPOINTS.MASTER_CURRENCY.UPDATE(id)),
        updates
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async deleteCurrency(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.MASTER_CURRENCY.SOFT_DELETE(id))
      )
    } catch (error) {
      throw error
    }
  }

  async getAllCurrencies(): Promise<Currency[]> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_CURRENCY.FIND_ALL)
      const result = await apiClient.get<
        Currency[] | PaginatedResponse<Currency>
      >(url)

      // Handle different response structures
      if (Array.isArray(result)) {
        return result
      } else if (
        result &&
        typeof result === 'object' &&
        'content' in result &&
        Array.isArray((result as PaginatedResponse<Currency>).content)
      ) {
        return (result as PaginatedResponse<Currency>).content
      }

      return []
    } catch (error) {
      // Return empty array on error to prevent UI crashes
      // Error is logged by the API client
      return []
    }
  }
}

export const currencyService = new CurrencyService()
