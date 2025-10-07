import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'

// Fee Repush (Real Estate Asset Fee History) types - Updated to match actual API response
export interface FeeRepushRecord {
  id: number
  reafhAmount: number | null
  reafhTotalAmount: number | null
  reafhVatPercentage: number | null
  reafhTransactionDate: string | null
  reafhSuccess: boolean | null
  reafhStatus: boolean | null
  reahfRemark: string | null
  reafhFeeResponse: string | null
  reafhResponseStatus: string | null
  reafhSpecialField1: string | null
  reafhSpecialField2: string | null
  reafhSpecialField3: string | null
  reafhSpecialField4: string | null
  reafhSpecialField5: string | null
  reafhFeeRequestBody: string | null
  realEstateAssestFeeDTO: any | null
  realEstateAssestDTO: {
    id?: number
    reaId?: string
    reaCif?: string
    reaName?: string
    reaNameLocal?: string
    reaLocation?: string
    reaReraNumber?: string
    reaStartDate?: string
    reaCompletionDate?: string
    reaPercentComplete?: string
    reaConstructionCost?: number
    reaAccStatusDate?: string
    reaRegistrationDate?: string
    reaNoOfUnits?: number
    reaRemarks?: string
    reaSpecialApproval?: string
    reaManagedBy?: string
    reaBackupUser?: string
    reaRetentionPercent?: string
    reaAdditionalRetentionPercent?: string
    reaTotalRetentionPercent?: string
    reaRetentionEffectiveDate?: string
    reaManagementExpenses?: string
    reaMarketingExpenses?: string
    reaAccoutStatusDate?: string
    reaTeamLeadName?: string
    reaRelationshipManagerName?: string
    reaAssestRelshipManagerName?: string
    reaRealEstateBrokerExp?: number
    reaAdvertisementExp?: number
    reaLandOwnerName?: string
    buildPartnerDTO?: any
    reaStatusDTO?: any
    reaTypeDTO?: any
    reaAccountStatusDTO?: any
    reaConstructionCostCurrencyDTO?: any
    status?: any
    reaBlockPaymentTypeDTO?: any
    deleted?: boolean
    taskStatusDTO?: any
  } | null
  deleted: boolean | null
}

export interface FeeRepushFilters {
  projectName?: string
  feeType?: string
  amount?: number
  minAmount?: number
  maxAmount?: number
  transactionDate?: string
  fromDate?: string
  toDate?: string
  approvalStatus?: string
  paymentType?: string
  paymentRefNo?: string
  tasRefNo?: string
  failureReason?: string
  isActive?: boolean
  currency?: string
}

// Fee Repush Request interface
export interface FeeRepushRequest {
  remarks?: string
  forceRepush?: boolean
}

// Fee Repush Response interface (extends the standard record)
export interface FeeRepushResponse extends FeeRepushRecord {
  repushTimestamp?: string
  repushStatus?: 'SUCCESS' | 'FAILED' | 'PENDING'
  repushMessage?: string
}

export interface FeeRepushUIData {
  id: string
  projectName: string
  feeType: string
  amount: string
  transactionDate: string
  approvalStatus: string
  paymentType: string
  paymentRefNo: string
  tasRefNo: string
  narration: string
  description: string
  remark: string
  failureReason: string
  retryCount: string
  createdDate: string
  updatedDate: string
  createdBy: string
  updatedBy: string
  currency: string
  totalAmount: string
  isActive: string
  // Additional fields for expandable content
  feaHistoryId?: string
  specialField1?: string
  specialField2?: string
}

export interface CreateFeeRepushRequest {
  feaHistoryProjectName: string
  feaHistoryFeeType: string
  feaHistoryAmount: number
  feaHistoryTransactionDate: string
  feaHistoryApprovalStatus: string
  feaHistoryPaymentType: string
  feaHistoryNarration?: string
  feaHistoryDescription?: string
  feaHistoryCurrency?: string
}

export interface UpdateFeeRepushRequest {
  feaHistoryProjectName?: string
  feaHistoryFeeType?: string
  feaHistoryAmount?: number
  feaHistoryTransactionDate?: string
  feaHistoryApprovalStatus?: string
  feaHistoryPaymentType?: string
  feaHistoryNarration?: string
  feaHistoryDescription?: string
  feaHistoryCurrency?: string
  feaHistoryFailureReason?: string
  feaHistoryRetryCount?: number
  feaHistoryIsActive?: boolean
}

