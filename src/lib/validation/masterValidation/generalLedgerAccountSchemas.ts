import { z } from 'zod'

export const GeneralLedgerAccountSchema = z.object({
  ledgerAccountNumber: z
    .string()
    .min(1, 'Ledger Account Number is required')
    .max(50, 'Ledger Account Number must be 50 characters or less'),
  branchIdentifierCode: z
    .string()
    .min(1, 'Branch Identifier Code is required')
    .max(50, 'Branch Identifier Code must be 50 characters or less'),
  ledgerAccountDescription: z
    .string()
    .min(1, 'Ledger Account Description is required')
    .max(500, 'Ledger Account Description must be 500 characters or less'),
  ledgerAccountTypeCode: z
    .string()
    .min(1, 'Ledger Account Type Code is required')
    .max(50, 'Ledger Account Type Code must be 50 characters or less'),
  active: z.boolean().default(true),
  taskStatusDTO: z
    .object({
      id: z.number().positive('Task Status ID must be a positive number'),
    })
    .nullable()
    .optional(),
})

export type GeneralLedgerAccountFormData = z.infer<typeof GeneralLedgerAccountSchema>

export function validateGeneralLedgerAccountData(data: unknown): {
  success: boolean
  data?: GeneralLedgerAccountFormData
  errors?: z.ZodError
} {
  const result = GeneralLedgerAccountSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

export function sanitizeGeneralLedgerAccountData(data: unknown): GeneralLedgerAccountFormData {
  const d = data as Record<string, unknown>
  return {
    ledgerAccountNumber: String(d.ledgerAccountNumber || '').trim(),
    branchIdentifierCode: String(d.branchIdentifierCode || '').trim(),
    ledgerAccountDescription: String(d.ledgerAccountDescription || '').trim(),
    ledgerAccountTypeCode: String(d.ledgerAccountTypeCode || '').trim(),
    active: d.active !== undefined ? Boolean(d.active) : true,
    taskStatusDTO: (d.taskStatusDTO as { id?: number })?.id
      ? { id: Number((d.taskStatusDTO as { id: number }).id) }
      : null,
  }
}

