'use client'

import { Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import AgreementFeeScheduleStepperWrapper from '@/components/organisms/Master/AgreementFeeScheduleStepper'
import { GlobalLoading } from '@/components/atoms'
import { useAgreementFeeSchedule } from '@/hooks'

function AgreementFeeScheduleStepPageContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isValidating, setIsValidating] = useState(true)

  const agreementFeeScheduleId = params.id as string
  const stepNumber = parseInt(params.stepNumber as string)

  // Get mode and editing from URL params (matching capital partner pattern)
  const mode = searchParams.get('mode')
  const editing = searchParams.get('editing')
  const isViewMode = mode === 'view'
  const isEditingMode = editing === 'true'

  // Use React Query hook for data fetching (prevents duplicate API calls)
  const {
    data: agreementFeeScheduleData,
    isLoading: isLoadingData,
    error: queryError,
  } = useAgreementFeeSchedule(agreementFeeScheduleId)

  // Validate step number
  useEffect(() => {
    if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 3) {
      router.push('/agreement-fee-schedule')
      return
    }
    setIsValidating(false)
  }, [stepNumber, router])

  if (isValidating || isLoadingData) {
    return (
      <DashboardLayout title="Agreement Fee Schedule Details" subtitle="">
        <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }

  const error = queryError
    ? (queryError as { message?: string })?.message || 'Failed to fetch agreement fee schedule data'
    : null

  if (error) {
    return (
      <DashboardLayout
        title="Agreement Fee Schedule Details"
        subtitle="Error loading agreement fee schedule details"
      >
        <div className="p-6 text-red-600 dark:text-red-400">
          <p>Error: {error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Agreement Fee Schedule Details"
      subtitle={
        isViewMode
          ? 'View agreement fee schedule details and configuration (Read-only)'
          : isEditingMode
            ? 'Edit agreement fee schedule details and configuration'
            : 'Register your agreement fee schedule step by step, non-mandatory fields and steps are easy to skip.'
      }
    >
      <div className="flex items-start py-2 gap-7 px-7">
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
            Operating Location
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
            {agreementFeeScheduleData?.operatingLocation || 'N/A'}
          </span>
        </div>
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
            Priority Level
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
            {agreementFeeScheduleData?.priorityLevel || 'N/A'}
          </span>
        </div>
      </div>
      <div className="px-3 mt-[10px] bg-white/75 dark:bg-[#101828] p-2 border-radius-md">
        <AgreementFeeScheduleStepperWrapper
          agreementFeeScheduleId={agreementFeeScheduleId}
          initialStep={stepNumber - 1}
          isViewMode={isViewMode}
        />
      </div>
    </DashboardLayout>
  )
}

export default function AgreementFeeScheduleStepPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Agreement Fee Schedule Details" subtitle="">
          <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
            <GlobalLoading fullHeight />
          </div>
        </DashboardLayout>
      }
    >
      <AgreementFeeScheduleStepPageContent />
    </Suspense>
  )
}
