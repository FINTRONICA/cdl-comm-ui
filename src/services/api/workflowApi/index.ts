
import WorkflowActionLabelsService from './workflowActionLabelsService'
import WorkflowAmountLabelsService from './workflowAmountRuleLabelsService'
import WorkflowAmountStageOverrideLabelsService from './workflowAmountStageOverrideLabelsService'
import WorkflowDefinitionLabelsService from './workflowDefinitionLabelsService'
import WorkflowStageTemplateLabelsService from './workflowStageTemplateLabelsService'
import WorkflowRequestLabelsService from './workflowRequestLabelsService'

//  WORKFLOW ACTION 
export {
  WorkflowActionService,
  workflowActionService,
  mapWorkflowActionToUIData,
  type WorkflowAction,
  type CreateWorkflowActionRequest,
  type UpdateWorkflowActionRequest,
  type WorkflowActionFilters,
  type WorkflowActionUIData,
} from './workflowActionService'

export {
  WorkflowActionLabelsService,
  type WorkflowActionLabelResponse,
  type ProcessedWorkflowActionLabels,
} from './workflowActionLabelsService'

//  WORKFLOW DEFINITION 
export {
  WorkflowDefinitionService,
  workflowDefinitionService,
  mapWorkflowDefinitionData,
  mapWorkflowDefinitionToUIData,
  type WorkflowDefinition,
  type CreateWorkflowDefinitionRequest,
  type UpdateWorkflowDefinitionRequest,
  type WorkflowDefinitionFilters,
  type WorkflowDefinitionUIData,
  type WorkflowDefinitionResponse,
  type ApplicationModuleDTO,
  type WorkflowActionDTO,
  type StageTemplateDTO,
  type AmountRuleDTO,
} from './workflowDefinitionService'

export {
  WorkflowDefinitionLabelsService,
  type WorkflowDefinitionLabelResponse,
  type ProcessedWorkflowDefinitionLabels,
} from './workflowDefinitionLabelsService'

//  WORKFLOW AMOUNT RULE 
export {
  WorkflowAmountRuleService,
  workflowAmountRuleService,
  mapWorkflowAmountRuleToUI,
  type WorkflowAmountRule,
  type WorkflowAmountRuleDTO,
  type CreateWorkflowAmountRuleRequest,
  type UpdateWorkflowAmountRuleRequest,
  type WorkflowAmountRuleFilters,
  type WorkflowAmountRuleUIData,
  type WorkflowAmountStageOverride as WorkflowAmountStageOverrideFromRule,
} from './workflowAmountRuleService'

export {
  WorkflowAmountLabelsService,
  type WorkflowAmountRuleLabelResponse,
  type ProcessedWorkflowAmountRuleLabels,
} from './workflowAmountRuleLabelsService'

//  WORKFLOW AMOUNT STAGE OVERRIDE 
export {
  WorkflowAmountStageOverrideService,
  workflowAmountStageOverrideService,
  mapWorkflowAmountStageOverrideToUI,
  type WorkflowAmountStageOverride,
  type CreateWorkflowAmountStageOverrideRequest,
  type UpdateWorkflowAmountStageOverrideRequest,
  type WorkflowAmountStageOverrideFilters,
  type WorkflowAmountStageOverrideUIData,
} from './workflowAmountStageOverrideService'

export {
  WorkflowAmountStageOverrideLabelsService,
  type WorkflowAmountStageOverrideLabelResponse,
  type ProcessedWorkflowAmountStageOverrideLabels,
} from './workflowAmountStageOverrideLabelsService'

//  WORKFLOW STAGE TEMPLATE 
export {
  WorkflowStageTemplateService,
  workflowStageTemplateService,
  mapWorkflowStageTemplateData,
  type WorkflowStageTemplate,
  type CreateWorkflowStageTemplateRequest,
  type UpdateWorkflowStageTemplateRequest,
  type WorkflowStageTemplateFilters,
  type WorkflowStageTemplateResponse,
} from './workflowStageTemplateService'

export {
  WorkflowStageTemplateLabelsService,
  type WorkflowStageTemplateLabelResponse,
  type ProcessedWorkflowStageTemplateLabels,
} from './workflowStageTemplateLabelsService'

