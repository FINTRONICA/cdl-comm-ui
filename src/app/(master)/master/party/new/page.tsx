'use client'

import { Suspense } from 'react'
import PartyStepperWrapper from '@/components/organisms/Master/PartyStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'

function PartyStepperWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">Loading...</div>
      }
    >
      <PartyStepperWrapper />
    </Suspense>
  )
}

export default function NewPartyPage() {
  return (
    <DashboardLayout
      title="Party Details"
      subtitle="Register your party step by step, non-mandatory fields and steps are easy to skip."
    >
      <div className="px-3">
        <PartyStepperWithSuspense />
      </div>
    </DashboardLayout>
  )
}

