'use client'

import { Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import AccountStepperWrapper from '@/components/organisms/Master/AccountStepper'
import { GlobalLoading } from '@/components/atoms'
import {
  accountService,
  type Account,
} from '@/services/api/masterApi/Entitie/accountService'

function AccountStepPageContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isValidating, setIsValidating] = useState(true)
  const [accountData, setAccountData] = useState<Account | null>(
    null
  )
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const accountId = params.id as string
  const stepNumber = parseInt(params.stepNumber as string)

  // Get mode and editing from URL params (matching capital partner pattern)
  const mode = searchParams.get('mode')
  const editing = searchParams.get('editing')
  const isViewMode = mode === 'view'
  const isEditingMode = editing === 'true'

  // Validate step number and fetch account data
  useEffect(() => {
    if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 3) {
      router.push('/escrow-account')
      return
    }
    setIsValidating(false)
  }, [stepNumber, router])

  // Fetch account data
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setIsLoadingData(true)
        setError(null)
        const data = await accountService.getAccount(accountId)
        setAccountData(data)
      } catch (err: unknown) {
        const error = err as { message?: string }
        setError(error.message || 'Failed to fetch account data')
      } finally {
        setIsLoadingData(false)
      }
    }

    if (accountId && !isValidating) {
      fetchAccountData()
    }
  }, [accountId, isValidating])

  if (isValidating || isLoadingData) {
    return (
      <DashboardLayout title="Account Details" subtitle="">
        <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        title="Account Details"
        subtitle="Error loading account details"
      >
        <div className="p-6 text-red-600 dark:text-red-400">
          <p>Error: {error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Account Details"
      subtitle={
        isViewMode
          ? 'View account details and configuration (Read-only)'
          : isEditingMode
            ? 'Edit account details and configuration'
            : 'Register your account step by step, non-mandatory fields and steps are easy to skip.'
      }
    >
      <div className="flex items-start py-2 gap-7 px-7">
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
            Account Name
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
            {accountData?.accountDisplayName || 'N/A'}
          </span>
        </div>
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
            Account Number
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
            {accountData?.accountNumber || 'N/A'}
          </span>
        </div>
      </div>
      <div className="px-3 mt-[10px] bg-white/75 dark:bg-[#101828] p-2 border-radius-md">
        <AccountStepperWrapper
          accountId={accountId}
          initialStep={stepNumber - 1}
          isViewMode={isViewMode}
        />
      </div>
    </DashboardLayout>
  )
}

  export default function AccountStepPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Account Details" subtitle="">
          <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
            <GlobalLoading fullHeight />
          </div>
        </DashboardLayout>
      }
    >
      <AccountStepPageContent />
    </Suspense>
  )
}


