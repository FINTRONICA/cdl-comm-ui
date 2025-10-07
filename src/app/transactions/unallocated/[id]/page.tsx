'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '../../../../components/templates/DashboardLayout'
import { Button } from '../../../../components/atoms/Button'
import { Input } from '../../../../components/atoms/Input'
import { TextField } from '@mui/material'
import { usePendingTransaction } from '@/hooks'
import type { PendingTransaction } from '@/services/api/pendingTransactionService'

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
}

// Define split amount data structure
interface SplitAmountData {
  splitAmount: string
  receivableCategory: string
  receivableSubCategory: string
  unitNoOqoodFormat: string
  investorName: string
  buildingName: string
  depositMode: string
  chequeNumber: string
}

// Map API response to display format
const mapApiToTransactionData = (
  apiData: PendingTransaction
): TransactionData => {
  return {
    id: apiData.id,
    tranReference:
      apiData.ptfiTransactionRefId || apiData.ptfiTransactionId || '—',
    projectName: apiData.realEstateAssestDTO?.reaName || '—',
    developerName: apiData.realEstateAssestDTO?.reaManagedBy || '—',
    narration: apiData.ptfiNarration || '—',
    tranDate: apiData.ptfiTransactionDate
      ? new Date(apiData.ptfiTransactionDate).toLocaleDateString('en-GB')
      : '—',
    unitNoOqoodFormat: apiData.ptfiUnitRefNumber || '—',
    tasUpdate: String(apiData.ptfiTasUpdate),
    tranAmount: apiData.ptfiAmount || 0,
    retentionToBeTaken: apiData.ptfiRetentionAmount ? 'YES' : 'NO',
    status: mapPaymentStatusToStatus(apiData.ptfiTasPaymentStatus),
    description: apiData.ptfiDescription || '—',
    totalAmount: apiData.ptfiTotalAmount || 0,
    currencyCode: apiData.ptfiCurrencyCode || 'AED',
    branchCode: apiData.ptfiBranchCode || '—',
    paymentRefNo: apiData.ptfiPaymentRefNo || '—',
  }
}

