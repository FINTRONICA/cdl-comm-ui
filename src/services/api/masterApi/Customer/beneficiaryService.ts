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

export interface LanguageTranslationId {
  id: number
  configId: string
  configValue: string
  content: string | null
  appLanguageCode: {
    id: number
    languageCode: string
    nameKey: string
    nameNativeValue: string
    deleted: boolean
    enabled: boolean
    rtl: boolean
  }
  applicationModuleDTO: {
    id: number
    moduleName: string
    moduleCode?: string
    moduleDescription: string
    deleted: boolean
    enabled: boolean
    active: boolean
  }
  status: string | null
  enabled: boolean
  deleted: boolean
}

export interface AccountTypeDTO {
  id: number
  settingKey?: string
  settingValue?: string
  languageTranslationId?: LanguageTranslationId
  remarks?: string
  status?: string
  enabled: boolean
  deleted: boolean
}

export interface TransferTypeDTO {
  id: number
  settingKey?: string
  settingValue?: string
  languageTranslationId?: LanguageTranslationId
  remarks?: string
  status?: string
  enabled: boolean
  deleted: boolean
}

export interface RoleDTO {
  id: number
  settingKey?: string
  settingValue?: string
  languageTranslationId?: LanguageTranslationId
  remarks?: string
  status?: string
  enabled: boolean
  deleted: boolean
}

// Master Beneficiary Response Interface (based on API response)
export interface MasterBeneficiaryResponse {
  id: number
  beneficiaryFullName: string
  beneficiaryAddressLine1: string
  telephoneNumber: string
  mobileNumber: string
  beneficiaryAccountNumber: string
  bankIfscCode: string
  beneficiaryBankName: string
  bankRoutingCode: string
  additionalRemarks: string
  active: boolean
  accountTypeDTO?: AccountTypeDTO | null
  transferTypeDTO?: TransferTypeDTO | null
  roleDTO?: RoleDTO | null
  taskStatusDTO?: TaskStatusDTO | null
  enabled: boolean
  deleted: boolean
  uuid?: string
}

// Master Beneficiary Create/Update Request Interface
export interface MasterBeneficiaryData {
  beneficiaryFullName: string
  beneficiaryAddressLine1: string
  telephoneNumber: string
  mobileNumber: string
  beneficiaryAccountNumber: string
  bankIfscCode: string
  beneficiaryBankName: string
  bankRoutingCode?: string
  additionalRemarks?: string
  active?: boolean
  enabled?: boolean
  deleted?: boolean
  uuid?: string
  accountTypeDTO?: {
    id: number
  } | null
  transferTypeDTO?: {
    id: number
  } | null
  roleDTO?: {
    id: number
  } | null
  taskStatusDTO?: {
    id: number
  } | null
}

// Update request interface for beneficiary
export interface UpdateMasterBeneficiaryData {
  beneficiaryFullName?: string
  beneficiaryAddressLine1?: string
  telephoneNumber?: string
  mobileNumber?: string
  beneficiaryAccountNumber?: string
  bankIfscCode?: string
  beneficiaryBankName?: string
  bankRoutingCode?: string
  additionalRemarks?: string
  active?: boolean
  enabled?: boolean
  deleted?: boolean
  accountTypeDTO?: {
    id: number
  } | null
  transferTypeDTO?: {
    id: number
  } | null
  roleDTO?: {
    id: number
  } | null
  taskStatusDTO?: {
    id: number
  } | null
}

// Step-specific response types
export interface StepSaveResponse {
  success: boolean
  message: string
  stepId?: string
  nextStep?: number
  data?: unknown
}

// Review data interface
export interface BeneficiaryReviewData {
  reviewData: unknown
  termsAccepted: boolean
}

// Beneficiary filters
export interface MasterBeneficiaryFilters {
  name?: string
  bankName?: string
  accountNumber?: string
}

