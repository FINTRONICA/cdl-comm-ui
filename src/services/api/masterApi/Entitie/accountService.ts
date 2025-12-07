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

// Account types - Updated to match API response structure

export type Account = AccountDTO

export interface AccountDTO {
    id: number;
    accountNumber: string;
    productCode: string;
    accountDisplayName: string;
    ibanNumber: string;
    officialAccountTitle: string;
    virtualAccountNumber: string;
    accountTypeCode: string;
    assignmentStatus: string;
    assignedToReference: string;
    accountOpenDateTime: string;
    referenceField1: string;
    referenceField2: string;
    active: boolean;
  
    taxPaymentDTO: unknown | null;
    currencyDTO: unknown | null;
    accountPurposeDTO: unknown | null;
    accountCategoryDTO: unknown | null;
    primaryAccountDTO: unknown | null;
    bulkUploadProcessingDTO: unknown | null;
    unitaryPaymentDTO: unknown | null;
    accountTypeDTO: unknown | null;
    accountTypeCategoryDTO: unknown | null;
    escrowAgreementDTO: unknown | null;
    taskStatusDTO: TaskStatusDTO | null;
  
    enabled: boolean;
    deleted: boolean;
    uuid: string;
  }
  
  
  export interface CreateAccountRequest {
    accountNumber: string;
    productCode: string;
    accountDisplayName: string;
    ibanNumber: string;
    officialAccountTitle: string;
    virtualAccountNumber: string;
    accountTypeCode: string;
    assignmentStatus: string;
    assignedToReference: string;
    accountOpenDateTime: string;
  
    referenceField1?: string;
    referenceField2?: string;
    active?: boolean;
  
    taxPaymentDTO?: unknown | null;
    currencyDTO?: unknown | null;
    accountPurposeDTO?: unknown | null;
    accountCategoryDTO?: unknown | null;
    primaryAccountDTO?: unknown | null;
    bulkUploadProcessingDTO?: unknown | null;
    unitaryPaymentDTO?: unknown | null;
    accountTypeDTO?: unknown | null;
    accountTypeCategoryDTO?: unknown | null;
    escrowAgreementDTO?: unknown | null;
  
    enabled?: boolean;
    deleted?: boolean;
    uuid?: string;
  }
  


  

  export interface UpdateAccountRequest {
    accountNumber?: string;
    productCode?: string;
    accountDisplayName?: string;
    ibanNumber?: string;
    officialAccountTitle?: string;
    virtualAccountNumber?: string;
    accountTypeCode?: string;
    assignmentStatus?: string;
    assignedToReference?: string;
    accountOpenDateTime?: string;
  
    referenceField1?: string;
    referenceField2?: string;
    active?: boolean;
  
    taxPaymentDTO?: unknown | null;
    currencyDTO?: unknown | null;
    accountPurposeDTO?: unknown | null;
    accountCategoryDTO?: unknown | null;
    primaryAccountDTO?: unknown | null;
    bulkUploadProcessingDTO?: unknown | null;
    unitaryPaymentDTO?: unknown | null;
    accountTypeDTO?: unknown | null;
    accountTypeCategoryDTO?: unknown | null;
    escrowAgreementDTO?: unknown | null;
  
    enabled?: boolean;
    deleted?: boolean;
    uuid?: string;
  }
  
  

export interface AccountFilters {
  status?:
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'IN_PROGRESS'
    | 'DRAFT'
    | 'INITIATED'
  name?: string
  developerId?: string
}

