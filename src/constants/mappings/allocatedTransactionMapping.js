// Allocated Transaction label mapping from PROCESSED_FUND_INGRESS API response
// Maps configId to configValue for easy lookup and usage in components
// Based on the table labels: Date, Tran Id, Project Account (CIF), Developer Name, Project Name, Project Regulator ID, Unit No. Oqood Format, Action

export const ALLOCATED_TRANSACTION_LABELS = {
  // Main Section
  CDL_ATL_TITLE: 'Processed Transaction',
  CDL_ATL_LIST: 'Allocated / Processed Transactions',
  CDL_ATL_PROCESSED_TITLE: 'Processed Transaction',

  // Column Labels (using API configIds from transaction labels response)
  CDL_TRAN_DATE: 'Date',
  CDL_TRAN_REFNO: 'Tran Id',
  CDL_TRANS_BP_CIF: 'Project Account (CIF)',
  CDL_TRANS_BP_NAME: 'Developer Name',
  CDL_TRANS_BPA_NAME: 'Project Name',
  CDL_TRANS_BPA_REGULATOR: 'Project Regulator ID',
  CDL_TRANS_UNIT_HOLDER: 'Unit No. Oqood Format',
  CDL_TRAN_ACTION: 'Action',

  // Legacy Column Labels (for backward compatibility)
  CDL_ATL_DATE: 'Date',
  CDL_ATL_TRAN_ID: 'Tran Id',
  CDL_ATL_PROJECT_ACCOUNT_CIF: 'Project Account (CIF)',
  CDL_ATL_DEVELOPER_NAME: 'Developer Name',
  CDL_ATL_PROJECT_NAME: 'Project Name',
  CDL_ATL_PROJECT_REGULATOR_ID: 'Project Regulator ID',
  CDL_ATL_UNIT_NO_OQOOD_FORMAT: 'Unit No. Oqood Format',
  CDL_ATL_ACTION: 'Action',

  // Core Identifiers
  CDL_ATL_ID: 'Record ID',
  CDL_ATL_TX_ID: 'Transaction ID',
  CDL_ATL_REF_ID: 'Reference ID',
  CDL_ATL_UNIT_REF: 'Unit Reference Number',

  // New API configIds for dynamic labels
  CDL_TRAN_RECEIVABLE_CATEGORY: 'Receivable Category',
  CDL_TRAN_AMOUNT: 'Amount',
  CDL_TRAN_NOTES: 'Narration',
  CDL_TRAN_TAS_STATUS: 'TAS Match',
  CDL_TRAN_MATCHING_STATUS: 'TAS/CBS Match',

  // Amounts & Currency
  CDL_ATL_AMOUNT: 'Amount',
  CDL_ATL_TOTAL_AMOUNT: 'Total Amount',
  CDL_ATL_RETENTION_AMOUNT: 'Retention Amount',
  CDL_ATL_CURRENCY: 'Currency',

  // Dates & Times
  CDL_ATL_TX_DATE: 'Transaction Date',
  CDL_ATL_VALUE_DATE: 'Value Date',
  CDL_ATL_POSTED_DATE: 'Posted Date',
  CDL_ATL_NORMAL_DATE: 'Normal Date',
  CDL_ATL_PROCESSED_DATE: 'Processed Date',

  // Descriptions & Remarks
  CDL_ATL_NARRATION: 'Narration',
  CDL_ATL_DESCRIPTION: 'Description',
  CDL_ATL_PARTICULAR_1: 'Particulars 1',
  CDL_ATL_PARTICULAR_2: 'Particulars 2',
  CDL_ATL_REMARK_1: 'Remark 1',
  CDL_ATL_REMARK_2: 'Remark 2',

  // Branch & Banking
  CDL_ATL_BRANCH: 'Branch Code',
  CDL_ATL_POSTED_BRANCH: 'Posted Branch Code',
  CDL_ATL_CHECK_NO: 'Cheque Number',
  CDL_ATL_PRIMARY_HOLDER: 'Primary Unit Holder Name',

  // Status & Flags
  CDL_ATL_STATUS: 'Payment Status',
  CDL_ATL_ALLOCATED: 'Allocated',
  CDL_ATL_PROCESSED: 'Processed',
  CDL_ATL_CREDITED_ESCROW: 'Credited To Escrow',
  CDL_ATL_TAS_UPDATED: 'TAS Updated',

  // Special Fields
  CDL_ATL_SPECIAL_1: 'Special Field 1',
  CDL_ATL_SPECIAL_2: 'Special Field 2',
  CDL_ATL_SPECIAL_3: 'Special Field 3',
  CDL_ATL_SPECIAL_4: 'Special Field 4',
  CDL_ATL_SPECIAL_5: 'Special Field 5',

  // Actions
  CDL_ATL_ACTIONS: 'Actions',
  CDL_ATL_VIEW_ACTION: 'View',
  CDL_ATL_EDIT_ACTION: 'Edit',
  CDL_ATL_DELETE_ACTION: 'Delete',
  CDL_ATL_DOWNLOAD_ACTION: 'Download',
  CDL_ATL_EXPORT_ACTION: 'Export',
  CDL_ATL_DEALLOCATE_ACTION: 'Deallocate',

  // Filter & Search Labels
  CDL_ATL_FILTER_BY_DATE: 'Filter by Date',
  CDL_ATL_FILTER_BY_AMOUNT: 'Filter by Amount',
  CDL_ATL_FILTER_BY_STATUS: 'Filter by Status',
  CDL_ATL_FILTER_BY_PROJECT: 'Filter by Project',
  CDL_ATL_FILTER_BY_DEVELOPER: 'Filter by Developer',
  CDL_ATL_SEARCH_PLACEHOLDER: 'Search transactions...',

  // Buttons & Controls (using API configIds)
  CDL_TRAN_TEMPLATE_DOWNLOAD: 'Download Template', // From API
  CDL_TRAN_UPLOAD: 'Upload', // From API

  // Legacy Buttons & Controls
  CDL_ATL_DOWNLOAD_TEMPLATE: 'Download Template',
  CDL_ATL_UPLOAD: 'Upload',
  CDL_ATL_EXPORT_ALL: 'Export All',
  CDL_ATL_SELECT_ALL: 'Select All',
  CDL_ATL_BULK_ACTIONS: 'Bulk Actions',

  // Status Values
  CDL_ATL_STATUS_PROCESSED: 'Processed',
  CDL_ATL_STATUS_ALLOCATED: 'Allocated',
  CDL_ATL_STATUS_COMPLETED: 'Completed',
  CDL_ATL_STATUS_ACTIVE: 'Active',

  // Expandable Content Labels
  CDL_ATL_EXPAND_TRANSACTION_INFO: 'Transaction Information',
  CDL_ATL_EXPAND_PROJECT_INFO: 'Project Information',
  CDL_ATL_EXPAND_BANKING_INFO: 'Banking Information',
  CDL_ATL_EXPAND_ACTIONS: 'Transaction Actions',
}

