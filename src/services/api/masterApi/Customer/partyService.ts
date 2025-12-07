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

// Party types - Updated to match API response structure
export interface Party {
  id: number
  partyCifNumber: string | null,
  partyFullName: string | null,
  addressLine1: string | null,
  addressLine2: string | null,
  addressLine3: string | null,
  telephoneNumber: string,
  mobileNumber: string | null,
  emailAddress: string | null,
  bankIdentifier: string,
  passportIdentificationDetails: string | null,
  backupProjectAccountOwnerName: string | null,
  projectAccountOwnerName: string | null,
  assistantRelationshipManagerName: string | null,
  teamLeaderName: string | null,
  additionalRemarks: string | null,
  relationshipManagerName: string | null,
  partyConstituentDTO: unknown | null,
  roleDTO: unknown | null,
  taskStatusDTO: TaskStatusDTO | null,
  active: boolean,
  enabled: boolean | null,
  deleted: boolean | null,
  uuid?: string | null
}

export interface CreatePartyRequest {
  partyCifNumber: string | null,
  partyFullName: string | null,
  addressLine1: string | null,
  addressLine2: string | null,
  addressLine3: string | null,
  telephoneNumber: string,
  mobileNumber: string | null,
  emailAddress: string | null,
  bankIdentifier: string,
  passportIdentificationDetails: string | null,
  backupProjectAccountOwnerName: string | null,
  projectAccountOwnerName: string | null,
  assistantRelationshipManagerName: string | null,
  teamLeaderName: string | null,
  additionalRemarks: string | null,
  active: boolean,
  relationshipManagerName: string | null,
  partyConstituentDTO?: {
    id: number
  } | null,
  roleDTO?: {
    id: number
  } | null,
  taskStatusDTO?: {
    id: number
  } | null
}

export interface UpdatePartyRequest {
  partyCifNumber: string | null,
  partyFullName: string | null,
  addressLine1: string | null,
  addressLine2: string | null,
  addressLine3: string | null,
  telephoneNumber: string,
  mobileNumber: string | null,
  emailAddress: string | null,
  bankIdentifier: string,
  passportIdentificationDetails: string | null,
  backupProjectAccountOwnerName: string | null,
  projectAccountOwnerName: string | null,
  assistantRelationshipManagerName: string | null,
  teamLeaderName: string | null,
  additionalRemarks: string | null,
  active: boolean,
  relationshipManagerName: string | null,
  partyConstituentDTO?: {
    id: number
  } | null,
  roleDTO?: {
    id: number
  } | null,
  taskStatusDTO?: {
    id: number
  } | null
}

export interface PartyFilters {
  status?:
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'IN_PROGRESS'
    | 'DRAFT'
    | 'INITIATED'
  name?: string
  partyId?: string
}

