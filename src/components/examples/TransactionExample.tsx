import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { transactionService } from '@/services/api'
import { useGetEnhanced } from '@/hooks/useApiEnhanced'
import type { Transaction, CreateTransactionRequest } from '@/types'

export const TransactionExample: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateTransactionRequest>({
    projectId: '',
    type: 'deposit',
    amount: 0,
    currency: 'USD',
    description: '',
  })

  // Enhanced API hook for fetching transactions
  const {
    isLoading: fetchLoading,
    error: fetchError,
    refetch: refetchTransactions,
  } = useGetEnhanced('transactions', {
    enabled: true,
    retryOnError: true,
    maxRetries: 3,
    cacheTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 30 * 1000, // 30 seconds
    onSuccess: (data: { data?: Transaction[] }) => {
      setTransactions(data.data || [])
      toast.success('Transactions loaded successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to load transactions')
      console.error('Transaction fetch error:', error)
    },
  })

  // Create transaction with optimistic update
  const createTransaction = async () => {
    if (!formData.projectId || formData.amount <= 0) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)

    try {
      // Optimistic update
      const optimisticTransaction: Transaction = {
        id: `temp_${Date.now()}`,
        projectId: formData.projectId,
        type: formData.type,
        amount: formData.amount,
        currency: formData.currency,
        status: 'pending',
        description: formData.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Add to UI immediately
      setTransactions((prev: Transaction[]) => [optimisticTransaction, ...prev])

      // Send to server
      const result = await transactionService.createTransaction(formData)

      // Update with server response
      setTransactions((prev: Transaction[]) =>
        prev.map((t) => (t.id === optimisticTransaction.id ? result : t))
      )

      // Clear form
      setFormData({
        projectId: '',
        type: 'deposit',
        amount: 0,
        currency: 'USD',
        description: '',
      })

      toast.success('Transaction created successfully')
    } catch (error: unknown) {
      // Revert optimistic update
      setTransactions((prev: Transaction[]) =>
        prev.filter((t) => t.id !== `temp_${Date.now()}`)
      )

      const errorData = error as { response?: { data?: { code?: string } } }
      if (errorData?.response?.data?.code === 'INSUFFICIENT_FUNDS') {
        toast.error('Insufficient funds for this transaction')
      } else if (
        errorData?.response?.data?.code === 'TRANSACTION_LIMIT_EXCEEDED'
      ) {
        toast.error('Transaction limit exceeded')
      } else {
        toast.error('Failed to create transaction')
      }

      console.error('Transaction creation error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Bulk operations (commented out for now)
  // const bulkCancelTransactions = async (transactionIds: string[]) => {
  //   try {
  //     await transactionService.bulkCancelTransactions(transactionIds, 'Bulk cancellation')
  //     toast.success(`${transactionIds.length} transactions cancelled`)
  //     refetchTransactions()
  //   } catch (error) {
  //     toast.error('Failed to cancel transactions')
  //     console.error('Bulk cancel error:', error)
  //   }
  // }

  // Export transactions
  const exportTransactions = async (format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      const blob = await transactionService.exportTransactions({}, format)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`Transactions exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Failed to export transactions')
      console.error('Export error:', error)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Transaction Management</h1>

      {/* Create Transaction Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create Transaction</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Project ID"
            value={formData.projectId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, projectId: e.target.value }))
            }
            className="border rounded px-3 py-2"
          />
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                type: e.target.value as
                  | 'deposit'
                  | 'withdrawal'
                  | 'fee'
                  | 'transfer',
              }))
            }
            className="border rounded px-3 py-2"
          >
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="fee">Fee</option>
            <option value="transfer">Transfer</option>
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                amount: parseFloat(e.target.value) || 0,
              }))
            }
            className="border rounded px-3 py-2"
          />
          <select
            value={formData.currency}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, currency: e.target.value }))
            }
            className="border rounded px-3 py-2"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="border rounded px-3 py-2 w-full mt-4"
          rows={3}
        />
        <button
          onClick={createTransaction}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Transaction'}
        </button>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Transactions</h2>
          <div className="space-x-2">
            <button
              onClick={() => refetchTransactions()}
              disabled={fetchLoading}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
            >
              {fetchLoading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={() => exportTransactions('csv')}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
            >
              Export CSV
            </button>
            <button
              onClick={() => exportTransactions('pdf')}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              Export PDF
            </button>
          </div>
        </div>

        {fetchError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {String(fetchError)}
          </div>
        )}

        {fetchLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          transaction.type === 'deposit'
                            ? 'bg-green-100 text-green-800'
                            : transaction.type === 'withdrawal'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.currency}{' '}
                      {transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {transactions.length === 0 && !fetchLoading && (
          <div className="text-center py-8 text-gray-500">
            No transactions found
          </div>
        )}
      </div>
    </div>
  )
}
