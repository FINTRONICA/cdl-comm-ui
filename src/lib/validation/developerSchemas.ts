import { z } from 'zod'
import dayjs, { Dayjs } from 'dayjs'

// Custom Dayjs schema validator with auto-conversion
const dayjsSchema = z.preprocess(
  (val) => {
    // If already a Dayjs object, return as-is
    if (dayjs.isDayjs(val)) return val

    // If null or undefined, return null
    if (val === null || val === undefined) return null

    // If it's a Date object or string, convert to Dayjs
    if (val instanceof Date || typeof val === 'string') {
      const parsed = dayjs(val)
      return parsed.isValid() ? parsed : null
    }

    return null
  },
  z
    .custom<Dayjs | null>((val) => {
      if (val === null || val === undefined) return true
      return dayjs.isDayjs(val)
    }, 'Must be a valid Dayjs object or null')
    .nullable()
)

// Developer Step 1: Basic Details Schema
export const DeveloperStep1Schema = z.object({
  // Build Partner CIF - mandatory field
  bpCifrera: z
    .string()
    .min(1, 'Build Partner CIF is required')
    .max(8, 'CIF must be 8 digits or less')
    .regex(/^\d+$/, 'CIF must be numerical'),

  // Developer ID - mandatory
  bpDeveloperId: z
    .string()
    .min(1, 'Build Partner ID is required')
    .max(30, 'Build Partner ID must be 30 characters or less'),

  // Developer Registration no. - mandatory
  bpDeveloperRegNo: z
    .string()
    .min(1, 'Build Partner Registration number is required')
    .max(14, 'Build Partner Registration number must be 14 characters or less'),

  // Developer Name (English) - mandatory
  bpName: z
    .string()
    .min(1, 'Build Partner Name (English) is required')
    .max(100, 'Build Partner Name (English) must be 100 characters or less'),

  // Developer Name (Local) - mandatory
  bpNameLocal: z
    .string()
    .min(1, 'Build Partner Name (Local) is required')
    .max(35, 'Build Partner Name (Local) must be 35 characters or less'),

  // Parent Developer Name - optional
  bpMasterName: z
    .string()
    .max(35, 'Parent Build Partner Name must be 35 characters or less')
    .optional()
    .or(z.literal('')),

  // License Number - mandatory
  bpLicenseNo: z
    .string()
    .min(1, 'License Number is required')
    .max(50, 'License Number must be 50 characters or less'),

  // Onboarding Date - mandatory
  bpOnboardingDate: dayjsSchema.refine(
    (val) => val !== null && val !== undefined,
    'Onboarding Date is required'
  ),

  // License Expiry Date - mandatory
  bpLicenseExpDate: dayjsSchema.refine(
    (val) => val !== null && val !== undefined,
    'License Expiry Date is required'
  ),

  // Regulatory Authority - mandatory (ID should be number)
  bpRegulatorId: z.union([
    z.number().min(1, 'Regulatory Authority is required'),
    z.string().min(1, 'Regulatory Authority is required'),
  ]),

  // Optional fields
  bpWorldCheckRemarks: z
    .string()
    .max(100, 'World Check Flag Remarks must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  bpContactAddress: z
    .string()
    .max(30, 'Contact Address must be 30 characters or less')
    .optional()
    .or(z.literal('')),

  bpContactTel: z
    .string()
    .max(35, 'Contact Telephone must be 35 characters or less')
    .optional()
    .or(z.literal('')),

  bpMobile: z
    .union([
      z
        .string()
        .max(15, 'Contact Mobile must be 15 characters or less')
        .regex(
          /^[\d\-\+\(\)\s]+$/,
          'Mobile number contains invalid characters'
        ),
      z.literal(''),
      z.undefined(),
    ])
    .optional(),

  bpEmail: z
    .union([
      z
        .string()
        .email('Invalid email format')
        .max(35, 'Contact Email must be 35 characters or less'),
      z.literal(''),
      z.undefined(),
    ])
    .optional(),

  bpPoBox: z
    .union([
      z.string().max(30, 'P.O. Box must be 30 characters or less'),
      z.literal(''),
      z.undefined(),
      z.null(),
    ])
    .optional(),

  // bpFax: z
  //   .union([
  //     z
  //       .string()
  //       .max(15, 'Fax number must be 15 characters or less')
  //       .regex(/^[\d\-\+\(\)\s]+$/, 'Fax number contains invalid characters'),
  //     z.literal(''),
  //     z.undefined(),
  //   ])
  //   .optional(),

  // Boolean fields (with string coercion for checkbox compatibility)
  bpWorldCheckFlag: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'string')
        return val === 'true' || val === '1' || val === 'on'
      return val
    })
    .optional(),
  bpMigratedData: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'string')
        return val === 'true' || val === '1' || val === 'on'
      return val
    })
    .optional(),

  // Additional fields
  bpremark: z.string().optional().or(z.literal('')),
  bpRegulatorDTO: z.any().optional(),
})

