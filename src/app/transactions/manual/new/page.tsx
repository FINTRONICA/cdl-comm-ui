'use client'
import { Suspense } from 'react'
import ManualPaymentStepperWrapper from '@/components/organisms/ManualPaymentStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { useManualPaymentLabelsWithCache } from '@/hooks/useManualPaymentLabelsWithCache'
import { MANUAL_PAYMENT_LABELS } from '@/constants/mappings/manualPaymentLabels'

function ManualPaymentContent() {
  const { getLabel } = useManualPaymentLabelsWithCache('EN')

  const pageTitle = getLabel(
    MANUAL_PAYMENT_LABELS.PAGE_TITLE,
    'EN',
    MANUAL_PAYMENT_LABELS.FALLBACKS.PAGE_TITLE
  )
  const pageSubtitle =
    'Register your Manual Payment details step by step, non-mandatory fields and steps are easy to skip.'

  return (
    <DashboardLayout title={pageTitle} subtitle={pageSubtitle}>
      <div className="px-3">
        <ManualPaymentStepperWrapper />
      </div>
    </DashboardLayout>
  )
}

export default function NewManualPaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ManualPaymentContent />
    </Suspense>
  )
}
