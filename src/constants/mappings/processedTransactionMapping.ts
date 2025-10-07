// Processed Transaction label mapping for allocated transactions
// Maps configId to configValue for fallback when API labels are not available
// This ensures consistent labeling across the application

export const PROCESSED_TRANSACTION_LABELS = {
  // Main Section
  CDL_TRANS_TITLE: 'Allocated Transactions',
  CDL_TRANS_LIST: 'Processed / Allocated Transactions',

  // Transaction Labels (used in the page)
  CDL_TRAN_DATE: 'Transaction Date',
  CDL_TRAN_REFNO: 'Transaction Reference Number',
  CDL_TRAN_DESC: 'Transaction Description',
  CDL_TRAN_AMOUNT: 'Transaction Amount',
  CDL_TRAN_NOTES: 'Transaction Narration / Notes',
  CDL_TRAN_STATUS: 'Processing Status',
  CDL_TRAN_ACTION: 'Action',

  // Build Partner Labels
  CDL_TRANS_BP_NAME: 'Build Partner Name',
  CDL_TRANS_BP_ID: 'Build Partner ID',
  CDL_TRANS_BP_CIF: 'Build Partner CIF',
  CDL_TRANS_BPA_NAME: 'Build Partner Assets Name',
  CDL_TRANS_BPA_CIF: 'Build Partner Assets CIF',
  CDL_TRANS_BPA_REGULATOR: 'Regulator ID',

  // Transaction Details
  CDL_TRANS_UNIT_HOLDER: 'Unit Holder',
  CDL_TRAN_RECEIVABLE_CATEGORY: 'Receivables Category',
  CDL_TRAN_SUB_CATEGORY: 'Receivables Sub-Category',
  CDL_TRAN_METHOD: 'Deposit Method',
  CDL_TRAN_CHECK: 'Cheque Number',
  CDL_TRAN_TOTAL_AMT: 'Total Allocated Amount',
  CDL_TRAN_COMMENTS: 'Additional Comments',

  // Status and Actions
  CDL_TRANS_APPROVAL_STATUS: 'Approval Status',
  CDL_TRAN_MATCHING_STATUS: 'TAS / CBS Matching Status',
  CDL_TRAN_TAS_STATUS: 'TAS Matching Status',
  CDL_TRAN_DISCARD: 'Discard Entry',
  CDL_TRAN_UPDATE_TAS: 'Update TAS Record',
  CDL_TRAN_RETENTION: 'Apply 5% Retention',
  CDL_TRAN_SPLIT_AMT: 'Split Payment Amount',
  CDL_TRAN_ROLLBACK: 'Rollback Transaction',

  // Date Range Filters
  CDL_TRAN_START_DATE: 'Start Date',
  CDL_TRAN_END_DATE: 'End Date',

  // Transaction Types
  CDL_TRANS_CHEQUE: 'Cheque',
  CDL_TRANS_ACCOUNT_TRANSFER: 'Account Transfer',
  CDL_TRANS_INWARD_REMITTANCE: 'Inward Remittance',
  CDL_TRANS_CARD: 'Card',
  CDL_TRANS_CASH_DEPOSIT: 'Cash Deposit',
  CDL_TRANS_INSURANCE: 'Insurance',
  CDL_TRANS_CHEQUE_RETURN_CHARGES: 'Cheque Return Charges',
  CDL_TRANS_ERRONEOUS_LIST: 'Erroneous List',
  CDL_TRANS_REFUND: 'Refund',
  CDL_TRANS_CREDIT_INTEREST: 'Credit Interest',
  CDL_TRANS_OTHER_INCOME: 'Other Income',
  CDL_TRANS_SECURITY_DEPOSIT: 'Security Deposit',
  CDL_TRANS_BOUNCED_CHEQUE: 'Bounced Cheque',
  CDL_TRANS_INSURANCE_CLAIM: 'Insurance Claim',
  CDL_TRANS_RESERVE_FUND: 'Reserve Fund',
  CDL_TRANS_ERRONEOUS_CREDIT: 'Erroneous Credit',
  CDL_TRANS_ADVANCE_SERVICE_CHARGES: 'Advance Service Charges',
  CDL_TRANS_SERVICE_CHARGES: 'Service Charges',
  CDL_TRANS_OTHERS: 'Others',
  CDL_TRANS_BUILD_PARTNER: 'Build Partner',
  CDL_TRANS_TRANSFER_FROM_BP: 'Transfer From Build Partner',
  CDL_TRANS_LOAN: 'Loan',
  CDL_TRANS_MORTGAGE: 'Mortgage',

  // API Actions
  CDL_TRAN_FETCH: 'Retrieve Transaction Records',
  CDL_TRAN_TEMPLATE_DOWNLOAD: 'Download Transaction Template',
  CDL_TRAN_UPLOAD: 'Upload Transaction File',
  CDL_TRAN_UPLOAD_TAS: 'Upload TAS Data',
}

