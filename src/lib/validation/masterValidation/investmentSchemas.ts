import { z } from 'zod'

export const InvestmentSchema = z.object({
  investmentName: z
    .string()
    .min(1, 'Investment Name is required')
    .max(200, 'Investment Name must be 200 characters or less'),
  investmentDescription: z
    .string()
    .min(1, 'Investment Description is required')
    .max(500, 'Investment Description must be 500 characters or less'),
  active: z.boolean().default(true),
  taskStatusDTO: z
    .object({
      id: z.number().positive('Task Status ID must be a positive number'),
    })
    .nullable()
    .optional(),
})

export type InvestmentFormData = z.infer<typeof InvestmentSchema>

export function validateInvestmentData(data: unknown): {
  success: boolean
  data?: InvestmentFormData
  errors?: z.ZodError
} {
  const result = InvestmentSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

export function sanitizeInvestmentData(data: unknown): InvestmentFormData {
  const d = data as Record<string, unknown>
  return {
    investmentName: String(d.investmentName || '').trim(),
    investmentDescription: String(d.investmentDescription || '').trim(),
    active: d.active !== undefined ? Boolean(d.active) : true,
    taskStatusDTO: (d.taskStatusDTO as { id?: number })?.id
      ? { id: Number((d.taskStatusDTO as { id: number }).id) }
      : null,
  }
}



