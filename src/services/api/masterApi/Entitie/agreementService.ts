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

// Agreement types - Updated to match API response structure


export interface Agreement {
    id: number;
    primaryEscrowCifNumber: string;
    productManagerName: string;
    clientName: string;
    relationshipManagerName: string;
    operatingLocationCode: string;
    customField1: string;
    customField2: string;
    customField3: string;
    customField4: string;
    active: boolean;
    agreementParametersDTO: unknown | null;
    agreementFeeDTO: unknown | null;
    clientNameDTO: unknown | null;
    businessSegmentDTO: unknown | null;
    businessSubSegmentDTO: unknown | null;
    dealStatusDTO: unknown | null;
    feesDTO: unknown | null;
    dealTypeDTO: unknown | null;
    dealSubTypeDTO: unknown | null;
    productProgramDTO: unknown | null;
    dealPriorityDTO: unknown | null;
    taskStatusDTO: TaskStatusDTO | null;
    enabled: boolean;
    deleted: boolean;
    uuid: string;
  }
  

export interface CreateAgreementRequest {
    primaryEscrowCifNumber: string;
    productManagerName: string;
    clientName: string;
    relationshipManagerName: string;
    operatingLocationCode: string;
  
    customField1?: string;
    customField2?: string;
    customField3?: string;
    customField4?: string;
  
    active?: boolean;
  
    // If needed, you can add DTO object creations later
    agreementParametersDTO?: unknown | null;
    agreementFeeDTO?: unknown | null;
    clientNameDTO?: unknown | null;
    businessSegmentDTO?: unknown | null;
    businessSubSegmentDTO?: unknown | null;
    dealStatusDTO?: unknown | null;
    feesDTO?: unknown | null;
    dealTypeDTO?: unknown | null;
    dealSubTypeDTO?: unknown | null;
    productProgramDTO?: unknown | null;
    dealPriorityDTO?: unknown | null;
  
    taskStatusDTO?: TaskStatusDTO | null;
    enabled?: boolean;
    deleted?: boolean;
    uuid?: string;
  }
  

export interface UpdateAgreementRequest {
    primaryEscrowCifNumber?: string;
    productManagerName?: string;
    clientName?: string;
    relationshipManagerName?: string;
    operatingLocationCode?: string;
  
    customField1?: string;
    customField2?: string;
    customField3?: string;
    customField4?: string;
  
    active?: boolean;
  
    agreementParametersDTO?: unknown | null;
    agreementFeeDTO?: unknown | null;
    clientNameDTO?: unknown | null;
    businessSegmentDTO?: unknown | null;
    businessSubSegmentDTO?: unknown | null;
    dealStatusDTO?: unknown | null;
    feesDTO?: unknown | null;
    dealTypeDTO?: unknown | null;
    dealSubTypeDTO?: unknown | null;
    productProgramDTO?: unknown | null;
    dealPriorityDTO?: unknown | null;
  
    taskStatusDTO?: TaskStatusDTO | null;
    enabled?: boolean;
    deleted?: boolean;
    uuid?: string;
  }
  

export interface AgreementFilters {
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

export interface AgreementLabel {
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

// Agreement form data types
export interface AgreementDetailsData {
  primaryEscrowCifNumber: string
  productManagerName: string
  clientName: string
  relationshipManagerName: string
  operatingLocationCode: string
  customField1?: string | undefined
  customField2?: string | undefined
  customField3?: string | undefined
  customField4?: string | undefined
  active?: boolean | undefined
  agreementParametersDTO?: { id: number } | number | null | undefined
  agreementFeeDTO?: { id: number } | number | null | undefined
  clientNameDTO?: { id: number } | number | null | undefined
  businessSegmentDTO?: { id: number } | number | null | undefined
  businessSubSegmentDTO?: { id: number } | number | null | undefined
  dealStatusDTO?: { id: number } | number | null | undefined
  feesDTO?: { id: number } | number | null | undefined
  dealTypeDTO?: { id: number } | number | null | undefined
  dealSubTypeDTO?: { id: number } | number | null | undefined
  productProgramDTO?: { id: number } | number | null | undefined
  dealPriorityDTO?: { id: number } | number | null | undefined
  enabled?: boolean | undefined

