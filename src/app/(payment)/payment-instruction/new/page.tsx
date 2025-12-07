'use client'

import { Suspense } from 'react'
import PaymentInstructionStepperWrapper from '@/components/organisms/Master/PaymentStepper/paymentInstructionStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'

function PaymentInstructionStepperWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">Loading...</div>
      }
    >
      <PaymentInstructionStepperWrapper />
    </Suspense>
  )
}

export default function NewPaymentInstructionPage() {
  return (
    <DashboardLayout
      title="Payment Instruction Details"
      subtitle="Register your payment instruction step by step, non-mandatory fields and steps are easy to skip."
    >
      <div className="px-3">
        <PaymentInstructionStepperWithSuspense />
      </div>
    </DashboardLayout>
  )
}

