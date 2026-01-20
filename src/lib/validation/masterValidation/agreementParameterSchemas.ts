import { z } from 'zod'

// Agreement Parameter Step 1: Basic Details Schema
export const AgreementParameterStep1Schema = z.object({
  // Agreement Parameter Reference Number - optional
  parametersRefNo: z
    .string()
    .max(100, 'Agreement Parameter Ref No must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  // Agreement Effective Date - mandatory field
  agreementEffectiveDate: z
    .string()
    .min(1, 'Agreement Effective Date is required')
    .refine(
      (val) => {
        // Validate date format (ISO string or YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}/
        return dateRegex.test(val) || !isNaN(Date.parse(val))
      },
      { message: 'Agreement Effective Date must be a valid date' }
    ),

  // Agreement Expiry Date - mandatory field
  agreementExpiryDate: z
    .string()
    .min(1, 'Agreement Expiry Date is required')
    .refine(
      (val) => {
        // Validate date format (ISO string or YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}/
        return dateRegex.test(val) || !isNaN(Date.parse(val))
      },
      { message: 'Agreement Expiry Date must be a valid date' }
    )
    .refine(
      (val, ctx) => {
        // Ensure expiry date is after effective date
        const effectiveDate = ctx.parent.agreementEffectiveDate
        if (effectiveDate) {
          const effective = new Date(effectiveDate)
          const expiry = new Date(val)
          return expiry > effective
        }
        return true
      },
      { message: 'Agreement Expiry Date must be after Effective Date' }
    ),

  // Agreement Remarks - optional
  agreementRemarks: z
    .string()
    .max(1000, 'Agreement Remarks must be 1000 characters or less')
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
  permittedInvestmentAllowedDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  amendmentAllowedDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  dealClosureBasisDTO: z
    .union([
      z.object({ id: z.number().min(1) }),
      z.number().min(1),
    ])
    .optional()
    .nullable(),

  permittedInvestmentADTO: z
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

// Agreement Parameter Step 2: Documents Schema (Optional)
export const AgreementParameterStep2Schema = z.object({
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

// Agreement Parameter Step 3: Review Schema
export const AgreementParameterStep3Schema = z.object({
  termsAccepted: z.boolean().optional(),
  dataAccuracyConfirmed: z.boolean().optional(),
  reviewNotes: z
    .string()
    .max(1000, 'Review notes must be 1000 characters or less')
    .optional()
    .or(z.literal('')),
})

// Combined schema for all steps
export const AgreementParameterStepperSchemas = {
  step1: AgreementParameterStep1Schema,
  step2: AgreementParameterStep2Schema,
  step3: AgreementParameterStep3Schema,
} as const

// Helper function to get step schema
// stepNumber: 1-based (1 = step1, 2 = step2, 3 = step3)
export const getAgreementParameterStepSchema = (stepNumber: number) => {
  // Convert 1-based to 0-based index for array access
  const stepIndex = stepNumber - 1
  const stepKeys = ['step1', 'step2', 'step3'] as const
  
  if (stepIndex < 0 || stepIndex >= stepKeys.length) {
    return null
  }
  
  const stepKey = stepKeys[stepIndex]
  return stepKey ? AgreementParameterStepperSchemas[stepKey] : null
}

// Helper to validate only step-specific data
// stepNumber: 1-based (1 = step1, 2 = step2, 3 = step3)
export const validateAgreementParameterStepData = (
  stepNumber: number,
  data: unknown
) => {
  try {
    const schema = getAgreementParameterStepSchema(stepNumber)
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
  } catch (error) {
    return {
      success: false,
      error: {
        issues: [{ message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}` }]
      }
    } as { success: false; error: { issues: Array<{ message: string }> } }
  }
}

// Helper function to get step validation key
export function getAgreementParameterStepValidationKey(
  step: number
): keyof typeof AgreementParameterStepperSchemas {
  const stepKeys: Array<keyof typeof AgreementParameterStepperSchemas> = [
    'step1',
    'step2',
    'step3',
  ]
  return stepKeys[step] || 'step1'
}

// Validation helper function for individual field
export const validateAgreementParameterField = (
  stepNumber: number,
  fieldName: string,
  value: unknown
): string | true => {
  try {
    const schema = getAgreementParameterStepSchema(stepNumber)
    if (!schema) return true

    // Handle nested field paths
    if (fieldName.includes('[') || fieldName.includes('.')) {
      return true
    }

    // Get the specific field schema
    const fieldSchema = (schema.shape as Record<string, z.ZodTypeAny>)[fieldName]
    if (!fieldSchema) {
      // Field not in schema, skip validation
      return true
    }

    // Handle empty/optional values - check if field is optional in schema
    const isEmpty = !value || value === '' || value === null || value === undefined
    if (isEmpty) {
      // Check if the field is optional by trying to parse undefined
      const optionalTest = fieldSchema.safeParse(undefined)
      if (optionalTest.success) {
        return true // Field is optional and empty, validation passes
      }
      // Field is required but empty - this should be caught by required check in component
      return true
    }

    // For date fields with cross-field validation (like expiryDate), skip schema validation
    // as it requires parent context which isn't available in single-field validation
    if (fieldName === 'agreementExpiryDate' || fieldName === 'agreementEffectiveDate') {
      // Just check if it's a valid string (date validation is handled in component)
      if (typeof value === 'string' && value.length > 0) {
        // Basic date format check
        const dateRegex = /^\d{4}-\d{2}-\d{2}/
        if (dateRegex.test(value) || !isNaN(Date.parse(value))) {
          return true
        }
        return 'Must be a valid date'
      }
      return true
    }

    // Validate using safeParse for other fields
    try {
      const result = fieldSchema.safeParse(value)
      if (!result.success) {
        const error = result.error.issues[0]
        const errorMessage = error?.message || 'Invalid value'
        return errorMessage
      }
      return true
    } catch (parseError) {
      // Try to extract a meaningful error message
      if (parseError instanceof Error) {
        return parseError.message
      }
      return `Invalid ${fieldName}`
    }
  } catch (error) {
    // Return a more specific error message based on the field name
    if (fieldName.includes('Date')) {
      return `${fieldName} must be a valid date`
    }
    if (fieldName.includes('DTO')) {
      return `${fieldName} is invalid`
    }
    return `${fieldName} validation failed`
  }
}

// Type exports for TypeScript inference
export type AgreementParameterStep1Data = z.infer<
  typeof AgreementParameterStep1Schema
>
export type AgreementParameterStep2Data = z.infer<
  typeof AgreementParameterStep2Schema
>
export type AgreementParameterStep3Data = z.infer<
  typeof AgreementParameterStep3Schema
>

// Combined type for all steps
export type AgreementParameterStepperData = {
  step1: AgreementParameterStep1Data
  step2: AgreementParameterStep2Data
  step3: AgreementParameterStep3Data
}

