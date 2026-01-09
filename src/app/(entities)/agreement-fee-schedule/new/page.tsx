'use client'

import { Suspense } from 'react'
import AgreementFeeScheduleStepperWrapper from '@/components/organisms/Master/AgreementFeeScheduleStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'

function AgreementFeeScheduleStepperWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">Loading...</div>
      }
    >
      <AgreementFeeScheduleStepperWrapper />
    </Suspense>
  )
}

export default function NewAgreementFeeSchedulePage() {
  return (
    <DashboardLayout
      title="Agreement Fee Schedule Details"
      subtitle="Register your agreement fee schedule step by step, non-mandatory fields and steps are easy to skip."
    >
      <div className="px-3">
        <AgreementFeeScheduleStepperWithSuspense />
      </div>
    </DashboardLayout>
  )
}
