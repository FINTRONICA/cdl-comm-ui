import { z } from 'zod'

export const AgreementSegmentSchema = z.object({
  segmentName: z
    .string()
    .min(1, 'Segment Name is required')
    .max(200, 'Segment Name must be 200 characters or less'),
  segmentDescription: z
    .string()
    .min(1, 'Segment Description is required')
    .max(500, 'Segment Description must be 500 characters or less'),
  active: z.boolean().default(true),
  taskStatusDTO: z
    .object({
      id: z.number().positive('Task Status ID must be a positive number'),
    })
    .nullable()
    .optional(),
})

export type AgreementSegmentFormData = z.infer<typeof AgreementSegmentSchema>

export function validateAgreementSegmentData(data: unknown): {
  success: boolean
  data?: AgreementSegmentFormData
  errors?: z.ZodError
} {
  const result = AgreementSegmentSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

export function sanitizeAgreementSegmentData(data: unknown): AgreementSegmentFormData {
  const d = data as Record<string, unknown>
  return {
    segmentName: String(d.segmentName || '').trim(),
    segmentDescription: String(d.segmentDescription || '').trim(),
    active: d.active !== undefined ? Boolean(d.active) : true,
    taskStatusDTO: (d.taskStatusDTO as { id?: number })?.id
      ? { id: Number((d.taskStatusDTO as { id: number }).id) }
      : null,
  }
}

