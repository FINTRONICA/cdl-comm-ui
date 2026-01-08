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
export interface AgreementSignatory {
  id: number
  partyReferenceNumber: string
  partyCustomerReferenceNumber: string
  partyFullName: string
  addressLine1: string
  addressLine2: string
  addressLine3: string
  signatoryRole: string
  notificationContactName: string
  notificationAddressLine1: string
  notificationAddressLine2: string
  notificationAddressLine3: string
  notificationEmailAddress: string
  associationType: string
  isEnabled: boolean
  authorizedSignatoryDTO: unknown | null
  partyDTO: unknown | null
  escrowAgreementDTO: unknown | null
  enabled: boolean
  deleted: boolean
}
export interface CreateAgreementSignatoryRequest {
  partyReferenceNumber?: string
  partyCustomerReferenceNumber?: string
  partyFullName: string
  addressLine1: string
  addressLine2?: string
  addressLine3?: string
  signatoryRole: string
  notificationContactName?: string
  notificationAddressLine1?: string
  notificationAddressLine2?: string
  notificationAddressLine3?: string
  notificationEmailAddress?: string
  associationType?: string
  isEnabled?: boolean
  authorizedSignatoryDTO?: unknown | null
  partyDTO?: unknown | null
  escrowAgreementDTO?: unknown | null
  enabled?: boolean
  deleted?: boolean
}
export interface UpdateAgreementSignatoryRequest {
  partyReferenceNumber?: string
  partyCustomerReferenceNumber?: string
  partyFullName?: string
  addressLine1?: string
  addressLine2?: string
  addressLine3?: string
  signatoryRole?: string
  notificationContactName?: string
  notificationAddressLine1?: string
  notificationAddressLine2?: string
  notificationAddressLine3?: string
  notificationEmailAddress?: string
  associationType?: string
  isEnabled?: boolean
  authorizedSignatoryDTO?: unknown | null
  partyDTO?: unknown | null
  escrowAgreementDTO?: unknown | null
  enabled?: boolean
  deleted?: boolean
}
export interface AgreementSignatoryFilters {
  status?:
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'IN_PROGRESS'
    | 'DRAFT'
    | 'INITIATED'
  name?: string
  partyReferenceNumber?: string
}
export interface AgreementSignatoryLabel {
  id: string
  key: string
  value: string
  language: string
  category: string
}
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
export interface AgreementSignatoryDetailsData {
  partyReferenceNumber?: string | undefined
  partyCustomerReferenceNumber?: string | undefined
  partyFullName: string
  addressLine1: string
  addressLine2?: string | undefined
  addressLine3?: string | undefined
  signatoryRole: string
  notificationContactName?: string | undefined
  notificationAddressLine1?: string | undefined
  notificationAddressLine2?: string | undefined
  notificationAddressLine3?: string | undefined
  notificationEmailAddress?: string | undefined
  associationType?: string | undefined
  isEnabled?: boolean | undefined
  authorizedSignatoryDTO?: { id: number } | number | null | undefined
  partyDTO?: { id: number } | number | null | undefined
  escrowAgreementDTO?: { id: number } | number | null | undefined
  enabled?: boolean | undefined
  deleted?: boolean | undefined
}
export interface AgreementSignatoryReviewData {
  reviewData: unknown
  termsAccepted: boolean
}

