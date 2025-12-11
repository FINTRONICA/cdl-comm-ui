import { z } from 'zod'

const MAX_NAME_LENGTH = 200
const MAX_DESCRIPTION_LENGTH = 500

export const AgreementTypeSchema = z.object({
  agreementTypeName: z
    .string()
    .min(1, 'Agreement Type Name is required')
    .max(
      MAX_NAME_LENGTH,
      `Agreement Type Name must be ${MAX_NAME_LENGTH} characters or less`
    )
    .trim(),
  agreementTypeDescription: z
    .string()
    .min(1, 'Agreement Type Description is required')
    .max(
      MAX_DESCRIPTION_LENGTH,
      `Agreement Type Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`
    )
    .trim(),
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
  }
  return { success: false, errors: result.error }
}

export function sanitizeAgreementTypeData(data: unknown): AgreementTypeFormData {
  const d = data as Record<string, unknown>
  return {
    agreementTypeName: String(d.agreementTypeName || '').trim(),
    agreementTypeDescription: String(d.agreementTypeDescription || '').trim(),
    active: d.active !== undefined ? Boolean(d.active) : true,
    taskStatusDTO:
      (d.taskStatusDTO as { id?: number })?.id &&
      Number.isInteger((d.taskStatusDTO as { id?: number }).id)
        ? { id: Number((d.taskStatusDTO as { id?: number }).id) }
        : null,
  }
}
