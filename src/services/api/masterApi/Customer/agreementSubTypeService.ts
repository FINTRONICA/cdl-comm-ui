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

export interface AgreementTypeDTO {
  id: number
  uuid?: string
  agreementTypeName: string
  agreementTypeDescription: string
  active: boolean
  taskStatusDTO?: TaskStatusDTO | null
  enabled: boolean
  deleted: boolean
}

export interface AgreementSubType {
  id: number
  subTypeName: string
  subTypeDescription: string
  active: boolean
  agreementTypeDTO?: AgreementTypeDTO | null
  taskStatusDTO?: TaskStatusDTO | null
  enabled: boolean
  deleted: boolean
  uuid?: string
}

  export interface CreateAgreementSubTypeRequest {
    subTypeName: string
    subTypeDescription: string
  active: boolean
  enabled?: boolean
  deleted?: boolean
  uuid?: string
  agreementTypeDTO?: {
    id: number
  } | null
  taskStatusDTO?: {
    id: number
  } | null
}

export interface UpdateAgreementSubTypeRequest {
  id?: number
  subTypeName?: string
  subTypeDescription?: string
  active?: boolean
  enabled?: boolean
  deleted?: boolean
  uuid?: string
  agreementTypeDTO?: {
    id: number
  } | null
  taskStatusDTO?: {
    id: number
  } | null
}

export interface AgreementSubTypeFilters {
  name?: string
}

export class AgreementSubTypeService {
    async getAgreementSubTypes(
    page = 0,
    size = 20,
    filters?: AgreementSubTypeFilters
  ): Promise<PaginatedResponse<AgreementSubType>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.name) {
        apiFilters['subTypeName.contains'] = filters.name
      }
    }

    // Build URL - Use base endpoint and add filters
    // Extract base endpoint without query params
    const baseEndpoint = API_ENDPOINTS.MASTER_AGREEMENT_SUB_TYPE.GET_ALL.split('?')[0] || API_ENDPOINTS.MASTER_AGREEMENT_SUB_TYPE.GET_ALL
    const baseUrl = buildApiUrl(baseEndpoint)
    const allParams = {
      'deleted.equals': 'false',
      'enabled.equals': 'true',
      ...buildPaginationParams(page, size),
      ...apiFilters,
    }
    const url = `${baseUrl}?${new URLSearchParams(allParams).toString()}`

    try {
      const result = await apiClient.get<PaginatedResponse<AgreementSubType>>(url)
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

  async getAgreementSubType(id: string): Promise<AgreementSubType> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_AGREEMENT_SUB_TYPE.GET_BY_ID(id))
      const result = await apiClient.get<AgreementSubType>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async createAgreementSubType(
          data: CreateAgreementSubTypeRequest
  ): Promise<AgreementSubType> {
    try {
      const result = await apiClient.post<AgreementSubType>(
        buildApiUrl(API_ENDPOINTS.MASTER_AGREEMENT_SUB_TYPE.SAVE),
        data
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async updateAgreementSubType(
    id: string,
    updates: UpdateAgreementSubTypeRequest
  ): Promise<AgreementSubType> {
    try {
      const result = await apiClient.put<AgreementSubType>(
        buildApiUrl(API_ENDPOINTS.MASTER_AGREEMENT_SUB_TYPE.UPDATE(id)),
        updates
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async deleteAgreementSubType(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.MASTER_AGREEMENT_SUB_TYPE.SOFT_DELETE(id))
      )
    } catch (error) {
      throw error
    }
  }
}

    export const agreementSubTypeService = new AgreementSubTypeService()

