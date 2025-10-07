// Fee Repush label mapping from REAL_ESTATE_ASSET_FEE_HISTORY API response
// Maps configId to configValue for easy lookup and usage in components
// Based on the table labels: Project Name, Fee Type, Amount, Transaction Date, Approval Status, Payment Type, Actions

export const FEE_REPUSH_LABELS = {
  // Main Section
  CDL_FRP_TITLE: 'Fee Repush',
  CDL_FRP_LIST: 'Fee Repush / Failed Transactions',
  CDL_FRP_FAILED_TITLE: 'Failed Fee Transactions',

  // Column Labels - Core Table Fields
  CDL_FRP_PROJECT_NAME: 'Project Name',
  CDL_FRP_FEE_TYPE: 'Fee Type',
  CDL_FRP_AMOUNT: 'Amount',
  CDL_FRP_TRANSACTION_DATE: 'Transaction Date',
  CDL_FRP_APPROVAL_STATUS: 'Approval Status..',
  CDL_FRP_PAYMENT_TYPE: 'Payment Type',
  CDL_FRP_ACTION: 'Actions',

  // Additional Core Fields
  CDL_FRP_ID: 'Record ID',
  CDL_FRP_HISTORY_ID: 'Fee History ID',
  CDL_FRP_PAYMENT_REF_NO: 'Payment Reference No',
  CDL_FRP_TAS_REF_NO: 'TAS Reference No',
  CDL_FRP_CURRENCY: 'Currency',
  CDL_FRP_TOTAL_AMOUNT: 'Total Amount',

  // Descriptions & Remarks
  CDL_FRP_NARRATION: 'Narration',
  CDL_FRP_DESCRIPTION: 'Description',
  CDL_FRP_REMARK: 'Remark',
  CDL_FRP_FAILURE_REASON: 'Failure Reason',

  // Tracking Fields
  CDL_FRP_RETRY_COUNT: 'Retry Count',
  CDL_FRP_CREATED_DATE: 'Created Date',
  CDL_FRP_UPDATED_DATE: 'Updated Date',
  CDL_FRP_CREATED_BY: 'Created By',
  CDL_FRP_UPDATED_BY: 'Updated By',
  CDL_FRP_IS_ACTIVE: 'Active Status',

  // Special Fields
  CDL_FRP_SPECIAL_FIELD_1: 'Special Field 1',
  CDL_FRP_SPECIAL_FIELD_2: 'Special Field 2',

  // Actions
  CDL_FRP_ACTIONS: 'Actions',
  CDL_FRP_VIEW_ACTION: 'View',
  CDL_FRP_EDIT_ACTION: 'Edit',
  CDL_FRP_DELETE_ACTION: 'Delete',
  CDL_FRP_RETRY_ACTION: 'Retry Payment',
  CDL_FRP_DOWNLOAD_ACTION: 'Download',
  CDL_FRP_EXPORT_ACTION: 'Export',
  CDL_FRP_VIEW_DETAILS_ACTION: 'View Details',
  CDL_FRP_VIEW_ERROR_DETAILS_ACTION: 'View Error Details',

  // Filter & Search Labels
  CDL_FRP_FILTER_BY_PROJECT: 'Filter by Project',
  CDL_FRP_FILTER_BY_FEE_TYPE: 'Filter by Fee Type',
  CDL_FRP_FILTER_BY_STATUS: 'Filter by Status',
  CDL_FRP_FILTER_BY_DATE: 'Filter by Date',
  CDL_FRP_FILTER_BY_AMOUNT: 'Filter by Amount',
  CDL_FRP_FILTER_BY_PAYMENT_TYPE: 'Filter by Payment Type',
  CDL_FRP_SEARCH_PLACEHOLDER: 'Search fee transactions...',

  // Buttons & Controls
  CDL_FRP_ADD_NEW: 'Add New',
  CDL_FRP_DOWNLOAD_TEMPLATE: 'Download Template',
  CDL_FRP_UPLOAD: 'Upload',
  CDL_FRP_EXPORT_ALL: 'Export All',
  CDL_FRP_SELECT_ALL: 'Select All',
  CDL_FRP_BULK_ACTIONS: 'Bulk Actions',
  CDL_FRP_BULK_RETRY: 'Bulk Retry',
  CDL_FRP_BULK_DELETE: 'Bulk Delete',

  // Status Values
  CDL_FRP_STATUS_FAILED: 'Failed',
  CDL_FRP_STATUS_PENDING: 'Pending',
  CDL_FRP_STATUS_APPROVED: 'Approved',
  CDL_FRP_STATUS_REJECTED: 'Rejected',
  CDL_FRP_STATUS_PROCESSING: 'Processing',
  CDL_FRP_STATUS_COMPLETED: 'Completed',
  CDL_FRP_STATUS_CANCELLED: 'Cancelled',

  // Payment Types
  CDL_FRP_PAYMENT_CREDIT_CARD: 'Credit Card',
  CDL_FRP_PAYMENT_BANK_TRANSFER: 'Bank Transfer',
  CDL_FRP_PAYMENT_CASH: 'Cash',
  CDL_FRP_PAYMENT_CHEQUE: 'Cheque',
  CDL_FRP_PAYMENT_ONLINE: 'Online Payment',

  // Fee Types (Common ones based on real data)
  CDL_FRP_FEE_ACCOUNT_MAINTENANCE: 'Account Maintenance Charges',
  CDL_FRP_FEE_ACCOUNT_OPENING: 'Account Opening Fee',
  CDL_FRP_FEE_UNIT_REGISTRATION: 'Unit Registration Fee',
  CDL_FRP_FEE_UNIT_MODIFICATION: 'Unit Modification Charges',
  CDL_FRP_FEE_PROCESSING: 'Processing Fee',
  CDL_FRP_FEE_LATE_PAYMENT: 'Late Payment Fee',
  CDL_FRP_FEE_ADMINISTRATION: 'Administration Fee',

  // Expandable Content Labels
  CDL_FRP_EXPAND_FEE_INFO: 'Fee Information',
  CDL_FRP_EXPAND_PAYMENT_INFO: 'Payment Information',
  CDL_FRP_EXPAND_ERROR_INFO: 'Error Information',
  CDL_FRP_EXPAND_TRACKING_INFO: 'Tracking Information',
  CDL_FRP_EXPAND_FEE_DETAILS_ACTIONS: 'Fee Details & Actions',

  // Dialog/Modal Labels
  CDL_FRP_RETRY_DIALOG_TITLE: 'Retry Fee Payment',
  CDL_FRP_RETRY_DIALOG_MESSAGE:
    'Are you sure you want to retry this fee payment?',
  CDL_FRP_DELETE_DIALOG_TITLE: 'Delete Fee Record',
  CDL_FRP_DELETE_DIALOG_MESSAGE:
    'Are you sure you want to delete this fee record? This action cannot be undone.',
  CDL_FRP_VIEW_DETAILS_DIALOG_TITLE: 'Fee Transaction Details',
  CDL_FRP_ERROR_DETAILS_DIALOG_TITLE: 'Error Details',

  // Error Messages
  CDL_FRP_ERROR_LOADING: 'Error loading fee repush data',
  CDL_FRP_ERROR_SAVING: 'Error saving fee record',
  CDL_FRP_ERROR_DELETING: 'Error deleting fee record',
  CDL_FRP_ERROR_RETRYING: 'Error retrying fee payment',
  CDL_FRP_ERROR_NETWORK: 'Network error. Please check your connection.',

  // Success Messages
  CDL_FRP_SUCCESS_SAVED: 'Fee record saved successfully',
  CDL_FRP_SUCCESS_UPDATED: 'Fee record updated successfully',
  CDL_FRP_SUCCESS_DELETED: 'Fee record deleted successfully',
  CDL_FRP_SUCCESS_RETRY_INITIATED: 'Fee payment retry initiated successfully',

  // Loading States
  CDL_FRP_LOADING_DATA: 'Loading fee repush data...',
  CDL_FRP_LOADING_DETAILS: 'Loading fee details...',
  CDL_FRP_PROCESSING_RETRY: 'Processing retry request...',
  CDL_FRP_PROCESSING_DELETE: 'Processing deletion...',

  // Empty States
  CDL_FRP_NO_DATA: 'No fee repush records found',
  CDL_FRP_NO_FAILED_FEES: 'No failed fee transactions found',
  CDL_FRP_NO_SEARCH_RESULTS: 'No records match your search criteria',

  // Validation Messages
  CDL_FRP_VALIDATION_REQUIRED_PROJECT: 'Project name is required',
  CDL_FRP_VALIDATION_REQUIRED_FEE_TYPE: 'Fee type is required',
  CDL_FRP_VALIDATION_REQUIRED_AMOUNT: 'Amount is required',
  CDL_FRP_VALIDATION_INVALID_AMOUNT: 'Please enter a valid amount',
  CDL_FRP_VALIDATION_REQUIRED_DATE: 'Transaction date is required',
  CDL_FRP_VALIDATION_INVALID_DATE: 'Please enter a valid date',
}

