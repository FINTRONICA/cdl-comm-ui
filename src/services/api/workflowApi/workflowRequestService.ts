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
export interface WorkflowAwaitingAction {
  requestId: number
  stageId: number
  referenceId: string
  referenceType: string
  moduleName: string
  actionKey: string
  amount: number | null
  currency: string | null
  payloadJson: Record<string, unknown>
  stageOrder: number
  stageKey: string
  requiredApprovals: number
  approvalsObtained: number
  startedAt: string
  createdAt: string
  createdBy: string
  pendingApprovals: number
}

export interface AwaitingActionsUIData {
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
  stageKey: string
  requiredApprovals: number
  approvalsObtained: number
  pendingApprovals: number
  payloadJson?: Record<string, unknown>
  [key: string]: unknown
}

export interface WorkflowMyEngagement {
  requestId: number
  stageId: number
  referenceId: string
  referenceType: string
  moduleName: string
  actionKey: string
  amount: number | null
  currency: string | null
  payloadJson: Record<string, unknown>
  stageOrder: number
  stageKey: string
  stageName: string
  stageStatus: string
  myDecision: string
  myRemarks: string
  myActionDate: string
  requestStatus: string
  currentStageOrder: number
  createdBy: string
  createdAt: string
}

export interface EngagementsActionsUIData {
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
  stageKey: string
  stageName: string
  stageStatus: string
  myDecision: string
  myRemarks: string
  myActionDate: string
  requestStatus: string
  payloadJson?: Record<string, unknown>
  [key: string]: unknown
}

// New interfaces for workflow queue API responses
export interface WorkflowQueueRequestLogContent {
  id: number
  eventType: string
  eventByUser: string | null
  eventByGroup: string | null
  eventAt: string
  detailsJson: Record<string, unknown>
}

export interface WorkflowQueueRequestStage {
  id: number
  stageOrder: number
  stageKey: string
  stageName: string
  keycloakGroup: string
  requiredApprovals: number
  approvalsObtained: number
  status: string
  startedAt: string
  completedAt: string | null
  approvals: WorkflowQueueRequestApproval[]
  canUserApprove: boolean
}

export interface WorkflowQueueRequestApproval {
  id: number
  approverUserId: string
  approverUsername: string | null
  approverGroup: string | null
  decision: string
  remarks: string
  decidedAt: string
}

export interface WorkflowQueueRequestDetail {
  id: number
  referenceId: string
  referenceType: string
  moduleName: string
  actionKey: string
  amount: number
  currency: string
  payloadJson: Record<string, unknown>
  status: string
  currentStageOrder: number
  createdBy: string
  createdAt: string
  lastUpdatedAt: string
  stages: WorkflowQueueRequestStage[]
  logs: WorkflowQueueRequestLogContent[]
}

export interface WorkflowQueueRequestStatus {
  requestId: number
  status: string
  currentStage: string
  totalStages: number
  completedStages: number
  stageHistory: WorkflowQueueRequestStage[]
}

export interface WorkflowBulkDecisionRequest {
  requestId: number
  stageId: number
  decision: string
  remarks?: string
}

export interface WorkflowBulkDecisionResponse {
  requestId: number
  stageId: number
  message: string
  workflowStatus: string
  currentStageOrder: number
  nextStage: string
}

export interface WorkflowSummary {
  totalAwaitingActions: number
  totalEngagements: number
  awaitingActionsByModule: Record<string, number>
  engagementsByModule: Record<string, number>
  awaitingActionsByStage: Record<string, number>
}

export interface WorkflowDefinitionDTO {
  id: number
  name: string
  version: number
  moduleCode: string
  actionCode: string
  moduleDescription: string
  actionDescription: string
  amountBased: boolean
  active: boolean
  createdBy: string
  createdAt: string
  applicationModuleDTO: ApplicationModuleDTO
  workflowActionDTO: WorkflowActionDTO
  stageTemplates: WorkflowStageTemplate[]
  amountRules: WorkflowAmountRule[]
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

export const mapToAwaitingActionsUIData = (
  apiData: WorkflowAwaitingAction
): AwaitingActionsUIData => {
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
    id: apiData.requestId,
    referenceId: formatValue(apiData.referenceId),
    referenceType: formatValue(apiData.referenceType),
    moduleName: formatValue(apiData.moduleName),
    actionKey: formatValue(apiData.actionKey),
    amount: apiData.amount,
    currency: apiData.currency,
    currentStageOrder: apiData.stageOrder,
    createdBy: formatValue(apiData.createdBy),
    createdAt: apiData.createdAt,
    lastUpdatedAt: apiData.startedAt,
    workflowDefinitionName: `${apiData.moduleName} - ${apiData.actionKey}`,
    taskStatus: 'PENDING',
    stageKey: formatValue(apiData.stageKey),
    requiredApprovals: apiData.requiredApprovals,
    approvalsObtained: apiData.approvalsObtained,
    pendingApprovals: apiData.pendingApprovals,
    payloadJson: apiData.payloadJson,
  }
}

