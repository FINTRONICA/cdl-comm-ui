'use client'

import { DashboardLayout } from '@/components/templates/DashboardLayout'
import StepperWrapper from '@/components/organisms/ProjectStepper'

export default function NewProjectPage() {
  return (
    <DashboardLayout
      title="Build Partner Assest"
      subtitle="Register your project step by step, on-mandatory fields and steps are easy to skip."
    >
      <div className="px-3">
        <StepperWrapper />
      </div>
    </DashboardLayout>
  )
}
