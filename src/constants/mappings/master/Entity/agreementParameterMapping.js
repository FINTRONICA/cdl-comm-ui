
export const AGREEMENTPARAMETERLABEL = {
// Agreement Parameter Details
  'CDL_AGREEMENT_PARAMETER_DETAILS': 'Agreement Parameter Details', // text field
  'CDL_AGREEMENT_PARAMETER_REF_NO': ' Agreement Parameter Ref No', // Auto
  'CDL_AGREEMENT_PARAMETER_DEAL_START_DATE': ' Agreement Parameter Deal Start Date', // Calendar - maps to agreementEffectiveDate
  'CDL_AGREEMENT_PARAMETER_DEAL_END_DATE': ' Agreement Parameter Deal End Date', // Calendar - maps to agreementExpiryDate
  'CDL_AGREEMENT_PARAMETER_PERMITTED_INVESTMENT_ALLOWED': ' Agreement Parameter Permitted Investment Allowed', // Drop Down - maps to permittedInvestmentAllowedDTO
  'CDL_AGREEMENT_PARAMETER_PERMITTED_INVESTMENT': ' Agreement Parameter Permitted Investment', // Drop Down
  'CDL_AGREEMENT_PARAMETER_AMENDMENT_ALLOWED': ' Agreement Parameter Amendment Allowed', // Drop Down - maps to amendmentAllowedDTO
  'CDL_AGREEMENT_PARAMETER_DEAL_CLOSURE_BASIS': ' Agreement Parameter Deal Closure Basis', // Drop Down - maps to dealClosureBasisDTO
  'CDL_AGREEMENT_PARAMETER_DEAL_NOTES': ' Agreement Parameter Deal Notes', // Text Field - maps to agreementRemarks
  'CDL_AGREEMENT_PARAMETER_EFFECTIVE_DATE': ' Agreement Effective Date', // Calendar - maps to agreementEffectiveDate
  'CDL_AGREEMENT_PARAMETER_EXPIRY_DATE': ' Agreement Expiry Date', // Calendar - maps to agreementExpiryDate
  'CDL_AGREEMENT_PARAMETER_REMARKS': ' Agreement Remarks', // Text Field - maps to agreementRemarks
  'CDL_AGREEMENT_PARAMETER_ESCROW_AGREEMENT': ' Escrow Agreement', // Reference - maps to escrowAgreementDTO
  'CDL_AGREEMENT_PARAMETER_ACTIVE': ' Active', // Boolean - maps to active
  'CDL_AGREEMENT_PARAMETER_STATUS': ' Status', // Status field
  'CDL_AGREEMENT_PARAMETER_DOC_ACTION': ' Action', // Action column

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
  
  export const getAgreementParameterLabel = (configId) => {
    return AGREEMENTPARAMETERLABEL[configId] || configId
  }
    
  // Export the full mapping object for direct access
  export default AGREEMENTPARAMETERLABEL


