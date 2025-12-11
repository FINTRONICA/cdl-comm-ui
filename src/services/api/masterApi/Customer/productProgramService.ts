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

export interface ProductProgram {
  id: number
  programName: string
  programDescription: string
  active: boolean
  taskStatusDTO?: TaskStatusDTO | null
  enabled: boolean
  deleted: boolean
  uuid?: string
}

  export interface CreateProductProgramRequest {
  programName: string
  programDescription: string
  active: boolean
  enabled?: boolean
  deleted?: boolean
  uuid?: string
  taskStatusDTO?: {
    id: number
  } | null
}

export interface UpdateProductProgramRequest {
  id?: number
  programName?: string
  programDescription?: string
  active?: boolean
  enabled?: boolean
  deleted?: boolean
  uuid?: string
  taskStatusDTO?: {
    id: number
  } | null
}

export interface ProductProgramFilters {
  name?: string
}

export class ProductProgramService {
  async getProductPrograms(
    page = 0,
    size = 20,
    filters?: ProductProgramFilters
  ): Promise<PaginatedResponse<ProductProgram>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.name) {
        apiFilters['programName.contains'] = filters.name
      }
    }

    // Build URL - Use base endpoint and add all params
    const baseUrl = buildApiUrl('/product-program')
    const allParams = {
      'deleted.equals': 'false',
      'enabled.equals': 'true',
      ...buildPaginationParams(page, size),
      ...apiFilters,
    }
    const url = `${baseUrl}?${new URLSearchParams(allParams).toString()}`

    try {
      const result = await apiClient.get<PaginatedResponse<ProductProgram>>(url)
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

  async getProductProgram(id: string): Promise<ProductProgram> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_PRODUCT_PROGRAM.GET_BY_ID(id))
      const result = await apiClient.get<ProductProgram>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async createProductProgram(
    data: CreateProductProgramRequest
  ): Promise<ProductProgram> {
    try {
      const result = await apiClient.post<ProductProgram>(
        buildApiUrl(API_ENDPOINTS.MASTER_PRODUCT_PROGRAM.SAVE),
        data
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async updateProductProgram(
    id: string,
    updates: UpdateProductProgramRequest
        ): Promise<ProductProgram> {
    try {
      const result = await apiClient.put<ProductProgram>(
        buildApiUrl(API_ENDPOINTS.MASTER_PRODUCT_PROGRAM.UPDATE(id)),
        updates
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async deleteProductProgram(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.MASTER_PRODUCT_PROGRAM.SOFT_DELETE(id))
      )
    } catch (error) {
      throw error
    }
  }

  async getAllProductPrograms(): Promise<ProductProgram[]> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_PRODUCT_PROGRAM.FIND_ALL)
      const result = await apiClient.get<ProductProgram[] | PaginatedResponse<ProductProgram>>(url)
      
      // Handle different response structures
      if (Array.isArray(result)) {
        return result
      } else if (result && typeof result === 'object' && 'content' in result && Array.isArray((result as PaginatedResponse<ProductProgram>).content)) {
        return (result as PaginatedResponse<ProductProgram>).content
      }
      
      return []
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching all product programs:', error)
      }
      return []
    }
  }
}

    export const productProgramService = new ProductProgramService()

