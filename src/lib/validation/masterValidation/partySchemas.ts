import { z } from 'zod'

// Party Step 1: Basic Details Schema
export const PartyStep1Schema = z.object({
  // Party ID - mandatory
  id: z
    .string()
    .min(1, 'Party ID is required')
    .max(50, 'Party ID must be 50 characters or less'),

  // Party CIF Number - mandatory
  partyCifNumber: z
    .string()
    .min(1, 'Party CIF Number is required')
    .max(20, 'CIF Number must be 20 characters or less'),

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

  // Address Line 2 - mandatory (form requires it)
  addressLine2: z
    .string()
    .min(1, 'Address Line 2 is required')
    .max(200, 'Address Line 2 must be 200 characters or less'),

  // Address Line 3 - mandatory (form requires it)
  addressLine3: z
    .string()
    .min(1, 'Address Line 3 is required')
    .max(200, 'Address Line 3 must be 200 characters or less'),

  // Telephone Number - optional (form doesn't require it)
  telephoneNumber: z
    .string()
    .max(20, 'Telephone Number must be 20 characters or less')
    .regex(/^[\d\s\-\(\)]*$/, 'Telephone Number must be valid')
    .optional()
    .or(z.literal('')),

  // Mobile Number - optional
  mobileNumber: z
    .string()
    .max(20, 'Mobile Number must be 20 characters or less')
    .regex(/^[\d\s\-\(\)]*$/, 'Mobile Number must be valid')
    .optional()
    .or(z.literal('')),

  // Email Address - optional but must be valid if provided
  emailAddress: z
    .string()
    .email('Email Address must be valid')
    .max(100, 'Email Address must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  // Bank Identifier - optional (form doesn't require it)
  bankIdentifier: z
    .string()
    .max(50, 'Bank Identifier must be 50 characters or less')
    .optional()
    .or(z.literal('')),

  // Passport Identification Details - optional
  passportIdentificationDetails: z
    .string()
    .max(50, 'Passport Identification Details must be 50 characters or less')
    .optional()
    .or(z.literal('')),

  // Project Account Owner Name - optional
  projectAccountOwnerName: z
    .string()
    .max(100, 'Project Account Owner Name must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  // Backup Project Account Owner Name - optional
  backupProjectAccountOwnerName: z
    .string()
    .max(100, 'Backup Project Account Owner Name must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  // Assistant Relationship Manager Name - optional
  assistantRelationshipManagerName: z
    .string()
    .max(100, 'Assistant Relationship Manager Name must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  // Team Leader Name - optional
  teamLeaderName: z
    .string()
    .max(100, 'Team Leader Name must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  // Relationship Manager Name - optional
  relationshipManagerName: z
    .string()
    .max(100, 'Relationship Manager Name must be 100 characters or less')
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

  // Party Constituent DTO - optional
  partyConstituentDTO: z
    .object({
      id: z.number().min(1, 'Party Constituent is required'),
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

// Party Step 2: Authorized Signatory Schema
export const PartyStep2Schema = z.object({
  customerCifNumber: z
    .string()
    .min(1, 'Customer CIF Number is required')
    .max(20, 'Customer CIF Number must be 20 characters or less'),

  signatoryFullName: z
    .string()
    .min(1, 'Signatory Full Name is required')
    .max(200, 'Signatory Full Name must be 200 characters or less'),

  addressLine1: z
    .string()
    .min(1, 'Address Line 1 is required')
    .max(200, 'Address Line 1 must be 200 characters or less'),

  addressLine2: z
    .string()
    .min(1, 'Address Line 2 is required')
    .max(200, 'Address Line 2 must be 200 characters or less'),

  addressLine3: z
    .string()
    .min(1, 'Address Line 3 is required')
    .max(200, 'Address Line 3 must be 200 characters or less'),

  telephoneNumber: z
    .string()
    .max(20, 'Telephone Number must be 20 characters or less')
    .regex(/^[\d\s\-\(\)]*$/, 'Telephone Number must be valid')
    .optional()
    .or(z.literal('')),

  mobileNumber: z
    .string()
    .max(20, 'Mobile Number must be 20 characters or less')
    .regex(/^[\d\s\-\(\)]*$/, 'Mobile Number must be valid')
    .optional()
    .or(z.literal('')),

  emailAddress: z
    .string()
    .email('Email Address must be valid')
    .max(100, 'Email Address must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  notificationContactName: z
    .string()
    .max(100, 'Notification Contact Name must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  signatoryCifNumber: z
    .string()
    .min(1, 'Signatory CIF Number is required')
    .max(20, 'Signatory CIF Number must be 20 characters or less'),

  notificationEmailAddress: z
    .string()
    .email('Notification Email Address must be valid')
    .max(100, 'Notification Email Address must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  notificationSignatureFile: z.string().optional().or(z.literal('')),
  notificationSignatureMimeType: z.string().optional().or(z.literal('')),

  active: z.boolean().optional().default(true),

  cifExistsDTO: z
    .object({
      id: z.number().min(1),
    })
    .nullable()
    .optional(),

  notificationSignatureDTO: z
    .object({
      id: z.number().min(1),
    })
    .nullable()
    .optional(),

  partyDTO: z
    .object({
      id: z.number().min(1, 'Party is required'),
    })
    .optional(),
})

// Party Step 3: Review Schema (no validation needed, just acceptance)
export const PartyStep3Schema = z.object({
  reviewData: z.any().optional(),
  termsAccepted: z.boolean().default(true),
})

// Validation function for step data
export const validateStepData = (step: number, data: unknown): { success: boolean; error?: z.ZodError } => {
  let schema: z.ZodSchema

  switch (step) {
    case 1:
      schema = PartyStep1Schema
      break
    case 2:
      schema = PartyStep2Schema
      break
    case 3:
      schema = PartyStep3Schema
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

