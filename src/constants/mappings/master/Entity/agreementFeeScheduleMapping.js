export const AGREEMENTFEESCHEDULELABEL = {
  // Agreement Fee Schedule Details
  'CDL_AGREEMENT_FEE_SCHEDULE_DETAILS': 'Agreement Fee Schedule Details',
  'CDL_AGREEMENT_FEE_SCHEDULE_REGULATORY_REF_NO': 'Agreement Fee Schedule Regulatory Ref No', // Auto
  'CDL_AGREEMENT_FEE_SCHEDULE_START_DATE': 'Agreement Fee Schedule Start Date', // Calendar
  'CDL_AGREEMENT_FEE_SCHEDULE_END_DATE': 'Agreement Fee Schedule End Date', // Calendar
  'CDL_AGREEMENT_FEE_SCHEDULE_FEE': 'Agreement Fee Schedule Fee', // Drop Down
  'CDL_AGREEMENT_FEE_SCHEDULE_FEE_TYPE': 'Agreement Fee Schedule Fee Type', // Drop Down
  'CDL_AGREEMENT_FEE_SCHEDULE_FEES_FREQUENCY': 'Agreement Fee Schedule Fees Frequency', // Drop Down
  'CDL_AGREEMENT_FEE_SCHEDULE_FREQUENCY_BASIS': 'Agreement Fee Schedule Frequency Basis', // Drop Down
  'CDL_AGREEMENT_FEE_SCHEDULE_LOCATION': 'Agreement Fee Schedule Location', // Text Field
  'CDL_AGREEMENT_FEE_SCHEDULE_DEAL_TYPE': 'Agreement Fee Schedule Deal Type', // Text Field
  'CDL_AGREEMENT_FEE_SCHEDULE_DEAL_SUB_TYPE': 'Agreement Fee Schedule Deal Sub Type', // Text Field
  'CDL_AGREEMENT_FEE_SCHEDULE_PRODUCT_PROGRAMME': 'Agreement Fee Schedule Product Programme', // Text Field
  'CDL_AGREEMENT_FEE_SCHEDULE_DEAL_PRIORITY': 'Agreement Fee Schedule Deal Priority', // Text Field
  'CDL_AGREEMENT_FEE_SCHEDULE_AMOUNT_RATE_PER_TRANSACTION': 'Agreement Fee Schedule Amount Rate per Transaction', // Text Field
  'CDL_AGREEMENT_FEE_SCHEDULE_DEBIT_ACCOUNT': 'Agreement Fee Schedule Debit Account', // Text Field
  'CDL_AGREEMENT_FEE_SCHEDULE_CREDIT_TO_ACCOUNT': 'Agreement Fee Schedule Credit To Account', // Text Field
  'CDL_AGREEMENT_FEE_SCHEDULE_ESCROW_AGREEMENT': 'Agreement Fee Schedule Escrow Agreement', // Text Field
  'CDL_AGREEMENT_FEE_SCHEDULE_STATUS': 'Agreement Fee Schedule Status',
  'CDL_AGREEMENT_FEE_SCHEDULE_DOC_ACTION': 'Action',
  'CDL_AGREEMENT_FEE_SCHEDULE_ID': 'Agreement Fee Schedule ID',
}

export const getAgreementFeeScheduleLabel = (configId) => {
  return AGREEMENTFEESCHEDULELABEL[configId] || configId
}

export const getLabelByConfigId = (configId) => {
  return AGREEMENTFEESCHEDULELABEL[configId] || configId
}

// Export the full mapping object for direct access
export default AGREEMENTFEESCHEDULELABEL

