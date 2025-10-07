/**
 * Manual Payment Labels Mapping
 * Maps UI elements to actual API configIds from /api/v1/app-language-translation/payments
 */

export const MANUAL_PAYMENT_LABELS = {
  // Page Title
  PAGE_TITLE: 'CDL_PAYMENTS', // "Payment Overview"
  
  // Step Labels
  STEPS: {
    DETAILS: 'CDL_PAYMENTS_INFO', // "General Payment Information"
    DOCUMENTS: 'CDL_PAYMENTS_REVIEW', // "Review Guarantee Details & Documents Prior to Submission"
    REVIEW: 'CDL_PAYMENTS', // "Payment Overview"
  },

  // Section Titles
  SECTION_TITLES: {
    GENERAL_DETAILS: 'CDL_PAYMENTS_INFO', // "General Payment Information"
    EXPENSE_TYPE: 'CDL_PAYMENTS_EXPENSE_TYPE', // "Expense Category"
    AMOUNT_DETAILS: 'CDL_PAYMENTS_AMOUNT_INFO', // "Amount & Eligibility Summary"
    NARRATION: 'CDL_PAYMENTS_NARRATION', // "Payment Narration"
    UNIT_CANCELLATION: 'CDL_PAYMENTS_UNIT_CAN_DETAILS', // "Unit Cancellation & Adjustment Details"
  },

  // Form Field Labels
  FORM_FIELDS: {
    TAS_REFERENCE: 'CDL_PAYMENTS_EMS_REFNO', // "EMS Payment Reference Number"
    DEVELOPER_NAME: 'CDL_TRANS_BP_NAME', // "Build Partner Name"
    DEVELOPER_ID: 'CDL_TRANS_BP_NAME', // "Build Partner Name"
    PROJECT_NAME: 'CDL_TRANS_BPA_NAME', // "Build Partner Assets Name"
    PROJECT_ID: 'CDL_TRANS_BPA_NAME', // "Build Partner Assets Name"
    PROJECT_STATUS: 'CDL_TRANS_APPROVAL_STATUS', // "Approval Status"
    ESCROW_ACCOUNT: 'CDL_PAYMENTS_ESCROW_BAL', // "Escrow Account Current Balance"
    SUB_CONSTRUCTION_ACCOUNT: 'CDL_PAYMENTS_CONS_BAL', // "Construction Account Current Balance"
    CORPORATE_ACCOUNT: 'CDL_PAYMENTS_COR_PAYMENT', // "Corporate Payment"
    RETENTION_ACCOUNT: 'CDL_PAYMENTS_RETENTION_BAL', // "Retention Account Current Balance"
    PAYMENT_TYPE: 'CDL_PAYMENTS_PAYMENT_TYPE', // "Payment Type"
    PAYMENT_SUB_TYPE: 'CDL_PAYMENTS_PAYMENT_SUB_TYPE', // "Payment Sub-Type"
    REGULAR_APPROVAL_REF: 'CDL_PAYMENTS_APPROVAL_REF_NO', // "Regulatory Approval Reference Number"
    REGULAR_APPROVAL_DATE: 'CDL_PAYMENTS_APPROVAL_DATE', // "Regulatory Approval Date"
    INVOICE_REF: 'CDL_PAYMENTS_INVOICE_REFNO', // "Invoice Reference Number"
    INVOICE_CURRENCY: 'CDL_PAYMENTS_INVOICE_CURRENCY', // "Invoice Currency"
    INVOICE_VALUE: 'CDL_PAYMENTS_INVOICE_VALUE', // "Invoice Total Value"
    INVOICE_DATE: 'CDL_PAYMENTS_INVOICE_DATE', // "Invoice Date"
    ENGINEER_APPROVED_AMOUNT: 'CDL_PAYMENTS_ENG_APP_AMT', // "Engineer-Approved Amount"
    TOTAL_ELIGIBLE_AMOUNT: 'CDL_PAYMENTS_TOTAL_ELIGIBLE_AMT', // "Total Eligible Payment Amount"
    AMOUNT_PAID: 'CDL_PAYMENTS_AMOUNT_PAID', // "Amount Paid Against Invoice"
    CAP_EXCEEDED: 'CDL_PAYMENTS_CAP_EXCED', // "Capital Limit Exceeded"
    TOTAL_AMOUNT_PAID: 'CDL_PAYMENTS_PAID_PAYMENT_TYPE', // "Total Paid for Payment Type"
    PAYMENT_CURRENCY: 'CDL_PAYMENTS_PAYMENT_CURRENCY', // "Payment Currency"
    DEBIT_CREDIT_ESCROW: 'CDL_PAYMENTS_DC_ESCROW', // "Escrow Account Debit / Credit"
    CURRENT_ELIGIBLE_AMOUNT: 'CDL_PAYMENTS_CUR_ELIGIBLE_AMT', // "Current Eligible Payment Amount"
    DEBIT_FROM_RETENTION: 'CDL_PAYMENTS_DEBIT_FRM_RETENTION', // "Retention Account Debit Amount"
    TOTAL_PAYOUT_AMOUNT: 'CDL_PAYMENTS_TOTAL_PAYOUT_AMT', // "Total Disbursement Amount"
    AMOUNT_IN_TRANSIT: 'CDL_PAYMENTS_AMOUNT_IN_TRANSIT', // "Amount in Transit"
    VAT_CAP_EXCEEDED: 'CDL_PAYMENTS_VAT_CAP_EXCEDDED', // "VAT Limit Exceeded"
    SPECIAL_RATE: 'CDL_PAYMENTS_SPECIAL_RATE', // "Special Exchange Rate"
    CORPORATE_AMOUNT: 'CDL_PAYMENTS_COR_PAYMENT', // "Corporate Payment"
    DEAL_REF_NO: 'CDL_PAYMENTS_DEAL_REFNO', // "Deal Reference Number"
    PPC_NUMBER: 'CDL_PAYMENTS_PPC_NO', // "PPC Number"
    INDICATIVE_RATE: 'CDL_PAYMENTS_INDICATIVE_RATE', // "Indicative FX Rate"
    CORPORATE_CERTIFICATION_FEES: 'CDL_PAYMENTS_ENG_FEE', // "Corporate Certification – Engineer's Fee"
    NARRATION_1: 'CDL_PAYMENTS_NARRATION', // "Payment Narration"
    NARRATION_2: 'CDL_PAYMENTS_NARRATION1', // "Additional Narration 1"
    REMARKS: 'CDL_PAYMENTS_NARRATION2', // "Additional Narration 2"
    UNIT_NO: 'CDL_PAYMENTS_UNIT_NO', // "Unit Number"
    TOWER_NAME: 'CDL_PAYMENTS_TOWER_NAME', // "Tower Name"
    UNIT_STATUS: 'CDL_PAYMENTS_UNIT_STATUS', // "Unit Status"
    AMOUNT_RECEIVED: 'CDL_PAYMENTS_AMT_RECEIVED', // "Payment Received from Unit Holder"
    FORFEIT: 'CDL_PAYMENTS_FORFEIT', // "Forfeited Status"
    REFUND_TO_UNIT_HOLDER: 'CDL_PAYMENTS_REFUND_UNIT_HOLDER', // "Refund to Unit Holder"
    TRANSFER_TO_OTHER_UNIT: 'CDL_PAYMENTS_TRN_OTHER_UNIT', // "Transfer to Another Unit"
    FORFEIT_AMOUNT: 'CDL_PAYMENTS_FORFEIT_AMT', // "Forfeited Amount"
    REGULATOR_APPROVAL_REF: 'CDL_PAYMENTS_APP_REF_NO', // "Regulatory Approval Reference Number"
    REGULATOR_APPROVAL_DATE: 'CDL_PAYMENTS_APP_DATE', // "Regulatory Approval Date"
    CHARGE_MODE: 'CDL_PAYMENTS_CHARGE_MODE', // "Charge Code"
    PAYMENT_MODE: 'CDL_PAYMENTS_PAYMENT_MODE', // "Payment Method"
    TRANSACTION_TYPE: 'CDL_PAYMENTS_TRANSACTION_TYPE', // "Transaction Type"
    AMOUNT_TO_BE_RELEASED: 'CDL_PAYMENTS_AMT_RELEASED', // "Amount to be Released"
    PAYMENT_DATE: 'CDL_PAYMENTS_PAYMENT_DATE', // "Payment Execution Date"
    VAT_PAYMENT_AMOUNT: 'CDL_PAYMENTS_VAT_AMT_PAYMENT', // "VAT Payment Amount"
    ENGINEER_FEE_PAYMENT_NEEDED: 'CDL_PAYMENTS_ENG_FEE', // "Engineer Fee Payment Requirement"
    ENGINEER_FEES_PAYMENT: 'CDL_PAYMENTS_ENG_FEE_PAYMENT', // "Engineer Fee Payment"
    BANK_CHARGES: 'CDL_PAYMENTS_BANK_CHARGES', // "Bank Charges"
    PAYMENT_FROM_CBS: 'CDL_PAYMENTS_PAYOUT_CBS', // "Payout via CBS"
    REVIEW_NOTE: 'CDL_PAYMENTS_REVIEW', // "Review Guarantee Details & Documents Prior to Submission"
  },

  // Table Column Labels
  TABLE_COLUMNS: {
    DATE: 'CDL_PAYMENTS_PAYMENT_DATE', // "Payment Execution Date"
    EMS_REF: 'CDL_PAYMENTS_EMS_REFNO', // "EMS Payment Reference Number"
    DEVELOPER_NAME: 'CDL_TRANS_BP_NAME', // "Build Partner Name"
    PROJECT_NAME: 'CDL_TRANS_BPA_NAME', // "Build Partner Assets Name"
    PAYMENT_TYPE: 'CDL_PAYMENTS_PAYMENT_TYPE', // "Payment Type"
    PAYMENT_SUB_TYPE: 'CDL_PAYMENTS_PAYMENT_SUB_TYPE', // "Payment Sub-Type"
    INVOICE_NUMBER: 'CDL_PAYMENTS_INVOICE_REFNO', // "Invoice Reference Number"
    CORPORATE_PAYMENT: 'CDL_PAYMENTS_COR_PAYMENT', // "Corporate Payment"
    BENEFICIARY_NAME: 'CDL_TRANS_UNIT_HOLDER', // "Unit Holder"
    STATUS: 'CDL_PAYMENTS_TRANSACTION_TYPE', // "Transaction Type"
    ERROR_DESCRIPTION: 'CDL_PAYMENTS_NARRATION', // "Payment Narration"
    DISCARDED_TRANSACTION: 'CDL_TRAN_DISCARD', // "Discard Entry"
    APPROVAL_STATUS: 'CDL_TRANS_APPROVAL_STATUS', // "Approval Status"
    ACTIONS: 'CDL_TRANS_ACTION', // "Action"
  },

  // Status Options
  STATUS_OPTIONS: {
    APPROVED: 'CDL_TRANS_APPROVAL_STATUS', // "Approval Status"
    IN_REVIEW: 'CDL_PAYMENTS_TRANSACTION_TYPE', // "Transaction Type"
    PARTIAL_PAYMENT: 'CDL_PAYMENTS_AMT_RELEASED', // "Amount to be Released"
    INCOMPLETE: 'CDL_TRAN_DISCARD', // "Discard Entry"
  },

  // Expanded Content Sections
  EXPANDED_SECTIONS: {
    PAYMENT_INFO: 'CDL_PAYMENTS_INFO', // "General Payment Information"
    PAYMENT_STATUS: 'CDL_PAYMENTS_TRANSACTION_TYPE', // "Transaction Type"
    PAYMENT_DOCUMENTS: 'CDL_PAYMENTS_REVIEW', // "Review Guarantee Details & Documents Prior to Submission"
  },

  // Expanded Content Fields
  EXPANDED_FIELDS: {
    DATE: 'CDL_PAYMENTS_PAYMENT_DATE', // "Payment Execution Date"
    EMS_REF: 'CDL_PAYMENTS_EMS_REFNO', // "EMS Payment Reference Number"
    DEVELOPER_NAME: 'CDL_TRANS_BP_NAME', // "Build Partner Name"
    PROJECT_NAME: 'CDL_TRANS_BPA_NAME', // "Build Partner Assets Name"
    PAYMENT_TYPE: 'CDL_PAYMENTS_PAYMENT_TYPE', // "Payment Type"
    PAYMENT_SUB_TYPE: 'CDL_PAYMENTS_PAYMENT_SUB_TYPE', // "Payment Sub-Type"
    INVOICE_NUMBER: 'CDL_PAYMENTS_INVOICE_REFNO', // "Invoice Reference Number"
    CORPORATE_PAYMENT: 'CDL_PAYMENTS_COR_PAYMENT', // "Corporate Payment"
    BENEFICIARY_NAME: 'CDL_TRANS_UNIT_HOLDER', // "Unit Holder"
    STATUS: 'CDL_PAYMENTS_TRANSACTION_TYPE', // "Transaction Type"
    ERROR_DESCRIPTION: 'CDL_PAYMENTS_NARRATION', // "Payment Narration"
    DISCARDED_TRANSACTION: 'CDL_TRAN_DISCARD', // "Discard Entry"
    APPROVAL_STATUS: 'CDL_TRANS_APPROVAL_STATUS', // "Approval Status"
    AMOUNT_INFO: 'CDL_PAYMENTS_AMOUNT_INFO', // "Amount & Eligibility Summary"
    ESCROW_BALANCE: 'CDL_PAYMENTS_ESCROW_BAL', // "Escrow Account Current Balance"
    CONSTRUCTION_BALANCE: 'CDL_PAYMENTS_CONS_BAL', // "Construction Account Current Balance"
    RETENTION_BALANCE: 'CDL_PAYMENTS_RETENTION_BAL', // "Retention Account Current Balance"
    PAYMENT_METHOD: 'CDL_PAYMENTS_PAYMENT_MODE', // "Payment Method"
    CHARGE_CODE: 'CDL_PAYMENTS_CHARGE_MODE', // "Charge Code"
  },

  // Document Labels
  DOCUMENTS: {
    INVOICE: 'CDL_PAYMENTS_INVOICE_REFNO', // "Invoice Reference Number"
    CONSTRUCTION_PROGRESS: 'CDL_PAYMENTS_REVIEW', // "Review Guarantee Details & Documents Prior to Submission"
    APPROVAL: 'CDL_PAYMENTS_APPROVAL_REF_NO', // "Regulatory Approval Reference Number"
    HISTORY: 'CDL_PAYMENTS', // "Payment Overview"
  },

  // Action Messages
  ACTION_MESSAGES: {
    DELETE_CONFIRM: 'CDL_TRAN_DISCARD', // "Discard Entry"
    DELETE_ERROR: 'CDL_PAYMENTS_NARRATION', // "Payment Narration"
    APPROVE_ERROR: 'CDL_TRANS_APPROVAL_STATUS', // "Approval Status"
    REJECT_PROMPT: 'CDL_PAYMENTS_NARRATION', // "Payment Narration"
    REJECT_ERROR: 'CDL_TRAN_DISCARD', // "Discard Entry"
    REFRESH_ERROR: 'CDL_PAYMENTS', // "Payment Overview"
  },

  // Payment Types (Comprehensive API Labels)
  PAYMENT_TYPES: {
    CONSTRUCTION_COST: 'CDL_TRAN_CONSTRUCTION_COST', // "Construction Cost"
    ADVANCE_PAYMENT: 'CDL_TRAN_ADVANCE_PAYMENT', // "Advance Payment"
    RERA_FEES: 'CDL_TRAN_RERA_FEES', // "Rera Fees"
    UNIT_CANCEL: 'CDL_TRAN_UNIT_CANCEL', // "Cancel Unit"
    UNIT_TRANSFER: 'CDL_TRAN_UNIT_TRANSFER', // "Unit Transfer"
    INFRASTRUCTURE_PAYMENT: 'CDL_TRAN_INFRASTRUCTURE_PAYMENT', // "Infrastructure Payment"
    LAND_PAYMENTS: 'CDL_TRAN_LAND_PAYMENTS', // "Land Payments"
    LOAN_INSTALLMENT: 'CDL_TRAN_LOAN_INSTALLMENT', // "Loan Installments"
    PROJECT_MANAGEMENT: 'CDL_TRAN_PROJECT_MANAGEMENT', // "Project Management"
    BANK_CHARGES: 'CDL_TRAN_BANK_CHARGES', // "Bank Charges"
    MARKETING_SALES: 'CDL_TRAN_MARKETING_N_SALES_EXPENSE', // "Sales and Marketing"
    OTHERS: 'CDL_TRAN_OTHERS', // "Others"
    PROJECT_TRANSFER: 'CDL_TRAN_PROJECT_TRANSFER', // "Project Transfer"
    REIMBURSEMENT: 'CDL_TRAN_REIMBURSEMENT', // "Reimbursements"
    TRANSFER_SCAC_TO_ESAC: 'CDL_TRAN_TRANSFER_TO_SCAC_FROM_ESAC', // "Transfer from SC Acc to Escrow Acc"
    REVERSE_ESAC_TO_SCAC: 'CDL_TRAN_REVERSE_FROM_SCAC_TO_ESAC', // "Transfer From Escrow Acc to SC Acc"
    PROJECT_MANAGEMENT_EXP: 'CDL_TRAN_PROJECT_MANAGEMENT_EXP', // "Project Management Expenses"
    REVERSAL: 'CDL_TRAN_REVERSAL', // "Reversal"
    TRANSFER_TO_RETENTION: 'CDL_TRAN_TRANSFER_TO_RETENTION_AC', // "Transfer to Retention Acc"
    TRANSFER_FROM_RETENTION: 'CDL_TRAN_TRANSFER_FROM_RETENTION', // "Transfer From Retention Acc"
    OUT_OF_ESCROW: 'CDL_TRAN_OUT_OF_ESCROW', // "Out Of Escrow"
    ERRONEOUS_PAYMENT: 'CDL_TRAN_ERRONEOUS_PAYMENT', // "Erroneous Payment"
    REVERSAL_OF_RETENTION: 'CDL_TRAN_REVERSAL_OF_RETENTION', // "Traversal of Retention"
    DLD_FEES: 'CDL_TRAN_DLD_FEES', // "DLD Fees"
    UNIT_REGISTRATION_FEE: 'CDL_TRAN_UNIT_REGISTRATION_FEE', // "Unit Registration Fees"
    TECHNICAL_FEES: 'CDL_TRAN_TECHNICAL_FEES', // "Technical Fees"
    BROKERAGE: 'CDL_TRAN_BROKERAGE', // "Brokerage"
    MARKETING: 'CDL_TRAN_MARKETING', // "Marketing"
    PROFIT: 'CDL_TRAN_PROFIT', // "Profit"
  },

  // Payment Methods
  PAYMENT_METHODS: {
    TT: 'CDL_TRAN_MODE_TT', // "TT (Transfer)"
    TR: 'CDL_TRAN_MODE_TR', // "TR (Transfer)"
    MC: 'CDL_TRAN_MODE_MC', // "MC (Transfer)"
    CBS: 'CDL_PAYMENTS_PAYOUT_CBS', // "Payout via CBS"
  },

  // Additional Form Labels from API
  ADDITIONAL_FORM_FIELDS: {
    SUB_CONSTRUCTION_BALANCE: 'CDL_PAYMENTS_SUBCONS_BAL', // "Sub-Construction Account Current Balance"
    PAYOUT_CBS: 'CDL_PAYMENTS_PAYOUT_CBS', // "Payout via CBS"
    FETCH_EXCHANGE_RATE: 'CDL_PAYMENTS_EXCHANGE_RATE', // "Fetch Exchange Rate"
    CORPORATE_CERTIFICATION_FEES: 'CDL_PAYMENTS_ENG_FEE', // "Corporate Certification – Engineer's Fee"
    ADDITIONAL_NARRATION_3: 'CDL_PAYMENTS_NARRATION3', // "Additional Narration 3"
  },

  // Yes/No Options
  YES_NO: {
    YES: 'CDL_AS_YES', // "Yes"
    NO: 'CDL_AS_NO', // "No"
  },

  // Loading Labels for Dynamic Dropdowns
  LOADING_LABELS: {
    DEVELOPER_NAME: 'Loading Developer...',
    PROJECT_NAME: 'Loading Project...',
    PAYMENT_TYPE: 'Loading Payment Type...',
    PAYMENT_SUB_TYPE: 'Loading Payment Sub Type...',
    INVOICE_CURRENCY: 'Loading Currency...',
    PAYMENT_CURRENCY: 'Loading Payment Currency...',
    DEPOSIT_MODE: 'Loading Deposit Mode...',
    PAYMENT_MODE: 'Loading Payment Mode...',
    TRANSFER_TYPE: 'Loading Transfer Type...',
    BUILD_ASSET_ACCOUNT_STATUS: 'Loading Status...',
    CHARGE_MODE: 'Loading Charge Mode...',
    TRANSACTION_TYPE: 'Loading Transaction Type...',
    BANK_CHARGES: 'Loading Bank Charges...',
    TOTAL_AMOUNT_PAID: 'Loading Amount...',
  },

  // Fallback Labels (used when API doesn't have the specific label)
  FALLBACKS: {
    PAGE_TITLE: 'Manual Payments',
    STEPS: {
      DETAILS: 'Payment Details',
      DOCUMENTS: 'Documents',
      REVIEW: 'Review',
    },
    SECTION_TITLES: {
      GENERAL_DETAILS: 'General Details',
      EXPENSE_TYPE: 'Expense Type',
      AMOUNT_DETAILS: 'Amount Details',
      NARRATION: 'Narration',
      UNIT_CANCELLATION: 'Unit Cancellation Details',
    },
    FORM_FIELDS: {
      TAS_REFERENCE: 'Tas/EMS Payment Ref no.',
      DEVELOPER_NAME: 'Developer Name',
      DEVELOPER_ID: 'Developer ID',
      PROJECT_NAME: 'Project Name',
      PROJECT_ID: 'Project ID',
      PROJECT_STATUS: 'Project Account Status',
      ESCROW_ACCOUNT: 'Escrow Account',
      SUB_CONSTRUCTION_ACCOUNT: 'Sub Construction Account',
      CORPORATE_ACCOUNT: 'Corporate Account',
      RETENTION_ACCOUNT: 'Retention Account',
      PAYMENT_TYPE: 'Payment Type',
      PAYMENT_SUB_TYPE: 'Payment Sub Type',
      REGULAR_APPROVAL_REF: 'Regular Approval Ref No',
      REGULAR_APPROVAL_DATE: 'Regular Approval Date',
      INVOICE_REF: 'Invoice Ref no.',
      INVOICE_CURRENCY: 'Invoice Currency',
      INVOICE_VALUE: 'Invoice Value',
      INVOICE_DATE: 'Invoice Date',
      ENGINEER_APPROVED_AMOUNT: 'Engineer Approved Amount',
      TOTAL_ELIGIBLE_AMOUNT: 'Total Eligible Amount (Invoice)',
      AMOUNT_PAID: 'Amount Paid against Invoice',
      CAP_EXCEEDED: 'Cap Exceeded',
      TOTAL_AMOUNT_PAID: 'Total Amount paid (Payment Type)',
      PAYMENT_CURRENCY: 'Payment Currency',
      DEBIT_CREDIT_ESCROW: 'Debit/Credit to Escrow (AED)',
      CURRENT_ELIGIBLE_AMOUNT: 'Current Eligible Amount',
      DEBIT_FROM_RETENTION: 'Debit from Retention (AED)',
      TOTAL_PAYOUT_AMOUNT: 'Total Payout Amount',
      AMOUNT_IN_TRANSIT: 'Amount in Transit',
      VAT_CAP_EXCEEDED: 'VAT Cap Exceeded',
      SPECIAL_RATE: 'Special Rate',
      CORPORATE_AMOUNT: 'Corporate Amount',
      DEAL_REF_NO: 'Deal Ref No.',
      PPC_NUMBER: 'PPC Number',
      INDICATIVE_RATE: 'Indicative Rate',
      CORPORATE_CERTIFICATION_FEES: 'Corporate Certification Engineer\'s Fees',
      NARRATION_1: 'Narration 1',
      NARRATION_2: 'Narration 2',
      REMARKS: 'Remarks',
      UNIT_NO: 'Unit No.',
      TOWER_NAME: 'Tower Name',
      UNIT_STATUS: 'Unit Status',
      AMOUNT_RECEIVED: 'Amount received from Unit Holder',
      FORFEIT: 'Forfeit',
      REFUND_TO_UNIT_HOLDER: 'Refund to unit holder',
      TRANSFER_TO_OTHER_UNIT: 'Transfer to other unit',
      FORFEIT_AMOUNT: 'Forfeit Amount',
      REGULATOR_APPROVAL_REF: 'Regulator Approval Ref No.',
      REGULATOR_APPROVAL_DATE: 'Regulator Approval Date',
      CHARGE_MODE: 'Charge Mode',
      PAYMENT_MODE: 'Payment Mode',
      TRANSACTION_TYPE: 'Transaction Type',
      AMOUNT_TO_BE_RELEASED: 'Amount to be Released',
      PAYMENT_DATE: 'Payment Date',
      VAT_PAYMENT_AMOUNT: 'VAT Payment Amount',
      ENGINEER_FEE_PAYMENT_NEEDED: 'Engineer Fee Payment Needed',
      ENGINEER_FEES_PAYMENT: 'Engineer Fees Payment',
      BANK_CHARGES: 'Bank Charges',
      PAYMENT_FROM_CBS: 'Payment to be made from CBS',
      REVIEW_NOTE: 'Please review the Guarantee details and Documents before submitting the payment',
    },
    TABLE_COLUMNS: {
      DATE: 'Date',
      EMS_REF: 'EMS Payment Ref. No.',
      DEVELOPER_NAME: 'Build Partner',
      PROJECT_NAME: 'Build Partner Assets',
      PAYMENT_TYPE: 'Payment Type',
      PAYMENT_SUB_TYPE: 'Payment Sub Type',
      INVOICE_NUMBER: 'Invoice Number',
      CORPORATE_PAYMENT: 'Corporate Payment',
      BENEFICIARY_NAME: 'Beneficiary Name',
      STATUS: 'Status',
      ERROR_DESCRIPTION: 'Error Description',
      DISCARDED_TRANSACTION: 'Discarded Transaction',
      APPROVAL_STATUS: 'Approval Status',
      ACTIONS: 'Actions',
    },
    STATUS_OPTIONS: {
      APPROVED: 'Approved',
      IN_REVIEW: 'In Review',
      PARTIAL_PAYMENT: 'Partial Payment',
      INCOMPLETE: 'Incomplete',
    },
    EXPANDED_SECTIONS: {
      PAYMENT_INFO: 'Payment Information',
      PAYMENT_STATUS: 'Payment Status & Details',
      PAYMENT_DOCUMENTS: 'Payment Documents',
    },
    EXPANDED_FIELDS: {
      DATE: 'Date',
      EMS_REF: 'EMS Payment Ref. No.',
      DEVELOPER_NAME: 'Developer Name',
      PROJECT_NAME: 'Project Name',
      PAYMENT_TYPE: 'Payment Type',
      PAYMENT_SUB_TYPE: 'Payment Sub Type',
      INVOICE_NUMBER: 'Invoice Number',
      CORPORATE_PAYMENT: 'Corporate Payment',
      BENEFICIARY_NAME: 'Beneficiary Name',
      STATUS: 'Status',
      ERROR_DESCRIPTION: 'Error Description',
      DISCARDED_TRANSACTION: 'Discarded Transaction',
      APPROVAL_STATUS: 'Approval Status',
      AMOUNT_INFO: 'Amount Information',
      ESCROW_BALANCE: 'Escrow Balance',
      CONSTRUCTION_BALANCE: 'Construction Balance',
      RETENTION_BALANCE: 'Retention Balance',
      PAYMENT_METHOD: 'Payment Method',
      CHARGE_CODE: 'Charge Code',
    },
    DOCUMENTS: {
      INVOICE: 'Payment Invoice',
      CONSTRUCTION_PROGRESS: 'Construction Progress Report',
      APPROVAL: 'Approval Documents',
      HISTORY: 'Payment History',
    },
    ACTION_MESSAGES: {
      DELETE_CONFIRM: 'Are you sure you want to delete payment?',
      DELETE_ERROR: 'Failed to delete payment. Please try again.',
      APPROVE_ERROR: 'Failed to approve payment. Please try again.',
      REJECT_PROMPT: 'Please provide a reason for rejection:',
      REJECT_ERROR: 'Failed to reject payment. Please try again.',
      REFRESH_ERROR: 'Error refreshing data',
    },
  },
} as const