export interface PartyLabel {
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

// Party form data types
export interface PartyDetailsData {
  partyCifNumber: string | null,
  partyFullName: string | null,
  addressLine1: string | null,
  addressLine2: string | null,
  addressLine3: string | null,
  telephoneNumber: string,
  mobileNumber: string | null,
  emailAddress: string | null,
  bankIdentifier: string,
  passportIdentificationDetails: string | null,
  backupProjectAccountOwnerName: string | null,
  projectAccountOwnerName: string | null,
  assistantRelationshipManagerName: string | null,
  teamLeaderName: string | null,
  additionalRemarks: string | null,
  relationshipManagerName: string | null,
  active: boolean,
  partyConstituentDTO?: {
    id: number
  } | null,
  roleDTO?: {
    id: number
  } | null,
  taskStatusDTO?: {
    id: number
  } | null
}

// UI-friendly Party interface for table display
export interface PartyUIData {
  id: string
  partyCifNumber: string,
  partyFullName: string,
  addressLine1: string,
  addressLine2: string,
  addressLine3: string,
  telephoneNumber: string,
  mobileNumber: string,
  emailAddress: string,
  bankIdentifier: string,
  passportIdentificationDetails: string,
  backupProjectAccountOwnerName: string,
  projectAccountOwnerName: string,
  assistantRelationshipManagerName: string,
  teamLeaderName: string,
  additionalRemarks: string,
  relationshipManagerName: string,
  status: string
  active: boolean,
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

// Utility function to map API Party to UI PartyUIData
export const mapPartyToUIData = (
  apiData: Party
): PartyUIData => {
  const mapApiStatus = (taskStatusDTO: TaskStatusDTO | null): string => {
    if (!taskStatusDTO) {
      return 'INITIATED'
    }

    // Use the code from taskStatusDTO directly as it matches our new status options
    return taskStatusDTO.code || 'INITIATED'
  }

  return {
    id: apiData.id.toString(),
    partyCifNumber: apiData.partyCifNumber || 'N/A',
    partyFullName: apiData.partyFullName || 'N/A',
    addressLine1: apiData.addressLine1 || 'N/A',
    addressLine2: apiData.addressLine2 || 'N/A',
    addressLine3: apiData.addressLine3 || 'N/A',
    telephoneNumber: apiData.telephoneNumber || 'N/A',
    mobileNumber: apiData.mobileNumber || 'N/A',
    emailAddress: apiData.emailAddress || 'N/A',
    bankIdentifier: apiData.bankIdentifier || 'N/A',
    passportIdentificationDetails: apiData.passportIdentificationDetails || 'N/A',
    backupProjectAccountOwnerName: apiData.backupProjectAccountOwnerName || 'N/A',
    projectAccountOwnerName: apiData.projectAccountOwnerName || 'N/A',
    assistantRelationshipManagerName: apiData.assistantRelationshipManagerName || 'N/A',
    teamLeaderName: apiData.teamLeaderName || 'N/A',
    additionalRemarks: apiData.additionalRemarks || 'N/A',
    relationshipManagerName: apiData.relationshipManagerName || 'N/A',
    status: mapApiStatus(apiData.taskStatusDTO),
    active: apiData.active ?? false,
  }
}

export interface PartyAuthorizedSignatoryData {
  id?: number | string
  customerCifNumber: string | null,
  signatoryFullName: string | null,
  addressLine1: string | null,
  addressLine2: string | null,
  addressLine3: string | null,
  telephoneNumber: string | null,
  mobileNumber: string | null,
  emailAddress: string | null,
  notificationContactName: string | null,
  signatoryCifNumber: string | null,
  notificationEmailAddress: string | null,
  notificationSignatureFile: string | null,
  notificationSignatureMimeType: string | null,
  active: boolean | null,
  cifExistsDTO?: {
    id?: number
  } | null,
  partyDTO?: {
    id?: number
  } | null,
  notificationSignatureDTO?: {
    id?: number
  } | null,
  enabled?: boolean | null,
  deleted?: boolean | null
}

// API Response interface for authorized signatory data
export interface PartyAuthorizedSignatoryResponse {
  id: number
  customerCifNumber: string | null,
  signatoryFullName: string | null,
  addressLine1: string | null,
  addressLine2: string | null,
  addressLine3: string | null,
  telephoneNumber: string | null,
  mobileNumber: string | null,
  emailAddress: string | null,
  notificationContactName: string | null,
  signatoryCifNumber: string | null,
  notificationEmailAddress: string | null,
  notificationSignatureFile: string | null,
  notificationSignatureMimeType: string | null,
  active: boolean | null,
  cifExistsDTO?: {
    id?: number
  } | null,
  partyDTO?: {
    id?: number
  } | null,
  notificationSignatureDTO?: {
    id?: number
  } | null,
  enabled?: boolean | null,
  deleted?: boolean | null
}


// UI-friendly FeeData interface for table display

export interface PartyReviewData {
  reviewData: unknown
  termsAccepted: boolean
}

// Customer Details API Response Types
export interface PartyAuthorizedSignatoryDetailsResponse {
  id: number
  customerCifNumber: string | null,
  signatoryFullName: string | null,
  addressLine1: string | null,
  addressLine2: string | null,
  addressLine3: string | null,
  telephoneNumber: string | null,
  mobileNumber: string | null,
  emailAddress: string | null,
  notificationContactName: string | null,
  signatoryCifNumber: string | null,
  notificationEmailAddress: string | null,
  notificationSignatureFile: string | null,
  notificationSignatureMimeType: string | null,
  active: boolean | null,
  cifExistsDTO?: {
    id?: number
  } | null,
  partyDTO?: {
    id?: number
  } | null,
  notificationSignatureDTO?: {
    id?: number
  } | null,
  enabled?: boolean | null,
  deleted?: boolean | null
}

export class PartyService {
  async getParties(
    page = 0,
    size = 20,
    filters?: PartyFilters
  ): Promise<PaginatedResponse<Party>> {
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
        apiFilters.mpWorldCheckFlag =
          statusMapping[filters.status] || filters.status
      }
      if (filters.name) {
        apiFilters['partyFullName.contains'] = filters.name
      }
      if (filters.partyId) {
        apiFilters['partyCifNumber.equals'] = filters.partyId
      }
    }