// Utility function to get label by configId
export const getAllocatedTransactionLabel = (configId) => {
  return ALLOCATED_TRANSACTION_LABELS[configId] || configId
}

// Utility function to get all labels for a specific category
export const getAllocatedTransactionLabelsByCategory = (category) => {
  const categories = {
    // Main table columns
    columns: [
      'CDL_ATL_DATE',
      'CDL_ATL_TRAN_ID',
      'CDL_ATL_PROJECT_ACCOUNT_CIF',
      'CDL_ATL_DEVELOPER_NAME',
      'CDL_ATL_PROJECT_NAME',
      'CDL_ATL_PROJECT_REGULATOR_ID',
      'CDL_ATL_UNIT_NO_OQOOD_FORMAT',
      'CDL_ATL_ACTION',
    ],
    // Core identifiers
    core: ['CDL_ATL_ID', 'CDL_ATL_TX_ID', 'CDL_ATL_REF_ID', 'CDL_ATL_UNIT_REF'],
    // Amounts and currency
    amounts: [
      'CDL_ATL_AMOUNT',
      'CDL_ATL_TOTAL_AMOUNT',
      'CDL_ATL_RETENTION_AMOUNT',
      'CDL_ATL_CURRENCY',
    ],
    // Dates and times
    dates: [
      'CDL_ATL_TX_DATE',
      'CDL_ATL_VALUE_DATE',
      'CDL_ATL_POSTED_DATE',
      'CDL_ATL_NORMAL_DATE',
      'CDL_ATL_PROCESSED_DATE',
    ],
    // Remarks and descriptions
    remarks: [
      'CDL_ATL_NARRATION',
      'CDL_ATL_DESCRIPTION',
      'CDL_ATL_PARTICULAR_1',
      'CDL_ATL_PARTICULAR_2',
      'CDL_ATL_REMARK_1',
      'CDL_ATL_REMARK_2',
    ],
    // Banking information
    banking: [
      'CDL_ATL_BRANCH',
      'CDL_ATL_POSTED_BRANCH',
      'CDL_ATL_CHECK_NO',
      'CDL_ATL_PRIMARY_HOLDER',
    ],
    // Status and flags
    status: [
      'CDL_ATL_STATUS',
      'CDL_ATL_ALLOCATED',
      'CDL_ATL_PROCESSED',
      'CDL_ATL_CREDITED_ESCROW',
      'CDL_ATL_TAS_UPDATED',
    ],
    // Special fields
    special: [
      'CDL_ATL_SPECIAL_1',
      'CDL_ATL_SPECIAL_2',
      'CDL_ATL_SPECIAL_3',
      'CDL_ATL_SPECIAL_4',
      'CDL_ATL_SPECIAL_5',
    ],
    // Actions
    actions: [
      'CDL_ATL_ACTIONS',
      'CDL_ATL_VIEW_ACTION',
      'CDL_ATL_EDIT_ACTION',
      'CDL_ATL_DELETE_ACTION',
      'CDL_ATL_DOWNLOAD_ACTION',
      'CDL_ATL_EXPORT_ACTION',
      'CDL_ATL_DEALLOCATE_ACTION',
    ],
    // Filters and controls
    filters: [
      'CDL_ATL_FILTER_BY_DATE',
      'CDL_ATL_FILTER_BY_AMOUNT',
      'CDL_ATL_FILTER_BY_STATUS',
      'CDL_ATL_FILTER_BY_PROJECT',
      'CDL_ATL_FILTER_BY_DEVELOPER',
      'CDL_ATL_SEARCH_PLACEHOLDER',
    ],
    // Buttons and controls
    controls: [
      'CDL_ATL_DOWNLOAD_TEMPLATE',
      'CDL_ATL_UPLOAD',
      'CDL_ATL_EXPORT_ALL',
      'CDL_ATL_SELECT_ALL',
      'CDL_ATL_BULK_ACTIONS',
    ],
  }

  return (
    categories[category]?.map((configId) => ({
      configId,
      label: ALLOCATED_TRANSACTION_LABELS[configId],
    })) || []
  )
}

