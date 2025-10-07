// // hooks/useDropdownData.ts
// import { useQuery } from '@tanstack/react-query'
// import { applicationModuleService } from '@/services/api/applicationModuleService'
// import { workflowActionService } from '@/services/api/workflowActionService'
// import { workflowStageTemplateService } from '@/services/api/workflowStageTemplateService'
// import { workflowAmountRuleService } from '@/services/api/workflowAmountRuleService'
// import { workflowDefinitionService } from '@/services/api/workflowDefinitionService'
// import { workflowAmountStageOverrideService } from '@/services/api/workflowAmountStageOverrideService'

// // Hook for Application Modules
// export function useApplicationModules() {
//   return useQuery({
//     queryKey: ['applicationModules'],
//     queryFn: () => applicationModuleService.findAllUIData(),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     refetchOnWindowFocus: false,
//     retry: 3,
//   })
// }

// // Hook for Workflow Actions
// export function useWorkflowActionsForDropdown() {
//   return useQuery({
//     queryKey: ['workflowActionsForDropdown'],
//     queryFn: () => workflowActionService.getWorkflowActionsUIData(0, 1000), // Get all actions
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     refetchOnWindowFocus: false,
//     retry: 3,
//   })
// }

// // Hook for Workflow Stage Templates
// export function useWorkflowStageTemplates() {
//   return useQuery({
//     queryKey: ['workflowStageTemplates'],
//     queryFn: () => workflowStageTemplateService.findAllUIData(),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     refetchOnWindowFocus: false,
//     retry: 3,
//   })
// }

// // Hook for Workflow Amount Rules
// export function useWorkflowAmountRules() {
//   return useQuery({
//     queryKey: ['workflowAmountRules'],
//     queryFn: () => workflowAmountRuleService.findAllUIData(),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     refetchOnWindowFocus: false,
//     retry: 3,
//   })
// }

// // Hook for Workflow Definitions
// export function useWorkflowDefinitionsForDropdown() {
//   return useQuery({
//     queryKey: ['workflowDefinitionsForDropdown'],
//     queryFn: () => workflowDefinitionService.findAll(0, 1000), // Get all definitions
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     refetchOnWindowFocus: false,
//     retry: 3,
//   })
// }

// // Hook for Workflow Amount Stage Overrides
// export function useWorkflowAmountStageOverridesForDropdown() {
//   return useQuery({
//     queryKey: ['workflowAmountStageOverridesForDropdown'],
//     queryFn: () => workflowAmountStageOverrideService.findAllUIData(),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     refetchOnWindowFocus: false,
//     retry: 3,
//   })
// }

// // Combined hook for all dropdown data
// export function useAllDropdownData() {
//   const applicationModules = useApplicationModules()
//   const workflowActions = useWorkflowActionsForDropdown()
//   const stageTemplates = useWorkflowStageTemplates()
//   const amountRules = useWorkflowAmountRules()
//   const workflowDefinitions = useWorkflowDefinitionsForDropdown()
//   const stageOverrides = useWorkflowAmountStageOverridesForDropdown()

//   return {
//     applicationModules,
//     workflowActions,
//     stageTemplates,
//     amountRules,
//     workflowDefinitions,
//     stageOverrides,
//     isLoading: applicationModules.isLoading || workflowActions.isLoading || stageTemplates.isLoading || amountRules.isLoading || workflowDefinitions.isLoading || stageOverrides.isLoading,
//     error: applicationModules.error || workflowActions.error || stageTemplates.error || amountRules.error || workflowDefinitions.error || stageOverrides.error,
//   }
// }