export interface AccountLabel {
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

// Account form data types
export interface AccountDetailsData {
    id?: number;
    accountNumber: string;
    productCode: string;
    accountDisplayName: string;
    ibanNumber: string;
    officialAccountTitle: string;
    virtualAccountNumber?: string | undefined;
    accountTypeCode: string;
    assignmentStatus: string;
    assignedToReference?: string | undefined;
    accountOpenDateTime: string;
    referenceField1?: string | undefined;
    referenceField2?: string | undefined;
    active?: boolean | undefined;
    taxPaymentDTO?: { id: number } | number | null | undefined;
    currencyDTO?: { id: number } | number | null | undefined;
    accountPurposeDTO?: { id: number } | number | null | undefined;
    accountCategoryDTO?: { id: number } | number | null | undefined;
    primaryAccountDTO?: { id: number } | number | null | undefined;
    bulkUploadProcessingDTO?: { id: number } | number | null | undefined;
    unitaryPaymentDTO?: { id: number } | number | null | undefined;
    accountTypeDTO?: { id: number } | number | null | undefined;
    accountTypeCategoryDTO?: { id: number } | number | null | undefined;
    escrowAgreementDTO?: { id: number } | number | null | undefined;
    enabled?: boolean | undefined;
    deleted?: boolean | undefined;
}

export interface AccountReviewData {
  reviewData: unknown
  termsAccepted: boolean
}

// UI-friendly BuildPartner interface for table display
    export interface AccountUIData {
    id: number;
    accountNumber: string;
    productCode: string;
    accountDisplayName: string;
    ibanNumber: string;
    officialAccountTitle: string;
    virtualAccountNumber: string;
    accountTypeCode: string;
    assignmentStatus: string;
    assignedToReference: string;
    accountOpenDateTime: string;
    referenceField1: string;
    referenceField2: string;
    active: boolean;
    taxPaymentDTO: unknown | null;
    currencyDTO: unknown | null;
    accountPurposeDTO: unknown | null;
    accountCategoryDTO: unknown | null;
    primaryAccountDTO: unknown | null;
    bulkUploadProcessingDTO: unknown | null;
    unitaryPaymentDTO: unknown | null;
    accountTypeDTO: unknown | null;
    accountTypeCategoryDTO: unknown | null;
    escrowAgreementDTO: unknown | null;
    status: string;
    localeNames?: string;
    registrationDate?: string | undefined;
    lastUpdated?: string | undefined;
    documents?:
        | Array<{
            name: string
            type: string
            url: string
        }>
        | undefined
}

// Utility function to map API BuildPartner to UI BuildPartnerUIData
export const mapAccountToUIData = (
  apiData: Account
): AccountUIData => {
  return {  
    id: apiData.id,
    accountNumber: apiData.accountNumber || 'N/A',
    productCode: apiData.productCode || 'N/A',
    accountDisplayName: apiData.accountDisplayName || 'N/A',
    ibanNumber: apiData.ibanNumber || 'N/A',
    officialAccountTitle: apiData.officialAccountTitle || 'N/A',
    virtualAccountNumber: apiData.virtualAccountNumber || 'N/A',
    accountTypeCode: apiData.accountTypeCode || 'N/A',
    assignmentStatus: apiData.assignmentStatus || 'N/A',
    assignedToReference: apiData.assignedToReference || 'N/A',
    accountOpenDateTime: apiData.accountOpenDateTime || 'N/A',
    referenceField1: apiData.referenceField1 || 'N/A',
    referenceField2: apiData.referenceField2 || 'N/A',
    taxPaymentDTO: apiData.taxPaymentDTO || null,
    currencyDTO: apiData.currencyDTO || null,
    accountPurposeDTO: apiData.accountPurposeDTO || null,
    accountCategoryDTO: apiData.accountCategoryDTO || null,
    primaryAccountDTO: apiData.primaryAccountDTO || null,
    bulkUploadProcessingDTO: apiData.bulkUploadProcessingDTO || null,
    unitaryPaymentDTO: apiData.unitaryPaymentDTO || null,
    accountTypeDTO: apiData.accountTypeDTO || null,
    accountTypeCategoryDTO: apiData.accountTypeCategoryDTO || null,
    escrowAgreementDTO: apiData.escrowAgreementDTO || null,
    active: apiData.active || false,
    status: apiData.taskStatusDTO?.code || 'INITIATED', // Use taskStatusDTO.code if available
  }
}



// Customer Details API Response Types
export interface CustomerDetailsResponse {
  customerId: string
  cif: string
  name: {
    firstName: string
    shortName: string
  }
  type: string
  contact: {
    preferredEmail: string
    preferredPhone: string
    address: {
      line1: string
      line2: string
      city: string
      state: string
      country: string
      pinCode: string
    }
  }
}

export class AccountService {
  async getAccounts(
    page = 0,
    size = 20,
            filters?: AccountFilters
  ): Promise<PaginatedResponse<Account>> {
    // Map UI filter names to API field names
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.status) {
        // Map UI status values to API status values
        const statusMapping: Record<string, string> = {
          Approved: 'CLEAR',
          'In Review': 'PENDING',
          Rejected: 'REJECTED',
          Incomplete: 'INCOMPLETE',
        }
        apiFilters.status =
          statusMapping[filters.status] || filters.status
      }
      if (filters.name) {
        apiFilters.accountDisplayName = filters.name
      }
      if (filters.developerId) {
        apiFilters.accountNumber = filters.developerId
      }
    }

