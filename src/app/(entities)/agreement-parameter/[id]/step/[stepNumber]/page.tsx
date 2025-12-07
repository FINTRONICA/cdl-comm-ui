'use client'

import { Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import AgreementParameterStepperWrapper from '@/components/organisms/Master/AgreementParameterStepper'
import { GlobalLoading } from '@/components/atoms'
import {
  agreementParameterService,
  type AgreementParameter,
} from '@/services/api/masterApi/Entitie/agreementParameterService'

function AgreementParameterStepPageContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isValidating, setIsValidating] = useState(true)
  const [agreementParameterData, setAgreementParameterData] = useState<AgreementParameter | null>(
    null
  )
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const agreementParameterId = params.id as string
  const stepNumber = parseInt(params.stepNumber as string)

  // Get mode and editing from URL params (matching capital partner pattern)
  const mode = searchParams.get('mode')
  const editing = searchParams.get('editing')
  const isViewMode = mode === 'view'
  const isEditingMode = editing === 'true'

  // Validate step number and fetch agreement parameter data
  useEffect(() => {
    if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 3) {
      router.push('/agreement-parameter')
      return
    }
    setIsValidating(false)
  }, [stepNumber, router])

  // Fetch agreement parameter data
  useEffect(() => {
    const fetchAgreementParameterData = async () => {
      try {
        setIsLoadingData(true)
        setError(null)
        const data = await agreementParameterService.getAgreementParameter(agreementParameterId)
        setAgreementParameterData(data)
      } catch (err: unknown) {
        const error = err as { message?: string }
        setError(error.message || 'Failed to fetch agreement parameter data')
      } finally {
        setIsLoadingData(false)
      }
    }

    // Only fetch if agreementParameterId exists and is not "new"
    if (agreementParameterId && agreementParameterId !== 'new' && !isValidating) {
      fetchAgreementParameterData()
    } else if (agreementParameterId === 'new' || !agreementParameterId) {
      // For new agreement parameters, skip loading
      setIsLoadingData(false)
    }
  }, [agreementParameterId, isValidating])

  if (isValidating || isLoadingData) {
    return (
      <DashboardLayout title="Agreement Parameter Details" subtitle="">
        <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        title="Agreement Parameter Details"
        subtitle="Error loading agreement parameter details"
      >
        <div className="p-6 text-red-600 dark:text-red-400">
          <p>Error: {error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Agreement Parameter Details"
      subtitle={
        isViewMode
          ? 'View agreement parameter details and configuration (Read-only)'
          : isEditingMode
            ? 'Edit agreement parameter details and configuration'
            : 'Register your agreement parameter step by step, non-mandatory fields and steps are easy to skip.'
      }
    >
      {agreementParameterId && agreementParameterId !== 'new' && agreementParameterData && (
        <div className="flex items-start py-2 gap-7 px-7">
          <div className="flex flex-col min-w-[200px] gap-1">
            <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
              Agreement Parameter ID
            </label>
            <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
              {agreementParameterData?.id?.toString() || 'N/A'}
            </span>
          </div>
          <div className="flex flex-col min-w-[200px] gap-1">
            <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
              Effective Date
            </label>
            <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
              {agreementParameterData?.agreementEffectiveDate || 'N/A'}
            </span>
          </div>
        </div>
      )}
      <div className="px-3 mt-[10px] bg-white/75 dark:bg-[#101828] p-2 border-radius-md">
        <AgreementParameterStepperWrapper
          agreementParameterId={agreementParameterId}
          initialStep={stepNumber - 1}
          isViewMode={isViewMode}
        />
      </div>
    </DashboardLayout>
  )
}

export default function AgreementParameterStepPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Agreement Parameter Details" subtitle="">
          <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
            <GlobalLoading fullHeight />
          </div>
        </DashboardLayout>
      }
    >
      <AgreementParameterStepPageContent />
    </Suspense>
  )
}

