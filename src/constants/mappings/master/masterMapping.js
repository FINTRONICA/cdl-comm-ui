export const MASTER_LABELS = {
  // Account Purpose Details
  'CDL_MAP_ID': 'Account Purpose ID', // Auto Generated
  'CDL_MAP_CODE': 'Account Purpose Code', // text field
  'CDL_MAP_NAME': 'Account Purpose Name', // text field
  'CDL_MAP_DESCRIPTION': 'Account Purpose Description', // text field
  'CDL_MAP_CRITICALITY': 'Account Purpose Criticality', // dropdown
  'CDL_MAP_STATUS': 'Status', // 
  'CDL_MAP_ACTIVE': 'Active', //


  // Investment Details
  'CDL_MI_ID': 'Investment ID', // Auto Generated
  'CDL_MI_NAME': 'Investment Full Name', // text field
  'CDL_MI_DESCRIPTION': 'Investment Description', // text field
  'CDL_MI_STATUS': ' Status', // 

  // Business Segment Details
  'CDL_MBS_ID': 'Business Segment ID', // Auto Generated
  'CDL_MBS_NAME': 'Business Segment Name', // text field
  'CDL_MBS_DESCRIPTION': 'Business Segment Description', // text field
  'CDL_MBS_STATUS': ' Status', // 

  // Business Sub Segment Details
  'CDL_MBSS_ID': 'Business Sub Segment ID', // Auto Generated
  'CDL_MBSS_NAME': 'Business Sub Segment Name', // text field
  'CDL_MBSS_DESCRIPTION': 'Business Sub Segment Description', // text field
  'CDL_MBS_NAME': 'Business Segment Name', // Fetch from API
  'CDL_MBS_STATUS': ' Status', // 

  // Agreement Type Details
  'CDL_MAT_ID': 'Agreement Type ID', // Auto Generated
  'CDL_MAT_NAME': 'Agreement Type Name', // text field
  'CDL_MAT_DESCRIPTION': 'Agreement Type Description', // text field
  'CDL_MAT_STATUS': ' Status', // 

  // Agreement Sub Type Details
  'CDL_MATSS_ID': 'Agreement Sub Type ID', // Auto Generated
  'CDL_MATSS_NAME': 'Agreement Sub Type Name', // text field
  'CDL_MATSS_DESCRIPTION': 'Agreement Sub Type Description', // text field
  'CDL_MATSS_STATUS': ' Status', // 

  // Product Program Details
  'CDL_MPP_ID': 'Product Program ID', // Auto Generated
  'CDL_MPP_NAME': 'Product Program Name', // text field
  'CDL_MPP_DESCRIPTION': 'Product Program Description', // text field
  'CDL_MPP_STATUS': ' Status', // 

  // Beneficiary Details STEPR  there we can use DOCUMENT  uploader 
  'CDL_MB_ID': 'Beneficiary ID', // Auto Generated
  'CDL_MB_NAME': 'Beneficiary Name', // text field
  'CDL_MB_ADDRESS': 'Beneficiary Address ', // text field
  'CDL_MB_MOBILE_NO': 'Beneficiary Mobile No', // text field
  'CDL_MB_TELEPHONE_NO': 'Beneficiary Telephone No', // text field
  'CDL_MB_ROLE': 'Beneficiary Role ', // Dropdown from API
  'CDL_MB_TRANSFER_TYPE': 'Beneficiary Transfer Type', // text from API
  'CDL_MB_DESCRIPTION': 'Beneficiary Description', // text field
  'CDL_MB_NAME': 'Beneficiary Name', // Fetch from API
  'CDL_MB_ACCOUNT_NUMBER': 'Beneficiary Account Numbe/IBAN', // text from API 
  'CDL_MB_ACCOUNT_TYPE': 'Beneficiary Account Type', // dropdown 
  'CDL_MB_BANK_SWIFT_CODE': 'Beneficiary Bank Swift/BIC ', // Fetch from API
  'CDL_MB_BANK_NAME': 'Beneficiary Bank Name', // Fetch from  CORE API
  'CDL_MB_ROUTING_CODE': 'Beneficiary Routing Code', // text from API
  'CDL_MB_REMARKS': ' Remarks', // text from API
  'CDL_MB_STATUS': ' Status', // dropdown from API
  'CDL_MB_ACTIONS': 'Beneficiary Actions', // dropdown from API
  'CDL_MB_DOCUMENT': 'Beneficiary Document', // document uploader

  // Escrow Account Details STEPPER  there we can use DOCUMENT  uploader 
  'CDL_EA_ID': 'Escrow Account ID', // Auto Generated
  'CDL_EA_NAME': 'Escrow Account Name', // text field
  'CDL_EA_ADDRESS': 'Escrow Account Address ', // text field
  'CDL_EA_MOBILE_NO': 'Escrow Account Mobile No', // text field
  'CDL_EA_TELEPHONE_NO': 'Escrow Account Telephone No', // text field
  'CDL_EA_ROLE': 'Escrow Account Role ', // Dropdown from API
  'CDL_EA_TRANSFER_TYPE': 'Escrow Account Transfer Type', // text from API
  'CDL_EA_DESCRIPTION': 'Escrow Account Description', // text field
  'CDL_EA_ACCOUNT_NUMBER': 'Escrow Account Number/IBAN', // text from API 
  'CDL_EA_ACCOUNT_TYPE': 'Escrow Account Type', // dropdown 
  'CDL_EA_BANK_SWIFT_CODE': 'Escrow Account Bank Swift/BIC ', // Fetch from API
  'CDL_EA_BANK_NAME': 'Escrow Account Bank Name', // Fetch from  CORE API
  'CDL_EA_ROUTING_CODE': 'Escrow Account Routing Code', // text from API
  'CDL_EA_REMARKS': 'Escrow Account Remarks', // text from API
  'CDL_EA_STATUS': 'Escrow Account Status', // dropdown from API
  'CDL_EA_ACTIONS': 'Escrow Account Actions', // dropdown from API
  'CDL_EA_DOCUMENT': 'Escrow Account Document', // document uploader


  // Agreement Segment Details
  'CDL_MAS_ID': 'Agreement Segment ID', // Auto Generated
  'CDL_MAS_NAME': 'Agreement Segment Name', // text field
  'CDL_MAS_DESCRIPTION': 'Agreement Segment Description', // text field
  'CDL_MAS_NAME': 'Agreement Segment Name', // Fetch from API
  'CDL_MAS_STATUS': ' Status', //

  // General Ledger Account Details
  

  'CDL_MGLA_ID': ' General Ledger Account ID', // Auto Generated
  'CDL_MGLA_ACCOUNT_NUMBER': ' General Ledger Account Number', // Fetch from from API
  'CDL_MGLA_IDENTIFIER_CODE': ' General Ledger Account Identifier Code', // Fetch from from API
  'CDL_MGLA_DESCRIPTION': ' General Ledger Account Description', //  Fetch from from API
  'CDL_MGLA_TYPE_CODE': ' General Ledger Account Type Code', // Fetch from from API
  'CDL_MGLA_STATUS': ' Status', // 

  // Country Details
  'CDL_MCNT_ID': 'Country ID', // Auto Generated
  'CDL_MCNT_NAME': 'Country Name', // text field
  'CDL_MCNT_DESCRIPTION': 'Country Description', // text field
  'CDL_MCNT_CODE': 'Country Code', // text field
  'CDL_MCNT_STATUS': ' Status', // 

  // Currency Details
  'CDL_MCUR_ID': 'Currency ID', // Auto Generated
  'CDL_MCUR_NAME': 'Currency Name', // text field
  'CDL_MCUR_DESCRIPTION': 'Currency Description', // text field
  'CDL_MCUR_STATUS': ' Status', // 

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
  export const getPartyLabel = (configId) => {
  return MASTER_LABELS[configId] || configId
  }
  
  export const getMasterLabel = (configId) => {
    return MASTER_LABELS[configId] || configId
  }
  
  export const getLabelByConfigId = (configId) => {
    return MASTER_LABELS[configId] || configId
  }
  
  // Export the full mapping object for direct access
  export default MASTER_LABELS
  
  
  
  