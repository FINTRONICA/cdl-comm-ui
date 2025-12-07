import { z } from 'zod'

// Standing Instruction Beneficiary Step 1: Basic Details Schema
export const StandingInstructionBeneficiaryStep1Schema = z.object({
  // Beneficiary Account Number - mandatory field
  beneficiaryAccountNumber: z
    .string()
    .min(1, 'Beneficiary Account Number is required')
    .max(50, 'Account Number must be 50 characters or less'),

  // Beneficiary Bank IFSC Code - mandatory
  beneficiaryBankIfscCode: z
    .string()
    .min(1, 'Beneficiary Bank IFSC Code is required')
    .max(20, 'IFSC Code must be 20 characters or less'),

  // Credit Amount Cap - mandatory
  creditAmountCap: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return isNaN(parsed) ? 0 : parsed
      }
      return typeof val === 'number' ? val : 0
    },
    z.number().min(0, 'Credit Amount Cap must be 0 or greater')
  ),

  // Credit Amount - mandatory
  creditAmount: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return isNaN(parsed) ? 0 : parsed
      }
      return typeof val === 'number' ? val : 0
    },
    z.number().min(0, 'Credit Amount must be 0 or greater')
  ),

  // Transfer Priority Level - mandatory
  transferPriorityLevel: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const parsed = parseInt(val)
        return isNaN(parsed) ? 0 : parsed
      }
      return typeof val === 'number' ? val : 0
    },
    z.number().int().min(0, 'Transfer Priority Level must be 0 or greater')
  ),

  // Credit Share Percentage - mandatory
  creditSharePercentage: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return isNaN(parsed) ? 0 : parsed
      }
      return typeof val === 'number' ? val : 0
    },
    z.number().min(0, 'Credit Share Percentage must be 0 or greater').max(100, 'Credit Share Percentage must be 100 or less')
  ),

  // Currency Code - mandatory
  currencyCode: z
    .string()
    .min(1, 'Currency Code is required')
    .max(10, 'Currency Code must be 10 characters or less'),

  // Payment Mode Code - mandatory
  paymentModeCode: z
    .string()
    .min(1, 'Payment Mode Code is required')
    .max(20, 'Payment Mode Code must be 20 characters or less'),

  // DTO fields - optional, can be ID or full object
  beneficiaryNameDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  paymentModeDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  currencyDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  standingInstructionDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  // System fields
  enabled: z.boolean().optional().default(true),
  deleted: z.boolean().optional().default(false),
})

// Standing Instruction Beneficiary Step 2: Documents Schema (Optional)
export const StandingInstructionBeneficiaryStep2Schema = z.object({
  documents: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Document name is required'),
        size: z.number(),
        type: z.string(),
        uploadDate: z.date(),
        status: z.enum(['uploading', 'completed', 'error', 'failed']),
        progress: z.number().optional(),
        file: z.any().optional(),
        url: z.string().optional(),
        classification: z.string().optional(),
      })
    )
    .optional()
    .default([]),
})

// Standing Instruction Beneficiary Step 3: Review Schema
export const StandingInstructionBeneficiaryStep3Schema = z.object({
  termsAccepted: z.boolean().optional(),
  dataAccuracyConfirmed: z.boolean().optional(),
  reviewNotes: z
    .string()
    .max(1000, 'Review notes must be 1000 characters or less')
    .optional()
    .or(z.literal('')),
})

// Combined schema for all steps
export const StandingInstructionBeneficiaryStepperSchemas = {
  step1: StandingInstructionBeneficiaryStep1Schema,
  step2: StandingInstructionBeneficiaryStep2Schema,
  step3: StandingInstructionBeneficiaryStep3Schema,
} as const

// Helper function to get step schema
export const getStandingInstructionBeneficiaryStepSchema = (stepNumber: number) => {
  const stepKeys = ['step1', 'step2', 'step3'] as const
  const stepKey = stepKeys[stepNumber]
  return stepKey ? StandingInstructionBeneficiaryStepperSchemas[stepKey] : null
}

// Helper to validate only step-specific data
export const validateStandingInstructionBeneficiaryStepData = (stepNumber: number, data: unknown) => {
  const schema = getStandingInstructionBeneficiaryStepSchema(stepNumber)
  if (!schema) {
    return { success: true, data, errors: [] }
  }

  // Extract only the fields that belong to this step's schema
  const stepFields = Object.keys(schema.shape)
  const stepData: Record<string, unknown> = {}
  const dataObj = data as Record<string, unknown>

  stepFields.forEach((field) => {
    if (field in dataObj) {
      stepData[field] = dataObj[field]
    }
  })

  // Validate only the step-specific data
  const result = schema.safeParse(stepData)

  return result
}

// Helper function to get step validation key
export function getStandingInstructionBeneficiaryStepValidationKey(
  step: number
): keyof typeof StandingInstructionBeneficiaryStepperSchemas {
  const stepKeys: Array<keyof typeof StandingInstructionBeneficiaryStepperSchemas> = [
    'step1',
    'step2',
    'step3',
  ]
  return stepKeys[step] || 'step1'
}

// Validation helper function for individual field
export const validateStandingInstructionBeneficiaryField = (
  stepNumber: number,
  fieldName: string,
  value: unknown
): string | true => {
  try {
    const schema = getStandingInstructionBeneficiaryStepSchema(stepNumber)
    if (!schema) return true

    // Handle nested field paths
    if (fieldName.includes('[') || fieldName.includes('.')) {
      return true
    }

    // Get the specific field schema
    const fieldSchema = (schema.shape as Record<string, z.ZodTypeAny>)[fieldName]
    if (!fieldSchema) return true

    // Handle empty values for required fields
    if (value === '' || value === null || value === undefined) {
      // Check if field is required by trying to parse empty value
      const emptyResult = fieldSchema.safeParse(value)
      if (!emptyResult.success) {
        const error = emptyResult.error.issues[0]
        return error?.message || 'This field is required'
      }
    }

    // For number fields, handle string inputs
    if (typeof value === 'string' && (fieldName.includes('Amount') || fieldName.includes('Level') || fieldName.includes('Percentage'))) {
      const numValue = fieldName.includes('Level') ? parseInt(value) : parseFloat(value)
      if (isNaN(numValue)) {
        return 'Please enter a valid number'
      }
      const result = fieldSchema.safeParse(numValue)
      if (!result.success) {
        const error = result.error.issues[0]
        return error?.message || 'Invalid value'
      }
      return true
    }

    // Validate using safeParse
    const result = fieldSchema.safeParse(value)
    if (!result.success) {
      const error = result.error.issues[0]
      return error?.message || 'Invalid value'
    }

    return true
  } catch (error) {
    console.error(`[Validation Error] ${fieldName}:`, error)
    return 'Validation failed'
  }
}

// Type exports for TypeScript inference
export type StandingInstructionBeneficiaryStep1Data = z.infer<typeof StandingInstructionBeneficiaryStep1Schema>
export type StandingInstructionBeneficiaryStep2Data = z.infer<typeof StandingInstructionBeneficiaryStep2Schema>
export type StandingInstructionBeneficiaryStep3Data = z.infer<typeof StandingInstructionBeneficiaryStep3Schema>

// Combined type for all steps
export type StandingInstructionBeneficiaryStepperData = {
  step1: StandingInstructionBeneficiaryStep1Data
  step2: StandingInstructionBeneficiaryStep2Data
  step3: StandingInstructionBeneficiaryStep3Data
}