export interface CreateAccountPurposeRequest {
  accountPurposeCode: string
  accountPurposeName: string
  active: boolean
  enabled?: boolean
  deleted?: boolean
  uuid?: string
  criticalityDTO?: {
    id: number
  } | null
  taskStatusDTO?: {
    id: number
  } | null
}

export interface UpdateAccountPurposeRequest {
  id?: number
  accountPurposeCode: string
  accountPurposeName: string
  active?: boolean
  enabled?: boolean
  deleted?: boolean
  uuid?: string
  criticalityDTO?: {
    id: number
  } | null
  taskStatusDTO?: {
    id: number
  } | null
}

export class BeneficiaryService {
  // Get all beneficiaries with pagination and filters
  async getBeneficiaries(
    page = 0,
    size = 20,
    filters?: MasterBeneficiaryFilters
  ): Promise<PaginatedResponse<MasterBeneficiaryResponse>> {
    try {
      const apiFilters: Record<string, string> = {}
      if (filters) {
        if (filters.name) {
          apiFilters['beneficiaryFullName.contains'] = filters.name
        }
        if (filters.bankName) {
          apiFilters['beneficiaryBankName.contains'] = filters.bankName
        }
        if (filters.accountNumber) {
          apiFilters['beneficiaryAccountNumber.contains'] = filters.accountNumber
        }
      }

      const params = {
        ...buildPaginationParams(page, size),
        ...apiFilters,
      }
      const queryString = new URLSearchParams(params).toString()
      const url = `${buildApiUrl(API_ENDPOINTS.MASTER_BENEFICIARY.GET_ALL)}&${queryString}`

      const result =
        await apiClient.get<PaginatedResponse<MasterBeneficiaryResponse>>(url)

      return result
    } catch (error) {
      throw error
    }
  }

