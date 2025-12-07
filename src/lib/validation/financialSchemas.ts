import { z } from 'zod'

// Base numerical field validation with 20 character limit
const numericalFieldSchema = z.string()
  .max(20, 'Field must be maximum 20 characters')
  .regex(/^[0-9,]+$/, 'Field must contain only numbers and commas')
  .optional()

// Required numerical field validation
const requiredNumericalFieldSchema = z.string()
  .min(1, 'This field is required')
  .max(20, 'Field must be maximum 20 characters')
  .regex(/^[0-9,]+$/, 'Field must contain only numbers and commas')

// Date field validation
const dateFieldSchema = z.any().optional()

// Project Estimate schema
const projectEstimateSchema = z.object({
  revenue: requiredNumericalFieldSchema,
  constructionCost: requiredNumericalFieldSchema,
  projectManagementExpense: requiredNumericalFieldSchema,
  landCost: requiredNumericalFieldSchema,
  marketingExpense: requiredNumericalFieldSchema,
  date: dateFieldSchema,
})

// Project Actual schema
const projectActualSchema = z.object({
  soldValue: requiredNumericalFieldSchema,
  constructionCost: requiredNumericalFieldSchema,
  infraCost: numericalFieldSchema, // Non-mandatory
  landCost: requiredNumericalFieldSchema,
  projectManagementExpense: requiredNumericalFieldSchema,
  marketingExpense: requiredNumericalFieldSchema,
  date: dateFieldSchema,
})

// Breakdown item schema for financial categories
const breakdownItemSchema = z.object({
  outOfEscrow: numericalFieldSchema,
  withinEscrow: numericalFieldSchema,
  total: numericalFieldSchema, // Calculated field
  exceptionalCapValue: numericalFieldSchema,
})

// Main financial form validation schema
export const financialFormValidationSchema = z.object({
  estimate: projectEstimateSchema,
  actual: projectActualSchema,
  breakdown: z.array(breakdownItemSchema).optional(),
  // Additional fields from the tables
  creditInterestRetention: numericalFieldSchema, // Credit Interest/Profit Earned for Retention A/c
  paymentsFromRetention: numericalFieldSchema, // Payments from retention A/c
  reimbursementsDeveloper: numericalFieldSchema, // Re-Imbursements (Developer)
  unitRegistrationFees: numericalFieldSchema, // Unit Registration Fees
  creditInterestEscrow: numericalFieldSchema, // Credit Interest/Profit Earned from ESCROW A/c
})

export type FinancialFormData = z.infer<typeof financialFormValidationSchema>

// Field validation rules for individual field validation
export const FINANCIAL_FIELD_VALIDATION_RULES = {
  // Estimate fields
  'estimate.revenue': { required: true, maxLength: 20, pattern: /^[0-9,]+$/ },
  'estimate.constructionCost': { required: true, maxLength: 20, pattern: /^[0-9,]+$/ },
  'estimate.projectManagementExpense': { required: true, maxLength: 20, pattern: /^[0-9,]+$/ },
  'estimate.landCost': { required: true, maxLength: 20, pattern: /^[0-9,]+$/ },
  'estimate.marketingExpense': { required: true, maxLength: 20, pattern: /^[0-9,]+$/ },
  'estimate.date': { required: false },
  
  // Actual fields
  'actual.soldValue': { required: true, maxLength: 20, pattern: /^[0-9,]+$/ },
  'actual.constructionCost': { required: true, maxLength: 20, pattern: /^[0-9,]+$/ },
  'actual.infraCost': { required: false, maxLength: 20, pattern: /^[0-9,]+$/ },
  'actual.landCost': { required: true, maxLength: 20, pattern: /^[0-9,]+$/ },
  'actual.projectManagementExpense': { required: true, maxLength: 20, pattern: /^[0-9,]+$/ },
  'actual.marketingExpense': { required: true, maxLength: 20, pattern: /^[0-9,]+$/ },
  'actual.date': { required: false },
  
  // Breakdown fields (all optional)
  'breakdown.outOfEscrow': { required: false, maxLength: 20, pattern: /^[0-9,]+$/ },
  'breakdown.withinEscrow': { required: false, maxLength: 20, pattern: /^[0-9,]+$/ },
  'breakdown.total': { required: false, maxLength: 20, pattern: /^[0-9,]+$/ },
  'breakdown.exceptionalCapValue': { required: false, maxLength: 20, pattern: /^[0-9,]+$/ },
  
  // Additional fields
  'creditInterestRetention': { required: false, maxLength: 20, pattern: /^[0-9,]+$/ },
  'paymentsFromRetention': { required: false, maxLength: 20, pattern: /^[0-9,]+$/ },
  'reimbursementsDeveloper': { required: false, maxLength: 20, pattern: /^[0-9,]+$/ },
  'unitRegistrationFees': { required: false, maxLength: 20, pattern: /^[0-9,]+$/ },
  'creditInterestEscrow': { required: false, maxLength: 20, pattern: /^[0-9,]+$/ },
}

// Individual field validation function
export const validateFinancialField = (
  fieldName: keyof FinancialFormData | string,
  value: string | number | null
): string | null => {
  try {
    // Handle nested field names like 'estimate.revenue'
    const fieldPath = fieldName.split('.')
    let schema: any = financialFormValidationSchema
    
    for (const path of fieldPath) {
      if (schema.shape && schema.shape[path]) {
        schema = schema.shape[path]
      } else {
        return 'Invalid field name'
      }
    }
    
    schema.parse(value)
    return null
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message
    }
    return 'Invalid input'
  }
}
