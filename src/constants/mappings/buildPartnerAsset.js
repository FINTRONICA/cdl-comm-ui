// Build Partner Asset label mapping from BUILD_PARTNER_ASSET API response
// Maps configId to configValue for easy lookup and usage in components

export const BUILD_PARTNER_ASSET_LABELS = {
  // Main Build Partner Asset Details
  'CDL_BPA_DETAILS': 'Build Partner Asset Details',
  'CDL_BPA_REFID': '',
  'CDL_BPA_REGNO': 'RERA Registration Number',
  'CDL_BPA_NAME': 'Asset Name',
  'CDL_BPA_CLASSIFICATION': 'Asset Classification',
  'CDL_BPA_LOCATION': 'Asset Location',
  'CDL_BPA_CIF': 'Customer Information File (CIF) Number',
  'CDL_BPA_STATUS': 'Asset Status',
  'CDL_BPA_ACC_STATUS': 'Asset Account Status',
  'CDL_BPA_ACC_STATUS_DATE': 'Asset Account Status Date',
  'CDL_BPA_REG_DATE': 'Asset Registration Date',
  'CDL_BPA_EST_DATE': 'Estimated Commencement Date',
  'CDL_BPA_EST_COMPLETION_DATE': 'Estimated Completion Date',
  'CDL_BPA_PRIMARY_RETENTION': 'Primary Retention(%)',
  'CDL_BPA_SECONDARY_RETENTION': 'Supplementary Retention(%)',
  'CDL_BPA_AGG_RETENTION': 'Aggregate Retention(%)',
  'CDL_BPA_RETENTION_START_DATE': 'Retention Start Date',
  'CDL_BPA_MGMT_EXPENSES': 'Asset Management Expenses(%)',
  'CDL_BPA_MARKETING_COST': 'Marketing Costs(%)',
  'CDL_BPA_BROK_FEES': 'Brokerage Fees',
  'CDL_BPA_ADVTG_COST': 'Advertising Costs',
  'CDL_BPA_LANDOWNER_NAME': 'Landowner Name',
  'CDL_BPA_ASST_COMP_PER': 'Asset Completion Percentage',
  'CDL_BPA_TRAN_CUR': 'Transaction Currency',
  'CDL_BPA_ACT_COST': 'Actual Build Cost',
  'CDL_BPA_TOTAL_UNIT': 'Total Units',
  'CDL_BPA_ADD_NOTES': 'Additional Notes',

  // Special Regulatory and Management
  'CDL_BPA_SP_REG_APPROVAL': 'Special Regulatory Approval',
  'CDL_BPA_RES_PAYMENT_TYPE': 'Restricted Payment Type',
  'CDL_BPA_ASS_MANAGER': 'Asset Manager',
  'CDL_BPA_BACKUP_MANAGER': 'Backup Manager',
  'CDL_BPA_RM': 'Relationship Manager',
  'CDL_BPA_ARM': 'Assistant RM',
  'CDL_BPA_TL': 'Team Lead Name',
  'CDL_BPA_DOC_VALIDITY': 'Document Validity Date',

  // Account Details
  'CDL_BPA_ACC_NO': 'Trust Account Number',
  'CDL_BPA_ACC_IBAN': 'IBAN',
  'CDL_BPA_ACC_OPENDATE': 'Account Opening Date',
  'CDL_BPA_ACC_NAME': 'Account Name',
  'CDL_BPA_ACC_CUR': 'Account Currency',
  'CDL_BPA_ACC_RETENTION': 'Retention Account',
  'CDL_BPA_ACC_SUBCONS': 'Sub-Construction Account',
  'CDL_BPA_ACC_CORP': 'Corporate Account',
  'CDL_BPA_ACC_VALIDATION': 'Account Validation',

  // Beneficiary Details
  'CDL_BPA_BENE_INFO': 'Beneficiary Banking Details',
  'CDL_BPA_BENE_EXP': 'Expense Category',
  'CDL_BPA_BENE_TRANSFER': 'Transfer Method',
  'CDL_BPA_BENE_REFID': 'Beneficiary Reference ID',
  'CDL_BPA_BENE_NAME': 'Beneficiary Full Name',
  'CDL_BPA_BENE_BANK': 'Bank Name',
  'CDL_BPA_BENE_ACC': 'Bank Account Number',
  'CDL_BPA_BENE_IBAN': 'Beneficiary IBAN',
  'CDL_BPA_BENE_BIC': 'Beneficiary Swift',
  'CDL_BPA_BENE_ROUTING': 'Beneficiary Routing Code',
  'CDL_BPA_BENE_SWIFT': 'Validate Swift',
  'CDL_BPA_ACC_VAL': 'Validate Account',
  'CDL_BPA_BENE_DOC_TEMPLATE': 'Download Template',
  'CDL_BPA_BENE_UPLOAD_BENE': 'Upload Beneficiary Details',

  // Payment Plan
  'CDL_BPA_PAYMENT_PLAN': 'Payment Plan',
  'CDL_BPA_ADD_INSTALLMENT': 'Add Installment',
  'CDL_BPA_INSTALLMENT_NO': 'Installment Number',
  'CDL_BPA_INSTALLMENT_PER': 'Installment Percentage',
  'CDL_BPA_PROJ_COM_PER': 'Project Completion Percentage',

  // Project Financial
  'CDL_BPA_FINANCIAL': 'Project Financial',
  'CDL_BPA_EST_ASS_COST': 'Project Estimate Cost',
  'CDL_BPA_TOTAL_REVENUE': 'Revenue',
  'CDL_BPA_BUILD_COST': 'Construction Cost',
  'CDL_BPA_ASST_MGMT_EXP': 'Project Management Expense',
  'CDL_BPA_LAND_ACQ_COST': 'Land Cost',
  'CDL_BPA_MARK_EXP': 'Marketing Expense',
  'CDL_BPA_TRAN_DATE': 'Date',
  'CDL_BPA_ACTUAL_ASSEST_COST': 'Project Actual Cost',
  'CDL_BPA_TOTAL_UNIT_SOLD': 'Sold Value',
  'CDL_BPA_INFRA_COST': 'Infrastructure Cost',
  'CDL_BPA_CASH_FROM_UNIT': 'Cash Received from the Unit Holder',
  'CDL_BPA_FUND_OUT_ESCROW': 'Out Of Escrow',
  'CDL_BPA_FUND_WITHIN_ESCROW': 'Within Escrow',
  'CDL_BPA_TOTAL_AMOUNT': 'Total',
  'CDL_BPA_EXCEP_CAP_VAL': 'Exceptional Cap Value',
  'CDL_BPA_MORTGAGE_AMT': 'Mortgage',
  'CDL_BPA_VAT_AMT': 'Vat Payment',
  'CDL_BPA_OQOOD_FEES': 'Ogood',
  'CDL_BPA_REFUND_AMT': 'Refund',
  'CDL_BPA_RETEN_ACC_BAL': 'Balance in Retention A/C',
  'CDL_BPA_TRUST_ACC_BAL': 'Balance in Trust A/C',
  'CDL_BPA_SUBCONS_ACC_BAL': 'Balance in Subconstruction A/C',
  'CDL_BPA_TECH_FEES': 'Techincal Fees',
  'CDL_BPA_UNALLO_COST': 'Unidentified Cost',
  'CDL_BPA_LOAN': 'Loans/Installments',
  'CDL_BPA_OTHER_EXP': 'Others',
  'CDL_BPA_TRANS_AMT': 'Transferred',
  'CDL_BPA_FORFEIT_AMT': 'Forfeited',
  'CDL_BPA_DEV_EQUITY_CONT': 'Developers Equity',
  'CDL_BPA_AMANAT_FUND': 'Amanat Fund',
  'CDL_BPA_OTHER_WITHDRAW': 'Others Withdrawal',
  'CDL_BPA_OQOOD_OTHER_PMT': 'Ogood/Others fees and Payments',
  'CDL_BPA_VAT_DEPOSIT_AMT': 'Vat Deposit',
  'CDL_BPA_PROFIT_ERND': 'Credit Interest/ Profit earned for retention A',
  'CDL_BPA_REIMB_AMT': 'Re-imbursement',
  'CDL_BPA_PMT_FRM_RETENTION': 'Payment From Retention A/C',
  'CDL_BPA_CAP_VAT_AMT': 'VAT Capped',
  'CDL_BPA_INT_ERND_ESCROW': 'Credit Interest/ Profit earned for escrow A/C',
  'CDL_BPA_CLOSURE': 'Project Closure',
  'CDL_BPA_TOTAL_AMT_RECEIVED': 'Total Income Fund',
  'CDL_BPA_TOTAL_DIS_PMT': 'Total Payment',
  'CDL_BPA_DOC_ACTION': 'Available Actions',
}

