'use client'

import { Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import PaymentInstructionStepperWrapper from '@/components/organisms/Master/PaymentStepper/paymentInstructionStepper'
import { GlobalLoading } from '@/components/atoms'
import {
  paymentInstructionService,
  type PaymentInstruction,
} from '@/services/api/masterApi/Payment/paymentInstructionService'

function PaymentInstructionStepPageContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isValidating, setIsValidating] = useState(true)
  const [paymentInstructionData, setPaymentInstructionData] =
    useState<PaymentInstruction | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const paymentInstructionId = params.id as string
  const stepNumber = parseInt(params.stepNumber as string)

  // Get mode and editing from URL params
  const mode = searchParams.get('mode')
  const editing = searchParams.get('editing')
  const isViewMode = mode === 'view'
  const isEditingMode = editing === 'true'

  // Validate step number
  useEffect(() => {
    if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 3) {
      router.push('/payment-instruction')
      return
    }
    setIsValidating(false)
  }, [stepNumber, router])

  // Fetch payment instruction data
  useEffect(() => {
    const fetchPaymentInstructionData = async () => {
      try {
        setIsLoadingData(true)
        setError(null)
        const data =
          await paymentInstructionService.getPaymentInstruction(
            paymentInstructionId
          )
        setPaymentInstructionData(data)
      } catch (err: unknown) {
        const error = err as { message?: string }
        setError(
          error.message || 'Failed to fetch payment instruction data'
        )
      } finally {
        setIsLoadingData(false)
      }
    }

    if (paymentInstructionId && !isValidating) {
      fetchPaymentInstructionData()
    }
  }, [paymentInstructionId, isValidating])

  if (isValidating || isLoadingData) {
    return (
      <DashboardLayout title="Payment Instruction Details" subtitle="">
        <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        title="Payment Instruction Details"
        subtitle="Error loading payment instruction details"
      >
        <div className="p-6 text-red-600 dark:text-red-400">
          <p>Error: {error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Payment Instruction Details"
      subtitle={
        isViewMode
          ? 'View payment instruction details and configuration (Read-only)'
          : isEditingMode
            ? 'Edit payment instruction details and configuration'
            : 'Register your payment instruction step by step, non-mandatory fields and steps are easy to skip.'
      }
    >
      <div className="flex items-start py-2 gap-7 px-7">
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
            Reference Number
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
            {paymentInstructionData?.standingInstructionReferenceNumber ||
              'N/A'}
          </span>
        </div>
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
            Client Full Name
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
            {paymentInstructionData?.clientFullName || 'N/A'}
          </span>
        </div>
      </div>
      <div className="px-3 mt-[10px] bg-white/75 dark:bg-[#101828] p-2 border-radius-md">
        <PaymentInstructionStepperWrapper
          paymentInstructionId={paymentInstructionId}
          initialStep={stepNumber - 1}
          isViewMode={isViewMode}
        />
      </div>
    </DashboardLayout>
  )
}

export default function PaymentInstructionStepPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Payment Instruction Details" subtitle="">
          <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
            <GlobalLoading fullHeight />
          </div>
        </DashboardLayout>
      }
    >
      <PaymentInstructionStepPageContent />
    </Suspense>
  )
}
