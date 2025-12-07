import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'
export interface PendingTransaction {
  id: number
  unReconTransactionId: string | null
  transactionReferenceNumber: string | null
  transactionAmount: number | null
  totalTransactionAmount: number | null
  transactionDateTime: string | null
  transactionNarration: string | null
  transactionDescription: string | null
  discardFlag: boolean | null
  allocatedFlag: boolean | null
  transactionParticular1: string | null
  transactionParticular2: string | null
  transactionParticularRemark1: string | null
  transactionParticularRemark2: string | null
  chequeReferenceNumber: string | null
  tasUpdateRequestedFlag: boolean | null
  tasUpdateAppliedFlag: boolean | null
  valueDateTime: string | null
  postedDateTime: string | null
  processingDateTime: string | null
  branchIdentifierCode: string | null
  postedBranchIdentifierCode: string | null
  currencyCode: string | null
  customField1: string | null
  customField2: string | null
  customField3: string | null
  customField4: string | null
  customField5: string | null
  primaryUnitHolderFullName: string | null
  unallocatedCategoryFlag: boolean | null
  tasPaymentStatusCode: string | null
  discardedDateTime: string | null
  creditedToEscrowFlag: boolean | null
  coreBankingResponsePayload: string | null
  paymentReferenceNumber: string | null
  subBucketIdentifier: string | null
  escrowAgreementDTO: Record<string, unknown> | null
  bucketTypeDTO: Record<string, unknown> | null
  subBucketTypeDTO: Record<string, unknown> | null
  escrowAccountDTO: Record<string, unknown> | null
  depositModeDTO: Record<string, unknown> | null
  taskStatusDTO?: Record<string, unknown> | null
}

export interface PendingTransactionFilters {
  transactionId?: string
  referenceId?: string
  minAmount?: number
  maxAmount?: number
  currencyCode?: string
  isAllocated?: boolean
  discard?: boolean
  paymentStatus?: string
  unitRefNumber?: string
  fromDate?: string
  toDate?: string
}

export interface PendingTransactionUIData {
  id: string
  transactionId: string
  referenceId: string
  amount: string
  totalAmount: string
  currency: string
  transactionDate: string
  narration: string
  description: string
  paymentStatus: string
  allocated: string
  discard: string
  tasUpdate: string
  projectName?: string
  projectRegulatorId?: string
  developerName?: string
  taskStatusDTO?: Record<string, unknown> | null
  // Additional fields from API response
  valueDateTime?: string
  postedDateTime?: string
  processingDateTime?: string
  branchIdentifierCode?: string
  postedBranchIdentifierCode?: string
  customField1?: string
  customField2?: string
  customField3?: string
  customField4?: string
  customField5?: string
  transactionParticular1?: string
  transactionParticular2?: string
  transactionParticularRemark1?: string
  transactionParticularRemark2?: string
  chequeReferenceNumber?: string
  paymentReferenceNumber?: string
  subBucketIdentifier?: string
  primaryUnitHolderFullName?: string
  unallocatedCategoryFlag?: boolean
  creditedToEscrowFlag?: boolean
  tasUpdateRequestedFlag?: boolean
  tasUpdateAppliedFlag?: boolean
}

export interface PendingTransactionLabel {
  id: string
  key: string
  value: string
  language: string
  category: string
}

export interface CreatePendingTransactionRequest {
  unReconTransactionId: string
  transactionReferenceNumber: string
  transactionAmount: number
  totalTransactionAmount: number
  transactionDateTime: string
  transactionNarration?: string
  transactionDescription?: string
  currencyCode?: string
  tasPaymentStatusCode?: string
}

export interface UpdatePendingTransactionRequest {
  unReconTransactionId?: string
  transactionReferenceNumber?: string
  transactionAmount?: number
  totalTransactionAmount?: number
  transactionDateTime?: string
  transactionNarration?: string
  transactionDescription?: string
  currencyCode?: string
  tasPaymentStatusCode?: string
  allocatedFlag?: boolean
  discardFlag?: boolean
}