// Developer Step 2: Documents Schema (Optional)
export const DeveloperStep2Schema = z.object({
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

// Developer Step 3: Contact Details Schema
export const DeveloperStep3Schema = z.object({
  contactData: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, 'Contact name is required')
          .max(100, 'Contact name must be 100 characters or less'),

        address: z
          .string()
          .min(1, 'Contact address is required')
          .max(200, 'Contact address must be 200 characters or less'),

        email: z
          .string()
          .email('Invalid email format')
          .max(100, 'Email must be 100 characters or less'),

        pobox: z
          .string()
          .max(50, 'PO Box must be 50 characters or less')
          .optional()
          .or(z.literal('')),

        countrycode: z
          .string()
          .min(1, 'Country code is required'),

        mobileno: z
          .string()
          .min(1, 'Mobile number is required')
          .max(20, 'Mobile number must be 20 characters or less')
          .regex(
            /^[\d\-\+\(\)\s]+$/,
            'Mobile number contains invalid characters'
          ),

        telephoneno: z
          .string()
          .max(20, 'Telephone number must be 20 characters or less')
          .regex(
            /^[\d\-\+\(\)\s]*$/,
            'Telephone number contains invalid characters'
          )
          .optional()
          .or(z.literal('')),

        fax: z
          .string()
          .max(20, 'Fax number must be 20 characters or less')
          .regex(/^[\d\-\+\(\)\s]*$/, 'Fax number contains invalid characters')
          .optional()
          .or(z.literal('')),

        buildPartnerDTO: z
          .object({
            id: z.number(),
          })
          .optional(),
      })
    )
    .min(0, 'Contacts are optional')
    .max(10, 'Maximum 10 contacts allowed')
    .optional()
    .default([]),
})

// Developer Step 4: Fee Details Schema
export const DeveloperStep4Schema = z.object({
  fees: z
    .array(
      z.object({
        feeType: z.union([z.string(), z.number()]).refine((val) => {
          if (typeof val === 'number') return val > 0
          if (typeof val === 'string') return val.length > 0
          return false
        }, 'Fee type is required'),

        frequency: z.union([z.string(), z.number()]).refine((val) => {
          if (typeof val === 'number') return val > 0
          if (typeof val === 'string') return val.length > 0
          return false
        }, 'Frequency is required'),

        debitAmount: z
          .string()
          .min(1, 'Debit amount is required')
          .refine((val) => {
            if (!val || val === '') return false
            const num = parseFloat(val)
            return !isNaN(num) && num >= 0
          }, 'Debit amount must be a valid number'),

        feeToBeCollected: dayjsSchema.optional(),

        nextRecoveryDate: dayjsSchema.optional(),

        feePercentage: z
          .string()
          .refine((val) => {
            if (!val || val === '') return true // Optional field
            const num = parseFloat(val)
            return !isNaN(num) && num >= 0 && num <= 100
          }, 'Fee percentage must be between 0 and 100')
          .optional()
          .or(z.literal('')),

        amount: z
          .string()
          .min(1, 'Amount is required')
          .refine((val) => {
            if (!val || val === '') return false
            const num = parseFloat(val)
            return !isNaN(num) && num >= 0
          }, 'Amount must be a valid number'),

        vatPercentage: z
          .string()
          .min(1, 'VAT percentage is required')
          .refine((val) => {
            if (!val || val === '') return false
            const num = parseFloat(val)
            return !isNaN(num) && num >= 0 && num <= 100
          }, 'VAT percentage must be between 0 and 100'),

        currency: z.union([z.string(), z.number()]).refine((val) => {
          if (typeof val === 'number') return val > 0
          if (typeof val === 'string') return val.length > 0
          return false
        }, 'Currency is required'),

        debitAccount: z.union([z.string(), z.number()]).refine((val) => {
          if (typeof val === 'number') return val > 0
          if (typeof val === 'string') return val.length > 0
          return false
        }, 'Debit account is required'),

        buildPartnerDTO: z
          .object({
            id: z.number(),
          })
          .optional(),
      })
    )
    .optional()
    .default([]),
})

