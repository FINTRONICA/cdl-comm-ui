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
}

export interface ApplicationModuleDTO {
  id: number
  moduleName: string
  moduleCode: string
  moduleDescription: string
  deleted: boolean
  active: boolean
}

export interface WorkflowActionDTO {
  id: number
  actionKey: string
  actionName: string
  moduleCode: string
  description: string
  name: string
}

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
}

export interface WorkflowAmountRule {
  id: number
  currency: string
  minAmount: number
  maxAmount: number
  priority: number
  requiredMakers: number
  requiredCheckers: number
  workflowDefinitionDTO: string
  workflowId: number
  amountRuleName: string
  active: boolean
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
  stageTemplates: WorkflowStageTemplate[]
  amountRules: WorkflowAmountRule[]
  active: boolean
}

export interface WorkflowRequestStageApprovalDTO {
  id: number
  approverUserId: string
  approverUsername: string
  approverGroup: string
  remarks: string
  decidedAt: string
  workflowRequestStageDTO: string
  taskStatusDTO: TaskStatusDTO
}

export interface WorkflowRequestStageDTO {
  id: number
  stageOrder: number
  stageKey: string
  keycloakGroup: string
  requiredApprovals: number
  approvalsObtained: number
  startedAt: string
  completedAt: string
  version: number
  workflowRequestDTO: string
  workflowRequestStageApprovalDTOS: WorkflowRequestStageApprovalDTO[]
  taskStatusDTO: TaskStatusDTO
}

export interface WorkflowRequest {
  id: number
  referenceId: string
  referenceType: string
  moduleName: string
  actionKey: string
  amount: number
  currency: string
  payloadJson: Record<string, unknown>
  currentStageOrder: number
  createdBy: string
  createdAt: string
  lastUpdatedAt: string
  version: number
  workflowDefinitionDTO: WorkflowDefinitionDTO
  workflowRequestStageDTOS: WorkflowRequestStageDTO[]
  taskStatusDTO: TaskStatusDTO
}

export interface CreateWorkflowRequest {
  referenceId: string
  referenceType: string
  moduleName: string
  actionKey: string
  amount: number
  currency: string
  payloadJson: Record<string, unknown>
}

export interface Step1Data {
  id?: number
  bpDeveloperId?: string
  bpCifrera?: string
  bpDeveloperRegNo?: string
  bpName?: string
  bpMasterName?: string
  bpNameLocal?: string
  bpOnboardingDate?: string
  bpContactAddress?: string
  bpContactTel?: string
  bpPoBox?: string
  bpMobile?: string
  bpFax?: string
  bpEmail?: string
  bpLicenseNo?: string
  bpLicenseExpDate?: string
  bpWorldCheckFlag?: string | boolean
  bpWorldCheckRemarks?: string
  bpMigratedData?: boolean
  bpremark?: string
  bpRegulatorDTO?: {
    id?: number
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface CreateDeveloperWorkflowRequest {
  referenceId: string
  referenceType: string
  moduleName: string
  actionKey: string
  payloadJson: Step1Data
}

export interface UpdateWorkflowRequestRequest {
  id: number
  referenceId?: string
  referenceType?: string
  moduleName?: string
  actionKey?: string
  amount?: number
  currency?: string
  payloadJson?: Record<string, unknown>
}

export interface WorkflowRequestFilters {
  referenceId?: string
  referenceType?: string
  moduleName?: string
  actionKey?: string
  createdBy?: string
  currency?: string
}

export interface WorkflowRequestUIData {
  id: number
  referenceId: string
  referenceType: string
  moduleName: string
  actionKey: string
  amount: number | null
  currency: string | null
  currentStageOrder: number
  createdBy: string
  createdAt: string
  lastUpdatedAt: string
  workflowDefinitionName: string
  taskStatus: string | null
  [key: string]: unknown
}

export const mapWorkflowRequestToUIData = (
  apiData: WorkflowRequest
): WorkflowRequestUIData => {
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
    referenceId: formatValue(apiData.referenceId),
    referenceType: formatValue(apiData.referenceType),
    moduleName: formatValue(apiData.moduleName),
    actionKey: formatValue(apiData.actionKey),
    amount: apiData.amount,
    currency: apiData.currency,
    currentStageOrder: apiData.currentStageOrder,
    createdBy: formatValue(apiData.createdBy),
    createdAt: apiData.createdAt,
    lastUpdatedAt: apiData.lastUpdatedAt,
    workflowDefinitionName: apiData.workflowDefinitionDTO?.name || '-',
    taskStatus: apiData.taskStatusDTO?.name || 'INITIATED',
  }
}

export class WorkflowRequestService {
  async createWorkflowRequest(
    data: CreateWorkflowRequest
  ): Promise<WorkflowRequest> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_REQUEST.CREATE_REQUEST)
      const result = await apiClient.post<WorkflowRequest>(url, data)

