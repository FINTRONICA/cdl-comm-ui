'use client'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import GuaranteeStepperWrapper from '@/components/organisms/GuaranteeStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { useSuretyBondTranslationsByPattern } from '@/hooks/useSuretyBondTranslations'
import {
  suretyBondService,
  type SuretyBondResponse,
} from '@/services/api/suretyBondService'
import { GlobalLoading, GlobalError } from '@/components/atoms'

export default function GuaranteeWithIdPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [suretyBondData, setSuretyBondData] =
    useState<SuretyBondResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const suretyBondId = params.id as string
  const mode = searchParams.get('mode')
  const isViewMode = mode === 'view'

  // Use surety bond translations for labels
  const { translations: sbTranslations, loading: sbTranslationsLoading } =
    useSuretyBondTranslationsByPattern('CDL_SB_')

  // Helper function to get translated label
  const getTranslatedLabel = (configId: string, fallback: string): string => {
    if (sbTranslationsLoading || !sbTranslations.length) {
      return fallback
    }

    const translation = sbTranslations.find((t) => t.configId === configId)
    return translation?.configValue || fallback
  }

  // Dynamic guarantee title using translations
  const guaranteeTitle = getTranslatedLabel('CDL_SB_HEADING', 'Surety Bond')

  // Fetch surety bond data
  useEffect(() => {
    const fetchSuretyBondData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Only fetch data if it's not a temporary ID
        if (!suretyBondId.startsWith('temp_')) {
          const data = await suretyBondService.getSuretyBondById(suretyBondId)
          setSuretyBondData(data)
        } else {
          // For temporary IDs, set loading to false without fetching
          setSuretyBondData(null)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch surety bond data')
      } finally {
        setIsLoading(false)
      }
    }

    if (suretyBondId) {
      fetchSuretyBondData()
    }
  }, [suretyBondId])

  if (isLoading) {
    return (
      <DashboardLayout title={`${guaranteeTitle}`} subtitle="">
        <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title={`${guaranteeTitle}`} subtitle="">
        <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
          <GlobalError
            error={error}
            onRetry={() => window.location.reload()}
            title="Error loading guarantee details"
            fullHeight
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={`${guaranteeTitle} Details`} subtitle="">
      {suretyBondData && (
        <div className="flex gap-7 items-start px-7 py-2">
          <div className="flex flex-col min-w-[200px] gap-1">
            <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
              Surety Bond Ref No
            </label>
            <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
              {suretyBondData.suretyBondReferenceNumber || 'N/A'}
            </span>
          </div>
          <div className="flex flex-col min-w-[200px] gap-1">
            <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
              Build Partner Assets Name
            </label>
            <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
              {suretyBondData.realEstateAssestDTO?.reaName || 'N/A'}
            </span>
          </div>
        </div>
      )}
      <div className="px-3 mt-[10px] bg-white/75 dark:bg-[#101828] p-2 border-radius-md">
        <GuaranteeStepperWrapper isViewMode={isViewMode} />
      </div>
    </DashboardLayout>
  )
}
