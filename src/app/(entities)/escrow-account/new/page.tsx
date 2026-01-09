'use client'

import { Suspense } from 'react'
import AccountStepperWrapper from '@/components/organisms/Master/AccountStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'

function AccountStepperWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">Loading...</div>
      }
    >
      <AccountStepperWrapper />
    </Suspense>
  )
}

export default function NewAccountPage() {
  return (
    <DashboardLayout
      title="Account Details"
      subtitle="Register your account step by step, non-mandatory fields and steps are easy to skip."
    >
      <div className="px-3">
        <AccountStepperWithSuspense />
      </div>
    </DashboardLayout>
  )
}
