import { apiClient } from '@/lib/apiClient'
import {
  buildApiUrl,
  buildPaginationParams,
  API_ENDPOINTS,
} from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'
import { getCurrentUserFromJWT } from '@/utils'
import { useAuthStore } from '@/store/authStore'
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
  // Helper to parse string DTOs (may be JSON strings or plain ID strings)
  const parseStringDTO = (
    dtoString: string
  ): ApplicationModuleDTO | WorkflowActionDTO | null => {
    if (!dtoString || typeof dtoString !== 'string') return null

    const trimmed = dtoString.trim()
    if (
      !trimmed ||
      trimmed === '-' ||
      trimmed === 'null' ||
      trimmed === 'undefined'
    ) {
      return null
    }

    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed && typeof parsed === 'object') {
        return parsed as ApplicationModuleDTO | WorkflowActionDTO
      }
    } catch (error) {
      throw (error)
    }

    // If it's a numeric string, return null (we'll extract ID separately)
    const numericId = parseInt(trimmed, 10)
    if (!isNaN(numericId)) {
      return null // Will be handled by ID extraction
    }

    return null
  }

  const getApplicationModuleDTO = (
    applicationModuleDTO: string | ApplicationModuleDTO
  ): string => {
    // If it's already an object (and not null), extract ID
    if (
      applicationModuleDTO &&
      typeof applicationModuleDTO === 'object' &&
      applicationModuleDTO !== null &&
      'id' in applicationModuleDTO
    ) {
      return String(applicationModuleDTO.id)
    }

    // If it's a string, try to parse it
    if (typeof applicationModuleDTO === 'string') {
      const parsed = parseStringDTO(applicationModuleDTO)
      if (parsed && 'id' in parsed) {
        return String(parsed.id)
      }

      // If not JSON, check if it's a numeric ID string
      const numericId = parseInt(applicationModuleDTO.trim(), 10)
      if (!isNaN(numericId)) {
        return String(numericId)
      }

      // Return the string as-is if it's not numeric (might be a code or other identifier)
      return applicationModuleDTO.trim()
    }

    return '-'
  }

  const getWorkflowActionDTO = (
    workflowActionDTO: string | WorkflowActionDTO
  ): string => {
    // If it's already an object (and not null), extract ID
    if (
      workflowActionDTO &&
      typeof workflowActionDTO === 'object' &&
      workflowActionDTO !== null &&
      'id' in workflowActionDTO
    ) {
      return String(workflowActionDTO.id)
    }

    // If it's a string, try to parse it
    if (typeof workflowActionDTO === 'string') {
      const parsed = parseStringDTO(workflowActionDTO)
      if (parsed && 'id' in parsed) {
        return String(parsed.id)
      }

      // If not JSON, check if it's a numeric ID string
      const numericId = parseInt(workflowActionDTO.trim(), 10)
      if (!isNaN(numericId)) {
        return String(numericId)
      }

      // Return the string as-is if it's not numeric
      return workflowActionDTO.trim()
    }

    return '-'
  }

  const getApplicationModuleName = (
    applicationModuleDTO: string | ApplicationModuleDTO
  ): string => {
    let dto: ApplicationModuleDTO | null = null

    // If it's already an object (and not null), use it directly
    if (
      applicationModuleDTO &&
      typeof applicationModuleDTO === 'object' &&
      applicationModuleDTO !== null
    ) {
      dto = applicationModuleDTO as ApplicationModuleDTO
    }
    // If it's a string, try to parse it
    else if (typeof applicationModuleDTO === 'string') {
      const parsed = parseStringDTO(applicationModuleDTO)
      if (parsed && 'moduleName' in parsed) {
        dto = parsed as ApplicationModuleDTO
      }
    }

    // Extract name from DTO if available
    if (dto) {
      const name =
        (dto as any).moduleName ||
        (dto as any).name ||
        (dto as any).moduleDescription ||
        (dto as any).description
      if (name && typeof name === 'string' && name.trim() !== '') {
        return name.trim()
      }
    }

    return '-'
  }

  const getWorkflowActionName = (
    workflowActionDTO: string | WorkflowActionDTO
  ): string => {
    let dto: WorkflowActionDTO | null = null

    // If it's already an object (and not null), use it directly
    if (
      workflowActionDTO &&
      typeof workflowActionDTO === 'object' &&
      workflowActionDTO !== null
    ) {
      dto = workflowActionDTO as WorkflowActionDTO
    }
    // If it's a string, try to parse it
    else if (typeof workflowActionDTO === 'string') {
      const parsed = parseStringDTO(workflowActionDTO)
      if (parsed && ('actionName' in parsed || 'name' in parsed)) {
        dto = parsed as WorkflowActionDTO
      }
    }

    // Extract name from DTO if available
    if (dto) {
      const name =
        (dto as any).name || (dto as any).actionName || (dto as any).description
      if (name && typeof name === 'string' && name.trim() !== '') {
        return name.trim()
      }
    }

    if (process.env.NODE_ENV === 'development') {
    }
    return '-'
  }

  const getApplicationModuleDescription = (
    applicationModuleDTO: string | ApplicationModuleDTO
  ): string => {
    let dto: ApplicationModuleDTO | null = null

    // If it's already an object (and not null), use it directly
    if (
      applicationModuleDTO &&
      typeof applicationModuleDTO === 'object' &&
      applicationModuleDTO !== null
    ) {
      dto = applicationModuleDTO as ApplicationModuleDTO
    }
    // If it's a string, try to parse it
    else if (typeof applicationModuleDTO === 'string') {
      const parsed = parseStringDTO(applicationModuleDTO)
      if (parsed && 'moduleDescription' in parsed) {
        dto = parsed as ApplicationModuleDTO
      }
    }

    // Extract description from DTO if available
    if (dto) {
      const desc =
        (dto as any).moduleDescription ||
        (dto as any).description ||
        (dto as any).moduleName ||
        (dto as any).name
      if (desc && typeof desc === 'string' && desc.trim() !== '') {
        return desc.trim()
      }
    }

    return '-'
  }

  const getWorkflowActionDescription = (
    workflowActionDTO: string | WorkflowActionDTO
  ): string => {
    let dto: WorkflowActionDTO | null = null

    // If it's already an object (and not null), use it directly
    if (
      workflowActionDTO &&
      typeof workflowActionDTO === 'object' &&
      workflowActionDTO !== null
    ) {
      dto = workflowActionDTO as WorkflowActionDTO
    }
    // If it's a string, try to parse it
    else if (typeof workflowActionDTO === 'string') {
      const parsed = parseStringDTO(workflowActionDTO)
      if (
        parsed &&
        ('description' in parsed || 'actionDescription' in parsed)
      ) {
        dto = parsed as WorkflowActionDTO
      }
    }

    // Extract description from DTO if available
    if (dto) {
      const desc =
        (dto as any).description ||
        (dto as any).actionDescription ||
        (dto as any).name ||
        (dto as any).actionName
      if (desc && typeof desc === 'string' && desc.trim() !== '') {
        return desc.trim()
      }
    }

    return '-'
  }

  // Extract values safely - ensure we get actual values from API
  const id =
    apiData.id != null && apiData.id !== undefined ? String(apiData.id) : '-'

  // Name extraction - check multiple ways
  let name = '-'
  if (apiData.name) {
    if (typeof apiData.name === 'string' && apiData.name.trim() !== '') {
      name = apiData.name.trim()
    } else if (typeof apiData.name === 'number') {
      name = String(apiData.name)
    }
  }

  const version =
    apiData.version != null && apiData.version !== undefined
      ? Number(apiData.version)
      : 0

  // ModuleCode extraction
  let moduleCode = '-'
  if (apiData.moduleCode) {
    if (
      typeof apiData.moduleCode === 'string' &&
      apiData.moduleCode.trim() !== ''
    ) {
      moduleCode = apiData.moduleCode.trim()
    } else if (typeof apiData.moduleCode === 'number') {
      moduleCode = String(apiData.moduleCode)
    }
  }

  // ActionCode extraction
  let actionCode = '-'
  if (apiData.actionCode) {
    if (
      typeof apiData.actionCode === 'string' &&
      apiData.actionCode.trim() !== ''
    ) {
      actionCode = apiData.actionCode.trim()
    } else if (typeof apiData.actionCode === 'number') {
      actionCode = String(apiData.actionCode)
    }
  }

  const createdBy =
    apiData.createdBy &&
      typeof apiData.createdBy === 'string' &&
      apiData.createdBy.trim() !== ''
      ? apiData.createdBy.trim()
      : '-'
  const createdAt =
    apiData.createdAt &&
      typeof apiData.createdAt === 'string' &&
      apiData.createdAt.trim() !== ''
      ? apiData.createdAt.trim()
      : '-'
  const updatedBy =
    apiData.updatedBy &&
      typeof apiData.updatedBy === 'string' &&
      apiData.updatedBy.trim() !== ''
      ? apiData.updatedBy.trim()
      : '-'
  const updatedAt =
    apiData.updatedAt &&
      typeof apiData.updatedAt === 'string' &&
      apiData.updatedAt.trim() !== ''
      ? apiData.updatedAt.trim()
      : '-'

  const applicationModuleName = getApplicationModuleName(
    apiData.applicationModuleDTO
  )
  const workflowActionName = getWorkflowActionName(apiData.workflowActionDTO)

  const result = {
    id,
    name,
    version,
    createdBy,
    createdAt,
    updatedBy,
    updatedAt,
    amountBased: apiData.amountBased ?? false,
    moduleCode,
    actionCode,
    enabled: apiData.enabled ?? false,
    applicationModuleId: getApplicationModuleDTO(apiData.applicationModuleDTO),
    applicationModuleName,
    applicationModuleDescription: getApplicationModuleDescription(
      apiData.applicationModuleDTO
    ),
    workflowActionId: getWorkflowActionDTO(apiData.workflowActionDTO),
    workflowActionName,
    workflowActionDescription: getWorkflowActionDescription(
      apiData.workflowActionDTO
    ),
    status: apiData.enabled ? 'Active' : 'Inactive',
    stageTemplateIds:
      apiData.stageTemplates?.map((st) => st.id.toString()) || [],
    stageTemplateNames: apiData.stageTemplates?.map((st) => st.name) || [],
    amountRuleIds: apiData.amountRules?.map((ar) => ar.id.toString()) || [],
  }

  return result
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
      throw (error)
    }
  }

  async getWorkflowDefinition(id: string): Promise<WorkflowDefinitionResponse> {
    try {
      const result = await apiClient.get<WorkflowDefinitionResponse>(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_DEFINITION.GET_BY_ID(id))
      )
      return result
    } catch (error) {
      throw (error)
    }
  }

  async getWorkflowDefinitionLabels(): Promise<Record<string, unknown>[]> {
    try {
      const result = await apiClient.get<Record<string, unknown>[]>(
        buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.WORKFLOW_DEFINITION)
      )
      return result
    } catch (error) {
      throw (error)
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
      throw (error)
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
      throw (error)
    }
  }

  async deleteWorkflowDefinition(id: string): Promise<void> {
    try {
      await apiClient.delete(
        buildApiUrl(API_ENDPOINTS.WORKFLOW_DEFINITION.DELETE(id))
      )
    } catch (error) {
      throw (error)
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
      throw error
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
      throw error
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
      throw error
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
      throw error
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