// Utility function to get label by configId
export const getFeeRepushLabel = (configId: string): string => {
  return (
    FEE_REPUSH_LABELS[configId as keyof typeof FEE_REPUSH_LABELS] || configId
  )
}

// Utility function to get all labels for a specific category
export const getFeeRepushLabelsByCategory = (category: string) => {
  const categories = {
    // Main table columns
    columns: [
      'CDL_FRP_PROJECT_NAME',
      'CDL_FRP_FEE_TYPE',
      'CDL_FRP_AMOUNT',
      'CDL_FRP_TRANSACTION_DATE',
      'CDL_FRP_APPROVAL_STATUS',
      'CDL_FRP_PAYMENT_TYPE',
      'CDL_FRP_ACTION',
    ],
    // Core identifiers
    core: [
      'CDL_FRP_ID',
      'CDL_FRP_HISTORY_ID',
      'CDL_FRP_PAYMENT_REF_NO',
      'CDL_FRP_TAS_REF_NO',
    ],
    // Amounts and currency
    amounts: ['CDL_FRP_AMOUNT', 'CDL_FRP_TOTAL_AMOUNT', 'CDL_FRP_CURRENCY'],
    // Descriptions and remarks
    remarks: [
      'CDL_FRP_NARRATION',
      'CDL_FRP_DESCRIPTION',
      'CDL_FRP_REMARK',
      'CDL_FRP_FAILURE_REASON',
    ],
    // Tracking information
    tracking: [
      'CDL_FRP_RETRY_COUNT',
      'CDL_FRP_CREATED_DATE',
      'CDL_FRP_UPDATED_DATE',
      'CDL_FRP_CREATED_BY',
      'CDL_FRP_UPDATED_BY',
      'CDL_FRP_IS_ACTIVE',
    ],
    // Special fields
    special: ['CDL_FRP_SPECIAL_FIELD_1', 'CDL_FRP_SPECIAL_FIELD_2'],
    // Actions
    actions: [
      'CDL_FRP_ACTIONS',
      'CDL_FRP_VIEW_ACTION',
      'CDL_FRP_EDIT_ACTION',
      'CDL_FRP_DELETE_ACTION',
      'CDL_FRP_RETRY_ACTION',
      'CDL_FRP_DOWNLOAD_ACTION',
      'CDL_FRP_EXPORT_ACTION',
      'CDL_FRP_VIEW_DETAILS_ACTION',
      'CDL_FRP_VIEW_ERROR_DETAILS_ACTION',
    ],
    // Filters and search
    filters: [
      'CDL_FRP_FILTER_BY_PROJECT',
      'CDL_FRP_FILTER_BY_FEE_TYPE',
      'CDL_FRP_FILTER_BY_STATUS',
      'CDL_FRP_FILTER_BY_DATE',
      'CDL_FRP_FILTER_BY_AMOUNT',
      'CDL_FRP_FILTER_BY_PAYMENT_TYPE',
      'CDL_FRP_SEARCH_PLACEHOLDER',
    ],
    // Controls and buttons
    controls: [
      'CDL_FRP_ADD_NEW',
      'CDL_FRP_DOWNLOAD_TEMPLATE',
      'CDL_FRP_UPLOAD',
      'CDL_FRP_EXPORT_ALL',
      'CDL_FRP_SELECT_ALL',
      'CDL_FRP_BULK_ACTIONS',
      'CDL_FRP_BULK_RETRY',
      'CDL_FRP_BULK_DELETE',
    ],
    // Status values
    status: [
      'CDL_FRP_STATUS_FAILED',
      'CDL_FRP_STATUS_PENDING',
      'CDL_FRP_STATUS_APPROVED',
      'CDL_FRP_STATUS_REJECTED',
      'CDL_FRP_STATUS_PROCESSING',
      'CDL_FRP_STATUS_COMPLETED',
      'CDL_FRP_STATUS_CANCELLED',
    ],
    // Payment types
    paymentTypes: [
      'CDL_FRP_PAYMENT_CREDIT_CARD',
      'CDL_FRP_PAYMENT_BANK_TRANSFER',
      'CDL_FRP_PAYMENT_CASH',
      'CDL_FRP_PAYMENT_CHEQUE',
      'CDL_FRP_PAYMENT_ONLINE',
    ],
    // Fee types
    feeTypes: [
      'CDL_FRP_FEE_ACCOUNT_MAINTENANCE',
      'CDL_FRP_FEE_ACCOUNT_OPENING',
      'CDL_FRP_FEE_UNIT_REGISTRATION',
      'CDL_FRP_FEE_UNIT_MODIFICATION',
      'CDL_FRP_FEE_PROCESSING',
      'CDL_FRP_FEE_LATE_PAYMENT',
      'CDL_FRP_FEE_ADMINISTRATION',
    ],
  }

  return (
    categories[category as keyof typeof categories]?.map((configId) => ({
      configId,
      label: FEE_REPUSH_LABELS[configId as keyof typeof FEE_REPUSH_LABELS],
    })) || []
  )
}

