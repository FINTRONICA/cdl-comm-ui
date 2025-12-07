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

// React Hook Form validation rules
export const getWorkflowDefinitionValidationRules = () => {
  return {
    name: {
      required: 'Name is required',
      maxLength: { value: 100, message: 'Name must be less than 100 characters' },
      pattern: {
        value: /^[A-Za-z\s_-]+$/,
        message: 'Name can only contain letters, spaces, hyphens, and underscores'
      },
      validate: (value: string | number | null | undefined) => {
        if (!value || value === '' || value === null) {
          return 'Name is required'
        }
        const stringValue = String(value).trim()
        if (stringValue.length === 0) {
          return 'Name is required'
        }
        if (stringValue.length > 100) {
          return 'Name must be less than 100 characters'
        }
        if (!/^[A-Za-z\s_-]+$/.test(stringValue)) {
          return 'Name can only contain letters, spaces, hyphens, and underscores'
        }
        return true
      }
    },
    version: {
      required: 'Version is required',
      min: { value: 0.1, message: 'Version must be at least 0.1' },
      max: { value: 10, message: 'Version must be 10 or less' },
      valueAsNumber: true,
      validate: (value: string | number | null | undefined) => {
        if (value === undefined || value === null || value === '') {
          return 'Version is required'
        }
        const numValue = Number(value)
        if (isNaN(numValue)) {
          return 'Version must be a valid number'
        }
        if (numValue <= 0) {
          return 'Version must be greater than 0'
        }
        if (numValue < 0.1) {
          return 'Version must be at least 0.1'
        }
        if (numValue > 10) {
          return 'Version must be 10 or less'
        }
        return true
      }
    },
    moduleCode: {
      required: 'Module Code is required',
      maxLength: { value: 100, message: 'Module Code must be less than 100 characters' },
      pattern: {
        value: /^[A-Za-z_-]+$/,
        message: 'Module Code can only contain letters, hyphens, and underscores'
      },
      validate: (value: string | number | null | undefined) => {
        if (!value || value === '' || value === null) {
          return 'Module Code is required'
        }
        const stringValue = String(value).trim()
        if (stringValue.length === 0) {
          return 'Module Code is required'
        }
        if (stringValue.length > 100) {
          return 'Module Code must be less than 100 characters'
        }
        if (!/^[A-Za-z_-]+$/.test(stringValue)) {
          return 'Module Code can only contain letters, hyphens, and underscores'
        }
        return true
      }
    },
    actionCode: {
      required: 'Action Code is required',
      maxLength: { value: 100, message: 'Action Code must be less than 100 characters' },
      pattern: {
        value: /^[A-Za-z_-]+$/,
        message: 'Action Code can only contain letters, hyphens, and underscores'
      },
      validate: (value: string | number | null | undefined) => {
        if (!value || value === '' || value === null) {
          return 'Action Code is required'
        }
        const stringValue = String(value).trim()
        if (stringValue.length === 0) {
          return 'Action Code is required'
        }
        if (stringValue.length > 100) {
          return 'Action Code must be less than 100 characters'
        }
        if (!/^[A-Za-z_-]+$/.test(stringValue)) {
          return 'Action Code can only contain letters, hyphens, and underscores'
        }
        return true
      }
    },
    applicationModuleId: {
      required: 'Application Module is required',
      validate: (value: string | number | null | undefined) => {
        if (!value || value === '' || value === null) {
          return 'Application Module is required'
        }
        const numValue = Number(value)
        if (isNaN(numValue) || !Number.isInteger(numValue) || numValue <= 0) {
          return 'Valid Application Module is required'
        }
        return true
      }
    },
    workflowActionId: {
      required: 'Workflow Action is required',
      validate: (value: string | number | null | undefined) => {
        if (!value || value === '' || value === null) {
          return 'Workflow Action is required'
        }
        const numValue = Number(value)
        if (isNaN(numValue) || !Number.isInteger(numValue) || numValue <= 0) {
          return 'Valid Workflow Action is required'
        }
        return true
      }
    },
    amountBased: {
    },
    active: {
    },
  }
}