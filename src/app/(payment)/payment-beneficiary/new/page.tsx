'use client'

import { Suspense } from 'react'
import PaymentBeneficiaryStepperWrapper from '@/components/organisms/Master/PaymentStepper/PaymentBeneficiaryStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'

function PaymentBeneficiaryStepperWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">Loading...</div>
      }
    >
      <PaymentBeneficiaryStepperWrapper />
    </Suspense>
  )
}

export default function NewPaymentBeneficiaryPage() {
  return (
    <DashboardLayout
      title="Payment Beneficiary Details"
      subtitle="Register your payment beneficiary step by step, non-mandatory fields and steps are easy to skip."
    >
      <div className="px-3">
        <PaymentBeneficiaryStepperWithSuspense />
      </div>
    </DashboardLayout>
  )
}
