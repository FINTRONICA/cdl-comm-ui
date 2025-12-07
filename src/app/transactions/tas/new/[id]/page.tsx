'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import TasPaymentStepperWrapper from '@/components/organisms/TasPaymentStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import {
  fundEgressService,
  type FundEgressData,
} from '@/services/api/fundEgressService'
import { buildPartnerService } from '@/services/api/buildPartnerService'
import { GlobalLoading } from '@/components/atoms'

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

        // If buildPartnerDTO is missing or only has id without bpName, fetch full build partner details
        let buildPartnerId: number | null = null

        // Check if buildPartnerDTO exists and has an ID
        if (data?.buildPartnerDTO?.id) {
          buildPartnerId = data.buildPartnerDTO.id
        }
        // Fallback: try to get build partner ID from realEstateAssestDTO (if it exists in the actual response)
        else if ((data?.realEstateAssestDTO as any)?.buildPartnerDTO?.id) {
          buildPartnerId = (data.realEstateAssestDTO as any).buildPartnerDTO.id
          // Initialize buildPartnerDTO if it doesn't exist
          if (!data.buildPartnerDTO) {
            data.buildPartnerDTO = { id: buildPartnerId } as any
          }
        }

        // If we have an ID but no bpName, fetch full build partner details
        if (
          buildPartnerId &&
          (!data?.buildPartnerDTO?.bpName || data.buildPartnerDTO.bpName === '')
        ) {
          try {
            const buildPartner = await buildPartnerService.getBuildPartner(
              buildPartnerId.toString()
            )
            // Merge the full build partner data into buildPartnerDTO
            data.buildPartnerDTO = {
              ...(data.buildPartnerDTO || {}),
              id: buildPartnerId,
              bpName: buildPartner.bpName || '',
              bpDeveloperId: buildPartner.bpDeveloperId || '',
              bpCifrera: buildPartner.bpCifrera || '',
              bpMasterName: buildPartner.bpMasterName || '',
            } as any
          } catch (partnerErr) {
            console.warn(
              'Failed to fetch build partner details for TAS header:',
              partnerErr
            )
            // Continue even if partner fetch fails - will show N/A
          }
        } else if (!data?.buildPartnerDTO && data?.id) {
          // Log warning if buildPartnerDTO is completely missing
          console.warn(
            'buildPartnerDTO is null or missing in TAS payment data:',
            {
              paymentId: data.id,
              hasRealEstateAsset: !!data.realEstateAssestDTO,
              realEstateAssetPartnerId: (data.realEstateAssestDTO as any)
                ?.buildPartnerDTO?.id,
            }
          )
        }

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
      <DashboardLayout title="TAS Payment Details" subtitle="">
        <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
          <GlobalLoading fullHeight />
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
        <div className="flex gap-7 items-start px-7 py-2 mb-4 bg-white/75 dark:bg-[#101828] rounded-lg">
          <div className="flex flex-col min-w-[200px] gap-1">
            <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
              EMS Payment Reference Number
            </label>
            <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
              {tasPaymentData.fePaymentRefNumber || 'N/A'}
            </span>
          </div>
          <div className="flex flex-col min-w-[200px] gap-1">
            <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
              Build Partner Name
            </label>
            <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
              {tasPaymentData.buildPartnerDTO?.bpName || 'N/A'}
            </span>
          </div>
        </div>
      )}
      <div className="px-3 bg-white/75 dark:bg-[#101828] p-2 border-radius-md">
        <TasPaymentStepperWrapper />
      </div>
    </DashboardLayout>
  )
}
