'use client'

import { Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import PartyStepperWrapper from '@/components/organisms/Master/PartyStepper'
import { GlobalLoading } from '@/components/atoms'
import {
  partyService,
  type Party,
} from '@/services/api/masterApi/Customer/partyService'

function PartyStepPageContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isValidating, setIsValidating] = useState(true)
  const [partyData, setPartyData] = useState<Party | null>(
    null
  )
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Extract partyId and stepNumber from params with validation
  const partyId = params?.id as string | undefined
  const stepNumberParam = params?.stepNumber as string | undefined
  const stepNumber = stepNumberParam ? parseInt(stepNumberParam) : NaN

  // Get mode and editing from URL params (matching capital partner pattern)
  const mode = searchParams.get('mode')
  const editing = searchParams.get('editing') // Changed from 'edit' to 'editing' to match Capital Partner pattern
  const view = searchParams.get('view')
  const isViewMode = mode === 'view' || view === 'true'
  const isEditingMode = editing === 'true'

  // Validate partyId and step number
  useEffect(() => {
    // Check if partyId is valid
    if (!partyId || partyId === 'undefined' || partyId === 'null') {
      router.push('/master/party')
      return
    }

    // Check if stepNumber is valid
    if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 4) {
      router.push(`/master/party/${partyId}/step/1${editing ? '?editing=true' : ''}`)
      return
    }

    setIsValidating(false)
  }, [partyId, stepNumber, router, editing])

  // Fetch party data
  useEffect(() => {
    const fetchPartyData = async () => {
      // Validate partyId before making API call
      if (!partyId || partyId === 'undefined' || partyId === 'null') {
        setError('Invalid party ID')
        setIsLoadingData(false)
        return
      }

      try {
        setIsLoadingData(true)
        setError(null)
        const data = await partyService.getParty(partyId)
        setPartyData(data)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch party data'
        setError(errorMessage)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (partyId && partyId !== 'undefined' && partyId !== 'null' && !isValidating) {
      fetchPartyData()
    } else if (!partyId || partyId === 'undefined' || partyId === 'null') {
      setError('Party ID is required')
      setIsLoadingData(false)
    }
  }, [partyId, isValidating])

  if (isValidating || isLoadingData) {
    return (
      <DashboardLayout title="Party Details" subtitle="">
        <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        title="Party Details"
        subtitle="Error loading party details"
      >
        <div className="p-6 text-red-600 dark:text-red-400">
          <p>Error: {error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    // <DashboardLayout
    //   title="Party Details"
    //   subtitle={
    //     isViewMode
    //       ? 'View party details and configuration (Read-only)'
    //       : isEditingMode
    //         ? 'Edit party details and configuration'
    //         : 'Register your party step by step, non-mandatory fields and steps are easy to skip.'
    //   }
    // >
     <>
      <div className="flex items-start py-2 gap-7 px-7">
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
            Party Name
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
            {partyData?.partyFullName || 'N/A'}
          </span>
        </div>
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
            Party CIF
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
            {partyData?.partyCifNumber || 'N/A'}
          </span>
        </div>
      </div>
      <div className="px-3 mt-[10px] bg-white/75 dark:bg-[#101828] p-2 border-radius-md">
        {partyId && partyId !== 'undefined' && partyId !== 'null' ? (
          <PartyStepperWrapper
            partyId={partyId as string}
            initialStep={stepNumber - 1}
            isViewMode={isViewMode}
            isEditingMode={isEditingMode}
          />
        ) : (
          <div className="p-6 text-red-600 dark:text-red-400">
            <p>Error: Invalid Party ID</p>
          </div>
        )}
      </div>
     </>
    // </DashboardLayout>
  )
}

export default function PartyStepPage() {
  return (
    <Suspense
      fallback={
        // <DashboardLayout title="Party Details" subtitle="">
          <div className="bg-white/75 dark:bg-[#101828] rounded-2xl flex flex-col h-full">
            <GlobalLoading fullHeight />
          </div>
        // </DashboardLayout>
      }
    >
      <PartyStepPageContent />
    </Suspense>
  )
}

