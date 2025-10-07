import { apiClient } from '@/lib/apiClient'
import type { Transaction, PaginatedResponse } from '@/types'

// Transaction types
export interface CreateTransactionRequest {
  projectId: string
  type: 'deposit' | 'withdrawal' | 'fee' | 'transfer'
  amount: number
  currency: string
  description: string
  recipientAccountId?: string
  senderAccountId?: string
  metadata?: Record<string, unknown>
}

export interface UpdateTransactionRequest {
  description?: string
  metadata?: Record<string, unknown>
  status?: 'pending' | 'completed' | 'failed' | 'cancelled'
}

export interface TransactionFilters {
  projectId?: string
  type?: 'deposit' | 'withdrawal' | 'fee' | 'transfer'
  status?: 'pending' | 'completed' | 'failed' | 'cancelled'
  currency?: string
  dateFrom?: string
  dateTo?: string
  amountMin?: number
  amountMax?: number
  userId?: string
}

export interface TransactionStats {
  totalTransactions: number
  totalAmount: number
  pendingAmount: number
  completedAmount: number
  failedAmount: number
  currencyBreakdown: Record<string, number>
  typeBreakdown: Record<string, number>
}

export interface TransactionValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  complianceChecks: {
    amlCheck: boolean
    kycCheck: boolean
    limitCheck: boolean
    duplicateCheck: boolean
  }
}

export interface TransactionApproval {
  transactionId: string
  approved: boolean
  reason?: string
  approverId: string
}

// Transaction Service
export class TransactionService {
  private static instance: TransactionService

  private constructor() {}

  static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService()
    }
    return TransactionService.instance
  }

  // Create new transaction with validation
  async createTransaction(data: CreateTransactionRequest): Promise<Transaction> {
    // Pre-validate transaction
    const validation = await this.validateTransaction(data)
    if (!validation.isValid) {
      throw new Error(`Transaction validation failed: ${validation.errors.join(', ')}`)
    }

    return apiClient.post<Transaction>('/transactions', data)
  }

  // Get transaction by ID
  async getTransaction(id: string): Promise<Transaction> {
    return apiClient.get<Transaction>(`/transactions/${id}`)
  }

  // Get transactions with filtering and pagination
  async getTransactions(
    filters: TransactionFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      )
    })

    return apiClient.get<PaginatedResponse<Transaction>>(`/transactions?${params}`)
  }

  // Update transaction
  async updateTransaction(id: string, updates: UpdateTransactionRequest): Promise<Transaction> {
    return apiClient.put<Transaction>(`/transactions/${id}`, updates)
  }

  // Cancel transaction
  async cancelTransaction(id: string, reason?: string): Promise<Transaction> {
    return apiClient.post<Transaction>(`/transactions/${id}/cancel`, { reason })
  }

  // Approve transaction (for admin/approver roles)
  async approveTransaction(approval: TransactionApproval): Promise<Transaction> {
    return apiClient.post<Transaction>(`/transactions/${approval.transactionId}/approve`, approval)
  }

  // Reject transaction
  async rejectTransaction(transactionId: string, reason: string): Promise<Transaction> {
    return apiClient.post<Transaction>(`/transactions/${transactionId}/reject`, { reason })
  }

  // Get transaction statistics
  async getTransactionStats(filters?: TransactionFilters): Promise<TransactionStats> {
    const params = filters ? new URLSearchParams(filters as Record<string, string>) : ''
    return apiClient.get<TransactionStats>(`/transactions/stats${params ? `?${params}` : ''}`)
  }

  // Validate transaction before creation
  async validateTransaction(data: CreateTransactionRequest): Promise<TransactionValidation> {
    return apiClient.post<TransactionValidation>('/transactions/validate', data)
  }

  // Get transaction history for a project
  async getProjectTransactions(
    projectId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    return apiClient.get<PaginatedResponse<Transaction>>(`/projects/${projectId}/transactions?${params}`)
  }

  // Get user transactions
  async getUserTransactions(
    userId: string,
    filters: TransactionFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      )
    })

    return apiClient.get<PaginatedResponse<Transaction>>(`/users/${userId}/transactions?${params}`)
  }

  // Bulk operations
  async bulkUpdateTransactions(
    transactionIds: string[],
    updates: UpdateTransactionRequest
  ): Promise<Transaction[]> {
    return apiClient.put<Transaction[]>('/transactions/bulk', {
      transactionIds,
      updates
    })
  }

  async bulkCancelTransactions(
    transactionIds: string[],
    reason?: string
  ): Promise<Transaction[]> {
    return apiClient.post<Transaction[]>('/transactions/bulk/cancel', {
      transactionIds,
      reason
    })
  }

  // Export transactions
  async exportTransactions(
    filters: TransactionFilters = {},
    format: 'csv' | 'xlsx' | 'pdf' = 'csv'
  ): Promise<Blob> {
    const params = new URLSearchParams({
      format,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      )
    })

    const response = await apiClient.get(`/transactions/export?${params}`, {
      responseType: 'blob'
    })

    return response as Blob
  }

  // Get transaction audit trail
  async getTransactionAuditTrail(transactionId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/transactions/${transactionId}/audit`)
  }

  // Get transaction compliance report
  async getTransactionComplianceReport(transactionId: string): Promise<any> {
    return apiClient.get<any>(`/transactions/${transactionId}/compliance`)
  }

  // Get pending transactions for approval
  async getPendingTransactions(
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    return apiClient.get<PaginatedResponse<Transaction>>(`/transactions/pending?${params}`)
  }

  // Get failed transactions
  async getFailedTransactions(
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    return apiClient.get<PaginatedResponse<Transaction>>(`/transactions/failed?${params}`)
  }

  // Retry failed transaction
  async retryTransaction(transactionId: string): Promise<Transaction> {
    return apiClient.post<Transaction>(`/transactions/${transactionId}/retry`)
  }

  // Get transaction limits
  async getTransactionLimits(): Promise<any> {
    return apiClient.get<any>('/transactions/limits')
  }

  // Check if transaction is within limits
  async checkTransactionLimits(data: CreateTransactionRequest): Promise<boolean> {
    try {
      await apiClient.post('/transactions/check-limits', data)
      return true
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const transactionService = TransactionService.getInstance() 