// Function to get table column configuration for the fee repush table
export const getFeeRepushTableColumns = () => {
  return [
    {
      configId: 'CDL_FRP_PROJECT_NAME',
      key: 'projectName',
      label: getFeeRepushLabel('CDL_FRP_PROJECT_NAME'),
      type: 'text',
      width: 'w-48',
      sortable: true,
    },
    {
      configId: 'CDL_FRP_FEE_TYPE',
      key: 'feeType',
      label: getFeeRepushLabel('CDL_FRP_FEE_TYPE'),
      type: 'text',
      width: 'w-48',
      sortable: true,
    },
    {
      configId: 'CDL_FRP_AMOUNT',
      key: 'amount',
      label: getFeeRepushLabel('CDL_FRP_AMOUNT'),
      type: 'text',
      width: 'w-32',
      sortable: true,
    },
    {
      configId: 'CDL_FRP_TRANSACTION_DATE',
      key: 'transactionDate',
      label: getFeeRepushLabel('CDL_FRP_TRANSACTION_DATE'),
      type: 'text',
      width: 'w-40',
      sortable: true,
    },
    {
      configId: 'CDL_FRP_APPROVAL_STATUS',
      key: 'approvalStatus',
      label: getFeeRepushLabel('CDL_FRP_APPROVAL_STATUS'),
      type: 'status',
      width: 'w-40',
      sortable: true,
    },
    {
      configId: 'CDL_FRP_PAYMENT_TYPE',
      key: 'paymentType',
      label: getFeeRepushLabel('CDL_FRP_PAYMENT_TYPE'),
      type: 'text',
      width: 'w-40',
      sortable: true,
    },
    {
      configId: 'CDL_FRP_ACTION',
      key: 'actions',
      label: getFeeRepushLabel('CDL_FRP_ACTION'),
      type: 'actions',
      width: 'w-20',
    },
  ]
}

// Export the full mapping object for direct access
export default FEE_REPUSH_LABELS
