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

const DEFAULT_PAGE = 0
const DEFAULT_SIZE = 20
const DEFAULT_PAGE_SIZE = 20

const createEmptyPaginatedResponse = (
  page: number = DEFAULT_PAGE
): PaginatedResponse<AgreementType> => ({
  content: [],
  page: {
    size: 0,
    number: page,
    totalElements: 0,
    totalPages: 0,
  },
})

const buildAgreementTypeUrl = (
  endpoint: string,
  params: Record<string, string>
): string => {
  const baseEndpoint = endpoint.split('?')[0] || endpoint
  const queryString = new URLSearchParams(params).toString()
  return `${buildApiUrl(baseEndpoint)}?${queryString}`
}

export class AgreementTypeService {
  async getAgreementTypes(
    page = DEFAULT_PAGE,
    size = DEFAULT_SIZE,
    filters?: AgreementTypeFilters
  ): Promise<PaginatedResponse<AgreementType>> {
    const apiFilters: Record<string, string> = {}
    if (filters?.name) {
      apiFilters['agreementTypeName.contains'] = filters.name
    }

    const params = {
      'deleted.equals': 'false',
      'enabled.equals': 'true',
      ...buildPaginationParams(page, size),
      ...apiFilters,
    }

    const url = buildAgreementTypeUrl(
      API_ENDPOINTS.MASTER_AGREEMENT_TYPE.GET_ALL,
      params
    )

    try {
      const result = await apiClient.get<PaginatedResponse<AgreementType>>(url)

      if (!result) {
        return createEmptyPaginatedResponse(page)
      }

      if (!result.content || !Array.isArray(result.content)) {
        return {
          content: [],
          page: result.page || createEmptyPaginatedResponse(page).page,
        }
      }

      return result
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching agreement types:', error)
      }
      throw error
    }
  }

  async getAgreementType(id: string): Promise<AgreementType> {
    if (!id) {
      throw new Error('Agreement type ID is required')
    }

    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_AGREEMENT_TYPE.GET_BY_ID(id))
      return await apiClient.get<AgreementType>(url)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching agreement type by ID:', error)
      }
      throw error
    }
  }

  async createAgreementType(
    data: CreateAgreementTypeRequest
  ): Promise<AgreementType> {
    if (!data.agreementTypeName?.trim()) {
      throw new Error('Agreement type name is required')
    }
    if (!data.agreementTypeDescription?.trim()) {
      throw new Error('Agreement type description is required')
    }

    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_AGREEMENT_TYPE.SAVE)
      return await apiClient.post<AgreementType>(url, {
        ...data,
        enabled: data.enabled ?? true,
        deleted: data.deleted ?? false,
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating agreement type:', error)
      }
      throw error
    }
  }

  async updateAgreementType(
    id: string,
    updates: UpdateAgreementTypeRequest
  ): Promise<AgreementType> {
    if (!id) {
      throw new Error('Agreement type ID is required')
    }

    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_AGREEMENT_TYPE.UPDATE(id))
      return await apiClient.put<AgreementType>(url, updates)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating agreement type:', error)
      }
      throw error
    }
  }

  async deleteAgreementType(id: string): Promise<void> {
    if (!id) {
      throw new Error('Agreement type ID is required')
    }

    try {
      const url = buildApiUrl(
        API_ENDPOINTS.MASTER_AGREEMENT_TYPE.SOFT_DELETE(id)
      )
      await apiClient.delete<string>(url)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting agreement type:', error)
      }
      throw error
    }
  }

  async getAllAgreementTypes(): Promise<AgreementType[]> {
    try {
      const params = {
        'deleted.equals': 'false',
        page: String(DEFAULT_PAGE),
        size: String(DEFAULT_PAGE_SIZE),
      }

      const url = buildAgreementTypeUrl(
        API_ENDPOINTS.MASTER_AGREEMENT_TYPE.GET_ALL,
        params
      )

      const result = await apiClient.get<
        PaginatedResponse<AgreementType> | AgreementType[]
      >(url)

      // Handle paginated response
      if (result && typeof result === 'object' && 'content' in result) {
        return (result as PaginatedResponse<AgreementType>).content || []
      }

      // Handle array response
      return (result as AgreementType[]) || []
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching all agreement types:', error)
      }
      throw error
    }
  }
}

export const agreementTypeService = new AgreementTypeService()