export const mapFeeRepushToUIData = (
  apiData: FeeRepushRecord
): FeeRepushUIData => {
  const formatAmount = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '0.00'
    return value.toFixed(2)
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  // Determine status based on API response fields
  const getStatus = (): string => {
    if (apiData.reafhResponseStatus) {
      return apiData.reafhResponseStatus
    }
    if (apiData.reafhSuccess === true) {
      return 'SUCCESS'
    }
    if (apiData.reafhSuccess === false) {
      return 'FAILED'
    }
    if (apiData.reafhStatus === true) {
      return 'ACTIVE'
    }
    if (apiData.reafhStatus === false) {
      return 'INACTIVE'
    }
    return 'UNKNOWN'
  }

  // Determine payment type from available data
  const getPaymentType = (): string => {
    // For now, we'll return a default value since payment type isn't in the API response
    // This could be enhanced based on business logic or additional API data
    return 'Bank Transfer'
  }

  return {
    id: String(apiData.id),
    projectName: apiData.realEstateAssestDTO?.reaName || '—',
    feeType: 'Fee Processing', // Default since feeType not in API response
    amount: apiData.reafhAmount ? formatAmount(apiData.reafhAmount) : '—',
    transactionDate: formatDate(apiData.reafhTransactionDate),
    approvalStatus: getStatus(),
    paymentType: getPaymentType(),
    paymentRefNo: '—', // Not available in current API response
    tasRefNo: '—', // Not available in current API response
    narration: apiData.reahfRemark || '—',
    description: apiData.reafhFeeResponse || '—',
    remark: apiData.reahfRemark || '—',
    failureReason:
      apiData.reafhSuccess === false
        ? apiData.reahfRemark || 'Payment Failed'
        : '—',
    retryCount: '0', // Not available in current API response
    createdDate: formatDateTime(apiData.reafhTransactionDate), // Using transaction date as created date
    updatedDate: formatDateTime(apiData.reafhTransactionDate), // Using transaction date as updated date
    createdBy: '—', // Not available in current API response
    updatedBy: '—', // Not available in current API response
    currency: 'AED', // Default currency
    totalAmount: apiData.reafhTotalAmount
      ? formatAmount(apiData.reafhTotalAmount)
      : '—',
    isActive:
      apiData.reafhStatus !== null ? (apiData.reafhStatus ? 'Yes' : 'No') : '—',
    feaHistoryId: String(apiData.id),
    specialField1: apiData.reafhSpecialField1 || '—',
    specialField2: apiData.reafhSpecialField2 || '—',
  }
}

