import { z } from 'zod'

export const AgreementTypeSchema = z.object({
  agreementTypeName: z
    .string()
    .min(1, 'Agreement Type Name is required')
    .max(200, 'Agreement Type Name must be 200 characters or less'),
  agreementTypeDescription: z
    .string()
    .min(1, 'Agreement Type Description is required')
    .max(500, 'Agreement Type Description must be 500 characters or less'),
  active: z.boolean().default(true),
  taskStatusDTO: z
    .object({
      id: z.number().positive('Task Status ID must be a positive number'),
    })
    .nullable()
    .optional(),
})

export type AgreementTypeFormData = z.infer<typeof AgreementTypeSchema>

export function validateAgreementTypeData(data: unknown): {
  success: boolean
  data?: AgreementTypeFormData
  errors?: z.ZodError
} {
  const result = AgreementTypeSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

export function sanitizeAgreementTypeData(data: unknown): AgreementTypeFormData {
  const d = data as Record<string, unknown>
  return {
    agreementTypeName: String(d.agreementTypeName || '').trim(),
    agreementTypeDescription: String(d.agreementTypeDescription || '').trim(),
    active: d.active !== undefined ? Boolean(d.active) : true,
    taskStatusDTO: (d.taskStatusDTO as { id?: number })?.id
      ? { id: Number((d.taskStatusDTO as { id: number }).id) }
      : null,
  }
}

