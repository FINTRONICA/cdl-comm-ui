import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'

export interface ProcessedTransaction {
  id: number
  reconTransactionId: string | null
  transactionAmount: number | null
  totalTransactionAmount: number | null
  transactionDateTime: string | null
  transactionNarration: string | null
  transactionDescription: string | null
  processingRemarks: string | null
  allocatedFlag: boolean | null
  transactionParticular1: string | null
  transactionParticular2: string | null
  transactionParticularRemark1: string | null
  transactionParticularRemark2: string | null
  chequeReferenceNumber: string | null
  tasUpdateRequestedFlag: boolean | null
  tasUpdateAppliedFlag: boolean | null
  tasUpdateEnabledFlag: boolean | null
  unitReferenceNumber: string | null
  tasPaymentStatusCode: string | null
  batchTransactionId: string | null
  reconciliationResponsePayload: string | null
  rollbackFlag: boolean | null
  coreBankingResponsePayload: string | null
  paymentReferenceNumber: string | null
  subBucketIdentifier: string | null
  escrowAgreementDTO: Record<string, unknown> | null
  bucketTypeDTO: Record<string, unknown> | null
  subBucketTypeDTO: Record<string, unknown> | null
  depositModeDTO: Record<string, unknown> | null
  escrowAccountDTO: Record<string, unknown> | null
  nonReconTransactionDTO: Record<string, unknown> | null
  taskStatusDTO: Record<string, unknown> | null
  enabled: boolean | null
  deleted: boolean | null
  // Legacy fields for backward compatibility
  pfiTransactionId?: string | null
  pfiTransactionRefId?: string | null
  pfiAmount?: number | null
  pfiTotalAmount?: number | null
  pfiTransactionDate?: string | null
  pfiNarration?: string | null
  pfiDescription?: string | null
  pfiIsAllocated?: boolean | null
  pfiUnitRefNumber?: string | null
  pfiTasPaymentStatus?: string | null
  pfiTasUpdate?: boolean | null
  pfiCheckNumber?: string | null
  pfiPaymentRefNo?: string | null
  realEstateAssestDTO?: {
    id?: number
    reaName?: string
    reaId?: string
    reaCif?: string
    reaUnitNumber?: string
    reaDeveloperName?: string
    reaOqoodFormat?: string
  } | null
  capitalPartnerUnitDTO?: Record<string, unknown> | null
}

export interface ProcessedTransactionFilters {
  transactionId?: string
  reconTransactionId?: string
  referenceId?: string
  minAmount?: number
  maxAmount?: number
  currencyCode?: string
  isAllocated?: boolean
  allocatedFlag?: boolean
  discard?: boolean
  rollbackFlag?: boolean
  paymentStatus?: string
  tasPaymentStatusCode?: string
  unitRefNumber?: string
  unitReferenceNumber?: string
  fromDate?: string
  toDate?: string
  transactionDateTime?: string
  projectName?: string
  developerName?: string
  projectRegulatorId?: string
  unitNumber?: string
  tasUpdateRequestedFlag?: boolean
  tasUpdateAppliedFlag?: boolean
  tasUpdateEnabledFlag?: boolean
  batchTransactionId?: string
  paymentReferenceNumber?: string
  chequeReferenceNumber?: string
}

export interface ProcessedTransactionUIData {
  id: string
  date: string
  transId: string
  projectAccountId: string
  developerName: string
  projectName: string
  projectRegulatorId: string
  unitNo: string
  receivableCategory: string
  tasCbsMatch: string
  amount: string
  narration: string
  totalAmount: string
  currency: string
  description: string
  paymentStatus: string
  allocated: string
  valueDate?: string
  postedDate?: string
  branchCode?: string
  checkNumber?: string
  retentionAmount?: string
  // Additional fields from new API structure
  processingRemarks?: string
  transactionParticular1?: string
  transactionParticular2?: string
  transactionParticularRemark1?: string
  transactionParticularRemark2?: string
  chequeReferenceNumber?: string
  paymentReferenceNumber?: string
  subBucketIdentifier?: string
  batchTransactionId?: string
  tasUpdateRequestedFlag?: boolean
  tasUpdateAppliedFlag?: boolean
  tasUpdateEnabledFlag?: boolean
}

