import { z } from 'zod'

// Standing Instruction Step 1: Basic Details Schema
export const StandingInstructionStep1Schema = z.object({
  // Standing Instruction Reference Number - mandatory field
  standingInstructionReferenceNumber: z
    .string()
    .min(1, 'Standing Instruction Reference Number is required')
    .max(100, 'Reference Number must be 100 characters or less'),

  // Client Full Name - mandatory
  clientFullName: z
    .string()
    .min(1, 'Client Full Name is required')
    .max(200, 'Client Full Name must be 200 characters or less'),

  // Debit Amount Cap - mandatory
  debitAmountCap: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return isNaN(parsed) ? 0 : parsed
      }
      return typeof val === 'number' ? val : 0
    },
    z.number().min(0, 'Debit Amount Cap must be 0 or greater')
  ),

  // Debit Amount - mandatory
  debitAmount: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return isNaN(parsed) ? 0 : parsed
      }
      return typeof val === 'number' ? val : 0
    },
    z.number().min(0, 'Debit Amount must be 0 or greater')
  ),

  // Minimum Balance Amount - mandatory
  minimumBalanceAmount: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return isNaN(parsed) ? 0 : parsed
      }
      return typeof val === 'number' ? val : 0
    },
    z.number().min(0, 'Minimum Balance Amount must be 0 or greater')
  ),

  // Threshold Amount - mandatory
  thresholdAmount: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return isNaN(parsed) ? 0 : parsed
      }
      return typeof val === 'number' ? val : 0
    },
    z.number().min(0, 'Threshold Amount must be 0 or greater')
  ),

  // First Transaction Date & Time - optional (validation removed)
  firstTransactionDateTime: z.any().optional(),

  // Instruction Expiry Date & Time - optional (validation removed)
  instructionExpiryDateTime: z.any().optional(),

  // Retry Interval Days - mandatory
  retryIntervalDays: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const parsed = parseInt(val)
        return isNaN(parsed) ? 0 : parsed
      }
      return typeof val === 'number' ? val : 0
    },
    z.number().int().min(0, 'Retry Interval Days must be 0 or greater')
  ),

  // Retry Until Month End Flag - optional boolean
  retryUntilMonthEndFlag: z.preprocess(
    (val) => {
      if (val === null || val === undefined) return false
      if (typeof val === 'boolean') return val
      if (typeof val === 'string') return val === 'true' || val === '1'
      return Boolean(val)
    },
    z.boolean().optional().default(false)
  ),

  // Instruction Remarks - optional
  instructionRemarks: z
    .string()
    .max(1000, 'Instruction Remarks must be 1000 characters or less')
    .optional()
    .or(z.literal('')),

  // Next Execution Date & Time - optional (validation removed)
  nextExecutionDateTime: z.any().optional(),

  // DTO fields - optional, can be ID or full object
  dealNoDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  statusDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  transferTypeDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  occurrenceDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  recurringFrequencyDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  holidaySetupDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  dependentScenarioDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  formAccountDrDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  dependenceDTO: z
    .string()
    .max(200, 'Dependence must be 200 characters or less')
    .optional()
    .nullable()
    .or(z.literal('')),

  paymentTypeDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  toAccountDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  // Additional fields from API response
  swiftCode: z
    .string()
    .max(20, 'SWIFT Code must be 20 characters or less')
    .optional()
    .nullable()
    .or(z.literal('')),

  creditAmountCap: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return isNaN(parsed) ? 0 : parsed
      }
      return typeof val === 'number' ? val : 0
    },
    z.number().min(0, 'Credit Amount Cap must be 0 or greater').optional()
  ),

  creditAmount: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return isNaN(parsed) ? 0 : parsed
      }
      return typeof val === 'number' ? val : 0
    },
    z.number().min(0, 'Credit Amount must be 0 or greater').optional()
  ),

  priority: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const parsed = parseInt(val)
        return isNaN(parsed) ? 0 : parsed
      }
      return typeof val === 'number' ? val : 0
    },
    z.number().int().min(0, 'Priority must be 0 or greater').optional()
  ),

  recentPercentage: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return isNaN(parsed) ? 0 : parsed
      }
      return typeof val === 'number' ? val : 0
    },
    z.number().min(0, 'Recent Percentage must be 0 or greater').max(100, 'Recent Percentage must be 100 or less').optional()
  ),

  beneficiaryNameDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  resetCounterDTO: z
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

