import { z } from 'zod'

export const ProductProgramSchema = z.object({
  programName: z
    .string()
    .min(1, 'Program Name is required')
    .max(200, 'Program Name must be 200 characters or less'),
  programDescription: z
    .string()
    .min(1, 'Program Description is required')
    .max(500, 'Program Description must be 500 characters or less'),
  active: z.boolean().default(true),
  taskStatusDTO: z
    .object({
      id: z.number().positive('Task Status ID must be a positive number'),
    })
    .nullable()
    .optional(),
})

export type ProductProgramFormData = z.infer<typeof ProductProgramSchema>

export function validateProductProgramData(data: unknown): {
  success: boolean
  data?: ProductProgramFormData
  errors?: z.ZodError
} {
  const result = ProductProgramSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

export function sanitizeProductProgramData(data: unknown): ProductProgramFormData {
  const d = data as Record<string, unknown>
  return {
    programName: String(d.programName || '').trim(),
    programDescription: String(d.programDescription || '').trim(),
    active: d.active !== undefined ? Boolean(d.active) : true,
    taskStatusDTO: (d.taskStatusDTO as { id?: number })?.id
      ? { id: Number((d.taskStatusDTO as { id: number }).id) }
      : null,
  }
}