export interface CreateProcessedTransactionRequest {
  reconTransactionId: string
  transactionAmount: number
  totalTransactionAmount: number
  transactionDateTime: string
  transactionNarration?: string
  transactionDescription?: string
  processingRemarks?: string
  allocatedFlag?: boolean
  transactionParticular1?: string
  transactionParticular2?: string
  transactionParticularRemark1?: string
  transactionParticularRemark2?: string
  chequeReferenceNumber?: string
  tasUpdateRequestedFlag?: boolean
  tasUpdateEnabledFlag?: boolean
  unitReferenceNumber?: string
  tasPaymentStatusCode?: string
  batchTransactionId?: string
  paymentReferenceNumber?: string
  subBucketIdentifier?: string
  escrowAgreementDTO?: Record<string, unknown>
  bucketTypeDTO?: Record<string, unknown>
  subBucketTypeDTO?: Record<string, unknown>
  depositModeDTO?: Record<string, unknown>
  escrowAccountDTO?: Record<string, unknown>
  taskStatusDTO?: Record<string, unknown>
  enabled?: boolean
  // Legacy fields for backward compatibility
  pfiTransactionId?: string
  pfiTransactionRefId?: string
  pfiAmount?: number
  pfiTotalAmount?: number
  pfiTransactionDate?: string
  pfiNarration?: string
  pfiDescription?: string
}

export interface UpdateProcessedTransactionRequest {
  reconTransactionId?: string
  transactionAmount?: number
  totalTransactionAmount?: number
  transactionDateTime?: string
  transactionNarration?: string
  transactionDescription?: string
  processingRemarks?: string
  allocatedFlag?: boolean
  transactionParticular1?: string
  transactionParticular2?: string
  transactionParticularRemark1?: string
  transactionParticularRemark2?: string
  chequeReferenceNumber?: string
  tasUpdateRequestedFlag?: boolean
  tasUpdateAppliedFlag?: boolean
  tasUpdateEnabledFlag?: boolean
  unitReferenceNumber?: string
  tasPaymentStatusCode?: string
  batchTransactionId?: string
  paymentReferenceNumber?: string
  subBucketIdentifier?: string
  rollbackFlag?: boolean
  escrowAgreementDTO?: Record<string, unknown>
  bucketTypeDTO?: Record<string, unknown>
  subBucketTypeDTO?: Record<string, unknown>
  depositModeDTO?: Record<string, unknown>
  escrowAccountDTO?: Record<string, unknown>
  taskStatusDTO?: Record<string, unknown>
  enabled?: boolean
  deleted?: boolean
  // Legacy fields for backward compatibility
  pfiTransactionId?: string
  pfiTransactionRefId?: string
  pfiAmount?: number
  pfiTotalAmount?: number
  pfiTransactionDate?: string
  pfiNarration?: string
  pfiDescription?: string
  pfiIsAllocated?: boolean
  pfiDiscard?: boolean
}

