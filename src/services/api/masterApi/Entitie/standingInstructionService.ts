import { apiClient } from '@/lib/apiClient'
import {
  buildApiUrl,
  buildPaginationParams,
  API_ENDPOINTS,
} from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'
import type {
  ApiDocumentResponse,
  PaginatedDocumentResponse,
} from '@/components/organisms/Master/PartyStepper/partyTypes'

// Task Status DTO interface
export interface TaskStatusDTO {
  id: number
  code: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  deleted: boolean
  enabled: boolean
}

// Standing Instruction types - Based on API response structure
export interface StandingInstruction {
  id: number
  standingInstructionReferenceNumber: string
  clientFullName: string
  debitAmountCap: number
  debitAmount: number
  minimumBalanceAmount: number
  thresholdAmount: number
  firstTransactionDateTime: string
  instructionExpiryDateTime: string
  retryIntervalDays: number
  retryUntilMonthEndFlag: boolean
  instructionRemarks: string
  nextExecutionDateTime: string
  dealNoDTO: unknown | null
  statusDTO: unknown | null
  transferTypeDTO: unknown | null
  occurrenceDTO: unknown | null
  recurringFrequencyDTO: unknown | null
  holidaySetupDTO: unknown | null
  dependentScenarioDTO: unknown | null
  formAccountDrDTO: unknown | null
  dependenceDTO: string | null
  taskStatusDTO: TaskStatusDTO | null
  enabled: boolean
  deleted: boolean
  remarks: string | null
  toAccountDTO: unknown | null
  paymentTypeDTO: unknown | null
  swiftCode: string
  creditAmountCap: number
  creditAmount: number
  priority: number
  recentPercentage: number
  beneficiaryNameDTO: unknown | null
  resetCounterDTO: unknown | null
}

export interface CreateStandingInstructionRequest {
  standingInstructionReferenceNumber: string
  clientFullName: string
  debitAmountCap: number
  debitAmount: number
  minimumBalanceAmount: number
  thresholdAmount: number
  firstTransactionDateTime: string
  instructionExpiryDateTime: string
  retryIntervalDays: number
  retryUntilMonthEndFlag: boolean
  instructionRemarks?: string
  nextExecutionDateTime?: string
  dealNoDTO?: unknown | null
  statusDTO?: unknown | null
  transferTypeDTO?: unknown | null
  occurrenceDTO?: unknown | null
  recurringFrequencyDTO?: unknown | null
  holidaySetupDTO?: unknown | null
  dependentScenarioDTO?: unknown | null
  formAccountDrDTO?: unknown | null
  dependenceDTO?: string | null
  taskStatusDTO?: TaskStatusDTO | null
  enabled?: boolean
  deleted?: boolean
  remarks?: string | null
  toAccountDTO?: unknown | null
  paymentTypeDTO?: unknown | null
  swiftCode?: string
  creditAmountCap?: number
  creditAmount?: number
  priority?: number
  recentPercentage?: number
  beneficiaryNameDTO?: unknown | null
  resetCounterDTO?: unknown | null
}

export interface UpdateStandingInstructionRequest {
  standingInstructionReferenceNumber?: string
  clientFullName?: string
  debitAmountCap?: number
  debitAmount?: number
  minimumBalanceAmount?: number
  thresholdAmount?: number
  firstTransactionDateTime?: string
  instructionExpiryDateTime?: string
  retryIntervalDays?: number
  retryUntilMonthEndFlag?: boolean
  instructionRemarks?: string
  nextExecutionDateTime?: string
  dealNoDTO?: unknown | null
  statusDTO?: unknown | null
  transferTypeDTO?: unknown | null
  occurrenceDTO?: unknown | null
  recurringFrequencyDTO?: unknown | null
  holidaySetupDTO?: unknown | null
  dependentScenarioDTO?: unknown | null
  formAccountDrDTO?: unknown | null
  dependenceDTO?: string | null
  taskStatusDTO?: TaskStatusDTO | null
  enabled?: boolean
  deleted?: boolean
  remarks?: string | null
  toAccountDTO?: unknown | null
  paymentTypeDTO?: unknown | null
  swiftCode?: string
  creditAmountCap?: number
  creditAmount?: number
  priority?: number
  recentPercentage?: number
  beneficiaryNameDTO?: unknown | null
  resetCounterDTO?: unknown | null
}

