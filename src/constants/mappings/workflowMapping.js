export const WORKFLOW_ACTION_LABELS = {
  CDL_WA_ACTION_KEY: 'Action Key',
  CDL_WA_ACTION_NAME: 'Action Name',
  CDL_WA_MODULE_CODE: 'Module Code',
  CDL_WA_DESCRIPTION: 'Description',
  CDL_WA_NAME: 'Display Name',
  CDL_WA_ACTIONS: 'Actions',
}

export const WORKFLOW_DEFINITION_LABELS = {
  CDL_WD_ID: 'ID',
  CDL_WD_NAME: 'Name',
  CDL_WD_VERSION: 'Version',
  CDL_WD_MODULE: 'Module',
  CDL_WD_ACTION: 'Action',
  CDL_WD_MODULE_DESCRIPTION: 'Module Description',
  CDL_WD_ACTION_DESCRIPTION: 'Action Description',
  CDL_WD_MODULE_CODE: 'Module Code',
  CDL_WD_ACTION_CODE: 'Action Code',
  CDL_WD_AMOUNT_BASED: 'Amount Based',
  CDL_WD_ACTIVE: 'Active',
  CDL_WD_STATUS: 'Status',
  CDL_WD_CREATED_BY: 'Created By',
  CDL_WD_CREATED_AT: 'Created At',
  CDL_WD_APPLICATION_MODULE_ID: 'Application Module',
  CDL_WD_WORKFLOW_ACTION_ID: 'Workflow Action',
  CDL_WD_STAGE_TEMPLATES: 'Stage Templates',
  CDL_WD_AMOUNT_RULES: 'Amount Rules',
  CDL_WD_STAGE_TEMPLATE_IDS: 'Stage Template IDs',
  CDL_WD_AMOUNT_RULE_IDS: 'Amount Rule IDs',
  CDL_WD_DETAILS: 'Details',
  CDL_WD_ACTIONS: 'Actions',
}

export const APPLICATION_MODULE_LABELS = {
  CDL_AM_ID: 'ID',
  CDL_AM_MODULE_NAME: 'Module Name',
  CDL_AM_MODULE_CODE: 'Module Code',
  CDL_AM_MODULE_DESCRIPTION: 'Module Description',
  CDL_AM_ACTIVE: 'Active',
}

export const STAGE_TEMPLATE_LABELS = {
  CDL_ST_ID: 'ID',
  CDL_ST_ORDER: 'Stage Order',
  CDL_ST_KEY: 'Stage Key',
  CDL_ST_GROUP: 'Keycloak Group',
  CDL_ST_REQUIRED_APPROVALS: 'Required Approvals',
  CDL_ST_NAME: 'Stage Name',
  CDL_ST_DESCRIPTION: 'Description',
  CDL_ST_SLA_HOURS: 'SLA Hours',
  CDL_ST_WORKFLOW_DEFINITION: 'Workflow Definition',
  CDL_ST_WORKFLOW_DEFINITION_DTO: 'Workflow Definition DTO',
  CDL_ST_WORKFLOW_DEFINITION_ID: 'Workflow Definition ID',
  CDL_ST_WORKFLOW_DEFINITION_NAME: 'Workflow Definition Name',
  CDL_ST_WORKFLOW_DEFINITION_VERSION: 'Workflow Definition Version',
  CDL_ST_WORKFLOW_DEFINITION_CREATED_BY: 'Workflow Definition Created By',
  CDL_ST_WORKFLOW_DEFINITION_CREATED_AT: 'Workflow Definition Created At',
  CDL_ST_WORKFLOW_DEFINITION_AMOUNT_BASED: 'Workflow Definition Amount Based',
  CDL_ST_WORKFLOW_DEFINITION_MODULE_CODE: 'Workflow Definition Module Code',
  CDL_ST_WORKFLOW_DEFINITION_ACTION_CODE: 'Workflow Definition Action Code',
  CDL_ST_WORKFLOW_DEFINITION_APPLICATION_MODULE_DTO:
    'Workflow Definition Application Module DTO',
  CDL_ST_WORKFLOW_DEFINITION_WORKFLOW_ACTION_DTO:
    'Workflow Definition Workflow Action DTO',
  CDL_ST_WORKFLOW_DEFINITION_STAGE_TEMPLATES:
    'Workflow Definition Stage Templates',
  CDL_ST_WORKFLOW_DEFINITION_AMOUNT_RULES: 'Workflow Definition Amount Rules',
  CDL_ST_WORKFLOW_DEFINITION_ACTIVE: 'Workflow Definition Active',
  CDL_ST_STATUS: 'Status',
  CDL_ST_CREATED_BY: 'Created By',
  CDL_ST_CREATED_AT: 'Created At',
  CDL_ST_ACTIONS: 'Actions',
  CDL_ST_DETAILS: 'Details',
}

