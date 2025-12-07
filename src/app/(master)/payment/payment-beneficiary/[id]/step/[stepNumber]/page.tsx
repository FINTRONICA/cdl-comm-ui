'use client'

import { Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import PaymentBeneficiaryStepperWrapper from '@/components/organisms/Master/PaymentStepper/PaymentBeneficiaryStepper'
import { GlobalLoading } from '@/components/atoms'
import {
  paymentBeneficiaryService,
  type PaymentBeneficiary,
} from '@/services/api/masterApi/Payment/paymentBeneficiaryService'

function PaymentBeneficiaryStepPageContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isValidating, setIsValidating] = useState(true)
  const [paymentBeneficiaryData, setPaymentBeneficiaryData] =
    useState<PaymentBeneficiary | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const paymentBeneficiaryId = params.id as string
  const stepNumber = parseInt(params.stepNumber as string)

  // Get mode and editing from URL params
  const mode = searchParams.get('mode')
  const editing = searchParams.get('editing')
  const isViewMode = mode === 'view'
  const isEditingMode = editing === 'true'

  // Validate step number
  useEffect(() => {
    if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 3) {
      router.push('/payment/payment-beneficiary')
      return
    }
    setIsValidating(false)
  }, [stepNumber, router])

  // Fetch payment beneficiary data
  useEffect(() => {
    const fetchPaymentBeneficiaryData = async () => {
      try {
        setIsLoadingData(true)
        setError(null)
        const data =
          await paymentBeneficiaryService.getPaymentBeneficiary(
            paymentBeneficiaryId
          )
        setPaymentBeneficiaryData(data)
      } catch (err: unknown) {
        console.error('[PaymentBeneficiaryStepPage] Error fetching data:', err)
        const error = err as { 
          message?: string
          response?: { 
            data?: { message?: string }
            status?: number
          }
        }
        const errorMessage = 
          error.response?.data?.message ||
          error.message ||
          `Failed to fetch payment beneficiary data${error.response?.status ? ` (${error.response.status})` : ''}`
        setError(errorMessage)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (paymentBeneficiaryId && !isValidating) {
      fetchPaymentBeneficiaryData()
    }
  }, [paymentBeneficiaryId, isValidating])

  if (isValidating || isLoadingData) {
    return (
      <DashboardLayout title="Payment Beneficiary Details" subtitle="">
        <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Payment Beneficiary Details"
      subtitle={
        isViewMode
          ? 'View payment beneficiary details and configuration (Read-only)'
          : isEditingMode
            ? 'Edit payment beneficiary details and configuration'
            : 'Register your payment beneficiary step by step, non-mandatory fields and steps are easy to skip.'
      }
    >
      {error && (
        <div className="mx-7 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-red-600 dark:text-red-400">
              <p className="font-semibold">Warning: {error}</p>
              <p className="text-sm mt-1 text-red-500 dark:text-red-400">
                Some data may not be pre-filled. The stepper will attempt to load data independently.
              </p>
            </div>
            <button
              onClick={() => {
                setError(null)
                setIsLoadingData(true)
                const fetchPaymentBeneficiaryData = async () => {
                  try {
                    const data = await paymentBeneficiaryService.getPaymentBeneficiary(paymentBeneficiaryId)
                    setPaymentBeneficiaryData(data)
                    setError(null)
                  } catch (err: unknown) {
                    const error = err as { 
                      message?: string
                      response?: { 
                        data?: { message?: string }
                        status?: number
                      }
                    }
                    const errorMessage = 
                      error.response?.data?.message ||
                      error.message ||
                      `Failed to fetch payment beneficiary data${error.response?.status ? ` (${error.response.status})` : ''}`
                    setError(errorMessage)
                  } finally {
                    setIsLoadingData(false)
                  }
                }
                fetchPaymentBeneficiaryData()
              }}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      <div className="flex items-start py-2 gap-7 px-7">
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
            Beneficiary Account Number
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
            {paymentBeneficiaryData?.beneficiaryAccountNumber ||
              'N/A'}
          </span>
        </div>
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
            Bank IFSC Code
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
            {paymentBeneficiaryData?.beneficiaryBankIfscCode || 'N/A'}
          </span>
        </div>
      </div>
      <div className="px-3 mt-[10px] bg-white/75 dark:bg-[#101828] p-2 border-radius-md">
        <PaymentBeneficiaryStepperWrapper
          paymentBeneficiaryId={paymentBeneficiaryId}
          initialStep={stepNumber - 1}
          isViewMode={isViewMode}
        />
      </div>
    </DashboardLayout>
  )
}

export default function PaymentBeneficiaryStepPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Payment Beneficiary Details" subtitle="">
          <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
            <GlobalLoading fullHeight />
          </div>
        </DashboardLayout>
      }
    >
      <PaymentBeneficiaryStepPageContent />
    </Suspense>
  )
}