// Developer Step 5: Beneficiary Details Schema (Manager Cheques Specification)
export const DeveloperStep5Schema = z.object({
  beneficiaries: z
    .array(
      z.object({
        // Beneficiary ID - Mandatory, Numerical Only, Max 16 characters
        id: z
          .string()
          .min(1, 'Beneficiary ID is required')
          .max(16, 'Beneficiary ID must be 16 characters or less')
          .regex(/^\d+$/, 'Beneficiary ID must be numerical only'),

        // Transfer Type - Mandatory, Dropdown (TR/TT/MC) - Union for ID or string
        transferType: z.union([z.string(), z.number()]).refine((val) => {
          if (typeof val === 'number') return val > 0
          if (typeof val === 'string') return ['TR', 'TT', 'MC'].includes(val)
          return false
        }, 'Transfer type must be TR (Transfer), TT (Telegraphic Transfer), or MC (Manager Cheques)'),

        // Beneficiary Name - Mandatory, Alphabets only, Max 35 characters
        name: z
          .string()
          .min(1, 'Beneficiary name is required')
          .max(35, 'Beneficiary name must be 35 characters or less')
          .regex(
            /^[A-Za-z\s]+$/,
            'Beneficiary name can only contain alphabets and spaces'
          ),

        // Beneficiary Bank - Mandatory, Union for ID or string
        bankName: z
          .union([z.string(), z.number()])
          .refine((val) => {
            if (typeof val === 'number') return val > 0
            if (typeof val === 'string')
              return val.length > 0 && val.length <= 35
            return false
          }, 'Bank name is required')
          .refine((val) => {
            if (typeof val === 'string') return /^[A-Za-z\s]*$/.test(val)
            return true
          }, 'Bank name can only contain alphabets and spaces'),

        // Beneficiary Account Number/IBAN - Mandatory, Numerical Only, Max 35 characters
        account: z
          .string()
          .min(1, 'Account number/IBAN is required')
          .max(35, 'Account number/IBAN must be 35 characters or less')
          .regex(/^\d+$/, 'Account number/IBAN must be numerical only'),

        // Beneficiary Swift - Mandatory, Alpha Numerical, Max 11 characters
        swiftCode: z
          .string()
          .min(1, 'SWIFT code is required')
          .max(11, 'SWIFT code must be 11 characters or less')
          .regex(
            /^[A-Za-z0-9]+$/,
            'SWIFT code can only contain alphanumeric characters'
          ),

        // Beneficiary Routing Code - Non-Mandatory, Alpha Numerical, Max 10 characters
        routingCode: z
          .string()
          .max(10, 'Routing code must be 10 characters or less')
          .regex(
            /^[A-Za-z0-9]*$/,
            'Routing code can only contain alphanumeric characters'
          )
          .optional()
          .or(z.literal('')),

        buildPartnerDTO: z
          .object({
            id: z.number(),
          })
          .optional(),
      })
    )
    .optional()
    .default([]),
})

// Developer Step 6: Review Schema
export const DeveloperStep6Schema = z.object({
  termsAccepted: z.boolean().optional(),

  dataAccuracyConfirmed: z.boolean().optional(),

  reviewNotes: z
    .string()
    .max(1000, 'Review notes must be 1000 characters or less')
    .optional()
    .or(z.literal('')),
})

// Combined schema for all steps
export const DeveloperStepperSchemas = {
  step1: DeveloperStep1Schema,
  step2: DeveloperStep2Schema,
  step3: DeveloperStep3Schema,
  step4: DeveloperStep4Schema,
  step5: DeveloperStep5Schema,
  step6: DeveloperStep6Schema,
} as const

// Helper function to get step schema
// Each schema only contains fields for that specific step
export const getDeveloperStepSchema = (stepNumber: number) => {
  const stepKeys = [
    'step1',
    'step2',
    'step3',
    'step4',
    'step5',
    'step6',
  ] as const
  const stepKey = stepKeys[stepNumber]
  return stepKey ? DeveloperStepperSchemas[stepKey] : null
}

// Helper to validate only step-specific data
export const validateStepData = (stepNumber: number, data: any) => {
  const schema = getDeveloperStepSchema(stepNumber)
  if (!schema) {
    return { success: true, data, errors: [] }
  }

  // Extract only the fields that belong to this step's schema
  const stepFields = Object.keys(schema.shape)
  const stepData: any = {}

  stepFields.forEach((field) => {
    if (field in data) {
      stepData[field] = data[field]
    }
  })

  // Validate only the step-specific data
  const result = schema.safeParse(stepData)

  return result
}

// Helper function to get step validation key
export function getStepValidationKey(
  step: number
): keyof typeof DeveloperStepperSchemas {
  const stepKeys: Array<keyof typeof DeveloperStepperSchemas> = [
    'step1',
    'step2',
    'step3',
    'step4',
    'step5',
    'step6',
  ]
  return stepKeys[step] || 'step1'
}

// Validation helper function for individual field
export const validateDeveloperField = (
  stepNumber: number,
  fieldName: string,
  value: any
): string | true => {
  try {
    const schema = getDeveloperStepSchema(stepNumber)
    if (!schema) return true

    // Handle nested field paths
    if (fieldName.includes('[') || fieldName.includes('.')) {
      return true
    }

    // Get the specific field schema
    const fieldSchema = (schema.shape as any)[fieldName]
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
export type DeveloperStep1Data = z.infer<typeof DeveloperStep1Schema>
export type DeveloperStep2Data = z.infer<typeof DeveloperStep2Schema>
export type DeveloperStep3Data = z.infer<typeof DeveloperStep3Schema>
export type DeveloperStep4Data = z.infer<typeof DeveloperStep4Schema>
export type DeveloperStep5Data = z.infer<typeof DeveloperStep5Schema>
export type DeveloperStep6Data = z.infer<typeof DeveloperStep6Schema>

// Combined type for all steps
export type DeveloperStepperData = {
  step1: DeveloperStep1Data
  step2: DeveloperStep2Data
  step3: DeveloperStep3Data
  step4: DeveloperStep4Data
  step5: DeveloperStep5Data
  step6: DeveloperStep6Data
}
