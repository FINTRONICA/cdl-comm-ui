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
} from '@/components/organisms/DeveloperStepper/developerTypes'

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

// Payment Instruction types - Based on API response structure (standing-instruction)
export interface PaymentInstruction {
  id: number
  ruleRefNo?: string | null
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

export interface CreatePaymentInstructionRequest {
  ruleRefNo?: string | null
  standingInstructionReferenceNumber: string
  clientFullName: string
  debitAmountCap: number
  debitAmount: number
  minimumBalanceAmount: number
  thresholdAmount: number
  firstTransactionDateTime?: string | null
  instructionExpiryDateTime?: string | null
  retryIntervalDays: number
  retryUntilMonthEndFlag: boolean
  instructionRemarks?: string
  nextExecutionDateTime?: string | null
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

export interface UpdatePaymentInstructionRequest {
  ruleRefNo?: string | null
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

export interface PaymentInstructionFilters {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'DRAFT' | 'INITIATED'
  referenceNumber?: string
  clientFullName?: string
}

export interface PaymentInstructionLabel {
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

// Payment Instruction form data types
export interface PaymentInstructionDetailsData {
  ruleRefNo?: string | null
  standingInstructionReferenceNumber: string
  clientFullName: string
  debitAmountCap: number
  debitAmount: number
  minimumBalanceAmount: number
  thresholdAmount: number
  firstTransactionDateTime?: string | null
  instructionExpiryDateTime?: string | null
  retryIntervalDays: number
  retryUntilMonthEndFlag: boolean
  instructionRemarks?: string
  nextExecutionDateTime?: string | null
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
  swiftCode?: string | null | undefined
  creditAmountCap?: number | undefined
  creditAmount?: number | undefined
  priority?: number | undefined
  recentPercentage?: number | undefined
  beneficiaryNameDTO?: { id: number } | number | null | undefined
  resetCounterDTO?: { id: number } | number | null | undefined
  enabled?: boolean | undefined
  deleted?: boolean | undefined
}

export interface PaymentInstructionReviewData {
  reviewData: unknown
  termsAccepted: boolean
}

// UI-friendly PaymentInstruction interface for table display
export interface PaymentInstructionUIData {
  id: string
  standingInstructionReferenceNumber: string
  clientFullName: string
  debitAmountCap: number
  debitAmount: number
  creditAmountCap: number
  creditAmount: number
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

// Utility function to map API PaymentInstruction to UI PaymentInstructionUIData
export const mapPaymentInstructionToUIData = (
  apiData: PaymentInstruction
): PaymentInstructionUIData => {
  // Determine status based on enabled and deleted flags
  const getStatus = (): string => {
    if (apiData.deleted) {
      return 'DELETED'
    }
    if (!apiData.enabled) {
      return 'INACTIVE'
    }
    // Check if taskStatusDTO exists
    if (apiData.taskStatusDTO?.code) {
      return apiData.taskStatusDTO.code
    }
    return 'ACTIVE'
  }

  return {
    id: apiData.id.toString(),
    standingInstructionReferenceNumber: apiData.standingInstructionReferenceNumber || 'N/A',
    clientFullName: apiData.clientFullName || 'N/A',
    debitAmountCap: apiData.debitAmountCap || 0,
    debitAmount: apiData.debitAmount || 0,
    creditAmountCap: apiData.creditAmountCap || 0,
    creditAmount: apiData.creditAmount || 0,
    minimumBalanceAmount: apiData.minimumBalanceAmount || 0,
    thresholdAmount: apiData.thresholdAmount || 0,
    firstTransactionDateTime: apiData.firstTransactionDateTime || 'N/A',
    instructionExpiryDateTime: apiData.instructionExpiryDateTime || 'N/A',
    localeNames: apiData.standingInstructionReferenceNumber || '---',
    status: getStatus(),
  }
}

export class PaymentInstructionService {
  async getPaymentInstructions(
    page = 0,
    size = 20,
    filters?: PaymentInstructionFilters
  ): Promise<PaginatedResponse<PaymentInstruction>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.status) {
        const statusMapping: Record<string, string> = {
          Approved: 'CLEAR',
          'In Review': 'PENDING',
          Rejected: 'REJECTED',
          Incomplete: 'INCOMPLETE',
        }
        apiFilters.status = statusMapping[filters.status] || filters.status
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
    const url = `${buildApiUrl(API_ENDPOINTS.PAYMENT_INSTRUCTION.GET_ALL)}&${queryString}`

    try {
      const result = await apiClient.get<PaginatedResponse<PaymentInstruction>>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async getPaymentInstruction(id: string): Promise<PaymentInstruction> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.PAYMENT_INSTRUCTION.GET_BY_ID(id))
      const result = await apiClient.get<PaymentInstruction>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async createPaymentInstruction(
    data: CreatePaymentInstructionRequest
  ): Promise<PaymentInstruction> {
    try {
      const requestData: CreatePaymentInstructionRequest = {
        ...data,
        enabled: data.enabled !== undefined ? data.enabled : true,
        deleted: data.deleted !== undefined ? data.deleted : false,
      }
      
      const result = await apiClient.post<PaymentInstruction>(
        buildApiUrl(API_ENDPOINTS.PAYMENT_INSTRUCTION.SAVE),
        requestData
      )

      return result
    } catch (error) {
      throw error
    }
  }

  async updatePaymentInstruction(
    id: string,
    updates: UpdatePaymentInstructionRequest
  ): Promise<PaymentInstruction> {
    try {
      const result = await apiClient.put<PaymentInstruction>(
        buildApiUrl(API_ENDPOINTS.PAYMENT_INSTRUCTION.UPDATE(id)),
        updates
      )

      return result
    } catch (error) {
      throw error
    }
  }

  async deletePaymentInstruction(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.PAYMENT_INSTRUCTION.SOFT_DELETE(id))
      )
    } catch (error) {
      throw error
    }
  }

