import { z } from 'zod'

// Agreement Signatory Step 1: Basic Details Schema
export const AgreementSignatoryStep1Schema = z.object({
  // Party Reference Number - optional
  partyReferenceNumber: z
    .string()
    .max(100, 'Party Reference Number must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  // Party Customer Reference Number - optional
  partyCustomerReferenceNumber: z
    .string()
    .max(100, 'Party Customer Reference Number must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  // Party Full Name - mandatory
  partyFullName: z
    .string()
    .min(1, 'Party Full Name is required')
    .max(200, 'Party Full Name must be 200 characters or less'),

  // Address Line 1 - mandatory
  addressLine1: z
    .string()
    .min(1, 'Address Line 1 is required')
    .max(200, 'Address Line 1 must be 200 characters or less'),

  // Address Line 2 - optional
  addressLine2: z
    .string()
    .max(200, 'Address Line 2 must be 200 characters or less')
    .optional()
    .or(z.literal('')),

  // Address Line 3 - optional
  addressLine3: z
    .string()
    .max(200, 'Address Line 3 must be 200 characters or less')
    .optional()
    .or(z.literal('')),

  // Signatory Role - mandatory
  signatoryRole: z
    .string()
    .min(1, 'Signatory Role is required')
    .max(100, 'Signatory Role must be 100 characters or less'),

  // Notification Contact Name - optional
  notificationContactName: z
    .string()
    .max(200, 'Notification Contact Name must be 200 characters or less')
    .optional()
    .or(z.literal('')),

  // Notification Address Line 1 - optional
  notificationAddressLine1: z
    .string()
    .max(200, 'Notification Address Line 1 must be 200 characters or less')
    .optional()
    .or(z.literal('')),

  // Notification Address Line 2 - optional
  notificationAddressLine2: z
    .string()
    .max(200, 'Notification Address Line 2 must be 200 characters or less')
    .optional()
    .or(z.literal('')),

  // Notification Address Line 3 - optional
  notificationAddressLine3: z
    .string()
    .max(200, 'Notification Address Line 3 must be 200 characters or less')
    .optional()
    .or(z.literal('')),

  // Notification Email Address - optional
  notificationEmailAddress: z
    .string()
    .email('Invalid email address')
    .max(200, 'Notification Email Address must be 200 characters or less')
    .optional()
    .or(z.literal('')),

  // Association Type - optional
  associationType: z
    .string()
    .max(100, 'Association Type must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  // Is Enabled status - optional boolean
  isEnabled: z.preprocess(
    (val) => {
      if (val === null || val === undefined) return true
      if (typeof val === 'boolean') return val
      if (typeof val === 'string') return val === 'true' || val === '1'
      return Boolean(val)
    },
    z.boolean().optional().default(true)
  ),

  // DTO fields - optional, can be ID or full object
  authorizedSignatoryDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  partyDTO: z
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

// Agreement Signatory Step 2: Documents Schema (Optional)
export const AgreementSignatoryStep2Schema = z.object({
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

// Agreement Signatory Step 3: Review Schema
export const AgreementSignatoryStep3Schema = z.object({
  termsAccepted: z.boolean().optional(),
  dataAccuracyConfirmed: z.boolean().optional(),
  reviewNotes: z
    .string()
    .max(1000, 'Review notes must be 1000 characters or less')
    .optional()
    .or(z.literal('')),
})

// Combined schema for all steps
export const AgreementSignatoryStepperSchemas = {
  step1: AgreementSignatoryStep1Schema,
  step2: AgreementSignatoryStep2Schema,
  step3: AgreementSignatoryStep3Schema,
} as const

// Helper function to get step schema
export const getAgreementSignatoryStepSchema = (stepNumber: number) => {
  const stepKeys = ['step1', 'step2', 'step3'] as const
  const stepKey = stepKeys[stepNumber]
  return stepKey ? AgreementSignatoryStepperSchemas[stepKey] : null
}

// Helper to validate only step-specific data
export const validateAgreementSignatoryStepData = (
  stepNumber: number,
  data: unknown
) => {
  const schema = getAgreementSignatoryStepSchema(stepNumber)
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
export function getAgreementSignatoryStepValidationKey(
  step: number
): keyof typeof AgreementSignatoryStepperSchemas {
  const stepKeys: Array<keyof typeof AgreementSignatoryStepperSchemas> = [
    'step1',
    'step2',
    'step3',
  ]
  return stepKeys[step] || 'step1'
}

// Validation helper function for individual field
export const validateAgreementSignatoryField = (
  stepNumber: number,
  fieldName: string,
  value: unknown
): string | true => {
  try {
    const schema = getAgreementSignatoryStepSchema(stepNumber)
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
export type AgreementSignatoryStep1Data = z.infer<
  typeof AgreementSignatoryStep1Schema
>
export type AgreementSignatoryStep2Data = z.infer<
  typeof AgreementSignatoryStep2Schema
>
export type AgreementSignatoryStep3Data = z.infer<
  typeof AgreementSignatoryStep3Schema
>

// Combined type for all steps
export type AgreementSignatoryStepperData = {
  step1: AgreementSignatoryStep1Data
  step2: AgreementSignatoryStep2Data
  step3: AgreementSignatoryStep3Data
}


