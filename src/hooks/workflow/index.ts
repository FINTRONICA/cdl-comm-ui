// WORKFLOW ACTIONS
export {
  WORKFLOW_ACTIONS_QUERY_KEY,
  useWorkflowActions,
  useWorkflowAction,
  useDeleteWorkflowAction,
  useSaveWorkflowAction,
  useRefreshWorkflowActions,
  useAllWorkflowActions,
} from './useWorkflowActions'

export { useWorkflowActionLabelsWithCache } from './useWorkflowActionLabelsWithCache'

// WORKFLOW DEFINITIONS
export {
  WORKFLOW_DEFINITIONS_QUERY_KEY,
  useWorkflowDefinitions,
  useFindAllWorkflowDefinitions,
  useSearchWorkflowDefinitions,
  useWorkflowDefinition,
  useCreateWorkflowDefinition,
  useUpdateWorkflowDefinition,
  useDeleteWorkflowDefinition,
  useWorkflowDefinitionLabels,
  useWorkflowDefinitionLabelsWithUtils,
  useRefreshWorkflowDefinitions,
  useApplicationModules,
  useWorkflowActions as useWorkflowActionsFromDefinitions,
  useStageTemplates,
  useAmountRules,
  useWorkflowDefinitionsUIData,
  useWorkflowDefinitionForm,
  useWorkflowDefinitionManager,
  extractApplicationModuleId,
  extractWorkflowActionId,
  formatApplicationModuleDTO,
  formatWorkflowActionDTO,
} from './useWorkflowDefinitions'

export { useWorkflowDefinitionLabelsWithCache } from './useWorkflowDefinitionLabelsWithCache'

// WORKFLOW AMOUNT RULES
export {
  useWorkflowAmountRules,
  useWorkflowAmountRulesUIData,
  useWorkflowAmountRule,
  useCreateWorkflowAmountRule,
  useUpdateWorkflowAmountRule,
  useDeleteWorkflowAmountRule,
  useWorkflowAmountRuleForm,
  useTransformToUIData as useTransformAmountRuleToUIData,
  useWorkflowAmountRuleCache,
  useBulkWorkflowAmountRuleOperations,
} from './useWorkflowAmountRules'

export { useWorkflowAmountRuleLabelsWithCache } from './useWorkflowAmountRuleLabelsWithCache'

// WORKFLOW AMOUNT STAGE OVERRIDES
export {
  useWorkflowAmountStageOverrides,
  useWorkflowAmountStageOverridesUIData,
  useWorkflowAmountStageOverride,
  useCreateWorkflowAmountStageOverride,
  useUpdateWorkflowAmountStageOverride,
  useDeleteWorkflowAmountStageOverride,
  useWorkflowAmountStageOverrideForm,
  useTransformToUIData as useTransformAmountStageOverrideToUIData,
  useWorkflowAmountStageOverrideCache,
  useBulkWorkflowAmountStageOverrideOperations,
} from './useWorkflowAmountStageOverrides'

export { useBuildWorkflowAmountStageOverrideLabelsWithCache } from './useWorkflowAmountStageOverrideLabelsWithCache'

// WORKFLOW STAGE TEMPLATES
export {
  WORKFLOW_STAGE_TEMPLATES_QUERY_KEY,
  useWorkflowStageTemplates,
  useFindAllWorkflowStageTemplates,
  useSearchWorkflowStageTemplates,
  useWorkflowStageTemplate,
  useCreateWorkflowStageTemplate,
  useUpdateWorkflowStageTemplate,
  useDeleteWorkflowStageTemplate,
  useWorkflowStageTemplateLabels,
  useWorkflowStageTemplateLabelsWithUtils,
  useRefreshWorkflowStageTemplates,
  useWorkflowDefinitions as useWorkflowDefinitionsFromStageTemplates,
  useWorkflowStageTemplatesUIData,
  useWorkflowStageTemplateForm,
  useWorkflowStageTemplateManager,
  extractWorkflowDefinitionId,
  formatWorkflowDefinitionDTO,
} from './useWorkflowStageTemplates'

export { useBuildWorkflowStageTemplateLabelsWithCache } from './useWorkflowStageTemplateLabelsWithCache'

