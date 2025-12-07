export const AGREEMENT_SIGNATORY_LABEL = {
  // Agreement Signatory Details
  'CDL_AGREEMENT_SIGNATORY_DETAILS': 'Agreement Signatory Details', // text field
  'CDL_ESCROW_AGREEMENT_SIGNATORY_REF_NO': 'Agreement Signatory Ref No', // Auto
  'CDL_ESCROW_AGREEMENT_SIGNATORY_CRN_NUMBER': 'Agreement Signatory CRN Number', // Fetch
  'CDL_ESCROW_AGREEMENT_SIGNATORY_NAME': 'Agreement Signatory Name', // Text Field
  'CDL_ESCROW_AGREEMENT_SIGNATORY_ADDRESS_1': 'Agreement Signatory Address 1', // Text Field
  'CDL_ESCROW_AGREEMENT_SIGNATORY_ADDRESS_2': 'Agreement Signatory Address 2', // Text Field
  'CDL_ESCROW_AGREEMENT_SIGNATORY_ADDRESS_3': 'Agreement Signatory Address 3', // Text Field
  'CDL_ESCROW_AGREEMENT_SIGNATORY_ROLE': 'Agreement Signatory Role', // Text Field
  'CDL_ESCROW_AGREEMENT_SIGNATORY_NOTICE_ADDRESS_1': 'Agreement Signatory Notice Address 1', // Text Field
  'CDL_ESCROW_AGREEMENT_SIGNATORY_NOTICE_ADDRESS_2': 'Agreement Signatory Notice Address 2', // Text Field
  'CDL_ESCROW_AGREEMENT_SIGNATORY_NOTICE_ADDRESS_3': 'Agreement Signatory Notice Address 3', // Text Field
  'CDL_ESCROW_AGREEMENT_SIGNATORY_PARTY_SIGNATORY': 'Agreement Signatory Party Signatory', // Fetch
  'CDL_ESCROW_AGREEMENT_SIGNATORY_NOTICE_PERSON': 'Agreement Signatory Notice Person', // Fetch
  'CDL_ESCROW_AGREEMENT_SIGNATORY_NOTICE_PERSON_SIGNATORY': 'Agreement Signatory Notice Person Signatory', // Fetch
  'CDL_ESCROW_AGREEMENT_SIGNATORY_NOTICE_PERSON_EMAIL': 'Agreement Signatory Notice Person Email', // Fetch
  'CDL_ESCROW_AGREEMENT_SIGNATORY_PARTY_ASSOCIATE_TYPE': 'Agreement Signatory Party Associate Type', // Text Field

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
  'Documents (Optional)': 'CDL_DOCUMENT', // stepper label
}

export const getAgreementSignatoryLabel = (configId) => {
  return AGREEMENT_SIGNATORY_LABEL[configId] || configId
}

export const getLabelByConfigId = (configId) => {
  return AGREEMENT_SIGNATORY_LABEL[configId] || configId
}

// Export the full mapping object for direct access
export default AGREEMENT_SIGNATORY_LABEL


