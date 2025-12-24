import { z } from 'zod'

// Workflow Definition validation schemas
export const WorkflowDefinitionSchemas = {
  createWorkflowDefinition: z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name must be less than 100 characters')
      .regex(
        /^[A-Za-z\s_-]+$/,
        'Name can only contain letters, spaces, hyphens, and underscores'
      )
      .refine((val) => val && val.trim() !== '', {
        message: 'Name is required',
      }),

    version: z
      .number()
      .min(0.1, 'Version must be at least 0.1')
      .max(10, 'Version must be 10 or less')
      .refine((val) => val > 0, {
        message: 'Version must be greater than 0',
      }),

    amountBased: z.boolean(),

    moduleCode: z
      .string()
      .min(1, 'Module Code is required')
      .max(100, 'Module Code must be less than 100 characters')
      .regex(
        /^[A-Za-z_-]+$/,
        'Module Code can only contain letters, hyphens, and underscores'
      )
      .refine((val) => val && val.trim() !== '', {
        message: 'Module Code is required',
      }),

    actionCode: z
      .string()
      .min(1, 'Action Code is required')
      .max(100, 'Action Code must be less than 100 characters')
      .regex(
        /^[A-Za-z_-]+$/,
        'Action Code can only contain letters, hyphens, and underscores'
      )
      .refine((val) => val && val.trim() !== '', {
        message: 'Action Code is required',
      }),

    applicationModuleId: z
      .number()
      .int('Application Module ID must be a whole number')
      .positive('Valid Application Module is required'),

    workflowActionId: z
      .number()
      .int('Workflow Action ID must be a whole number')
      .positive('Valid Workflow Action is required'),

    active: z.boolean(),

    stageTemplateIds: z.array(z.number().int().positive())
      .optional()
      .nullable(),

    amountRuleIds: z.array(z.number().int().positive())
      .optional()
      .nullable(),
  }),

  updateWorkflowDefinition: z.object({
    id: z
      .number()
      .int('ID must be a whole number')
      .positive('Valid ID is required'),

    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name must be less than 100 characters')
      .regex(
        /^[A-Za-z\s_-]+$/,
        'Name can only contain letters, spaces, hyphens, and underscores'
      )
      .refine((val) => val && val.trim() !== '', {
        message: 'Name is required',
      }),

    version: z
      .number()
      .min(0.1, 'Version must be at least 0.1')
      .max(10, 'Version must be 10 or less')
      .refine((val) => val > 0, {
        message: 'Version must be greater than 0',
      }),

    amountBased: z.boolean(),

    moduleCode: z
      .string()
      .min(1, 'Module Code is required')
      .max(100, 'Module Code must be less than 100 characters')
      .regex(
        /^[A-Za-z_-]+$/,
        'Module Code can only contain letters, hyphens, and underscores'
      )
      .refine((val) => val && val.trim() !== '', {
        message: 'Module Code is required',
      }),

    actionCode: z
      .string()
      .min(1, 'Action Code is required')
      .max(100, 'Action Code must be less than 100 characters')
      .regex(
        /^[A-Za-z_-]+$/,
        'Action Code can only contain letters, hyphens, and underscores'
      )
      .refine((val) => val && val.trim() !== '', {
        message: 'Action Code is required',
      }),

    applicationModuleId: z
      .number()
      .int('Application Module ID must be a whole number')
      .positive('Valid Application Module is required'),

    workflowActionId: z
      .number()
      .int('Workflow Action ID must be a whole number')
      .positive('Valid Workflow Action is required'),

    active: z.boolean(),

    stageTemplateIds: z.array(z.number().int().positive())
      .optional()
      .nullable(),

    amountRuleIds: z.array(z.number().int().positive())
      .optional()
      .nullable(),
  }),

  workflowDefinitionForm: z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name must be less than 100 characters'),

    version: z
      .union([z.number(), z.string()])
      .refine(
        (val) => {
          const num = typeof val === 'string' ? parseFloat(val) : val
          return !isNaN(num) && num > 0 && num <= 10
        },
        { message: 'Version must be between 0.1 and 10' }
      )
      .transform((val) => (typeof val === 'string' ? parseFloat(val) : val)),

    amountBased: z.boolean(),

    moduleCode: z
      .string()
      .min(1, 'Module Code is required')
      .max(100, 'Module Code must be less than 100 characters'),

    actionCode: z
      .string()
      .min(1, 'Action Code is required')
      .max(100, 'Action Code must be less than 100 characters'),

    applicationModuleId: z
      .union([z.number(), z.string(), z.null()])
      .refine(
        (val) => {
          if (val === null || val === undefined || val === '') return false
          const num = typeof val === 'string' ? parseInt(val, 10) : val
          return !isNaN(num) && num > 0
        },
        { message: 'Application Module is required' }
      )
      .transform((val) => {
        if (val === null || val === undefined || val === '') return null
        return typeof val === 'string' ? parseInt(val, 10) : val
      }),

    workflowActionId: z
      .union([z.number(), z.string(), z.null()])
      .refine(
        (val) => {
          if (val === null || val === undefined || val === '') return false
          const num = typeof val === 'string' ? parseInt(val, 10) : val
          return !isNaN(num) && num > 0
        },
        { message: 'Workflow Action is required' }
      )
      .transform((val) => {
        if (val === null || val === undefined || val === '') return null
        return typeof val === 'string' ? parseInt(val, 10) : val
      }),

    active: z.boolean(),
  }),
}