export const mapPendingTransactionToUIData = (
  apiData: PendingTransaction
): PendingTransactionUIData => {
  const formatAmount = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '0.00'
    return value.toFixed(2)
  }

  const formatDateTime = (value: string | null | undefined): string => {
    if (!value) return ''
    try {
      return new Date(value).toISOString()
    } catch {
      return value
    }
  }

  return {
    id: String(apiData.id),
    transactionId: apiData.unReconTransactionId || '—',
    referenceId: apiData.transactionReferenceNumber || '—',
    amount: formatAmount(apiData.transactionAmount ?? null),
    totalAmount: formatAmount(apiData.totalTransactionAmount ?? null),
    currency: apiData.currencyCode || '—',
    transactionDate: apiData.transactionDateTime || '',
    narration: apiData.transactionNarration || '',
    description: apiData.transactionDescription || '',
    paymentStatus: apiData.tasPaymentStatusCode || '—',
    allocated: apiData.allocatedFlag ? 'Yes' : 'No',
    discard: apiData.discardFlag ? 'Yes' : 'No',
    tasUpdate: String(apiData.tasUpdateRequestedFlag || apiData.tasUpdateAppliedFlag || false),
    projectName: (apiData?.escrowAgreementDTO as { clientNameDTO?: { partyFullName?: string } } | null)?.clientNameDTO?.partyFullName || '—',
    projectRegulatorId: (apiData?.escrowAgreementDTO as { clientNameDTO?: { partyCifNumber?: string } } | null)?.clientNameDTO?.partyCifNumber || '—',
    developerName: apiData.primaryUnitHolderFullName || '—',
    taskStatusDTO: apiData.taskStatusDTO || null,
    // Additional fields - only include if they have values
    ...(apiData.valueDateTime && { valueDateTime: formatDateTime(apiData.valueDateTime) }),
    ...(apiData.postedDateTime && { postedDateTime: formatDateTime(apiData.postedDateTime) }),
    ...(apiData.processingDateTime && { processingDateTime: formatDateTime(apiData.processingDateTime) }),
    ...(apiData.branchIdentifierCode && { branchIdentifierCode: apiData.branchIdentifierCode }),
    ...(apiData.postedBranchIdentifierCode && { postedBranchIdentifierCode: apiData.postedBranchIdentifierCode }),
    ...(apiData.customField1 && { customField1: apiData.customField1 }),
    ...(apiData.customField2 && { customField2: apiData.customField2 }),
    ...(apiData.customField3 && { customField3: apiData.customField3 }),
    ...(apiData.customField4 && { customField4: apiData.customField4 }),
    ...(apiData.customField5 && { customField5: apiData.customField5 }),
    ...(apiData.transactionParticular1 && { transactionParticular1: apiData.transactionParticular1 }),
    ...(apiData.transactionParticular2 && { transactionParticular2: apiData.transactionParticular2 }),
    ...(apiData.transactionParticularRemark1 && { transactionParticularRemark1: apiData.transactionParticularRemark1 }),
    ...(apiData.transactionParticularRemark2 && { transactionParticularRemark2: apiData.transactionParticularRemark2 }),
    ...(apiData.chequeReferenceNumber && { chequeReferenceNumber: apiData.chequeReferenceNumber }),
    ...(apiData.paymentReferenceNumber && { paymentReferenceNumber: apiData.paymentReferenceNumber }),
    ...(apiData.subBucketIdentifier && { subBucketIdentifier: apiData.subBucketIdentifier }),
    ...(apiData.primaryUnitHolderFullName && { primaryUnitHolderFullName: apiData.primaryUnitHolderFullName }),
    ...(apiData.unallocatedCategoryFlag !== null && apiData.unallocatedCategoryFlag !== undefined && { unallocatedCategoryFlag: apiData.unallocatedCategoryFlag }),
    ...(apiData.creditedToEscrowFlag !== null && apiData.creditedToEscrowFlag !== undefined && { creditedToEscrowFlag: apiData.creditedToEscrowFlag }),
    ...(apiData.tasUpdateRequestedFlag !== null && apiData.tasUpdateRequestedFlag !== undefined && { tasUpdateRequestedFlag: apiData.tasUpdateRequestedFlag }),
    ...(apiData.tasUpdateAppliedFlag !== null && apiData.tasUpdateAppliedFlag !== undefined && { tasUpdateAppliedFlag: apiData.tasUpdateAppliedFlag }),
  }
}

