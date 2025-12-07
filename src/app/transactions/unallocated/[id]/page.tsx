'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { DashboardLayout } from '../../../../components/templates/DashboardLayout'
import { Button } from '../../../../components/atoms/Button'
import { Input } from '../../../../components/atoms/Input'
import { TextField } from '@mui/material'
import { usePendingTransaction } from '@/hooks'
import type { PendingTransaction } from '@/services/api/pendingTransactionService'
import { GlobalLoading } from '@/components/atoms'
import { usePendingTransactionLabelApi } from '@/hooks/usePendingTransactionLabelApi'
import { getPendingTransactionLabel } from '@/constants/mappings/pendingTransactionMapping'

// Define the transaction data structure to match API response
interface TransactionData {
  id: number
  tranReference: string
  projectName: string
  developerName: string
  narration: string
  tranDate: string
  unitNoOqoodFormat: string
  tasUpdate: string
  tranAmount: number
  retentionToBeTaken: string
  status: string
  description: string
  totalAmount: number
  currencyCode: string
  branchCode: string
  paymentRefNo: string
  // Additional fields from API response
  transactionId?: string
  valueDateTime?: string
  postedDateTime?: string
  processingDateTime?: string
  postedBranchCode?: string
  customField1?: string
  customField2?: string
  transactionParticular1?: string
  transactionParticular2?: string
  transactionParticularRemark1?: string
  primaryUnitHolderFullName?: string
  subBucketIdentifier?: string
}

// Define split amount data structure
interface SplitAmountData {
  splitAmount: string
  receivableCategory: string
  receivableSubCategory: string
  unitNoOqoodFormat: string
  depositMode: string
  chequeNumber: string
}

// Map API response to display format
const mapApiToTransactionData = (
  apiData: PendingTransaction
): TransactionData => {
  const formatDateTime = (dateTime: string | null | undefined): string => {
    if (!dateTime) return '—'
    try {
      return new Date(dateTime).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateTime
    }
  }

  return {
    id: apiData.id,
    tranReference:
      apiData.transactionReferenceNumber || apiData.unReconTransactionId || '—',
    transactionId: apiData.unReconTransactionId || '—',
    projectName: (apiData.escrowAgreementDTO as { clientNameDTO?: { partyFullName?: string } } | null)?.clientNameDTO?.partyFullName || '—',
    developerName: (apiData.escrowAgreementDTO as { clientNameDTO?: { relationshipManagerName?: string } } | null)?.clientNameDTO?.relationshipManagerName || '—',
    narration: apiData.transactionNarration || '—',
    tranDate: apiData.transactionDateTime
      ? new Date(apiData.transactionDateTime).toLocaleDateString('en-GB')
      : '—',
    unitNoOqoodFormat: apiData.subBucketIdentifier || '—',
    tasUpdate: String(apiData.tasUpdateRequestedFlag || apiData.tasUpdateAppliedFlag || false),
    tranAmount: apiData.transactionAmount || 0,
    retentionToBeTaken: 'NO', // Not available in new API response
    status: mapPaymentStatusToStatus(apiData.tasPaymentStatusCode),
    description: apiData.transactionDescription || '—',
    totalAmount: apiData.totalTransactionAmount || 0,
    currencyCode: apiData.currencyCode || 'AED',
    branchCode: apiData.branchIdentifierCode || '—',
    paymentRefNo: apiData.paymentReferenceNumber || '—',
    // Additional fields
    valueDateTime: formatDateTime(apiData.valueDateTime),
    postedDateTime: formatDateTime(apiData.postedDateTime),
    processingDateTime: formatDateTime(apiData.processingDateTime),
    postedBranchCode: apiData.postedBranchIdentifierCode || '—',
    customField1: apiData.customField1 || '—',
    customField2: apiData.customField2 || '—',
    transactionParticular1: apiData.transactionParticular1 || '—',
    transactionParticular2: apiData.transactionParticular2 || '—',
    transactionParticularRemark1: apiData.transactionParticularRemark1 || '—',
    primaryUnitHolderFullName: apiData.primaryUnitHolderFullName || '—',
    subBucketIdentifier: apiData.subBucketIdentifier || '—',
  }
}

