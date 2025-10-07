// Capital Partner label mapping from CAPITAL_PARTNER API response
// Maps configId to configValue for easy lookup and usage in components

export const CAPITAL_PARTNER_LABELS = {
  // Main Capital Partner Details
  'CDL_CP': 'Capital Partner',
  'CDL_CP_NEW': 'Register New Capital Partner',
  'CDL_CP_BASIC_INFO': 'Capital Partner Basic Information',
  'CDL_CP_TYPE': 'Capital Partner Type',
  'CDL_CP_FIRSTNAME': '',
  'CDL_CP_REFID': 'Capital Partner Reference ID',
  'CDL_CP_MIDDLENAME': 'Middle Name',
  'CDL_CP_LASTNAME': 'Last Name',
  'CDL_CP_LOCALE_NAME': 'Local Language Name',
  'CDL_CP_OWNERSHIP': 'Ownership Share (%)',
  'CDL_CP_ID_TYPE': 'Identification Document Type',
  'CDL_CP_DOC_NO': 'Identification Document Number',
  'CDL_CP_ID_EXP': 'Identification Expiry Date',
  'CDL_CP_NATIONALITY': 'Nationality',
  'CDL_CP_TELEPHONE': 'Account Contact Telephone',
  'CDL_CP_MOBILE': 'Primary Mobile Number',
  'CDL_CP_EMAIL': 'Capital Partner Email Address',

  // Unit Details
  'CDL_CP_UNIT_DETAILS': 'Asset Unit Details',
  'CDL_CP_FLOOR': 'Floor Number',
  'CDL_CP_NOOF_BED': 'Number of Bedrooms',
  'CDL_CP_UNIT_NUMBER': 'Unit Number (Oqood Format)',
  'CDL_CP_UNIT_STATUS': 'Unit Status',
  'CDL_CP_BUILDING_NAME': 'Building Name',
  'CDL_CP_PLOT_SIZE': 'Plot Size (sq. m./sq. ft.)',
  'CDL_CP_PROP_NUMBER': 'Property Identification Number',
  'CDL_CP_UNIT_IBAN': 'Unit IBAN',
  'CDL_CP_REG_FEE': 'Unit Registration Fee',
  'CDL_CP_AGENT_NAME': 'Agent Full Name',
  'CDL_CP_AGENT_ID': 'Agent National Identification Number',
  'CDL_CP_NET_PRICE': 'Net Sale Price',
  'CDL_CP_GROSS_PRICE': 'Gross Sale Price',
  'CDL_CP_VAT_APPLICABLE': 'VAT Applicability',
  'CDL_CP_DEED_REF_NO': 'Deed Reference Number',
  'CDL_CP_CONTRACT_NO': 'Contract Number',
  'CDL_CP_AGREEMENT_DATE': 'Agreement Execution Date',
  'CDL_CP_SPA': 'Sale & Purchase Agreement (SPA)',
  'CDL_CP_PAYMENT_PLAN': 'Asset Payment Plan',
  'CDL_CP_FEE_REQ': 'Modification Fee Requirement',
  'CDL_CP_WORLD_STATUS': 'World-Check Status',
  'CDL_CP_WITH_ESCROW': 'Amount Paid to Build Partner (Within Escrow)',

  // Payment Plan & Installments
  'CDL_CP_SEQ_NO': 'Installment Sequence Number',
  'CDL_CP_DUE_DATE': 'Installment Due Date',
  'CDL_CP_BOOKING_AMOUNT': 'Initial Booking Payment',

  // Banking & Payment Details
  'CDL_CP_BANK_DETAILS': 'Banking & Payment Details',
  'CDL_CP_PAY_MODE': 'Payment Method',
  'CDL_CP_ACCOUNT_NUMBER': 'Bank Account Number',
  'CDL_CP_PAYEE_NAME': 'Payee Full Name',
  'CDL_CP_PAYEE_ADDRESS': 'Payee Address',
  'CDL_CP_BANK_NAME': 'Bank Name',
  'CDL_CP_BANK_ADDRESS': 'Bank Address',
  'CDL_CP_ROUTING_CODE': 'Routing Number',
  'CDL_CP_BIC_CODE': 'SWIFT / BIC Code',
  'CDL_CP_VA_NUMBER': 'Retrieve Virtual Account Number',

  // Additional Payment Information
  'CDL_CP_OUTSIDE_ESCROW': 'Amount Paid to Build Partner (Outside Escrow)',
  'CDL_CP_PARTNER_PAYMENT': 'Total Capital Partner Payment',
  'CDL_CP_BOOKING': 'Reservation & Booking Form',
  'CDL_CP_OQOOD_STATUS': 'Oqood Paid Status',
  'CDL_CP_OQOOD_PAID': 'Oqood Amount Paid',
  'CDL_CP_UNIT_AREA': 'Unit Area Measurement',
  'CDL_CP_FORFEIT_AMT': 'Forfeited Amount',
  'CDL_CP_DLD_FEE': 'Dubai Land Department Fee',
  'CDL_CP_REFUND_AMOUNT': 'Refund Amount',
  'CDL_CP_REMARKS': 'Additional Remarks',
  'CDL_CP_TRANS_AMT': 'Transferred Amount',
}

