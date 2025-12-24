import { apiClient } from '@/lib/apiClient'
import {
  buildApiUrl,
  buildPaginationParams,
  API_ENDPOINTS,
} from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'
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
    moduleName?: string
    name?: string
    moduleCode?: string
    code?: string
    moduleDescription?: string
    description?: string
    deleted?: boolean
    enabled?: boolean
    active?: boolean
    [key: string]: unknown
  }
  workflowActionDTO: {
    id: number
    actionKey?: string
    actionName?: string
    name?: string
    moduleCode?: string
    code?: string
    description?: string
    enabled?: boolean
    deleted?: boolean
    [key: string]: unknown
  }
  stageTemplates?: Array<{
    id: number
    name: string
    stageKey: string
    [key: string]: unknown
  }> | string[]
  amountRules?: Array<{
    id: number
    ruleName?: string
    amountRuleName?: string
    [key: string]: unknown
  }> | string[]
  enabled?: boolean
  deleted?: boolean
  active?: boolean
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
  const getWorkflowDefinitionDTO = (
    workflowDefinitionDTO: string | WorkflowDefinitionDTO | null | undefined
  ): string => {
    if (!workflowDefinitionDTO) {
      return ''
    }
    if (typeof workflowDefinitionDTO === 'string') {
      const trimmed = workflowDefinitionDTO.trim()
      return trimmed === '' || trimmed === '-' || trimmed === 'null' || trimmed === 'undefined' ? '' : trimmed
    } else if (
      typeof workflowDefinitionDTO === 'object' &&
      workflowDefinitionDTO.id !== undefined &&
      workflowDefinitionDTO.id !== null
    ) {
      return String(workflowDefinitionDTO.id)
    }
    return ''
  }

  const deleted = (apiData as any).deleted === true
  const activeDefined = (apiData as any).active !== undefined
  const enabledDefined = (apiData as any).enabled !== undefined
  const active = activeDefined ? (apiData as any).active : undefined
  const enabled = enabledDefined
    ? (apiData as any).enabled
    : (activeDefined ? active : !deleted)
  const createdBy = (apiData as any).createdBy ?? ''
  const createdAt = (apiData as any).createdAt ?? ''
  const updatedBy = (apiData as any).updatedBy ?? ''
  const updatedAt = (apiData as any).updatedAt ?? ''

  return {
    id: apiData.id ?? 0,
    stageOrder: apiData.stageOrder ?? 0,
    stageKey: apiData.stageKey && apiData.stageKey.trim() !== '' ? apiData.stageKey : '',
    keycloakGroup: apiData.keycloakGroup && apiData.keycloakGroup.trim() !== '' ? apiData.keycloakGroup : '',
    requiredApprovals: apiData.requiredApprovals ?? 0,
    name: apiData.name && apiData.name.trim() !== '' ? apiData.name.trim() : '',
    description: apiData.description && apiData.description.trim() !== '' ? apiData.description.trim() : '',
    slaHours: apiData.slaHours ?? 0,
    workflowDefinitionDTO: getWorkflowDefinitionDTO(
      apiData.workflowDefinitionDTO
    ),
    workflowDefinitionName: (() => {
      if (apiData.workflowDefinitionDTO && typeof apiData.workflowDefinitionDTO === 'object') {
        const wfDef = apiData.workflowDefinitionDTO as WorkflowDefinitionDTO
        const name = wfDef.name || (wfDef as any).workflowDefinitionName
        if (name && typeof name === 'string' && name.trim() !== '') {
          return name.trim()
        }
      }
      return ''
    })(),
    workflowDefinitionVersion: (() => {
      if (apiData.workflowDefinitionDTO && typeof apiData.workflowDefinitionDTO === 'object') {
        const wfDef = apiData.workflowDefinitionDTO as WorkflowDefinitionDTO
        const version = wfDef.version ?? (wfDef as any).workflowDefinitionVersion ?? 0
        return typeof version === 'number' ? version : 0
      }
      return 0
    })(),
    status: (() => {
      if (deleted) return 'Deleted'
      if (enabled === false) return 'Inactive'
      if (enabled === true) return 'Active'
      if (active === false) return 'Inactive'
      return 'Active'
    })(),
    createdBy: createdBy && createdBy.trim() !== '' ? createdBy.trim() : '',
    createdAt: createdAt && createdAt.trim() !== '' ? createdAt.trim() : '',
    updatedBy: updatedBy && updatedBy.trim() !== '' ? updatedBy.trim() : '',
    updatedAt: updatedAt && updatedAt.trim() !== '' ? updatedAt.trim() : '',
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
      const result = await apiClient.get<
        PaginatedResponse<WorkflowStageTemplateResponse> | WorkflowStageTemplateResponse[]
      >(url)
      // Handle both array response and paginated response
      if (Array.isArray(result)) {
        return {
          content: result,
          page: {
            size: result.length,
            number: page,
            totalElements: result.length,
            totalPages: 1,
          },
        }
      }
      return result as PaginatedResponse<WorkflowStageTemplateResponse>
    } catch (error) {
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
      throw error
    }
  }

  async deleteWorkflowStageTemplate(id: string): Promise<void> {
    const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_STAGE_TEMPLATE.DELETE(id))
    try {
      await apiClient.delete<void>(url)
    } catch (error) {
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
