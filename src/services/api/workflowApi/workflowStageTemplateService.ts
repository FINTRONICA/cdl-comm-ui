import { apiClient } from '@/lib/apiClient'
import {
  buildApiUrl,
  buildPaginationParams,
  API_ENDPOINTS,
} from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'
import { toast } from 'react-hot-toast'

export interface WorkflowStageTemplate {
  id: number
  stageOrder: number
  stageKey: string
  keycloakGroup: string
  requiredApprovals: number
  name: string
  description: string
  slaHours: number
  workflowDefinitionDTO: string
  workflowDefinitionName?: string
  workflowDefinitionVersion?: number
  status?: string
  createdBy?: string
  createdAt?: string
  updatedBy?: string
  updatedAt?: string
}

export interface CreateWorkflowStageTemplateRequest {
  stageOrder: number
  stageKey: string
  keycloakGroup: string
  requiredApprovals: number
  name: string
  description: string
  slaHours: number
  workflowDefinitionDTO: string
  createdBy?: string
}

export interface UpdateWorkflowStageTemplateRequest {
  id?: string
  stageOrder?: number
  stageKey?: string
  keycloakGroup?: string
  requiredApprovals?: number
  name?: string
  description?: string
  slaHours?: number
  workflowDefinitionDTO?: string
  workflowDefinitionId?: string

  workflowDefinitionName?: string
  workflowDefinitionVersion?: number
  status?: string
  createdBy?: string
  updatedBy?: string
}

export interface WorkflowStageTemplateFilters {
  name?: string
  stageKey?: string
  keycloakGroup?: string
  description?: string
}

export interface WorkflowDefinitionDTO {
  id: number
  name: string
  version: number
  createdBy: string
  createdAt: string
  amountBased: boolean
  moduleCode: string
  actionCode: string
  applicationModuleDTO: {
    id: number
    name: string
    code: string
    [key: string]: unknown
  }
  workflowActionDTO: {
    id: number
    name: string
    code: string
    [key: string]: unknown
  }
  stageTemplates: Array<{
    id: number
    name: string
    stageKey: string
    [key: string]: unknown
  }>
  amountRules: Array<{
    id: number
    ruleName: string
    [key: string]: unknown
  }>
  active: boolean
}

export interface WorkflowStageTemplateResponse {
  id: number
  stageOrder: number
  stageKey: string
  keycloakGroup: string
  requiredApprovals: number
  name: string
  description: string
  slaHours: number
  workflowDefinitionDTO: string | WorkflowDefinitionDTO
  [key: string]: unknown
}

export const mapWorkflowStageTemplateData = (
  apiData: WorkflowStageTemplateResponse
): WorkflowStageTemplate => {
  const formatValue = (
    value: string | number | null | undefined
  ): string | number => {
    if (value === null || value === undefined) {
      return '-'
    }
    if (
      typeof value === 'string' &&
      (value === 'N/A' ||
        value === 'null' ||
        value === 'undefined' ||
        value.trim() === '')
    ) {
      return '-'
    }
    return value
  }

  const getWorkflowDefinitionDTO = (
    workflowDefinitionDTO: string | WorkflowDefinitionDTO
  ): string => {
    if (typeof workflowDefinitionDTO === 'string') {
      return formatValue(workflowDefinitionDTO) as string
    } else if (
      workflowDefinitionDTO &&
      typeof workflowDefinitionDTO === 'object' &&
      workflowDefinitionDTO.id
    ) {
      return workflowDefinitionDTO.id.toString()
    }
    return '-'
  }

  return {
    id: apiData.id,
    stageOrder: apiData.stageOrder,
    stageKey: formatValue(apiData.stageKey) as string,
    keycloakGroup: formatValue(apiData.keycloakGroup) as string,
    requiredApprovals: apiData.requiredApprovals,
    name: formatValue(apiData.name) as string,
    description: formatValue(apiData.description) as string,
    slaHours: apiData.slaHours,
    workflowDefinitionDTO: getWorkflowDefinitionDTO(
      apiData.workflowDefinitionDTO
    ),
  }
}

