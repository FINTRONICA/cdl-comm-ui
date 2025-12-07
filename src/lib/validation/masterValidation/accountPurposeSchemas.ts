import { z } from 'zod'

// Account Purpose Schema
export const AccountPurposeSchema = z.object({
  // Account Purpose Code - mandatory
  accountPurposeCode: z
    .string()
    .min(1, 'Account Purpose Code is required')
    .max(50, 'Account Purpose Code must be 50 characters or less'),

  // Account Purpose Name - mandatory
  accountPurposeName: z
    .string()
    .min(1, 'Account Purpose Name is required')
    .max(200, 'Account Purpose Name must be 200 characters or less'),

  // Active status - mandatory boolean
  active: z.boolean().default(true),

  // Criticality DTO - optional
  criticalityDTO: z
    .object({
      id: z.number().positive('Criticality ID must be a positive number'),
    })
    .nullable()
    .optional(),

  // Task Status DTO - optional
  taskStatusDTO: z
    .object({
      id: z.number().positive('Task Status ID must be a positive number'),
    })
    .nullable()
    .optional(),
})

// Type for TypeScript inference
export type AccountPurposeFormData = z.infer<typeof AccountPurposeSchema>

// Validation function
export function validateAccountPurposeData(data: unknown): {
  success: boolean
  data?: AccountPurposeFormData
  errors?: z.ZodError
} {
  const result = AccountPurposeSchema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

// Sanitization function
export function sanitizeAccountPurposeData(data: unknown): AccountPurposeFormData {
  const d = data as Record<string, unknown>
  return {
    accountPurposeCode: String(d.accountPurposeCode || '').trim(),
    accountPurposeName: String(d.accountPurposeName || '').trim(),
    active: d.active !== undefined ? Boolean(d.active) : true,
    criticalityDTO: (d.criticalityDTO as { id?: number })?.id
      ? { id: Number((d.criticalityDTO as { id: number }).id) }
      : null,
    taskStatusDTO: (d.taskStatusDTO as { id?: number })?.id
      ? { id: Number((d.taskStatusDTO as { id: number }).id) }
      : null,
  }
}