// Utility function to get label by configId
export const getCapitalPartnerLabel = (configId) => {
  return CAPITAL_PARTNER_LABELS[configId] || configId
}

// Utility function to get all labels for a specific category
export const getCapitalPartnerLabelsByCategory = (category) => {
  const categories = {
    'basic_info': [
      'CDL_CP', 'CDL_CP_NEW', 'CDL_CP_BASIC_INFO', 'CDL_CP_TYPE',
      'CDL_CP_FIRSTNAME', 'CDL_CP_REFID', 'CDL_CP_MIDDLENAME',
      'CDL_CP_LASTNAME', 'CDL_CP_LOCALE_NAME', 'CDL_CP_OWNERSHIP'
    ],
    'identification': [
      'CDL_CP_ID_TYPE', 'CDL_CP_DOC_NO', 'CDL_CP_ID_EXP',
      'CDL_CP_NATIONALITY'
    ],
    'contact': [
      'CDL_CP_TELEPHONE', 'CDL_CP_MOBILE', 'CDL_CP_EMAIL'
    ],
    'unit_details': [
      'CDL_CP_UNIT_DETAILS', 'CDL_CP_FLOOR', 'CDL_CP_NOOF_BED',
      'CDL_CP_UNIT_NUMBER', 'CDL_CP_UNIT_STATUS', 'CDL_CP_BUILDING_NAME',
      'CDL_CP_PLOT_SIZE', 'CDL_CP_PROP_NUMBER', 'CDL_CP_UNIT_IBAN',
      'CDL_CP_REG_FEE'
    ],
    'agent': [
      'CDL_CP_AGENT_NAME', 'CDL_CP_AGENT_ID'
    ],
    'pricing': [
      'CDL_CP_NET_PRICE', 'CDL_CP_GROSS_PRICE', 'CDL_CP_VAT_APPLICABLE'
    ],
    'legal': [
      'CDL_CP_DEED_REF_NO', 'CDL_CP_CONTRACT_NO', 'CDL_CP_AGREEMENT_DATE',
      'CDL_CP_SPA'
    ],
    'payment_plan': [
      'CDL_CP_PAYMENT_PLAN', 'CDL_CP_SEQ_NO', 'CDL_CP_DUE_DATE',
      'CDL_CP_BOOKING_AMOUNT'
    ],
    'banking': [
      'CDL_CP_BANK_DETAILS', 'CDL_CP_PAY_MODE', 'CDL_CP_ACCOUNT_NUMBER',
      'CDL_CP_PAYEE_NAME', 'CDL_CP_PAYEE_ADDRESS', 'CDL_CP_BANK_NAME',
      'CDL_CP_BANK_ADDRESS', 'CDL_CP_ROUTING_CODE', 'CDL_CP_BIC_CODE',
      'CDL_CP_VA_NUMBER'
    ],
    'payments': [
      'CDL_CP_WITH_ESCROW', 'CDL_CP_OUTSIDE_ESCROW', 'CDL_CP_PARTNER_PAYMENT',
      'CDL_CP_BOOKING', 'CDL_CP_OQOOD_STATUS', 'CDL_CP_OQOOD_PAID',
      'CDL_CP_UNIT_AREA', 'CDL_CP_FORFEIT_AMT', 'CDL_CP_DLD_FEE',
      'CDL_CP_REFUND_AMOUNT', 'CDL_CP_REMARKS', 'CDL_CP_TRANS_AMT'
    ],
    'status': [
      'CDL_CP_FEE_REQ', 'CDL_CP_WORLD_STATUS'
    ]
  }

  return categories[category]?.map(configId => ({
    configId,
    label: CAPITAL_PARTNER_LABELS[configId]
  })) || []
}

// Export the full mapping object for direct access
export default CAPITAL_PARTNER_LABELS