  async getPaymentInstructionLabels(): Promise<PaymentInstructionLabel[]> {
    return apiClient.get<PaymentInstructionLabel[]>(
      buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.PAYMENT_INSTRUCTION)
    )
  }

  // Payment Instruction form save methods
  async savePaymentInstructionDetails(
    data: PaymentInstructionDetailsData,
    isEditing = false,
    paymentInstructionId?: string
  ): Promise<PaymentInstruction | StepSaveResponse> {
    if (isEditing && paymentInstructionId) {
      const url = buildApiUrl(API_ENDPOINTS.PAYMENT_INSTRUCTION.UPDATE(paymentInstructionId))
      const requestData = {
        ...data,
        id: parseInt(paymentInstructionId),
        enabled: data.enabled !== undefined ? data.enabled : true,
        deleted: data.deleted !== undefined ? data.deleted : false,
      }

      const response = await apiClient.put<PaymentInstruction>(url, requestData)
      return response
    } else {
      const url = buildApiUrl(API_ENDPOINTS.PAYMENT_INSTRUCTION.SAVE)
      
      const requestData = {
        ...data,
        enabled: true,
        deleted: false,
      }

      const response = await apiClient.post<PaymentInstruction>(url, requestData)
      return response
    }
  }

  async savePaymentInstructionReview(
    data: PaymentInstructionReviewData
  ): Promise<StepSaveResponse> {
    const url = buildApiUrl(API_ENDPOINTS.PARTY_CREATE.REVIEW_SAVE)
    return apiClient.post<StepSaveResponse>(url, data)
  }

  // Get uploaded documents for payment instruction
  async getPaymentInstructionDocuments(
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
  async uploadPaymentInstructionDocument(
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
  async getStepData(step: number, paymentInstructionId?: string): Promise<unknown> {
    let url = buildApiUrl(
      API_ENDPOINTS.PARTY_CREATE.GET_STEP_DATA(step)
    )

    if (paymentInstructionId) {
      url += `?paymentInstructionId=${encodeURIComponent(paymentInstructionId)}`
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
    apiResponse: PaginatedResponse<PaymentInstruction>
  ): PaginatedResponse<PaymentInstructionUIData> {
    return {
      content: apiResponse.content.map((item) => mapPaymentInstructionToUIData(item)),
      page: apiResponse.page,
    }
  }

  // Utility method to get UI-friendly data directly
  async getPaymentInstructionsUIData(
    page = 0,
    size = 20,
    filters?: PaymentInstructionFilters
  ): Promise<PaginatedResponse<PaymentInstructionUIData>> {
    const apiResponse = await this.getPaymentInstructions(page, size, filters)
    return this.transformToUIData(apiResponse)
  }

  /**
   * Search payment instructions by reference number with pagination
   */
  async searchPaymentInstructions(
    query: string,
    page = 0,
    size = 20
  ): Promise<PaymentInstruction[]> {
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
      const url = `${buildApiUrl(API_ENDPOINTS.PAYMENT_INSTRUCTION.GET_ALL)}?${new URLSearchParams(params).toString()}`
      const response = await apiClient.get(url)
      
      let paymentInstructions: PaymentInstruction[] = []

      if (Array.isArray(response)) {
        paymentInstructions = response
      } else if (response && typeof response === 'object') {
        if ('content' in response && Array.isArray(response.content)) {
          paymentInstructions = response.content
        } else if ('id' in response || 'standingInstructionReferenceNumber' in response) {
          paymentInstructions = [response as PaymentInstruction]
        }
      }

      return paymentInstructions
    } catch {
      throw new Error('Failed to search payment instructions')
    }
  }
}

export const paymentInstructionService = new PaymentInstructionService()
