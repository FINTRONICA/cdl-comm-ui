import { apiClient } from '@/lib/apiClient'
import {
  buildApiUrl,
  buildPaginationParams,
  API_ENDPOINTS,
} from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'
import { toast } from 'react-hot-toast'


export interface WorkflowAction {
  id: number
  actionKey: string
  actionName: string
  moduleCode: string
  description: string
  name: string
}

export interface CreateWorkflowActionRequest {
  actionKey: string
  actionName: string
  moduleCode: string
  description?: string
  name: string
}

export interface UpdateWorkflowActionRequest {
  id: number
  actionKey?: string
  actionName?: string
  moduleCode?: string | null
  description?: string | null
  name?: string | null
}

export interface WorkflowActionFilters {
  name?: string
  moduleCode?: string
  actionKey?: string
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
    const params = { ...buildPaginationParams(page, size), ...apiFilters }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.WORKFLOW_ACTION.FIND_ALL)}?${queryString}`
    try {
      const result = await apiClient.get<PaginatedResponse<WorkflowAction>>(url)
      return result
    } catch (error) {
      toast.error(`${error}`)

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
      toast.error(`${error}`)

      throw error
    }
  }

  async getWorkflowAction(id: string): Promise<WorkflowAction> {
    try {
      const result = await apiClient.get<WorkflowAction>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_ACTION.GET_BY_ID(id))
      )
      return result
    } catch (error) {
      toast.error(`${error}`)

      throw error
    }
  }

  async createWorkflowAction(
    data: CreateWorkflowActionRequest
  ): Promise<WorkflowAction> {
    try {
      const payload = {
        actionKey: data.actionKey.trim(),
        actionName: data.actionName.trim(),
        moduleCode: data.moduleCode.trim(),
        description: data.description?.trim() || '',
        name: data.name.trim(),
      }
      const result = await apiClient.post<WorkflowAction>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_ACTION.SAVE),
        payload
      )
      return result
    } catch (error) {
      toast.error(`${error}`)

      throw error
    }
  }

  async updateWorkflowAction(
    id: string,
    updates: UpdateWorkflowActionRequest
  ): Promise<WorkflowAction> {
    const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_ACTION.UPDATE(id))
    try {
      const result = await apiClient.put<WorkflowAction>(url, updates)
      return result
    } catch (error) {
      toast.error(`${error}`)

      throw error
    }
  }

  async deleteWorkflowAction(id: string): Promise<void> {
    const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_ACTION.DELETE(id))

    const deletePayload = { id: parseInt(id) }

    try {
      await apiClient.delete<void>(url, { data: deletePayload })
    } catch (error) {
      toast.error(`${error}`)

      throw error
    }
  }

  transformToUIData(
    apiResponse: PaginatedResponse<WorkflowAction>
  ): PaginatedResponse<WorkflowActionUIData> {
    return {
      content: apiResponse.content.map((item) => ({
        id: item.id,
        name: item.name,
        actionKey: item.actionKey,
        actionName: item.actionName,
        moduleCode: item.moduleCode,
        description: item.description,
      })),
      page: apiResponse.page,
    }
  }

  async getWorkflowActionsUIData(
    page = 0,
    size = 20,
    filters?: WorkflowActionFilters
  ): Promise<PaginatedResponse<WorkflowActionUIData>> {
    const apiResponse = await this.getWorkflowActions(page, size, filters)
    return this.transformToUIData(apiResponse)
  }
}

export const workflowActionService = new WorkflowActionService()
