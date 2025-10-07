// Step names and configuration
export const STEPS = [
  'Build Partner Assest Details',
  'Documents',
  'Account',
  'Fee Details',
  'Beneficiary Details',
  'Payment Plan',
  'Financial',
  'Project Closure',
  'Review',
] as const

// Steps that don't require validation
export const SKIP_VALIDATION_STEPS = [1, 3, 4] as const

// Account types for Step 2
export const ACCOUNT_TYPES = ['TRUST', 'RETENTION', 'SUB_CONSTRUCTION', 'CORPORATE'] as const

export const ACCOUNT_LABELS = [
  'Trust Account Number*',
  'Retention Account*',
  'Sub Construction Account',
  'Corporate Account Number',
] as const

// Default form values
export const DEFAULT_FORM_VALUES = {
  // Step 1 defaults
  reaId: '',
  reaCif: '',
  reaName: '',
  reaLocation: '',
  reaReraNumber: '',
  reaRetentionPercent: '5.00',
  reaAdditionalRetentionPercent: '8.00',
  reaTotalRetentionPercent: '13.00',
  reaManagementExpenses: '5.00',
  reaMarketingExpenses: '10.00',
  reaRealEstateBrokerExp: 0,
  reaAdvertisementExp: 0,
  reaPercentComplete: '',
  reaRemarks: '',
  reaSpecialApproval: '',
  reaManagedBy: '',
  reaBackupUser: '',
  reaTeamLeadName: '',
  reaRelationshipManagerName: '',
  reaAssestRelshipManagerName: '',
  reaLandOwnerName: '',
  reaConstructionCost: 0,
  reaNoOfUnits: 0,
  status: 'ACTIVE',
  
  // DTO defaults
  reaConstructionCostCurrencyDTO: { id: 32 },
  buildPartnerDTO: { id: 501 },
  reaStatusDTO: { id: 53 },
  reaTypeDTO: { id: 51 },
  reaAccountStatusDTO: { id: 55 },
  
  // Step 2 defaults
  accounts: [
    {
      trustAccountNumber: '',
      ibanNumber: '',
      dateOpened: null,
      accountTitle: '',
      currency: 'AED',
    },
  ],
  
  // Step 3 defaults
  fees: [
    {
      feeType: '',
      frequency: '',
      debitAmount: '',
      feeToBeCollected: '',
      nextRecoveryDate: null,
      feePercentage: '',
      amount: '',
      vatPercentage: '',
    },
  ],
  
  // Step 4 defaults
  beneficiaries: [
    {
      id: '',
      transferType: '',
      name: '',
      bankName: '',
      swiftCode: '',
      routingCode: '',
      account: '',
    },
  ],
  
  // Step 5 defaults
  paymentPlan: [
    {
      installmentNumber: 1,
      installmentPercentage: '',
      projectCompletionPercentage: '',
    },
  ],
  
  // Step 6 defaults
  financialData: {
    projectEstimatedCost: '',
    actualCost: '',
    projectBudget: '',
  },
} as const

// Validation patterns
export const VALIDATION_PATTERNS = {
  PERCENTAGE: /^\d+(\.\d{1,2})?%?$/,
  AMOUNT: /^\d+(\.\d{1,2})?$/,
  REQUIRED: (value: any) => !!value || 'This field is required',
} as const

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_PERCENTAGE: 'Please enter a valid percentage',
  INVALID_AMOUNT: 'Please enter a valid amount',
  VALIDATION_FAILED: 'Validation failed',
  SAVE_FAILED: 'Failed to save step. Please try again.',
  NO_VALIDATED_ACCOUNTS: 'No validated accounts to save',
  ACCOUNT_SAVE_FAILED: 'Failed to save bank accounts',
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  STEP_SAVED: 'Step saved successfully!',
  ACCOUNTS_SAVED: 'Bank accounts saved successfully!',
  ALL_STEPS_COMPLETED: 'All steps completed successfully!',
} as const

// API endpoints and configurations
export const API_CONFIG = {
  MAX_RETRIES: 3,
  TIMEOUT: 30000,
  VALIDATION_DEBOUNCE: 300,
} as const

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
} as const

// Grid configurations
export const GRID_CONFIGS = {
  DEFAULT: { xs: 12, md: 6 },
  FULL_WIDTH: { xs: 12, md: 12 },
  QUARTER: { xs: 12, md: 3 },
  THIRD: { xs: 12, md: 4 },
  TWO_THIRDS: { xs: 12, md: 8 },
  COMPACT: { xs: 12, md: 2 },
} as const

// Button configurations
export const BUTTON_CONFIGS = {
  PRIMARY: {
    variant: 'contained' as const,
    color: 'primary' as const,
  },
  SECONDARY: {
    variant: 'outlined' as const,
    color: 'primary' as const,
  },
  TEXT: {
    variant: 'text' as const,
    color: 'primary' as const,
  },
} as const

// Table configurations
export const TABLE_CONFIGS = {
  DEFAULT_ROWS_PER_PAGE: 20,
  PAGINATION_OPTIONS: [10, 20, 50, 100],
} as const

// Form field types
export const FIELD_TYPES = {
  TEXT: 'text',
  SELECT: 'select',
  DATE: 'date',
  NUMBER: 'number',
  EMAIL: 'email',
  PASSWORD: 'password',
} as const
