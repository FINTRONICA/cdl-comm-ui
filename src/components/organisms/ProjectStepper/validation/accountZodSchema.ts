import { z } from 'zod'
import { ACCOUNT_FIELD_VALIDATION_RULES } from './accountFieldValidation'

// Helper function to create Zod schema from field validation rules
const createAccountZodSchema = () => {
  const schemaFields: Record<string, z.ZodTypeAny> = {}

  Object.entries(ACCOUNT_FIELD_VALIDATION_RULES).forEach(([fieldName, rule]) => {
    let fieldSchema: z.ZodTypeAny

    // Date fields
    const dateFields = ['trustAccountOpenedDate', 'retentionAccountOpenedDate', 'subConstructionAccountOpenedDate', 'corporateAccountOpenedDate']
    if (dateFields.includes(fieldName)) {
      if (rule.required) {
        fieldSchema = z.any().refine((val) => val != null, {
          message: rule.message || 'Date is required'
        })
      } else {
        fieldSchema = z.any().optional()
      }
    } else {
      // Regular text fields
      if (rule.required) {
        fieldSchema = z.string().min(1, rule.message || 'This field is required')
      } else {
        fieldSchema = z.string().optional()
      }

      // Add max length validation
      if ('maxLength' in rule && rule.maxLength) {
        fieldSchema = fieldSchema.refine(
          (val) => !val || (typeof val === 'string' && val.length <= rule.maxLength!),
          {
            message: `${rule.message} (max ${rule.maxLength} characters)`
          }
        )
      }

      // Add pattern validation
      if ('pattern' in rule && rule.pattern) {
        fieldSchema = fieldSchema.refine(
          (val) => !val || (typeof val === 'string' && rule.pattern!.test(val)),
          {
            message: rule.message || 'Invalid format'
          }
        )
      }
    }

    schemaFields[fieldName] = fieldSchema
  })

  return schemaFields
}

// Create the base schema
const baseSchemaFields = createAccountZodSchema()

// Extended schema with all account fields
export const accountZodSchema = z.object({
  // Trust Account (All Mandatory)
  trustAccountNumber: baseSchemaFields.trustAccountNumber,
  trustAccountIban: baseSchemaFields.trustAccountIban,
  trustAccountOpenedDate: baseSchemaFields.trustAccountOpenedDate,
  trustAccountTitle: baseSchemaFields.trustAccountTitle,

  // Retention Account (All Mandatory)
  retentionAccountNumber: baseSchemaFields.retentionAccountNumber,
  retentionAccountIban: baseSchemaFields.retentionAccountIban,
  retentionAccountOpenedDate: baseSchemaFields.retentionAccountOpenedDate,
  retentionAccountTitle: baseSchemaFields.retentionAccountTitle,

  // Sub Construction Account (All Optional)
  subConstructionAccountNumber: baseSchemaFields.subConstructionAccountNumber,
  subConstructionAccountIban: baseSchemaFields.subConstructionAccountIban,
  subConstructionAccountOpenedDate: baseSchemaFields.subConstructionAccountOpenedDate,
  subConstructionAccountTitle: baseSchemaFields.subConstructionAccountTitle,

  // Corporate Account (All Optional)
  corporateAccountNumber: baseSchemaFields.corporateAccountNumber,
  corporateAccountIban: baseSchemaFields.corporateAccountIban,
  corporateAccountOpenedDate: baseSchemaFields.corporateAccountOpenedDate,
  corporateAccountTitle: baseSchemaFields.corporateAccountTitle,

  // Account Currency (Mandatory)
  accountCurrency: baseSchemaFields.accountCurrency,
})

// Refined schema with conditional validation for account groups
export const refinedAccountZodSchema = accountZodSchema
  .refine(
    (data) => {
      // If any sub-construction field is filled, all required fields in group must be filled
      const hasAnySubConstruction = 
        data.subConstructionAccountNumber || 
        data.subConstructionAccountIban || 
        data.subConstructionAccountTitle

      if (hasAnySubConstruction) {
        return !!(data.subConstructionAccountNumber && data.subConstructionAccountIban && data.subConstructionAccountTitle)
      }
      return true
    },
    {
      message: 'All Sub Construction Account fields are required when providing account details',
      path: ['subConstructionAccountNumber']
    }
  )
  .refine(
    (data) => {
      // If any corporate field is filled, all required fields in group must be filled
      const hasAnyCorporate = 
        data.corporateAccountNumber || 
        data.corporateAccountIban || 
        data.corporateAccountTitle

      if (hasAnyCorporate) {
        return !!(data.corporateAccountNumber && data.corporateAccountIban && data.corporateAccountTitle)
      }
      return true
    },
    {
      message: 'All Corporate Account fields are required when providing account details',
      path: ['corporateAccountNumber']
    }
  )

// Export the final schema
export const accountValidationSchema = refinedAccountZodSchema

// Type inference from schema
export type AccountFormData = z.infer<typeof accountValidationSchema>

// Validation function that can be used with React Hook Form
export const validateAccountForm = (data: any) => {
  try {
    accountValidationSchema.parse(data)
    return { isValid: true, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.issues.forEach((err: any) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { isValid: false, errors }
    }
    return { isValid: false, errors: { general: 'Validation failed' } }
  }
}

// Individual field validation function
// Returns: true for valid, error message string for invalid (React Hook Form compatible)
export const validateAccountField = (fieldName: string, value: any, formData?: any): string | true => {
  try {
    // Handle simple field paths - validate just the single field
    const fieldSchema = (accountValidationSchema.shape as any)[fieldName]
    
    if (!fieldSchema) {
      // Field not in schema, skip validation
      return true
    }
    
    // Validate the field value using safeParse
    const parseResult = fieldSchema.safeParse(value)
    
    if (!parseResult.success) {
      const error = parseResult.error.issues[0]
      const errorMessage = error?.message || 'Invalid value'
     
      return errorMessage
    }
    
    // Additional validation: check group validation if formData is provided
    if (formData) {
      const groupResult = refinedAccountZodSchema.safeParse({ ...formData, [fieldName]: value })
      if (!groupResult.success) {
        const fieldError = groupResult.error.issues.find(issue => 
          issue.path.join('.') === fieldName
        )
        if (fieldError) {
         
          return fieldError.message
        }
      }
    }
    
    return true
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      const errorMessage = firstError?.message || 'Invalid value'
     
      return errorMessage
    }
   
    return 'Validation failed'
  }
}

