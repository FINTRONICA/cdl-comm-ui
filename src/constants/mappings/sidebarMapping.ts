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


  // Master section side bar and tabs  FOR SIDE BAR LABELS
  'Customer': 'CDL_CUSTOMER_MASTER',   //side bar label
  'Party': 'CDL_MASTER_PARTY',  //tab label
  'Authorized Signatory': 'CDL_MASTER_AUTHORIZED_SIGNATORY',   // steper label
  'Account Purpose': 'CDL_MASTER_ACCOUNT_PURPOSE',  //tab label
  'Investment Type': 'CDL_MASTER_INVESTMENT_TYPE',  //tab label      
  'Business Segment': 'CDL_MASTER_BUSINESS_SEGMENT',  //tab label
  'Business Sub Segment': 'CDL_MASTER_BUSINESS_SUB_SEGMENT',  //tab label
  'Agreement Type': 'CDL_MASTER_AGREEMENT_TYPE',  //tab label
  'AgreementSubType': 'CDL_MASTER_AGREEMENT_SUB_TYPE',  //tab label
  'Product Program': 'CDL_MASTER_PRODUCT_PROGRAM',  //tab label
  'Beneficiary': 'CDL_MASTER_BENEFICIARY',  //tab label
  'Document Type': 'CDL_MASTER_DOCUMENT_TYPE',  //tab label
  'Agreement Segment': 'CDL_MASTER_AGREEMENT_SEGMENT',  //tab label
  'General Ledger Account': 'CDL_MASTER_GENERAL_LEDGER_ACCOUNT',  //tab label
  'Country': 'CDL_MASTER_COUNTRY',  //tab label
  'Currency': 'CDL_MASTER_CURRENCY',  //tab label
  'Entity': 'CDL_ENTITY',  //tab label
  'Escrow Agreement': 'CDL_ESCROW_AGREEMENT',  //side bar label
  'Escrow Account': 'CDL_ESCROW_ACCOUNT',  //side bar label
  'Party Signatory': 'CDL_PARTY_SIGNATORY',  //side bar label
  'Agreement Parameters': 'CDL_AGREEMENT_PARAMETERS',  //side bar label
  'Agreement Fee Schedule': 'CDL_AGREEMENT_FEE_SCHEDULE',  //side bar label
  'Agreement Beneficiary': 'CDL_AGREEMENT_BENEFICIARY',  //side bar label
  'Payment Instruction': 'CDL_PAYMENT_INSTRUCTION',  //side bar label
  'Reconciled Transactions': 'CDL_RECONCILED_TRANSACTIONS',  //side bar label
  'Processing Status': 'CDL_PROCESSING_STATUS',  //side bar label
  'Transaction Processing History': 'CDL_TRANSACTION_PROCESSING_HISTORY',  //side bar label
  'Standing Instruction Beneficiary': 'CDL_STANDING_INSTRUCTION_BENEFICIARY',  //side bar label
  'Scheduled Job': 'CDL_SCHEDULED_JOB',  //side bar label
  'Standing Instruction': 'CDL_STANDING_INSTRUCTION',  //side bar label
  'Unreconciled Transactions': 'CDL_UNRECONCILED_TRANSACTIONS',  //side bar label
  'Agreement Budget Plan': 'CDL_AGREEMENT_BUDGET_PLAN',  //side bar label
  'Bulk Payment Upload': 'CDL_BULK_PAYMENT_UPLOAD',  //side bar label
  'Deposit': 'CDL_DEPOSIT',  //side bar label
  







// side bar 

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



