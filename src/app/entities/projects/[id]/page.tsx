'use client'

import { DashboardLayout } from '@/components/templates/DashboardLayout'
import StepperWrapper from '@/components/organisms/ProjectStepper'

export default function NewProjectPage() {
  return (
    <DashboardLayout
      title="Build Partner Assest Details"
      subtitle="Register your project step by step, on-mandatory fields and steps are easy to skip."
    >
      <div className="flex gap-7 items-start px-7 py-2">
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-[#4A5565]">
            Project Name
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-[#1E2939]">
            AI Madina
          </span>
        </div>
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-[#4A5565]">
            Developer ID (RERA)
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-[#1E2939]">
            12345677
          </span>
        </div>
      </div>
      <div className="px-3 mt-[10px]">
        <StepperWrapper />
      </div>
    </DashboardLayout>
  )
}
