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

// Setting DTO interface for dropdown values
export interface SettingDTO {
  id: number
  settingKey: string
  settingValue: string
  languageTranslationId?: {
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
      moduleCode: string
      moduleDescription: string
      deleted: boolean
      enabled: boolean
      active: boolean
    }
    status: string | null
    enabled: boolean
    deleted: boolean
  }
  remarks?: string | null
  status: string | null
  enabled: boolean
  deleted: boolean
}

// Agreement Type DTO interface
export interface AgreementTypeDTO {
  id: number
  uuid: string
  agreementTypeName: string
  agreementTypeDescription: string
  active: boolean
  taskStatusDTO: TaskStatusDTO | null
  enabled: boolean
  deleted: boolean
}

// Agreement Sub Type DTO interface
export interface AgreementSubTypeDTO {
  id: number
  subTypeName: string
  subTypeDescription: string
  active: boolean
  agreementTypeDTO: AgreementTypeDTO | null
  taskStatusDTO: TaskStatusDTO | null
  enabled: boolean
  deleted: boolean
  uuid: string
}

// Product Program DTO interface
export interface ProductProgramDTO {
  id: number
  programName: string
  programDescription: string
  active: boolean
  taskStatusDTO: TaskStatusDTO | null
  enabled: boolean
  deleted: boolean
  uuid: string
}

// Agreement Fee Schedule types
export type AgreementFeeSchedule = AgreementFeeScheduleDTO

export interface AgreementFeeScheduleDTO {
  id: number
  effectiveStartDate: string
  effectiveEndDate: string
  operatingLocation: string
  priorityLevel: string
  transactionRateAmount: string
  debitAccountNumber: string
  creditAccountNumber: string
  active: boolean
  feeDTO: SettingDTO | null
  feeTypeDTO: SettingDTO | null
  feesFrequencyDTO: SettingDTO | null
  frequencyBasisDTO: SettingDTO | null
  agreementTypeDTO: AgreementTypeDTO | null
  agreementSubTypeDTO: AgreementSubTypeDTO | null
  productProgramDTO: ProductProgramDTO | null
  escrowAgreementDTO: string | null
  enabled: boolean
  deleted: boolean
  uuid: string
}

export interface CreateAgreementFeeScheduleRequest {
  effectiveStartDate: string
  effectiveEndDate: string
  operatingLocation: string
  priorityLevel: string
  transactionRateAmount: string
  debitAccountNumber: string
  creditAccountNumber: string
  active?: boolean
  feeDTO?: { id: number } | number | null
  feeTypeDTO?: { id: number } | number | null
  feesFrequencyDTO?: { id: number } | number | null
  frequencyBasisDTO?: { id: number } | number | null
  agreementTypeDTO?: { id: number } | number | null
  agreementSubTypeDTO?: { id: number } | number | null
  productProgramDTO?: { id: number } | number | null
  escrowAgreementDTO?: string | null
  enabled?: boolean
  deleted?: boolean
  uuid?: string
}

export interface UpdateAgreementFeeScheduleRequest {
  effectiveStartDate?: string
  effectiveEndDate?: string
  operatingLocation?: string
  priorityLevel?: string
  transactionRateAmount?: string
  debitAccountNumber?: string
  creditAccountNumber?: string
  active?: boolean
  feeDTO?: { id: number } | number | null
  feeTypeDTO?: { id: number } | number | null
  feesFrequencyDTO?: { id: number } | number | null
  frequencyBasisDTO?: { id: number } | number | null
  agreementTypeDTO?: { id: number } | number | null
  agreementSubTypeDTO?: { id: number } | number | null
  productProgramDTO?: { id: number } | number | null
  escrowAgreementDTO?: string | null
  enabled?: boolean
  deleted?: boolean
  uuid?: string
}

export interface AgreementFeeScheduleFilters {
  status?:
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'DRAFT'
  | 'INITIATED'
  name?: string
  feeScheduleId?: string
}

