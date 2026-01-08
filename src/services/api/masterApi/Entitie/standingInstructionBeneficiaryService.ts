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

// Standing Instruction Beneficiary types - Based on API response structure
export interface StandingInstructionBeneficiary {
  id: number
  beneficiaryAccountNumber: string
  beneficiaryBankIfscCode: string
  creditAmountCap: number
  creditAmount: number
  transferPriorityLevel: number
  creditSharePercentage: number
  currencyCode: string
  paymentModeCode: string
  beneficiaryNameDTO: unknown | null
  paymentModeDTO: unknown | null
  currencyDTO: unknown | null
  standingInstructionDTO: unknown | null
  enabled: boolean
  deleted: boolean
}

export interface CreateStandingInstructionBeneficiaryRequest {
  beneficiaryAccountNumber: string
  beneficiaryBankIfscCode: string
  creditAmountCap: number
  creditAmount: number
  transferPriorityLevel: number
  creditSharePercentage: number
  currencyCode: string
  paymentModeCode: string
  beneficiaryNameDTO?: unknown | null
  paymentModeDTO?: unknown | null
  currencyDTO?: unknown | null
  standingInstructionDTO?: unknown | null
  enabled?: boolean
  deleted?: boolean
}

export interface UpdateStandingInstructionBeneficiaryRequest {
  beneficiaryAccountNumber?: string
  beneficiaryBankIfscCode?: string
  creditAmountCap?: number
  creditAmount?: number
  transferPriorityLevel?: number
  creditSharePercentage?: number
  currencyCode?: string
  paymentModeCode?: string
  beneficiaryNameDTO?: unknown | null
  paymentModeDTO?: unknown | null
  currencyDTO?: unknown | null
  standingInstructionDTO?: unknown | null
  enabled?: boolean
  deleted?: boolean
}

export interface StandingInstructionBeneficiaryFilters {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'DRAFT' | 'INITIATED'
  beneficiaryAccountNumber?: string
  currencyCode?: string
}

export interface StandingInstructionBeneficiaryLabel {
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

// Standing Instruction Beneficiary form data types
export interface StandingInstructionBeneficiaryDetailsData {
  beneficiaryAccountNumber: string
  beneficiaryBankIfscCode: string
  creditAmountCap: number
  creditAmount: number
  transferPriorityLevel: number
  creditSharePercentage: number
  currencyCode: string
  paymentModeCode: string
  beneficiaryNameDTO?: { id: number } | number | null | undefined
  paymentModeDTO?: { id: number } | number | null | undefined
  currencyDTO?: { id: number } | number | null | undefined
  standingInstructionDTO?: { id: number } | number | null | undefined
  enabled?: boolean | undefined
  deleted?: boolean | undefined
}

export interface StandingInstructionBeneficiaryReviewData {
  reviewData: unknown
  termsAccepted: boolean
}

// UI-friendly StandingInstructionBeneficiary interface for table display
export interface StandingInstructionBeneficiaryUIData {
  id: string
  beneficiaryAccountNumber: string
  beneficiaryBankIfscCode: string
  creditAmountCap: number
  creditAmount: number
  transferPriorityLevel: number
  creditSharePercentage: number
  currencyCode: string
  paymentModeCode: string
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

// Utility function to map API StandingInstructionBeneficiary to UI StandingInstructionBeneficiaryUIData
export const mapStandingInstructionBeneficiaryToUIData = (
  apiData: StandingInstructionBeneficiary
): StandingInstructionBeneficiaryUIData => {
  return {
    id: apiData.id.toString(),
    beneficiaryAccountNumber: apiData.beneficiaryAccountNumber || 'N/A',
    beneficiaryBankIfscCode: apiData.beneficiaryBankIfscCode || 'N/A',
    creditAmountCap: apiData.creditAmountCap || 0,
    creditAmount: apiData.creditAmount || 0,
    transferPriorityLevel: apiData.transferPriorityLevel || 0,
    creditSharePercentage: apiData.creditSharePercentage || 0,
    currencyCode: apiData.currencyCode || 'N/A',
    paymentModeCode: apiData.paymentModeCode || 'N/A',
    localeNames: apiData.beneficiaryAccountNumber || '---',
    status: 'ACTIVE',
  }
}

export class StandingInstructionBeneficiaryService {
  async getStandingInstructionBeneficiaries(
    page = 0,
    size = 20,
    filters?: StandingInstructionBeneficiaryFilters
  ): Promise<PaginatedResponse<StandingInstructionBeneficiary>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.status) {
        const statusMapping: Record<string, string> = {
          Approved: 'CLEAR',
          'In Review': 'PENDING',
          Rejected: 'REJECTED',
          Incomplete: 'INCOMPLETE',
        }
        apiFilters.beneficiaryAccountNumber =
          statusMapping[filters.status] || filters.status
      }
      if (filters.beneficiaryAccountNumber) {
        apiFilters.beneficiaryAccountNumber = filters.beneficiaryAccountNumber
      }
      if (filters.currencyCode) {
        apiFilters.currencyCode = filters.currencyCode
      }
    }

