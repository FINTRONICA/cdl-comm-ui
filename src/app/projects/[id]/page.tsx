'use client'

import { DashboardLayout } from '@/components/templates/DashboardLayout'
import StepperWrapper from '@/components/organisms/ProjectStepper'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  realEstateAssetService,
  type RealEstateAsset,
} from '@/services/api/projectService'

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const searchParams = useSearchParams()
  const step = searchParams.get('step')
  const view = searchParams.get('view')
  const initialStep = step ? parseInt(step) - 1 : 0
  const isViewMode = view === 'true'
  

  const [projectData, setProjectData] = useState<RealEstateAsset | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await realEstateAssetService.getProject(
          parseInt(params.id)
        )
        setProjectData(data)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch project data')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchProjectData()
    }
  }, [params.id])

  if (isLoading) {
    return (
      <DashboardLayout
        title="Build Partner Asset Details"
        subtitle="Loading project details..."
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        title="Build Partner Asset Details"
        subtitle="Error loading project details"
      >
        <div className="p-6 text-red-600">
          <p>Error: {error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Build Partner Assest Details"
      subtitle="Register your Build Partner Assest step by step, on-mandatory fields and steps are easy to skip."
    >
      <div className="flex gap-7 items-start px-7 py-2">
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-[#4A5565]">
            Asset Name
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-[#1E2939]">
            {projectData?.reaName || 'N/A'}
          </span>
        </div>
        <div className="flex flex-col min-w-[200px] gap-1">
          <label className="font-sans font-normal text-[12px] leading-[1] tracking-normal text-[#4A5565]">
            Build Partner CIF
          </label>
          <span className="font-outfit font-normal text-[16px] leading-[1] tracking-normal align-middle text-[#1E2939]">
            {projectData?.buildPartnerDTO?.bpCifrera || 'N/A'}
          </span>
        </div>
      </div>
      <div className="px-3 mt-[10px]">
        <StepperWrapper 
          projectId={params.id} 
          initialStep={initialStep} 
          isViewMode={isViewMode}
        />
      </div>
    </DashboardLayout>
  )
}
