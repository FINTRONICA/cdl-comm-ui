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

export interface AgreementType {
  id: number
  agreementTypeName: string
  agreementTypeDescription: string
  active: boolean
  taskStatusDTO?: TaskStatusDTO | null
  enabled: boolean
  deleted: boolean
  uuid?: string
}

export interface CreateAgreementTypeRequest {
  agreementTypeName: string
  agreementTypeDescription: string
  active: boolean
  enabled?: boolean
  deleted?: boolean
  uuid?: string
  taskStatusDTO?: {
    id: number
  } | null
}

export interface UpdateAgreementTypeRequest {
  id?: number
  agreementTypeName?: string
  agreementTypeDescription?: string
  active?: boolean
  enabled?: boolean
  deleted?: boolean
  uuid?: string
  taskStatusDTO?: {
    id: number
  } | null
}

export interface AgreementTypeFilters {
  name?: string
}

export class AgreementTypeService {
  async getAgreementTypes(
    page = 0,
    size = 20,
    filters?: AgreementTypeFilters
  ): Promise<PaginatedResponse<AgreementType>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.name) {
        apiFilters['agreementTypeName.contains'] = filters.name
      }
    }

    const params = {
      'deleted.equals': 'false',
      'enabled.equals': 'true',
      ...buildPaginationParams(page, size),
      ...apiFilters,
    }
    const queryString = new URLSearchParams(params).toString()
    // Use base endpoint without query params and add all params dynamically
    const baseEndpoint = API_ENDPOINTS.MASTER_AGREEMENT_TYPE.GET_ALL.split('?')[0] || API_ENDPOINTS.MASTER_AGREEMENT_TYPE.GET_ALL
    const url = `${buildApiUrl(baseEndpoint)}?${queryString}`

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('AgreementType API Call:', {
        endpoint: baseEndpoint,
        fullUrl: url,
        params,
        page,
        size,
        filters,
      })
    }

    try {
      const result = await apiClient.get<PaginatedResponse<AgreementType>>(url)
      
      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('AgreementType API Response:', result)
      }

      // Validate response structure
      if (!result) {
        console.warn('AgreementType API returned null/undefined')
        return {
          content: [],
          page: {
            size: 0,
            number: page,
            totalElements: 0,
            totalPages: 0,
          },
        }
      }

      // Ensure response has expected structure
      if (!result.content || !Array.isArray(result.content)) {
        console.warn('AgreementType API response missing content array:', result)
        return {
          content: [],
          page: result.page || {
            size: 0,
            number: page,
            totalElements: 0,
            totalPages: 0,
          },
        }
      }

      return result
    } catch (error) {
      console.error('AgreementType API Error:', error)
      throw error
    }
  }

  async getAgreementType(id: string): Promise<AgreementType> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_AGREEMENT_TYPE.GET_BY_ID(id))
      if (process.env.NODE_ENV === 'development') {
        console.log('Get AgreementType by ID:', { id, url })
      }
      const result = await apiClient.get<AgreementType>(url)
      return result
    } catch (error) {
      console.error('Error fetching agreement type by ID:', error)
      throw error
    }
  }

  async createAgreementType(
    data: CreateAgreementTypeRequest
  ): Promise<AgreementType> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_AGREEMENT_TYPE.SAVE)
      if (process.env.NODE_ENV === 'development') {
        console.log('Create AgreementType:', { url, data })
      }
      const result = await apiClient.post<AgreementType>(url, data)
      if (process.env.NODE_ENV === 'development') {
        console.log('Create AgreementType Response:', result)
      }
      return result
    } catch (error) {
      console.error('Error creating agreement type:', error)
      throw error
    }
  }

  async updateAgreementType(
    id: string,
    updates: UpdateAgreementTypeRequest
  ): Promise<AgreementType> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_AGREEMENT_TYPE.UPDATE(id))
      if (process.env.NODE_ENV === 'development') {
        console.log('Update AgreementType:', { id, url, updates })
      }
      const result = await apiClient.put<AgreementType>(url, updates)
      if (process.env.NODE_ENV === 'development') {
        console.log('Update AgreementType Response:', result)
      }
      return result
    } catch (error) {
      console.error('Error updating agreement type:', error)
      throw error
    }
  }

  async deleteAgreementType(id: string): Promise<void> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_AGREEMENT_TYPE.SOFT_DELETE(id))
      if (process.env.NODE_ENV === 'development') {
        console.log('Delete AgreementType:', { id, url })
      }
      await apiClient.delete<string>(url)
      if (process.env.NODE_ENV === 'development') {
        console.log('Delete AgreementType Success')
      }
    } catch (error) {
      console.error('Error deleting agreement type:', error)
      throw error
    }
  }

  async getAllAgreementTypes(): Promise<AgreementType[]> {
    try {
      // Use GET_ALL endpoint with pagination to fetch agreement types
      // Matching user's API: /agreement-type?deleted.equals=false&page=0&size=20
      const params = {
        'deleted.equals': 'false',
        'page': '0',
        'size': '20',
      }
      const queryString = new URLSearchParams(params).toString()
      const baseEndpoint = API_ENDPOINTS.MASTER_AGREEMENT_TYPE.GET_ALL.split('?')[0] || API_ENDPOINTS.MASTER_AGREEMENT_TYPE.GET_ALL
      const url = `${buildApiUrl(baseEndpoint)}?${queryString}`
      
      // Try to get paginated response first
      const result = await apiClient.get<PaginatedResponse<AgreementType> | AgreementType[]>(url)
      
      // Check if it's a paginated response
      if (result && typeof result === 'object' && 'content' in result) {
        return (result as PaginatedResponse<AgreementType>).content || []
      }
      
      // Otherwise return as array
      return (result as AgreementType[]) || []
    } catch (error) {
      console.error('Error fetching agreement types:', error)
      throw error
    }
  }
}

export const agreementTypeService = new AgreementTypeService()

