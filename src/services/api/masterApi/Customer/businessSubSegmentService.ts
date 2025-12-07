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

export interface BusinessSegmentDTO {
  id: number
  uuid?: string
  segmentName: string
  segmentDescription: string
  active: boolean
  taskStatusDTO?: TaskStatusDTO | null
  enabled: boolean
  deleted: boolean
}

export interface BusinessSubSegment {
  id: number
  subSegmentName: string
  subSegmentDescription: string
  active: boolean
  businessSegmentNameDTO?: BusinessSegmentDTO | null
  taskStatusDTO?: TaskStatusDTO | null
  enabled: boolean
  deleted: boolean
  uuid?: string
}

  export interface CreateBusinessSubSegmentRequest {
  businessSubSegmentName: string
  businessSubSegmentDescription: string
  active: boolean
  enabled?: boolean
  deleted?: boolean
  uuid?: string
  businessSegmentNameDTO?: {
    id: number
  } | null
  taskStatusDTO?: {
    id: number
  } | null
}

export interface UpdateBusinessSubSegmentRequest {
  id?: number
  businessSubSegmentName?: string
  businessSubSegmentDescription?: string
  active?: boolean
  enabled?: boolean
  deleted?: boolean
  uuid?: string
  businessSegmentNameDTO?: {
    id: number
  } | null
  taskStatusDTO?: {
    id: number
  } | null
}

export interface BusinessSubSegmentFilters {
  name?: string
}

export class BusinessSubSegmentService {
    async getBusinessSubSegments(
    page = 0,
    size = 20,
    filters?: BusinessSubSegmentFilters
  ): Promise<PaginatedResponse<BusinessSubSegment>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.name) {
        apiFilters['businessSubSegmentName.contains'] = filters.name
      }
    }

    // Build URL - Use base endpoint and add filters
    const baseUrl = buildApiUrl(API_ENDPOINTS.MASTER_BUSINESS_SUB_SEGMENT.GET_ALL)
    const allParams = {
      'deleted.equals': 'false',
      ...buildPaginationParams(page, size),
      ...apiFilters,
    }
    const url = `${baseUrl}?${new URLSearchParams(allParams).toString()}`

    try {
      const result = await apiClient.get<PaginatedResponse<BusinessSubSegment>>(url)
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

  async getBusinessSubSegment(id: string): Promise<BusinessSubSegment> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_BUSINESS_SUB_SEGMENT.GET_BY_ID(id))
      const result = await apiClient.get<BusinessSubSegment>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async createBusinessSubSegment(
          data: CreateBusinessSubSegmentRequest
  ): Promise<BusinessSubSegment> {
    try {
      const result = await apiClient.post<BusinessSubSegment>(
        buildApiUrl(API_ENDPOINTS.MASTER_BUSINESS_SUB_SEGMENT.SAVE),
        data
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async updateBusinessSubSegment(
    id: string,
    updates: UpdateBusinessSubSegmentRequest
  ): Promise<BusinessSubSegment> {
    try {
      const result = await apiClient.put<BusinessSubSegment>(
        buildApiUrl(API_ENDPOINTS.MASTER_BUSINESS_SUB_SEGMENT.UPDATE(id)),
        updates
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async deleteBusinessSubSegment(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.MASTER_BUSINESS_SUB_SEGMENT.SOFT_DELETE(id))
      )
    } catch (error) {
      throw error
    }
  }
}

    export const businessSubSegmentService = new BusinessSubSegmentService()

