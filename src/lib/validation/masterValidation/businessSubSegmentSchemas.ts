import { z } from 'zod'

export const BusinessSubSegmentSchema = z.object({
  subSegmentName: z
    .string()
    .min(1, 'Sub Segment Name is required')
    .max(200, 'Sub Segment Name must be 200 characters or less'),
  subSegmentDescription: z
    .string()
    .min(1, 'Sub Segment Description is required')
    .max(500, 'Sub Segment Description must be 500 characters or less'),
  active: z.boolean().default(true),
  businessSegmentNameDTO: z
    .object({
      id: z.number().positive('Business Segment ID must be a positive number'),
    })
    .nullable()
    .refine((val) => val !== null && val !== undefined && val.id !== undefined, {
      message: 'Business Segment Name is required',
    }),
  taskStatusDTO: z
    .object({
      id: z.number().positive('Task Status ID must be a positive number'),
    })
    .nullable()
    .optional(),
})

export type BusinessSubSegmentFormData = z.infer<typeof BusinessSubSegmentSchema>

export function validateBusinessSubSegmentData(data: unknown): {
  success: boolean
  data?: BusinessSubSegmentFormData
  errors?: z.ZodError
} {
  const result = BusinessSubSegmentSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

export function sanitizeBusinessSubSegmentData(data: unknown): BusinessSubSegmentFormData {
  const d = data as Record<string, unknown>
  return {
    subSegmentName: String(d.subSegmentName || '').trim(),
    subSegmentDescription: String(d.subSegmentDescription || '').trim(),
    active: d.active !== undefined ? Boolean(d.active) : true,
    businessSegmentNameDTO: (d.businessSegmentNameDTO as { id?: number })?.id
      ? { id: Number((d.businessSegmentNameDTO as { id: number }).id) }
      : null,
    taskStatusDTO: (d.taskStatusDTO as { id?: number })?.id
      ? { id: Number((d.taskStatusDTO as { id: number }).id) }
      : null,
  }
}

