'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import CustomerStepperWrapper from '@/components/organisms/CustomerStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'

function CustomerStepperWithSuspense() {
  const params = useParams()
  const customerId = params.id as string
  const stepId = parseInt(params.stepId as string) - 1 // Convert to 0-based index

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">Loading...</div>
      }
    >
      <CustomerStepperWrapper 
        customerId={customerId} 
        initialStep={stepId}
      />
    </Suspense>
  )
}

export default function CustomerStepPage() {
  return (
    <DashboardLayout
      title="Customer Details"
      subtitle="Register your customer step by step, non-mandatory fields and steps are easy to skip."
    >
      <div className="px-3">
        <CustomerStepperWithSuspense />
      </div>
    </DashboardLayout>
  )
}