export const WORKFLOW_AMOUNT_RULE_LABELS = {
  CDL_WAR_ID: 'ID',
  CDL_WAR_CURRENCY: 'Currency',
  CDL_WAR_MIN_AMOUNT: 'Min Amount',
  CDL_WAR_MAX_AMOUNT: 'Max Amount',
  CDL_WAR_PRIORITY: 'Priority',
  CDL_WAR_REQUIRED_MAKERS: 'Required Makers',
  CDL_WAR_REQUIRED_CHECKERS: 'Required Checkers',
  CDL_WAR_WORKFLOW_DEFINITION: 'Workflow Definition',
  CDL_WAR_STAGE_OVERRIDES: 'Stage Overrides',
  CDL_WAR_WORKFLOW_ID: 'Workflow ID',
  CDL_WAR_ACTIONS: 'Actions',
  CDL_WAR_ACTIVE: 'Active',
}

export const WORKFLOW_AMOUNT_STAGE_OVERRIDE_LABELS = {
  CDL_WASO_ID: 'ID',
  CDL_WASO_STAGE_ORDER: 'Stage Order',
  CDL_WASO_REQUIRED_APPROVALS: 'Required Approvals',
  CDL_WASO_KEYCLOAK_GROUP: 'Keycloak Group',
  CDL_WASO_STAGE_KEY: 'Stage Key',
  CDL_WASO_ACTIVE: 'Active',
  CDL_WAR_WORKFLOW_AMOUNT_RULE: 'Workflow Amount Rule',
  CDL_WAR_WORKFLOW_ACTIONS: 'Actions',
}

export const WORKFLOW_REQUEST_LABELS = {
  ID: 'ID',
  REFERENCE_ID: 'Reference ID',
  REFERENCE_TYPE: 'Reference Type',
  MODULE_NAME: 'Module Name',
  ACTION_KEY: 'Action Key',
  AMOUNT: 'Amount',
  CURRENCY: 'Currency',
  PAYLOAD_JSON: 'Payload',
  CURRENT_STAGE_ORDER: 'Current Stage Order',
  CREATED_BY: 'Created By',
  CREATED_AT: 'Created At',
  LAST_UPDATED_AT: 'Last Updated At',
  VERSION: 'Version',
  WORKFLOW_DEFINITION_DTO: 'Workflow Definition',
  WORKFLOW_REQUEST_STAGE_DTOS: 'Workflow Request Stages',
  TASK_STATUS_DTO: 'Task Status',
  
}

export const getLabelByConfigId = (configId) => {
  return (
    WORKFLOW_ACTION_LABELS[configId] ||
    WORKFLOW_DEFINITION_LABELS[configId] ||
    STAGE_TEMPLATE_LABELS[configId] ||
    WORKFLOW_AMOUNT_RULE_LABELS[configId] ||
    WORKFLOW_AMOUNT_STAGE_OVERRIDE_LABELS[configId] ||
    APPLICATION_MODULE_LABELS[configId] ||
    WORKFLOW_REQUEST_LABELS[configId] ||
    configId
  )
}

export const getWorkflowLabels = (configId) => getLabelByConfigId(configId)
