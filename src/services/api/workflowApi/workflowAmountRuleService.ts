import { apiClient } from '@/lib/apiClient'
import {
  buildApiUrl,
  buildPaginationParams,
  API_ENDPOINTS,
} from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'

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
  workflowDefinitionDTO:
  | string
  | number
  | {
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
    workflowId?: number | string | null
    amountRuleName?: string
    workflowAmountStageOverrideDTOS?: WorkflowAmountStageOverride[] | null
  }
  workflowId?: number | string
  amountRuleName?: string
  workflowAmountStageOverrideDTOS?: WorkflowAmountStageOverride[]
  enabled?: boolean
  active?: boolean
  deleted?: boolean
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
  minAmount: number | null
  maxAmount: number | null
  priority: number | null
  requiredMakers: number | null
  requiredCheckers: number | null
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


  // Safely extract workflowDefinitionDTO - handle various response structures
  const workflowDefDTO = apiData.workflowDefinitionDTO
  let workflowDefName = ''
  let workflowDefId: number | string = 0

  if (workflowDefDTO) {
    if (typeof workflowDefDTO === 'object' && workflowDefDTO !== null) {
      // Try to extract name from various possible locations
      workflowDefName =
        (workflowDefDTO as any).name ||
        (workflowDefDTO as any).workflowDefinitionName ||
        (workflowDefDTO as any).workflowName || ''
      const extractedId =
        (workflowDefDTO as any).id ||
        (workflowDefDTO as any).workflowId ||
        (workflowDefDTO as any).workflowDefinitionId

      if (extractedId !== undefined && extractedId !== null) {
        workflowDefId = extractedId
      }
    } else if (typeof workflowDefDTO === 'string') {

      const parsedId = parseInt(workflowDefDTO, 10)
      workflowDefId = isNaN(parsedId) ? workflowDefDTO : parsedId

    } else if (typeof workflowDefDTO === 'number') {
      workflowDefId = workflowDefDTO
    }
  }

  // Fallback: use workflowId if workflowDefinitionDTO didn't provide an ID
  if (workflowDefId === 0 && (apiData as { workflowId?: number | string })?.workflowId) {
    const fallbackId = (apiData as { workflowId?: number | string }).workflowId
    if (fallbackId !== undefined && fallbackId !== null) {
      workflowDefId = fallbackId
    }
  }

  // Extract enabled status - check both enabled and active fields
  const enabled = (apiData as any).enabled ?? (apiData as any).active ?? false

  // Handle currency - filter out placeholder "string" values
  let currency = apiData.currency
  if (currency && typeof currency === 'string') {
    currency = currency.trim()
    // If currency is a placeholder like "string", treat as empty
    if (currency.toLowerCase() === 'string' || currency === '') {
      currency = ''
    }
  }

  return {
    id: apiData.id ?? 0,
    currency: currency || '',
    minAmount: apiData.minAmount != null ? apiData.minAmount : null,
    maxAmount: apiData.maxAmount != null ? apiData.maxAmount : null,
    priority: apiData.priority != null ? apiData.priority : null,
    requiredMakers: apiData.requiredMakers != null ? apiData.requiredMakers : null,
    requiredCheckers: apiData.requiredCheckers != null ? apiData.requiredCheckers : null,
    workflowDefinitionDTO: {
      id: workflowDefId,
      name: workflowDefName,
    },
    workflowId: (apiData as { workflowId?: number | string })?.workflowId ?? workflowDefId ?? 0,
    amountRuleName:
      (apiData as { amountRuleName?: string })?.amountRuleName ?? '',
    workflowAmountStageOverrideDTOS:
      (
        apiData as {
          workflowAmountStageOverrideDTOS?: WorkflowAmountStageOverride[]
        }
      )?.workflowAmountStageOverrideDTOS || [],
    enabled: enabled,
    status: enabled ? 'Active' : 'Inactive',
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
      throw error
    }
  }

  async deleteWorkflowAmountRule(id: string): Promise<void> {
    try {
      await apiClient.delete(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_AMOUNT_RULE.DELETE(id))
      )
    } catch (error) {
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
