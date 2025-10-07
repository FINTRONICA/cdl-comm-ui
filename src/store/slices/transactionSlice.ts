import { type StateCreator } from 'zustand'
import { type Transaction } from '@/types'

export interface TransactionSlice {
  transactions: Transaction[]
  selectedTransaction: Transaction | null
  transactionLoading: boolean
  transactionError: string | null
  transactionFilters: {
    type: string[]
    status: string[]
    projectId: string[]
    search: string
    dateRange: {
      start: string
      end: string
    }
  }
  transactionPagination: {
    page: number
    limit: number
    total: number
  }
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  setSelectedTransaction: (transaction: Transaction | null) => void
  setTransactionLoading: (loading: boolean) => void
  setTransactionError: (error: string | null) => void
  setTransactionFilters: (filters: Partial<TransactionSlice['transactionFilters']>) => void
  setTransactionPagination: (pagination: Partial<TransactionSlice['transactionPagination']>) => void
}

export const transactionSlice: StateCreator<TransactionSlice> = (set, get) => ({
  transactions: [],
  selectedTransaction: null,
  transactionLoading: false,
  transactionError: null,
  transactionFilters: {
    type: [],
    status: [],
    projectId: [],
    search: '',
    dateRange: {
      start: '',
      end: '',
    },
  },
  transactionPagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  
  setTransactions: (transactions) => set({ transactions }),
  
  addTransaction: (transaction) => {
    const { transactions } = get()
    set({ transactions: [...transactions, transaction] })
  },
  
  updateTransaction: (id, updates) => {
    const { transactions } = get()
    set({
      transactions: transactions.map(transaction =>
        transaction.id === id ? { ...transaction, ...updates } : transaction
      ),
    })
  },
  
  deleteTransaction: (id) => {
    const { transactions } = get()
    set({
      transactions: transactions.filter(transaction => transaction.id !== id),
    })
  },
  
  setSelectedTransaction: (transaction) => set({ selectedTransaction: transaction }),
  
  setTransactionLoading: (transactionLoading) => set({ transactionLoading }),
  
  setTransactionError: (transactionError) => set({ transactionError }),
  
  setTransactionFilters: (filters) => {
    const { transactionFilters: currentFilters } = get()
    set({ transactionFilters: { ...currentFilters, ...filters } })
  },
  
  setTransactionPagination: (pagination) => {
    const { transactionPagination: currentPagination } = get()
    set({ transactionPagination: { ...currentPagination, ...pagination } })
  },
}) 