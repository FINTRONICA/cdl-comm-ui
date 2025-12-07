'use client'
import { Suspense } from 'react'
import ManualPaymentStepperWrapper from '@/components/organisms/ManualPaymentStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { useManualPaymentLabelsWithCache } from '@/hooks/useManualPaymentLabelsWithCache'
import { MANUAL_PAYMENT_LABELS } from '@/constants/mappings/manualPaymentLabels'
import { useSearchParams, useParams } from 'next/navigation'
import { fundEgressService } from '@/services/api/fundEgressService'
import { buildPartnerService } from '@/services/api/buildPartnerService'
import { useState, useEffect } from 'react'
import { GlobalLoading, GlobalError } from '@/components/atoms'

function ManualPaymentWithIdContent() {
  const { getLabel } = useManualPaymentLabelsWithCache('EN')
  const searchParams = useSearchParams()
  const params = useParams()

  // Check if we're in view mode (read-only)
  const mode = searchParams.get('mode')
  const isViewMode = mode === 'view'

  // State for payment data
  const [paymentData, setPaymentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch payment data when ID is available
  useEffect(() => {
    const fetchPaymentData = async () => {
      if (params.id) {
        try {
          setLoading(true)
          setError(null)
          const data = await fundEgressService.getFundEgressById(
            params.id as string
          )

          // If buildPartnerDTO is missing or only has id without bpName, fetch full build partner details
          let buildPartnerId: number | null = null

          // Check if buildPartnerDTO exists and has an ID
          if (data?.buildPartnerDTO?.id) {
            buildPartnerId = data.buildPartnerDTO.id
          }
          // Fallback: try to get build partner ID from realEstateAssestDTO (if it exists in the actual response)
          else if ((data?.realEstateAssestDTO as any)?.buildPartnerDTO?.id) {
            buildPartnerId = (data.realEstateAssestDTO as any).buildPartnerDTO
              .id
            // Initialize buildPartnerDTO if it doesn't exist
            if (!data.buildPartnerDTO) {
              data.buildPartnerDTO = { id: buildPartnerId } as any
            }
          }

          // If we have an ID but no bpName, fetch full build partner details
          if (
            buildPartnerId &&
            (!data?.buildPartnerDTO?.bpName ||
              data.buildPartnerDTO.bpName === '')
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
                'Failed to fetch build partner details for header:',
                partnerErr
              )
              // Continue even if partner fetch fails - will show N/A
            }
          } else if (!data?.buildPartnerDTO && data?.id) {
            // Log warning if buildPartnerDTO is completely missing
            console.warn(
              'buildPartnerDTO is null or missing in payment data:',
              {
                paymentId: data.id,
                hasRealEstateAsset: !!data.realEstateAssestDTO,
                realEstateAssetPartnerId: (data.realEstateAssestDTO as any)
                  ?.buildPartnerDTO?.id,
              }
            )
          }

          setPaymentData(data)
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : 'Failed to load payment data'
          )
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchPaymentData()
  }, [params.id])

  const pageTitle = getLabel(
    MANUAL_PAYMENT_LABELS.PAGE_TITLE,
    'EN',
    MANUAL_PAYMENT_LABELS.FALLBACKS.PAGE_TITLE
  )
  const pageSubtitle = isViewMode
    ? 'View Manual Payment details (Read-only mode)'
    : 'Register your Manual Payment details step by step, non-mandatory fields and steps are easy to skip.'

  // Show loading state while fetching payment data
  if (loading && params.id) {
    return (
      <DashboardLayout title={pageTitle} subtitle="">
        <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
          <GlobalLoading fullHeight />
        </div>
      </DashboardLayout>
    )
  }

  // Show error state if there was an error loading payment data
  if (error) {
    return (
      <DashboardLayout title={pageTitle} subtitle="">
        <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
          <GlobalError
            error={error}
            onRetry={() => window.location.reload()}
            title="Error loading manual payment data"
            fullHeight
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={pageTitle} subtitle={pageSubtitle}>
      <div className="px-3 mt-[10px] bg-white/75 dark:bg-[#101828] p-3 rounded-xl">
        {/* Manual Payment Summary for Both View and Edit Mode */}
        {params.id && (
          <div className="flex gap-7 items-start px-7 py-2 mb-4">
            <div className="flex flex-col min-w-[200px] gap-1">
              <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
                {getLabel(
                  MANUAL_PAYMENT_LABELS.FORM_FIELDS.TAS_REFERENCE,
                  'EN',
                  MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.TAS_REFERENCE
                )}
                *
              </label>
              <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
                {loading
                  ? 'Loading...'
                  : paymentData?.fePaymentRefNumber || 'N/A'}
              </span>
            </div>
            <div className="flex flex-col min-w-[200px] gap-1">
              <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-gray-600 dark:text-gray-400">
                {getLabel(
                  MANUAL_PAYMENT_LABELS.FORM_FIELDS.DEVELOPER_NAME,
                  'EN',
                  MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.DEVELOPER_NAME
                )}
              </label>
              <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-gray-900 dark:text-gray-100">
                {loading
                  ? 'Loading...'
                  : paymentData?.buildPartnerDTO?.bpName || 'N/A'}
              </span>
            </div>
          </div>
        )}

        <ManualPaymentStepperWrapper isReadOnly={isViewMode} />
      </div>
    </DashboardLayout>
  )
}

export default function ManualPaymentWithIdPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ManualPaymentWithIdContent />
    </Suspense>
  )
}