// UI-friendly Agreement Signatory interface for table display
export interface AgreementSignatoryUIData {
  id: string
  partyReferenceNumber: string
  partyCustomerReferenceNumber: string
  partyFullName: string
  addressLine1: string
  addressLine2: string
  addressLine3: string
  signatoryRole: string
  notificationContactName: string
  notificationAddressLine1: string
  notificationAddressLine2: string
  notificationAddressLine3: string
  notificationEmailAddress: string
  associationType: string
  isEnabled: boolean
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

// Utility function to map API Agreement Signatory to UI Agreement SignatoryUIData
export const mapAgreementSignatoryToUIData = (
  apiData: AgreementSignatory
): AgreementSignatoryUIData => {
  return {
    id: apiData.id.toString(),
    partyReferenceNumber: apiData.partyReferenceNumber || 'N/A',
    partyCustomerReferenceNumber: apiData.partyCustomerReferenceNumber || 'N/A',
    partyFullName: apiData.partyFullName || 'N/A',
    addressLine1: apiData.addressLine1 || 'N/A',
    addressLine2: apiData.addressLine2 || 'N/A',
    addressLine3: apiData.addressLine3 || 'N/A',
    signatoryRole: apiData.signatoryRole || 'N/A',
    notificationContactName: apiData.notificationContactName || 'N/A',
    notificationAddressLine1: apiData.notificationAddressLine1 || 'N/A',
    notificationAddressLine2: apiData.notificationAddressLine2 || 'N/A',
    notificationAddressLine3: apiData.notificationAddressLine3 || 'N/A',
    notificationEmailAddress: apiData.notificationEmailAddress || 'N/A',
    associationType: apiData.associationType || 'N/A',
    isEnabled: apiData.isEnabled || false,
    localeNames: apiData.partyFullName || '---',
    status: 'INITIATED', 
  }
}

export class AgreementSignatoryService {

