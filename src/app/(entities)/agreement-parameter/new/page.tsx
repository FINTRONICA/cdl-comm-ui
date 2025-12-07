'use client'

import { Suspense } from 'react'
import AgreementParameterStepperWrapper from '@/components/organisms/Master/AgreementParameterStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'

function AgreementParameterStepperWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">Loading...</div>
      }
    >
      <AgreementParameterStepperWrapper />
    </Suspense>
  )
}

export default function NewAgreementParameterPage() {
  return (
    <DashboardLayout
      title="Agreement Parameter Details"
      subtitle="Register your agreement parameter step by step, non-mandatory fields and steps are easy to skip."
    >
      <div className="px-3">
        <AgreementParameterStepperWithSuspense />
      </div>
    </DashboardLayout>
  )
}

