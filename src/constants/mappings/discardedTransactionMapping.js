/**
 * Discarded Transaction Label Mappings
 * Maps configuration IDs to display labels for discarded transactions
 */

export const discardedTransactionLabelMapping = {
  CDL_TRAN_RECEIVABLE_CATEGORY: 'Receivable Category',
  CDL_TRAN_AMOUNT: 'Amount',
  CDL_TRAN_NOTES: 'Narration',
  CDL_TRAN_TAS_STATUS: 'TAS Match',
  CDL_TRAN_MATCHING_STATUS: 'TAS/CBS Match',

  // Transaction Details
  CDL_TRAN_REFNO: 'Transaction Reference',
  CDL_TRAN_DESC: 'Transaction Description',
  CDL_TRAN_DATE: 'Transaction Date',
  CDL_TRAN_STATUS: 'Transaction Status',
  CDL_TRAN_ACTION: 'Actions',

  // Project Information
  CDL_PROJECT_NAME: 'Project Name',
  CDL_PROJECT_REGULATOR_ID: 'Project Regulator ID',
  CDL_DEVELOPER_NAME: 'Developer Name',

  // Transaction Specific
  CDL_TRAN_CURRENCY: 'Currency',
  CDL_TRAN_TOTAL_AMOUNT: 'Total Amount',
  CDL_TRAN_NARRATION: 'Narration',
  CDL_TRAN_ALLOCATED: 'Allocated',
  CDL_TRAN_DISCARDED: 'Discarded',

  // Payment Status
  CDL_PAYMENT_STATUS: 'Payment Status',
  CDL_PAYMENT_PENDING: 'Pending',
  CDL_PAYMENT_APPROVED: 'Approved',
  CDL_PAYMENT_REJECTED: 'Rejected',
  CDL_PAYMENT_IN_REVIEW: 'In Review',

  // Actions
  CDL_ACTION_VIEW: 'View',
  CDL_ACTION_EDIT: 'Edit',
  CDL_ACTION_DELETE: 'Delete',
  CDL_ACTION_DOWNLOAD: 'Download',
  CDL_ACTION_EXPORT: 'Export',
  CDL_ACTION_REALLOCATE: 'Reallocate',
  CDL_ACTION_RESTORE: 'Restore',

  // Status Labels
  CDL_STATUS_ACTIVE: 'Active',
  CDL_STATUS_INACTIVE: 'Inactive',
  CDL_STATUS_DISCARDED: 'Discarded',
  CDL_STATUS_ALLOCATED: 'Allocated',
  CDL_STATUS_UNALLOCATED: 'Unallocated',

  // Form Labels
  CDL_FORM_SEARCH: 'Search',
  CDL_FORM_FILTER: 'Filter',
  CDL_FORM_SORT: 'Sort',
  CDL_FORM_EXPORT: 'Export',
  CDL_FORM_IMPORT: 'Import',

  // Button Labels
  CDL_BTN_SAVE: 'Save',
  CDL_BTN_CANCEL: 'Cancel',
  CDL_BTN_SUBMIT: 'Submit',
  CDL_BTN_RESET: 'Reset',
  CDL_BTN_CLOSE: 'Close',
  CDL_BTN_APPLY: 'Apply',
  CDL_BTN_CLEAR: 'Clear',

  // Table Headers
  CDL_TABLE_SERIAL: 'S.No',
  CDL_TABLE_ACTIONS: 'Actions',
  CDL_TABLE_STATUS: 'Status',
  CDL_TABLE_CREATED_DATE: 'Created Date',
  CDL_TABLE_MODIFIED_DATE: 'Modified Date',

  // Messages
  CDL_MSG_NO_DATA: 'No data available',
  CDL_MSG_LOADING: 'Loading...',
  CDL_MSG_ERROR: 'An error occurred',
  CDL_MSG_SUCCESS: 'Operation completed successfully',
  CDL_MSG_CONFIRM_DELETE: 'Are you sure you want to delete this item?',
  CDL_MSG_CONFIRM_RESTORE: 'Are you sure you want to restore this transaction?',

  // Navigation
  CDL_NAV_DASHBOARD: 'Dashboard',
  CDL_NAV_TRANSACTIONS: 'Transactions',
  CDL_NAV_DISCARDED: 'Discarded Transactions',
  CDL_NAV_ALLOCATED: 'Allocated Transactions',
  CDL_NAV_UNALLOCATED: 'Unallocated Transactions',

  // Pagination
  CDL_PAGINATION_FIRST: 'First',
  CDL_PAGINATION_LAST: 'Last',
  CDL_PAGINATION_NEXT: 'Next',
  CDL_PAGINATION_PREVIOUS: 'Previous',
  CDL_PAGINATION_SHOWING: 'Showing',
  CDL_PAGINATION_OF: 'of',
  CDL_PAGINATION_ENTRIES: 'entries',

  // Time/Date
  CDL_DATE_FORMAT: 'DD-MM-YYYY HH:mm:ss',
  CDL_TIME_FORMAT: 'HH:mm:ss',
  CDL_DATE_TODAY: 'Today',
  CDL_DATE_YESTERDAY: 'Yesterday',

  // File Operations
  CDL_FILE_UPLOAD: 'Upload File',
  CDL_FILE_DOWNLOAD: 'Download File',
  CDL_FILE_TEMPLATE: 'Download Template',
  CDL_FILE_EXPORT_CSV: 'Export to CSV',
  CDL_FILE_EXPORT_EXCEL: 'Export to Excel',
  CDL_FILE_EXPORT_PDF: 'Export to PDF',
}

/**
 * Get discarded transaction label by configuration ID
 * @param {string} configId - The configuration ID to look up
 * @returns {string} The corresponding label or the configId if not found
 */
export const getDiscardedTransactionLabel = (configId) => {
  return discardedTransactionLabelMapping[configId] || configId
}

/**
 * Get all discarded transaction labels
 * @returns {Object} All label mappings
 */
export const getAllDiscardedTransactionLabels = () => {
  return discardedTransactionLabelMapping
}

/**
 * Check if a configuration ID exists in the mapping
 * @param {string} configId - The configuration ID to check
 * @returns {boolean} True if the configId exists in the mapping
 */
export const hasDiscardedTransactionLabel = (configId) => {
  return configId in discardedTransactionLabelMapping
}

export default discardedTransactionLabelMapping
