'use client'

import { Suspense } from 'react'
import BeneficiaryStepperWrapper from '@/components/organisms/Master/BeneficiaryStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'

function BeneficiaryStepperWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">Loading...</div>
      }
    >
      <BeneficiaryStepperWrapper />
    </Suspense>
  )
}

export default function NewBeneficiaryPage() {
  return (
    // <DashboardLayout
    //   title="Beneficiary Details"
    //   subtitle="Register your beneficiary step by step, non-mandatory fields and steps are easy to skip."
    // >
      <div className="px-3">
        <BeneficiaryStepperWithSuspense />
      </div>
    // </DashboardLayout>
  )
}

