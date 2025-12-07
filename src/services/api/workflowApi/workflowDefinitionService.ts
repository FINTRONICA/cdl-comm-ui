import { apiClient } from '@/lib/apiClient'
import {
  buildApiUrl,
  buildPaginationParams,
  API_ENDPOINTS,
} from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'
import { getCurrentUserFromJWT } from '@/utils'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'react-hot-toast'

export interface ApplicationModuleDTO {
  id: number
  moduleName: string
  moduleCode: string
  moduleDescription?: string
  deleted?: boolean
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

export interface StageTemplateDTO {
  id: number
  name: string
  stageKey: string
  [key: string]: unknown
}

export interface AmountRuleDTO {
  id: number
  ruleName: string
  [key: string]: unknown
}

export interface WorkflowDefinition {
  id: number
  name: string
  version: number
  createdBy: string
  createdAt: string
  updatedBy?: string
  updatedAt?: string
  amountBased: boolean
  moduleCode: string
  actionCode: string
  applicationModuleDTO: string
  workflowActionDTO: string
  applicationModuleName?: string
  workflowActionName?: string
  enabled: boolean
  status?: string
}

export interface CreateWorkflowDefinitionRequest {
  name: string
  version?: number
  amountBased?: boolean
  moduleCode?: string | null
  actionCode?: string | null
  applicationModuleId?: number | string | null
  workflowActionId?: number | string | null
  stageTemplateIds?: (number | string)[] | null
  amountRuleIds?: (number | string)[] | null
  enabled?: boolean
}

export interface UpdateWorkflowDefinitionRequest {
  id?: string | number
  name?: string
  version?: number
  amountBased?: boolean
  moduleCode?: string | null
  actionCode?: string | null
  applicationModuleId?: number | string | null
  workflowActionId?: number | string | null
  stageTemplateIds?: (number | string)[] | null
  amountRuleIds?: (number | string)[] | null
  enabled?: boolean
}

export interface WorkflowDefinitionFilters {
  name?: string
  moduleCode?: string
  actionCode?: string
  createdBy?: string
  enabled?: boolean
}

export interface WorkflowDefinitionUIData {
  id: string
  name: string
  version: number
  createdBy?: string
  createdAt?: string
  amountBased: boolean
  moduleCode: string
  actionCode: string
  applicationModuleId?: string
  applicationModuleName?: string
  applicationModuleDescription?: string
  workflowActionId?: string
  workflowActionName?: string
  workflowActionDescription?: string
  stageTemplateIds?: string[]
  stageTemplateNames?: string[]
  amountRuleIds?: string[]
  enabled: boolean
  updatedBy?: string
  updatedAt?: string
  status?: string
}

export interface WorkflowDefinitionResponse {
  id: number
  name: string
  version: number
  createdBy: string
  createdAt: string
  updatedBy?: string
  updatedAt?: string
  amountBased: boolean
  moduleCode: string
  actionCode: string
  applicationModuleDTO: string | ApplicationModuleDTO
  workflowActionDTO: string | WorkflowActionDTO
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
  enabled: boolean
  [key: string]: unknown
}

export const mapWorkflowDefinitionData = (
  apiData: WorkflowDefinitionResponse
): WorkflowDefinition => {
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

  const getApplicationModuleDTO = (
    applicationModuleDTO: string | ApplicationModuleDTO
  ): string => {
    if (typeof applicationModuleDTO === 'string') {
      return formatValue(applicationModuleDTO) as string
    } else if (
      applicationModuleDTO &&
      typeof applicationModuleDTO === 'object' &&
      applicationModuleDTO.id
    ) {
      return applicationModuleDTO.id.toString()
    }
    return '-'
  }

  const getWorkflowActionDTO = (
    workflowActionDTO: string | WorkflowActionDTO
  ): string => {
    if (typeof workflowActionDTO === 'string') {
      return formatValue(workflowActionDTO) as string
    } else if (
      workflowActionDTO &&
      typeof workflowActionDTO === 'object' &&
      workflowActionDTO.id
    ) {
      return workflowActionDTO.id.toString()
    }
    return '-'
  }

  const getApplicationModuleName = (
    applicationModuleDTO: string | ApplicationModuleDTO
  ): string => {
    if (
      applicationModuleDTO &&
      typeof applicationModuleDTO === 'object' &&
      applicationModuleDTO.moduleName
    ) {
      return applicationModuleDTO.moduleName
    }
    return '-'
  }

  const getWorkflowActionName = (
    workflowActionDTO: string | WorkflowActionDTO
  ): string => {
    if (
      workflowActionDTO &&
      typeof workflowActionDTO === 'object' &&
      workflowActionDTO.name
    ) {
      return workflowActionDTO.name
    }
    return '-'
  }

  return {
    id: apiData.id,
    name: formatValue(apiData.name) as string,
    version: apiData.version,
    createdBy: formatValue(apiData.createdBy) as string,
    createdAt: formatValue(apiData.createdAt) as string,
    updatedBy: formatValue(apiData.updatedBy) as string,
    updatedAt: formatValue(apiData.updatedAt) as string,
    amountBased: apiData.amountBased,
    moduleCode: formatValue(apiData.moduleCode) as string,
    actionCode: formatValue(apiData.actionCode) as string,
    enabled: apiData.enabled,
    applicationModuleDTO: getApplicationModuleDTO(apiData.applicationModuleDTO),
    workflowActionDTO: getWorkflowActionDTO(apiData.workflowActionDTO),
    applicationModuleName: getApplicationModuleName(
      apiData.applicationModuleDTO
    ),
    workflowActionName: getWorkflowActionName(apiData.workflowActionDTO),
  }
}

export const mapWorkflowDefinitionToUIData = (
  apiData: WorkflowDefinitionResponse
): WorkflowDefinitionUIData => {
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

  const getApplicationModuleDTO = (
    applicationModuleDTO: string | ApplicationModuleDTO
  ): string => {
    if (typeof applicationModuleDTO === 'string') {
      return formatValue(applicationModuleDTO) as string
    } else if (
      applicationModuleDTO &&
      typeof applicationModuleDTO === 'object' &&
      applicationModuleDTO.id
    ) {
      return applicationModuleDTO.id.toString()
    }
    return '-'
  }

  const getWorkflowActionDTO = (
    workflowActionDTO: string | WorkflowActionDTO
  ): string => {
    if (typeof workflowActionDTO === 'string') {
      return formatValue(workflowActionDTO) as string
    } else if (
      workflowActionDTO &&
      typeof workflowActionDTO === 'object' &&
      workflowActionDTO.id
    ) {
      return workflowActionDTO.id.toString()
    }
    return '-'
  }

  const getApplicationModuleName = (
    applicationModuleDTO: string | ApplicationModuleDTO
  ): string => {
    if (
      applicationModuleDTO &&
      typeof applicationModuleDTO === 'object' &&
      applicationModuleDTO.moduleName
    ) {
      return applicationModuleDTO.moduleName
    }
    return '-'
  }

  const getWorkflowActionName = (
    workflowActionDTO: string | WorkflowActionDTO
  ): string => {
    if (
      workflowActionDTO &&
      typeof workflowActionDTO === 'object' &&
      workflowActionDTO.name
    ) {
      return workflowActionDTO.name
    }
    return '-'
  }

  const getApplicationModuleDescription = (
    applicationModuleDTO: string | ApplicationModuleDTO
  ): string => {
    if (
      applicationModuleDTO &&
      typeof applicationModuleDTO === 'object' &&
      applicationModuleDTO.moduleDescription
    ) {
      return applicationModuleDTO.moduleDescription
    }
    return '-'
  }

  const getWorkflowActionDescription = (
    workflowActionDTO: string | WorkflowActionDTO
  ): string => {
    if (
      workflowActionDTO &&
      typeof workflowActionDTO === 'object' &&
      workflowActionDTO.description
    ) {
      return workflowActionDTO.description
    }
    return '-'
  }

  return {
    id: apiData.id.toString(),
    name: formatValue(apiData.name) as string,
    version: apiData.version,
    createdBy: formatValue(apiData.createdBy) as string,
    createdAt: formatValue(apiData.createdAt) as string,
    updatedBy: formatValue(apiData.updatedBy) as string,
    updatedAt: formatValue(apiData.updatedAt) as string,
    amountBased: apiData.amountBased,
    moduleCode: formatValue(apiData.moduleCode) as string,
    actionCode: formatValue(apiData.actionCode) as string,
    enabled: apiData.enabled,
    applicationModuleId: getApplicationModuleDTO(apiData.applicationModuleDTO),
    applicationModuleName: getApplicationModuleName(
      apiData.applicationModuleDTO
    ),
    applicationModuleDescription: getApplicationModuleDescription(
      apiData.applicationModuleDTO
    ),
    workflowActionId: getWorkflowActionDTO(apiData.workflowActionDTO),
    workflowActionName: getWorkflowActionName(apiData.workflowActionDTO),
    workflowActionDescription: getWorkflowActionDescription(
      apiData.workflowActionDTO
    ),
    status: apiData.enabled ? 'Active' : 'Inactive',
    stageTemplateIds:
      apiData.stageTemplates?.map((st) => st.id.toString()) || [],
    stageTemplateNames: apiData.stageTemplates?.map((st) => st.name) || [],
    amountRuleIds: apiData.amountRules?.map((ar) => ar.id.toString()) || [],
  }
}

export class WorkflowDefinitionService {
  async getWorkflowDefinitions(
    page = 0,
    size = 20,
    filters?: WorkflowDefinitionFilters
  ): Promise<PaginatedResponse<WorkflowDefinitionResponse>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.name) apiFilters.name = filters.name
      if (filters.moduleCode) apiFilters.moduleCode = filters.moduleCode
      if (filters.actionCode) apiFilters.actionCode = filters.actionCode
      if (filters.createdBy) apiFilters.createdBy = filters.createdBy
      if (typeof filters.enabled !== 'undefined')
        apiFilters.enabled = String(filters.enabled)
    }
    const params = { ...buildPaginationParams(page, size), ...apiFilters }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.WORKFLOW_DEFINITION.FIND_ALL)}?${queryString}`
    try {
      const result =
        await apiClient.get<PaginatedResponse<WorkflowDefinitionResponse>>(url)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      throw new Error(`Failed to fetch workflow definitions: ${errorMessage}`)
    }
  }

  async getWorkflowDefinition(id: string): Promise<WorkflowDefinitionResponse> {
    try {
      const result = await apiClient.get<WorkflowDefinitionResponse>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_DEFINITION.GET_BY_ID(id))
      )
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      throw new Error(`Failed to fetch workflow definition: ${errorMessage}`)
    }
  }

  async getWorkflowDefinitionLabels(): Promise<Record<string, unknown>[]> {
    try {
      const result = await apiClient.get<Record<string, unknown>[]>(
        buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.WORKFLOW_DEFINITION)
      )
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      throw new Error(`Failed to fetch workflow definition labels: ${errorMessage}`)
    }
  }

  async createWorkflowDefinition(
    data: CreateWorkflowDefinitionRequest
  ): Promise<WorkflowDefinitionResponse> {
    try {
      const applicationModuleId =
        'applicationModuleId' in data && data.applicationModuleId
          ? data.applicationModuleId
          : undefined

      const workflowActionId =
        'workflowActionId' in data && data.workflowActionId
          ? data.workflowActionId
          : undefined

      const createTimestamp = new Date().toISOString()

      const authState = useAuthStore.getState()
      const jwtUser = getCurrentUserFromJWT()
      const userName = authState.user?.name || jwtUser?.name || 'System'



      const payload = {
        name: data.name,
        version: data.version,
        amountBased: Boolean(data.amountBased),
        moduleCode: data.moduleCode,
        actionCode: data.actionCode,
        enabled: Boolean(data.enabled),
        createdAt: createTimestamp,
        updatedAt: createTimestamp,
        createdBy: userName,
        updatedBy: userName,
        ...(applicationModuleId
          ? { applicationModuleDTO: { id: applicationModuleId } }
          : {}),
        ...(workflowActionId
          ? { workflowActionDTO: { id: workflowActionId } }
          : {}),
      }

      const result = await apiClient.post<WorkflowDefinitionResponse>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_DEFINITION.SAVE),
        payload
      )

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to create workflow definition: ${errorMessage}`)
      throw new Error(`Failed to create workflow definition: ${errorMessage}`)
    }
  }

  async updateWorkflowDefinition(
    id: string,
    updates: UpdateWorkflowDefinitionRequest
  ): Promise<WorkflowDefinitionResponse> {
    try {
      const applicationModuleId =
        typeof updates === 'object' &&
          'applicationModuleId' in updates &&
          updates.applicationModuleId
          ? updates.applicationModuleId
          : undefined

      const workflowActionId =
        typeof updates === 'object' &&
          'workflowActionId' in updates &&
          updates.workflowActionId
          ? updates.workflowActionId
          : undefined

      const currentTimestamp = new Date().toISOString()

      const authState = useAuthStore.getState()
      const jwtUser = getCurrentUserFromJWT()
      const userName = authState.user?.name || jwtUser?.name || 'System'



      const payload = {
        id: parseInt(id),
        name: updates.name || '',
        version: updates.version || 1,
        amountBased: Boolean(updates.amountBased),
        moduleCode: updates.moduleCode || '',
        actionCode: updates.actionCode || '',
        enabled: Boolean(updates.enabled),
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
        createdBy: userName,
        updatedBy: userName,
        applicationModuleDTO: applicationModuleId
          ? { id: parseInt(applicationModuleId.toString()) }
          : null,
        workflowActionDTO: workflowActionId
          ? { id: parseInt(workflowActionId.toString()) }
          : null,
      }

      const result = await apiClient.put<WorkflowDefinitionResponse>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_DEFINITION.UPDATE(id)),
        payload
      )

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to update workflow definition: ${errorMessage}`)
      throw new Error(`Failed to update workflow definition: ${errorMessage}`)
    }
  }

  async deleteWorkflowDefinition(id: string): Promise<void> {
    try {
      await apiClient.delete(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_DEFINITION.DELETE(id))
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to delete workflow definition: ${errorMessage}`)
      throw new Error(`Failed to delete workflow definition: ${errorMessage}`)
    }
  }

  async getWorkflowDefinitionApplicationModules(): Promise<
    ApplicationModuleDTO[]
  > {
    try {
      const result = await apiClient.get<
        PaginatedResponse<ApplicationModuleDTO>
      >(buildApiUrl(API_ENDPOINTS.APPLICATION_MODULE.FIND_ALL))
      return result.content || []
    } catch (error) {
      toast.error(`${error}`)
      return []
    }
  }

  async getWorkflowDefinitionActions(): Promise<WorkflowActionDTO[]> {
    try {
      const result = await apiClient.get<PaginatedResponse<WorkflowActionDTO>>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_ACTION.FIND_ALL)
      )
      return result.content || []
    } catch (error) {
      toast.error(`${error}`)

      return []
    }
  }

  async getWorkflowDefinitionStageTemplates(): Promise<StageTemplateDTO[]> {
    try {
      const result = await apiClient.get<PaginatedResponse<StageTemplateDTO>>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_STAGE_TEMPLATE.FIND_ALL)
      )
      return result.content || []
    } catch (error) {
      toast.error(`${error}`)
      return []
    }
  }

  async getWorkflowDefinitionAmountRules(): Promise<AmountRuleDTO[]> {
    try {
      const result = await apiClient.get<PaginatedResponse<AmountRuleDTO>>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_AMOUNT_RULE.FIND_ALL)
      )
      return result.content || []
    } catch (error) {
      toast.error(`${error}`)
      return []
    }
  }

  transformToUIData(
    apiResponse: PaginatedResponse<WorkflowDefinitionResponse>
  ): PaginatedResponse<WorkflowDefinition> {
    return {
      content: apiResponse.content.map((item) =>
        mapWorkflowDefinitionData(item)
      ),
      page: apiResponse.page,
    }
  }

  async getWorkflowDefinitionData(
    page = 0,
    size = 20,
    filters?: WorkflowDefinitionFilters
  ): Promise<PaginatedResponse<WorkflowDefinition>> {
    const apiResponse = await this.getWorkflowDefinitions(page, size, filters)
    return this.transformToUIData(apiResponse)
  }
}

export const workflowDefinitionService = new WorkflowDefinitionService()