//  WORKFLOW REQUEST 
export {
  WorkflowRequestService,
  workflowRequestService,
  mapWorkflowRequestToUIData,
  type WorkflowRequest,
  type CreateWorkflowRequest,
  type UpdateWorkflowRequestRequest,
  type WorkflowRequestFilters,
  type WorkflowRequestUIData,
  type Step1Data,
  type CreateDeveloperWorkflowRequest,
  type TaskStatusDTO,
  type ApplicationModuleDTO as WorkflowRequestApplicationModuleDTO,
  type WorkflowActionDTO as WorkflowRequestWorkflowActionDTO,
  type WorkflowStageTemplate as WorkflowRequestStageTemplate,
  type WorkflowAmountRule as WorkflowRequestAmountRule,
  type WorkflowDefinitionDTO,
  type WorkflowRequestStageApprovalDTO,
  type WorkflowRequestStageDTO,
} from './workflowRequestService'

export {
  WorkflowRequestLabelsService,
  type WorkflowRequestLabelResponse,
  type ProcessedWorkflowRequestLabels,
} from './workflowRequestLabelsService'

//  WORKFLOW REQUEST LOG 
export {
  WorkflowRequestLogService,
  workflowRequestLogService,
  mapWorkflowRequestLogResponseToModel,
  mapWorkflowRequestLogResponseToUIData,
  type LanguageTranslationDTO,
  type BpRegulatorDTO,
  type DetailsJsonDTO,
  type WorkflowRequestDTO,
  type WorkflowRequestLogContent,
  type PageDTO,
  type WorkflowRequestLogResponse,
  type CreateWorkflowRequestLog,
  type UpdateWorkflowRequestLog,
  type WorkflowRequestLogUIData,
} from './workflowRequestLogService'

//  WORKFLOW EXECUTION 
export {
  WorkflowExecutionService,
  workflowExecutionService,
  mapWorkflowExecutionToUIData,
  type WorkflowExecution,
  type CreateWorkflowExecutionRequest,
  type UpdateWorkflowExecutionRequest,
  type WorkflowExecutionFilters,
  type WorkflowExecutionUIData,
} from './workflowExecutionService'

//  CONSOLIDATED EXPORTS 

// Import service instances for the consolidated exports
import { workflowActionService } from './workflowActionService'
import { workflowAmountRuleService } from './workflowAmountRuleService'
import { workflowAmountStageOverrideService } from './workflowAmountStageOverrideService'
import { workflowDefinitionService } from './workflowDefinitionService'
import { workflowStageTemplateService } from './workflowStageTemplateService'
import { workflowRequestService } from './workflowRequestService'
import { workflowRequestLogService } from './workflowRequestLogService'
import { workflowExecutionService } from './workflowExecutionService'

// Service instances for easy access
export const workflowApiServices = {
  action: workflowActionService,
  definition: workflowDefinitionService,
  amountRule: workflowAmountRuleService,
  amountStageOverride: workflowAmountStageOverrideService,
  stageTemplate: workflowStageTemplateService,
  request: workflowRequestService,
  requestLog: workflowRequestLogService,
  execution: workflowExecutionService,
} as const

// Label services for easy access
export const workflowLabelServices = {
  action: WorkflowActionLabelsService,
  definition: WorkflowDefinitionLabelsService,
  amountRule: WorkflowAmountLabelsService,
  amountStageOverride: WorkflowAmountStageOverrideLabelsService,
  stageTemplate: WorkflowStageTemplateLabelsService,
  request: WorkflowRequestLabelsService,
} as const

// Type unions for convenience
export type WorkflowServiceType = 
  | typeof workflowActionService
  | typeof workflowDefinitionService
  | typeof workflowAmountRuleService
  | typeof workflowAmountStageOverrideService
  | typeof workflowStageTemplateService
  | typeof workflowRequestService
  | typeof workflowRequestLogService
  | typeof workflowExecutionService

export type WorkflowLabelServiceType =
  | typeof WorkflowActionLabelsService
  | typeof WorkflowDefinitionLabelsService
  | typeof WorkflowAmountLabelsService
  | typeof WorkflowAmountStageOverrideLabelsService
  | typeof WorkflowStageTemplateLabelsService
  | typeof WorkflowRequestLabelsService

// Default export for convenience
const workflowApi = {
  services: workflowApiServices,
  labels: workflowLabelServices,
}

export default workflowApi