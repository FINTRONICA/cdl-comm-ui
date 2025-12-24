export const WORKFLOW_LABELS = {
  // WORKFLOW ACTION LABELS
  'CDL_WA_ID': 'ID',
  'CDL_WA_ACTION_KEY': 'Action Key',
  'CDL_WA_ACTION_NAME': 'Action Name',
  'CDL_WA_MODULE_CODE': 'Module Code',
  'CDL_WA_DESCRIPTION': 'Description',
  'CDL_WA_NAME': 'Display Name',
  'CDL_WA_ACTIONS': 'Actions',
  'CDL_WA_WORKFLOW_ACTION': 'Workflow Action',
  
  // WORKFLOW DEFINITION LABELS
  'CDL_WD_ID': 'ID',
  'CDL_WD_NAME': 'Name',
  'CDL_WD_VERSION': 'Version',
  'CDL_WD_CREATED_BY': 'Created By',
  'CDL_WD_CREATED_AT': 'Created At',
  'CDL_WD_UPDATED_BY': 'Updated By',
  'CDL_WD_UPDATED_AT': 'Updated At',
  'CDL_WD_MODULE_CODE': 'Module Code',
  'CDL_WD_AMOUNT_BASED': 'Amount Based',
  'CDL_WD_MODULE_CODE': 'Module Name',
  'CDL_WD_ACTION_CODE': 'Action Name',
  'CDL_WD_APPLICATION_MODULE_DTO': 'Application Module ',
  'CDL_WD_WORKFLOW_ACTION_DTO': 'Workflow Action ',
  'CDL_WD_STAGE_TEMPLATES': 'Stage Templates',
  'CDL_WD_AMOUNT_RULES': 'Amount Rules',
  'CDL_WD_STAGE_TEMPLATE_IDS': 'Stage Template ',
  'CDL_WD_AMOUNT_RULE_IDS': 'Amount Rule ',
  'CDL_WD_WORKFLOW_DEFINITION': 'Workflow Definition',

  //  Workflow Stage Template Labels
  'CDL_WST_ID': 'ID',
  'CDL_WST_ORDER': 'Stage Order',
  'CDL_WST_KEY': 'Stage Key',
  'CDL_WST_GROUP': 'Keycloak Group',
  'CDL_WST_REQUIRED_APPROVALS': 'Required Approvals',
  'CDL_WST_NAME': 'Stage Name',
  'CDL_WST_DESCRIPTION': 'Description',
  'CDL_WST_SLA_HOURS': 'SLA Hours',
  'CDL_WST_WORKFLOW_DEFINITION_DTO': 'Workflow Definition',
  'CDL_WST_CREATED_BY': 'Created By',
  'CDL_WST_CREATED_AT': 'Created At',
  'CDL_WST_UPDATED_BY': 'Updated By',
  'CDL_WST_UPDATED_AT': 'Updated At',
  'CDL_WST_WORKFLOW_STAGE_TEMPLATE': 'Workflow Stage Template',
  
  // Workflow Amount Rule
  'CDL_WAR_ID': 'ID',
  'CDL_WAR_CURRENCY': 'Currency',
  'CDL_WAR_MIN_AMOUNT': 'Min Amount',
  'CDL_WAR_MAX_AMOUNT': 'Max Amount',
  'CDL_WAR_PRIORITY': 'Priority',
  'CDL_WAR_REQUIRED_MAKERS': ' Makers',
  'CDL_WAR_REQUIRED_CHECKERS': ' Checkers',
  'CDL_WAR_WORKFLOW_DEFINITION_DTO': 'Workflow Definition',
  'CDL_WAR_WORKFLOW_ID': 'Workflow ID',
  'CDL_WAR_AMOUNT_RULE_NAME': 'Amount Rule Name', 
  'CDL_WAR_WORKFLOW_AMOUNT_STAGE_OVERRIDE_DTO': 'Workflow Amount Stage Override ',
  'CDL_WAR_WORKFLOW_AMOUNT_RULE': 'Workflow Amount Rule',
  
  // Workflow Amount Stage Override
  'CDL_WASO_ID': 'ID',
  'CDL_WASO_STAGE_ORDER': 'Stage Order',
  'CDL_WASO_REQUIRED_APPROVALS': 'Required Approvals',
  'CDL_WASO_KEYCLOAK_GROUP': 'Keycloak Group',
  'CDL_WASO_STAGE_KEY': 'Stage Key',
  'CDL_WASO_WORKFLOW_AMOUNT_RULE_DTO': 'Workflow Amount Rule',
  'CDL_WASO_WORKFLOW_AMOUNT_STAGE_OVERRIDE_DTOS': 'Workflow Amount Stage Override ',
  'CDL_WASO_WORKFLOW_AMOUNT_STAGE_OVERRIDE': 'Workflow Amount Stage Override',

  // Common UI labels
  'CDL_COMMON_ACTION': 'Action',
  'CDL_COMMON_ACTIONS': 'Actions',
  'CDL_COMMON_RETRY': 'Retry',
  'CDL_COMMON_ACTIVE': 'Active',
  'CDL_COMMON_CANCEL': 'Cancel',
  'CDL_COMMON_STATUS': 'Status',
  'CDL_COMMON_ADD': 'Add',
  'CDL_COMMON_UPDATE': 'Update',
  'CDL_COMMON_ADDING': 'Adding...',
  'CDL_COMMON_UPDATING': 'Updating...',
  'CDL_COMMON_LOADING': 'Loading...',
  'CDL_COMMON_VALIDATE_ACCOUNT': 'Validate Account',
  'CDL_COMMON_VALIDATE_BIC': 'Validate BIC',
  'CDL_COMMON_REQUIRED_FIELDS_PREFIX': 'Please fill in the required fields:',
  'CDL_COMMON_DROPDOWNS_LOAD_FAILED': 'Failed to load dropdown options. Please refresh the page.',
  'CDL_COMMON_SUBMIT_WAIT': 'Please wait for dropdown options to load before submitting.',
  'CDL_COMMON_DETAILS': 'Details',
  
}

// Utility function to get label by configId
export const getLabelByConfigId = (configId) => {
  return WORKFLOW_LABELS[configId] || configId
}

export const getWorkflowLabelsByCategory = (category) => {
  return WORKFLOW_LABELS[category] || category
}