// Helper function to get label with fallback
export const getProcessedTransactionLabel = (configId: string): string => {
  return (PROCESSED_TRANSACTION_LABELS as Record<string, string>)[configId] || configId
}

// Helper function to get multiple labels
export const getProcessedTransactionLabels = (configIds: string[]): Record<string, string> => {
  const labels: Record<string, string> = {}
  configIds.forEach(configId => {
    labels[configId] = getProcessedTransactionLabel(configId)
  })
  return labels
}

// Helper function to check if a configId has a mapping
export const hasProcessedTransactionLabel = (configId: string): boolean => {
  return configId in PROCESSED_TRANSACTION_LABELS
}

// Export all available configIds for reference
export const PROCESSED_TRANSACTION_CONFIG_IDS = Object.keys(PROCESSED_TRANSACTION_LABELS)

// Export labels by category for better organization
export const PROCESSED_TRANSACTION_LABELS_BY_CATEGORY = {
  MAIN: {
    CDL_TRANS_TITLE: PROCESSED_TRANSACTION_LABELS.CDL_TRANS_TITLE,
    CDL_TRANS_LIST: PROCESSED_TRANSACTION_LABELS.CDL_TRANS_LIST,
  },
  TRANSACTION: {
    CDL_TRAN_DATE: PROCESSED_TRANSACTION_LABELS.CDL_TRAN_DATE,
    CDL_TRAN_REFNO: PROCESSED_TRANSACTION_LABELS.CDL_TRAN_REFNO,
    CDL_TRAN_DESC: PROCESSED_TRANSACTION_LABELS.CDL_TRAN_DESC,
    CDL_TRAN_AMOUNT: PROCESSED_TRANSACTION_LABELS.CDL_TRAN_AMOUNT,
    CDL_TRAN_NOTES: PROCESSED_TRANSACTION_LABELS.CDL_TRAN_NOTES,
    CDL_TRAN_STATUS: PROCESSED_TRANSACTION_LABELS.CDL_TRAN_STATUS,
    CDL_TRAN_ACTION: PROCESSED_TRANSACTION_LABELS.CDL_TRAN_ACTION,
  },
  BUILD_PARTNER: {
    CDL_TRANS_BP_NAME: PROCESSED_TRANSACTION_LABELS.CDL_TRANS_BP_NAME,
    CDL_TRANS_BP_ID: PROCESSED_TRANSACTION_LABELS.CDL_TRANS_BP_ID,
    CDL_TRANS_BP_CIF: PROCESSED_TRANSACTION_LABELS.CDL_TRANS_BP_CIF,
    CDL_TRANS_BPA_NAME: PROCESSED_TRANSACTION_LABELS.CDL_TRANS_BPA_NAME,
    CDL_TRANS_BPA_CIF: PROCESSED_TRANSACTION_LABELS.CDL_TRANS_BPA_CIF,
    CDL_TRANS_BPA_REGULATOR: PROCESSED_TRANSACTION_LABELS.CDL_TRANS_BPA_REGULATOR,
  },
  ACTIONS: {
    CDL_TRAN_DISCARD: PROCESSED_TRANSACTION_LABELS.CDL_TRAN_DISCARD,
    CDL_TRAN_UPDATE_TAS: PROCESSED_TRANSACTION_LABELS.CDL_TRAN_UPDATE_TAS,
    CDL_TRAN_RETENTION: PROCESSED_TRANSACTION_LABELS.CDL_TRAN_RETENTION,
    CDL_TRAN_SPLIT_AMT: PROCESSED_TRANSACTION_LABELS.CDL_TRAN_SPLIT_AMT,
    CDL_TRAN_ROLLBACK: PROCESSED_TRANSACTION_LABELS.CDL_TRAN_ROLLBACK,
  },
  TRANSACTION_TYPES: {
    CDL_TRANS_CHEQUE: PROCESSED_TRANSACTION_LABELS.CDL_TRANS_CHEQUE,
    CDL_TRANS_ACCOUNT_TRANSFER: PROCESSED_TRANSACTION_LABELS.CDL_TRANS_ACCOUNT_TRANSFER,
    CDL_TRANS_INWARD_REMITTANCE: PROCESSED_TRANSACTION_LABELS.CDL_TRANS_INWARD_REMITTANCE,
    CDL_TRANS_CARD: PROCESSED_TRANSACTION_LABELS.CDL_TRANS_CARD,
    CDL_TRANS_CASH_DEPOSIT: PROCESSED_TRANSACTION_LABELS.CDL_TRANS_CASH_DEPOSIT,
    CDL_TRANS_INSURANCE: PROCESSED_TRANSACTION_LABELS.CDL_TRANS_INSURANCE,
  },
}
