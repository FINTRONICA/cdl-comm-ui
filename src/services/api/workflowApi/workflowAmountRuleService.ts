import { apiClient } from '@/lib/apiClient'
import {
  buildApiUrl,
  buildPaginationParams,
  API_ENDPOINTS,
} from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'
import { toast } from 'react-hot-toast'

export interface WorkflowAmountStageOverride {
  id: number
  stageOrder: number
  requiredApprovals: number
  keycloakGroup: string
  stageKey: string
  workflowAmountRuleDTO?: unknown
}

export interface WorkflowAmountRuleDTO {
  id: number | string
  currency: string
  minAmount: number
  maxAmount: number | null
  priority: number
  requiredMakers: number | null
  requiredCheckers: number | null
  workflowDefinitionDTO: {
    id: number | string
    name?: string
    version?: number
    createdBy?: string
    createdAt?: string
    amountBased?: boolean
    moduleCode?: string
    actionCode?: string
    applicationModuleDTO?: Record<string, unknown>
    workflowActionDTO?: Record<string, unknown>
    stageTemplates?: Record<string, unknown>[]
    active?: boolean
    workflowId: number | string | null
    amountRuleName: string
    workflowAmountStageOverrideDTOS: WorkflowAmountStageOverride[] | null
  }
}

export interface WorkflowAmountRule {
  id: number
  currency: string
  minAmount: number
  maxAmount: number
  priority: number
  requiredMakers: number
  requiredCheckers: number
  workflowDefinitionDTO: {
    id: number
  }
  workflowId: number
  amountRuleName: string
  workflowAmountStageOverrideDTOS: WorkflowAmountStageOverride[]
  active: boolean
}

export interface CreateWorkflowAmountRuleRequest {
  currency: string
  minAmount: number
  maxAmount: number
  priority: number
  requiredMakers: number
  requiredCheckers: number
  workflowDefinitionId: number
  workflowId: number
  amountRuleName: string
  enabled: boolean
}
export interface UpdateWorkflowAmountRuleRequest {
  id: number
  currency: string
  minAmount: number
  maxAmount: number
  priority: number
  requiredMakers: number
  requiredCheckers: number
  workflowDefinitionId: number
  enabled: boolean
}

export interface WorkflowAmountRuleLabel {
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

export interface WorkflowDefinitionDTO {
  id: number
  name: string
  version: number
  createdBy: string
  createdAt: string
  amountBased: boolean
  moduleCode: string
  actionCode: string
  applicationModuleDTO: ApplicationModuleDTO
  workflowActionDTO: WorkflowActionDTO
  stageTemplates: StageTemplateDTO[]
  amountRules: string[]
  active: boolean
}

export interface ApplicationModuleDTO {
  id: number
  moduleName: string
  moduleCode: string
  moduleDescription: string
  active: boolean
  deleted: boolean
}

export interface WorkflowActionDTO {
  id: number
  actionKey: string
  actionName: string
  description: string
  moduleCode: string
  name: string
}

export interface StageTemplateDTO {
  id: number
  workflowDefinitionDTO: string
  stageOrder: number
  stageKey: string
  keycloakGroup: string
  requiredApprovals: number
  name: string
  description: string
  slaHours: number
}

export interface WorkflowAmountRuleUIData {
  id: number | string
  currency: string
  minAmount: number
  maxAmount: number
  priority: number
  requiredMakers: number
  requiredCheckers: number
  workflowDefinitionDTO: {
    id: number | string
    name?: string
  }
  workflowId: number | string
  amountRuleName: string
  workflowAmountStageOverrideDTOS: WorkflowAmountStageOverride[]
  enabled: boolean
  status?: string
}

export const mapWorkflowAmountRuleToUI = (
  apiData: WorkflowAmountRuleDTO
): WorkflowAmountRuleUIData => {
  return {
    id: apiData.id,
    currency: apiData.currency,
    minAmount: apiData.minAmount ?? 0,
    maxAmount: apiData.maxAmount ?? 0,
    priority: apiData.priority ?? 0,
    requiredMakers: apiData.requiredMakers ?? 0,
    requiredCheckers: apiData.requiredCheckers ?? 0,
    workflowDefinitionDTO: (() => {
      const name = (apiData.workflowDefinitionDTO as { name?: string })?.name
      return {
        id: apiData.workflowDefinitionDTO.id,
        ...(name ? { name } : {}),
      }
    })(),
    workflowId: (apiData as { workflowId?: number | string })?.workflowId ?? 0,
    amountRuleName:
      (apiData as { amountRuleName?: string })?.amountRuleName ?? '',
    workflowAmountStageOverrideDTOS:
      (
        apiData as {
          workflowAmountStageOverrideDTOS?: WorkflowAmountStageOverride[]
        }
      )?.workflowAmountStageOverrideDTOS || [],
    enabled: (apiData as { enabled?: boolean })?.enabled ?? false,
    status: (apiData as { enabled?: boolean })?.enabled ? 'Active' : 'Inactive',
  }
}

export interface WorkflowAmountRuleFilters {
  currency?: string
  minAmount?: number
  maxAmount?: number
  priority?: number
  requiredMakers?: number
  requiredCheckers?: number
  amountRuleName?: string
  workflowDefinitionId?: number | string
  workflowId?: number | string
  active?: boolean
}

export class WorkflowAmountRuleService {
  private mapFiltersToAPI(
    filters: WorkflowAmountRuleFilters
  ): Record<string, string> {
    const apiFilters: Record<string, string> = {}

    if (filters.currency) {
      apiFilters['currency.contains'] = filters.currency
    }
    if (filters.minAmount !== undefined) {
      apiFilters['minAmount.greaterThanOrEqual'] = filters.minAmount.toString()
    }
    if (filters.maxAmount !== undefined) {
      apiFilters['maxAmount.lessThanOrEqual'] = filters.maxAmount.toString()
    }
    if (filters.priority !== undefined) {
      apiFilters['priority.equals'] = filters.priority.toString()
    }
    if (filters.requiredMakers !== undefined) {
      apiFilters['requiredMakers.equals'] = filters.requiredMakers.toString()
    }
    if (filters.requiredCheckers !== undefined) {
      apiFilters['requiredCheckers.equals'] =
        filters.requiredCheckers.toString()
    }
    if (filters.amountRuleName) {
      apiFilters['amountRuleName.contains'] = filters.amountRuleName
    }
    if (filters.workflowDefinitionId !== undefined) {
      apiFilters['workflowDefinitionDTO.id.equals'] =
        filters.workflowDefinitionId.toString()
    }
    if (filters.workflowId !== undefined) {
      apiFilters['workflowId.equals'] = filters.workflowId.toString()
    }
    if (filters.active !== undefined) {
      apiFilters['active.equals'] = filters.active.toString()
    }

    return apiFilters
  }

