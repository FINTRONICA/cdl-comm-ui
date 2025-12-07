import { z } from 'zod'

// Project Closure schema
export const projectClosureFormValidationSchema = z.object({
  closureData: z.object({
    totalIncomeFund: z.string()
      .min(1, 'Total Income Received is required')
      .max(20, 'Total Income Received must be maximum 20 characters')
      .regex(/^[0-9,]+$/, 'Total Income Received must contain only numbers and commas'),
    totalPayment: z.string()
      .min(1, 'Total Disbursed Payments is required')
      .max(20, 'Total Disbursed Payments must be maximum 20 characters')
      .regex(/^[0-9,]+$/, 'Total Disbursed Payments must contain only numbers and commas'),
  }),
})

export type ProjectClosureFormData = z.infer<typeof projectClosureFormValidationSchema>

// Field validation rules for individual field validation
export const PROJECT_CLOSURE_FIELD_VALIDATION_RULES = {
  'closureData.totalIncomeFund': { required: true, maxLength: 20, pattern: /^[0-9,]+$/ },
  'closureData.totalPayment': { required: true, maxLength: 20, pattern: /^[0-9,]+$/ },
}

// Individual field validation function
export const validateProjectClosureField = (
  fieldName: keyof ProjectClosureFormData | string,
  value: string | number | null
): string | null => {
  try {
    // Handle nested field names like 'closureData.totalIncomeFund'
    const fieldPath = fieldName.split('.')
    let schema: any = projectClosureFormValidationSchema
    
    for (const path of fieldPath) {
      if (schema.shape && schema.shape[path]) {
        schema = schema.shape[path]
      } else {
        return 'Invalid field name'
      }
    }
    
    schema.parse(value)
    return null
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || 'Invalid input'
    }
    return 'Invalid input'
  }
}