export class WorkflowStageTemplateService {
  async getWorkflowStageTemplates(
    page = 0,
    size = 20,
    filters?: WorkflowStageTemplateFilters
  ): Promise<PaginatedResponse<WorkflowStageTemplateResponse>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.name) apiFilters.name = filters.name
      if (filters.stageKey) apiFilters.stageKey = filters.stageKey
      if (filters.keycloakGroup)
        apiFilters.keycloakGroup = filters.keycloakGroup
      if (filters.description) apiFilters.description = filters.description
    }
    const params = { ...buildPaginationParams(page, size), ...apiFilters }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.WORKFLOW_STAGE_TEMPLATE.FIND_ALL)}?${queryString}`
    try {
      const result =
        await apiClient.get<PaginatedResponse<WorkflowStageTemplateResponse>>(
          url
        )
      return result
    } catch (error) {
      toast.error(`${error}`)
      throw error
    }
  }

  async getWorkflowStageTemplate(
    id: string
  ): Promise<WorkflowStageTemplateResponse> {
    try {
      const result = await apiClient.get<WorkflowStageTemplateResponse>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_STAGE_TEMPLATE.GET_BY_ID(id))
      )
      return result
    } catch (error) {
      toast.error(`${error}`)
      throw error
    }
  }

  async getWorkflowStageTemplateLabels(): Promise<Record<string, unknown>[]> {
    try {
      const result = await apiClient.get<Record<string, unknown>[]>(
        buildApiUrl(
          API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.WORKFLOW_STAGE_TEMPLATE
        )
      )
      return result
    } catch (error) {
      toast.error(`${error}`)
      throw error
    }
  }

  async createWorkflowStageTemplate(
    data: CreateWorkflowStageTemplateRequest
  ): Promise<WorkflowStageTemplateResponse> {
    try {
      const workflowDefinitionId =
        'workflowDefinitionId' in data && data.workflowDefinitionId
          ? data.workflowDefinitionId
          : 'workflowDefinitionDTO' in data &&
            typeof (data as { workflowDefinitionDTO?: string })
              .workflowDefinitionDTO === 'string'
            ? (data as { workflowDefinitionDTO?: string }).workflowDefinitionDTO
            : undefined

      const payload = {
        stageOrder: data.stageOrder,
        stageKey: data.stageKey,
        keycloakGroup: data.keycloakGroup,
        requiredApprovals: data.requiredApprovals,
        name: data.name,
        description: data.description,
        slaHours: data.slaHours,
        ...(data.createdBy && { createdBy: data.createdBy }),
        ...(workflowDefinitionId
          ? { workflowDefinitionDTO: { id: workflowDefinitionId } }
          : {}),
      }

      const result = await apiClient.post<WorkflowStageTemplateResponse>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_STAGE_TEMPLATE.SAVE),
        payload
      )
      return result
    } catch (error) {
      toast.error(`${error}`)
      throw error
    }
  }

  async updateWorkflowStageTemplate(
    id: string,
    updates: UpdateWorkflowStageTemplateRequest
  ): Promise<WorkflowStageTemplateResponse> {
    try {
      const workflowDefinitionId =
        typeof updates === 'object' &&
          'workflowDefinitionId' in updates &&
          updates.workflowDefinitionId
          ? updates.workflowDefinitionId
          : typeof updates === 'object' && 'workflowDefinitionDTO' in updates
            ? (updates as any).workflowDefinitionDTO
            : // ? (updates as { workflowDefinitionDTO?: string }).workflowDefinitionDTO
            undefined

      const payload = {
        ...(updates.id ? { id: updates.id } : {}),
        stageOrder: updates.stageOrder,
        stageKey: updates.stageKey,
        keycloakGroup: updates.keycloakGroup,
        requiredApprovals: updates.requiredApprovals,
        name: updates.name,
        description: updates.description,
        slaHours: updates.slaHours,
        workflowDefinitionName: updates.workflowDefinitionName,
        workflowDefinitionVersion: updates.workflowDefinitionVersion,
        status: updates.status,
        ...(updates.createdBy && { createdBy: updates.createdBy }),
        ...(updates.updatedBy && { updatedBy: updates.updatedBy }),
        ...(workflowDefinitionId
          ? { workflowDefinitionDTO: { id: workflowDefinitionId } }
          : {}),
      }

      const result = await apiClient.put<WorkflowStageTemplateResponse>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_STAGE_TEMPLATE.UPDATE(id)),
        payload
      )
      return result
    } catch (error) {
      toast.error(`${error}`)
      throw error
    }
  }

  async deleteWorkflowStageTemplate(id: string): Promise<void> {
    const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_STAGE_TEMPLATE.DELETE(id))
    try {
      await apiClient.delete<void>(url)
    } catch (error) {
      toast.error(`${error}`)
      throw error
    }
  }

  transformToUIData(
    apiResponse: PaginatedResponse<WorkflowStageTemplateResponse>
  ): PaginatedResponse<WorkflowStageTemplate> {
    return {
      content: apiResponse.content.map((item) =>
        mapWorkflowStageTemplateData(item)
      ),
      page: apiResponse.page,
    }
  }

  async getWorkflowStageTemplateData(
    page = 0,
    size = 20,
    filters?: WorkflowStageTemplateFilters
  ): Promise<PaginatedResponse<WorkflowStageTemplate>> {
    const apiResponse = await this.getWorkflowStageTemplates(
      page,
      size,
      filters
    )
    return this.transformToUIData(apiResponse)
  }
}

export const workflowStageTemplateService = new WorkflowStageTemplateService()