    const params = {
      ...buildPaginationParams(page, size),
      ...apiFilters,
    }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.ESCROW_ACCOUNT.GET_ALL)}&${queryString}`

    try {
      const result = await apiClient.get<PaginatedResponse<Account>>(url)

      return result
    } catch (error) {
      throw error
    }
  }

  async getAccount(id: string): Promise<Account> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.ESCROW_ACCOUNT.GET_BY_ID(id))

      const result = await apiClient.get<Account>(url)

      return result
    } catch (error) {
      throw error
    }
  }





  async getAccountByAccountNumber(accountNumber: string): Promise<Account> {
    try {
      // GET_ALL already has query params, so we append with &
      const baseUrl = buildApiUrl(API_ENDPOINTS.ESCROW_ACCOUNT.GET_ALL)
      const params = new URLSearchParams({ 'accountNumber.equals': accountNumber })
      const url = `${baseUrl}&${params.toString()}`

      const result = await apiClient.get<PaginatedResponse<Account>>(url)

      if (result?.content && result.content.length > 0) {
        const account = result.content[0]
        if (account) {
          return account
        }
      }
      throw new Error(`No account found with account number: ${accountNumber}`)
    } catch (error) {
      throw error
    }
  }

  // Alias for backward compatibility
  async getAccountByCif(cif: string): Promise<Account> {
    return this.getAccountByAccountNumber(cif)
  }

  // Get customer details by CIF from core bank API
  async getCustomerDetailsByCif(cif: string): Promise<CustomerDetailsResponse> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.CUSTOMER_DETAILS.GET_BY_CIF(cif))

      const result = await apiClient.get<CustomerDetailsResponse>(url)

      if (result) {
        return result
      }
      throw new Error(`No customer details found with CIF: ${cif}`)
    } catch (error) {
      throw error
    }
  }

  async createAccount(
    data: CreateAccountRequest
  ): Promise<Account> {
    try {
      const result = await apiClient.post<Account>(
        buildApiUrl(API_ENDPOINTS.ESCROW_ACCOUNT.SAVE),
        data
      )

      return result
    } catch (error) {
      throw error
    }
  }

  async updateAccount(
    id: string,
    updates: UpdateAccountRequest
  ): Promise<Account> {
    try {
      const result = await apiClient.put<Account>(
        buildApiUrl(API_ENDPOINTS.ESCROW_ACCOUNT.UPDATE(id)),
        updates
      )

      return result
    } catch (error) {
      throw error
    }
  }

  async deleteAccount(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.ESCROW_ACCOUNT.SOFT_DELETE(id))
      )
    } catch (error) {
      throw error
    }
  }

        async getAccountLabels(): Promise<AccountLabel[]> {
    return apiClient.get<AccountLabel[]>(
      buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.ESCROW_ACCOUNT)
    )
  }

  // Account form save methods
  async saveAccountDetails(
    data: AccountDetailsData,
    isEditing = false,
    accountId?: string
  ): Promise<Account | StepSaveResponse> {
    if (isEditing && accountId) {
      // Use PUT for editing existing details
      const url = buildApiUrl(API_ENDPOINTS.ESCROW_ACCOUNT.UPDATE(accountId))
      const requestData = {
        ...data,
        id: parseInt(accountId),
      }

      const response = await apiClient.put<Account>(url, requestData)
      return response
    } else {
      // Use POST for creating new details
      const url = buildApiUrl(API_ENDPOINTS.ESCROW_ACCOUNT.SAVE)

      const response = await apiClient.post<Account>(url, data)
      return response
    }
  }

  async saveAccountReview(
        data: AccountReviewData
  ): Promise<StepSaveResponse> {
    const url = buildApiUrl(API_ENDPOINTS.PARTY_CREATE.REVIEW_SAVE)
    return apiClient.post<StepSaveResponse>(url, data)
  }

  // Get uploaded documents for any entity with configurable module
  async getAccountDocuments(
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
  async uploadAccountDocument(
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

  // Step data retrieval and validation methods
  async getStepData(step: number, agreementId?: string): Promise<unknown> {
    let url = buildApiUrl(
      API_ENDPOINTS.PARTY_CREATE.GET_STEP_DATA(step)
    )

    // Add developer ID as query parameter if provided
    if (agreementId) {
      url += `?agreementId=${encodeURIComponent(agreementId)}`
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
    apiResponse: PaginatedResponse<Account>
  ): PaginatedResponse<AccountUIData> {
    return {
      content: apiResponse.content.map((item) => mapAccountToUIData(item)),
      page: apiResponse.page,
    }
  }

  // Utility method to get UI-friendly data directly
  async getAccountsUIData(
    page = 0,
    size = 20,
    filters?: AccountFilters
  ): Promise<PaginatedResponse<AccountUIData>> {
    const apiResponse = await this.getAccounts(page, size, filters)
    return this.transformToUIData(apiResponse)
  }

  /**
   * Search agreements by name with pagination
   * Used for autocomplete functionality
   */
  async searchAccounts(
    query: string,
    page = 0,
    size = 20
  ): Promise<Account[]> {
    try {
      if (!query || query.trim().length === 0) {
        return []
      }

      const params = {
        ...buildPaginationParams(page, size),
        'accountDisplayName.contains': query.trim(),
        'deleted.equals': 'false',
        'enabled.equals': 'true',
      }
      const url = `${buildApiUrl(API_ENDPOINTS.ESCROW_ACCOUNT.GET_ALL)}&${new URLSearchParams(params).toString()}`
      const response = await apiClient.get(url)
      // Handle both single object and paginated response formats
      let accounts: Account[] = []

      if (Array.isArray(response)) {
        // Direct array response
        accounts = response
      } else if (response && typeof response === 'object') {
        if ('content' in response && Array.isArray(response.content)) {
          // Paginated response format
            accounts = response.content
        } else if ('id' in response || 'accountNumber' in response) {
          // Single object response - wrap in array
          accounts = [response as Account]
        }
      }

      return accounts
    } catch {
      throw new Error('Failed to search accounts')
    }
  }
}

export const accountService = new AccountService()