  async getWorkflowAmountRules(
    page = 0,
    size = 20,
    filters?: WorkflowAmountRuleFilters
  ): Promise<PaginatedResponse<WorkflowAmountRuleDTO>> {
    const paginationParams = buildPaginationParams(page, size)
    const apiFilters = filters ? this.mapFiltersToAPI(filters) : {}

    const queryParams = { ...paginationParams, ...apiFilters }
    const queryString = new URLSearchParams(queryParams).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.WORKFLOW_AMOUNT_RULE.FIND_ALL)}?${queryString}`

    try {
      const result =
        await apiClient.get<PaginatedResponse<WorkflowAmountRuleDTO>>(url)
      return result
    } catch (error) {
      toast.error(`${error}`)
      throw error
    }
  }

  async getWorkflowAmountRule(id: string): Promise<WorkflowAmountRuleDTO> {
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

  async createWorkflowAmountRule(
    data: CreateWorkflowAmountRuleRequest
  ): Promise<WorkflowAmountRuleDTO> {
    try {
      const payload = {
        currency: data.currency,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        priority: data.priority,
        requiredMakers: data.requiredMakers,
        requiredCheckers: data.requiredCheckers,
        workflowDefinitionDTO: {
          id: data.workflowDefinitionId,
        },
        workflowId: data.workflowId,
        amountRuleName: data.amountRuleName,
        enabled: data.enabled,
      }
      const result = await apiClient.post<WorkflowAmountRuleDTO>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_AMOUNT_RULE.SAVE),
        payload
      )
      return result
    } catch (error) {
      toast.error(`${error}`)
      throw error
    }
  }

  async updateWorkflowAmountRule(
    id: string,
    updates: UpdateWorkflowAmountRuleRequest
  ): Promise<WorkflowAmountRuleDTO> {
    try {
      const payload = {
        id: updates.id,
        currency: updates.currency,
        minAmount:
          typeof updates.minAmount === 'string'
            ? parseFloat(updates.minAmount)
            : updates.minAmount,
        maxAmount:
          typeof updates.maxAmount === 'string'
            ? parseFloat(updates.maxAmount)
            : updates.maxAmount,
        priority:
          typeof updates.priority === 'string'
            ? parseInt(updates.priority)
            : updates.priority,
        requiredMakers:
          typeof updates.requiredMakers === 'string'
            ? parseInt(updates.requiredMakers)
            : updates.requiredMakers,
        requiredCheckers:
          typeof updates.requiredCheckers === 'string'
            ? parseInt(updates.requiredCheckers)
            : updates.requiredCheckers,
        workflowDefinitionDTO: {
          id: updates.workflowDefinitionId,
        },
        workflowId: updates.workflowDefinitionId,
        enabled: updates.enabled,
      }
      const result = await apiClient.put<WorkflowAmountRuleDTO>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_AMOUNT_RULE.UPDATE(id)),
        payload
      )
      return result
    } catch (error) {
      toast.error(`${error}`)
      throw error
    }
  }

  async deleteWorkflowAmountRule(id: string): Promise<void> {
    try {
      await apiClient.delete(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_AMOUNT_RULE.DELETE(id))
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

  async getWorkflowAmountRuleLabels(): Promise<WorkflowAmountRuleLabel[]> {
    return apiClient.get<WorkflowAmountRuleLabel[]>(
      buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.WORKFLOW_AMOUNT_RULE)
    )
  }

  async getWorkflowAmountRulesUIData(
    page = 0,
    size = 20,
    filters?: WorkflowAmountRuleFilters
  ): Promise<PaginatedResponse<WorkflowAmountRuleUIData>> {
    const apiResponse = await this.getWorkflowAmountRules(page, size, filters)
    return {
      ...apiResponse,
      content: apiResponse.content.map(mapWorkflowAmountRuleToUI),
    }
  }

  transformToUIData(
    apiResponse: PaginatedResponse<WorkflowAmountRuleDTO>
  ): PaginatedResponse<WorkflowAmountRuleUIData> {
    return {
      ...apiResponse,
      content: apiResponse.content.map(mapWorkflowAmountRuleToUI),
    }
  }
}

export const workflowAmountRuleService = new WorkflowAmountRuleService()