  async getAgreementSignatories(
    page = 0,
    size = 20,
    filters?: AgreementSignatoryFilters
  ): Promise<PaginatedResponse<AgreementSignatory>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.status) {
        const statusMapping: Record<string, string> = {
          Approved: 'CLEAR',
          'In Review': 'PENDING',
          Rejected: 'REJECTED',
          Incomplete: 'INCOMPLETE',
        }
        apiFilters.partyReferenceNumber =
          statusMapping[filters.status] || filters.status
      }
      if (filters.name) {
        apiFilters.partyFullName = filters.name
      }
      if (filters.partyReferenceNumber) {
        apiFilters.partyReferenceNumber = filters.partyReferenceNumber
      }
    }

    const params = {
      ...buildPaginationParams(page, size),
      ...apiFilters,
    }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.AGREEMENT_SIGNATORY.GET_ALL)}&${queryString}`

    try {
      const result = await apiClient.get<PaginatedResponse<AgreementSignatory>>(url)

      return result
    } catch (error) {
      throw error
    }
  }

  async getAgreementSignatory(id: string): Promise<AgreementSignatory> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.AGREEMENT_SIGNATORY.GET_BY_ID(id))
      const result = await apiClient.get<AgreementSignatory>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async getAgreementSignatoryByReferenceNumber(
    referenceNumber: string
  ): Promise<AgreementSignatory> {
    try {
      const baseUrl = buildApiUrl(API_ENDPOINTS.AGREEMENT_SIGNATORY.GET_ALL)
      const params = new URLSearchParams({ partyReferenceNumber: referenceNumber })
      const url = `${baseUrl}&${params.toString()}`
      const result = await apiClient.get<PaginatedResponse<AgreementSignatory>>(url)
      if (result?.content && result.content.length > 0) {
        const agreementSignatory = result.content[0]
        if (agreementSignatory) {
          return agreementSignatory
        }
      }
      throw new Error(`No agreement signatory found with reference number: ${referenceNumber}`)
    } catch (error) {
      throw error
    }
  }

  async createAgreementSignatory(
    data: CreateAgreementSignatoryRequest
  ): Promise<AgreementSignatory> {
    try {
      const requestData: CreateAgreementSignatoryRequest = {
        ...data,
        enabled: data.enabled !== undefined ? data.enabled : true,
        deleted: data.deleted !== undefined ? data.deleted : false,
        isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
      }
      const result = await apiClient.post<AgreementSignatory>(
        buildApiUrl(API_ENDPOINTS.AGREEMENT_SIGNATORY.SAVE),
        requestData
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async updateAgreementSignatory(
    id: string,
    updates: UpdateAgreementSignatoryRequest
  ): Promise<AgreementSignatory> {
    try {
      const result = await apiClient.put<AgreementSignatory>(
        buildApiUrl(API_ENDPOINTS.AGREEMENT_SIGNATORY.UPDATE(id)),
        updates
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async deleteAgreementSignatory(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.AGREEMENT_SIGNATORY.SOFT_DELETE(id))
      )
    } catch (error) {
      throw error
    }
  }

  async getAgreementSignatoryLabels(): Promise<AgreementSignatoryLabel[]> {
    return apiClient.get<AgreementSignatoryLabel[]>(
      buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.ESCROW_AGREEMENT)
    )
  }

  // Agreement Signatory form save methods
  async saveAgreementSignatoryDetails(
    data: AgreementSignatoryDetailsData,
    isEditing = false,
    agreementSignatoryId?: string
  ): Promise<AgreementSignatory | StepSaveResponse> {
    if (isEditing && agreementSignatoryId) {
      const url = buildApiUrl(API_ENDPOINTS.AGREEMENT_SIGNATORY.UPDATE(agreementSignatoryId))
      const requestData = {
        ...data,
        id: parseInt(agreementSignatoryId),
        enabled: data.enabled !== undefined ? data.enabled : true,
        deleted: data.deleted !== undefined ? data.deleted : false,
        isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
      }

      const response = await apiClient.put<AgreementSignatory>(url, requestData)
      return response
    } else {
      const url = buildApiUrl(API_ENDPOINTS.AGREEMENT_SIGNATORY.SAVE)
      const requestData = {
        ...data,
        enabled: data.enabled !== undefined ? data.enabled : true,
        deleted: data.deleted !== undefined ? data.deleted : false,
        isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
      }

      const response = await apiClient.post<AgreementSignatory>(url, requestData)
      return response
    }
  }

  async saveAgreementSignatoryReview(
    _data: AgreementSignatoryReviewData
  ): Promise<StepSaveResponse> {
    // Implementation for review step if needed
    return {
      success: true,
      message: 'Review saved successfully',
    }
  }

  async getAgreementSignatoryDocuments(
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

  async uploadAgreementSignatoryDocument(
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

  async getStepData(_step: number, agreementSignatoryId?: string): Promise<unknown> {
    if (!agreementSignatoryId) {
      return {}
    }
    const agreementSignatory = await this.getAgreementSignatory(agreementSignatoryId)    
    return {
      partyReferenceNumber: agreementSignatory.partyReferenceNumber,
      partyCustomerReferenceNumber: agreementSignatory.partyCustomerReferenceNumber,
      partyFullName: agreementSignatory.partyFullName,
      addressLine1: agreementSignatory.addressLine1,
      addressLine2: agreementSignatory.addressLine2,
      addressLine3: agreementSignatory.addressLine3,
      signatoryRole: agreementSignatory.signatoryRole,
      notificationContactName: agreementSignatory.notificationContactName,
      notificationAddressLine1: agreementSignatory.notificationAddressLine1,
      notificationAddressLine2: agreementSignatory.notificationAddressLine2,
      notificationAddressLine3: agreementSignatory.notificationAddressLine3,
      notificationEmailAddress: agreementSignatory.notificationEmailAddress,
      associationType: agreementSignatory.associationType,
      isEnabled: agreementSignatory.isEnabled,
    }
  }

  async validateStep(): Promise<StepValidationResponse> {
    // Basic validation - can be enhanced with server-side validation
    return {
      isValid: true,
      errors: [],
      warnings: [],
    }
  }

  transformToUIData(
    apiResponse: PaginatedResponse<AgreementSignatory>
  ): PaginatedResponse<AgreementSignatoryUIData> {
    return {
      ...apiResponse,
      content: apiResponse.content.map(mapAgreementSignatoryToUIData),
    }
  }

  async getAgreementSignatoriesUIData(
    page = 0,
    size = 20,
    filters?: AgreementSignatoryFilters
  ): Promise<PaginatedResponse<AgreementSignatoryUIData>> {
    const response = await this.getAgreementSignatories(page, size, filters)
    return this.transformToUIData(response)
  }

  async searchAgreementSignatories(
    query: string,
    page = 0,
    size = 20
  ): Promise<AgreementSignatory[]> {
    const filters: AgreementSignatoryFilters = {
      name: query,
    }
    const response = await this.getAgreementSignatories(page, size, filters)
    return response.content
  }
}

export const agreementSignatoryService = new AgreementSignatoryService()

