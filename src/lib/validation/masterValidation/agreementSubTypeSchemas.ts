import { z } from 'zod'

export const AgreementSubTypeSchema = z.object({
  subTypeName: z
    .string()
    .min(1, 'Sub Type Name is required')
    .max(200, 'Sub Type Name must be 200 characters or less'),
  subTypeDescription: z
    .string()
    .min(1, 'Sub Type Description is required')
    .max(500, 'Sub Type Description must be 500 characters or less'),
  active: z.boolean().default(true),
  agreementTypeDTO: z
    .object({
      id: z.number().positive('Agreement Type ID must be a positive number'),
    })
    .nullable()
    .optional(),
  taskStatusDTO: z
    .object({
      id: z.number().positive('Task Status ID must be a positive number'),
    })
    .nullable()
    .optional(),
})

export type AgreementSubTypeFormData = z.infer<typeof AgreementSubTypeSchema>

export function validateAgreementSubTypeData(data: unknown): {
  success: boolean
  data?: AgreementSubTypeFormData
  errors?: z.ZodError
} {
  const result = AgreementSubTypeSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

export function sanitizeAgreementSubTypeData(data: unknown): AgreementSubTypeFormData {
  const d = data as Record<string, unknown>
  return {
    subTypeName: String(d.subTypeName || '').trim(),
    subTypeDescription: String(d.subTypeDescription || '').trim(),
    active: d.active !== undefined ? Boolean(d.active) : true,
    agreementTypeDTO: (d.agreementTypeDTO as { id?: number })?.id
      ? { id: Number((d.agreementTypeDTO as { id: number }).id) }
      : null,
    taskStatusDTO: (d.taskStatusDTO as { id?: number })?.id
      ? { id: Number((d.taskStatusDTO as { id: number }).id) }
      : null,
  }
}

