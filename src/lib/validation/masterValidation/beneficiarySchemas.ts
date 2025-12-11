import { z } from 'zod'

// Beneficiary Step 1: Basic Details Schema
export const BeneficiaryStep1Schema = z.object({
  // Beneficiary ID - optional (auto-generated)
  id: z
    .string()
    .max(50, 'Beneficiary ID must be 50 characters or less')
    .optional()
    .or(z.literal('')),

  // Beneficiary Full Name - mandatory
  beneficiaryFullName: z
    .string()
    .min(1, 'Beneficiary Full Name is required')
    .max(200, 'Beneficiary Full Name must be 200 characters or less'),

  // Beneficiary Address Line 1 - mandatory
  beneficiaryAddressLine1: z
    .string()
    .min(1, 'Address Line 1 is required')
    .max(200, 'Address Line 1 must be 200 characters or less'),

  // Telephone Number - mandatory
  telephoneNumber: z
    .string()
    .min(1, 'Telephone Number is required')
    .max(20, 'Telephone Number must be 20 characters or less')
    .regex(/^[\d\s\-\(\)]*$/, 'Telephone Number must be valid'),

  // Mobile Number - mandatory
  mobileNumber: z
    .string()
    .min(1, 'Mobile Number is required')
    .max(20, 'Mobile Number must be 20 characters or less')
    .regex(/^[\d\s\-\(\)]*$/, 'Mobile Number must be valid'),

  // Beneficiary Account Number - mandatory
  beneficiaryAccountNumber: z
    .string()
    .min(1, 'Account Number is required')
    .max(50, 'Account Number must be 50 characters or less'),

  // Bank IFSC Code - mandatory
  bankIfscCode: z
    .string()
    .min(1, 'Bank IFSC Code is required')
    .max(20, 'Bank IFSC Code must be 20 characters or less'),

  // Beneficiary Bank Name - mandatory
  beneficiaryBankName: z
    .string()
    .min(1, 'Bank Name is required')
    .max(200, 'Bank Name must be 200 characters or less'),

  // Bank Routing Code - optional
  bankRoutingCode: z
    .string()
    .max(50, 'Bank Routing Code must be 50 characters or less')
    .optional()
    .or(z.literal('')),

  // Additional Remarks - optional
  additionalRemarks: z
    .string()
    .max(500, 'Additional Remarks must be 500 characters or less')
    .optional()
    .or(z.literal('')),

  // Active status - optional, defaults to true
  active: z.boolean().optional().default(true),

  // Enabled status - optional, defaults to true
  enabled: z.boolean().optional().default(true),

  // Deleted status - optional, defaults to false
  deleted: z.boolean().optional().default(false),

  // Account Type DTO - optional
  accountTypeDTO: z
    .object({
      id: z.number().min(1, 'Account Type is required'),
    })
    .nullable()
    .optional(),

  // Transfer Type DTO - optional
  transferTypeDTO: z
    .object({
      id: z.number().min(1, 'Transfer Type is required'),
    })
    .nullable()
    .optional(),

  // Role DTO - optional
  roleDTO: z
    .object({
      id: z.number().min(1, 'Role is required'),
    })
    .nullable()
    .optional(),

  // Task Status DTO - optional
  taskStatusDTO: z
    .object({
      id: z.number().min(1, 'Task Status is required'),
    })
    .nullable()
    .optional(),
})

// Beneficiary Step 2: Documents Schema (optional, no validation needed)
export const BeneficiaryStep2Schema = z.object({
  documents: z.array(z.any()).optional(),
})

// Beneficiary Step 3: Review Schema (no validation needed, just acceptance)
export const BeneficiaryStep3Schema = z.object({
  reviewData: z.any().optional(),
  termsAccepted: z.boolean().default(true),
})

// Validation function for step data
export const validateBeneficiaryStepData = (
  step: number,
  data: unknown
): { success: boolean; error?: z.ZodError } => {
  let schema: z.ZodSchema

  switch (step) {
    case 1:
      schema = BeneficiaryStep1Schema
      break
    case 2:
      schema = BeneficiaryStep2Schema
      break
    case 3:
      schema = BeneficiaryStep3Schema
      break
    default:
      return { success: true } // Skip validation for unknown steps
  }

  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true }
  } else {
    return { success: false, error: result.error }
  }
}
