import { z } from 'zod'

// Business Segment Schema
export const BusinessSegmentSchema = z.object({
  // Segment Name - mandatory
  segmentName: z
    .string()
    .min(1, 'Segment Name is required')
    .max(200, 'Segment Name must be 200 characters or less'),

  // Segment Description - mandatory
  segmentDescription: z
    .string()
    .min(1, 'Segment Description is required')
    .max(500, 'Segment Description must be 500 characters or less'),

  // Active status - mandatory boolean
  active: z.boolean().default(true),

  // Task Status DTO - optional
  taskStatusDTO: z
    .object({
      id: z.number().positive('Task Status ID must be a positive number'),
    })
    .nullable()
    .optional(),
})

// Type for TypeScript inference
export type BusinessSegmentFormData = z.infer<typeof BusinessSegmentSchema>

// Validation function
export function validateBusinessSegmentData(data: unknown): {
  success: boolean
  data?: BusinessSegmentFormData
  errors?: z.ZodError
} {
  const result = BusinessSegmentSchema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

// Sanitization function
export function sanitizeBusinessSegmentData(data: unknown): BusinessSegmentFormData {
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

