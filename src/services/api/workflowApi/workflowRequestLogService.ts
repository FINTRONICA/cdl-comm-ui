// import { apiClient } from '@/lib/apiClient'
// import {
//   buildApiUrl,
//   buildPaginationParams,
//   API_ENDPOINTS,
// } from '@/constants/apiEndpoints'
// import type { PaginatedResponse } from '@/types'

// export interface LanguageTranslationDTO {
//   id: number
//   status: string | null
//   content: string | null
//   deleted: boolean
//   enabled: boolean
//   configId: string
//   configValue: string
// }

// export interface BpRegulatorDTO {
//   id: number
//   status: string | null
//   deleted: boolean
//   enabled: boolean
//   remarks: string | null
//   settingKey: string
//   settingValue: string
//   languageTranslationId: LanguageTranslationDTO
// }

// export interface DetailsJsonDTO {
//   id: number
//   bpFax: string
//   bpName: string
//   bpEmail: string
//   bpPoBox: string
//   deleted: boolean | null
//   bpMobile: string
//   bpremark: string
//   bpCifrera: string
//   bpLicenseNo: string
//   bpNameLocal: string
//   bpContactTel: string
//   bpMasterName: string
//   bpDeveloperId: string
//   taskStatusDTO: unknown | null
//   beneficiaryIds: string[] | number[]
//   bpMigratedData: boolean
//   bpRegulatorDTO: BpRegulatorDTO
//   bpContactAddress: string
//   bpDeveloperRegNo: string
//   bpLicenseExpDate: string
//   bpOnboardingDate: string
//   bpWorldCheckFlag: string
//   bpActiveStatusDTO: unknown | null
//   bpWorldCheckRemarks: string
// }

// export interface WorkflowRequestDTO {
//   id: number
//   referenceId: string
//   referenceType: string
//   moduleName: string
//   actionKey: string
//   amount: number | null
//   currency: string | null
//   payloadJson: DetailsJsonDTO
//   currentStageOrder: number
//   createdBy: string
//   createdAt: string
//   lastUpdatedAt: string
//   version: number | null
//   workflowDefinitionDTO: unknown | null
//   workflowRequestStageDTOS: unknown | null
//   taskStatusDTO: unknown | null
// }

// export interface WorkflowRequestLogContent {
//   id: number
//   eventType: string
//   eventByUser: string
//   eventByGroup: string | null
//   eventAt: string
//   detailsJson: DetailsJsonDTO
//   workflowRequestDTO: WorkflowRequestDTO
// }

// export interface PageDTO {
//   size: number
//   number: number
//   totalElements: number
//   totalPages: number
// }

// export interface WorkflowRequestLogResponse {
//   content: WorkflowRequestLogContent[]
//   page: PageDTO
// }

// export interface CreateWorkflowRequestLog {
//   eventType: string
//   eventByUser: string
//   eventByGroup?: string | null
//   detailsJson: Record<string, unknown>
//   workflowRequestDTO: {
//     referenceId: string
//     referenceType: string
//     moduleName: string
//     actionKey: string
//     amount?: number | null
//     currency?: string | null
//     payloadJson: Record<string, unknown>
//   }
// }

// export interface UpdateWorkflowRequestLog {
//   id: number
//   eventType?: string
//   eventByUser?: string
//   eventByGroup?: string | null
//   detailsJson?: Record<string, unknown>
// }

// export interface WorkflowRequestLogUIData {
//   id: number
//   eventType: string
//   eventByUser: string
//   eventByGroup: string | null
//   eventAt: string
//   referenceId: string
//   referenceType: string
//   moduleName: string
//   actionKey: string
//   amount: number | null
//   currency: string | null
//   currentStageOrder: number
//   createdBy: string
//   createdAt: string
//   bpDeveloperId: string
//   bpName: string
//   bpCifrera: string
//   [key: string]: unknown
// }

// export const mapWorkflowRequestLogResponseToModel = (
//   apiData: WorkflowRequestLogContent
// ): WorkflowRequestLogContent => {
//   return {
//     ...apiData,
//     eventType: apiData.eventType || '-',
//     eventByUser: apiData.eventByUser || '-',
//     eventAt: apiData.eventAt || '-',
//   }
// }

// export const mapWorkflowRequestLogResponseToUIData = (
//   apiData: WorkflowRequestLogContent
// ): WorkflowRequestLogUIData => {
//   const formatValue = (value: string | null | undefined): string => {
//     if (
//       !value ||
//       value === 'N/A' ||
//       value === 'null' ||
//       value === 'undefined' ||
//       value.trim() === ''
//     ) {
//       return '-'
//     }
//     return value
//   }

//   return {
//     id: apiData.id,
//     eventType: formatValue(apiData.eventType),
//     eventByUser: formatValue(apiData.eventByUser),
//     eventByGroup: apiData.eventByGroup,
//     eventAt: apiData.eventAt,
//     referenceId: formatValue(apiData.workflowRequestDTO?.referenceId),
//     referenceType: formatValue(apiData.workflowRequestDTO?.referenceType),
//     moduleName: formatValue(apiData.workflowRequestDTO?.moduleName),
//     actionKey: formatValue(apiData.workflowRequestDTO?.actionKey),
//     amount: apiData.workflowRequestDTO?.amount || null,
//     currency: apiData.workflowRequestDTO?.currency || null,
//     currentStageOrder: apiData.workflowRequestDTO?.currentStageOrder || 0,
//     createdBy: formatValue(apiData.workflowRequestDTO?.createdBy),
//     createdAt: apiData.workflowRequestDTO?.createdAt || apiData.eventAt,
//     bpDeveloperId: formatValue(apiData.detailsJson?.bpDeveloperId),
//     bpName: formatValue(apiData.detailsJson?.bpName),
//     bpCifrera: formatValue(apiData.detailsJson?.bpCifrera),
//   }
// }