// Map payment status to display status
const mapPaymentStatusToStatus = (paymentStatus: string | null): string => {
  switch (paymentStatus?.toUpperCase()) {
    case 'PENDING':
    case 'INCOMPLETE':
      return 'Pending Allocation'
    case 'IN_REVIEW':
    case 'REVIEW':
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
      investorName: '',
      buildingName: '',
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
      investorName: '',
      buildingName: '',
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
  const validateSplitAmount = () => {
    if (transaction && totalSplitAmount > transaction.tranAmount) {
      setValidationError(
        'The total split amount can not be more than the Tran Amount'
      )
      return false
    } else {
      setValidationError('')
      return true
    }
  }

  // Check if validation passes
  const isValidationPassed = transaction
    ? totalSplitAmount <= transaction.tranAmount
    : true

  // Trigger validation when split amount data changes
  React.useEffect(() => {
    if (transaction) {
      validateSplitAmount()
    }
  }, [totalSplitAmount, transaction])

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Transaction Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Transaction Error">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-red-600 mb-4">
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Error Loading...
          </h2>
          <p className="text-gray-600 mb-6">
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Transaction Not Found
          </h2>
          <p className="text-gray-600 mb-6">
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
      <div className="bg-[#FFFFFFBF] py-4 px-6 rounded-2xl">
        <div className=" flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <div className="mt-5 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
              <div className="flex flex-col gap-1">
                <div className="h-[17px]">
                  <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-[#4A5565]">
                    Trans Reference:
                  </p>
                </div>
                <div className="h-[25px]">
                  <p className="font-sans font-normal text-xl leading-none tracking-[0%] align-middle text-[#1E2939]">
                    {transaction.tranReference}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="h-[17px]">
                  <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-[#4A5565]">
                    Project Name
                  </p>
                </div>
                <div className="h-[25px]">
                  <p className="font-sans font-normal text-xl leading-none tracking-[0%] align-middle text-[#1E2939]">
                    {transaction.projectName}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="py-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-[#4A5565]">
                      Developer Name:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-[#1E2939]">
                      {transaction.developerName}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-[#4A5565]">
                      Narration:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-[#1E2939]">
                      [&quot;{transaction.narration}&quot;]
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-[#4A5565]">
                      TAS Update:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-[#1E2939]">
                      {transaction.tasUpdate}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-[#4A5565]">
                      5% Retention to be Taken:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-[#1E2939]">
                      {transaction.retentionToBeTaken}
                    </p>
                  </div>
                </div>
              </div>
              <div className="py-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-[#4A5565]">
                      Tran Date:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-[#1E2939]">
                      {transaction.tranDate}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-[#4A5565]">
                      Unit No. Oqood Format:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-[#1E2939]">
                      {transaction.unitNoOqoodFormat}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-[#4A5565]">
                      Tran Amount:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-[#1E2939]">
                      {formatNumber(transaction.tranAmount)}{' '}
                      {transaction.currencyCode}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-[#4A5565]">
                      Total Amount:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-[#1E2939]">
                      {formatNumber(transaction.totalAmount)}{' '}
                      {transaction.currencyCode}
                    </p>
                  </div>
                </div>
              </div>
              <div className="py-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-[#4A5565]">
                      Payment Reference:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-[#1E2939]">
                      {transaction.paymentRefNo}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-[#4A5565]">
                      Branch Code:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-[#1E2939]">
                      {transaction.branchCode}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-[#4A5565]">
                      Description:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-[#1E2939]">
                      {transaction.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-[17px]">
                    <p className="font-sans font-normal text-xs leading-none tracking-[0%] text-[#4A5565]">
                      Status:
                    </p>
                  </div>
                  <div className="h-[25px]">
                    <p className="font-sans font-normal text-[16px] leading-none tracking-[0%] align-middle text-[#1E2939]">
                      {transaction.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="gap-4 flex flex-col">
            <div className="px-4 flex items-center justify-end">
              <button
                onClick={addPaymentPlanRow}
                className="w-[161px] h-8 gap-1.5 opacity-100 py-1.5 px-2.5 rounded-md border border-[#2563EB] flex   text-[#2563EB] font-sans  text-sm  font-medium leading-5 tracking-[0%]"
              >
                <img src="/circle-plus-blue.svg" alt="plus icon" />
                Add Payment Plan
              </button>
            </div>
            <div>
              <div className="border-b border-black">
                <div className="grid grid-cols-9 gap-4 px-4 py-3 ">
                  <div className="text-sm font-medium text-gray-900">
                    Split Amount*
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Receivable Category*
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Receivable Sub Category*
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Unit no. Oqood Format
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Capital Partner Name
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Building Name
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Deposit Mode
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Cheque Number
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Action
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {splitAmountData.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-9 gap-4 px-4 py-3 hover:bg-gray-50 "
                  >
                    <div className="text-sm text-gray-900">
                      <Input
                        placeholder="Split Amount"
                        className="h-8 text-sm"
                        value={item.splitAmount}
                        onChange={(value) =>
                          updateSplitAmountField(index, 'splitAmount', value)
                        }
                        type="number"
                      />
                    </div>
                    <div className="text-sm text-gray-900">
                      <Input
                        placeholder="Receivable Category"
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
                    <div className="text-sm text-gray-900">
                      <Input
                        placeholder="Receivable Sub Category"
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
                    <div className="text-sm text-gray-900">
                      <Input
                        placeholder="Unit no. Oqood Format"
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
                    <div className="text-sm text-gray-900">
                      <Input
                        placeholder="Capital Partner Name"
                        className="h-8 text-sm"
                        value={item.investorName}
                        onChange={(value) =>
                          updateSplitAmountField(index, 'investorName', value)
                        }
                      />
                    </div>
                    <div className="text-sm text-gray-900">
                      <Input
                        placeholder="Building Name"
                        className="h-8 text-sm"
                        value={item.buildingName}
                        onChange={(value) =>
                          updateSplitAmountField(index, 'buildingName', value)
                        }
                      />
                    </div>
                    <div className="text-sm text-gray-900">
                      <Input
                        placeholder="Deposit Mode"
                        className="h-8 text-sm"
                        value={item.depositMode}
                        onChange={(value) =>
                          updateSplitAmountField(index, 'depositMode', value)
                        }
                      />
                    </div>
                    <div className="text-sm text-gray-900">
                      <Input
                        placeholder="Cheque Number"
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
                        className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200"
                        disabled={splitAmountData.length === 1}
                      >
                        <img
                          src="/close.svg"
                          alt="remove"
                          className="w-4 h-4"
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                <div className="text-sm font-medium text-gray-900">
                  Total Split Amount: {formatNumber(totalSplitAmount)}
                </div>
                {!isValidationPassed && (
                  <div className="mt-2 text-sm text-red-600 font-medium">
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
              className={`h-8 gap-1.5 py-1.5 px-2.5 rounded-md border flex font-sans text-sm font-medium leading-5 tracking-[0%] ${
                isValidationPassed
                  ? 'opacity-100 border-[#2563EB] text-[#2563EB] hover:bg-blue-50'
                  : 'opacity-50 border-gray-300 text-gray-400 cursor-not-allowed'
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
