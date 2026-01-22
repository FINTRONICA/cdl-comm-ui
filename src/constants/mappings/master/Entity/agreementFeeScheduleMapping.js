export const AGREEMENTFEESCHEDULELABEL = {
  // Agreement Fee Schedule Details
  'CDL_AGREEMENT_FEE_SCHEDULE_DETAILS': 'Agreement Fee Details', // Text Field
  'CDL_AGREEMENT_FEE_SCHEDULE_REGULATORY_REF_NO': 'Regulatory Ref No', // Auto
  'CDL_AGREEMENT_FEE_SCHEDULE_START_DATE': 'Fee Schedule Start Date', // Calendar
  'CDL_AGREEMENT_FEE_SCHEDULE_END_DATE': 'Fee Schedule End Date', // Calendar
  'CDL_AGREEMENT_FEE_SCHEDULE_LOCATION': 'Location', // Text Field
  'CDL_AGREEMENT_PRIORITY_LEVEL': 'Priority Level', // Text Field
  'CDL_AGREEMENT_TRANSACTION_RATE_AMOUNT': 'Transaction Rate Amount', // Text Field
  'CDL_AGREEMENT_DEBIT_ACCOUNT_NUMBER': 'Debit Account Number', // Text Field
  'CDL_AGREEMENT_CREDIT_ACCOUNT_NUMBER': 'Credit Account Number', // Text Field
  'CDL_AGREEMENT_FEE_SCHEDULE_FEE': 'Fee', // Drop Down
  'CDL_AGREEMENT_FEE_SCHEDULE_FEE_TYPE': 'Fee Type', // Drop Down
  'CDL_AGREEMENT_FEE_SCHEDULE_FEES_FREQUENCY': 'Fees Frequency', // Drop Down
  'CDL_AGREEMENT_FEE_SCHEDULE_FREQUENCY_BASIS': 'Frequency Basis', // Drop Down
  'CDL_AGREEMENT_FEE_SCHEDULE_AGREEMENT_TYPE': 'Agreement Type', // Drop Down
  'CDL_AGREEMENT_FEE_SCHEDULE_AGREEMENT_SUB_TYPE': 'Agreement Sub Type', // Drop Down
  'CDL_AGREEMENT_FEE_SCHEDULE_PRODUCT_PROGRAMME': 'Product Programme', // Drop Down
  'CDL_AGREEMENT_FEE_SCHEDULE_DEAL_PRIORITY': 'Deal Priority', // Text Field
  'CDL_AGREEMENT_FEE_SCHEDULE_AMOUNT_RATE_PER_TRANSACTION': 'Amount Rate per Transaction', // Text Field
  'CDL_AGREEMENT_FEE_SCHEDULE_DEBIT_ACCOUNT': 'Debit Account', // Text Field
  'CDL_AGREEMENT_FEE_SCHEDULE_CREDIT_TO_ACCOUNT': 'Credit To Account', // Text Field
  'CDL_AGREEMENT_FEE_SCHEDULE_ID': 'Agreement Fee Schedule ID', // Text Field
  'CDL_AGREEMENT_FEE_SCHEDULE_STATUS': 'Status',
  'CDL_AGREEMENT_FEE_SCHEDULE_DOC_ACTION': 'Action',


  // 'CDL_AGREEMENT_FEE_SCHEDULE_FEE': 'Agreement Fee Schedule Fee', // Drop Down
  // 'CDL_AGREEMENT_FEE_SCHEDULE_FEE_TYPE': 'Agreement Fee Schedule Fee Type', // Drop Down
  // 'CDL_AGREEMENT_FEE_SCHEDULE_FEES_FREQUENCY': 'Agreement Fee Schedule Fees Frequency', // Drop Down
  // 'CDL_AGREEMENT_FEE_SCHEDULE_FREQUENCY_BASIS': 'Agreement Fee Schedule Frequency Basis', // Drop Down
  // 'CDL_AGREEMENT_FEE_SCHEDULE_DEAL_TYPE': 'Agreement Fee Schedule Deal Type', // Text Field
  // 'CDL_AGREEMENT_FEE_SCHEDULE_DEAL_SUB_TYPE': 'Agreement Fee Schedule Deal Sub Type', // Text Field
  // 'CDL_AGREEMENT_FEE_SCHEDULE_PRODUCT_PROGRAMME': 'Agreement Fee Schedule Product Programme', // Text Field
  // 'CDL_AGREEMENT_FEE_SCHEDULE_DEAL_PRIORITY': 'Agreement Fee Schedule Deal Priority', // Text Field
  // 'CDL_AGREEMENT_FEE_SCHEDULE_AMOUNT_RATE_PER_TRANSACTION': 'Agreement Fee Schedule Amount Rate per Transaction', // Text Field
  // 'CDL_AGREEMENT_FEE_SCHEDULE_DEBIT_ACCOUNT': 'Agreement Fee Schedule Debit Account', // Text Field
  // 'CDL_AGREEMENT_FEE_SCHEDULE_CREDIT_TO_ACCOUNT': 'Agreement Fee Schedule Credit To Account', // Text Field
  // 'CDL_AGREEMENT_FEE_SCHEDULE_ESCROW_AGREEMENT': 'Agreement Fee Schedule Escrow Agreement', // Text Field
 
  // 'CDL_AGREEMENT_FEE_SCHEDULE_ID': 'Agreement Fee Schedule ID',
  // 'CDL_AGREEMENT_REGULATORY_REF_NO': 'Agreement Fee Schedule Regulatory Ref No', // Auto
}

export const getAgreementFeeScheduleLabel = (configId) => {
  return AGREEMENTFEESCHEDULELABEL[configId] || configId
}

export const AGREEMENT_FEE_SCHEDULE_DTO_SETTING_KEYS = {
  feeDTO: 'FEE',
  feeTypeDTO: 'FEE_TYPE',
  feesFrequencyDTO: 'FEES_FREQUENCY',
  frequencyBasisDTO: 'FREQUENCY_BASIS',
}

export const getLabelByConfigId = (configId) => {
  return AGREEMENTFEESCHEDULELABEL[configId] || configId
}

// Export the full mapping object for direct access
export default AGREEMENTFEESCHEDULELABEL

// "effectiveStartDate": "2026-01-20T06:17:58.016Z",
//   "effectiveEndDate": "2026-01-20T06:17:58.016Z",
//   "operatingLocation": "string",
//   "priorityLevel": "string",
//   "transactionRateAmount": "string",
//   "debitAccountNumber": "string",
//   "creditAccountNumber": "string",
//   "active": true,
//   feeDTO
// feeTypeDTO



// feesFrequencyDTO
// frequencyBasisDTO
// agreementTypeDTO
// agreementSubTypeDTO
// productProgramDTO
// escrowAgreementDTO