  deleted?: boolean | undefined
}

export interface AgreementReviewData {
  reviewData: unknown
  termsAccepted: boolean
}

// UI-friendly BuildPartner interface for table display
export interface AgreementUIData {
  id: string
  primaryEscrowCifNumber: string
  productManagerName: string
  clientName: string
  relationshipManagerName: string
  operatingLocationCode: string
  customField1: string
  customField2: string
  customField3: string
  customField4: string
  active: boolean
  localeNames: string
  status: string
  registrationDate?: string | undefined
  lastUpdated?: string | undefined
  contactPerson?: string | undefined
  documents?:
    | Array<{
        name: string
        type: string
        url: string
      }>
    | undefined
}

// Utility function to map API BuildPartner to UI BuildPartnerUIData
export const mapAgreementToUIData = (
  apiData: Agreement
): AgreementUIData => {
  const mapApiStatus = (taskStatusDTO: TaskStatusDTO | null): string => {
    if (!taskStatusDTO) {
      return 'INITIATED'
    }

    // Use the code from taskStatusDTO directly as it matches our new status options
    return taskStatusDTO.code || 'INITIATED'
  }

  return {
    id: apiData.id.toString(),
    primaryEscrowCifNumber: apiData.primaryEscrowCifNumber || 'N/A',
    productManagerName: apiData.productManagerName || 'N/A',
    clientName: apiData.clientName || 'N/A',
    relationshipManagerName: apiData.relationshipManagerName || 'N/A',
    operatingLocationCode: apiData.operatingLocationCode || 'N/A',
    customField1: apiData.customField1 || 'N/A',
    customField2: apiData.customField2 || 'N/A',
    customField3: apiData.customField3 || 'N/A',
    customField4: apiData.customField4 || 'N/A',
    active: apiData.active || false,
    localeNames: apiData.operatingLocationCode || '---',
    status: mapApiStatus(apiData.taskStatusDTO),
  }
}



// Customer Details API Response Types
// Fields are optional to handle cases where backend might not return all fields
export interface CustomerDetailsResponse {
  customerId?: string
  cif?: string
  name?: {
    firstName?: string
    shortName?: string
  }
  type?: string
  contact?: {
    preferredEmail?: string
    preferredPhone?: string
    address?: {
      line1?: string
      line2?: string
      city?: string
      state?: string
      country?: string
      pinCode?: string
    }
  }
}

export class AgreementService {
  async getAgreements(
    page = 0,
    size = 20,
    filters?: AgreementFilters
  ): Promise<PaginatedResponse<Agreement>> {
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
        apiFilters.primaryEscrowCifNumber =
          statusMapping[filters.status] || filters.status
      }
      if (filters.name) {
        apiFilters.productManagerName = filters.name
      }
      if (filters.developerId) {
        apiFilters.clientName = filters.developerId
      }
    }

