import { z } from 'zod'

// Agreement Fee Schedule Step 1: Basic Details Schema
export const AgreementFeeScheduleStep1Schema = z.object({
  // Effective Start Date - mandatory field
  effectiveStartDate: z
    .string()
    .min(1, 'Effective Start Date is required'),

  // Effective End Date - mandatory
  effectiveEndDate: z
    .string()
    .min(1, 'Effective End Date is required'),

  // Operating Location - mandatory
  operatingLocation: z
    .string()
    .min(1, 'Operating Location is required')
    .max(200, 'Operating Location must be 200 characters or less'),

  // Priority Level - mandatory
  priorityLevel: z
    .string()
    .min(1, 'Priority Level is required')
    .max(50, 'Priority Level must be 50 characters or less'),

  // Transaction Rate Amount - mandatory
  transactionRateAmount: z
    .string()
    .min(1, 'Transaction Rate Amount is required')
    .max(50, 'Transaction Rate Amount must be 50 characters or less'),

  // Debit Account Number - mandatory
  debitAccountNumber: z
    .string()
    .min(1, 'Debit Account Number is required')
    .max(50, 'Debit Account Number must be 50 characters or less'),

  // Credit Account Number - mandatory
  creditAccountNumber: z
    .string()
    .min(1, 'Credit Account Number is required')
    .max(50, 'Credit Account Number must be 50 characters or less'),

  // Active status - optional boolean
  active: z.preprocess(
    (val) => {
      if (val === null || val === undefined) return true
      if (typeof val === 'boolean') return val
      if (typeof val === 'string') return val === 'true' || val === '1'
      return Boolean(val)
    },
    z.boolean().optional().default(true)
  ),

  // DTO fields - optional, can be ID or full object
  feeDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  feeTypeDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  feesFrequencyDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  frequencyBasisDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  agreementTypeDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  agreementSubTypeDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  productProgramDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  escrowAgreementDTO: z
    .string()
    .optional()
    .nullable(),

  // System fields
  enabled: z.boolean().optional().default(true),
  deleted: z.boolean().optional().default(false),
})

// Agreement Fee Schedule Step 2: Documents Schema (Optional)
export const AgreementFeeScheduleStep2Schema = z.object({
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

// Agreement Fee Schedule Step 3: Review Schema
export const AgreementFeeScheduleStep3Schema = z.object({
  termsAccepted: z.boolean().optional(),
  dataAccuracyConfirmed: z.boolean().optional(),
  reviewNotes: z
    .string()
    .max(1000, 'Review notes must be 1000 characters or less')
    .optional()
    .or(z.literal('')),
})

// Combined schema for all steps
export const AgreementFeeScheduleStepperSchemas = {
  step1: AgreementFeeScheduleStep1Schema,
  step2: AgreementFeeScheduleStep2Schema,
  step3: AgreementFeeScheduleStep3Schema,
} as const

// Helper function to get step schema
export const getAgreementFeeScheduleStepSchema = (stepNumber: number) => {
  const stepKeys = ['step1', 'step2', 'step3'] as const
  const stepKey = stepKeys[stepNumber]
  return stepKey ? AgreementFeeScheduleStepperSchemas[stepKey] : null
}

// Helper to validate only step-specific data
export const validateAgreementFeeScheduleStepData = (stepNumber: number, data: unknown) => {
  const schema = getAgreementFeeScheduleStepSchema(stepNumber)
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
export function getAgreementFeeScheduleStepValidationKey(
  step: number
): keyof typeof AgreementFeeScheduleStepperSchemas {
  const stepKeys: Array<keyof typeof AgreementFeeScheduleStepperSchemas> = [
    'step1',
    'step2',
    'step3',
  ]
  return stepKeys[step] || 'step1'
}

// Validation helper function for individual field
export const validateAgreementFeeScheduleField = (
  stepNumber: number,
  fieldName: string,
  value: unknown
): string | true => {
  try {
    const schema = getAgreementFeeScheduleStepSchema(stepNumber)
    if (!schema) return true

    // Handle nested field paths
    if (fieldName.includes('[') || fieldName.includes('.')) {
      return true
    }

    // Get the specific field schema
    const fieldSchema = (schema.shape as Record<string, z.ZodTypeAny>)[fieldName]
    if (!fieldSchema) return true

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
export type AgreementFeeScheduleStep1Data = z.infer<typeof AgreementFeeScheduleStep1Schema>
export type AgreementFeeScheduleStep2Data = z.infer<typeof AgreementFeeScheduleStep2Schema>
export type AgreementFeeScheduleStep3Data = z.infer<typeof AgreementFeeScheduleStep3Schema>

// Combined type for all steps
export type AgreementFeeScheduleStepperData = {
  step1: AgreementFeeScheduleStep1Data
  step2: AgreementFeeScheduleStep2Data
  step3: AgreementFeeScheduleStep3Data
}


