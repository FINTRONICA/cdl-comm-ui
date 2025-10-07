'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import DeveloperStepperWrapper from '@/components/organisms/DeveloperStepper'
import { Spinner } from '@/components/atoms/Spinner'
import {
  buildPartnerService,
  type BuildPartner,
} from '@/services/api/buildPartnerService'

export default function DeveloperStepPage() {
  const params = useParams()
  const router = useRouter()
  const [isValidating, setIsValidating] = useState(true)
  const [buildPartnerData, setBuildPartnerData] = useState<BuildPartner | null>(
    null
  )
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const developerId = params.id as string
  const stepNumber = parseInt(params.stepNumber as string)

  // Validate step number and fetch build partner data
  useEffect(() => {
    if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 6) {
      router.push('/developers')
      return
    }
    setIsValidating(false)
  }, [stepNumber, router])

  // Fetch build partner data
  useEffect(() => {
    const fetchBuildPartnerData = async () => {
      try {
        setIsLoadingData(true)
        setError(null)
        const data = await buildPartnerService.getBuildPartner(developerId)
        setBuildPartnerData(data)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch build partner data')
      } finally {
        setIsLoadingData(false)
      }
    }

    if (developerId && !isValidating) {
      fetchBuildPartnerData()
    }
  }, [developerId, isValidating])

  if (isValidating || isLoadingData) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        title="Build Partner Details"
        subtitle="Error loading build partner details"
      >
        <div className="p-6 text-red-600">
          <p>Error: {error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Build Partner Details"
      subtitle="Register your developer step by step, non-mandatory fields and steps are easy to skip."
    >
      <div className="flex gap-7 items-start px-7 py-2">
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-[#4A5565]">
            Build Partner Name
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-[#1E2939]">
            {buildPartnerData?.bpName || 'N/A'}
          </span>
        </div>
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-[#4A5565]">
            Build Partner CIF
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-[#1E2939]">
            {buildPartnerData?.bpCifrera || 'N/A'}
          </span>
        </div>
      </div>
      <div className="px-3 mt-[10px] bg-white p-2 border-radius-md">
        <DeveloperStepperWrapper
          developerId={developerId}
          initialStep={stepNumber - 1}
        />
      </div>
    </DashboardLayout>
  )
}
