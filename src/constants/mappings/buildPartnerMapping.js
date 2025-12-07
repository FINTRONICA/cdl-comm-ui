

export const BUILD_PARTNER_LABELS = {
 
  'CDL_BP_DETAILS': 'Build Partner details',
  'CDL_BP_ID': 'Build Partner ID',
  'CDL_BP_CIF': 'Build Partner CIF',
  'CDL_BP_REGNO': 'Build Partner Registration No',
  'CDL_BP_REGDATE': 'RERA Regisntartion Date',
  'CDL_BP_NAME_LOCALE': 'Build Partner Name (Locale)',
  'CDL_BP_NAME': 'Build Partner Name',
  'CDL_BP_MASTER': 'Master Build Partner',
  'CDL_BP_REGULATORY_AUTHORITY': 'Regulatory Authority',
  'CDL_BP_STATUS': 'Status',

  'CDL_BP_ADDRESS': 'Registered Address',
  'CDL_BP_MOBILE': 'Official Mobile Number',
  'CDL_BP_EMAIL': 'Official Email Address',
  'CDL_BP_FAX': 'Official Fax Number',


  'CDL_BP_LICENSE': 'Build Partner License Number',
  'CDL_BP_LICENSE_VALID': 'License Valid Until',

 
  'CDL_BP_WORLD_STATUS': 'World-Check Status',
  'CDL_BP_WORLD_REMARKS': 'World-Check Status Remarks',

  
  'CDL_BP_NOTES': 'Additional Notes',


  'CDL_BP_DOC_MANAGEMENT': 'Document Management',
  'CDL_BP_DOC_TITLE': 'Document Title',
  'CDL_BP_DOC_CLASSIFICATION': 'Document Classification',
  'CDL_BP_DOC_DATE': 'Date of Submission',
  'CDL_BP_DOC_ACTION': 'Available Actions',

 
  'CDL_BP_CONTACT': 'Build Partner Contact & Identification',
  'CDL_BP_CONTACT_ADD': 'Add Contact Details',
  'CDL_BP_CONTACT_EDIT': 'Edit Contact Details',
  'CDL_BP_AUTH_FIRST_NAME': 'First Name',
  'CDL_BP_AUTH_LAST_NAME': 'Last Name',
  'CDL_BP_AUTH_NAME': 'Authorized Contact Name',
  'CDL_BP_BUSINESS_ADDRESS': 'Business Address',
  'CDL_BP_EMAIL_ADDRESS': 'Corporate Email Address',
  'CDL_BP_ADDRESS_LINE1': 'Address Line 1',
  'CDL_BP_ADDRESS_LINE2': 'Address Line 2',
  'CDL_BP_POBOX': 'P.O. Box Number',
  'CDL_BP_COUNTRY_CODE': 'International Dialing Code',
  'CDL_BP_MOBILE_NUMBER': 'Primary Mobile Number',
  'CDL_BP_TELEPHONE_NUMBER': 'Primary Telephone Number',
  'CDL_BP_FAX_NUMBER': 'Fax Number',
  'CDL_BP_ALTERNATE_NUMBER': 'Alternate Telephone Number',

  // Escrow Fee & Collection Details
  'CDL_BP_FEES': 'Escrow Fee & Collection Details',
  'CDL_BP_FEES_TYPE': 'Type of Fee',
  'CDL_BP_FEES_FREQUENCY': 'Collection Frequency',
  'CDL_BP_FEES_ACCOUNT': 'Designated Debit Account',
  'CDL_BP_FEES_TOTAL': 'Total Fees Due',
  'CDL_BP_FEE_COLLECTION_DATE': 'Fee Collection Date',
  'CDL_BP_FEES_DATE': 'Next Collection Date',
  'CDL_BP_FEES_RATE': 'Fee Rate (%)',
  'CDL_BP_FEES_AMOUNT': 'Fee Amount',
  'CDL_BP_FEES_VAT': 'Applicable VAT (%)',
  'CDL_BP_FEES_CURRENCY': 'Transaction Currency',
  'CDL_BP_FEES_TOTAL_AMOUNT': 'Collected Amount',
  'CDL_BP_FEES_ADD': 'Add Fee Details',
  'CDL_BP_FEES_EDIT': 'Edit Fee Details',
  'CDL_BP_FEES_SAVE': 'Save',
  'CDL_BP_FEES_UPDATE': 'Update',
  'CDL_BP_FEES_CANCEL': 'Cancel',
  'CDL_BP_FEES_DEBIT_AMOUNT': 'Debit Amount',
  'CDL_BP_FEES_TO_BE_COLLECTED': 'Fee to be Collected',
  'CDL_BP_FEES_NEXT_RECOVERY_DATE': 'Next Recovery Date',
  // Fees messages
  'CDL_BP_FEES_ADD_SUCCESS': 'Fee added successfully!',
  'CDL_BP_FEES_UPDATE_SUCCESS': 'Fee updated successfully!',
  'CDL_BP_FEES_ADD_FAILED': 'Failed to add fee. Please try again.',
  'CDL_BP_FEES_ITEM_PREFIX': 'Fee',
  // Fees required-field messages
  'CDL_BP_FEES_TYPE_REQUIRED': 'Fee Type is required',
  'CDL_BP_FEES_FREQ_REQUIRED': 'Frequency is required',
  'CDL_BP_FEES_ACCOUNT_REQUIRED': 'Debit Account is required',
  'CDL_BP_FEES_COLLECTION_DATE_REQUIRED': 'Fee Collection Date is required',
  'CDL_BP_FEES_DEBIT_AMOUNT_REQUIRED': 'Debit Amount is required',
  'CDL_BP_FEES_TOTAL_REQUIRED': 'Total Amount is required',
  'CDL_BP_FEES_VAT_REQUIRED': 'VAT Percentage is required',
  'CDL_BP_FEES_CURRENCY_REQUIRED': 'Currency is required',

  // Beneficiary Banking Information
  'CDL_BP_BENE_INFO': 'Beneficiary Banking Information',
  'CDL_BP_BENE_REF': 'Beneficiary Reference ID',
  'CDL_BP_BENE_PAYMODE': 'Payment Transfer Mode',
  'CDL_BP_BENE_NAME': 'Beneficiary Full Name',
  'CDL_BP_BENE_BANK': 'Beneficiary Bank Name',
  'CDL_BP_BENE_BIC': 'SWIFT / BIC Code',
  'CDL_BP_BENE_ROUTING': 'Bank Routing Number',
  'CDL_BP_BENE_ACCOUNT': 'Bank Account Number',

  // Common UI labels
  'CDL_COMMON_ACTION': 'Action',
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
}

