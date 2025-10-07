// Pending Transaction label mapping from PENDING_FUND_INGRESS API response
// Maps configId to configValue for easy lookup and usage in components

export const PENDING_TRANSACTION_LABELS = {
  // Main Section
  CDL_PFI_TITLE: 'Pending Transactions',
  CDL_PFI_LIST: 'Unallocated / Pending Ingress',

  // Transaction Labels (used in the page)
  CDL_TRAN_REFNO: 'Tran Reference',
  CDL_TRAN_DESC: 'Tran Desc',
  CDL_TRAN_AMOUNT: 'Tran Amount',
  CDL_TRAN_DATE: 'Tran Date',
  CDL_TRAN_STATUS: 'Approval Status',
  CDL_TRAN_ACTION: 'Actions',

  // New API configIds for dynamic labels
  CDL_TRAN_RECEIVABLE_CATEGORY: 'Receivable Category',
  CDL_TRAN_NOTES: 'Narration',
  CDL_TRAN_TAS_STATUS: 'TAS Match',
  CDL_TRAN_MATCHING_STATUS: 'TAS/CBS Match',

  // Core Identifiers
  CDL_PFI_ID: 'Record ID',
  CDL_PFI_TX_ID: 'Transaction ID',
  CDL_PFI_REF_ID: 'Reference ID',
  CDL_PFI_UNIT_REF: 'Unit Reference Number',

  // Amounts & Currency
  CDL_PFI_AMOUNT: 'Amount',
  CDL_PFI_TOTAL_AMOUNT: 'Total Amount',
  CDL_PFI_RETENTION_AMOUNT: 'Retention Amount',
  CDL_PFI_CURRENCY: 'Currency',

  // Dates & Times
  CDL_PFI_TX_DATE: 'Transaction Date',
  CDL_PFI_VALUE_DATE: 'Value Date',
  CDL_PFI_POSTED_DATE: 'Posted Date',
  CDL_PFI_NORMAL_DATE: 'Normal Date',
  CDL_PFI_DISCARDED_DATE: 'Discarded Date',

  // Descriptions & Remarks
  CDL_PFI_NARRATION: 'Narration',
  CDL_PFI_DESCRIPTION: 'Description',
  CDL_PFI_PARTICULAR_1: 'Particulars 1',
  CDL_PFI_PARTICULAR_2: 'Particulars 2',
  CDL_PFI_REMARK_1: 'Remark 1',
  CDL_PFI_REMARK_2: 'Remark 2',

  // Branch & Banking
  CDL_PFI_BRANCH: 'Branch Code',
  CDL_PFI_POSTED_BRANCH: 'Posted Branch Code',
  CDL_PFI_CHECK_NO: 'Cheque Number',
  CDL_PFI_PRIMARY_HOLDER: 'Primary Unit Holder Name',

  // Status & Flags
  CDL_PFI_STATUS: 'Payment Status',
  CDL_PFI_ALLOCATED: 'Allocated',
  CDL_PFI_UNALLOCATED_CATEGORY: 'Unallocated Category',
  CDL_PFI_DISCARD: 'Discard',
  CDL_PFI_CREDITED_ESCROW: 'Credited To Escrow',
  CDL_PFI_TAS_UPDATED: 'TAS Updated',

  // Special Fields
  CDL_PFI_SPECIAL_1: 'Special Field 1',
  CDL_PFI_SPECIAL_2: 'Special Field 2',
  CDL_PFI_SPECIAL_3: 'Special Field 3',
  CDL_PFI_SPECIAL_4: 'Special Field 4',
  CDL_PFI_SPECIAL_5: 'Special Field 5',

  // Actions
  CDL_PFI_ACTIONS: 'Actions',
  CDL_PFI_ALLOCATE_ACTION: 'Allocate',
  CDL_PFI_DISCARD_ACTION: 'Discard',
}

// Utility function to get label by configId
export const getPendingTransactionLabel = (configId) => {
  return PENDING_TRANSACTION_LABELS[configId] || configId
}

// Utility function to get all labels for a specific category
export const getPendingTransactionLabelsByCategory = (category) => {
  const categories = {
    core: ['CDL_PFI_ID', 'CDL_PFI_TX_ID', 'CDL_PFI_REF_ID', 'CDL_PFI_UNIT_REF'],
    amounts: [
      'CDL_PFI_AMOUNT',
      'CDL_PFI_TOTAL_AMOUNT',
      'CDL_PFI_RETENTION_AMOUNT',
      'CDL_PFI_CURRENCY',
    ],
    dates: [
      'CDL_PFI_TX_DATE',
      'CDL_PFI_VALUE_DATE',
      'CDL_PFI_POSTED_DATE',
      'CDL_PFI_NORMAL_DATE',
      'CDL_PFI_DISCARDED_DATE',
    ],
    remarks: [
      'CDL_PFI_NARRATION',
      'CDL_PFI_DESCRIPTION',
      'CDL_PFI_PARTICULAR_1',
      'CDL_PFI_PARTICULAR_2',
      'CDL_PFI_REMARK_1',
      'CDL_PFI_REMARK_2',
    ],
    banking: [
      'CDL_PFI_BRANCH',
      'CDL_PFI_POSTED_BRANCH',
      'CDL_PFI_CHECK_NO',
      'CDL_PFI_PRIMARY_HOLDER',
    ],
    status: [
      'CDL_PFI_STATUS',
      'CDL_PFI_ALLOCATED',
      'CDL_PFI_UNALLOCATED_CATEGORY',
      'CDL_PFI_DISCARD',
      'CDL_PFI_CREDITED_ESCROW',
      'CDL_PFI_TAS_UPDATED',
    ],
    special: [
      'CDL_PFI_SPECIAL_1',
      'CDL_PFI_SPECIAL_2',
      'CDL_PFI_SPECIAL_3',
      'CDL_PFI_SPECIAL_4',
      'CDL_PFI_SPECIAL_5',
    ],
    actions: [
      'CDL_PFI_ACTIONS',
      'CDL_PFI_ALLOCATE_ACTION',
      'CDL_PFI_DISCARD_ACTION',
    ],
  }

  return (
    categories[category]?.map((configId) => ({
      configId,
      label: PENDING_TRANSACTION_LABELS[configId],
    })) || []
  )
}

// Export the full mapping object for direct access
export default PENDING_TRANSACTION_LABELS
