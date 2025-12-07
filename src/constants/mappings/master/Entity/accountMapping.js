
export const ACCOUNTLABEL = {
// Account Details
'CDL_ACCOUNT_DETAILS': 'Account Details', // text field
  'CDL_ESCROW_ACCOUNT_ID': '  Account ID', // Auto fetch
  'CDL_ESCROW_ACCOUNT_REF_NO': ' Account Ref No', // Auto
  'CDL_ESCROW_ACCOUNT_TYPE': ' Account Type', // Drop Down
  'CDL_ESCROW_ACCOUNT_NO': ' Account No', // Text Field
  'CDL_ESCROW_PRODUCT_CODE': ' Product Code', // Text Field
  'CDL_ESCROW_ACCOUNT_PURPOSE': ' Account Purpose', // Text Field
  'CDL_ESCROW_ACCOUNT_TAX_PAYMENT': '  Tax Payment', // Drop Down
  'CDL_ESCROW_ACCOUNT_NAME': ' Account Name', // Text Field
  'CDL_ESCROW_ACCOUNT_PRIMARY_ACCOUNT': ' Primary Account', // Drop Down
  'CDL_ESCROW_ACCOUNT_IBAN_NUMBER': ' Account IBAN No', // Text Field
  'CDL_ESCROW_ACCOUNT_CURRENCY': ' Currency', // Text Field
  'CDL_ESCROW_ACCOUNT_TITLE': ' Account Title', // Text Field 
  'CDL_ESCROW_ACCOUNT_VIRTUAL_ACCOUNT': ' Virtual Account', // Text Field
  'CDL_ESCROW_ACCOUNT_OFFICIAL_ACCOUNT_TITLE': 'Official Account Title',
  'CDL_ESCROW_ACCOUNT_TYPE': ' Account Type Code', // Text Field
  'CDL_ESCROW_ACCOUNT_ASSIGNED': '  Assigned To Reference', // Text Field
  'CDL_ESCROW_ACCOUNT_OPENING_DATE': ' Account Opening Date', // Calendar
  'CDL_ESCROW_ACCOUNT_BULK_UPLOAD_PROCESSING': ' Bulk Upload Processing', // Drop Down
  'CDL_ESCROW_ACCOUNT_UNITARY_PAYMENT': ' Unitary Payment', // Drop Down
  'CDL_ESCROW_ACCOUNT_LOOKUP_FIELD_1': 'Reference Field 1', // Text Field
  'CDL_ESCROW_ACCOUNT_LOOKUP_FIELD_2': ' Reference Field 2', // Text Field
  'CDL_ESCROW_ACCOUNT_DISPLAY_NAME': ' Account Display Name', // Text Field
  'CDL_ESCROW_ACCOUNT_ASSIGNMENT_STATUS': ' Assignment Status', // Text Field

  // Common UI labels
  'CDL_COMMON_ACTION': 'Action',
  'CDL_COMMON_ACTIONS': 'Actions',
  'CDL_COMMON_RETRY': 'Retry',
  'CDL_COMMON_CANCEL': 'Cancel',
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
  'Documents (Optional)': 'CDL_DOCUMENT',  //stepper label

  }
    export const getAccountLabel = (configId) => {
    return ACCOUNTLABEL[configId] || configId
    }
    

    
    export const getLabelByConfigId = (configId) => {
      return ACCOUNTLABEL[configId] || configId
    }
    
    // Export the full mapping object for direct access
    export default ACCOUNTLABEL
    