      return result
    } catch (error) {
     
      throw error
    }
  }

  async getWorkflowRequestById(id: string): Promise<WorkflowRequest> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_REQUEST.GET_BY_ID(id))
      const result = await apiClient.get<WorkflowRequest>(url)

      return result
    } catch (error) {
  
      throw error
    }
  }

  async getAllWorkflowRequests(
    page = 0,
    size = 20,
    filters?: WorkflowRequestFilters
  ): Promise<PaginatedResponse<WorkflowRequest>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.moduleName)
        apiFilters['moduleName.equals'] = filters.moduleName
      if (filters.referenceType)
        apiFilters['referenceType.equals'] = filters.referenceType
      if (filters.actionKey) apiFilters['actionKey.equals'] = filters.actionKey
      if (filters.referenceId)
        apiFilters['referenceId.equals'] = filters.referenceId
      if (filters.createdBy) apiFilters['createdBy.equals'] = filters.createdBy
      if (filters.currency) apiFilters['currency.equals'] = filters.currency
    }

    const params = { ...buildPaginationParams(page, size), ...apiFilters }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.WORKFLOW_REQUEST.GET_ALL)}?${queryString}`

    try {
      const result =
        await apiClient.get<PaginatedResponse<WorkflowRequest>>(url)

      return result
    } catch (error) {
    
      throw error
    }
  }

  async getWorkflowRequests(
    page = 0,
    size = 20,
    filters?: WorkflowRequestFilters
  ): Promise<PaginatedResponse<WorkflowRequest>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.referenceId) apiFilters.referenceId = filters.referenceId
      if (filters.referenceType)
        apiFilters.referenceType = filters.referenceType
      if (filters.moduleName) apiFilters.moduleName = filters.moduleName
      if (filters.actionKey) apiFilters.actionKey = filters.actionKey
      if (filters.createdBy) apiFilters.createdBy = filters.createdBy
      if (filters.currency) apiFilters.currency = filters.currency
    }

    const params = { ...buildPaginationParams(page, size), ...apiFilters }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.WORKFLOW_REQUEST.FIND_ALL)}?${queryString}`

    try {
      const result =
        await apiClient.get<PaginatedResponse<WorkflowRequest>>(url)

      return result
    } catch (error) {
  
      throw error
    }
  }

  async updateWorkflowRequest(
    id: string,
    updates: UpdateWorkflowRequestRequest
  ): Promise<WorkflowRequest> {
    const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_REQUEST.UPDATE(id))
    try {
      const result = await apiClient.put<WorkflowRequest>(url, updates)

      return result
    } catch (error) {
  
      throw error
    }
  }

  async deleteWorkflowRequest(id: string): Promise<void> {
    const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_REQUEST.DELETE(id))
    const deletePayload = { id: parseInt(id) }

    try {
      await apiClient.delete<void>(url, { data: deletePayload })
    } catch (error) {
     
      throw error
    }
  }

  transformToUIData(
    apiResponse: PaginatedResponse<WorkflowRequest>
  ): PaginatedResponse<WorkflowRequestUIData> {
    return {
      content: apiResponse.content.map(mapWorkflowRequestToUIData),
      page: apiResponse.page,
    }
  }

  async getWorkflowRequestsUIData(
    page = 0,
    size = 20,
    filters?: WorkflowRequestFilters
  ): Promise<PaginatedResponse<WorkflowRequestUIData>> {
    const apiResponse = await this.getWorkflowRequests(page, size, filters)
    return this.transformToUIData(apiResponse)
  }

  async getAllWorkflowRequestsUIData(
    page = 0,
    size = 20,
    filters?: WorkflowRequestFilters
  ): Promise<PaginatedResponse<WorkflowRequestUIData>> {
    const apiResponse = await this.getAllWorkflowRequests(page, size, filters)
    return this.transformToUIData(apiResponse)
  }

  async createDeveloperWorkflowRequest(
    referenceId: string,
    payloadData: Record<string, unknown>,
    referenceType: string = 'BUILD_PARTNER',
    moduleName: string = 'BUILD_PARTNER',
    actionKey: string = 'CREATE'
  ): Promise<WorkflowRequest> {
    // Dynamic values based on parameters
    const hardcodedData = {
      referenceId: referenceId,
      referenceType: referenceType,
      moduleName: moduleName,
      actionKey: actionKey,
      payloadJson: payloadData,
    }

    try {
      const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_REQUEST.CREATE_REQUEST)
      const result = await apiClient.post<WorkflowRequest>(url, hardcodedData)

      return result
    } catch (error) {
     
      throw error
    }
  }
}

export const workflowRequestService = new WorkflowRequestService()