export class PendingTransactionService {
  async createPendingTransaction(
    data: CreatePendingTransactionRequest
  ): Promise<PendingTransaction> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.UNRECONCILED_TRANSACTION.SAVE)
      const result = await apiClient.post<PendingTransaction>(url, data)
      return result
    } catch (error) {
      throw error
    }
  }

  async updatePendingTransaction(
    id: string,
    updates: UpdatePendingTransactionRequest
  ): Promise<PendingTransaction> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.UNRECONCILED_TRANSACTION.UPDATE(id))
      const result = await apiClient.put<PendingTransaction>(url, updates)
      return result
    } catch (error) {
      throw error
    }
  }

  async deletePendingTransaction(id: string): Promise<void> {
    try {
      const url = buildApiUrl(
        API_ENDPOINTS.UNRECONCILED_TRANSACTION.SOFT_DELETE(id)
      )
      await apiClient.delete(url)
    } catch (error) {
      throw error
    }
  }

  async getPendingTransactions(
    page = 0,
    size = 20,
    filters?: PendingTransactionFilters
  ): Promise<PaginatedResponse<PendingTransaction>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.transactionId)
        apiFilters['unReconTransactionId.contains'] = filters.transactionId
      if (filters.referenceId)
        apiFilters['transactionReferenceNumber.contains'] = filters.referenceId
      if (filters.minAmount !== undefined)
        apiFilters['transactionAmount.greaterThanOrEqual'] = String(filters.minAmount)
      if (filters.maxAmount !== undefined)
        apiFilters['transactionAmount.lessThanOrEqual'] = String(filters.maxAmount)
      if (filters.currencyCode)
        apiFilters.currencyCode = filters.currencyCode
      if (filters.isAllocated !== undefined)
        apiFilters['allocatedFlag.equals'] = String(filters.isAllocated)
      if (filters.discard !== undefined)
        apiFilters['discardFlag.equals'] = String(filters.discard)
      if (filters.paymentStatus)
        apiFilters.tasPaymentStatusCode = filters.paymentStatus
      if (filters.unitRefNumber)
        apiFilters.subBucketIdentifier = filters.unitRefNumber
      if (filters.fromDate)
        apiFilters['transactionDateTime.greaterThanOrEqual'] = filters.fromDate
      if (filters.toDate)
        apiFilters['transactionDateTime.lessThanOrEqual'] = filters.toDate
    }

    const params = {
      page: page.toString(),
      size: size.toString(),
      ...apiFilters,
    }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.UNRECONCILED_TRANSACTION.GET_ALL)}${queryString ? `&${queryString}` : ''}`

    try {
      const result =
        await apiClient.get<PaginatedResponse<PendingTransaction>>(url)

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

  async getPendingTransaction(id: string): Promise<PendingTransaction> {
    try {
      const result = await apiClient.get<PendingTransaction>(
        buildApiUrl(API_ENDPOINTS.UNRECONCILED_TRANSACTION.GET_BY_ID(id))
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async getPendingTransactionLabels(): Promise<PendingTransactionLabel[]> {
    return apiClient.get<PendingTransactionLabel[]>(
      buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.UNRECONCILED_TRANSACTION)
    )
  }

  transformToUIData(
    apiResponse: PaginatedResponse<PendingTransaction>
  ): PaginatedResponse<PendingTransactionUIData> {
    return {
      content: apiResponse.content.map((item) =>
        mapPendingTransactionToUIData(item)
      ),
      page: apiResponse.page,
    }
  }

  async getPendingTransactionsUIData(
    page = 0,
    size = 20,
    filters?: PendingTransactionFilters
  ): Promise<PaginatedResponse<PendingTransactionUIData>> {
    const apiResponse = await this.getPendingTransactions(page, size, filters)
    const transformedData = this.transformToUIData(apiResponse)
    return transformedData
  }
}

export const pendingTransactionService = new PendingTransactionService()