    const params = {
      ...buildPaginationParams(page, size),
      ...apiFilters,
    }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.ESCROW_AGREEMENT.GET_ALL)}&${queryString}`

    try {
      const result = await apiClient.get<PaginatedResponse<Agreement>>(url)

      return result
    } catch (error) {
      throw error
    }
  }

  async getAgreement(id: string): Promise<Agreement> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.ESCROW_AGREEMENT.GET_BY_ID(id))

      const result = await apiClient.get<Agreement>(url)

      return result
    } catch (error) {
      throw error
    }
  }





  async getAgreementByCif(cif: string): Promise<Agreement> {
    try {
      // GET_ALL already has query params, so we append with &
      const baseUrl = buildApiUrl(API_ENDPOINTS.ESCROW_AGREEMENT.GET_ALL)
      const params = new URLSearchParams({ primaryEscrowCifNumber: cif })
      const url = `${baseUrl}&${params.toString()}`

      const result = await apiClient.get<PaginatedResponse<Agreement>>(url)

      if (result?.content && result.content.length > 0) {
        const agreement = result.content[0]
        if (agreement) {
          return agreement
        }
      }
      throw new Error(`No agreement found with CIF: ${cif}`)
    } catch (error) {
      throw error
    }
  }

  // Get customer details by CIF from core bank API
  async getCustomerDetailsByCif(cif: string): Promise<CustomerDetailsResponse> {
    try {
      // Construct the URL - the endpoint already includes the query parameter
      const endpoint = API_ENDPOINTS.CUSTOMER_DETAILS.GET_BY_CIF(cif)
      const url = buildApiUrl(endpoint)

      const result = await apiClient.get<CustomerDetailsResponse>(url)

      if (result) {
        return result
      }
      throw new Error(`No customer details found with CIF: ${cif}`)
    } catch (error) {
      // Log the error for debugging
      console.error('Error fetching customer details:', {
        cif,
        endpoint: API_ENDPOINTS.CUSTOMER_DETAILS.GET_BY_CIF(cif),
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  async createAgreement(
    data: CreateAgreementRequest
  ): Promise<Agreement> {
    try {
      // Ensure enabled=true and deleted=false for new agreements
      const requestData: CreateAgreementRequest = {
        ...data,
        enabled: data.enabled !== undefined ? data.enabled : true,
        deleted: data.deleted !== undefined ? data.deleted : false,
      }
      
      const result = await apiClient.post<Agreement>(
        buildApiUrl(API_ENDPOINTS.ESCROW_AGREEMENT.SAVE),
        requestData
      )

      return result
    } catch (error) {
      throw error
    }
  }

  async updateAgreement(
    id: string,
    updates: UpdateAgreementRequest
  ): Promise<Agreement> {
    try {
      const result = await apiClient.put<Agreement>(
        buildApiUrl(API_ENDPOINTS.ESCROW_AGREEMENT.UPDATE(id)),
        updates
      )

      return result
    } catch (error) {
      throw error
    }
  }

  async deleteAgreement(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.ESCROW_AGREEMENT.SOFT_DELETE(id))
      )
    } catch (error) {
      throw error
    }
  }

  async getAgreementLabels(): Promise<AgreementLabel[]> {
    return apiClient.get<AgreementLabel[]>(
      buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.ESCROW_AGREEMENT)
    )
  }

  // Agreement form save methods
  async saveAgreementDetails(
    data: AgreementDetailsData,
    isEditing = false,
    agreementId?: string
  ): Promise<Agreement | StepSaveResponse> {
    if (isEditing && agreementId) {
      // Use PUT for editing existing details
      const url = buildApiUrl(API_ENDPOINTS.ESCROW_AGREEMENT.UPDATE(agreementId))
      const requestData = {
        ...data,
        id: parseInt(agreementId),
        // Ensure enabled and deleted are set for updates
        enabled: data.enabled !== undefined ? data.enabled : true,
        deleted: data.deleted !== undefined ? data.deleted : false,
      }

      // API returns Agreement object directly
      const response = await apiClient.put<Agreement>(url, requestData)
      return response
    } else {
      // Use POST for creating new details
      const url = buildApiUrl(API_ENDPOINTS.ESCROW_AGREEMENT.SAVE)
      
      // Ensure enabled=true and deleted=false for new agreements
      const requestData = {
        ...data,
        enabled: true,
        deleted: false,
      }

      // API returns Agreement object directly
      const response = await apiClient.post<Agreement>(url, requestData)
      return response
    }
  }

  async saveAgreementReview(
    data: AgreementReviewData
  ): Promise<StepSaveResponse> {
    const url = buildApiUrl(API_ENDPOINTS.PARTY_CREATE.REVIEW_SAVE)
    return apiClient.post<StepSaveResponse>(url, data)
  }

  // Get uploaded documents for any entity with configurable module
  async getAgreementDocuments(
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
  async uploadAgreementDocument(
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
    apiResponse: PaginatedResponse<Agreement>
  ): PaginatedResponse<AgreementUIData> {
    return {
      content: apiResponse.content.map((item) => mapAgreementToUIData(item)),
      page: apiResponse.page,
    }
  }

  // Utility method to get UI-friendly data directly
  async getAgreementsUIData(
    page = 0,
    size = 20,
    filters?: AgreementFilters
  ): Promise<PaginatedResponse<AgreementUIData>> {
    const apiResponse = await this.getAgreements(page, size, filters)
    return this.transformToUIData(apiResponse)
  }

  /**
   * Search agreements by name with pagination
   * Used for autocomplete functionality
   */
  async searchAgreements(
    query: string,
    page = 0,
    size = 20
  ): Promise<Agreement[]> {
    try {
      if (!query || query.trim().length === 0) {
        return []
      }

      const params = {
        ...buildPaginationParams(page, size),
        'productManagerName.contains': query.trim(),
        'deleted.equals': 'false',
        'enabled.equals': 'true',
      }
      const url = `${buildApiUrl(API_ENDPOINTS.ESCROW_AGREEMENT.GET_ALL)}?${new URLSearchParams(params).toString()}`
      const response = await apiClient.get(url)
      // Handle both single object and paginated response formats
      let agreements: Agreement[] = []

      if (Array.isArray(response)) {
        // Direct array response
        agreements = response
      } else if (response && typeof response === 'object') {
        if ('content' in response && Array.isArray(response.content)) {
          // Paginated response format
          agreements = response.content
        } else if ('id' in response || 'productManagerName' in response) {
          // Single object response - wrap in array
          agreements = [response as Agreement]
        }
      }

      return agreements
    } catch {
      throw new Error('Failed to search agreements')
    }
  }
}

export const agreementService = new AgreementService()