// Type definitions for better TypeScript support
export type ManualPaymentLabelKey = keyof typeof MANUAL_PAYMENT_LABELS
export type TableColumnKey = keyof typeof MANUAL_PAYMENT_LABELS.TABLE_COLUMNS
export type StatusOptionKey = keyof typeof MANUAL_PAYMENT_LABELS.STATUS_OPTIONS
export type ExpandedSectionKey = keyof typeof MANUAL_PAYMENT_LABELS.EXPANDED_SECTIONS
export type ExpandedFieldKey = keyof typeof MANUAL_PAYMENT_LABELS.EXPANDED_FIELDS
export type DocumentKey = keyof typeof MANUAL_PAYMENT_LABELS.DOCUMENTS
export type ActionMessageKey = keyof typeof MANUAL_PAYMENT_LABELS.ACTION_MESSAGES
export type PaymentTypeKey = keyof typeof MANUAL_PAYMENT_LABELS.PAYMENT_TYPES
export type PaymentMethodKey = keyof typeof MANUAL_PAYMENT_LABELS.PAYMENT_METHODS
export type AdditionalFormFieldKey = keyof typeof MANUAL_PAYMENT_LABELS.ADDITIONAL_FORM_FIELDS
export type LoadingLabelKey = keyof typeof MANUAL_PAYMENT_LABELS.LOADING_LABELS

