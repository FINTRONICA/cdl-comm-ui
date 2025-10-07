'use client'

import { Suspense } from 'react'
import DeveloperStepperWrapper from '@/components/organisms/DeveloperStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'

function DeveloperStepperWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">Loading...</div>
      }
    >
      <DeveloperStepperWrapper />
    </Suspense>
  )
}

export default function NewDeveloperPage() {
  return (
    <DashboardLayout
      title="Build Partner Details"
      subtitle="Register your developer step by step, non-mandatory fields and steps are easy to skip."
    >
      <div className="px-3 bg-white ">
        <DeveloperStepperWithSuspense />
      </div>
    </DashboardLayout>
  )
}