// Utility function to get label by configId
export const getBuildPartnerLabel = (configId) => {
  return BUILD_PARTNER_LABELS[configId] || configId
}

// Utility function to get all labels for a specific category
export const getBuildPartnerLabelsByCategory = (category) => {
  const categories = {
    'details': [
      'CDL_BP_DETAILS', 'CDL_BP_ID', 'CDL_BP_CIF', 'CDL_BP_REGNO', 
      'CDL_BP_REGDATE', 'CDL_BP_NAME_LOCALE', 'CDL_BP_NAME', 
      'CDL_BP_MASTER', 'CDL_BP_REGULATORY_AUTHORITY', 'CDL_BP_STATUS'
    ],
    'contact': [
      'CDL_BP_ADDRESS', 'CDL_BP_MOBILE', 'CDL_BP_EMAIL', 'CDL_BP_FAX',
      'CDL_BP_CONTACT', 'CDL_BP_AUTH_NAME', 'CDL_BP_BUSINESS_ADDRESS',
      'CDL_BP_EMAIL_ADDRESS', 'CDL_BP_POBOX', 'CDL_BP_COUNTRY_CODE',
      'CDL_BP_MOBILE_NUMBER', 'CDL_BP_TELEPHONE_NUMBER', 'CDL_BP_FAX_NUMBER',
      'CDL_BP_ALTERNATE_NUMBER'
    ],
    'license': [
      'CDL_BP_LICENSE', 'CDL_BP_LICENSE_VALID'
    ],
    'worldcheck': [
      'CDL_BP_WORLD_STATUS', 'CDL_BP_WORLD_REMARKS'
    ],
    'documents': [
      'CDL_BP_DOC_MANAGEMENT', 'CDL_BP_DOC_TITLE', 'CDL_BP_DOC_CLASSIFICATION',
      'CDL_BP_DOC_DATE', 'CDL_BP_DOC_ACTION'
    ],
    'fees': [
      'CDL_BP_FEES', 'CDL_BP_FEES_TYPE', 'CDL_BP_FEES_FREQUENCY',
      'CDL_BP_FEES_ACCOUNT', 'CDL_BP_FEES_TOTAL', 'CDL_BP_FEES_DATE',
      'CDL_BP_FEES_RATE', 'CDL_BP_FEES_AMOUNT', 'CDL_BP_FEES_VAT',
      'CDL_BP_FEES_CURRENCY', 'CDL_BP_FEES_TOTAL_AMOUNT'
    ],
    'beneficiary': [
      'CDL_BP_BENE_INFO', 'CDL_BP_BENE_REF', 'CDL_BP_BENE_PAYMODE',
      'CDL_BP_BENE_NAME', 'CDL_BP_BENE_BANK', 'CDL_BP_BENE_BIC',
      'CDL_BP_BENE_ROUTING', 'CDL_BP_BENE_ACCOUNT'
    ]
  }

  return categories[category]?.map(configId => ({
    configId,
    label: BUILD_PARTNER_LABELS[configId]
  })) || []
}

// Export the full mapping object for direct access
export default BUILD_PARTNER_LABELS
