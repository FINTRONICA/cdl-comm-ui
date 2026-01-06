// // Field validation rules - Single source of truth
// export const FIELD_VALIDATION_RULES = {
//   // Section 1 - Project Details
//   reaId: {
//     required: true, // Auto-generated field
//     maxLength: 50,
//     message: 'Build Partner Asset ID must be less than 50 characters',
//   },
//   reaName: {
//     required: true,
//     maxLength: 100,
//     message: 'Build Partner Asset Name is mandatory',
//   },
//   reaCif: {
//     required: false,
//     message: 'CIF  is optional',
//   },
//   reaManagedBy: {
//     required: true,
//     maxLength: 100,
//     message: 'Build Partner Name is mandatory',
//   },
//   unitReferenceNumber: {
//     required: true,
//     maxLength: 20,
//     pattern: /^[a-zA-Z0-9\s\-_.,()]+$/,
//     message:
//       'Unit Reference Number can only contain alphanumeric characters and special characters',
//   },
//   reaReraNumber: {
//     required: true,
//     maxLength: 20,
//     pattern: /^[a-zA-Z0-9\s\-_.,()]+$/,
//     message:
//       'Build Partner Asset RERA Number can only contain alphanumeric characters and special characters',
//   },
//   unitNumber: {
//     required: true,
//     maxLength: 20,
//     pattern: /^[a-zA-Z0-9\s\-_.,()]+$/,
//     message: 'Unit No. is mandatory (Alpha Numeric special character)',
//   },
//   unitStatus: {
//     required: true,
//     options: [
//       'Opened',
//       'Transfer',
//       'Cancel',
//       'Transfer Joint',
//       'Cancellation under process',
//     ],
//     message: 'Unit Status is mandatory',
//   },

//   // Section 2 - Property Details
//   towerBuildingName: {
//     required: false,
//     maxLength: 50,
//     conditional: {
//       field: 'propertyId',
//       value: '3',
//       message: 'Tower/Building Name is mandatory when Property ID is Unit (3)',
//     },
//   },
//   unitPlotSize: {
//     required: true,
//     maxLength: 20,
//     pattern: /^[a-zA-Z0-9\s\-_.,()]+$/,
//     message: 'Unit/Plot size is mandatory (Alpha Numeric special character)',
//   },
//   propertyId: {
//     required: true,
//     options: ['1', '2', '3'],
//     message: 'Property ID is mandatory',
//   },
//   unitIban: {
//     required: false,
//     maxLength: 50,
//     message: 'Unit IBAN is auto-generated',
//   },
//   unitRegistrationFee: {
//     required: false,
//     maxLength: 10,
//     pattern: /^\d+(\.\d{1,2})?$/,
//     message: 'Unit Registration fee must be a valid number',
//   },
//   nameOfAgent: {
//     required: false,
//     maxLength: 35,
//     message: 'Name of Agent must be less than 35 characters',
//   },
//   agentNationalId: {
//     required: false,
//     maxLength: 10,
//     pattern: /^[a-zA-Z0-9]+$/,
//     message: 'Agent National ID must be alphanumeric',
//   },
//   grossSalePrice: {
//     required: true,
//     maxLength: 15,
//     pattern: /^\d+(\.\d{1,2})?$/,
//     message: 'Gross Sale Price is mandatory',
//   },
//   salePrice: {
//     required: false,
//     maxLength: 15,
//     pattern: /^\d+(\.\d{1,2})?$/,
//     message: 'Sale Price must be a valid number',
//   },
//   vatApplicable: {
//     required: false,
//     message: 'VAT Applicable is optional',
//   },
//   deedNumber: {
//     required: false,
//     maxLength: 15,
//     message: 'Deed No. must be less than 15 characters',
//   },
//   agreementNumber: {
//     required: false,
//     maxLength: 15,
//     message: 'Agreement No./Contract No. must be less than 15 characters',
//   },
//   agreementDate: {
//     required: false,
//     message: 'Agreement Date is optional',
//   },
//   salePurchaseAgreement: {
//     required: false,
//     message: 'Sale Purchase Agreement is optional',
//   },
//   projectPaymentPlan: {
//     required: false,
//     message: 'Build Partner Asset payment Plan is optional',
//   },
//   paymentPlanSelection: {
//     required: false,
//     message: 'Payment Plan is optional',
//   },