// Utility function to get label by configId
export const getBuildPartnerAssetLabel = (configId) => {
  return BUILD_PARTNER_ASSET_LABELS[configId] || configId
}

// Utility function to get all labels for a specific category
export const getBuildPartnerAssetLabelsByCategory = (category) => {
  const categories = {
    'details': [
      'CDL_BPA_DETAILS', 'CDL_BPA_REFID', 'CDL_BPA_REGNO', 'CDL_BPA_NAME',
      'CDL_BPA_CLASSIFICATION', 'CDL_BPA_LOCATION', 'CDL_BPA_CIF',
      'CDL_BPA_STATUS', 'CDL_BPA_ACC_STATUS', 'CDL_BPA_ACC_STATUS_DATE',
      'CDL_BPA_REG_DATE', 'CDL_BPA_EST_DATE', 'CDL_BPA_EST_COMPLETION_DATE'
    ],
    'retention': [
      'CDL_BPA_PRIMARY_RETENTION', 'CDL_BPA_SECONDARY_RETENTION',
      'CDL_BPA_AGG_RETENTION', 'CDL_BPA_RETENTION_START_DATE'
    ],
    'expenses': [
      'CDL_BPA_MGMT_EXPENSES', 'CDL_BPA_MARKETING_COST', 'CDL_BPA_BROK_FEES',
      'CDL_BPA_ADVTG_COST'
    ],
    'management': [
      'CDL_BPA_SP_REG_APPROVAL', 'CDL_BPA_RES_PAYMENT_TYPE', 'CDL_BPA_ASS_MANAGER',
      'CDL_BPA_BACKUP_MANAGER', 'CDL_BPA_RM', 'CDL_BPA_ARM', 'CDL_BPA_TL',
      'CDL_BPA_DOC_VALIDITY', 'CDL_BPA_DOC_ACTION'
    ],
    'account': [
      'CDL_BPA_ACC_NO', 'CDL_BPA_ACC_IBAN', 'CDL_BPA_ACC_OPENDATE',
      'CDL_BPA_ACC_NAME', 'CDL_BPA_ACC_CUR', 'CDL_BPA_ACC_RETENTION',
      'CDL_BPA_ACC_SUBCONS', 'CDL_BPA_ACC_CORP', 'CDL_BPA_ACC_VALIDATION'
    ],
    'beneficiary': [
      'CDL_BPA_BENE_INFO', 'CDL_BPA_BENE_EXP', 'CDL_BPA_BENE_TRANSFER',
      'CDL_BPA_BENE_REFID', 'CDL_BPA_BENE_NAME', 'CDL_BPA_BENE_BANK',
      'CDL_BPA_BENE_ACC', 'CDL_BPA_BENE_IBAN', 'CDL_BPA_BENE_BIC',
      'CDL_BPA_BENE_ROUTING', 'CDL_BPA_BENE_SWIFT', 'CDL_BPA_ACC_VAL',
      'CDL_BPA_BENE_DOC_TEMPLATE', 'CDL_BPA_BENE_UPLOAD_BENE'
    ],
    'payment_plan': [
      'CDL_BPA_PAYMENT_PLAN', 'CDL_BPA_ADD_INSTALLMENT', 'CDL_BPA_INSTALLMENT_NO',
      'CDL_BPA_INSTALLMENT_PER', 'CDL_BPA_PROJ_COM_PER'
    ],
    'financial': [
      'CDL_BPA_FINANCIAL', 'CDL_BPA_EST_ASS_COST', 'CDL_BPA_TOTAL_REVENUE',
      'CDL_BPA_BUILD_COST', 'CDL_BPA_ASST_MGMT_EXP', 'CDL_BPA_LAND_ACQ_COST',
      'CDL_BPA_MARK_EXP', 'CDL_BPA_TRAN_DATE', 'CDL_BPA_ACTUAL_ASSEST_COST',
      'CDL_BPA_TOTAL_UNIT_SOLD', 'CDL_BPA_INFRA_COST', 'CDL_BPA_CASH_FROM_UNIT',
      'CDL_BPA_FUND_OUT_ESCROW', 'CDL_BPA_FUND_WITHIN_ESCROW', 'CDL_BPA_TOTAL_AMOUNT'
    ],
    'costs': [
      'CDL_BPA_EXCEP_CAP_VAL', 'CDL_BPA_MORTGAGE_AMT', 'CDL_BPA_VAT_AMT',
      'CDL_BPA_OQOOD_FEES', 'CDL_BPA_REFUND_AMT', 'CDL_BPA_TECH_FEES',
      'CDL_BPA_UNALLO_COST', 'CDL_BPA_LOAN', 'CDL_BPA_OTHER_EXP'
    ],
    'balances': [
      'CDL_BPA_RETEN_ACC_BAL', 'CDL_BPA_TRUST_ACC_BAL', 'CDL_BPA_SUBCONS_ACC_BAL'
    ],
    'transactions': [
      'CDL_BPA_TRANS_AMT', 'CDL_BPA_FORFEIT_AMT', 'CDL_BPA_DEV_EQUITY_CONT',
      'CDL_BPA_AMANAT_FUND', 'CDL_BPA_OTHER_WITHDRAW', 'CDL_BPA_OQOOD_OTHER_PMT',
      'CDL_BPA_VAT_DEPOSIT_AMT', 'CDL_BPA_PROFIT_ERND', 'CDL_BPA_REIMB_AMT',
      'CDL_BPA_PMT_FRM_RETENTION', 'CDL_BPA_CAP_VAT_AMT', 'CDL_BPA_INT_ERND_ESCROW'
    ],
    'closure': [
      'CDL_BPA_CLOSURE', 'CDL_BPA_TOTAL_AMT_RECEIVED', 'CDL_BPA_TOTAL_DIS_PMT'
    ]
  }

  return categories[category]?.map(configId => ({
    configId,
    label: BUILD_PARTNER_ASSET_LABELS[configId]
  })) || []
}

// Export the full mapping object for direct access
export default BUILD_PARTNER_ASSET_LABELS
