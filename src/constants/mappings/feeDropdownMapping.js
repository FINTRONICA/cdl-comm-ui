// Fee dropdown label mapping from API response
// Maps configId to configValue for easy lookup and usage in components

export const FEE_CATEGORY_LABELS = {
  // Fee Categories
  'CDL_ACCT_OEPN_FEE': 'Account Opening Fee',
  'CDL_UNIT_REG_FEE': 'Unit Registration Fee',
  'CDL_ENGINEER_FEE': 'Engineer Fee',
  'CDL_UNIT_CANCELLATION': 'Unit Cancellation Fee',
  'CDL_ACCOUNT_CLOSURE': 'Account Closure Fee',
  'CDL_ACCOUNT_TRANSFER': 'Account Transfer Fee',
  'CDL_ACCOUNT_MAINTENANCE_CHARGES': 'Account Maintenance Fee',
  'CDL_UNIT_MOD_CHARGES': 'Unit Modification Fee',
  'CDL_CHEQUE_RETURN': 'Cheque Return Fee',
  'CDL_ACCT_STMNT_CHRGE': 'Account Statement Fee',
  'CDL_BLNCE_CNF_CHRGE': 'Balance Confirmation Fee',
  'CDL_ANY_AUDIT_REPORT': 'Any Audit Report Fee',
  'CDL_ANY_CERTIFICATE': 'Any Certificate Fee',
  'CDL_OTHER_SERVICE_NOT_LISTED': 'Others Fee',
  
  // Fee Frequencies
  'CDL_FREQUENCY_ONE_TIME': 'One Time',
  'CDL_FREQUENCY_DAILY': 'Daily',
  'CDL_FREQUENCY_MONTHLY': 'Monthly',
  'CDL_FREQUENCY_QUARTERLY': 'Quarterly',
  'CDL_FREQUENCY_SEMI_ANNUALLY': 'Semi Annual',
  'CDL_FREQUENCY_ANNUALLY': 'Annual',
  'CDL_FREQUENCY_PER_REQUEST': 'Per Request',
  
  // Currencies
  'CDL_CURRENCY_AED': 'AED',
  'CDL_CURRENCY_INR': 'INR',
  'CDL_CURRENCY_USD': 'USD',
  'CDL_CURRENCY_EURO': 'EURO',
  'CDL_CURRENCY_GBP': 'GBP',
  
  // Debit Accounts
  'CDL_GENERAL_FUND_ACC_NO': 'General Fund Account',
  'CDL_RETENTION_ACC_NO': 'Retention Account',
  'CDL_CORPORATE_ACC_NO': 'Corporate Account',
}

export const getFeeCategoryLabel = (configId) => {
  return FEE_CATEGORY_LABELS[configId] || configId
}

// Utility function to get all labels for a specific category
export const getFeeLabelsByCategory = (category) => {
  const categories = {
    'fee_categories': [
      'CDL_ACCT_OEPN_FEE', 'CDL_UNIT_REG_FEE', 'CDL_ENGINEER_FEE',
      'CDL_UNIT_CANCELLATION', 'CDL_ACCOUNT_CLOSURE', 'CDL_ACCOUNT_TRANSFER',
      'CDL_ACCOUNT_MAINTENANCE_CHARGES', 'CDL_UNIT_MOD_CHARGES', 'CDL_CHEQUE_RETURN',
      'CDL_ACCT_STMNT_CHRGE', 'CDL_BLNCE_CNF_CHRGE', 'CDL_ANY_AUDIT_REPORT',
      'CDL_ANY_CERTIFICATE', 'CDL_OTHER_SERVICE_NOT_LISTED'
    ],
    'frequencies': [
      'CDL_FREQUENCY_ONE_TIME', 'CDL_FREQUENCY_DAILY', 'CDL_FREQUENCY_MONTHLY',
      'CDL_FREQUENCY_QUARTERLY', 'CDL_FREQUENCY_SEMI_ANNUALLY', 'CDL_FREQUENCY_ANNUALLY',
      'CDL_FREQUENCY_PER_REQUEST'
    ],
    'currencies': [
      'CDL_CURRENCY_AED', 'CDL_CURRENCY_INR', 'CDL_CURRENCY_USD',
      'CDL_CURRENCY_EURO', 'CDL_CURRENCY_GBP'
    ],
    'debit_accounts': [
      'CDL_GENERAL_FUND_ACC_NO', 'CDL_RETENTION_ACC_NO', 'CDL_CORPORATE_ACC_NO'
    ]
  }

  return categories[category]?.map(configId => ({
    configId,
    label: FEE_CATEGORY_LABELS[configId]
  })) || []
}

// Export the full mapping object for direct access
export default FEE_CATEGORY_LABELS
