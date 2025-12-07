import { z } from 'zod'

// Step 8: Project Closure validation schema
export const step8ZodSchema = z.object({
  closureData: z.object({
    totalIncomeFund: z.string()
      .min(1, 'Total Income Received is mandatory')
      .refine(
        (val) => /^\d+(\.\d{1,2})?$/.test(val.replace(/,/g, '')),
        { message: 'Please enter a valid amount' }
      ),
    totalPayment: z.string()
      .min(1, 'Total Disbursed Payments is mandatory')
      .refine(
        (val) => /^\d+(\.\d{1,2})?$/.test(val.replace(/,/g, '')),
        { message: 'Please enter a valid amount' }
      ),
  }),
})

export type Step8FormData = z.infer<typeof step8ZodSchema>