    // Build URL - Use base endpoint and add filters
    // Note: We're removing the enabled.equals=true filter to include parties with enabled=null
    // This allows newly created parties to appear in the list
    const baseUrl = buildApiUrl('/party')
    const allParams = {
      'deleted.equals': 'false',
      // Removed 'enabled.equals': 'true' to include parties with enabled=null or enabled=false
      // This ensures newly created parties appear in the list
      ...buildPaginationParams(page, size),
      ...apiFilters,
    }
    const url = `${baseUrl}?${new URLSearchParams(allParams).toString()}`

    console.log('[PartyService] Fetching parties from URL:', url)
    console.log('[PartyService] Query parameters:', allParams)

    try {
      const result = await apiClient.get<PaginatedResponse<Party>>(url)

      console.log('[PartyService] Raw API response:', result)
      console.log('[PartyService] Response type:', typeof result)
      console.log('[PartyService] Is array?', Array.isArray(result))
      console.log('[PartyService] Has content?', 'content' in (result || {}))
      console.log('[PartyService] Content length:', result?.content?.length || 0)

      // Handle case where API returns array directly instead of paginated response
      if (Array.isArray(result)) {
        console.warn('[PartyService] API returned array directly, converting to paginated format')
        return {
          content: result,
          page: {
            size: result.length,
            number: page,
            totalElements: result.length,
            totalPages: 1,
          },
        }
      }

      // Handle case where content might be missing
      if (result && !result.content) {
        console.warn('[PartyService] API response missing content field, response:', result)
        return {
          content: [],
          page: {
            size: 0,
            number: page,
            totalElements: 0,
            totalPages: 0,
          },
        }
      }

      return result || {
        content: [],
        page: {
          size: 0,
          number: page,
          totalElements: 0,
          totalPages: 0,
        },
      }
    } catch (error) {
      console.error('[PartyService] Error fetching parties:', error)
      throw error
    }
  }

