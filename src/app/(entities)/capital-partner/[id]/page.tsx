'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import InvestorsStepperWrapper from '@/components/organisms/InvestorStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import {
  capitalPartnerService,
  type CapitalPartnerResponse,
} from '@/services/api/capitalPartnerService'
import { GlobalLoading } from '@/components/atoms'

function InvestorStepPageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const capitalPartnerId = params.id as string
  const mode = searchParams.get('mode')
  const editing = searchParams.get('editing')
  const isViewMode = mode === 'view'
  const isEditingMode = editing === 'true'

  const [capitalPartnerData, setCapitalPartnerData] =
    useState<CapitalPartnerResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch capital partner data when component mounts
  useEffect(() => {
    const fetchCapitalPartnerData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await capitalPartnerService.getCapitalPartnerById(
          parseInt(capitalPartnerId)
        )
        setCapitalPartnerData(data)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch capital partner data')
      } finally {
        setIsLoading(false)
      }
    }

    if (capitalPartnerId) {
      fetchCapitalPartnerData()
    }
  }, [capitalPartnerId])

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Capital Partner Details" subtitle="">
        <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout
        title="Capital Partner Details"
        subtitle="Error loading investor details"
      >
        <div className="p-6 text-red-600">
          <p>Error: {error}</p>
          <button
            onClick={() => router.push('/capital-partner')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Investors
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Capital Partner Details"
      subtitle={
        isViewMode
          ? 'View capital partner details and configuration (Read-only)'
          : isEditingMode
            ? 'Edit capital partner details and configuration'
            : 'Manage your capital partner details and configuration'
      }
    >
      <div className="flex gap-7 items-start px-7 py-2">
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-white">
            Capital Partner Name
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-white">
            {capitalPartnerData
              ? `${capitalPartnerData.capitalPartnerName || ''} ${capitalPartnerData.capitalPartnerMiddleName || ''} ${capitalPartnerData.capitalPartnerLastName || ''}`.trim() ||
                'N/A'
              : 'N/A'}
          </span>
        </div>
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-white">
            Capital Partner ID
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-white">
            {capitalPartnerData?.capitalPartnerId || 'N/A'}
          </span>
        </div>
      </div>
      <div className="px-3 mt-[10px]">
        <InvestorsStepperWrapper
          initialCapitalPartnerId={
            capitalPartnerId ? parseInt(capitalPartnerId) : null
          }
          initialStep={0}
          isViewMode={isViewMode}
        />
      </div>
    </DashboardLayout>
  )
}

export default function InvestorStepPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Capital Partner Details" subtitle="">
          <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
            <GlobalLoading fullHeight />
          </div>
        </DashboardLayout>
      }
    >
      <InvestorStepPageContent />
    </Suspense>
  )
}