  // Get a specific beneficiary by ID
  async getBeneficiary(id: string): Promise<MasterBeneficiaryResponse> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_BENEFICIARY.GET_BY_ID(id))
      const result = await apiClient.get<MasterBeneficiaryResponse>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  // Save beneficiary (create or update)
  async saveBeneficiary(
    data: MasterBeneficiaryData,
    isEditing = false,
    beneficiaryId?: string | number
  ): Promise<StepSaveResponse> {
    if (isEditing && beneficiaryId) {
      // Use PUT for editing existing beneficiary
      const url = buildApiUrl(
        API_ENDPOINTS.MASTER_BENEFICIARY.UPDATE(String(beneficiaryId))
      )
      const requestData = {
        ...data,
        enabled: true,
        deleted: false,
      }

      const response = await apiClient.put<StepSaveResponse>(url, requestData)
      return response
    } else {
      // Use POST for creating new beneficiary
      const url = buildApiUrl(API_ENDPOINTS.MASTER_BENEFICIARY.SAVE)
      const requestData = {
        ...data,
        enabled: data.enabled ?? true,
        deleted: data.deleted ?? false,
      }

      const response = await apiClient.post<StepSaveResponse>(url, requestData)
      return response
    }
  }
  // Update a beneficiary
  async updateBeneficiary(
    id: string,
    data: UpdateMasterBeneficiaryData
  ): Promise<MasterBeneficiaryResponse> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_BENEFICIARY.UPDATE(id))
      const response = await apiClient.put<MasterBeneficiaryResponse>(url, data)
      return response
    } catch (error) {
      throw error
    }
  }

  // Delete a beneficiary (soft delete)
  async deleteBeneficiary(id: string): Promise<void> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_BENEFICIARY.SOFT_DELETE(id))
      await apiClient.delete(url)
    } catch (error) {
      throw error
    }
  }

  // Get a specific beneficiary by ID for editing
  async getBeneficiaryById(
    beneficiaryId: string | number
  ): Promise<MasterBeneficiaryResponse> {
    const url = buildApiUrl(
      API_ENDPOINTS.MASTER_BENEFICIARY.GET_BY_ID(String(beneficiaryId))
    )
    const response = await apiClient.get<MasterBeneficiaryResponse>(url)
    return response
  }

  // Save review step
  async saveBeneficiaryReview(
    data: BeneficiaryReviewData
  ): Promise<StepSaveResponse> {
    // For now, we'll use the beneficiary update endpoint for review
    // This can be adjusted based on actual API endpoint for review
    const url = buildApiUrl(API_ENDPOINTS.MASTER_BENEFICIARY.SAVE)
    return apiClient.post<StepSaveResponse>(url, data)
  }
  // Get uploaded documents for beneficiary with configurable module
  async getBeneficiaryDocuments(
    entityId: string,
    module: string,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedDocumentResponse> {
    try {
      // Build URL with query parameters to filter by module and recordId, plus pagination
      const params = new URLSearchParams({
        'module.equals': module,
        'recordId.equals': entityId,
        page: page.toString(),
        size: size.toString(),
      })
      const url = `${buildApiUrl(API_ENDPOINTS.REAL_ESTATE_DOCUMENT.GET_ALL)}?${params.toString()}`

      const result = await apiClient.get<PaginatedDocumentResponse>(url)

      // Return the full paginated response
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

  // Document upload method with configurable module
  async uploadBeneficiaryDocument(
    file: File,
    entityId: string,
    module: string,
    documentType?: string
  ): Promise<ApiDocumentResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      // Build URL with query parameters following the API specification
      const params = new URLSearchParams({
        module: module,
        recordId: entityId,
        storageType: 'LOCAL',
      })

      // Add document type if provided
      if (documentType) {
        params.append('documentType', documentType)
      }

      const url = `${buildApiUrl(API_ENDPOINTS.REAL_ESTATE_DOCUMENT.UPLOAD)}?${params.toString()}`

      // Override Content-Type header to let browser set it automatically for FormData
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

  // Step data retrieval method
  async getStepData(step: number, beneficiaryId?: string): Promise<unknown> {
    if (beneficiaryId && step === 1) {
      // Step 1 is beneficiary details
      return this.getBeneficiaryById(beneficiaryId)
    } else if (beneficiaryId && step === 2) {
      // Step 2 is documents
      return this.getBeneficiaryDocuments(beneficiaryId, 'BENEFICIARY', 0, 20)
    }
    return null
  }
}

// UI-friendly Beneficiary interface for table display
export interface BeneficiaryUIData {
  id: string
  beneficiaryFullName: string
  beneficiaryAccountNumber: string
  beneficiaryBankName: string
  bankIfscCode: string
  status: string
  accountType?: string | undefined
  transferType?: string | undefined
  role?: string | undefined
}

// Utility function to map API Beneficiary to UI BeneficiaryUIData
export const mapBeneficiaryToUIData = (
  apiData: MasterBeneficiaryResponse
): BeneficiaryUIData => {
  const mapApiStatus = (taskStatusDTO: TaskStatusDTO | null | undefined): string => {
    if (!taskStatusDTO) {
      return 'ACTIVE'
    }
    return taskStatusDTO.code || 'ACTIVE'
  }

  return {
    id: apiData.id.toString(),
    beneficiaryFullName: apiData.beneficiaryFullName || 'N/A',
    beneficiaryAccountNumber: apiData.beneficiaryAccountNumber || 'N/A',
    beneficiaryBankName: apiData.beneficiaryBankName || 'N/A',
    bankIfscCode: apiData.bankIfscCode || 'N/A',
    status: mapApiStatus(apiData.taskStatusDTO),
    accountType:
      apiData.accountTypeDTO?.languageTranslationId?.configValue ||
      apiData.accountTypeDTO?.settingValue ||
      undefined,
    transferType:
      apiData.transferTypeDTO?.languageTranslationId?.configValue ||
      apiData.transferTypeDTO?.settingValue ||
      undefined,
    role:
      apiData.roleDTO?.languageTranslationId?.configValue ||
      apiData.roleDTO?.settingValue ||
      undefined,
  }
}

export const beneficiaryService = new BeneficiaryService()