export const mapProcessedTransactionToUIData = (
  apiData: ProcessedTransaction
): ProcessedTransactionUIData => {
  const formatAmount = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '0.00'
    return value.toFixed(2)
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  // Use new API fields, fallback to legacy fields for backward compatibility
  const transactionDate =
    apiData.transactionDateTime ||
    apiData.pfiTransactionDate ||
    null
  const transactionId =
    apiData.reconTransactionId ||
    apiData.pfiTransactionId ||
    apiData.pfiTransactionRefId ||
    '—'
  const amount =
    apiData.transactionAmount !== null && apiData.transactionAmount !== undefined
      ? apiData.transactionAmount
      : apiData.pfiAmount
  const totalAmount =
    apiData.totalTransactionAmount !== null &&
    apiData.totalTransactionAmount !== undefined
      ? apiData.totalTransactionAmount
      : apiData.pfiTotalAmount
  const narration =
    apiData.transactionNarration || apiData.pfiNarration || '—'
  const description =
    apiData.transactionDescription || apiData.pfiDescription || '—'
  const allocated =
    apiData.allocatedFlag !== null && apiData.allocatedFlag !== undefined
      ? apiData.allocatedFlag
      : apiData.pfiIsAllocated
  const unitRefNumber =
    apiData.unitReferenceNumber ||
    apiData.pfiUnitRefNumber ||
    apiData.realEstateAssestDTO?.reaUnitNumber ||
    apiData.realEstateAssestDTO?.reaOqoodFormat ||
    '—'
  const paymentStatus =
    apiData.tasPaymentStatusCode || apiData.pfiTasPaymentStatus || '—'
  const tasUpdate =
    apiData.tasUpdateAppliedFlag !== null &&
    apiData.tasUpdateAppliedFlag !== undefined
      ? apiData.tasUpdateAppliedFlag
      : apiData.tasUpdateEnabledFlag !== null &&
          apiData.tasUpdateEnabledFlag !== undefined
        ? apiData.tasUpdateEnabledFlag
        : apiData.pfiTasUpdate
  const chequeNumber =
    apiData.chequeReferenceNumber || apiData.pfiCheckNumber || '—'
  const paymentRefNo =
    apiData.paymentReferenceNumber || apiData.pfiPaymentRefNo || '—'

  return {
    id: String(apiData.id),
    date: formatDateTime(transactionDate),
    transId: transactionId,
    projectAccountId: apiData.realEstateAssestDTO?.reaCif || '—',
    developerName: apiData.realEstateAssestDTO?.reaDeveloperName || '—',
    projectName: apiData.realEstateAssestDTO?.reaName || '—',
    projectRegulatorId: apiData.realEstateAssestDTO?.reaId || '—',
    unitNo: unitRefNumber,
    receivableCategory:
      (apiData.bucketTypeDTO as { name?: string } | null)?.name ||
      (apiData.subBucketTypeDTO as { name?: string } | null)?.name ||
      '—',
    tasCbsMatch: tasUpdate ? 'Yes' : 'No',
    amount: amount !== null && amount !== undefined ? formatAmount(amount) : '—',
    narration: narration,
    totalAmount:
      totalAmount !== null && totalAmount !== undefined
        ? formatAmount(totalAmount)
      : '—',
    currency: 'AED', // Default currency, update if API provides currency field
    description: description,
    paymentStatus: paymentStatus,
    allocated:
      allocated !== null ? (allocated ? 'Yes' : 'No') : '—',
    valueDate: formatDate(transactionDate),
    postedDate: formatDate(transactionDate),
    branchCode: '—', // Update if API provides branch code
    checkNumber: chequeNumber,
    retentionAmount: '—', // Update if API provides retention amount
    // Additional fields from new API structure
    processingRemarks: apiData.processingRemarks || '—',
    transactionParticular1: apiData.transactionParticular1 || '—',
    transactionParticular2: apiData.transactionParticular2 || '—',
    transactionParticularRemark1: apiData.transactionParticularRemark1 || '—',
    transactionParticularRemark2: apiData.transactionParticularRemark2 || '—',
    chequeReferenceNumber: chequeNumber,
    paymentReferenceNumber: paymentRefNo,
    subBucketIdentifier: apiData.subBucketIdentifier || '—',
    batchTransactionId: apiData.batchTransactionId || '—',
    tasUpdateRequestedFlag: apiData.tasUpdateRequestedFlag ?? false,
    tasUpdateAppliedFlag: apiData.tasUpdateAppliedFlag ?? false,
    tasUpdateEnabledFlag: apiData.tasUpdateEnabledFlag ?? false,
  }
}