  async getParty(id: string): Promise<Party> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.PARTY.GET_BY_ID(id))

      const result = await apiClient.get<Party>(url)

      return result
    } catch (error) {
      throw error
    }
  }

  async getPartyAuthorizedSignatory(partyId: string): Promise<PartyAuthorizedSignatoryResponse[]> {
    try {
      // Get all authorized signatories for a party
      const params = new URLSearchParams({
        'partyDTO.id.equals': partyId,
        'deleted.equals': 'false',
        'enabled.equals': 'true',
      })
      const url = `${buildApiUrl(API_ENDPOINTS.PARTY_AUTHORIZED_SIGNATORY.GET_ALL)}&${params.toString()}`

      const result = await apiClient.get<PaginatedResponse<PartyAuthorizedSignatoryResponse>>(url)
      return result?.content || []
    } catch (error) {
      throw error
    }
  }

  async savePartyReview(
    data:PartyReviewData
  ): Promise<StepSaveResponse> {
    const url = buildApiUrl(API_ENDPOINTS.PARTY_CREATE.REVIEW_SAVE)
    return apiClient.post<StepSaveResponse>(url, data)
  }


  // Get authorized signatory details with pagination
  async getPartyAuthorizedSignatoryDetailsPaginated(
    partyAuthorizedSignatoryId: string,
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<PartyAuthorizedSignatoryResponse>> {
    try {
      const url = buildApiUrl(
        API_ENDPOINTS.PARTY_AUTHORIZED_SIGNATORY.GET_BY_ID( partyAuthorizedSignatoryId)
      )
      const params = buildPaginationParams(page, size)
      const queryString = new URLSearchParams(params).toString()
      const finalUrl = `${url}&${queryString}`

      const result =
        await apiClient.get<PaginatedResponse<PartyAuthorizedSignatoryResponse>>(
          finalUrl
        )

      return result
    } catch (error) {
      throw error
    }
  }


  // Get fees with UI transformation

  // Get fees with pagination
 

  async getPartyByCif(cif: string): Promise<Party> {
    try {
      const params = { 'partyCifNumber.equals': cif }
      const queryString = new URLSearchParams(params).toString()
      const url = `${buildApiUrl(API_ENDPOINTS.PARTY.GET_ALL)}&${queryString}`

      const result = await apiClient.get<PaginatedResponse<Party>>(url)

      if (result?.content && result.content.length > 0) {
        const party = result.content[0]
        if (party) {
          return party
        }
      }
      throw new Error(`No party found with CIF: ${cif}`)
    } catch (error) {
      throw error
    }
  }

  // Get customer details by CIF from core bank API
  async getCustomerDetailsByCif(cif: string): Promise<{
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
  }> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.CUSTOMER_DETAILS.GET_BY_CIF(cif))

      const result = await apiClient.get<{
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
      }>(url)

      if (result) {
        return result
      }
      throw new Error(`No party details found with CIF: ${cif}`)
    } catch (error) {
      throw error
    }
  }

  async createParty(
    data: CreatePartyRequest
  ): Promise<Party> {
    try {
      const result = await apiClient.post<Party>(
        buildApiUrl(API_ENDPOINTS.PARTY.SAVE),
        data
      )

      return result
    } catch (error) {
      throw error
    }
  }

  async updateParty(
    id: string,
    updates: UpdatePartyRequest
  ): Promise<Party> {
    try {
      const result = await apiClient.put<Party>(
        buildApiUrl(API_ENDPOINTS.PARTY.UPDATE(id)),
        updates
      )

      return result
    } catch (error) {
      throw error
    }
  }

  async deleteParty(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.PARTY.SOFT_DELETE(id))
      )
    } catch (error) {
      throw error
    }
  }

  async getPartyLabels(): Promise<PartyLabel[]> {
    // Temporarily commented out - Party labels endpoint
    // return apiClient.get<PartyLabel[]>(
    //   buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.PARTY)
    // )
    
    // Return empty array for now
    return []
  }

  // Party form save methods - matching Build Partner pattern
  async savePartyDetails(
    data: PartyDetailsData,
    isEditing = false,
    partyId?: string
  ): Promise<StepSaveResponse> {
    if (isEditing && partyId) {
      // Use PUT for editing existing details - include id in data
      const url = buildApiUrl(API_ENDPOINTS.PARTY.UPDATE(partyId))
      const requestData = {
        ...data,
        id: parseInt(partyId),
      }

      const response = await apiClient.put<StepSaveResponse>(url, requestData)
      return response
    } else {
      // Use POST for creating new details - use PARTY_CREATE.DETAILS_SAVE to match Build Partner pattern
      // This endpoint returns StepSaveResponse with data.id structure
      const url = buildApiUrl(API_ENDPOINTS.PARTY_CREATE.DETAILS_SAVE)

      const response = await apiClient.post<StepSaveResponse>(url, data)
      return response
    }
  }

  async savePartyAuthorizedSignatoryDetails(
    data: PartyAuthorizedSignatoryData,
    isEditing = false,
    partyId?: string,
    authorizedSignatoryId?: string | number
  ): Promise<StepSaveResponse> {
    if (isEditing && authorizedSignatoryId) {
      // Use PUT for editing existing authorized signatory
      const url = buildApiUrl(API_ENDPOINTS.PARTY_AUTHORIZED_SIGNATORY.UPDATE(authorizedSignatoryId.toString()))
      const requestData = {
        ...data,
        id: typeof authorizedSignatoryId === 'string' ? parseInt(authorizedSignatoryId) : authorizedSignatoryId,
        partyDTO: partyId ? { id: parseInt(partyId) } : data.partyDTO,
      }
      const response = await apiClient.put<StepSaveResponse>(url, requestData)
      return response
    } else {
      // Use POST for creating new authorized signatory
      const url = buildApiUrl(API_ENDPOINTS.PARTY_AUTHORIZED_SIGNATORY.SAVE)
      const requestData = {
        ...data,
        partyDTO: partyId ? { id: parseInt(partyId) } : undefined,
      }
      const response = await apiClient.post<StepSaveResponse>(url, requestData)
      return response
    }
  }

  async deletePartyAuthorizedSignatoryDetails(partyAuthorizedSignatoryId: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.PARTY_AUTHORIZED_SIGNATORY.SOFT_DELETE(partyAuthorizedSignatoryId))
      )
    } catch (error) {
      throw error
    }
  }

  async getPartyAuthorizedSignatoryById(authorizedSignatoryId: string): Promise<PartyAuthorizedSignatoryResponse> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.PARTY_AUTHORIZED_SIGNATORY.GET_BY_ID(authorizedSignatoryId))
      const result = await apiClient.get<PartyAuthorizedSignatoryResponse>(url)
      return result
    } catch (error) {
      throw error
    }
  }



 



  // Get a specific beneficiary by ID for editing
  

  async savePartyAuthorizedSignatoryReview(
    data: PartyDetailsData
  ): Promise<StepSaveResponse> {
    const url = buildApiUrl(API_ENDPOINTS.PARTY_CREATE.REVIEW_SAVE)
    return apiClient.post<StepSaveResponse>(url, data)
  }

  // Get uploaded documents for any entity with configurable module
  async getPartyDocuments(
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
  async uploadPartyDocument(
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
  async getStepData(step: number, partyId?: string): Promise<unknown> {
    let url = buildApiUrl(
      API_ENDPOINTS.PARTY_CREATE.GET_STEP_DATA(step)
    )

    // Add developer ID as query parameter if provided
    if (partyId) {
      url += `?partyId=${encodeURIComponent(partyId)}`
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
    apiResponse: PaginatedResponse<Party>
  ): PaginatedResponse<PartyUIData> {
    return {
      content: apiResponse.content.map((item) => mapPartyToUIData(item)),
      page: apiResponse.page,
    }
  }

  // Utility method to get UI-friendly data directly
  async getPartiesUIData(
    page = 0,
    size = 20,
    filters?: PartyFilters
  ): Promise<PaginatedResponse<PartyUIData>> {
    const apiResponse = await this.getParties(page, size, filters)
    return this.transformToUIData(apiResponse)
  }


  /**
   * Search build partners by name with pagination
   * Used for autocomplete functionality
   */
  async searchBuildPartners(
    query: string,
    page = 0,
    size = 20
  ): Promise<Party[]> {
    try {
      if (!query || query.trim().length === 0) {
        return []
      }

      const params = {
        ...buildPaginationParams(page, size),
        'partyFullName.contains': query.trim(),
        'deleted.equals': 'false',
        'enabled.equals': 'true',
      }
      const url = `${buildApiUrl(API_ENDPOINTS.PARTY.SAVE)}?${new URLSearchParams(params).toString()}`
      const response = await apiClient.get(url) 
      // Handle both single object and paginated response formats
      let parties: Party[] = []

      if (Array.isArray(response)) {
        // Direct array response
        parties = response
      } else if (response && typeof response === 'object') {
        if ('content' in response && Array.isArray(response.content)) {
          // Paginated response format
          parties = response.content
        } else if ('id' in response || 'bpName' in response) {
          // Single object response - wrap in array
          parties = [response as Party]
        }
      }

      return parties
    } catch {
      throw new Error('Failed to search parties')
    }
  }

  /**
   * Find all parties using FIND_ALL endpoint
   * Used for dropdown functionality in authorized signatory step
   */
  async findAllParties(): Promise<Party[]> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.PARTY.FIND_ALL)
      const result = await apiClient.get<Party[]>(url)
      
      // Handle both array and paginated response formats
      if (Array.isArray(result)) {
        return result
      } else if (result && typeof result === 'object' && 'content' in result) {
        return (result as PaginatedResponse<Party>).content || []
      }
      
      return []
    } catch (error) {
      console.error('[PartyService] Error fetching all parties:', error)
      throw new Error('Failed to fetch parties')
    }
  }
  // Data mapping functions for fees
 


}

export const partyService = new PartyService()
