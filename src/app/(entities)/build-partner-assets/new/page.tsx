'use client'

import { DashboardLayout } from '@/components/templates/DashboardLayout'
import StepperWrapper from '@/components/organisms/ProjectStepper'
import { useBuildPartnerAssetLabelsWithCache } from '@/hooks/useBuildPartnerAssetLabelsWithCache'
import { useAppStore } from '@/store'
import { useSidebarConfig } from '@/hooks'

export default function NewProjectPage() {
  const { getLabel } = useBuildPartnerAssetLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language)
  const { getLabelResolver } = useSidebarConfig()
  const projectsTitle = getLabelResolver
    ? getLabelResolver('projects', 'Build Partner Assets')
    : 'Build Partner Assets'

  const projectsStepperTitle = getLabel('CDL_BPA_DETAILS', currentLanguage, 'Build Partner Asset Details')

  return (
    <DashboardLayout
      title={projectsStepperTitle}
      subtitle={`Register your ${projectsTitle} step by step, non-mandatory fields and steps are easy to skip.`}
    >
      <div className="px-3">
        <StepperWrapper />
      </div>
    </DashboardLayout>
  )
}
