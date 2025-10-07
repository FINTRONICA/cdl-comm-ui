import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'

export interface ProcessedTransaction {
  id: number
  pfiTransactionId: string | null
  pfiTransactionRefId: string | null
  pfiAmount: number | null
  pfiTotalAmount: number | null
  pfiTransactionDate: string | null
  pfiNarration: string | null
  pfiDescription: string | null
  pfiDiscard: boolean | null
  pfiIsAllocated: boolean | null
  pfiTransParticular1: string | null
  pfiTransParticular2: string | null
  pfiTransRemark1: string | null
  pfiTransRemark2: string | null
  pfiCheckNumber: string | null
  pfiTasUpdated: boolean | null
  pfiTasUpdate: boolean | null
  pfiUnitRefNumber: string | null
  pfiValueDateTime: string | null
  pfiPostedDateTime: string | null
  pfiNormalDateTime: string | null
  pfiBranchCode: string | null
  pfiPostedBranchCode: string | null
  pfiCurrencyCode: string | null
  pfiSpecialField1: string | null
  pfiSpecialField2: string | null
  pfiSpecialField3: string | null
  pfiSpecialField4: string | null
  pfiSpecialField5: string | null
  pfiRetentionAmount: number | null
  pfiPrimaryUnitHolderName: string | null
  pfiIsUnAllocatedCategory: boolean | null
  pfiTasPaymentStatus: string | null
  pfiDiscardedDateTime: string | null
  pfiCreditedEscrow: boolean | null
  pfiCbsResponse: string | null
  pfiPaymentRefNo: string | null
  realEstateAssestDTO: {
    id?: number
    reaName?: string
    reaId?: string
    reaCif?: string
    reaUnitNumber?: string
    reaDeveloperName?: string
    reaOqoodFormat?: string
  } | null
  capitalPartnerUnitDTO: any | null
  bucketTypeDTO: any | null
  depositModeDTO: any | null
  subDepositTypeDTO: any | null
  deleted: boolean | null
  enabled: boolean | null
  taskStatusDTO: any | null
}

export interface ProcessedTransactionFilters {
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
  projectName?: string
  developerName?: string
  projectRegulatorId?: string
  unitNumber?: string
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
}

export interface CreateProcessedTransactionRequest {
  pfiTransactionId: string
  pfiTransactionRefId: string
  pfiAmount: number
  pfiTotalAmount: number
  pfiTransactionDate: string
  pfiNarration?: string
  pfiDescription?: string
  pfiCurrencyCode?: string
  pfiTasPaymentStatus?: string
}

export interface UpdateProcessedTransactionRequest {
  pfiTransactionId?: string
  pfiTransactionRefId?: string
  pfiAmount?: number
  pfiTotalAmount?: number
  pfiTransactionDate?: string
  pfiNarration?: string
  pfiDescription?: string
  pfiCurrencyCode?: string
  pfiTasPaymentStatus?: string
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

  const formatDate = (dateString: string | null): string => {
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

  return {
    id: String(apiData.id),
    date: formatDate(apiData.pfiTransactionDate),
    transId: apiData.pfiTransactionId || '—',
    projectAccountId: apiData.realEstateAssestDTO?.reaCif || '—',
    developerName:
      apiData.realEstateAssestDTO?.reaDeveloperName ||
      apiData.pfiPrimaryUnitHolderName ||
      '—',
    projectName: apiData.realEstateAssestDTO?.reaName || '—',
    projectRegulatorId: apiData.realEstateAssestDTO?.reaId || '—',
    unitNo:
      apiData.realEstateAssestDTO?.reaUnitNumber ||
      apiData.realEstateAssestDTO?.reaOqoodFormat ||
      apiData.pfiUnitRefNumber ||
      '—',
    receivableCategory: '—',
    tasCbsMatch: String(apiData.pfiTasUpdate || false),
    amount: apiData.pfiAmount ? formatAmount(apiData.pfiAmount) : '—',
    narration: apiData.pfiNarration || '—',
    totalAmount: apiData.pfiTotalAmount
      ? formatAmount(apiData.pfiTotalAmount)
      : '—',
    currency: apiData.pfiCurrencyCode || 'AED',
    description: apiData.pfiDescription || '—',
    paymentStatus: apiData.pfiTasPaymentStatus || '—',
    allocated:
      apiData.pfiIsAllocated !== null
        ? apiData.pfiIsAllocated
          ? 'Yes'
          : 'No'
        : '—',
    valueDate: formatDate(apiData.pfiValueDateTime),
    postedDate: formatDate(apiData.pfiPostedDateTime),
    branchCode: apiData.pfiBranchCode || '—',
    checkNumber: apiData.pfiCheckNumber || '—',
    retentionAmount: apiData.pfiRetentionAmount
      ? formatAmount(apiData.pfiRetentionAmount)
      : '—',
  }
}

export class ProcessedTransactionService {
  async createProcessedTransaction(
    data: Partial<ProcessedTransaction>
  ): Promise<ProcessedTransaction> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.PROCESSED_FUND_INGRESS.SAVE)
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
      const url = buildApiUrl(API_ENDPOINTS.PROCESSED_FUND_INGRESS.UPDATE(id))
      const result = await apiClient.put<ProcessedTransaction>(url, updates)
      return result
    } catch (error) {
      throw error
    }
  }

  async deleteProcessedTransaction(id: string): Promise<void> {
    try {
      const url = buildApiUrl(
        API_ENDPOINTS.PROCESSED_FUND_INGRESS.SOFT_DELETE(id)
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
    const apiFilters: Record<string, any> = {}
    if (filters) {
      if (filters.transactionId)
        apiFilters.pfiTransactionId = filters.transactionId
      if (filters.referenceId)
        apiFilters.pfiTransactionRefId = filters.referenceId
      if (filters.minAmount !== undefined)
        apiFilters['pfiAmount.greaterThanOrEqual'] = String(filters.minAmount)
      if (filters.maxAmount !== undefined)
        apiFilters['pfiAmount.lessThanOrEqual'] = String(filters.maxAmount)
      if (filters.currencyCode)
        apiFilters.pfiCurrencyCode = filters.currencyCode
      if (filters.paymentStatus)
        apiFilters.pfiTasPaymentStatus = filters.paymentStatus
      if (filters.unitRefNumber)
        apiFilters.pfiUnitRefNumber = filters.unitRefNumber
      if (filters.fromDate)
        apiFilters['pfiTransactionDate.greaterThanOrEqual'] = filters.fromDate
      if (filters.toDate)
        apiFilters['pfiTransactionDate.lessThanOrEqual'] = filters.toDate
    }

    const params = {
      page: page.toString(),
      size: size.toString(),
      ...apiFilters,
    }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.PROCESSED_FUND_INGRESS.GET_ALL)}${queryString ? `&${queryString}` : ''}`

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
        buildApiUrl(API_ENDPOINTS.PROCESSED_FUND_INGRESS.GET_BY_ID(id))
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
