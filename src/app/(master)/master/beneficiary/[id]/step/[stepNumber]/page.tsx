'use client'

import { Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import BeneficiaryStepperWrapper from '@/components/organisms/Master/BeneficiaryStepper'
import { GlobalLoading } from '@/components/atoms'
import {
  beneficiaryService,
  type MasterBeneficiaryResponse,
} from '@/services/api/masterApi/Customer/beneficiaryService'

function BeneficiaryStepPageContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isValidating, setIsValidating] = useState(true)
  const [beneficiaryData, setBeneficiaryData] =
    useState<MasterBeneficiaryResponse | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const beneficiaryId = params?.id as string | undefined
  const stepNumberParam = params?.stepNumber as string | undefined
  const stepNumber = stepNumberParam ? parseInt(stepNumberParam) : NaN

  const mode = searchParams.get('mode')
  const editing = searchParams.get('editing')
  const view = searchParams.get('view')
  const isViewMode = mode === 'view' || view === 'true'
  const isEditingMode = editing === 'true'

  useEffect(() => {
    if (!beneficiaryId || beneficiaryId === 'undefined' || beneficiaryId === 'null') {
      console.error('[BeneficiaryStepPage] Invalid beneficiaryId:', beneficiaryId)
      router.push('/master/beneficiary')
      return
    }

    if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 3) {
      console.error('[BeneficiaryStepPage] Invalid stepNumber:', stepNumber)
      router.push(
        `/master/beneficiary/${beneficiaryId}/step/1${editing ? '?editing=true' : ''}`
      )
      return
    }

    setIsValidating(false)
  }, [beneficiaryId, stepNumber, router, editing])

  useEffect(() => {
    const fetchBeneficiaryData = async () => {
      if (!beneficiaryId || beneficiaryId === 'undefined' || beneficiaryId === 'null') {
        console.error(
          '[BeneficiaryStepPage] Invalid beneficiaryId, cannot fetch data:',
          beneficiaryId
        )
        setError('Invalid beneficiary ID')
        setIsLoadingData(false)
        return
      }

      try {
        setIsLoadingData(true)
        setError(null)
        console.log('[BeneficiaryStepPage] Fetching beneficiary data for ID:', beneficiaryId)
        const data = await beneficiaryService.getBeneficiary(beneficiaryId)
        console.log('[BeneficiaryStepPage] Beneficiary data fetched:', data)
        setBeneficiaryData(data)
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch beneficiary data'
        console.error('[BeneficiaryStepPage] Error fetching beneficiary data:', err)
        setError(errorMessage)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (
      beneficiaryId &&
      beneficiaryId !== 'undefined' &&
      beneficiaryId !== 'null' &&
      !isValidating
    ) {
      fetchBeneficiaryData()
    } else if (!beneficiaryId || beneficiaryId === 'undefined' || beneficiaryId === 'null') {
      console.error('[BeneficiaryStepPage] Missing or invalid beneficiaryId:', beneficiaryId)
      setError('Beneficiary ID is required')
      setIsLoadingData(false)
    }
  }, [beneficiaryId, isValidating])

  if (isValidating || isLoadingData) {
    return (
      <DashboardLayout title="Master : Beneficiary" subtitle="">
        <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        title="Master : Beneficiary"
        subtitle="Error loading beneficiary details"
      >
        <div className="p-6 text-red-600 dark:text-red-400">
          <p>Error: {error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Master : Beneficiary"
      subtitle={
        isViewMode
          ? 'View beneficiary details and configuration (Read-only)'
          : isEditingMode
            ? 'Edit beneficiary details and configuration'
            : 'Register your beneficiary step by step, non-mandatory fields and steps are easy to skip.'
      }
    >
      <div className="flex items-start py-2 gap-7 px-7">
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
            Beneficiary Name
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
            {beneficiaryData?.beneficiaryFullName || 'N/A'}
          </span>
        </div>
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
            Account Number
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
            {beneficiaryData?.beneficiaryAccountNumber || 'N/A'}
          </span>
        </div>
      </div>
      <div className="px-3 mt-[10px] bg-white/75 dark:bg-[#101828] p-2 border-radius-md">
        {beneficiaryId &&
        beneficiaryId !== 'undefined' &&
        beneficiaryId !== 'null' ? (
          <BeneficiaryStepperWrapper
            beneficiaryId={beneficiaryId as string}
            initialStep={stepNumber - 1}
            isViewMode={isViewMode}
          />
        ) : (
          <div className="p-6 text-red-600 dark:text-red-400">
            <p>Error: Invalid Beneficiary ID</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function BeneficiaryStepPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Master : Beneficiary" subtitle="">
          <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
            <GlobalLoading fullHeight />
          </div>
        </DashboardLayout>
      }
    >
      <BeneficiaryStepPageContent />
    </Suspense>
  )
}

