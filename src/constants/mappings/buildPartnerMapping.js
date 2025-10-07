// Build Partner label mapping from BUILD_PARTNER API response
// Maps configId to configValue for easy lookup and usage in components

export const BUILD_PARTNER_LABELS = {
  // Main Build Partner Details
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

  // Address and Contact Information
  'CDL_BP_ADDRESS': 'Registered Address',
  'CDL_BP_MOBILE': 'Official Mobile Number',
  'CDL_BP_EMAIL': 'Official Email Address',
  'CDL_BP_FAX': 'Official Fax Number',

  // License Information
  'CDL_BP_LICENSE': 'Build Partner License Number',
  'CDL_BP_LICENSE_VALID': 'License Valid Until',

  // World-Check Status
  'CDL_BP_WORLD_STATUS': 'World-Check Status',
  'CDL_BP_WORLD_REMARKS': 'World-Check Status Remarks',

  // Additional Information
  'CDL_BP_NOTES': 'Additional Notes',

  // Document Management
  'CDL_BP_DOC_MANAGEMENT': 'Document Management',
  'CDL_BP_DOC_TITLE': 'Document Title',
  'CDL_BP_DOC_CLASSIFICATION': 'Document Classification',
  'CDL_BP_DOC_DATE': 'Date of Submission',
  'CDL_BP_DOC_ACTION': 'Available Actions',

  // Contact & Identification
  'CDL_BP_CONTACT': 'Build Partner Contact & Identification',
  'CDL_BP_AUTH_NAME': 'Authorized Contact Name',
  'CDL_BP_BUSINESS_ADDRESS': 'Business Address',
  'CDL_BP_EMAIL_ADDRESS': 'Corporate Email Address',
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
  'CDL_BP_FEES_DATE': 'Next Collection Date',
  'CDL_BP_FEES_RATE': 'Fee Rate (%)',
  'CDL_BP_FEES_AMOUNT': 'Fee Amount',
  'CDL_BP_FEES_VAT': 'Applicable VAT (%)',
  'CDL_BP_FEES_CURRENCY': 'Transaction Currency',
  'CDL_BP_FEES_TOTAL_AMOUNT': 'Collected Amount',

  // Beneficiary Banking Information
  'CDL_BP_BENE_INFO': 'Beneficiary Banking Information',
  'CDL_BP_BENE_REF': 'Beneficiary Reference ID',
  'CDL_BP_BENE_PAYMODE': 'Payment Transfer Mode',
  'CDL_BP_BENE_NAME': 'Beneficiary Full Name',
  'CDL_BP_BENE_BANK': 'Beneficiary Bank Name',
  'CDL_BP_BENE_BIC': 'SWIFT / BIC Code',
  'CDL_BP_BENE_ROUTING': 'Bank Routing Number',
  'CDL_BP_BENE_ACCOUNT': 'Bank Account Number',
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