// Map payment status to display status
const mapPaymentStatusToStatus = (paymentStatus: string | null): string => {
  switch (paymentStatus?.toUpperCase()) {
    case 'PENDING':
    case 'INCOMPLETE':
    case 'INITIATED':
      return 'Pending Allocation'
    case 'IN_REVIEW':
    case 'REVIEW':
    case 'IN_PROGRESS':
      return 'In Review'
    case 'REJECTED':
    case 'FAILED':
      return 'Rejected'
    case 'APPROVED':
    case 'SUCCESS':
      return 'Approved'
    default:
      return 'Pending Allocation'
  }
}

// Sample split amount data
const getInitialSplitAmountData = (): SplitAmountData[] => {
  return [
    {
      splitAmount: '',
      receivableCategory: '',
      receivableSubCategory: '',
      unitNoOqoodFormat: '',
      depositMode: '',
      chequeNumber: '',
    },
  ]
}

const UnallocatedTransactionDetailsPage: React.FC<{
  params: Promise<{ id: string }>
}> = ({ params }) => {
  const router = useRouter()
  const resolvedParams = React.use(params)

  // State for split amount data
  const [splitAmountData, setSplitAmountData] = useState<SplitAmountData[]>(
    getInitialSplitAmountData()
  )

  // State for validation error
  const [validationError, setValidationError] = useState<string>('')

  // Fetch transaction data using the custom hook
  const {
    data: apiTransaction,
    isLoading,
    error,
  } = usePendingTransaction(resolvedParams.id)

  // Label API hook for dynamic labels
  const {
    getLabel: getLabelFromApi,
    isLoading: labelsLoading,
  } = usePendingTransactionLabelApi()

  // Get dynamic label with fallback
  const getPaymentPlanLabel = React.useCallback(
    (configId: string): string => {
      const apiLabel = getLabelFromApi(configId, 'EN')
      if (apiLabel !== configId) {
        return apiLabel
      }
      return getPendingTransactionLabel(configId)
    },
    [getLabelFromApi]
  )

  // Map API data to display format
  const transaction = apiTransaction
    ? mapApiToTransactionData(apiTransaction)
    : null

  // Function to add a new payment plan row
  const addPaymentPlanRow = () => {
    const newRow: SplitAmountData = {
      splitAmount: '',
      receivableCategory: '',
      receivableSubCategory: '',
      unitNoOqoodFormat: '',
      depositMode: '',
      chequeNumber: '',
    }
    setSplitAmountData([...splitAmountData, newRow])
  }

  // Function to update a specific field in a specific row
  const updateSplitAmountField = (
    index: number,
    field: keyof SplitAmountData,
    value: string
  ) => {
    const updatedData = [...splitAmountData]
    updatedData[index] = {
      ...updatedData[index],
      [field]: value,
    } as SplitAmountData
    setSplitAmountData(updatedData)
  }

  // Function to remove a payment plan row
  const removePaymentPlanRow = (index: number) => {
    if (splitAmountData.length > 1) {
      const updatedData = splitAmountData.filter((_, i) => i !== index)
      setSplitAmountData(updatedData)
    }
  }

  // Calculate total split amount
  const totalSplitAmount = splitAmountData.reduce((sum, item) => {
    const amount = parseFloat(item.splitAmount) || 0
    return sum + amount
  }, 0)

  // Validate split amount against transaction amount
  const validateSplitAmount = useCallback(() => {
    if (transaction && totalSplitAmount > transaction.tranAmount) {
      setValidationError(
        'The total split amount can not be more than the Tran Amount'
      )
      return false
    } else {
      setValidationError('')
      return true
    }
  }, [transaction, totalSplitAmount])

  // Check if validation passes
  const isValidationPassed = transaction
    ? totalSplitAmount <= transaction.tranAmount
    : true

  // Trigger validation when split amount data changes
  React.useEffect(() => {
    if (transaction) {
      validateSplitAmount()
    }
  }, [totalSplitAmount, transaction, validateSplitAmount])

  // Loading state
  if (isLoading || labelsLoading) {
    return (
      <DashboardLayout title="Transaction Details">
        <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Transaction Error">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="mb-4 text-red-600">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">
            Error Loading...
          </h2>
          <p className="mb-6 text-gray-600">
            {error.message || 'Unable to load transaction details'}
          </p>
          <Button
            onClick={() => router.push('/transactions/unallocated')}
            variant="primary"
          >
            Back to Unallocated Transactions
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  // Transaction not found state
  if (!transaction) {
    return (
      <DashboardLayout title="Transaction Not Found">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">
            Transaction Not Found
          </h2>
          <p className="mb-6 text-gray-600">
            The transaction you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button
            onClick={() => router.push('/transactions/unallocated')}
            variant="primary"
          >
            Back to Unallocated Transactions
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US')
  }

  return (
    <DashboardLayout title="Pending Transaction">
      <div className="px-6 py-4 bg-white/75 dark:bg-slate-900/70 rounded-2xl">
        <div className="flex flex-col gap-12 ">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 pt-2 mt-5 sm:grid-cols-2 lg:grid-cols-4 ">
              <div className="flex flex-col gap-1">
                <div className="h-[17px]">
                  <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-slate-400">
                    Trans Reference:
                  </p>
                </div>
                <div className="h-[25px]">
                  <p className="font-sans font-normal text-xl leading-none tracking-[0%] align-middle text-gray-900 dark:text-slate-100">
                    {transaction.tranReference}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="h-[17px]">
                  <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-slate-400">
                    Project Name
                  </p>
                </div>
                <div className="h-[25px]">
                  <p className="font-sans font-normal text-xl leading-none tracking-[0%] align-middle text-gray-900 dark:text-slate-100">
                    {transaction.projectName}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-1 gap-6 py-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-slate-400">
                      Developer Name:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-slate-100">
                      {transaction.developerName}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-slate-400">
                      Narration:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-slate-100">
                      [&quot;{transaction.narration}&quot;]
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-slate-400">
                      TAS Update:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-slate-100">
                      {transaction.tasUpdate}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-slate-400">
                      5% Retention to be Taken:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-slate-100">
                      {transaction.retentionToBeTaken}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 py-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Tran Date:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {transaction.tranDate}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Unit No. Oqood Format:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {transaction.unitNoOqoodFormat}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Tran Amount:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {formatNumber(transaction.tranAmount)}{' '}
                      {transaction.currencyCode}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Total Amount:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {formatNumber(transaction.totalAmount)}{' '}
                      {transaction.currencyCode}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 py-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Transaction ID:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {transaction.transactionId || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Payment Reference:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {transaction.paymentRefNo}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Branch Code:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {transaction.branchCode}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Posted Branch Code:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {transaction.postedBranchCode || '—'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 py-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Value Date & Time:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {transaction.valueDateTime || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Posted Date & Time:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {transaction.postedDateTime || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Processing Date & Time:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {transaction.processingDateTime || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Primary Unit Holder:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {transaction.primaryUnitHolderFullName || '—'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 py-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Transaction Particular 1:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {transaction.transactionParticular1 || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Transaction Particular 2:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {transaction.transactionParticular2 || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Transaction Particular Remark 1:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {transaction.transactionParticularRemark1 || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Custom Field 1:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {transaction.customField1 || '—'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 py-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Custom Field 2:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {transaction.customField2 || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Sub Bucket Identifier:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {transaction.subBucketIdentifier || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Description:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {transaction.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-gray-600 dark:text-gray-400">
                      Status:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-gray-900 dark:text-gray-100">
                      {transaction.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-end px-4">
              <button
                onClick={addPaymentPlanRow}
                className="w-[161px] h-8 gap-1.5 opacity-100 py-1.5 px-2.5 rounded-md border border-blue-600 dark:border-blue-500 flex text-blue-600 dark:text-blue-300 font-sans text-sm font-medium leading-5 tracking-[0%] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Image src="/circle-plus-blue.svg" alt="plus icon" width={16} height={16} />
                Add Payment Plan
              </button>
            </div>
            <div>
              <div className="border-b border-gray-200 dark:border-slate-700">
                <div className="grid grid-cols-7 gap-4 px-4 py-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {getPaymentPlanLabel('CDL_SPLIT_AMOUNT')}*
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {getPaymentPlanLabel('CDL_RECEIVABLE_CATEGORY')}*
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {getPaymentPlanLabel('CDL_RECEIVABLE_SUB_CATEGORY')}*
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {getPaymentPlanLabel('CDL_UNIT_NO_OQOOD_FORMAT')}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {getPaymentPlanLabel('CDL_DEPOSIT_MODE')}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {getPaymentPlanLabel('CDL_CHEQUE_NUMBER')}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    Action
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {splitAmountData.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-7 gap-4 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/60"
                  >
                    <div className="text-sm text-gray-900 dark:text-slate-100">
                      <Input
                        placeholder={getPaymentPlanLabel('CDL_SPLIT_AMOUNT')}
                        className="h-8 text-sm"
                        value={item.splitAmount}
                        onChange={(value) =>
                          updateSplitAmountField(index, 'splitAmount', value)
                        }
                        type="number"
                      />
                    </div>
                    <div className="text-sm text-gray-900 dark:text-slate-100">
                      <Input
                        placeholder={getPaymentPlanLabel('CDL_RECEIVABLE_CATEGORY')}
                        className="h-8 text-sm"
                        value={item.receivableCategory}
                        onChange={(value) =>
                          updateSplitAmountField(
                            index,
                            'receivableCategory',
                            value
                          )
                        }
                      />
                    </div>
                    <div className="text-sm text-gray-900 dark:text-slate-100">
                      <Input
                        placeholder={getPaymentPlanLabel('CDL_RECEIVABLE_SUB_CATEGORY')}
                        className="h-8 text-sm"
                        value={item.receivableSubCategory}
                        onChange={(value) =>
                          updateSplitAmountField(
                            index,
                            'receivableSubCategory',
                            value
                          )
                        }
                      />
                    </div>
                    <div className="text-sm text-gray-900 dark:text-slate-100">
                      <Input
                        placeholder={getPaymentPlanLabel('CDL_UNIT_NO_OQOOD_FORMAT')}
                        className="h-8 text-sm"
                        value={item.unitNoOqoodFormat}
                        onChange={(value) =>
                          updateSplitAmountField(
                            index,
                            'unitNoOqoodFormat',
                            value
                          )
                        }
                      />
                    </div>
                    <div className="text-sm text-gray-900 dark:text-slate-100">
                      <Input
                        placeholder={getPaymentPlanLabel('CDL_DEPOSIT_MODE')}
                        className="h-8 text-sm"
                        value={item.depositMode}
                        onChange={(value) =>
                          updateSplitAmountField(index, 'depositMode', value)
                        }
                      />
                    </div>
                    <div className="text-sm text-gray-900 dark:text-slate-100">
                      <Input
                        placeholder={getPaymentPlanLabel('CDL_CHEQUE_NUMBER')}
                        className="h-8 text-sm"
                        value={item.chequeNumber}
                        onChange={(value) =>
                          updateSplitAmountField(index, 'chequeNumber', value)
                        }
                      />
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => removePaymentPlanRow(index)}
                        className="flex items-center justify-center w-8 h-8 transition-colors bg-red-100 rounded-full dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30"
                        disabled={splitAmountData.length === 1}
                      >
                        <Image
                          src="/close.svg"
                          alt="remove"
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 dark:bg-slate-900/60 dark:border-slate-700">
                <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  Total Split Amount: {formatNumber(totalSplitAmount)}
                </div>
                {!isValidationPassed && (
                  <div className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                    {validationError}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="py-3">
            <TextField
              fullWidth
              label="Comment"
              variant="outlined"
              placeholder="Comment"
              className="rounded-md"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '46px',
                  borderRadius: '8px',
                  border: '1px solid #CAD5E2',
                  backgroundColor: 'transparent',
                  color: 'inherit',
                },
                '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                  borderColor: '#2563EB',
                },
                '& .MuiOutlinedInput-root fieldset': {
                  borderColor: 'rgba(148, 163, 184, 0.4)',
                },
                '& .MuiOutlinedInput-root:hover fieldset': {
                  borderColor: '#2563EB',
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(148, 163, 184, 0.8)',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#2563EB',
                },
              }}
            />
          </div>
          <div className="self-end">
            <button
              onClick={() => {
                if (validateSplitAmount()) {
                  // Handle submit logic here
                  alert('Transaction submitted successfully!')
                }
              }}
              disabled={!isValidationPassed}
              className={`h-8 gap-1.5 py-1.5 px-2.5 rounded-md border flex font-sans text-sm font-medium leading-5 tracking-[0%] transition-colors ${
                isValidationPassed
                  ? 'opacity-100 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  : 'opacity-50 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default UnallocatedTransactionDetailsPage
