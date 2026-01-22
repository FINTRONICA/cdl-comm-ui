export const PAYMENT_BENEFICIARY_MAPPING = {
    'CDL_RULE_REF_NO': 'Rule Reference No',
    'CDL_PAYMENT_BENEFICIARY_ACCOUNT_NUMBER': 'Beneficiary AccountNumber',
    'CDL_PAYMENT_BENEFICIARY_IFSC_CODE': 'Beneficiary Bank Ifsc Code',  
    'CDL_PAYMENT_CREDIT_AMOUNT_CAP': 'Credit AmountCap',
    'CDL_PAYMENT_CREDIT_AMOUNT': 'Credit Amount',
    'CDL_PAYMENT_TRANSFER_PRIORITY_LEVELP': 'Transfer Priority Level',
    'CDL_PAYMENT_CREDIT_SHARE_PERCENTAGE': 'Credit Share Percentage',
    'CDL_PAYMENT_CURRENCY_CODE': 'Currency Code',
    'CDL_PAYMENT_PAYMENT_MODE_CODE': 'Payment ModeCode',
    'CDL_PAYMENT_BENEFICIARY_NAME_DTO': 'Beneficiary Name',
    'CDL_PAYMENT_PAYMENT_MODE_DTO': 'Payment Mode',
    'CDL_PAYMENT_CURRENCY_DTO': 'Currency',
    'CDL_PAYMENT_STANDING_INSTRUCTION_DTO': 'Standing Instruction',
    'CDL_PAYMENT_BENEFICIARY': 'Payment Beneficiary',

    'CDL_PAYMENT_INSTRUCTION': 'Payment Instruction',
    // Common UI labels
    'CDL_COMMON_ACTION': 'Action',
    'CDL_COMMON_ACTIONS': 'Actions',
    'CDL_COMMON_STATUS': 'Status',
}

export const PAYMENT_INSTRUCTION_MAPPING = {
    'CDL_PAYMENT_STANDING_INSTRUCTION_ID': 'Standing Instruction ID',
    'CDL_PAYMENT_STANDING_INSTRUCTION_REFERENCE_NUMBER': 'Standing Instruction Reference Number',
    'CDL_PAYMENT_STANDING_INSTRUCTION_CLIENT_FULL_NAME': 'Client Full Name',
    'CDL_PAYMENT_STANDING_INSTRUCTION_DEBIT_AMOUNT_CAP': 'Debit Amount Cap',
    'CDL_PAYMENT_STANDING_INSTRUCTION_DEBIT_AMOUNT': 'Debit Amount',
    'CDL_PAYMENT_STANDING_INSTRUCTION_MINIMUM_BALANCE_AMOUNT': 'Minimum Balance Amount',
    'CDL_PAYMENT_STANDING_INSTRUCTION_THRESHOLD_AMOUNT': 'Threshold Amount',
    'CDL_PAYMENT_STANDING_INSTRUCTION_FIRST_TRANSACTION_DATETIME': 'First Transaction Date & Time',
    'CDL_PAYMENT_STANDING_INSTRUCTION_EXPIRY_DATETIME': 'Instruction Expiry Date & Time',
    'CDL_PAYMENT_STANDING_INSTRUCTION_RETRY_INTERVAL_DAYS': 'Retry Interval (Days)',
    'CDL_PAYMENT_STANDING_INSTRUCTION_RETRY_UNTIL_MONTH_END_FLAG': 'Retry Until Month End',
    'CDL_PAYMENT_STANDING_INSTRUCTION_REMARKS': 'Instruction Remarks',
    'CDL_PAYMENT_STANDING_INSTRUCTION_NEXT_EXECUTION_DATETIME': 'Next Execution Date & Time',
    'CDL_PAYMENT_STANDING_INSTRUCTION_SWIFT_CODE': 'SWIFT Code',
    'CDL_PAYMENT_STANDING_INSTRUCTION_CREDIT_AMOUNT_CAP': 'Credit Amount Cap',
    'CDL_PAYMENT_STANDING_INSTRUCTION_CREDIT_AMOUNT': 'Credit Amount',
    'CDL_PAYMENT_STANDING_INSTRUCTION_PRIORITY': 'Priority',
    'CDL_PAYMENT_STANDING_INSTRUCTION_RECENT_PERCENTAGE': 'Recent Percentage',
    'CDL_PAYMENT_STANDING_INSTRUCTION_DEAL_NO_DTO': 'Deal Number',
    'CDL_PAYMENT_STANDING_INSTRUCTION_STATUS_DTO': 'Status',
    'CDL_PAYMENT_STANDING_INSTRUCTION_TRANSFER_TYPE_DTO': 'Transfer Type',
    'CDL_PAYMENT_STANDING_INSTRUCTION_OCCURRENCE_DTO': 'Occurrence',
    'CDL_PAYMENT_STANDING_INSTRUCTION_RECURRING_FREQUENCY_DTO': 'Recurring Frequency',
    'CDL_PAYMENT_STANDING_INSTRUCTION_HOLIDAY_SETUP_DTO': 'Holiday Setup',
    'CDL_PAYMENT_STANDING_INSTRUCTION_DEPENDENT_SCENARIO_DTO': 'Dependent Scenario',
    'CDL_PAYMENT_STANDING_INSTRUCTION_FORM_ACCOUNT_DR_DTO': 'From Account (Debit)',
    'CDL_PAYMENT_STANDING_INSTRUCTION_DEPENDENCE_DTO': 'Dependence',
    'CDL_PAYMENT_STANDING_INSTRUCTION_PAYMENT_TYPE_DTO': 'Payment Type',
    'CDL_PAYMENT_STANDING_INSTRUCTION_TASK_STATUS_DTO': 'Task Status',
    'CDL_PAYMENT_STANDING_INSTRUCTION_BENEFICIARY_NAME_DTO': 'Beneficiary Name',
    'CDL_PAYMENT_STANDING_INSTRUCTION_RESET_COUNTER_DTO': 'Reset Counter',
    'CDL_PAYMENT_STANDING_INSTRUCTION_DTO': 'Standing Instruction',
    'CDL_PAYMENT_INSTRUCTION': 'Payment Instruction',

    // Common UI labels
    'CDL_COMMON_ACTION': 'Action',
    'CDL_COMMON_ACTIONS': 'Actions',
    'CDL_COMMON_STATUS': 'Status',
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

export const getPaymentBeneficiaryLabel = (configId) => {
    return PAYMENT_BENEFICIARY_MAPPING[configId] || configId
}

export const getPaymentInstructionLabel = (configId) => {
    return PAYMENT_INSTRUCTION_MAPPING[configId] || configId
}

// Combined mapping for all payment-related labels
export const getPaymentLabel = (configId) => {
    return PAYMENT_BENEFICIARY_MAPPING[configId] 
        || PAYMENT_INSTRUCTION_MAPPING[configId] 
        || configId
}

// Legacy exports for backward compatibility (deprecated - use new names)
export const STANDING_INSTRUCTION_BENEFICIARY_PAYMENT = PAYMENT_BENEFICIARY_MAPPING
export const STANDING_INSTRUCTION_PAYMENT = PAYMENT_INSTRUCTION_MAPPING
export const getStandingInstructionBeneficiaryPaymentLabel = getPaymentBeneficiaryLabel
export const getStandingInstructionPaymentLabel = getPaymentInstructionLabel
