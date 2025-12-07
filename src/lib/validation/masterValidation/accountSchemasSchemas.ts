import { z } from 'zod'

// Account Step 1: Basic Details Schema
export const AccountStep1Schema = z.object({
  // Account ID - optional for new accounts, required for existing
  id: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val ? String(val) : undefined)),

  // Account Number - mandatory field
  accountNumber: z
    .string()
    .min(1, 'Account Number is required')
    .max(50, 'Account Number must be 50 characters or less'),

  // Product Code - mandatory
  productCode: z
    .string()
    .min(1, 'Product Code is required')
    .max(50, 'Product Code must be 50 characters or less'),

  // Account Display Name - mandatory
  accountDisplayName: z
    .string()
    .min(1, 'Account Display Name is required')
    .max(200, 'Account Display Name must be 200 characters or less'),

  // IBAN Number - mandatory
  ibanNumber: z
    .string()
    .min(1, 'IBAN Number is required')
    .max(50, 'IBAN Number must be 50 characters or less'),

  // Official Account Title - mandatory
  officialAccountTitle: z
    .string()
    .min(1, 'Official Account Title is required')
    .max(200, 'Official Account Title must be 200 characters or less'),

  // Virtual Account Number - optional
  virtualAccountNumber: z
    .string()
    .max(50, 'Virtual Account Number must be 50 characters or less')
    .optional()
    .or(z.literal('')),

  // Account Type Code - mandatory
  accountTypeCode: z
    .string()
    .min(1, 'Account Type Code is required')
    .max(50, 'Account Type Code must be 50 characters or less'),

  // Assignment Status - mandatory
  assignmentStatus: z
    .string()
    .min(1, 'Assignment Status is required')
    .max(50, 'Assignment Status must be 50 characters or less'),

  // Assigned To Reference - optional
  assignedToReference: z
    .string()
    .max(200, 'Assigned To Reference must be 200 characters or less')
    .optional()
    .or(z.literal('')),

  // Account Open Date Time - mandatory
  accountOpenDateTime: z
    .string()
    .min(1, 'Account Opening Date is required')
    .or(z.date().transform((d) => d.toISOString())),

  // Reference Fields - optional
  referenceField1: z
    .string()
    .max(200, 'Reference Field 1 must be 200 characters or less')
    .optional()
    .or(z.literal('')),

  referenceField2: z
    .string()
    .max(200, 'Reference Field 2 must be 200 characters or less')
    .optional()
    .or(z.literal('')),

  // Active status - optional boolean, accepts boolean, string, or null/undefined
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
  taxPaymentDTO: z
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

  accountPurposeDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  accountCategoryDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  primaryAccountDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  bulkUploadProcessingDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  unitaryPaymentDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  accountTypeDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  accountTypeCategoryDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  escrowAgreementDTO: z
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

// Account Step 2: Documents Schema (Optional)
export const AccountStep2Schema = z.object({
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

// Account Step 3: Review Schema
export const AccountStep3Schema = z.object({
  termsAccepted: z.boolean().optional(),
  dataAccuracyConfirmed: z.boolean().optional(),
  reviewNotes: z
    .string()
    .max(1000, 'Review notes must be 1000 characters or less')
    .optional()
    .or(z.literal('')),
})

// Combined schema for all steps
export const AccountStepperSchemas = {
  step1: AccountStep1Schema,
  step2: AccountStep2Schema,
  step3: AccountStep3Schema,
} as const

// Helper function to get step schema
export const getAccountStepSchema = (stepNumber: number) => {
  const stepKeys = ['step1', 'step2', 'step3'] as const
  const stepKey = stepKeys[stepNumber]
  return stepKey ? AccountStepperSchemas[stepKey] : null
}

// Helper to validate only step-specific data
export const validateAccountStepData = (stepNumber: number, data: unknown) => {
  const schema = getAccountStepSchema(stepNumber)
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
export function getAccountStepValidationKey(
  step: number
): keyof typeof AccountStepperSchemas {
  const stepKeys: Array<keyof typeof AccountStepperSchemas> = [
    'step1',
    'step2',
    'step3',
  ]
  return stepKeys[step] || 'step1'
}

// Validation helper function for individual field
export const validateAccountField = (
  stepNumber: number,
  fieldName: string,
  value: unknown
): string | true => {
  try {
    const schema = getAccountStepSchema(stepNumber)
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
export type AccountStep1Data = z.infer<typeof AccountStep1Schema>
export type AccountStep2Data = z.infer<typeof AccountStep2Schema>
export type AccountStep3Data = z.infer<typeof AccountStep3Schema>

// Combined type for all steps
export type AccountStepperData = {
  step1: AccountStep1Data
  step2: AccountStep2Data
  step3: AccountStep3Data
}


