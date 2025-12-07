'use client'

import { Suspense } from 'react'
import InvestorsStepperWrapper from '@/components/organisms/InvestorStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { GlobalLoading } from '@/components/atoms'

function NewInvestorPageContent() {
  return (
    <DashboardLayout
      title="Capital Partner Details"
      subtitle="Register your capital partner step by step, non-mandatory fields and steps are easy to skip."
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
        <DashboardLayout title="Capital Partner Details" subtitle="">
          <div className="bg-[#FFFFFFBF] rounded-2xl flex flex-col h-full">
            <GlobalLoading fullHeight />
          </div>
        </DashboardLayout>
      }
    >
      <NewInvestorPageContent />
    </Suspense>
  )
}