export interface StandingInstructionFilters {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'DRAFT' | 'INITIATED'
  referenceNumber?: string
  clientFullName?: string
}

export interface StandingInstructionLabel {
  id: string
  key: string
  value: string
  language: string
  category: string
}

// Step-specific response types
export interface StepSaveResponse {
  success: boolean
  message: string
  stepId?: string
  nextStep?: number
  data?: unknown
}

export interface StepValidationResponse {
  isValid: boolean
  errors?: string[]
  warnings?: string[]
}

// Standing Instruction form data types
export interface StandingInstructionDetailsData {
  standingInstructionReferenceNumber: string
  clientFullName: string
  debitAmountCap: number
  debitAmount: number
  minimumBalanceAmount: number
  thresholdAmount: number
  firstTransactionDateTime: string
  instructionExpiryDateTime: string
  retryIntervalDays: number
  retryUntilMonthEndFlag: boolean
  instructionRemarks?: string
  nextExecutionDateTime?: string
  dealNoDTO?: { id: number } | number | null | undefined
  statusDTO?: { id: number } | number | null | undefined
  transferTypeDTO?: { id: number } | number | null | undefined
  occurrenceDTO?: { id: number } | number | null | undefined
  recurringFrequencyDTO?: { id: number } | number | null | undefined
  holidaySetupDTO?: { id: number } | number | null | undefined
  dependentScenarioDTO?: { id: number } | number | null | undefined
  formAccountDrDTO?: { id: number } | number | null | undefined
  dependenceDTO?: string | null | undefined
  paymentTypeDTO?: { id: number } | number | null | undefined
  toAccountDTO?: { id: number } | number | null | undefined
  enabled?: boolean | undefined
  deleted?: boolean | undefined
}

export interface StandingInstructionReviewData {
  reviewData: unknown
  termsAccepted: boolean
}

// UI-friendly StandingInstruction interface for table display
export interface StandingInstructionUIData {
  id: string
  standingInstructionReferenceNumber: string
  clientFullName: string
  debitAmountCap: number
  debitAmount: number
  minimumBalanceAmount: number
  thresholdAmount: number
  firstTransactionDateTime: string
  instructionExpiryDateTime: string
  localeNames: string
  status: string
  registrationDate?: string | undefined
  lastUpdated?: string | undefined
  documents?:
    | Array<{
        name: string
        type: string
        url: string
      }>
    | undefined
}

// Utility function to map API StandingInstruction to UI StandingInstructionUIData
export const mapStandingInstructionToUIData = (
  apiData: StandingInstruction
): StandingInstructionUIData => {
  const mapApiStatus = (taskStatusDTO: TaskStatusDTO | null): string => {
    if (!taskStatusDTO) {
      return 'INITIATED'
    }
    return taskStatusDTO.code || 'INITIATED'
  }

  return {
    id: apiData.id.toString(),
    standingInstructionReferenceNumber: apiData.standingInstructionReferenceNumber || 'N/A',
    clientFullName: apiData.clientFullName || 'N/A',
    debitAmountCap: apiData.debitAmountCap || 0,
    debitAmount: apiData.debitAmount || 0,
    minimumBalanceAmount: apiData.minimumBalanceAmount || 0,
    thresholdAmount: apiData.thresholdAmount || 0,
    firstTransactionDateTime: apiData.firstTransactionDateTime || 'N/A',
    instructionExpiryDateTime: apiData.instructionExpiryDateTime || 'N/A',
    localeNames: apiData.standingInstructionReferenceNumber || '---',
    status: mapApiStatus(apiData.taskStatusDTO),
  }
}

