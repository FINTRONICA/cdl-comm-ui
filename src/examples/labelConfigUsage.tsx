/**
 * Example usage of the Label Configuration Service and Hook
 * 
 * This file demonstrates how to use the new label API service and hooks
 * for fetching and managing transaction label configurations.
 */

import React from 'react'
import { 
  useLabelConfigApi, 
  useLabelConfigQuery, 
  useLabelQuery, 
  useLabelsByModuleQuery 
} from '@/hooks/useLabelConfigApi'
import { labelConfigService } from '@/services/api/labelConfigService'

// Example 1: Using the basic hook for label management
export function LabelConfigExample() {
  const {
    labels,
    isLoading,
    error,
    getLabel,
    getLabelsByModule,
    getAvailableLanguages,
    hasLabels,
    refetch,
    clearCache
  } = useLabelConfigApi()

  if (isLoading) return <div>Loading labels...</div>
  if (error) return <div>Error: {error}</div>
  if (!hasLabels()) return <div>No labels available</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Label Configuration Example</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Available Languages:</h3>
        <ul className="list-disc list-inside">
          {getAvailableLanguages().map(lang => (
            <li key={lang}>{lang}</li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Sample Labels:</h3>
        <ul className="list-disc list-inside">
          <li>Build Partner Name: {getLabel('CDL_TRANS_BP_NAME')}</li>
          <li>Transaction Amount: {getLabel('CDL_TRAN_AMOUNT')}</li>
          <li>Approval Status: {getLabel('CDL_TRANS_APPROVAL_STATUS')}</li>
          <li>Action: {getLabel('CDL_TRAN_ACTION')}</li>
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Transaction Module Labels:</h3>
        <ul className="list-disc list-inside">
          {getLabelsByModule('CDLTRANSACTIONSV1').slice(0, 5).map(label => (
            <li key={label.id}>
              {label.configId}: {label.configValue}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Labels
        </button>
        <button 
          onClick={clearCache}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Cache
        </button>
      </div>
    </div>
  )
}

// Example 2: Using React Query hook for better caching
export function LabelConfigQueryExample() {
  const { data: labels, isLoading, error, refetch } = useLabelConfigQuery()

  if (isLoading) return <div>Loading labels with React Query...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">React Query Label Example</h2>
      <p>Total labels: {labels?.totalCount}</p>
      <p>Enabled labels: {labels?.labels.length}</p>
      
      <button 
        onClick={() => refetch()}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Refetch with React Query
      </button>
    </div>
  )
}

// Example 3: Using specific label query
export function SpecificLabelExample() {
  const { label, isLoading, error } = useLabelQuery('CDL_TRANS_BP_NAME', 'EN')

  if (isLoading) return <div>Loading specific label...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Specific Label Example</h2>
      <p>Build Partner Name Label: <strong>{label}</strong></p>
    </div>
  )
}

// Example 4: Using module-specific labels
export function ModuleLabelsExample() {
  const { labels, isLoading, error, labelMap } = useLabelsByModuleQuery('CDLTRANSACTIONSV1', 'EN')

  if (isLoading) return <div>Loading module labels...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Module Labels Example</h2>
      <p>Found {labels.length} labels for CDLTRANSACTIONSV1 module</p>
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Label Map:</h3>
        <ul className="list-disc list-inside">
          {Array.from(labelMap.entries()).slice(0, 10).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Example 5: Direct service usage (for non-React contexts)
export async function directServiceExample() {
  try {
    // Get all labels
    const labels = await labelConfigService.getProcessedTransactionLabelsWithCache()
  
    const buildPartnerName = await labelConfigService.getLabel('CDL_TRANS_BP_NAME')
   
    const transactionLabels = await labelConfigService.getLabelsByModule('CDLTRANSACTIONSV1')
   
    const languages = labelConfigService.getAvailableLanguages(labels)
  
    const labelMap = labelConfigService.createLabelMap(labels, 'EN')
   

    return {
      totalLabels: labels.length,
      buildPartnerName,
      transactionLabelsCount: transactionLabels.length,
      availableLanguages: languages,
      labelMapSize: labelMap.size
    }
  } catch (error) {
   
    throw error
  }
}

// Example 6: Integration with existing components
export function TransactionTableWithLabels() {
  const { getLabel } = useLabelConfigApi()
  
  // Mock transaction data
  const transactions = [
    { id: 1, amount: 1000, status: 'pending', partnerName: 'Partner A' },
    { id: 2, amount: 2000, status: 'completed', partnerName: 'Partner B' },
  ]

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Transaction Table with Labels</h2>
      
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">
              {getLabel('CDL_TRAN_REFNO', 'EN', 'Reference Number')}
            </th>
            <th className="border border-gray-300 px-4 py-2">
              {getLabel('CDL_TRAN_AMOUNT', 'EN', 'Amount')}
            </th>
            <th className="border border-gray-300 px-4 py-2">
              {getLabel('CDL_TRANS_APPROVAL_STATUS', 'EN', 'Status')}
            </th>
            <th className="border border-gray-300 px-4 py-2">
              {getLabel('CDL_TRANS_BP_NAME', 'EN', 'Partner Name')}
            </th>
            <th className="border border-gray-300 px-4 py-2">
              {getLabel('CDL_TRAN_ACTION', 'EN', 'Action')}
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id}>
              <td className="border border-gray-300 px-4 py-2">{transaction.id}</td>
              <td className="border border-gray-300 px-4 py-2">${transaction.amount}</td>
              <td className="border border-gray-300 px-4 py-2">{transaction.status}</td>
              <td className="border border-gray-300 px-4 py-2">{transaction.partnerName}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button className="px-2 py-1 bg-blue-500 text-white rounded text-sm">
                  {getLabel('CDL_TRAN_UPDATE_TAS', 'EN', 'Update')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
