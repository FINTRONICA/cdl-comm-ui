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

export interface Investment {
  id: number
  investmentName: string
  investmentDescription: string
  active: boolean
  taskStatusDTO?: TaskStatusDTO | null
  enabled: boolean
  deleted: boolean
  uuid?: string
}

export interface CreateInvestmentRequest {
  investmentName: string
  investmentDescription: string
  active: boolean
  enabled?: boolean
  deleted?: boolean
  uuid?: string
  taskStatusDTO?: {
    id: number
  } | null
}

export interface UpdateInvestmentRequest {
  id?: number
  investmentName?: string
  investmentDescription?: string
  active?: boolean
  enabled?: boolean
  deleted?: boolean
  uuid?: string
  taskStatusDTO?: {
    id: number
  } | null
}

export interface InvestmentFilters {
  name?: string
}

export class InvestmentService {
  async getInvestments(
    page = 0,
    size = 20,
    filters?: InvestmentFilters
  ): Promise<PaginatedResponse<Investment>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.name) {
        apiFilters['investmentName.contains'] = filters.name
      }
    }

    // Build URL - Use base endpoint and add filters
    const baseUrl = buildApiUrl('/investment')
    const allParams = {
      'deleted.equals': 'false',
      ...buildPaginationParams(page, size),
      ...apiFilters,
    }
    const url = `${baseUrl}?${new URLSearchParams(allParams).toString()}`

    try {
      const result = await apiClient.get<PaginatedResponse<Investment>>(url)
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

  async getInvestment(id: string): Promise<Investment> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_INVESTMENT.GET_BY_ID(id))
      const result = await apiClient.get<Investment>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async createInvestment(
    data: CreateInvestmentRequest
  ): Promise<Investment> {
    try {
      const result = await apiClient.post<Investment>(
        buildApiUrl(API_ENDPOINTS.MASTER_INVESTMENT.SAVE),
        data
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async updateInvestment(
    id: string,
    updates: UpdateInvestmentRequest
  ): Promise<Investment> {
    try {
      const result = await apiClient.put<Investment>(
        buildApiUrl(API_ENDPOINTS.MASTER_INVESTMENT.UPDATE(id)),
        updates
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async deleteInvestment(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.MASTER_INVESTMENT.SOFT_DELETE(id))
      )
    } catch (error) {
      throw error
    }
  }
}

export const investmentService = new InvestmentService()

