import { z } from 'zod'

export const CurrencySchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be 200 characters or less'),
  isEnabled: z.boolean().default(true),
  taskStatusDTO: z
    .object({
      id: z.number().positive('Task Status ID must be a positive number'),
    })
    .nullable()
    .optional(),
})

export type CurrencyFormData = z.infer<typeof CurrencySchema>

export function validateCurrencyData(data: unknown): {
  success: boolean
  data?: CurrencyFormData
  errors?: z.ZodError
} {
  const result = CurrencySchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

export function sanitizeCurrencyData(data: unknown): CurrencyFormData {
  const d = data as Record<string, unknown>
  return {
    description: String(d.description || '').trim(),
    isEnabled: d.isEnabled !== undefined ? Boolean(d.isEnabled) : true,
    taskStatusDTO: (d.taskStatusDTO as { id?: number })?.id
      ? { id: Number((d.taskStatusDTO as { id: number }).id) }
      : null,
  }
}