export class ProcessedTransactionService {
  async createProcessedTransaction(
    data: Partial<ProcessedTransaction>
  ): Promise<ProcessedTransaction> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.RECONCILED_TRANSACTION.SAVE)
      const result = await apiClient.post<ProcessedTransaction>(url, data)
      return result
    } catch (error) {
      throw error
    }
  }

  async updateProcessedTransaction(
    id: string,
    updates: Partial<ProcessedTransaction>
  ): Promise<ProcessedTransaction> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.RECONCILED_TRANSACTION.UPDATE(id))
      const result = await apiClient.put<ProcessedTransaction>(url, updates)
      return result
    } catch (error) {
      throw error
    }
  }

  async deleteProcessedTransaction(id: string): Promise<void> {
    try {
      const url = buildApiUrl(
        API_ENDPOINTS.RECONCILED_TRANSACTION.SOFT_DELETE(id)
      )
      await apiClient.delete(url)
    } catch (error) {
      throw error
    }
  }

  async getProcessedTransactions(
    page = 0,
    size = 20,
    filters?: ProcessedTransactionFilters
  ): Promise<PaginatedResponse<ProcessedTransaction>> {
    const queryParams: string[] = []
    
    // Add pagination
    queryParams.push(`page=${page}`)
    queryParams.push(`size=${size}`)

    if (filters) {
      // New API fields - use .equals format for boolean filters to match API pattern
      if (filters.reconTransactionId)
        queryParams.push(`reconTransactionId.equals=${encodeURIComponent(filters.reconTransactionId)}`)
      if (filters.transactionId && !filters.reconTransactionId)
        queryParams.push(`reconTransactionId.equals=${encodeURIComponent(filters.transactionId)}`)
      if (filters.referenceId && !filters.reconTransactionId && !filters.transactionId)
        queryParams.push(`reconTransactionId.equals=${encodeURIComponent(filters.referenceId)}`)
      
      if (filters.minAmount !== undefined)
        queryParams.push(`transactionAmount.greaterThanOrEqual=${filters.minAmount}`)
      if (filters.maxAmount !== undefined)
        queryParams.push(`transactionAmount.lessThanOrEqual=${filters.maxAmount}`)
      
      // Boolean filters use .equals format
      if (filters.allocatedFlag !== undefined)
        queryParams.push(`allocatedFlag.equals=${filters.allocatedFlag}`)
      if (filters.isAllocated !== undefined && filters.allocatedFlag === undefined)
        queryParams.push(`allocatedFlag.equals=${filters.isAllocated}`)
      
      if (filters.rollbackFlag !== undefined)
        queryParams.push(`rollbackFlag.equals=${filters.rollbackFlag}`)
      if (filters.tasUpdateRequestedFlag !== undefined)
        queryParams.push(`tasUpdateRequestedFlag.equals=${filters.tasUpdateRequestedFlag}`)
      if (filters.tasUpdateAppliedFlag !== undefined)
        queryParams.push(`tasUpdateAppliedFlag.equals=${filters.tasUpdateAppliedFlag}`)
      if (filters.tasUpdateEnabledFlag !== undefined)
        queryParams.push(`tasUpdateEnabledFlag.equals=${filters.tasUpdateEnabledFlag}`)
      
      if (filters.paymentStatus)
        queryParams.push(`tasPaymentStatusCode.equals=${encodeURIComponent(filters.paymentStatus)}`)
      if (filters.tasPaymentStatusCode && !filters.paymentStatus)
        queryParams.push(`tasPaymentStatusCode.equals=${encodeURIComponent(filters.tasPaymentStatusCode)}`)
      
      if (filters.unitReferenceNumber)
        queryParams.push(`unitReferenceNumber.equals=${encodeURIComponent(filters.unitReferenceNumber)}`)
      if (filters.unitRefNumber && !filters.unitReferenceNumber)
        queryParams.push(`unitReferenceNumber.equals=${encodeURIComponent(filters.unitRefNumber)}`)
      
      if (filters.fromDate)
        queryParams.push(`transactionDateTime.greaterThanOrEqual=${encodeURIComponent(filters.fromDate)}`)
      if (filters.toDate)
        queryParams.push(`transactionDateTime.lessThanOrEqual=${encodeURIComponent(filters.toDate)}`)
      if (filters.transactionDateTime && !filters.fromDate && !filters.toDate)
        queryParams.push(`transactionDateTime.equals=${encodeURIComponent(filters.transactionDateTime)}`)
      
      if (filters.batchTransactionId)
        queryParams.push(`batchTransactionId.equals=${encodeURIComponent(filters.batchTransactionId)}`)
      if (filters.paymentReferenceNumber)
        queryParams.push(`paymentReferenceNumber.equals=${encodeURIComponent(filters.paymentReferenceNumber)}`)
      if (filters.chequeReferenceNumber)
        queryParams.push(`chequeReferenceNumber.equals=${encodeURIComponent(filters.chequeReferenceNumber)}`)
      
      // Legacy fields for backward compatibility (only if new fields not provided)
      if (filters.transactionId && !filters.reconTransactionId)
        queryParams.push(`pfiTransactionId.equals=${encodeURIComponent(filters.transactionId)}`)
      if (filters.referenceId && !filters.reconTransactionId && !filters.transactionId)
        queryParams.push(`pfiTransactionRefId.equals=${encodeURIComponent(filters.referenceId)}`)
      
      if (filters.minAmount !== undefined && !queryParams.some(p => p.includes('transactionAmount.greaterThanOrEqual')))
        queryParams.push(`pfiAmount.greaterThanOrEqual=${filters.minAmount}`)
      if (filters.maxAmount !== undefined && !queryParams.some(p => p.includes('transactionAmount.lessThanOrEqual')))
        queryParams.push(`pfiAmount.lessThanOrEqual=${filters.maxAmount}`)
      
      if (filters.currencyCode)
        queryParams.push(`pfiCurrencyCode.equals=${encodeURIComponent(filters.currencyCode)}`)
      
      if (filters.paymentStatus && !queryParams.some(p => p.includes('tasPaymentStatusCode')))
        queryParams.push(`pfiTasPaymentStatus.equals=${encodeURIComponent(filters.paymentStatus)}`)
      
      if (filters.unitRefNumber && !queryParams.some(p => p.includes('unitReferenceNumber')))
        queryParams.push(`pfiUnitRefNumber.equals=${encodeURIComponent(filters.unitRefNumber)}`)
      
      if (filters.fromDate && !queryParams.some(p => p.includes('transactionDateTime.greaterThanOrEqual')))
        queryParams.push(`pfiTransactionDate.greaterThanOrEqual=${encodeURIComponent(filters.fromDate)}`)
      if (filters.toDate && !queryParams.some(p => p.includes('transactionDateTime.lessThanOrEqual')))
        queryParams.push(`pfiTransactionDate.lessThanOrEqual=${encodeURIComponent(filters.toDate)}`)
    }

    const queryString = queryParams.join('&')
    const url = `${buildApiUrl(API_ENDPOINTS.RECONCILED_TRANSACTION.GET_ALL)}${queryString ? `&${queryString}` : ''}`

    try {
      const result =
        await apiClient.get<PaginatedResponse<ProcessedTransaction>>(url)

      if (result && result.content && Array.isArray(result.content)) {
        const pageInfo = result.page || {}

        return {
          content: result.content,
          page: {
            size: pageInfo.size || size,
            number: pageInfo.number || page,
            totalElements: pageInfo.totalElements || result.content.length,
            totalPages:
              pageInfo.totalPages ||
              Math.ceil(
                (pageInfo.totalElements || result.content.length) / size
              ),
          },
        }
      } else if (Array.isArray(result)) {
        const totalElements = result.length
        const startIndex = page * size
        const endIndex = Math.min(startIndex + size, totalElements)
        const paginatedContent = result.slice(startIndex, endIndex)

        return {
          content: paginatedContent,
          page: {
            size: size,
            number: page,
            totalElements: totalElements,
            totalPages: Math.ceil(totalElements / size),
          },
        }
      }

      return {
        content: [],
        page: {
          size: size,
          number: page,
          totalElements: 0,
          totalPages: 0,
        },
      }
    } catch (error) {
      throw error
    }
  }

  async getProcessedTransaction(id: string): Promise<ProcessedTransaction> {
    try {
      const result = await apiClient.get<ProcessedTransaction>(
        buildApiUrl(API_ENDPOINTS.RECONCILED_TRANSACTION.GET_BY_ID(id))
      )
      return result
    } catch (error) {
      throw error
    }
  }

  transformToUIData(
    apiResponse: PaginatedResponse<ProcessedTransaction>
  ): PaginatedResponse<ProcessedTransactionUIData> {
    return {
      content: apiResponse.content.map((item) =>
        mapProcessedTransactionToUIData(item)
      ),
      page: apiResponse.page,
    }
  }

  async getProcessedTransactionsUIData(
    page = 0,
    size = 20,
    filters?: ProcessedTransactionFilters
  ): Promise<PaginatedResponse<ProcessedTransactionUIData>> {
    const apiResponse = await this.getProcessedTransactions(page, size, filters)
    const transformedData = this.transformToUIData(apiResponse)
    return transformedData
  }
}

export const processedTransactionService = new ProcessedTransactionService()