// Helper function to get configId with fallback
export const getManualPaymentLabel = (
  category: ManualPaymentLabelKey,
  key: string,
  fallback?: string
): string => {
  const configId = (MANUAL_PAYMENT_LABELS[category] as any)?.[key]
  return configId || fallback || key
}

// Helper function to get fallback label
export const getManualPaymentFallback = (
  category: Exclude<ManualPaymentLabelKey, 'FALLBACKS' | 'PAYMENT_TYPES' | 'PAYMENT_METHODS' | 'YES_NO' | 'LOADING_LABELS' | 'ADDITIONAL_FORM_FIELDS'>,
  key: string
): string => {
  return (MANUAL_PAYMENT_LABELS.FALLBACKS[category] as any)?.[key] || key
}

// Helper function to get loading label
export const getManualPaymentLoadingLabel = (fieldName: string, originalLabel?: string): string => {
  const loadingLabels: Record<string, string> = {
    // Form field names (lowercase)
    developerName: MANUAL_PAYMENT_LABELS.LOADING_LABELS.DEVELOPER_NAME,
    projectName: MANUAL_PAYMENT_LABELS.LOADING_LABELS.PROJECT_NAME,
    paymentType: MANUAL_PAYMENT_LABELS.LOADING_LABELS.PAYMENT_TYPE,
    paymentSubType: MANUAL_PAYMENT_LABELS.LOADING_LABELS.PAYMENT_SUB_TYPE,
    invoiceCurrency: MANUAL_PAYMENT_LABELS.LOADING_LABELS.INVOICE_CURRENCY,
    paymentCurrency: MANUAL_PAYMENT_LABELS.LOADING_LABELS.PAYMENT_CURRENCY,
    depositMode: MANUAL_PAYMENT_LABELS.LOADING_LABELS.DEPOSIT_MODE,
    paymentMode: MANUAL_PAYMENT_LABELS.LOADING_LABELS.PAYMENT_MODE,
    transferType: MANUAL_PAYMENT_LABELS.LOADING_LABELS.TRANSFER_TYPE,
    buildAssetAccountStatus: MANUAL_PAYMENT_LABELS.LOADING_LABELS.BUILD_ASSET_ACCOUNT_STATUS,
    chargeMode: MANUAL_PAYMENT_LABELS.LOADING_LABELS.CHARGE_MODE,
    transactionType: MANUAL_PAYMENT_LABELS.LOADING_LABELS.TRANSACTION_TYPE,
    bankCharges: MANUAL_PAYMENT_LABELS.LOADING_LABELS.BANK_CHARGES,
    totalAmountPaid: MANUAL_PAYMENT_LABELS.LOADING_LABELS.TOTAL_AMOUNT_PAID,
    
    // API config ID names (uppercase)
    DEVELOPER_NAME: MANUAL_PAYMENT_LABELS.LOADING_LABELS.DEVELOPER_NAME,
    PROJECT_NAME: MANUAL_PAYMENT_LABELS.LOADING_LABELS.PROJECT_NAME,
    PAYMENT_TYPE: MANUAL_PAYMENT_LABELS.LOADING_LABELS.PAYMENT_TYPE,
    PAYMENT_SUB_TYPE: MANUAL_PAYMENT_LABELS.LOADING_LABELS.PAYMENT_SUB_TYPE,
    INVOICE_CURRENCY: MANUAL_PAYMENT_LABELS.LOADING_LABELS.INVOICE_CURRENCY,
    PAYMENT_CURRENCY: MANUAL_PAYMENT_LABELS.LOADING_LABELS.PAYMENT_CURRENCY,
    DEPOSIT_MODE: MANUAL_PAYMENT_LABELS.LOADING_LABELS.DEPOSIT_MODE,
    PAYMENT_MODE: MANUAL_PAYMENT_LABELS.LOADING_LABELS.PAYMENT_MODE,
    TRANSFER_TYPE: MANUAL_PAYMENT_LABELS.LOADING_LABELS.TRANSFER_TYPE,
    BUILD_ASSET_ACCOUNT_STATUS: MANUAL_PAYMENT_LABELS.LOADING_LABELS.BUILD_ASSET_ACCOUNT_STATUS,
    CHARGE_MODE: MANUAL_PAYMENT_LABELS.LOADING_LABELS.CHARGE_MODE,
    TRANSACTION_TYPE: MANUAL_PAYMENT_LABELS.LOADING_LABELS.TRANSACTION_TYPE,
    BANK_CHARGES: MANUAL_PAYMENT_LABELS.LOADING_LABELS.BANK_CHARGES,
    TOTAL_AMOUNT_PAID: MANUAL_PAYMENT_LABELS.LOADING_LABELS.TOTAL_AMOUNT_PAID,
  }

  return loadingLabels[fieldName] || (originalLabel ? `Loading ${originalLabel.replace(/\*/g, '').trim()}...` : 'Loading...')
}

// Helper function to clean label text (remove asterisks and trim)
export const cleanManualPaymentLabel = (label: string): string => {
  return label.replace(/\*/g, '').trim()
}
