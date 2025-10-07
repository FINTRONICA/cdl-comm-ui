import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'
export interface PendingTransaction {
  id: number
  ptfiTransactionId: string | null
  ptfiTransactionRefId: string | null
  ptfiAmount: number | null
  ptfiTotalAmount: number | null
  ptfiTransactionDate: string | null
  ptfiNarration: string | null
  ptfiDescription: string | null
  ptfiDiscard: boolean | null
  ptfiIsAllocated: boolean | null
  ptfiTransParticular1: string | null
  ptfiTransParticular2: string | null
  ptfiTransRemark1: string | null
  ptfiTransRemark2: string | null
  ptfiCheckNumber: string | null
  ptfiTasUpdated: boolean | null
  ptfiTasUpdate: boolean | null
  ptfiUnitRefNumber: string | null
  ptfiValueDateTime: string | null
  ptfiPostedDateTime: string | null
  ptfiPrimaryUnitHolderName: string | null
  ptfiNormalDateTime: string | null
  ptfiBranchCode: string | null
  ptfiPostedBranchCode: string | null
  ptfiCurrencyCode: string | null
  ptfiSpecialField1: string | null
  ptfiSpecialField2: string | null
  ptfiSpecialField3: string | null
  ptfiSpecialField4: string | null
  ptfiSpecialField5: string | null
  ptfiRetentionAmount: number | null
  ptfiIsUnAllocatedCategory: boolean | null
  ptfiTasPaymentStatus: string | null
  ptfiDiscardedDateTime: string | null
  ptfiCreditedEscrow: boolean | null
  ptfiCbsResponse: string | null
  ptfiPaymentRefNo: string | null
  realEstateAssestDTO: any | null
  capitalPartnerUnitDTO: any | null
  bucketTypeDTO: any | null
  depositModeDTO: any | null
  subDepositTypeDTO: any | null
  bankAccountDTO: any | null
  taskStatusDTO?: any | null
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
  taskStatusDTO?: any | null
}

export interface PendingTransactionLabel {
  id: string
  key: string
  value: string
  language: string
  category: string
}

export interface CreatePendingTransactionRequest {
  ptfiTransactionId: string
  ptfiTransactionRefId: string
  ptfiAmount: number
  ptfiTotalAmount: number
  ptfiTransactionDate: string
  ptfiNarration?: string
  ptfiDescription?: string
  ptfiCurrencyCode?: string
  ptfiTasPaymentStatus?: string
}

export interface UpdatePendingTransactionRequest {
  ptfiTransactionId?: string
  ptfiTransactionRefId?: string
  ptfiAmount?: number
  ptfiTotalAmount?: number
  ptfiTransactionDate?: string
  ptfiNarration?: string
  ptfiDescription?: string
  ptfiCurrencyCode?: string
  ptfiTasPaymentStatus?: string
  ptfiIsAllocated?: boolean
  ptfiDiscard?: boolean
}

export const mapPendingTransactionToUIData = (
  apiData: PendingTransaction
): PendingTransactionUIData => {
  const formatAmount = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '0.00'
    return value.toFixed(2)
  }

  const mapApiStatus = (taskStatusDTO: any | null): string => {
    if (!taskStatusDTO) {
      return 'INITIATED'
    }
    
    // Use the code from taskStatusDTO directly as it matches our new status options
    return taskStatusDTO.code || 'INITIATED'
  }

  return {
    id: String(apiData.id),
    transactionId: apiData.ptfiTransactionId || '—',
    referenceId: apiData.ptfiTransactionRefId || '—',
    amount: formatAmount(apiData.ptfiAmount ?? null),
    totalAmount: formatAmount(apiData.ptfiTotalAmount ?? null),
    currency: apiData.ptfiCurrencyCode || '—',
    transactionDate: apiData.ptfiTransactionDate || '',
    narration: apiData.ptfiNarration || '',
    description: apiData.ptfiDescription || '',
    paymentStatus: apiData.ptfiTasPaymentStatus || '—',
    allocated: apiData.ptfiIsAllocated ? 'Yes' : 'No',
    discard: apiData.ptfiDiscard ? 'Yes' : 'No',
    tasUpdate: String(apiData.ptfiTasUpdate),
    projectName: apiData?.realEstateAssestDTO?.reaName || '—',
    projectRegulatorId: apiData?.realEstateAssestDTO?.reaId || '—',
    developerName: apiData.ptfiPrimaryUnitHolderName || '—',
    taskStatusDTO: apiData.taskStatusDTO || null,
  }
}

export class PendingTransactionService {
  async createPendingTransaction(
    data: Partial<PendingTransaction>
  ): Promise<PendingTransaction> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.PENDING_FUND_INGRESS.SAVE)
      const result = await apiClient.post<PendingTransaction>(url, data)
      return result
    } catch (error) {
      throw error
    }
  }

  async updatePendingTransaction(
    id: string,
    updates: Partial<PendingTransaction>
  ): Promise<PendingTransaction> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.PENDING_FUND_INGRESS.UPDATE(id))
      const result = await apiClient.put<PendingTransaction>(url, updates)
      return result
    } catch (error) {
      throw error
    }
  }

  async deletePendingTransaction(id: string): Promise<void> {
    try {
      const url = buildApiUrl(
        API_ENDPOINTS.PENDING_FUND_INGRESS.SOFT_DELETE(id)
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
    const apiFilters: Record<string, any> = {}
    if (filters) {
      if (filters.transactionId)
        apiFilters.ptfiTransactionId = filters.transactionId
      if (filters.referenceId)
        apiFilters.ptfiTransactionRefId = filters.referenceId
      if (filters.minAmount !== undefined)
        apiFilters['ptfiAmount.greaterThanOrEqual'] = String(filters.minAmount)
      if (filters.maxAmount !== undefined)
        apiFilters['ptfiAmount.lessThanOrEqual'] = String(filters.maxAmount)
      if (filters.currencyCode)
        apiFilters.ptfiCurrencyCode = filters.currencyCode
      if (filters.isAllocated !== undefined)
        apiFilters['ptfiDiscard.equals'] = String(filters.isAllocated)
      if (filters.paymentStatus)
        apiFilters.ptfiTasPaymentStatus = filters.paymentStatus
      if (filters.unitRefNumber)
        apiFilters.ptfiUnitRefNumber = filters.unitRefNumber
      if (filters.fromDate)
        apiFilters['ptfiTransactionDate.greaterThanOrEqual'] = filters.fromDate
      if (filters.toDate)
        apiFilters['ptfiTransactionDate.lessThanOrEqual'] = filters.toDate
    }

    const params = {
      page: page.toString(),
      size: size.toString(),
      ...apiFilters,
    }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.PENDING_FUND_INGRESS.GET_ALL)}${queryString ? `&${queryString}` : ''}`

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
        buildApiUrl(API_ENDPOINTS.PENDING_FUND_INGRESS.GET_BY_ID(id))
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async getPendingTransactionLabels(): Promise<PendingTransactionLabel[]> {
    return apiClient.get<PendingTransactionLabel[]>(
      buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.TRANSCATIONS_LABEL)
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