//   // Section 3 - Financial Details
//   worldCheck: {
//     required: false,
//     options: ['Yes', 'No'],
//     defaultValue: 'No',
//     message: 'World Check is optional',
//   },
//   amountPaidToDeveloperWithinEscrow: {
//     required: false,
//     maxLength: 15,
//     pattern: /^\d+(\.\d{1,2})?$/,
//     message: 'Amount Paid to Build Partner (INR) must be a valid number',
//   },
//   amountPaidToDeveloperOutOfEscrow: {
//     required: false,
//     maxLength: 15,
//     pattern: /^\d+(\.\d{1,2})?$/,
//     message:
//       'Amount Paid to Build Partner (INR) Out of Escrow must be a valid number',
//   },
//   totalAmountPaid: {
//     required: false,
//     maxLength: 15,
//     pattern: /^\d+(\.\d{1,2})?$/,
//     calculation: {
//       fields: ['grossSalePrice', 'amountPaidToDeveloperOutOfEscrow'],
//       message:
//         'Total Amount Paid must equal Gross Sale Price + Amount Paid to Build Partner Out of Escrow',
//     },
//   },
//   reservationBookingForm: {
//     required: false,
//     message: 'Reservation Booking form is optional',
//   },
//   unitAreaSize: {
//     required: false,
//     maxLength: 15,
//     pattern: /^\d+(\.\d{1,2})?$/,
//     message: 'Unit Area Size must be a valid number',
//   },
//   forfeitAmount: {
//     required: false,
//     maxLength: 15,
//     pattern: /^\d+(\.\d{1,2})?$/,
//     message: 'Forfeit Amount must be a valid number',
//   },
//   refundAmount: {
//     required: false,
//     maxLength: 15,
//     pattern: /^\d+(\.\d{1,2})?$/,
//     message: 'Refund Amount must be a valid number',
//   },
//   mpadditionalRemarks: {
//     required: false,
//     maxLength: 50,
//     message: 'Remarks must be less than 50 characters',
//   },
//   transferredAmount: {
//     required: false,
//     maxLength: 15,
//     pattern: /^\d+(\.\d{1,2})?$/,
//     message: 'Transferred Amount must be a valid number',
//   },
// }

// // Validation function for individual fields
// export const validateField = (fieldName: string, value: any): string | null => {
//   const rule =
//     FIELD_VALIDATION_RULES[fieldName as keyof typeof FIELD_VALIDATION_RULES]
//   if (!rule) return null

//   // Auto-generated fields - always skip validation if empty
//   const autoGeneratedFields = ['reaId', 'unitIban']
//   if (autoGeneratedFields.includes(fieldName)) {
//     if (!value || (typeof value === 'string' && value.trim() === '')) {
//       return null // Auto-generated fields can be empty, no validation error
//     }
//     // If auto-generated field has value, validate format/length but not required
//     if (
//       'maxLength' in rule &&
//       rule.maxLength &&
//       typeof value === 'string' &&
//       value.length > rule.maxLength
//     ) {
//       const message =
//         'message' in rule ? rule.message : 'Maximum length exceeded'
//       return `${message} (max ${rule.maxLength} characters)`
//     }
//     return null // No other validation for auto-generated fields
//   }

//   // Required field validation (for non-auto-generated fields)
//   if (
//     rule.required &&
//     (!value || (typeof value === 'string' && value.trim() === ''))
//   ) {
//     return 'message' in rule ? rule.message : 'This field is required'
//   }

//   // Skip validation for empty optional fields
//   if (
//     !rule.required &&
//     (!value || (typeof value === 'string' && value.trim() === ''))
//   ) {
//     return null
//   }

//   // Max length validation
//   if (
//     'maxLength' in rule &&
//     rule.maxLength &&
//     typeof value === 'string' &&
//     value.length > rule.maxLength
//   ) {
//     const message = 'message' in rule ? rule.message : 'Maximum length exceeded'
//     return `${message} (max ${rule.maxLength} characters)`
//   }

//   // Pattern validation
//   if (
//     'pattern' in rule &&
//     rule.pattern &&
//     typeof value === 'string' &&
//     !rule.pattern.test(value)
//   ) {
//     return 'message' in rule ? rule.message : 'Invalid format'
//   }

//   // Options validation
//   if ('options' in rule && rule.options && !rule.options.includes(value)) {
//     return 'message' in rule ? rule.message : 'Invalid option selected'
//   }

//   return null
// }

// // Validation function for conditional fields
// export const validateConditionalField = (
//   fieldName: string,
//   value: any,
//   formData: any
// ): string | null => {
//   const rule =
//     FIELD_VALIDATION_RULES[fieldName as keyof typeof FIELD_VALIDATION_RULES]
//   if (!rule || !('conditional' in rule) || !rule.conditional) return null

//   const { field, value: requiredValue, message } = rule.conditional

//   if (
//     formData[field] === requiredValue &&
//     (!value || (typeof value === 'string' && value.trim() === ''))
//   ) {
//     return message
//   }

