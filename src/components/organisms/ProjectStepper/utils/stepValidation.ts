// /**
//  * Step-specific validation utilities for ProjectStepper
//  * Ensures only current step fields are validated, not all form fields
//  */

// // Removed validateStep6Fields import - now using React Hook Form validation

// // Field mappings for each step
// export const STEP_FIELD_MAPPINGS = {
//   0: [ // Step 1: Build Partner Asset Details
//     'reaId',
//     'reaCif', 
//     'reaName',
//     'reaLocation',
//     'reaReraNumber',
//     'reaStartDate',
//     'reaCompletionDate',
//     'reaRetentionPercent',
//     'reaAdditionalRetentionPercent',
//     'reaTotalRetentionPercent',
//     'reaRetentionEffectiveDate',
//     'reaManagementExpenses',
//     'reaMarketingExpenses',
//     'reaRealEstateBrokerExp',
//     'reaAdvertisementExp',
//     'reaPercentComplete',
//     'reaRemarks',
//     'reaSpecialApproval',
//     'reaManagedBy',
//     'reaBackupUser',
//     'reaTeamLeadName',
//     'reamprelationshipManagerName',
//     'reaAssestRelshipManagerName',
//     'reaLandOwnerName',
//     'reaConstructionCost',
//     'reaNoOfUnits',
//     'buildPartnerDTO',
//     'buildPartnerDTO.id',
//     'buildPartnerDTO.bpCifrera',
//     'buildPartnerDTO.bpName',
//     'buildPartnerDTO.bpMasterName',
//     'reaStatusDTO',
//     'reaTypeDTO',
//     'reaAccountStatusDTO',
//     'reaConstructionCostCurrencyDTO',
//     'reaAccoutStatusDate',
//     'reaRegistrationDate',
//     'reaAccStatusDate',
//     'reaBlockPaymentTypeDTO'
//   ],
//   1: [ // Step 2: Documents - No validation needed
//     // Documents are handled by DocumentUploadFactory
//   ],
//   2: [ // Step 3: Account Details
//     // Trust Account (Mandatory)
//     'trustAccountNumber',
//     'trustAccountIban',
//     'trustAccountOpenedDate',
//     'trustAccountTitle',
//     // Retention Account (Mandatory)
//     'retentionAccountNumber',
//     'retentionAccountIban',
//     'retentionAccountOpenedDate',
//     'retentionAccountTitle',
//     // Sub Construction Account (Optional)
//     'subConstructionAccountNumber',
//     'subConstructionAccountIban',
//     'subConstructionAccountOpenedDate',
//     'subConstructionAccountTitle',
//     // Corporate Account (Optional)
//     'corporateAccountNumber',
//     'corporateAccountIban',
//     'corporateAccountOpenedDate',
//     'corporateAccountTitle',
//     // Currency
//     'accountCurrency'
//   ],
//   3: [ // Step 4: Fee Details
//     // Fee Category (Mandatory)
//     'feeType',
//     // Frequency (Mandatory)
//     'frequency',
//     // Currency (Optional)
//     'currency',
//     // Debit Account (Mandatory)
//     'debitAccount',
//     // Fee Collection Date (Mandatory)
//     'feeToBeCollected',
//     // Next Recovery Date (Optional)
//     'nextRecoveryDate',
//     // Amount (Mandatory)
//     'debitAmount',
//     // Fee Percentage (Optional)
//     'feePercentage',
//     // VAT Percentage (Optional)
//     'vatPercentage',
//     // Total Amount (Optional)
//     'totalAmount'
//   ],
//   4: [ // Step 5: Beneficiary Details - No validation needed
//     // Beneficiaries are handled by Step4 component
//   ],
//   5: [ // Step 6: Payment Plan
//     'paymentPlan'
//   ],
//   6: [ // Step 7: Financial Overview
//     // Project Estimate Fields
//     'estimate.revenue',
//     'estimate.constructionCost',
//     'estimate.projectManagementExpense',
//     'estimate.landCost',
//     'estimate.marketingExpense',
//     'estimate.date',
//     // Project Actual Fields
//     'actual.soldValue',
//     'actual.constructionCost',
//     'actual.infraCost',
//     'actual.landCost',
//     'actual.projectManagementExpense',
//     'actual.marketingExpense',
//     'actual.date',
//     // Additional Financial Fields
//     'creditInterestRetention',
//     'paymentsFromRetention',
//     'reimbursementsDeveloper',
//     'unitRegistrationFees',
//     'creditInterestEscrow',
//     // Breakdown Fields (for all 30+ categories)
//     'breakdown'
//   ],
//   7: [ // Step 8: Project Closure
//     'closureData.totalIncomeFund',
//     'closureData.totalPayment'
//   ],
//   8: [ // Step 9: Review - No validation needed
//     // Review step shows all data
//   ]
// } as const

// /**
//  * Get fields that should be validated for a specific step
//  */
// export const getFieldsForStep = (stepIndex: number): readonly string[] => {
//   return STEP_FIELD_MAPPINGS[stepIndex as keyof typeof STEP_FIELD_MAPPINGS] || []
// }

// /**
//  * Check if a step requires validation
//  */
// export const stepRequiresValidation = (stepIndex: number): boolean => {
//   const fields = getFieldsForStep(stepIndex)
//   return fields.length > 0
// }

// /**
//  * Validate only the current step's fields
//  */
// export const validateCurrentStep = async (
//   methods: any,
//   activeStep: number
// ): Promise<{ isValid: boolean; errors: any }> => {
//   try {
//     // Special handling for Step 6 (Financial Overview)
//     if (activeStep === 6) {
//       const fieldsToValidate = getFieldsForStep(activeStep)
//       // Use React Hook Form's trigger method for Step 6 validation
//       const isValid = await methods.trigger(fieldsToValidate as string[])
//       const errors = methods.formState.errors
      
//       // If validation failed, ensure fields show their errors by triggering validation again
//       if (!isValid) {
//         // Trigger validation again to ensure errors are properly set
//         await methods.trigger(fieldsToValidate as string[])
//       }
      
//       return { isValid, errors }
//     }

//     const fieldsToValidate = getFieldsForStep(activeStep)
    
//     // If no fields to validate for this step, consider it valid
//     if (fieldsToValidate.length === 0) {
//       return { isValid: true, errors: {} }
//     }

//     // Validate only the current step's fields
//     // Cast to string[] for React Hook Form's trigger method
//     const isValid = await methods.trigger(fieldsToValidate as string[])
//     const errors = methods.formState.errors

//     return { isValid, errors }
//   } catch (error) {
//     console.error('Step validation error:', error)
//     return { isValid: false, errors: { general: 'Validation failed' } }
//   }
// }

// /**
//  * Get validation errors for current step only
//  */
// export const getCurrentStepErrors = (methods: any, activeStep: number) => {
//   const allErrors = methods.formState.errors
//   const currentStepFields = getFieldsForStep(activeStep)
  
//   const stepErrors: any = {}
//   currentStepFields.forEach(field => {
//     if (allErrors[field]) {
//       stepErrors[field] = allErrors[field]
//     }
//   })
  
//   return stepErrors
// }

// /**
//  * Check if current step has any validation errors
//  */
// export const hasCurrentStepErrors = (methods: any, activeStep: number): boolean => {
//   const stepErrors = getCurrentStepErrors(methods, activeStep)
//   return Object.keys(stepErrors).length > 0
// }