export class FeeRepushService {
  async createFeeRepush(
    data: Partial<FeeRepushRecord>
  ): Promise<FeeRepushRecord> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.REAL_ESTATE_ASSET_FEE_HISTORY.SAVE)
      const result = await apiClient.post<FeeRepushRecord>(url, data)
      return result
    } catch (error) {
      throw error
    }
  }

  async updateFeeRepush(
    id: string,
    updates: Partial<FeeRepushRecord>
  ): Promise<FeeRepushRecord> {
    try {
      const url = buildApiUrl(
        API_ENDPOINTS.REAL_ESTATE_ASSET_FEE_HISTORY.UPDATE(id)
      )
      const result = await apiClient.put<FeeRepushRecord>(url, updates)
      return result
    } catch (error) {
      throw error
    }
  }

  async deleteFeeRepush(id: string): Promise<void> {
    try {
      const url = buildApiUrl(
        API_ENDPOINTS.REAL_ESTATE_ASSET_FEE_HISTORY.DELETE(id)
      )
      await apiClient.delete(url)
    } catch (error) {
      throw error
    }
  }

  async getFeeRepushRecords(
    page = 0,
    size = 20,
    filters?: FeeRepushFilters
  ): Promise<PaginatedResponse<FeeRepushRecord>> {
    const apiFilters: Record<string, any> = {}
    if (filters) {
      // Map filters to actual API field names
      if (filters.projectName) {
        // Since project name is nested in realEstateAssestDTO.reaName, we might need a different approach
        // For now, we'll skip project name filtering until we know the correct API parameter
      }
      if (filters.minAmount !== undefined)
        apiFilters['reafhAmount.greaterThanOrEqual'] = String(filters.minAmount)
      if (filters.maxAmount !== undefined)
        apiFilters['reafhAmount.lessThanOrEqual'] = String(filters.maxAmount)
      if (filters.fromDate)
        apiFilters['reafhTransactionDate.greaterThanOrEqual'] = filters.fromDate
      if (filters.toDate)
        apiFilters['reafhTransactionDate.lessThanOrEqual'] = filters.toDate
      if (filters.isActive !== undefined)
        apiFilters['reafhStatus.equals'] = String(filters.isActive)

      // Add success/failure status filtering
      if (filters.approvalStatus) {
        if (filters.approvalStatus.toLowerCase() === 'success') {
          apiFilters['reafhSuccess.equals'] = 'true'
        } else if (filters.approvalStatus.toLowerCase() === 'failed') {
          apiFilters['reafhSuccess.equals'] = 'false'
        } else if (filters.approvalStatus.toLowerCase() === 'active') {
          apiFilters['reafhStatus.equals'] = 'true'
        } else if (filters.approvalStatus.toLowerCase() === 'inactive') {
          apiFilters['reafhStatus.equals'] = 'false'
        }
      }
    }

    // Add pagination parameters
    apiFilters['page'] = String(page)
    apiFilters['size'] = String(size)

    const queryString = new URLSearchParams(apiFilters).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.REAL_ESTATE_ASSET_FEE_HISTORY.GET_ALL)}?${queryString}`


    try {
      const paginatedResult = await apiClient.get<PaginatedResponse<FeeRepushRecord>>(url)

      // Ensure the response has the expected paginated structure
      if (!paginatedResult || typeof paginatedResult !== 'object') {
        throw new Error('API returned invalid paginated response')
      }

      if (!Array.isArray(paginatedResult.content)) {
        throw new Error('API paginated response content is not an array')
      }

      if (!paginatedResult.page || typeof paginatedResult.page !== 'object') {
        throw new Error('API paginated response missing page information')
      }


      return paginatedResult
    } catch (error) {
      throw error
    }
  }

  async getFeeRepushRecord(id: string): Promise<FeeRepushRecord> {
    try {
      const result = await apiClient.get<FeeRepushRecord>(
        buildApiUrl(API_ENDPOINTS.REAL_ESTATE_ASSET_FEE_HISTORY.GET_BY_ID(id))
      )
      return result
    } catch (error) {
      throw error
    }
  }

  // UI helper to transform API response to UI-friendly format
  transformToUIData(
    apiResponse: PaginatedResponse<FeeRepushRecord>
  ): PaginatedResponse<FeeRepushUIData> {
    return {
      content: apiResponse.content.map((item) => mapFeeRepushToUIData(item)),
      page: apiResponse.page,
    }
  }

  async getFeeRepushUIData(
    page = 0,
    size = 20,
    filters?: FeeRepushFilters
  ): Promise<PaginatedResponse<FeeRepushUIData>> {

    const apiResponse = await this.getFeeRepushRecords(page, size, filters)


    const transformedData = this.transformToUIData(apiResponse)


    return transformedData
  }

  // Retry fee payment functionality (legacy method using UPDATE endpoint)
  async retryFeePayment(id: string): Promise<FeeRepushRecord> {
    try {
      // Update the record to mark as pending retry
      const updatedRecord = await this.updateFeeRepush(id, {
        reafhResponseStatus: 'PENDING_RETRY',
        reafhSuccess: null, // Reset success status
        reahfRemark: 'Payment retry initiated',
      })


      return updatedRecord
    } catch (error) {
      throw error
    }
  }

  // Fee repush functionality using dedicated endpoint
  // Usage examples:
  // - Basic repush: await feeRepushService.feeRepush('123')
  // - With custom remarks: await feeRepushService.feeRepush('123', { remarks: 'Manual retry' })
  // - Force repush: await feeRepushService.feeRepush('123', { forceRepush: true })
  async feeRepush(id: string, request?: FeeRepushRequest): Promise<FeeRepushResponse> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.REAL_ESTATE_ASSET_FEE_HISTORY.FEE_REPUSH(id))
      const requestBody: FeeRepushRequest = {
        remarks: request?.remarks || 'Fee repush initiated via dedicated endpoint',
        forceRepush: request?.forceRepush || false,
        ...request
      }
      const result = await apiClient.put<FeeRepushResponse>(url, requestBody)
      return result
    } catch (error) {
      console.error('Fee repush failed:', error)
      throw error
    }
  }
}

export const feeRepushService = new FeeRepushService()