// WORKFLOW REQUESTS
export {
  WORKFLOW_REQUESTS_QUERY_KEY,
  useWorkflowRequests,
  useWorkflowRequest,
  useAllWorkflowRequests,
  useWorkflowRequestLabels,
  useWorkflowRequestLabelsWithUtils,
  useCreateWorkflowRequest,
  useCreateDeveloperWorkflowRequest,
  useUpdateWorkflowRequest,
  useDeleteWorkflowRequest,
  useWorkflowRequestsUIData,
  useAllWorkflowRequestsUIData,
  useWorkflowRequestsWithMutations,
  useOptimisticWorkflowRequests,
  useWorkflowRequestUtils,
  useWorkflowRequestService,
  useCreatePendingTransaction,
} from './useWorkflowRequest'

export { useWorkflowRequestLabelsWithCache } from './useWorkflowRequestLabelsWithCache'

// WORKFLOW EXECUTIONS
export {
  WORKFLOW_EXECUTIONS_QUERY_KEY,
  useWorkflowExecutions,
  useWorkflowExecution,
  useCreateWorkflowExecution,
  useUpdateWorkflowExecution,
  useDeleteWorkflowExecution,
  workflowExecutionMethods,
} from './userWorkflowExecution'

// WORKFLOW REQUEST LOGS
export {
  WORKFLOW_REQUEST_LOGS_QUERY_KEY,
  useWorkflowRequestLogs,
  useWorkflowRequestLog,
  useAllWorkflowRequestLogs,
  useCreateWorkflowRequestLog,
  useUpdateWorkflowRequestLog,
  useDeleteWorkflowRequestLog,
  useWorkflowRequestLogsUIData,
  useAllWorkflowRequestLogsUIData,
  useWorkflowRequestLogsWithMutations,
  useOptimisticWorkflowRequestLogs,
  useWorkflowRequestLogUtils,
  useWorkflowRequestLogService,
  useCreatePendingLog,
} from './useWorkflowRequestLog'

// IMPORTS FOR CONSOLIDATED OBJECTS
import {
  WORKFLOW_ACTIONS_QUERY_KEY,
  useWorkflowActions,
  useWorkflowAction,
  useDeleteWorkflowAction,
  useSaveWorkflowAction,
  useRefreshWorkflowActions,
  useAllWorkflowActions,
} from './useWorkflowActions'

import { useWorkflowActionLabelsWithCache } from './useWorkflowActionLabelsWithCache'

import {
  WORKFLOW_DEFINITIONS_QUERY_KEY,
  useWorkflowDefinitions,
  useFindAllWorkflowDefinitions,
  useSearchWorkflowDefinitions,
  useWorkflowDefinition,
  useCreateWorkflowDefinition,
  useUpdateWorkflowDefinition,
  useDeleteWorkflowDefinition,
  useWorkflowDefinitionLabels,
  useWorkflowDefinitionsUIData,
  useWorkflowDefinitionForm,
  useWorkflowDefinitionManager,
  extractApplicationModuleId,
  extractWorkflowActionId,
  formatApplicationModuleDTO,
  formatWorkflowActionDTO,
} from './useWorkflowDefinitions'

import { useWorkflowDefinitionLabelsWithCache } from './useWorkflowDefinitionLabelsWithCache'

import {
  useWorkflowAmountRules,
  useWorkflowAmountRulesUIData,
  useWorkflowAmountRule,
  useCreateWorkflowAmountRule,
  useUpdateWorkflowAmountRule,
  useDeleteWorkflowAmountRule,
  useWorkflowAmountRuleForm,
  useWorkflowAmountRuleCache,
  useBulkWorkflowAmountRuleOperations,
} from './useWorkflowAmountRules'

import { useWorkflowAmountRuleLabelsWithCache } from './useWorkflowAmountRuleLabelsWithCache'

import {
  useWorkflowAmountStageOverrides,
  useWorkflowAmountStageOverridesUIData,
  useWorkflowAmountStageOverride,
  useCreateWorkflowAmountStageOverride,
  useUpdateWorkflowAmountStageOverride,
  useDeleteWorkflowAmountStageOverride,
  useWorkflowAmountStageOverrideForm,
  useWorkflowAmountStageOverrideCache,
  useBulkWorkflowAmountStageOverrideOperations,
} from './useWorkflowAmountStageOverrides'

import { useBuildWorkflowAmountStageOverrideLabelsWithCache } from './useWorkflowAmountStageOverrideLabelsWithCache'