// Function to get table column configuration for the allocated transaction table
export const getAllocatedTransactionTableColumns = () => {
  return [
    {
      configId: 'CDL_TRAN_DATE',
      key: 'date',
      label: getAllocatedTransactionLabel('CDL_TRAN_DATE'),
      type: 'text',
      width: 'w-40',
      sortable: true,
    },
    {
      configId: 'CDL_TRAN_REFNO',
      key: 'transId',
      label: getAllocatedTransactionLabel('CDL_TRAN_REFNO'),
      type: 'text',
      width: 'w-40',
      sortable: true,
    },
    {
      configId: 'CDL_TRANS_BP_CIF',
      key: 'projectAccountId',
      label: getAllocatedTransactionLabel('CDL_TRANS_BP_CIF'),
      type: 'text',
      width: 'w-48',
      sortable: true,
    },
    {
      configId: 'CDL_TRANS_BP_NAME',
      key: 'developerName',
      label: getAllocatedTransactionLabel('CDL_TRANS_BP_NAME'),
      type: 'text',
      width: 'w-48',
      sortable: true,
    },
    {
      configId: 'CDL_TRANS_BPA_NAME',
      key: 'projectName',
      label: getAllocatedTransactionLabel('CDL_TRANS_BPA_NAME'),
      type: 'text',
      width: 'w-48',
      sortable: true,
    },
    {
      configId: 'CDL_TRANS_BPA_REGULATOR',
      key: 'projectRegulatorId',
      label: getAllocatedTransactionLabel('CDL_TRANS_BPA_REGULATOR'),
      type: 'text',
      width: 'w-40',
      sortable: true,
    },
    {
      configId: 'CDL_TRANS_UNIT_HOLDER',
      key: 'unitNo',
      label: getAllocatedTransactionLabel('CDL_TRANS_UNIT_HOLDER'),
      type: 'text',
      width: 'w-40',
      sortable: true,
    },
    {
      configId: 'CDL_TRAN_ACTION',
      key: 'actions',
      label: getAllocatedTransactionLabel('CDL_TRAN_ACTION'),
      type: 'actions',
      width: 'w-20',
    },
  ]
}

// Export the full mapping object for direct access
export default ALLOCATED_TRANSACTION_LABELS