// export class WorkflowRequestLogService {
//   async saveWorkflowRequestLog(
//     data: CreateWorkflowRequestLog
//   ): Promise<WorkflowRequestLogContent> {
//     try {
//       const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_REQUEST_LOG.SAVE)
//       const result = await apiClient.post<WorkflowRequestLogContent>(url, data)

//       return result
//     } catch (error) {
//       console.log(error)
//       throw error
//     }
//   }

//   async getAllWorkflowRequestLogs(
//     page = 0,
//     size = 20
//   ): Promise<PaginatedResponse<WorkflowRequestLogContent>> {
//     const params = buildPaginationParams(page, size)
//     const queryString = new URLSearchParams(params).toString()
//     const url = `${buildApiUrl(API_ENDPOINTS.WORKFLOW_REQUEST_LOG.GET_ALL)}?${queryString}`

//     try {
//       const result =
//         await apiClient.get<PaginatedResponse<WorkflowRequestLogContent>>(url)

//       return result
//     } catch (error) {
//       console.log(error)
//       throw error
//     }
//   }

//   async getWorkflowRequestLogsByWorkflowId(
//     workflowRequestId: string,
//     page = 0,
//     size = 20
//   ): Promise<PaginatedResponse<WorkflowRequestLogContent>> {
//     const params = {
//       ...buildPaginationParams(page, size),
//       'workflowRequestId.equals': workflowRequestId
//     }
//     const queryString = new URLSearchParams(params).toString()
//     const url = `${buildApiUrl(API_ENDPOINTS.WORKFLOW_REQUEST_LOG.GET_ALL)}?${queryString}`

//     try {
//       const result =
//         await apiClient.get<PaginatedResponse<WorkflowRequestLogContent>>(url)

//       return result
//     } catch (error) {
//       console.log(error)
//       throw error
//     }
//   }

//   async getWorkflowRequestLogs(
//     page = 0,
//     size = 20
//   ): Promise<PaginatedResponse<WorkflowRequestLogContent>> {
//     const params = buildPaginationParams(page, size)
//     const queryString = new URLSearchParams(params).toString()
//     const url = `${buildApiUrl(API_ENDPOINTS.WORKFLOW_REQUEST_LOG.FIND_ALL)}?${queryString}`

//     try {
//       const result =
//         await apiClient.get<PaginatedResponse<WorkflowRequestLogContent>>(url)

//       return result
//     } catch (error) {
//       console.log(error)
//       throw error
//     }
//   }

//   async getWorkflowRequestLogById(
//     id: string
//   ): Promise<WorkflowRequestLogContent> {
//     try {
//       const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_REQUEST_LOG.GET_BY_ID(id))
//       const result = await apiClient.get<WorkflowRequestLogContent>(url)

//       return result
//     } catch (error) {
//       console.log(error)
//       throw error
//     }
//   }

//   async updateWorkflowRequestLog(
//     id: string,
//     updates: UpdateWorkflowRequestLog
//   ): Promise<WorkflowRequestLogContent> {
//     const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_REQUEST_LOG.UPDATE(id))
//     try {
//       const result = await apiClient.put<WorkflowRequestLogContent>(
//         url,
//         updates
//       )

//       return result
//     } catch (error) {
//       console.log(error)
//       throw error
//     }
//   }

//   async deleteWorkflowRequestLog(id: string): Promise<void> {
//     const url = buildApiUrl(API_ENDPOINTS.WORKFLOW_REQUEST_LOG.DELETE(id))
//     const deletePayload = { id: parseInt(id) }

//     try {
//       await apiClient.delete<void>(url, { data: deletePayload })
//     } catch (error) {
//       console.log(error)
//       throw error
//     }
//   }

//   transformToUIData(
//     apiResponse: PaginatedResponse<WorkflowRequestLogContent>
//   ): PaginatedResponse<WorkflowRequestLogUIData> {
//     return {
//       content: apiResponse.content.map(mapWorkflowRequestLogResponseToUIData),
//       page: apiResponse.page,
//     }
//   }

//   async getWorkflowRequestLogsUIData(
//     page = 0,
//     size = 20
//   ): Promise<PaginatedResponse<WorkflowRequestLogUIData>> {
//     const apiResponse = await this.getWorkflowRequestLogs(page, size)
//     return this.transformToUIData(apiResponse)
//   }

//   async getAllWorkflowRequestLogsUIData(
//     page = 0,
//     size = 20
//   ): Promise<PaginatedResponse<WorkflowRequestLogUIData>> {
//     const apiResponse = await this.getAllWorkflowRequestLogs(page, size)
//     return this.transformToUIData(apiResponse)
//   }

//   transformLogResponseToModelPage(
//     apiResponse: PaginatedResponse<WorkflowRequestLogContent>
//   ): PaginatedResponse<WorkflowRequestLogContent> {
//     return {
//       content: apiResponse.content.map((item) =>
//         mapWorkflowRequestLogResponseToModel(item)
//       ),
//       page: apiResponse.page,
//     }
//   }

//   async getWorkflowRequestLogsModelPage(
//     page = 0,
//     size = 20
//   ): Promise<PaginatedResponse<WorkflowRequestLogContent>> {
//     const apiResponse = await this.getWorkflowRequestLogs(page, size)
//     return this.transformLogResponseToModelPage(apiResponse)
//   }
// }

// export const workflowRequestLogService = new WorkflowRequestLogService()