    const params = {
      ...buildPaginationParams(page, size),
      ...apiFilters,
    }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.STANDING_INSTRUCTION_BENEFICIARY.GET_ALL)}&${queryString}`

    try {
      const result = await apiClient.get<PaginatedResponse<StandingInstructionBeneficiary>>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async getStandingInstructionBeneficiary(id: string): Promise<StandingInstructionBeneficiary> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.STANDING_INSTRUCTION_BENEFICIARY.GET_BY_ID(id))
      const result = await apiClient.get<StandingInstructionBeneficiary>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async createStandingInstructionBeneficiary(
    data: CreateStandingInstructionBeneficiaryRequest
  ): Promise<StandingInstructionBeneficiary> {
    try {
      const requestData: CreateStandingInstructionBeneficiaryRequest = {
        ...data,
        enabled: data.enabled !== undefined ? data.enabled : true,
        deleted: data.deleted !== undefined ? data.deleted : false,
      }
      
      const result = await apiClient.post<StandingInstructionBeneficiary>(
        buildApiUrl(API_ENDPOINTS.STANDING_INSTRUCTION_BENEFICIARY.SAVE),
        requestData
      )

      return result
    } catch (error) {
      throw error
    }
  }

  async updateStandingInstructionBeneficiary(
    id: string,
    updates: UpdateStandingInstructionBeneficiaryRequest
  ): Promise<StandingInstructionBeneficiary> {
    try {
      const result = await apiClient.put<StandingInstructionBeneficiary>(
        buildApiUrl(API_ENDPOINTS.STANDING_INSTRUCTION_BENEFICIARY.UPDATE(id)),
        updates
      )

      return result
    } catch (error) {
      throw error
    }
  }

  async deleteStandingInstructionBeneficiary(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.STANDING_INSTRUCTION_BENEFICIARY.SOFT_DELETE(id))
      )
    } catch (error) {
      throw error
    }
  }

  async getStandingInstructionBeneficiaryLabels(): Promise<StandingInstructionBeneficiaryLabel[]> {
    return apiClient.get<StandingInstructionBeneficiaryLabel[]>(
      buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.STANDING_INSTRUCTION_BENEFICIARY)
    )
  }

  // Standing Instruction Beneficiary form save methods
  async saveStandingInstructionBeneficiaryDetails(
    data: StandingInstructionBeneficiaryDetailsData,
    isEditing = false,
    beneficiaryId?: string
  ): Promise<StandingInstructionBeneficiary | StepSaveResponse> {
    if (isEditing && beneficiaryId) {
      const url = buildApiUrl(API_ENDPOINTS.STANDING_INSTRUCTION_BENEFICIARY.UPDATE(beneficiaryId))
      const requestData = {
        ...data,
        id: parseInt(beneficiaryId),
        enabled: data.enabled !== undefined ? data.enabled : true,
        deleted: data.deleted !== undefined ? data.deleted : false,
      }

      const response = await apiClient.put<StandingInstructionBeneficiary>(url, requestData)
      return response
    } else {
      const url = buildApiUrl(API_ENDPOINTS.STANDING_INSTRUCTION_BENEFICIARY.SAVE)
      
      const requestData = {
        ...data,
        enabled: true,
        deleted: false,
      }

      const response = await apiClient.post<StandingInstructionBeneficiary>(url, requestData)
      return response
    }
  }

  async saveStandingInstructionBeneficiaryReview(
    data: StandingInstructionBeneficiaryReviewData
  ): Promise<StepSaveResponse> {
    const url = buildApiUrl(API_ENDPOINTS.PARTY_CREATE.REVIEW_SAVE)
    return apiClient.post<StepSaveResponse>(url, data)
  }

  // Get uploaded documents for standing instruction beneficiary
  async getStandingInstructionBeneficiaryDocuments(
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
  async uploadStandingInstructionBeneficiaryDocument(
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
  async getStepData(step: number, beneficiaryId?: string): Promise<unknown> {
    let url = buildApiUrl(
      API_ENDPOINTS.PARTY_CREATE.GET_STEP_DATA(step)
    )

    if (beneficiaryId) {
      url += `?beneficiaryId=${encodeURIComponent(beneficiaryId)}`
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
    apiResponse: PaginatedResponse<StandingInstructionBeneficiary>
  ): PaginatedResponse<StandingInstructionBeneficiaryUIData> {
    return {
      content: apiResponse.content.map((item) => mapStandingInstructionBeneficiaryToUIData(item)),
      page: apiResponse.page,
    }
  }

  // Utility method to get UI-friendly data directly
  async getStandingInstructionBeneficiariesUIData(
    page = 0,
    size = 20,
    filters?: StandingInstructionBeneficiaryFilters
  ): Promise<PaginatedResponse<StandingInstructionBeneficiaryUIData>> {
    const apiResponse = await this.getStandingInstructionBeneficiaries(page, size, filters)
    return this.transformToUIData(apiResponse)
  }

  /**
   * Search standing instruction beneficiaries by account number with pagination
   */
  async searchStandingInstructionBeneficiaries(
    query: string,
    page = 0,
    size = 20
  ): Promise<StandingInstructionBeneficiary[]> {
    try {
      if (!query || query.trim().length === 0) {
        return []
      }

      const params = {
        ...buildPaginationParams(page, size),
        'beneficiaryAccountNumber.contains': query.trim(),
        'deleted.equals': 'false',
        'enabled.equals': 'true',
      }
      const url = `${buildApiUrl(API_ENDPOINTS.STANDING_INSTRUCTION_BENEFICIARY.GET_ALL)}?${new URLSearchParams(params).toString()}`
      const response = await apiClient.get(url)
      
      let beneficiaries: StandingInstructionBeneficiary[] = []

      if (Array.isArray(response)) {
        beneficiaries = response
      } else if (response && typeof response === 'object') {
        if ('content' in response && Array.isArray(response.content)) {
          beneficiaries = response.content
        } else if ('id' in response || 'beneficiaryAccountNumber' in response) {
          beneficiaries = [response as StandingInstructionBeneficiary]
        }
      }

      return beneficiaries
    } catch {
      throw new Error('Failed to search standing instruction beneficiaries')
    }
  }
}

export const standingInstructionBeneficiaryService = new StandingInstructionBeneficiaryService()
