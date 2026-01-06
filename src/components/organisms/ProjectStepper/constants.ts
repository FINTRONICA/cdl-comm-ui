// // Step names and configuration
// export const STEPS = [
//   'Build Partner Asset Details',
//   'Documents',
//   'Asset Account Details',
//   'Escrow Fee & Collection Details',
//   'Beneficiary Banking Details',
//   'Payment Plan & Installments',
//   'Asset Financial Overview',
//   'Asset Closure',
//   'Review',
// ] as const

// // Steps that don't require validation
// export const SKIP_VALIDATION_STEPS = [1, 3, 4] as const

// // Account types for Step 2
// export const ACCOUNT_TYPES = [
//   'TRUST',
//   'RETENTION',
//   'SUBCONSTRUCTION',
//   'CORPORATE',
// ] as const

// export const ACCOUNT_LABELS = [
//   'Trust Account',
//   'Retention Account',
//   'Sub Construction Account',
//   'Corporate Account',
// ] as const

// // Default form values
// export const DEFAULT_FORM_VALUES = {
//   // Step 1 defaults
//   reaId: '',
//   reaCif: '',
//   reaName: '',
//   reaLocation: '',
//   reaReraNumber: '',
//   reaRetentionPercent: '',
//   reaAdditionalRetentionPercent: '',
//   reaTotalRetentionPercent: '',
//   reaManagementExpenses: '',
//   reaMarketingExpenses: '',
//   reaRealEstateBrokerExp: null,
//   reaAdvertisementExp: null,
//   reaPercentComplete: '',
//   reaRemarks: '',
//   reaSpecialApproval: '',
//   reaManagedBy: '',
//   reaBackupUser: '',
//   reaTeamLeadName: '',
//   reamprelationshipManagerName: '',
//   reaAssestRelshipManagerName: '',
//   reaLandOwnerName: '',
//   reaConstructionCost: null,
//   reaNoOfUnits: null,
//   status: '',

//   reaConstructionCostCurrencyDTO: {},
//   buildPartnerDTO: {},
//   reaStatusDTO: {},
//   reaTypeDTO: {},
//   reaAccountStatusDTO: {},

//   accounts: [
//     {
//       trustAccountNumber: '',
//       ibanNumber: '',
//       dateOpened: null,
//       accountTitle: '',
//       currency: '',
//     },
//     {
//       trustAccountNumber: '',
//       ibanNumber: '',
//       dateOpened: null,
//       accountTitle: '',
//       currency: 'AED',
//     },
//     {
//       trustAccountNumber: '',
//       ibanNumber: '',
//       dateOpened: null,
//       accountTitle: '',
//       currency: 'AED',
//     },
//     {
//       trustAccountNumber: '',
//       ibanNumber: '',
//       dateOpened: null,
//       accountTitle: '',
//       currency: 'AED',
//     },
//   ],

//   fees: [
//     {
//       feeType: '',
//       frequency: '',
//       debitAmount: '',
//       feeToBeCollected: '',
//       nextRecoveryDate: null,
//       feePercentage: '',
//       amount: '',
//       vatPercentage: '',
//     },
//   ],

//   beneficiaries: [
//     {
//       id: '',
//       transferType: '',
//       name: '',
//       bankName: '',
//       swiftCode: '',
//       routingCode: '',
//       account: '',
//     },
//   ],

//   paymentPlan: [
//     {
//       installmentNumber: 1,
//       installmentPercentage: '',
//       projectCompletionPercentage: '',
//     },
//   ],

//   financialData: {
//     projectEstimatedCost: '',
//     actualCost: '',
//     projectBudget: '',
//   },

//   // Step 8 defaults
//   closureData: {
//     totalIncomeFund: '',
//     totalPayment: '',
//   },
// } as const

// export const VALIDATION_PATTERNS = {
//   PERCENTAGE: /^\d+(\.\d{1,2})?%?$/,
//   AMOUNT: /^\d+(\.\d{1,2})?$/,
//   REQUIRED: (value: any) => !!value || 'This field is required',
// } as const

// export const ERROR_MESSAGES = {
//   REQUIRED: 'This field is required',
//   INVALID_PERCENTAGE: 'Please enter a valid percentage',
//   INVALID_AMOUNT: 'Please enter a valid amount',
//   VALIDATION_FAILED: 'Validation failed',
//   SAVE_FAILED: 'Failed to save step. Please try again.',
//   NO_VALIDATED_ACCOUNTS: 'No validated accounts to save',
//   ACCOUNT_SAVE_FAILED: 'Failed to save bank accounts',
// } as const

// export const SUCCESS_MESSAGES = {
//   STEP_SAVED: 'Step saved successfully!',
//   ACCOUNTS_SAVED: 'Bank accounts saved successfully!',
//   ALL_STEPS_COMPLETED: 'All steps completed successfully!',
// } as const

// export const API_CONFIG = {
//   MAX_RETRIES: 3,
//   TIMEOUT: 30000,
//   VALIDATION_DEBOUNCE: 300,
// } as const

// export const DATE_FORMATS = {
//   DISPLAY: 'DD/MM/YYYY',
//   API: 'YYYY-MM-DD',
// } as const

// export const GRID_CONFIGS = {
//   DEFAULT: { xs: 12, md: 6 },
//   FULL_WIDTH: { xs: 12, md: 12 },
//   QUARTER: { xs: 12, md: 3 },
//   THIRD: { xs: 12, md: 4 },
//   TWO_THIRDS: { xs: 12, md: 8 },
//   COMPACT: { xs: 12, md: 2 },
// } as const

// export const BUTTON_CONFIGS = {
//   PRIMARY: {
//     variant: 'contained' as const,
//     color: 'primary' as const,
//   },
//   SECONDARY: {
//     variant: 'outlined' as const,
//     color: 'primary' as const,
//   },
//   TEXT: {
//     variant: 'text' as const,
//     color: 'primary' as const,
//   },
// } as const

// export const TABLE_CONFIGS = {
//   DEFAULT_ROWS_PER_PAGE: 20,
//   PAGINATION_OPTIONS: [10, 20, 50, 100],
// } as const

// export const FIELD_TYPES = {
//   TEXT: 'text',
//   SELECT: 'select',
//   DATE: 'date',
//   NUMBER: 'number',
//   EMAIL: 'email',
//   PASSWORD: 'password',
// } as const
