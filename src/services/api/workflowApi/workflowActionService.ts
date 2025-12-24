import { apiClient } from '@/lib/apiClient'
import {
  buildApiUrl,
  buildPaginationParams,
  API_ENDPOINTS,
} from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'
export interface WorkflowAction {
  id: number
  actionKey: string
  actionName: string
  moduleCode: string
  description: string
  name: string
  enabled: boolean
  deleted: boolean
  createdAt: string
  updatedAt: string
}
export interface CreateWorkflowActionRequest {
  actionKey: string
  actionName: string
  moduleCode: string
  description?: string
  name: string
  enabled?: boolean
  deleted?: boolean
  createdAt?: string
  updatedAt?: string
}
export interface UpdateWorkflowActionRequest {
  id: number
  actionKey?: string
  actionName?: string
  moduleCode?: string
  description?: string
  name?: string
}
export interface WorkflowActionFilters {
  name?: string
  actionKey?: string
  actionName?: string
  moduleCode?: string
  description?: string
}
export interface WorkflowActionUIData {
  id: number
  name: string
  actionKey: string
  actionName: string
  moduleCode: string
  description: string
  [key: string]: unknown
}

export const mapWorkflowActionToUIData = (
  apiData: WorkflowAction
): WorkflowActionUIData => {
  const formatValue = (value: string | null | undefined): string => {
    if (
      !value ||
      value === 'N/A' ||
      value === 'null' ||
      value === 'undefined' ||
      value.trim() === ''
    ) {
      return '-'
    }
    return value
  }

  return {
    id: apiData.id,
    name: formatValue(apiData.name),
    actionKey: formatValue(apiData.actionKey),
    actionName: formatValue(apiData.actionName),
    moduleCode: formatValue(apiData.moduleCode),
    description: formatValue(apiData.description),
  }
}
export class WorkflowActionService {
  async getWorkflowActions(
    page = 0,
    size = 20,
    filters?: WorkflowActionFilters
  ): Promise<PaginatedResponse<WorkflowAction>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.name) apiFilters.name = filters.name
      if (filters.moduleCode) apiFilters.moduleCode = filters.moduleCode
      if (filters.actionKey) apiFilters.actionKey = filters.actionKey
      if (filters.description) apiFilters.description = filters.description
    }
    const params = {
      ...buildPaginationParams(page, size),
      ...apiFilters,
      'deleted.equals': 'false',
      'enabled.equals': 'true',
    }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.WORKFLOW_ACTION.FIND_ALL)}?${queryString}`
    try {
      const result = await apiClient.get<PaginatedResponse<WorkflowAction>>(url)
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

  async searchWorkflowActions(
    query: string,
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<WorkflowAction>> {
    const params = { ...buildPaginationParams(page, size), query }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.WORKFLOW_ACTION.SEARCH)}?${queryString}`

    try {
      const result = await apiClient.get<PaginatedResponse<WorkflowAction>>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async getWorkflowAction(id: string): Promise<WorkflowAction> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_ACTION.GET_BY_ID(id))
      const result = await apiClient.get<WorkflowAction>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async createWorkflowAction(
    data: CreateWorkflowActionRequest
  ): Promise<WorkflowAction> {
    try {
      const result = await apiClient.post<WorkflowAction>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_ACTION.SAVE),
        data
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async updateWorkflowAction(
    id: string,
    updates: UpdateWorkflowActionRequest
  ): Promise<WorkflowAction> {
    try {
      const result = await apiClient.put<WorkflowAction>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_ACTION.UPDATE(id)),
        updates
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async deleteWorkflowAction(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_ACTION.SOFT_DELETE(id))
      )
    } catch (error) {
      throw error
    }
  }

  async getAllWorkflowActions(): Promise<WorkflowAction[]> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_ACTION.FIND_ALL)
      const result = await apiClient.get<
        WorkflowAction[] | PaginatedResponse<WorkflowAction>
      >(url)

      // Handle different response structures
      if (Array.isArray(result)) {
        return result
      } else if (
        result &&
        typeof result === 'object' &&
        'content' in result &&
        Array.isArray((result as PaginatedResponse<WorkflowAction>).content)
      ) {
        return (result as PaginatedResponse<WorkflowAction>).content
      }

      return []
    } catch (error) {
      throw error
    }
  }
}

export const workflowActionService = new WorkflowActionService()