//   return null
// }

// // Validation function for calculated fields
// export const validateCalculatedField = (
//   fieldName: string,
//   value: any,
//   formData: any
// ): string | null => {
//   const rule =
//     FIELD_VALIDATION_RULES[fieldName as keyof typeof FIELD_VALIDATION_RULES]
//   if (!rule || !('calculation' in rule) || !rule.calculation) return null

//   const { fields, message } = rule.calculation

//   const fieldValues = fields.map((field: string) =>
//     parseFloat(formData[field] || '0')
//   )
//   const calculatedTotal = fieldValues.reduce(
//     (sum: number, val: number) => sum + val,
//     0
//   )
//   const currentValue = parseFloat(value || '0')

//   if (Math.abs(currentValue - calculatedTotal) >= 0.01) {
//     return message
//   }

//   return null
// }

// // Complete validation function for all fields
// export const validateAllFields = (
//   formData: any,
//   isSubmissionValidation = false
// ): Record<string, string> => {
//   const errors: Record<string, string> = {}

//   Object.keys(FIELD_VALIDATION_RULES).forEach((fieldName) => {
//     const value = formData[fieldName]
//     const rule =
//       FIELD_VALIDATION_RULES[fieldName as keyof typeof FIELD_VALIDATION_RULES]

//     // Auto-generated fields - handle differently for submission vs real-time validation
//     const autoGeneratedFields = ['reaId', 'unitIban']
//     if (autoGeneratedFields.includes(fieldName)) {
//       // For submission validation, reaId is required but unitIban is optional
//       if (isSubmissionValidation && fieldName === 'reaId') {
//         if (!value || (typeof value === 'string' && value.trim() === '')) {
//           errors[fieldName] = 'Build Partner Asset ID is mandatory'
//           return
//         }
//       }

//       // Only validate format/length if they have values
//       if (value && typeof value === 'string' && value.trim() !== '') {
//         const fieldError = validateField(fieldName, value)
//         if (fieldError) {
//           errors[fieldName] = fieldError
//         }
//       }
//       return // Skip other validation for auto-generated fields
//     }

//     // Required field validation for non-auto-generated fields
//     if (
//       rule.required &&
//       (!value || (typeof value === 'string' && value.trim() === ''))
//     ) {
//       errors[fieldName] =
//         'message' in rule ? rule.message : 'This field is required'
//       return // Don't do other validation if required field is empty
//     }

//     // Basic field validation
//     const fieldError = validateField(fieldName, value)
//     if (fieldError) {
//       errors[fieldName] = fieldError
//     }

//     // Conditional validation
//     const conditionalError = validateConditionalField(
//       fieldName,
//       value,
//       formData
//     )
//     if (conditionalError) {
//       errors[fieldName] = conditionalError
//     }

//     // Calculation validation
//     const calculationError = validateCalculatedField(fieldName, value, formData)
//     if (calculationError) {
//       errors[fieldName] = calculationError
//     }
//   })

//   return errors
// }

// // Get validation rules for React Hook Form
// export const getFieldValidationRules = (fieldName: string) => {
//   const rule =
//     FIELD_VALIDATION_RULES[fieldName as keyof typeof FIELD_VALIDATION_RULES]
//   if (!rule) return {}

//   // Auto-generated fields - never show as required in React Hook Form
//   const autoGeneratedFields = ['reaId', 'unitIban']
//   if (autoGeneratedFields.includes(fieldName)) {
//     return {
//       validate: (value: any) => {
//         const error = validateField(fieldName, value)
//         return error || true
//       },
//     }
//   }

//   return {
//     required: rule.required
//       ? 'message' in rule
//         ? rule.message
//         : 'This field is required'
//       : false,
//     validate: (value: any) => {
//       const error = validateField(fieldName, value)
//       return error || true
//     },
//   }
// }

// // Required fields list (excluding auto-generated fields)
// export const REQUIRED_FIELDS = Object.keys(FIELD_VALIDATION_RULES).filter(
//   (fieldName) => {
//     const rule =
//       FIELD_VALIDATION_RULES[fieldName as keyof typeof FIELD_VALIDATION_RULES]
//     const autoGeneratedFields = ['reaId', 'unitIban']
//     return rule.required && !autoGeneratedFields.includes(fieldName)
//   }
// )

// // Optional fields list
// export const OPTIONAL_FIELDS = Object.keys(FIELD_VALIDATION_RULES).filter(
//   (fieldName) =>
//     !FIELD_VALIDATION_RULES[fieldName as keyof typeof FIELD_VALIDATION_RULES]
//       .required
// )
