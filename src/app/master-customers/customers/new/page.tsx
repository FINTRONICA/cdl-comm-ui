'use client'

import { Suspense } from 'react'
import CustomerStepperWrapper from '@/components/organisms/CustomerStepper'
import { DashboardLayout } from '@/components/templates/DashboardLayout'

function CustomerStepperWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">Loading...</div>
      }
    >
      <CustomerStepperWrapper />
    </Suspense>
  )
}

export default function NewCustomerPage() {
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