// Standing Instruction Step 2: Documents Schema (Optional)
export const StandingInstructionStep2Schema = z.object({
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

// Standing Instruction Step 3: Review Schema
export const StandingInstructionStep3Schema = z.object({
  termsAccepted: z.boolean().optional(),
  dataAccuracyConfirmed: z.boolean().optional(),
  reviewNotes: z
    .string()
    .max(1000, 'Review notes must be 1000 characters or less')
    .optional()
    .or(z.literal('')),
})

// Combined schema for all steps
export const StandingInstructionStepperSchemas = {
  step1: StandingInstructionStep1Schema,
  step2: StandingInstructionStep2Schema,
  step3: StandingInstructionStep3Schema,
} as const

// Helper function to get step schema
export const getStandingInstructionStepSchema = (stepNumber: number) => {
  const stepKeys = ['step1', 'step2', 'step3'] as const
  const stepKey = stepKeys[stepNumber]
  return stepKey ? StandingInstructionStepperSchemas[stepKey] : null
}

// Helper to validate only step-specific data
export const validateStandingInstructionStepData = (stepNumber: number, data: unknown) => {
  const schema = getStandingInstructionStepSchema(stepNumber)
  if (!schema) {
    return { success: true, data, errors: [] }
  }

  // Extract only the fields that belong to this step's schema
  const stepFields = Object.keys(schema.shape)
  const stepData: Record<string, unknown> = {}
  const dataObj = data as Record<string, unknown>

  stepFields.forEach((field) => {
    if (field in dataObj) {
      const value = dataObj[field]
      // Skip date fields entirely from validation - they're optional
      if (field === 'firstTransactionDateTime' || 
          field === 'instructionExpiryDateTime' || 
          field === 'nextExecutionDateTime') {
        // Don't include these fields in validation at all
        return
      }
      stepData[field] = value
    }
  })

  // Validate only the step-specific data
  const result = schema.safeParse(stepData)

  return result
}

// Helper function to get step validation key
export function getStandingInstructionStepValidationKey(
  step: number
): keyof typeof StandingInstructionStepperSchemas {
  const stepKeys: Array<keyof typeof StandingInstructionStepperSchemas> = [
    'step1',
    'step2',
    'step3',
  ]
  return stepKeys[step] || 'step1'
}

// Validation helper function for individual field
export const validateStandingInstructionField = (
  stepNumber: number,
  fieldName: string,
  value: unknown
): string | true => {
  try {
    // Skip validation for date/time fields
    if (fieldName === 'firstTransactionDateTime' || 
        fieldName === 'instructionExpiryDateTime' || 
        fieldName === 'nextExecutionDateTime') {
      return true
    }

    const schema = getStandingInstructionStepSchema(stepNumber)
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
    if (typeof value === 'string' && (fieldName.includes('Amount') || fieldName.includes('Days') || fieldName.includes('Priority') || fieldName.includes('Percentage'))) {
      const numValue = fieldName.includes('Days') || fieldName.includes('Priority') ? parseInt(value) : parseFloat(value)
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
export type StandingInstructionStep1Data = z.infer<typeof StandingInstructionStep1Schema>
export type StandingInstructionStep2Data = z.infer<typeof StandingInstructionStep2Schema>
export type StandingInstructionStep3Data = z.infer<typeof StandingInstructionStep3Schema>

// Combined type for all steps
export type StandingInstructionStepperData = {
  step1: StandingInstructionStep1Data
  step2: StandingInstructionStep2Data
  step3: StandingInstructionStep3Data
}

