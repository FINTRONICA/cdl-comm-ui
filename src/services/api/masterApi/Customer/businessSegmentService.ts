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

export interface BusinessSegment {
  id: number
  segmentName: string
  segmentDescription: string
  active: boolean
  taskStatusDTO?: TaskStatusDTO | null
  enabled: boolean
  deleted: boolean
  uuid?: string
}

export interface CreateBusinessSegmentRequest {
  segmentName: string
  segmentDescription: string
  active: boolean
  enabled?: boolean
  deleted?: boolean
  uuid?: string
  taskStatusDTO?: {
    id: number
  } | null
}

export interface UpdateBusinessSegmentRequest {
  id?: number
  segmentName?: string
  segmentDescription?: string
  active?: boolean
  enabled?: boolean
  deleted?: boolean
  uuid?: string
  taskStatusDTO?: {
    id: number
  } | null
}

export interface BusinessSegmentFilters {
  name?: string
}

export class BusinessSegmentService {
  async getBusinessSegments(
    page = 0,
    size = 20,
    filters?: BusinessSegmentFilters
  ): Promise<PaginatedResponse<BusinessSegment>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.name) {
        apiFilters['segmentName.contains'] = filters.name
      }
    }

    // Build URL - Use base endpoint and add all params
    const baseUrl = buildApiUrl('/business-segment')
    const allParams = {
      'deleted.equals': 'false',
      ...buildPaginationParams(page, size),
      ...apiFilters,
    }
    const url = `${baseUrl}?${new URLSearchParams(allParams).toString()}`

    try {
      const result = await apiClient.get<PaginatedResponse<BusinessSegment>>(url)
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

  async getBusinessSegment(id: string): Promise<BusinessSegment> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_BUSINESS_SEGMENT.GET_BY_ID(id))
      const result = await apiClient.get<BusinessSegment>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async createBusinessSegment(
    data: CreateBusinessSegmentRequest
  ): Promise<BusinessSegment> {
    try {
      const result = await apiClient.post<BusinessSegment>(
        buildApiUrl(API_ENDPOINTS.MASTER_BUSINESS_SEGMENT.SAVE),
        data
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async updateBusinessSegment(
    id: string,
    updates: UpdateBusinessSegmentRequest
  ): Promise<BusinessSegment> {
    try {
      const result = await apiClient.put<BusinessSegment>(
        buildApiUrl(API_ENDPOINTS.MASTER_BUSINESS_SEGMENT.UPDATE(id)),
        updates
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async deleteBusinessSegment(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.MASTER_BUSINESS_SEGMENT.SOFT_DELETE(id))
      )
    } catch (error) {
      throw error
    }
  }

  async getAllBusinessSegments(): Promise<BusinessSegment[]> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_BUSINESS_SEGMENT.FIND_ALL)
      const result = await apiClient.get<BusinessSegment[] | PaginatedResponse<BusinessSegment>>(url)

      // Handle different response structures
      if (Array.isArray(result)) {
        return result
      } else if (result && typeof result === 'object' && 'content' in result && Array.isArray((result as PaginatedResponse<BusinessSegment>).content)) {
        return (result as PaginatedResponse<BusinessSegment>).content
      }

      return []
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching all business segments:', error)
      }
      return []
    }
  }
}

export const businessSegmentService = new BusinessSegmentService()