import {
  WORKFLOW_STAGE_TEMPLATES_QUERY_KEY,
  useWorkflowStageTemplates,
  useFindAllWorkflowStageTemplates,
  useSearchWorkflowStageTemplates,
  useWorkflowStageTemplate,
  useCreateWorkflowStageTemplate,
  useUpdateWorkflowStageTemplate,
  useDeleteWorkflowStageTemplate,
  useWorkflowStageTemplateLabels,
  useWorkflowStageTemplatesUIData,
  useWorkflowStageTemplateForm,
  useWorkflowStageTemplateManager,
  extractWorkflowDefinitionId,
  formatWorkflowDefinitionDTO,
} from './useWorkflowStageTemplates'

import { useBuildWorkflowStageTemplateLabelsWithCache } from './useWorkflowStageTemplateLabelsWithCache'

import {
  WORKFLOW_REQUESTS_QUERY_KEY,
  useWorkflowRequests,
  useWorkflowRequest,
  useAllWorkflowRequests,
  useWorkflowRequestLabels,
  useCreateWorkflowRequest,
  useCreateDeveloperWorkflowRequest,
  useUpdateWorkflowRequest,
  useDeleteWorkflowRequest,
  useWorkflowRequestsUIData,
  useAllWorkflowRequestsUIData,
  useWorkflowRequestsWithMutations,
  useWorkflowRequestUtils,
} from './useWorkflowRequest'

import { useWorkflowRequestLabelsWithCache } from './useWorkflowRequestLabelsWithCache'

import {
  WORKFLOW_EXECUTIONS_QUERY_KEY,
  useWorkflowExecutions,
  useWorkflowExecution,
  useCreateWorkflowExecution,
  useUpdateWorkflowExecution,
  useDeleteWorkflowExecution,
  workflowExecutionMethods,
} from './userWorkflowExecution'

import {
  WORKFLOW_REQUEST_LOGS_QUERY_KEY,
  useWorkflowRequestLogs,
  useWorkflowRequestLog,
  useAllWorkflowRequestLogs,
  useCreateWorkflowRequestLog,
  useUpdateWorkflowRequestLog,
  useDeleteWorkflowRequestLog,
  useWorkflowRequestLogsUIData,
  useAllWorkflowRequestLogsUIData,
  useWorkflowRequestLogsWithMutations,
  useWorkflowRequestLogUtils,
} from './useWorkflowRequestLog'

// CONSOLIDATED HOOK COLLECTIONS

// All CRUD hooks for each workflow entity
export const workflowActionHooks = {
  useList: useWorkflowActions,
  useGet: useWorkflowAction,
  useSave: useSaveWorkflowAction,
  useDelete: useDeleteWorkflowAction,
  useRefresh: useRefreshWorkflowActions,
  useAll: useAllWorkflowActions,
  useLabelsWithCache: useWorkflowActionLabelsWithCache,
} as const

export const workflowDefinitionHooks = {
  useList: useWorkflowDefinitions,
  useFindAll: useFindAllWorkflowDefinitions,
  useSearch: useSearchWorkflowDefinitions,
  useGet: useWorkflowDefinition,
  useCreate: useCreateWorkflowDefinition,
  useUpdate: useUpdateWorkflowDefinition,
  useDelete: useDeleteWorkflowDefinition,
  useUIData: useWorkflowDefinitionsUIData,
  useLabels: useWorkflowDefinitionLabels,
  useLabelsWithCache: useWorkflowDefinitionLabelsWithCache,
  useForm: useWorkflowDefinitionForm,
  useManager: useWorkflowDefinitionManager,
} as const

export const workflowAmountRuleHooks = {
  useList: useWorkflowAmountRules,
  useGet: useWorkflowAmountRule,
  useCreate: useCreateWorkflowAmountRule,
  useUpdate: useUpdateWorkflowAmountRule,
  useDelete: useDeleteWorkflowAmountRule,
  useUIData: useWorkflowAmountRulesUIData,
  useLabelsWithCache: useWorkflowAmountRuleLabelsWithCache,
  useForm: useWorkflowAmountRuleForm,
  useCache: useWorkflowAmountRuleCache,
  useBulkOperations: useBulkWorkflowAmountRuleOperations,
} as const

export const workflowAmountStageOverrideHooks = {
  useList: useWorkflowAmountStageOverrides,
  useGet: useWorkflowAmountStageOverride,
  useCreate: useCreateWorkflowAmountStageOverride,
  useUpdate: useUpdateWorkflowAmountStageOverride,
  useDelete: useDeleteWorkflowAmountStageOverride,
  useUIData: useWorkflowAmountStageOverridesUIData,
  useLabelsWithCache: useBuildWorkflowAmountStageOverrideLabelsWithCache,
  useForm: useWorkflowAmountStageOverrideForm,
  useCache: useWorkflowAmountStageOverrideCache,
  useBulkOperations: useBulkWorkflowAmountStageOverrideOperations,
} as const

