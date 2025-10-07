// Manual mapping for sidebar IDs that don't follow the automatic pattern
export const SIDEBAR_TO_CONFIG_MAPPING: Record<string, string> = {
  // Main sections
  'dasboard': 'CDL_DASHBOARD',                    // "Command Center"
  'activity': 'CDL_TASK_NAVIGATOR',               // "Task Navigator"
  'deposits': 'CDL_TRANSACTIONS',                 // "Transactions"
  'payment': 'CDL_PAYMENTS',                      // "Payments"
  'reports': 'CDL_REPORTS',                       // "Reports and Insights"
  'system admin': 'CDL_SYSTEM_SETTINGS',          // "System Settings"
  'entities': 'CDL_BUSINESS_OBJECTS',             // "Business Objects"
  
  // Entities section
  'developers': 'CDL_BUILD_PARTNER',              // "Build Partner"
  'projects': 'CDL_BUILD_PARTNER_ASSEST',          // "Build Partner Asset"
  'investors': 'CDL_CAPITAL_PARTNER',             // "Capital Partner"
  
  // Deposits section
  'unallocated': 'CDL_PENDING_TRANSACTION',       // "Pending Transactions"
  'discarded': 'CDL_REJECTED_TRANSACTIONS',       // "Rejected Transactions"
  'allocated': 'CDL_PROCESSED_TRANSACTIONS',      // "Processed Transactions"
  
  // Payment section
  'manual': 'CDL_MANUAL_DISBURSEMENTS',  
  'tas': 'CDL_TAS_DISBURSEMENTS',                 // "Trust Account Disbursements"
  
  // Individual items
  'guarantee': 'CDL_SURETY_BOND',                 // "Surety Bond"
  'fee-reconciliation': 'CDL_FEE_RECON',                  // "Fee Reconciliation"
  
  // System Admin section
  'user': 'CDL_STAKEHOLDER',                      // "Stakeholder"
  'role': 'CDL_ENTITLEMENT',                      // "Entitlement"
  'fee-type': 'CDL_ACCESS_GRANT',                 // "Access Grant"
  'workflow': 'CDL_WORKFLOW',                     // "Workflow"
  'workflow-action': 'CDL_WORKFLOW_ACTION',       // "Workflow Action"
  'workflow-definition': 'CDL_WORKFLOW_DEFINITION', // "Workflow Definition"
  'workflow-stage-template': 'CDL_WORKFLOW_STAGE_TEMPLATE', // "Workflow Stage Template"
  'workflow-amount-rule': 'CDL_WORKFLOW_AMOUNT_RULE', // "Workflow Amount Rule"
  'workflow-amount-stage': 'CDL_WORKFLOW_AMOUNT_STAGE', // "Workflow Amount Stage"
  'workflow-amount-stage-override': 'CDL_WORKFLOW_AMOUNT_STAGE_OVERRIDE', // "Workflow Amount Stage Override"
  
  // Activity section
  'pending': 'CDL_AWAITING_ACTIONS',
  'involved': 'CDL_MY_ENGEGEMENTS',               // "My Engagements"
  
  // Reports section
  'business': 'CDL_BUSINESS_OBJECTS',             // "Business Objects"
}

// Utility function to get configId from sidebar ID
export const getConfigId = (sidebarId: string): string => {
  // First check manual mapping
  if (SIDEBAR_TO_CONFIG_MAPPING[sidebarId]) {
    return SIDEBAR_TO_CONFIG_MAPPING[sidebarId]
  }
  
  // Fallback to automatic mapping: CDL_ + UPPERCASE(sidebar_id)
  return `CDL_${sidebarId.toUpperCase()}`
}



