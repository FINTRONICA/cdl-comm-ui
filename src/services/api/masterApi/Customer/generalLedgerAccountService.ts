import { apiClient } from '@/lib/apiClient'
import {
  buildApiUrl,
  buildPaginationParams,
  API_ENDPOINTS,
} from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'

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

export interface GeneralLedgerAccount {
  id: number
  uuid?: string
  ledgerAccountNumber: string
  branchIdentifierCode: string
  ledgerAccountDescription: string
  ledgerAccountTypeCode: string
  active: boolean
  enabled: boolean
  deleted: boolean
  taskStatusDTO?: TaskStatusDTO | null
}

export interface CreateGeneralLedgerAccountRequest {
  ledgerAccountNumber: string
  branchIdentifierCode: string
  ledgerAccountDescription: string
  ledgerAccountTypeCode: string
  active: boolean
  enabled?: boolean
  deleted?: boolean
  uuid?: string
  taskStatusDTO?: {
    id: number
  } | null
}

export interface UpdateGeneralLedgerAccountRequest {
  id?: number
  ledgerAccountNumber: string
  branchIdentifierCode: string
  ledgerAccountDescription: string
  ledgerAccountTypeCode: string
  active?: boolean
  enabled?: boolean
  deleted?: boolean
  uuid?: string
  taskStatusDTO?: {
    id: number
  } | null
}

export interface GeneralLedgerAccountFilters {
  ledgerAccountNumber?: string
  branchIdentifierCode?: string
  ledgerAccountDescription?: string
  ledgerAccountTypeCode?: string
}

export class GeneralLedgerAccountService {
  async getGeneralLedgerAccount(
    page = 0,
    size = 20,
    filters?: GeneralLedgerAccountFilters
  ): Promise<PaginatedResponse<GeneralLedgerAccount>> {
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.ledgerAccountNumber) {
        apiFilters['ledgerAccountNumber.contains'] = filters.ledgerAccountNumber
      }
      if (filters.branchIdentifierCode) {
        apiFilters['branchIdentifierCode.contains'] = filters.branchIdentifierCode
      }
      if (filters.ledgerAccountDescription) {
        apiFilters['ledgerAccountDescription.contains'] = filters.ledgerAccountDescription
      }
      if (filters.ledgerAccountTypeCode) {
        apiFilters['ledgerAccountTypeCode.contains'] = filters.ledgerAccountTypeCode
      }
    }

    // Build URL - Use correct endpoint
    const baseUrl = buildApiUrl(API_ENDPOINTS.MASTER_GENERAL_LEDGER_ACCOUNT.GET_ALL)
    const allParams = {
      ...buildPaginationParams(page, size),
      ...apiFilters,
    }
    const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${new URLSearchParams(allParams).toString()}`

    try {
      const result = await apiClient.get<PaginatedResponse<GeneralLedgerAccount>>(url)
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
      throw error
    }
  }

  async getGeneralLedgerAccountById(id: string): Promise<GeneralLedgerAccount> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_GENERAL_LEDGER_ACCOUNT.GET_BY_ID(id))
      const result = await apiClient.get<GeneralLedgerAccount>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async createGeneralLedgerAccount(
              data: CreateGeneralLedgerAccountRequest
  ): Promise<GeneralLedgerAccount> {
    try {
      const result = await apiClient.post<GeneralLedgerAccount>(
        buildApiUrl(API_ENDPOINTS.MASTER_GENERAL_LEDGER_ACCOUNT.SAVE),
        data
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async updateGeneralLedgerAccount(
    id: string,
    updates: UpdateGeneralLedgerAccountRequest
        ): Promise<GeneralLedgerAccount> {
    try {
      const result = await apiClient.put<GeneralLedgerAccount>(
        buildApiUrl(API_ENDPOINTS.MASTER_GENERAL_LEDGER_ACCOUNT.UPDATE(id)),
        updates
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async deleteGeneralLedgerAccount(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.MASTER_GENERAL_LEDGER_ACCOUNT.SOFT_DELETE(id))
      )
    } catch (error) {
      throw error
    }
  }

  async getAllGeneralLedgerAccount(): Promise<GeneralLedgerAccount[]> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MASTER_GENERAL_LEDGER_ACCOUNT.FIND_ALL)
      const result = await apiClient.get<GeneralLedgerAccount[] | PaginatedResponse<GeneralLedgerAccount>>(url)
      
      // Handle different response structures
      if (Array.isArray(result)) {
        return result
      } else if (result && typeof result === 'object' && 'content' in result && Array.isArray((result as PaginatedResponse<GeneralLedgerAccount>).content)) {
        return (result as PaginatedResponse<GeneralLedgerAccount>).content
      }
      
      return []
    } catch (error) {
      console.error('Error fetching all general ledger account:', error)
      return []
    }
  }
}

      export const generalLedgerAccountService = new GeneralLedgerAccountService()