export const workflowStageTemplateHooks = {
  useList: useWorkflowStageTemplates,
  useFindAll: useFindAllWorkflowStageTemplates,
  useSearch: useSearchWorkflowStageTemplates,
  useGet: useWorkflowStageTemplate,
  useCreate: useCreateWorkflowStageTemplate,
  useUpdate: useUpdateWorkflowStageTemplate,
  useDelete: useDeleteWorkflowStageTemplate,
  useUIData: useWorkflowStageTemplatesUIData,
  useLabels: useWorkflowStageTemplateLabels,
  useLabelsWithCache: useBuildWorkflowStageTemplateLabelsWithCache,
  useForm: useWorkflowStageTemplateForm,
  useManager: useWorkflowStageTemplateManager,
} as const

export const workflowRequestHooks = {
  useList: useWorkflowRequests,
  useGet: useWorkflowRequest,
  useAll: useAllWorkflowRequests,
  useCreate: useCreateWorkflowRequest,
  useCreateDeveloper: useCreateDeveloperWorkflowRequest,
  useUpdate: useUpdateWorkflowRequest,
  useDelete: useDeleteWorkflowRequest,
  useUIData: useWorkflowRequestsUIData,
  useAllUIData: useAllWorkflowRequestsUIData,
  useLabels: useWorkflowRequestLabels,
  useLabelsWithCache: useWorkflowRequestLabelsWithCache,
  useWithMutations: useWorkflowRequestsWithMutations,
  useUtils: useWorkflowRequestUtils,
} as const

export const workflowRequestLogHooks = {
  useList: useWorkflowRequestLogs,
  useGet: useWorkflowRequestLog,
  useAll: useAllWorkflowRequestLogs,
  useCreate: useCreateWorkflowRequestLog,
  useUpdate: useUpdateWorkflowRequestLog,
  useDelete: useDeleteWorkflowRequestLog,
  useUIData: useWorkflowRequestLogsUIData,
  useAllUIData: useAllWorkflowRequestLogsUIData,
  useWithMutations: useWorkflowRequestLogsWithMutations,
  useUtils: useWorkflowRequestLogUtils,
} as const

export const workflowExecutionHooks = {
  useList: useWorkflowExecutions,
  useGet: useWorkflowExecution,
  useCreate: useCreateWorkflowExecution,
  useUpdate: useUpdateWorkflowExecution,
  useDelete: useDeleteWorkflowExecution,
  useMethods: workflowExecutionMethods,
} as const

// All workflow hooks in one object for easy access
export const allWorkflowHooks = {
  actions: workflowActionHooks,
  definitions: workflowDefinitionHooks,
  amountRules: workflowAmountRuleHooks,
  amountStageOverrides: workflowAmountStageOverrideHooks,
  stageTemplates: workflowStageTemplateHooks,
  requests: workflowRequestHooks,
  requestLogs: workflowRequestLogHooks,
  executions: workflowExecutionHooks,
} as const

// Default export for convenience
const workflowHooks = {
  ...allWorkflowHooks,
  // Utility functions
  utils: {
    extractApplicationModuleId,
    extractWorkflowActionId,
    extractWorkflowDefinitionId,
    formatApplicationModuleDTO,
    formatWorkflowActionDTO,
    formatWorkflowDefinitionDTO,
  },
  // Query keys for cache management
  queryKeys: {
    WORKFLOW_ACTIONS: WORKFLOW_ACTIONS_QUERY_KEY,
    WORKFLOW_DEFINITIONS: WORKFLOW_DEFINITIONS_QUERY_KEY,
    WORKFLOW_STAGE_TEMPLATES: WORKFLOW_STAGE_TEMPLATES_QUERY_KEY,
    WORKFLOW_REQUESTS: WORKFLOW_REQUESTS_QUERY_KEY,
    WORKFLOW_REQUEST_LOGS: WORKFLOW_REQUEST_LOGS_QUERY_KEY,
    WORKFLOW_EXECUTIONS: WORKFLOW_EXECUTIONS_QUERY_KEY,
  },
}

export default workflowHooks