export class StandingInstructionService {
  async getStandingInstructions(
    page = 0,
    size = 20,
    filters?: StandingInstructionFilters
  ): Promise<PaginatedResponse<StandingInstruction>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.status) {
        const statusMapping: Record<string, string> = {
          Approved: 'CLEAR',
          'In Review': 'PENDING',
          Rejected: 'REJECTED',
          Incomplete: 'INCOMPLETE',
        }
        apiFilters.standingInstructionReferenceNumber =
          statusMapping[filters.status] || filters.status
      }
      if (filters.referenceNumber) {
        apiFilters.standingInstructionReferenceNumber = filters.referenceNumber
      }
      if (filters.clientFullName) {
        apiFilters.clientFullName = filters.clientFullName
      }
    }

    const params = {
      ...buildPaginationParams(page, size),
      ...apiFilters,
    }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.STANDING_INSTRUCTION.GET_ALL)}&${queryString}`

    try {
      const result = await apiClient.get<PaginatedResponse<StandingInstruction>>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async getStandingInstruction(id: string): Promise<StandingInstruction> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.STANDING_INSTRUCTION.GET_BY_ID(id))
      const result = await apiClient.get<StandingInstruction>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async createStandingInstruction(
    data: CreateStandingInstructionRequest
  ): Promise<StandingInstruction> {
    try {
      const requestData: CreateStandingInstructionRequest = {
        ...data,
        enabled: data.enabled !== undefined ? data.enabled : true,
        deleted: data.deleted !== undefined ? data.deleted : false,
      }
      
      const result = await apiClient.post<StandingInstruction>(
        buildApiUrl(API_ENDPOINTS.STANDING_INSTRUCTION.SAVE),
        requestData
      )

      return result
    } catch (error) {
      throw error
    }
  }

  async updateStandingInstruction(
    id: string,
    updates: UpdateStandingInstructionRequest
  ): Promise<StandingInstruction> {
    try {
      const result = await apiClient.put<StandingInstruction>(
        buildApiUrl(API_ENDPOINTS.STANDING_INSTRUCTION.UPDATE(id)),
        updates
      )

      return result
    } catch (error) {
      throw error
    }
  }

  async deleteStandingInstruction(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.STANDING_INSTRUCTION.SOFT_DELETE(id))
      )
    } catch (error) {
      throw error
    }
  }

  async getStandingInstructionLabels(): Promise<StandingInstructionLabel[]> {
    return apiClient.get<StandingInstructionLabel[]>(
      buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.STANDING_INSTRUCTION)
    )
  }

  // Standing Instruction form save methods
  async saveStandingInstructionDetails(
    data: StandingInstructionDetailsData,
    isEditing = false,
    standingInstructionId?: string
  ): Promise<StandingInstruction | StepSaveResponse> {
    if (isEditing && standingInstructionId) {
      const url = buildApiUrl(API_ENDPOINTS.STANDING_INSTRUCTION.UPDATE(standingInstructionId))
      const requestData = {
        ...data,
        id: parseInt(standingInstructionId),
        enabled: data.enabled !== undefined ? data.enabled : true,
        deleted: data.deleted !== undefined ? data.deleted : false,
      }

      const response = await apiClient.put<StandingInstruction>(url, requestData)
      return response
    } else {
      const url = buildApiUrl(API_ENDPOINTS.STANDING_INSTRUCTION.SAVE)
      
      const requestData = {
        ...data,
        enabled: true,
        deleted: false,
      }

      const response = await apiClient.post<StandingInstruction>(url, requestData)
      return response
    }
  }

  async saveStandingInstructionReview(
    data: StandingInstructionReviewData
  ): Promise<StepSaveResponse> {
    const url = buildApiUrl(API_ENDPOINTS.PARTY_CREATE.REVIEW_SAVE)
    return apiClient.post<StepSaveResponse>(url, data)
  }

  // Get uploaded documents for standing instruction
  async getStandingInstructionDocuments(
    entityId: string,
    module: string,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedDocumentResponse> {
    try {
      const params = new URLSearchParams({
        'module.equals': module,
        'recordId.equals': entityId,
        page: page.toString(),
        size: size.toString(),
      })
      const url = `${buildApiUrl(API_ENDPOINTS.REAL_ESTATE_DOCUMENT.GET_ALL)}?${params.toString()}`

      const result = await apiClient.get<PaginatedDocumentResponse>(url)

      return (
        result || {
          content: [],
          page: {
            size: size,
            number: page,
            totalElements: 0,
            totalPages: 0,
          },
        }
      )
    } catch (error) {
      throw error
    }
  }

  // Document upload method
  async uploadStandingInstructionDocument(
    file: File,
    entityId: string,
    module: string,
    documentType?: string
  ): Promise<ApiDocumentResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const params = new URLSearchParams({
        module: module,
        recordId: entityId,
        storageType: 'LOCAL',
      })

      if (documentType) {
        params.append('documentType', documentType)
      }

      const url = `${buildApiUrl(API_ENDPOINTS.REAL_ESTATE_DOCUMENT.UPLOAD)}?${params.toString()}`

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data' as const,
        },
      }

      const result = await apiClient.post<ApiDocumentResponse>(
        url,
        formData,
        config
      )

      return result
    } catch (error) {
      throw error
    }
  }

  // Step data retrieval and validation methods
  async getStepData(step: number, standingInstructionId?: string): Promise<unknown> {
    let url = buildApiUrl(
      API_ENDPOINTS.PARTY_CREATE.GET_STEP_DATA(step)
    )

    if (standingInstructionId) {
      url += `?standingInstructionId=${encodeURIComponent(standingInstructionId)}`
    }

    return apiClient.get(url)
  }

  async validateStep(
    step: number,
    data: unknown
  ): Promise<StepValidationResponse> {
    const url = buildApiUrl(
      API_ENDPOINTS.PARTY_CREATE.VALIDATE_STEP(step)
    )
    return apiClient.post<StepValidationResponse>(url, data)
  }

  // Utility method to transform API response to UI-friendly format
  transformToUIData(
    apiResponse: PaginatedResponse<StandingInstruction>
  ): PaginatedResponse<StandingInstructionUIData> {
    return {
      content: apiResponse.content.map((item) => mapStandingInstructionToUIData(item)),
      page: apiResponse.page,
    }
  }

  // Utility method to get UI-friendly data directly
  async getStandingInstructionsUIData(
    page = 0,
    size = 20,
    filters?: StandingInstructionFilters
  ): Promise<PaginatedResponse<StandingInstructionUIData>> {
    const apiResponse = await this.getStandingInstructions(page, size, filters)
    return this.transformToUIData(apiResponse)
  }

  /**
   * Search standing instructions by reference number with pagination
   */
  async searchStandingInstructions(
    query: string,
    page = 0,
    size = 20
  ): Promise<StandingInstruction[]> {
    try {
      if (!query || query.trim().length === 0) {
        return []
      }

      const params = {
        ...buildPaginationParams(page, size),
        'standingInstructionReferenceNumber.contains': query.trim(),
        'deleted.equals': 'false',
        'enabled.equals': 'true',
      }
      const url = `${buildApiUrl(API_ENDPOINTS.STANDING_INSTRUCTION.GET_ALL)}?${new URLSearchParams(params).toString()}`
      const response = await apiClient.get(url)
      
      let standingInstructions: StandingInstruction[] = []

      if (Array.isArray(response)) {
        standingInstructions = response
      } else if (response && typeof response === 'object') {
        if ('content' in response && Array.isArray(response.content)) {
          standingInstructions = response.content
        } else if ('id' in response || 'standingInstructionReferenceNumber' in response) {
          standingInstructions = [response as StandingInstruction]
        }
      }

      return standingInstructions
    } catch {
      throw new Error('Failed to search standing instructions')
    }
  }
}

export const standingInstructionService = new StandingInstructionService()