export const mapToEngagementsActionsUIData = (
  apiData: WorkflowMyEngagement
): EngagementsActionsUIData => {
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
    id: apiData.requestId,
    referenceId: formatValue(apiData.referenceId),
    referenceType: formatValue(apiData.referenceType),
    moduleName: formatValue(apiData.moduleName),
    actionKey: formatValue(apiData.actionKey),
    amount: apiData.amount,
    currency: apiData.currency,
    currentStageOrder: apiData.currentStageOrder,
    createdBy: formatValue(apiData.createdBy),
    createdAt: apiData.createdAt,
    lastUpdatedAt: apiData.myActionDate,
    workflowDefinitionName: `${apiData.moduleName} - ${apiData.actionKey}`,
    taskStatus: apiData.requestStatus,
    stageKey: formatValue(apiData.stageKey),
    stageName: formatValue(apiData.stageName),
    stageStatus: formatValue(apiData.stageStatus),
    myDecision: formatValue(apiData.myDecision),
    myRemarks: formatValue(apiData.myRemarks),
    myActionDate: apiData.myActionDate,
    requestStatus: formatValue(apiData.requestStatus),
    payloadJson: apiData.payloadJson,
  }
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
    workflowDefinitionName: `${apiData.moduleName} - ${apiData.actionKey}`,
    taskStatus: apiData.taskStatusDTO?.name || null,
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

  async getAwaitingActions(
    page = 0,
    size = 20,
    filters?: WorkflowRequestFilters
  ): Promise<PaginatedResponse<WorkflowAwaitingAction>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.moduleName) apiFilters['moduleName'] = filters.moduleName
      if (filters.referenceType)
        apiFilters['referenceType'] = filters.referenceType
      if (filters.actionKey) apiFilters['actionKey'] = filters.actionKey
      if (filters.referenceId) apiFilters['referenceId'] = filters.referenceId
      if (filters.createdBy) apiFilters['createdBy'] = filters.createdBy
      if (filters.currency) apiFilters['currency'] = filters.currency
    }

    const params = { ...buildPaginationParams(page, size), ...apiFilters }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.WORKFLOW_QUEUE.GET_ALL_AWAITING_ACTIONS)}?${queryString}`

    try {
      const response = await apiClient.get<{
        success: boolean
        message: string
        data: WorkflowAwaitingAction[]
        timestamp: string
      }>(url)

      // Transform the response to match PaginatedResponse structure
      const result: PaginatedResponse<WorkflowAwaitingAction> = {
        content: response.data || [],
        page: {
          size: size,
          number: page,
          totalElements: response.data?.length || 0,
          totalPages: Math.ceil((response.data?.length || 0) / size),
        },
      }

      return result
    } catch (error) {
      throw error
    }
  }

  async getEngagementsActions(
    page = 0,
    size = 20,
    filters?: WorkflowRequestFilters
  ): Promise<PaginatedResponse<WorkflowMyEngagement>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.moduleName) apiFilters['moduleName'] = filters.moduleName
      if (filters.referenceType)
        apiFilters['referenceType'] = filters.referenceType
      if (filters.actionKey) apiFilters['actionKey'] = filters.actionKey
      if (filters.referenceId) apiFilters['referenceId'] = filters.referenceId
      if (filters.createdBy) apiFilters['createdBy'] = filters.createdBy
      if (filters.currency) apiFilters['currency'] = filters.currency
    }

    const params = { ...buildPaginationParams(page, size), ...apiFilters }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.WORKFLOW_QUEUE.GET_ALL_MY_ENGAGEMENTS)}?${queryString}`

    try {
      const response = await apiClient.get<{
        success: boolean
        message: string
        data: WorkflowMyEngagement[]
        timestamp: string
      }>(url)

      // Transform the response to match PaginatedResponse structure
      const result: PaginatedResponse<WorkflowMyEngagement> = {
        content: response.data || [],
        page: {
          size: size,
          number: page,
          totalElements: response.data?.length || 0,
          totalPages: Math.ceil((response.data?.length || 0) / size),
        },
      }

      return result
    } catch (error) {
      throw error
    }
  }

  async getWorkflowQueueRequestById(id: string): Promise<WorkflowRequest> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_QUEUE.GET_BY_ID(id))
      const result = await apiClient.get<WorkflowRequest>(url)

      return result
    } catch (error) {
      throw error
    }
  }

  async getQueueRequestLogsByWorkflowId(
    workflowRequestId: string
  ): Promise<PaginatedResponse<WorkflowQueueRequestLogContent>> {
    const url = `${buildApiUrl(API_ENDPOINTS.WORKFLOW_QUEUE.GET_BY_LOGS_ID(workflowRequestId))}/logs`

    try {
      const response = await apiClient.get<{
        success: boolean
        message: string
        data: WorkflowQueueRequestLogContent[]
        timestamp: string
      }>(url)

      // Transform the response to match PaginatedResponse structure
      const result: PaginatedResponse<WorkflowQueueRequestLogContent> = {
        content: response.data || [],
        page: {
          size: 20,
          number: 0,
          totalElements: response.data?.length || 0,
          totalPages: Math.ceil((response.data?.length || 0) / 20),
        },
      }

      return result
    } catch (error) {
      throw error
    }
  }

  async getQueueRequestDetailById(
    id: string
  ): Promise<WorkflowQueueRequestDetail> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_QUEUE.GET_BY_ID(id))
      const response = await apiClient.get<{
        success: boolean
        message: string
        data: WorkflowQueueRequestDetail
        timestamp: string
      }>(url)

      return response.data
    } catch (error) {
      throw error
    }
  }

  async getQueueRequestStatusById(
    id: string
  ): Promise<WorkflowQueueRequestStatus> {
    try {
      const url = `${buildApiUrl(API_ENDPOINTS.WORKFLOW_QUEUE.GET_STATUS_BY_ID(id))}/status`
      const response = await apiClient.get<{
        success: boolean
        message: string
        data: WorkflowQueueRequestStatus
        timestamp: string
      }>(url)

      return response.data
    } catch (error) {
      throw error
    }
  }

  async submitQueueBulkDecision(
    decisions: WorkflowBulkDecisionRequest[]
  ): Promise<WorkflowBulkDecisionResponse[]> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_QUEUE.SAVE)
      const response = await apiClient.post<{
        success: boolean
        message: string
        data: WorkflowBulkDecisionResponse[]
        timestamp: string
      }>(url, decisions)

      return response.data
    } catch (error) {
      throw error
    }
  }

  async getQueueSummary(): Promise<WorkflowSummary> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_QUEUE.GET_SUMMARY)
      const response = await apiClient.get<{
        success: boolean
        message: string
        data: WorkflowSummary
        timestamp: string
      }>(url)

      return response.data
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

  transformToAwaitingActionsUIData(
    apiResponse: PaginatedResponse<WorkflowAwaitingAction>
  ): PaginatedResponse<AwaitingActionsUIData> {
    const transformedContent = apiResponse.content.map(
      mapToAwaitingActionsUIData
    )

    return {
      content: transformedContent,
      page: apiResponse.page,
    }
  }

  transformToEngagementsActionsUIData(
    apiResponse: PaginatedResponse<WorkflowMyEngagement>
  ): PaginatedResponse<EngagementsActionsUIData> {
    return {
      content: apiResponse.content.map(mapToEngagementsActionsUIData),
      page: apiResponse.page,
    }
  }

  async getAwaitingActionsUIData(
    page = 0,
    size = 20,
    filters?: WorkflowRequestFilters
  ): Promise<PaginatedResponse<AwaitingActionsUIData>> {
    const apiResponse = await this.getAwaitingActions(page, size, filters)
    return this.transformToAwaitingActionsUIData(apiResponse)
  }

  async getEngagementsActionsUIData(
    page = 0,
    size = 20,
    filters?: WorkflowRequestFilters
  ): Promise<PaginatedResponse<EngagementsActionsUIData>> {
    const apiResponse = await this.getEngagementsActions(page, size, filters)
    return this.transformToEngagementsActionsUIData(apiResponse)
  }

  async getAllWorkflowRequestsUIData(
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<WorkflowRequestUIData>> {
    const apiResponse = await this.getAllWorkflowRequests(page, size)
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

  // Missing methods that are referenced in hooks
  async getWorkflowRequests(
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<WorkflowRequest>> {
    // This method should be implemented based on your API structure
    // For now, returning empty result
    return {
      content: [],
      page: {
        size,
        number: page,
        totalElements: 0,
        totalPages: 0,
      },
    }
  }

  async getAllWorkflowRequests(
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<WorkflowRequest>> {
    // This method should be implemented based on your API structure
    // For now, returning empty result
    return {
      content: [],
      page: {
        size,
        number: page,
        totalElements: 0,
        totalPages: 0,
      },
    }
  }

  async getWorkflowRequestById(id: string): Promise<WorkflowRequest> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_QUEUE.GET_BY_ID(id))
      const response = await apiClient.get<{
        success: boolean
        message: string
        data: WorkflowRequest
        timestamp: string
      }>(url)

      return response.data
    } catch (error) {
      throw error
    }
  }

  async getWorkflowRequestsUIData(
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<WorkflowRequestUIData>> {
    const apiResponse = await this.getWorkflowRequests(page, size)
    return this.transformToUIData(apiResponse)
  }
}

export const workflowRequestService = new WorkflowRequestService()
