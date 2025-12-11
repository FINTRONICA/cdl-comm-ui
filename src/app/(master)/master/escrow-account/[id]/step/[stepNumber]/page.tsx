'use client'

import { Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import EscrowAccountStepperWrapper from '@/components/organisms/Master/EscrowAccountStepper'
import { GlobalLoading } from '@/components/atoms'
import {
  escrowAccountService,
  type MasterEscrowAccountResponse,
} from '@/services/api/masterApi/Customer/escrowAccountService'

function EscrowAccountStepPageContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isValidating, setIsValidating] = useState(true)
  const [escrowAccountData, setEscrowAccountData] =
    useState<MasterEscrowAccountResponse | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const escrowAccountId = params?.id as string | undefined
  const stepNumberParam = params?.stepNumber as string | undefined
  const stepNumber = stepNumberParam ? parseInt(stepNumberParam) : NaN

  const mode = searchParams.get('mode')
  const editing = searchParams.get('editing')
  const view = searchParams.get('view')
  const isViewMode = mode === 'view' || view === 'true'
  const isEditingMode = editing === 'true'

  useEffect(() => {
    if (!escrowAccountId || escrowAccountId === 'undefined' || escrowAccountId === 'null') {
      router.push('/master/escrow-account')
      return
    }

    if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 3) {
      router.push(
        `/master/escrow-account/${escrowAccountId}/step/1${editing ? '?editing=true' : ''}`
      )
      return
    }

    setIsValidating(false)
  }, [escrowAccountId, stepNumber, router, editing])

  useEffect(() => {
    const fetchEscrowAccountData = async () => {
      if (!escrowAccountId || escrowAccountId === 'undefined' || escrowAccountId === 'null') {
        if (process.env.NODE_ENV === 'development') {
          console.error(
            '[EscrowAccountStepPage] Invalid escrowAccountId, cannot fetch data:',
            escrowAccountId
          )
        }
        setError('Invalid escrow account ID')
        setIsLoadingData(false)
        return
      }

      try {
        setIsLoadingData(true)
        setError(null)
        if (process.env.NODE_ENV === 'development') {
          console.log('[EscrowAccountStepPage] Fetching escrow account data for ID:', escrowAccountId)
        }
        const data = await escrowAccountService.getEscrowAccount(escrowAccountId)
        if (process.env.NODE_ENV === 'development') {
          console.log('[EscrowAccountStepPage] Escrow account data fetched:', data)
        }
        setEscrowAccountData(data)
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch escrow account data'
        if (process.env.NODE_ENV === 'development') {
          console.error('[EscrowAccountStepPage] Error fetching escrow account data:', err)
        }
        setError(errorMessage)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (
      escrowAccountId &&
      escrowAccountId !== 'undefined' &&
      escrowAccountId !== 'null' &&
      !isValidating
    ) {
      fetchEscrowAccountData()
    } else if (!escrowAccountId || escrowAccountId === 'undefined' || escrowAccountId === 'null') {
      if (process.env.NODE_ENV === 'development') {
        console.error('[EscrowAccountStepPage] Missing or invalid escrowAccountId:', escrowAccountId)
      }
      setError('Escrow Account ID is required')
      setIsLoadingData(false)
    }
  }, [escrowAccountId, isValidating])

  if (isValidating || isLoadingData) {
    return (
      <DashboardLayout title="Master : Escrow Account" subtitle="">
        <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        title="Master : Escrow Account"
        subtitle="Error loading escrow account details"
      >
        <div className="p-6 text-red-600 dark:text-red-400">
          <p>Error: {error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Master : Escrow Account"
      subtitle={
        isViewMode
          ? 'View escrow account details and configuration (Read-only)'
          : isEditingMode
            ? 'Edit escrow account details and configuration'
            : 'Register your escrow account step by step, non-mandatory fields and steps are easy to skip.'
      }
    >
      <div className="flex items-start py-2 gap-7 px-7">
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
            Escrow Account Name
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
            {escrowAccountData?.escrowAccountFullName || 'N/A'}
          </span>
        </div>
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
            Account Number
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
            {escrowAccountData?.escrowAccountNumber || 'N/A'}
          </span>
        </div>
      </div>
      <div className="px-3 mt-[10px] bg-white/75 dark:bg-[#101828] p-2 border-radius-md">
        {escrowAccountId &&
        escrowAccountId !== 'undefined' &&
        escrowAccountId !== 'null' ? (
          <EscrowAccountStepperWrapper
            escrowAccountId={escrowAccountId as string}
            initialStep={stepNumber - 1}
            isViewMode={isViewMode}
          />
        ) : (
          <div className="p-6 text-red-600 dark:text-red-400">
            <p>Error: Invalid Escrow Account ID</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function EscrowAccountStepPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Master : Escrow Account" subtitle="">
          <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
            <GlobalLoading fullHeight />
          </div>
        </DashboardLayout>
      }
    >
      <EscrowAccountStepPageContent />
    </Suspense>
  )
}


