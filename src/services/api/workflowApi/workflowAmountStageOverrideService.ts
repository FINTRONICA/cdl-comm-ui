import { apiClient } from '@/lib/apiClient'
import {
  buildApiUrl,
  buildPaginationParams,
  API_ENDPOINTS,
} from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'
import { toast } from 'react-hot-toast'
export interface WorkflowAmountRuleDTO {
  id: number
  currency: string
  minAmount: number
  maxAmount: number
  priority: number
  requiredMakers: number
  requiredCheckers: number
  workflowDefinitionDTO: {
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
      moduleName: string
      moduleCode: string
      moduleDescription: string
      deleted: boolean
      active: boolean
    }
    workflowActionDTO: {
      id: number
      actionKey: string
      actionName: string
      moduleCode: string
      description: string
      name: string
    }
    stageTemplates: Array<{
      id: number
      stageOrder: number
      stageKey: string
      keycloakGroup: string
      requiredApprovals: number
      name: string
      description: string
      slaHours: number
      workflowDefinitionDTO: string
    }>
    amountRules: string[]
    active: boolean
  }
  workflowId: number
  workflowAmountStageOverrideDTOS: Array<{
    id: number
    workflowAmountRule: {
      id: number
      workflowDefinition: Record<string, unknown>
      currency: string
      minAmount: number
      maxAmount: number
      priority: number
      requiredMakers: number
      requiredCheckers: number
      isActive: boolean
      workflowId: number
      stageOverrides: string[]
      deleted: boolean
    }
    stageOrder: number
    stageKey: string
    requiredApprovals: number
    keycloakGroup: string
    deleted: boolean
  }>
  active: boolean
}

export interface WorkflowAmountStageOverride {
  id: number
  stageOrder: number
  requiredApprovals: number
  keycloakGroup: string
  stageKey: string
  workflowAmountRuleDTO: WorkflowAmountRuleDTO
}

export interface CreateWorkflowAmountStageOverrideRequest {
  stageOrder: number
  requiredApprovals: number
  keycloakGroup: string
  stageKey: string
  workflowAmountRuleId: number
}

export interface UpdateWorkflowAmountStageOverrideRequest {
  id: number
  stageOrder: number
  requiredApprovals: number
  keycloakGroup: string
  stageKey: string
  workflowAmountRuleId: number
}

export interface WorkflowAmountStageOverrideLabel {
  id: number
  configId: string
  configValue: string
  content: string | null
  appLanguageCode: {
    id: number
    languageCode: string
    nameKey: string
    nameNativeValue: string
    enabled: boolean
    rtl: boolean
  }
  applicationModuleDTO: {
    id: number
    moduleName: string
    moduleDescription: string
    active: boolean
  }
  status: string | null
  enabled: boolean
}

export interface WorkflowAmountStageOverrideUIData {
  id: number
  stageOrder: number
  requiredApprovals: number
  keycloakGroup: string
  stageKey: string
  workflowAmountRuleId: number
  workflowAmountRuleName?: string
  active?: boolean
}

export const mapWorkflowAmountStageOverrideToUI = (
  apiData: WorkflowAmountStageOverride
): WorkflowAmountStageOverrideUIData => {
  return {
    id: apiData.id,
    stageOrder: apiData.stageOrder,
    requiredApprovals: apiData.requiredApprovals,
    keycloakGroup: apiData.keycloakGroup,
    stageKey: apiData.stageKey,
    workflowAmountRuleId: apiData.workflowAmountRuleDTO.id,
    workflowAmountRuleName: `RULE_${apiData.workflowAmountRuleDTO.id}`,
    active: apiData.workflowAmountRuleDTO.active,
  }
}

// Filter interface for search and filtering
export interface WorkflowAmountStageOverrideFilters {
  stageOrder?: number
  requiredApprovals?: number
  keycloakGroup?: string
  stageKey?: string
  workflowAmountRuleId?: number
}

export class WorkflowAmountStageOverrideService {
  // Map UI filter names to API field names
  private mapFiltersToAPI(
    filters: WorkflowAmountStageOverrideFilters
  ): Record<string, string> {
    const apiFilters: Record<string, string> = {}

    if (filters.stageOrder !== undefined) {
      apiFilters['stageOrder.equals'] = filters.stageOrder.toString()
    }
    if (filters.requiredApprovals !== undefined) {
      apiFilters['requiredApprovals.equals'] =
        filters.requiredApprovals.toString()
    }
    if (filters.keycloakGroup) {
      apiFilters['keycloakGroup.contains'] = filters.keycloakGroup
    }
    if (filters.stageKey) {
      apiFilters['stageKey.contains'] = filters.stageKey
    }
    if (filters.workflowAmountRuleId !== undefined) {
      apiFilters['workflowAmountRuleDTO.id.equals'] =
        filters.workflowAmountRuleId.toString()
    }

    return apiFilters
  }

