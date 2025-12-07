import { z } from 'zod'

export const CountrySchema = z.object({
  countryId: z.string().optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less'),
  active: z.boolean().default(true),
  taskStatusDTO: z
    .object({
      id: z.number().positive('Task Status ID must be a positive number'),
    })
    .nullable()
    .optional(),
})

export type CountryFormData = z.infer<typeof CountrySchema>

export function validateCountryData(data: unknown): {
  success: boolean
  data?: CountryFormData
  errors?: z.ZodError
} {
  const result = CountrySchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

export function sanitizeCountryData(data: unknown): CountryFormData {
  const d = data as Record<string, unknown>
  return {
    countryId: d.countryId ? String(d.countryId).trim() : undefined,
    description: String(d.description || '').trim(),
    active: d.active !== undefined ? Boolean(d.active) : true,
    taskStatusDTO: (d.taskStatusDTO as { id?: number })?.id
      ? { id: Number((d.taskStatusDTO as { id: number }).id) }
      : null,
  }
}


