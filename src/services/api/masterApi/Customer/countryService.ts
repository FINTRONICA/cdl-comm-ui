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

export interface Country {
  id: number
  uuid?: string
  description: string
  active: boolean
  taskStatusDTO?: TaskStatusDTO | null
  enabled: boolean
  deleted: boolean
}

export interface CreateCountryRequest {
  uuid?: string
  description: string
  active: boolean
  taskStatusDTO?: { id: number } | null
  enabled?: boolean
  deleted?: boolean
}

export interface UpdateCountryRequest {
  id?: number
  uuid?: string
  description?: string
  active?: boolean
  taskStatusDTO?: { id: number } | null
  enabled?: boolean
  deleted?: boolean
}

export interface CountryFilters {
  description?: string
}

export class CountryService {
  async getCountries(
    page = 0,
    size = 20,
    filters?: CountryFilters
  ): Promise<PaginatedResponse<Country>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.description) {
        apiFilters['description.contains'] = filters.description
      }
    }

    // Build URL - Use base endpoint and add all params
    const baseUrl = buildApiUrl('/country')
    const allParams = {
      'deleted.equals': 'false',
      'enabled.equals': 'true',
      ...buildPaginationParams(page, size),
      ...apiFilters,
    }
    const url = `${baseUrl}?${new URLSearchParams(allParams).toString()}`

    try {
      const result = await apiClient.get<PaginatedResponse<Country>>(url)
      return result || {
        content: [],
        page: {
          size: 0,
          number: page,
          totalElements: 0,
          totalPages: 0,
        },
      }
    } catch (error) {
      throw error
    }
  }

  async getCountry(id: string): Promise<Country> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_COUNTRY.GET_BY_ID(id))
      const result = await apiClient.get<Country>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async createCountry(
          data: CreateCountryRequest
  ): Promise<Country> {
    try {
      const result = await apiClient.post<Country>(
        buildApiUrl(API_ENDPOINTS.MASTER_COUNTRY.SAVE),
        data
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async updateCountry(
    id: string,
    updates: UpdateCountryRequest
        ): Promise<Country> {
    try {
      const result = await apiClient.put<Country>(
        buildApiUrl(API_ENDPOINTS.MASTER_COUNTRY.UPDATE(id)),
        updates
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async deleteCountry(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.MASTER_COUNTRY.SOFT_DELETE(id))
      )
    } catch (error) {
      throw error
    }
  }

  async getAllCountries(): Promise<Country[]> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_COUNTRY.FIND_ALL)
      const result = await apiClient.get<Country[] | PaginatedResponse<Country>>(url)
      
      // Handle different response structures
      if (Array.isArray(result)) {
        return result
              } else if (result && typeof result === 'object' && 'content' in result && Array.isArray((result as PaginatedResponse<Country>).content)) {
        return (result as PaginatedResponse<Country>).content
      }
      
      return []
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching all countries:', error)
      }
      return []
    }
  }
}

    export const countryService = new CountryService()

