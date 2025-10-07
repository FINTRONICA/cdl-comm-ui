'use client'

import { Suspense } from 'react'
import InvestorsStepperWrapper from '@/components/organisms/InvestorStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'

function NewInvestorPageContent() {
  return (
    <DashboardLayout
      title="Capital Partner Details"
      subtitle="Register your investor step by step, non-mandatory fields and steps are easy to skip."
    >
      <div className="px-3">
        <InvestorsStepperWrapper />
      </div>
    </DashboardLayout>
  )
}

export default function NewInvestorPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Capital Partner Details" subtitle="Loading...">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </DashboardLayout>
      }
    >
      <NewInvestorPageContent />
    </Suspense>
  )
}