// Validation functions
export const validateWorkflowDefinition = (
  data: unknown,
  schema: z.ZodSchema
): { success: boolean; errors?: Record<string, string> } => {
  try {
    schema.parse(data)
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: 'Validation failed' } }
  }
}

// Individual field validation function using Zod schema
// Returns: true for valid, error message string for invalid (React Hook Form compatible)
export const validateWorkflowDefinitionField = (
  fieldName: string,
  value: unknown,
  allValues?: Record<string, unknown>
): string | true => {
  try {
    const schema = WorkflowDefinitionSchemas.workflowDefinitionForm
    const fieldSchema = (schema.shape as any)[fieldName]

    if (!fieldSchema) {
      return true
    }

    // For version field, handle string/number conversion
    if (fieldName === 'version') {
      if (value === null || value === undefined || value === '') {
        return 'Version is required'
      }
      const numValue = typeof value === 'string' ? parseFloat(value) : Number(value)
      if (isNaN(numValue)) {
        return 'Version must be a valid number'
      }
      if (numValue <= 0) {
        return 'Version must be greater than 0'
      }
      if (numValue > 10) {
        return 'Version must be 10 or less'
      }
      return true
    }

    // For select fields (applicationModuleId, workflowActionId), handle null/empty
    if (fieldName === 'applicationModuleId' || fieldName === 'workflowActionId') {
      if (!value || value === null || value === '' || value === 0) {
        return fieldName === 'applicationModuleId'
          ? 'Application Module is required'
          : 'Workflow Action is required'
      }
      return true
    }

    // For other fields, use zod schema validation
    const parseResult = fieldSchema.safeParse(value)

    if (!parseResult.success) {
      const error = parseResult.error.issues[0]
      return error?.message || 'Invalid value'
    }

    return true
  } catch {
    return true
  }
}

// React Hook Form validation rules - uses schema validation
export const getWorkflowDefinitionValidationRules = () => {
  return {
    name: {
      required: 'Name is required',
      maxLength: { value: 100, message: 'Name must be less than 100 characters' },
      validate: (value: unknown) => validateWorkflowDefinitionField('name', value),
    },
    version: {
      required: 'Version is required',
      validate: (value: unknown) => validateWorkflowDefinitionField('version', value),
    },
    moduleCode: {
      required: 'Module Code is required',
      maxLength: { value: 100, message: 'Module Code must be less than 100 characters' },
      validate: (value: unknown) => validateWorkflowDefinitionField('moduleCode', value),
    },
    actionCode: {
      required: 'Action Code is required',
      maxLength: { value: 100, message: 'Action Code must be less than 100 characters' },
      validate: (value: unknown) => validateWorkflowDefinitionField('actionCode', value),
    },
    applicationModuleId: {
      required: 'Application Module is required',
      validate: (value: unknown) => validateWorkflowDefinitionField('applicationModuleId', value),
    },
    workflowActionId: {
      required: 'Workflow Action is required',
      validate: (value: unknown) => validateWorkflowDefinitionField('workflowActionId', value),
    },
    amountBased: {},
    active: {},
  }
}