export interface AgreementFeeScheduleLabel {
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

export interface AgreementFeeScheduleDetailsData {
  id?: number
  effectiveStartDate: string
  effectiveEndDate: string
  operatingLocation: string
  priorityLevel: string
  transactionRateAmount: string
  debitAccountNumber: string
  creditAccountNumber: string
  active?: boolean | undefined
  feeDTO?: { id: number } | number | null | undefined
  feeTypeDTO?: { id: number } | number | null | undefined
  feesFrequencyDTO?: { id: number } | number | null | undefined
  frequencyBasisDTO?: { id: number } | number | null | undefined
  agreementTypeDTO?: { id: number } | number | null | undefined
  agreementSubTypeDTO?: { id: number } | number | null | undefined
  productProgramDTO?: { id: number } | number | null | undefined
  escrowAgreementDTO?: string | null | undefined
  enabled?: boolean | undefined
  deleted?: boolean | undefined
}

export interface AgreementFeeScheduleReviewData {
  reviewData: unknown
  termsAccepted: boolean
}

export interface AgreementFeeScheduleUIData {
  id: number
  effectiveStartDate: string
  effectiveEndDate: string
  operatingLocation: string
  priorityLevel: string
  transactionRateAmount: string
  debitAccountNumber: string
  creditAccountNumber: string
  active: boolean
  localeNames?: string
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

// Utility function to map API AgreementFeeSchedule to UI AgreementFeeScheduleUIData
export const mapAgreementFeeScheduleToUIData = (
  apiData: AgreementFeeSchedule
): AgreementFeeScheduleUIData => {
  const mapApiStatus = (enabled: boolean, deleted: boolean): string => {
    if (deleted) return 'DELETED'
    if (!enabled) return 'DISABLED'
    return 'ACTIVE'
  }

  return {
    id: apiData.id,
    effectiveStartDate: apiData.effectiveStartDate || 'N/A',
    effectiveEndDate: apiData.effectiveEndDate || 'N/A',
    operatingLocation: apiData.operatingLocation || 'N/A',
    priorityLevel: apiData.priorityLevel || 'N/A',
    transactionRateAmount: apiData.transactionRateAmount || 'N/A',
    debitAccountNumber: apiData.debitAccountNumber || 'N/A',
    creditAccountNumber: apiData.creditAccountNumber || 'N/A',
    active: apiData.active || false,
    status: mapApiStatus(apiData.enabled || false, apiData.deleted || false),
  }
}

export class AgreementFeeScheduleService {
  async getAgreementFeeSchedules(
    page = 0,
    size = 20,
    filters?: AgreementFeeScheduleFilters
  ): Promise<PaginatedResponse<AgreementFeeSchedule>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.status) {
        apiFilters.status = filters.status
      }
      if (filters.name) {
        apiFilters.operatingLocation = filters.name
      }
      if (filters.feeScheduleId) {
        apiFilters.id = filters.feeScheduleId
      }
    }
    const params = {
      ...buildPaginationParams(page, size),
      ...apiFilters,
    }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.AGREEMENT_FEE_SCHEDULE.GET_ALL)}&${queryString}`
    try {
      const result = await apiClient.get<PaginatedResponse<AgreementFeeSchedule>>(url)

      return result
    } catch (error) {
      throw error
    }
  }

  async getAgreementFeeSchedule(id: string): Promise<AgreementFeeSchedule> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.AGREEMENT_FEE_SCHEDULE.GET_BY_ID(id))
      const result = await apiClient.get<AgreementFeeSchedule>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async createAgreementFeeSchedule(
    data: CreateAgreementFeeScheduleRequest
  ): Promise<AgreementFeeSchedule> {
    try {
      const requestData: CreateAgreementFeeScheduleRequest = {
        ...data,
        enabled: data.enabled !== undefined ? data.enabled : true,
        deleted: data.deleted !== undefined ? data.deleted : false,
      }
      const result = await apiClient.post<AgreementFeeSchedule>(
        buildApiUrl(API_ENDPOINTS.AGREEMENT_FEE_SCHEDULE.SAVE),
        requestData
      )

      return result
    } catch (error) {
      throw error
    }
  }

  async updateAgreementFeeSchedule(
    id: string,
    updates: UpdateAgreementFeeScheduleRequest
  ): Promise<AgreementFeeSchedule> {
    try {
      const result = await apiClient.put<AgreementFeeSchedule>(
        buildApiUrl(API_ENDPOINTS.AGREEMENT_FEE_SCHEDULE.UPDATE(id)),
        updates
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async deleteAgreementFeeSchedule(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.AGREEMENT_FEE_SCHEDULE.SOFT_DELETE(id))
      )
    } catch (error) {
      throw error
    }
  }

  async getAgreementFeeScheduleLabels(): Promise<AgreementFeeScheduleLabel[]> {
    return apiClient.get<AgreementFeeScheduleLabel[]>(
      buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.AGREEMENT_FEE_SCHEDULE)
    )
  }

  // Agreement Fee Schedule form save methods
  async saveAgreementFeeScheduleDetails(
    data: AgreementFeeScheduleDetailsData,
    isEditing = false,
    agreementFeeScheduleId?: string
  ): Promise<AgreementFeeSchedule | StepSaveResponse> {
    if (isEditing && agreementFeeScheduleId) {
      // Use PUT for editing existing details
      const url = buildApiUrl(API_ENDPOINTS.AGREEMENT_FEE_SCHEDULE.UPDATE(agreementFeeScheduleId))
      const requestData = {
        ...data,
        id: parseInt(agreementFeeScheduleId),
        enabled: data.enabled !== undefined ? data.enabled : true,
        deleted: data.deleted !== undefined ? data.deleted : false,
      }
      const response = await apiClient.put<AgreementFeeSchedule>(url, requestData)
      return response
    } else {
      const url = buildApiUrl(API_ENDPOINTS.AGREEMENT_FEE_SCHEDULE.SAVE)
      const requestData = {
        ...data,
        enabled: true,
        deleted: false,
      }
      const response = await apiClient.post<AgreementFeeSchedule>(url, requestData)
      return response
    }
  }

  async saveAgreementFeeScheduleReview(
    data: AgreementFeeScheduleReviewData
  ): Promise<StepSaveResponse> {
    const url = buildApiUrl(API_ENDPOINTS.PARTY_CREATE.REVIEW_SAVE)
    return apiClient.post<StepSaveResponse>(url, data)
  }

  // Get uploaded documents for agreement fee schedule
  async getAgreementFeeScheduleDocuments(
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
  async uploadAgreementFeeScheduleDocument(
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
  async getStepData(step: number, agreementFeeScheduleId?: string): Promise<unknown> {
    let url = buildApiUrl(
      API_ENDPOINTS.PARTY_CREATE.GET_STEP_DATA(step)
    )

    if (agreementFeeScheduleId) {
      url += `?agreementFeeScheduleId=${encodeURIComponent(agreementFeeScheduleId)}`
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
    apiResponse: PaginatedResponse<AgreementFeeSchedule>
  ): PaginatedResponse<AgreementFeeScheduleUIData> {
    return {
      content: apiResponse.content.map((item) => mapAgreementFeeScheduleToUIData(item)),
      page: apiResponse.page,
    }
  }

  // Utility method to get UI-friendly data directly
  async getAgreementFeeSchedulesUIData(
    page = 0,
    size = 20,
    filters?: AgreementFeeScheduleFilters
  ): Promise<PaginatedResponse<AgreementFeeScheduleUIData>> {
    const apiResponse = await this.getAgreementFeeSchedules(page, size, filters)
    return this.transformToUIData(apiResponse)
  }


  async searchAgreementFeeSchedules(
    query: string,
    page = 0,
    size = 20
  ): Promise<AgreementFeeSchedule[]> {
    try {
      if (!query || query.trim().length === 0) {
        return []
      }
      const params = {
        ...buildPaginationParams(page, size),
        'operatingLocation.contains': query.trim(),
        'deleted.equals': 'false',
        'enabled.equals': 'true',
      }
      const url = `${buildApiUrl(API_ENDPOINTS.AGREEMENT_FEE_SCHEDULE.GET_ALL)}&${new URLSearchParams(params).toString()}`
      const response = await apiClient.get(url)

      let feeSchedules: AgreementFeeSchedule[] = []

      if (Array.isArray(response)) {
        feeSchedules = response
      } else if (response && typeof response === 'object') {
        if ('content' in response && Array.isArray(response.content)) {
          feeSchedules = response.content
        } else if ('id' in response || 'operatingLocation' in response) {
          feeSchedules = [response as AgreementFeeSchedule]
        }
      }
      return feeSchedules
    } catch {
      throw new Error('Failed to search agreement fee schedules')
    }
  }
}

export const agreementFeeScheduleService = new AgreementFeeScheduleService()