  async getWorkflowAmountStageOverrides(
    page = 0,
    size = 20,
    filters?: WorkflowAmountStageOverrideFilters
  ): Promise<PaginatedResponse<WorkflowAmountStageOverride>> {
    const paginationParams = buildPaginationParams(page, size)
    const apiFilters = filters ? this.mapFiltersToAPI(filters) : {}

    const queryParams = { ...paginationParams, ...apiFilters }
    const queryString = new URLSearchParams(queryParams).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.WORKFLOW_AMOUNT_STAGE_OVERRIDE.FIND_ALL)}?${queryString}`

    try {
      const result =
        await apiClient.get<PaginatedResponse<WorkflowAmountStageOverride>>(url)
      return result
    } catch (error) {
      toast.error(`${error}`)
      throw error
    }
  }

  async getWorkflowAmountStageOverride(
    id: string
  ): Promise<WorkflowAmountStageOverride> {
    try {
      const result = await apiClient.get<WorkflowAmountStageOverride>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_AMOUNT_STAGE_OVERRIDE.GET_BY_ID(id))
      )
      return result
    } catch (error) {
      toast.error(`${error}`)
      throw error
    }
  }

  async createWorkflowAmountStageOverride(
    data: CreateWorkflowAmountStageOverrideRequest
  ): Promise<WorkflowAmountStageOverride> {
    try {
      const payload = {
        stageOrder: data.stageOrder,
        requiredApprovals: data.requiredApprovals,
        keycloakGroup: data.keycloakGroup,
        stageKey: data.stageKey,
        workflowAmountRuleDTO: {
          id: data.workflowAmountRuleId,
        },
      }
      const result = await apiClient.post<WorkflowAmountStageOverride>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_AMOUNT_STAGE_OVERRIDE.SAVE),
        payload
      )
      return result
    } catch (error) {
      toast.error(`${error}`)
      throw error
    }
  }

  async updateWorkflowAmountStageOverride(
    id: string,
    updates: UpdateWorkflowAmountStageOverrideRequest
  ): Promise<WorkflowAmountStageOverride> {
    try {
      const payload = {
        id: updates.id,
        stageOrder: updates.stageOrder,
        requiredApprovals: updates.requiredApprovals,
        keycloakGroup: updates.keycloakGroup,
        stageKey: updates.stageKey,
        workflowAmountRuleDTO: {
          id: updates.workflowAmountRuleId,
        },
      }
      const result = await apiClient.put<WorkflowAmountStageOverride>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_AMOUNT_STAGE_OVERRIDE.UPDATE(id)),
        payload
      )
      return result
    } catch (error) {
      toast.error(`${error}`)
      throw error
    }
  }

  async deleteWorkflowAmountStageOverride(id: string): Promise<void> {
    try {
      await apiClient.delete(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_AMOUNT_STAGE_OVERRIDE.DELETE(id))
      )
    } catch (error) {
      toast.error(`${error}`)
      throw error
    }
  }

  async getWorkflowAmountRuleById(id: string): Promise<WorkflowAmountRuleDTO> {
    try {
      const result = await apiClient.get<WorkflowAmountRuleDTO>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_AMOUNT_RULE.GET_BY_ID(id))
      )
      return result
    } catch (error) {
      toast.error(`${error}`)
      throw error
    }
  }

  async getWorkflowAmountStageOverrideLabels(): Promise<
    WorkflowAmountStageOverrideLabel[]
  > {
    return apiClient.get<WorkflowAmountStageOverrideLabel[]>(
      buildApiUrl(
        API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.WORKFLOW_AMOUNT_STAGE_OVERRIDE
      )
    )
  }

  // Utility method to get UI-friendly data directly
  async getWorkflowAmountStageOverridesUIData(
    page = 0,
    size = 20,
    filters?: WorkflowAmountStageOverrideFilters
  ): Promise<PaginatedResponse<WorkflowAmountStageOverrideUIData>> {
    const apiResponse = await this.getWorkflowAmountStageOverrides(
      page,
      size,
      filters
    )
    return {
      ...apiResponse,
      content: apiResponse.content.map(mapWorkflowAmountStageOverrideToUI),
    }
  }

  transformToUIData(
    apiResponse: PaginatedResponse<WorkflowAmountStageOverride>
  ): PaginatedResponse<WorkflowAmountStageOverrideUIData> {
    return {
      ...apiResponse,
      content: apiResponse.content.map(mapWorkflowAmountStageOverrideToUI),
    }
  }
}

export const workflowAmountStageOverrideService =
  new WorkflowAmountStageOverrideService()
