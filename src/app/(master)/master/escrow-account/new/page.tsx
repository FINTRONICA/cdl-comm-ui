'use client'

import { Suspense } from 'react'
import EscrowAccountStepperWrapper from '@/components/organisms/Master/EscrowAccountStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'

function EscrowAccountStepperWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">Loading...</div>
      }
    >
      <EscrowAccountStepperWrapper />
    </Suspense>
  )
}

export default function NewEscrowAccountPage() {
  return (
    <DashboardLayout
      title="Master : Escrow Account"
      subtitle="Register your escrow account step by step, non-mandatory fields and steps are easy to skip."
    >
      <div className="px-3">
        <EscrowAccountStepperWithSuspense />
      </div>
    </DashboardLayout>
  )
}


