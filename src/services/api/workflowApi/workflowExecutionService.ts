import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'

export interface WorkflowExecution {
  id: number
  userId: string
  remarks: string
  decision: string
  workflowId: string
  createdAt: string
  updatedAt: string
}

export interface CreateWorkflowExecutionRequest {
  userId: string
  remarks: string
  decision: 'APPROVE' | 'REJECT'
}

export interface UpdateWorkflowExecutionRequest {
  userId?: string
  remarks?: string
  decision?: string
}

export interface WorkflowExecutionFilters {
  userId?: string
  decision?: string
  workflowId?: string
}

export interface WorkflowExecutionUIData {
  id: number
  userId: string
  remarks: string
  decision: string
  workflowId: string
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

export const mapWorkflowExecutionToUIData = (
  apiData: WorkflowExecution
): WorkflowExecutionUIData => {
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
    userId: formatValue(apiData.userId),
    remarks: formatValue(apiData.remarks),
    decision: formatValue(apiData.decision),
    workflowId: formatValue(apiData.workflowId),
    createdAt: formatValue(apiData.createdAt),
    updatedAt: formatValue(apiData.updatedAt),
  }
}

export class WorkflowExecutionService {
  async getWorkflowExecutions(
    page = 0,
    size = 20,
    filters?: WorkflowExecutionFilters
  ): Promise<PaginatedResponse<WorkflowExecution>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.userId) apiFilters.userId = filters.userId
      if (filters.decision) apiFilters.decision = filters.decision
      if (filters.workflowId) apiFilters.workflowId = filters.workflowId
    }
    const params = {
      page: page.toString(),
      size: size.toString(),
      ...apiFilters,
    }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.WORKFLOW_EXECUTION.FIND_ALL)}?${queryString}`
    try {
      const result =
        await apiClient.get<PaginatedResponse<WorkflowExecution>>(url)
      return result
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async getWorkflowExecution(id: string): Promise<WorkflowExecution> {
    try {
      const result = await apiClient.get<WorkflowExecution>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_EXECUTION.GET_BY_ID(id))
      )
      return result
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async createWorkflowExecution(
    workflowId: string,
    data: CreateWorkflowExecutionRequest
  ): Promise<WorkflowExecution | null> {
    try {
      const payload = {
        userId: data.userId.trim(),
        remarks: data.remarks.trim(),
        decision: data.decision,
      }
      const result = await apiClient.post<WorkflowExecution | null>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_EXECUTION.SAVE(workflowId)),
        payload
      )
      return result
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async updateWorkflowExecution(
    id: string,
    updates: UpdateWorkflowExecutionRequest
  ): Promise<WorkflowExecution> {
    const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_EXECUTION.UPDATE(id))
    try {
      const result = await apiClient.put<WorkflowExecution>(url, updates)
      return result
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async deleteWorkflowExecution(id: string): Promise<void> {
    const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_EXECUTION.DELETE(id))

    const deletePayload = { id: parseInt(id) }

    try {
      await apiClient.delete<void>(url, { data: deletePayload })
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  transformToUIData(
    apiResponse: PaginatedResponse<WorkflowExecution>
  ): PaginatedResponse<WorkflowExecutionUIData> {
    return {
      content: apiResponse.content.map((item) => ({
        id: item.id,
        userId: item.userId,
        remarks: item.remarks,
        decision: item.decision,
        workflowId: item.workflowId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      page: apiResponse.page,
    }
  }

  async getWorkflowExecutionsUIData(
    page = 0,
    size = 20,
    filters?: WorkflowExecutionFilters
  ): Promise<PaginatedResponse<WorkflowExecutionUIData>> {
    const apiResponse = await this.getWorkflowExecutions(page, size, filters)
    return this.transformToUIData(apiResponse)
  }
}

export const workflowExecutionService = new WorkflowExecutionService()
