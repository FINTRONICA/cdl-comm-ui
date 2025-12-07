import { z } from 'zod'

// Payment Plan item schema
const paymentPlanItemSchema = z.object({
  installmentNumber: z.number()
    .min(1, 'Installment Number must be at least 1')
    .max(999, 'Installment Number must be maximum 999'),
  installmentPercentage: z.string()
    .min(1, 'Installment Percentage is required')
    .max(5, 'Installment Percentage must be maximum 5 characters')
    .regex(/^[0-9]+(\.[0-9]{1,2})?$/, 'Installment Percentage must be a valid number (e.g., 25 or 25.5)'),
  projectCompletionPercentage: z.string()
    .min(1, 'Project Completion Percentage is required')
    .max(5, 'Project Completion Percentage must be maximum 5 characters')
    .regex(/^[0-9]+(\.[0-9]{1,2})?$/, 'Project Completion Percentage must be a valid number (e.g., 25 or 25.5)'),
})

// Main payment plan validation schema
export const paymentPlanFormValidationSchema = z.object({
  paymentPlan: z.array(paymentPlanItemSchema)
    .min(1, 'At least one payment plan is required')
    .max(50, 'Maximum 50 payment plans allowed'),
})

export type PaymentPlanFormData = z.infer<typeof paymentPlanFormValidationSchema>

// Field validation rules for individual field validation
export const PAYMENT_PLAN_FIELD_VALIDATION_RULES = {
  'paymentPlan.installmentNumber': { required: true, min: 1, max: 999 },
  'paymentPlan.installmentPercentage': { required: true, maxLength: 5, pattern: /^[0-9]+(\.[0-9]{1,2})?$/ },
  'paymentPlan.projectCompletionPercentage': { required: true, maxLength: 5, pattern: /^[0-9]+(\.[0-9]{1,2})?$/ },
}

// Individual field validation function
export const validatePaymentPlanField = (
  fieldName: keyof PaymentPlanFormData | string,
  value: string | number | null
): string | null => {
  try {
    // Handle nested field names like 'paymentPlan.installmentNumber'
    const fieldPath = fieldName.split('.')
    let schema: any = paymentPlanFormValidationSchema
    
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
