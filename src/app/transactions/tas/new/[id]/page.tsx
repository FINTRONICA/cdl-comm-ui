'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import TasPaymentStepperWrapper from '@/components/organisms/TasPaymentStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import {
  fundEgressService,
  type FundEgressData,
} from '@/services/api/fundEgressService'

export default function TasPaymentWithIdPage() {
  const params = useParams()
  const [tasPaymentData, setTasPaymentData] = useState<FundEgressData | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tasPaymentId = params.id as string

  useEffect(() => {
    const fetchTasPaymentData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fundEgressService.getFundEgressById(tasPaymentId)
        setTasPaymentData(data)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch TAS payment data')
      } finally {
        setIsLoading(false)
      }
    }

    if (tasPaymentId) {
      fetchTasPaymentData()
    }
  }, [tasPaymentId])

  if (isLoading) {
    return (
      <DashboardLayout
        title="TAS Payment Details"
        subtitle="Loading TAS payment details..."
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        title="TAS Payment Details"
        subtitle="Error loading TAS payment details"
      >
        <div className="p-6 text-red-600">
          <p>Error: {error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="TAS Payment Details"
      subtitle="Review TAS payment details step by step, all fields are pre-populated and read-only."
    >
      {tasPaymentData && (
        <div className="flex gap-7 items-start px-7 py-2">
          <div className="flex flex-col min-w-[200px] gap-1">
            <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-[#4A5565]">
              EMS Payment Reference Number
            </label>
            <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-[#1E2939]">
              {tasPaymentData.fePaymentRefNumber || 'N/A'}
            </span>
          </div>
          <div className="flex flex-col min-w-[200px] gap-1">
            <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-[#4A5565]">
              Build Partner Name
            </label>
            <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-[#1E2939]">
              {tasPaymentData.buildPartnerDTO?.bpName || 'N/A'}
            </span>
          </div>
        </div>
      )}
      <div className="px-3 mt-[10px]">
        <TasPaymentStepperWrapper />
      </div>
    </DashboardLayout>
  )
}
