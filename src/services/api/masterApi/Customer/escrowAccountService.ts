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

// Master Escrow Account Response Interface (based on API response)
export interface MasterEscrowAccountResponse {
  id: number
  escrowAccountFullName: string
  escrowAccountAddressLine1: string
  telephoneNumber: string
  mobileNumber: string
  escrowAccountNumber: string
  bankIfscCode: string
  escrowBankName: string
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

// Master Escrow Account Create/Update Request Interface
export interface MasterEscrowAccountData {
  escrowAccountFullName: string
  escrowAccountAddressLine1: string
  telephoneNumber: string
  mobileNumber: string
  escrowAccountNumber: string
  bankIfscCode: string
  escrowBankName: string
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

// Update request interface for escrow account
export interface UpdateMasterEscrowAccountData {
  escrowAccountFullName?: string
  escrowAccountAddressLine1?: string
  telephoneNumber?: string
  mobileNumber?: string
  escrowAccountNumber?: string
  bankIfscCode?: string
  escrowBankName?: string
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
export interface EscrowAccountReviewData {
  reviewData: unknown
  termsAccepted: boolean
}

// Escrow Account filters
export interface MasterEscrowAccountFilters {
  name?: string
  bankName?: string
  accountNumber?: string
}

export class EscrowAccountService {
  // Get all escrow accounts with pagination and filters
  async getEscrowAccounts(
    page = 0,
    size = 20,
    filters?: MasterEscrowAccountFilters
  ): Promise<PaginatedResponse<MasterEscrowAccountResponse>> {
    try {
      const apiFilters: Record<string, string> = {}
      if (filters) {
        if (filters.name) {
          apiFilters['escrowAccountFullName.contains'] = filters.name
        }
        if (filters.bankName) {
          apiFilters['escrowBankName.contains'] = filters.bankName
        }
        if (filters.accountNumber) {
          apiFilters['escrowAccountNumber.contains'] = filters.accountNumber
        }
      }

      const params = {
        ...buildPaginationParams(page, size),
        ...apiFilters,
      }
      const queryString = new URLSearchParams(params).toString()
      const url = `${buildApiUrl(API_ENDPOINTS.MASTER_ESCROW_ACCOUNT.GET_ALL)}&${queryString}`

      const result =
        await apiClient.get<PaginatedResponse<MasterEscrowAccountResponse>>(url)

      return result
    } catch (error) {
      throw error
    }
  }

  // Get a specific escrow account by ID
  async getEscrowAccount(id: string): Promise<MasterEscrowAccountResponse> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_ESCROW_ACCOUNT.GET_BY_ID(id))
      const result = await apiClient.get<MasterEscrowAccountResponse>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  // Save escrow account (create or update)
  async saveEscrowAccount(
    data: MasterEscrowAccountData,
    isEditing = false,
    escrowAccountId?: string | number
  ): Promise<StepSaveResponse> {
    if (isEditing && escrowAccountId) {
      // Use PUT for editing existing escrow account
      const url = buildApiUrl(
        API_ENDPOINTS.MASTER_ESCROW_ACCOUNT.UPDATE(String(escrowAccountId))
      )
      const requestData = {
        ...data,
        enabled: true,
        deleted: false,
      }

      const response = await apiClient.put<StepSaveResponse>(url, requestData)
      return response
    } else {
      // Use POST for creating new escrow account
      const url = buildApiUrl(API_ENDPOINTS.MASTER_ESCROW_ACCOUNT.SAVE)
      const requestData = {
        ...data,
        enabled: data.enabled ?? true,
        deleted: data.deleted ?? false,
      }

      const response = await apiClient.post<StepSaveResponse>(url, requestData)
      return response
    }
  }

  // Update an escrow account
  async updateEscrowAccount(
    id: string,
    data: UpdateMasterEscrowAccountData
  ): Promise<MasterEscrowAccountResponse> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_ESCROW_ACCOUNT.UPDATE(id))
      const response = await apiClient.put<MasterEscrowAccountResponse>(url, data)
      return response
    } catch (error) {
      throw error
    }
  }

  // Delete an escrow account (soft delete)
  async deleteEscrowAccount(id: string): Promise<void> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_ESCROW_ACCOUNT.SOFT_DELETE(id))
      await apiClient.delete(url)
    } catch (error) {
      throw error
    }
  }

  // Get a specific escrow account by ID for editing
  async getEscrowAccountById(
    escrowAccountId: string | number
  ): Promise<MasterEscrowAccountResponse> {
    const url = buildApiUrl(
      API_ENDPOINTS.MASTER_ESCROW_ACCOUNT.GET_BY_ID(String(escrowAccountId))
    )
    const response = await apiClient.get<MasterEscrowAccountResponse>(url)
    return response
  }

  // Save review step
  async saveEscrowAccountReview(
    data: EscrowAccountReviewData
  ): Promise<StepSaveResponse> {
    // For now, we'll use the escrow account update endpoint for review
    // This can be adjusted based on actual API endpoint for review
    const url = buildApiUrl(API_ENDPOINTS.MASTER_ESCROW_ACCOUNT.SAVE)
    return apiClient.post<StepSaveResponse>(url, data)
  }

  // Get uploaded documents for escrow account with configurable module
  // This is a non-critical endpoint - errors should not block the UI
  async getEscrowAccountDocuments(
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
      // For 500 errors on documents endpoint, return empty result instead of throwing
      // Documents are optional and shouldn't block the UI
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return {
            content: [],
            page: {
              size: size,
              number: page,
              totalElements: 0,
              totalPages: 0,
            },
          }
        }
      }
      // For other errors, still throw to allow proper error handling
      throw error
    }
  }

  // Document upload method with configurable module
  async uploadEscrowAccountDocument(
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
  async getStepData(step: number, escrowAccountId?: string): Promise<unknown> {
    if (escrowAccountId && step === 1) {
      // Step 1 is escrow account details
      return this.getEscrowAccountById(escrowAccountId)
    } else if (escrowAccountId && step === 2) {
      // Step 2 is documents
      return this.getEscrowAccountDocuments(escrowAccountId, 'ESCROW_ACCOUNT', 0, 20)
    }
    return null
  }
}

// UI-friendly Escrow Account interface for table display
export interface EscrowAccountUIData {
  id: string
  escrowAccountFullName: string
  escrowAccountNumber: string
  escrowBankName: string
  bankIfscCode: string
  status: string
  accountType?: string | undefined
  transferType?: string | undefined
  role?: string | undefined
}

// Utility function to map API Escrow Account to UI EscrowAccountUIData
export const mapEscrowAccountToUIData = (
  apiData: MasterEscrowAccountResponse
): EscrowAccountUIData => {
  const mapApiStatus = (taskStatusDTO: TaskStatusDTO | null | undefined): string => {
    if (!taskStatusDTO) {
      return 'ACTIVE'
    }
    return taskStatusDTO.code || 'ACTIVE'
  }

  return {
    id: apiData.id.toString(),
    escrowAccountFullName: apiData.escrowAccountFullName || 'N/A',
    escrowAccountNumber: apiData.escrowAccountNumber || 'N/A',
    escrowBankName: apiData.escrowBankName || 'N/A',
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

export const escrowAccountService = new EscrowAccountService()
