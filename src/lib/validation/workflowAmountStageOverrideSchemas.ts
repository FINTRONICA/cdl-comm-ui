import { z } from 'zod'

// Workflow Amount Stage Override validation schemas
export const WorkflowAmountStageOverrideSchemas = {
  createWorkflowAmountStageOverride: z.object({
    stageOrder: z
      .number()
      .int('Stage Order must be a whole number')
      .min(0, 'Stage Order must be 0 or greater')
      .max(10, 'Stage Order must be 10 or less'),

    requiredApprovals: z
      .number()
      .int('Required Approvals must be a whole number')
      .min(0, 'Required Approvals must be 0 or greater')
      .max(10, 'Required Approvals must be 10 or less'),

    keycloakGroup: z
      .string()
      .min(1, 'Keycloak Group is required')
      .max(100, 'Keycloak Group must be less than 100 characters')
      .regex(
        /^[A-Za-z0-9._-]+$/,
        'Keycloak Group can only contain letters, numbers, dots, hyphens, and underscores'
      )
      .refine((val) => val && val.trim() !== '', {
        message: 'Keycloak Group is required',
      }),

    stageKey: z
      .string()
      .min(1, 'Stage Key is required')
      .max(50, 'Stage Key must be less than 50 characters')
      .regex(
        /^[A-Za-z0-9_-]+$/,
        'Stage Key can only contain letters, numbers, hyphens, and underscores'
      )
      .refine((val) => val && val.trim() !== '', {
        message: 'Stage Key is required',
      }),

    workflowAmountRuleId: z
      .number()
      .int('Workflow Amount Rule ID must be a whole number')
      .positive('Valid Workflow Amount Rule is required'),
  }),

  updateWorkflowAmountStageOverride: z.object({
    id: z
      .number()
      .int('ID must be a whole number')
      .positive('Valid ID is required'),

    stageOrder: z
      .number()
      .int('Stage Order must be a whole number')
      .min(0, 'Stage Order must be 0 or greater')
      .max(10, 'Stage Order must be 10 or less'),

    requiredApprovals: z
      .number()
      .int('Required Approvals must be a whole number')
      .min(0, 'Required Approvals must be 0 or greater')
      .max(10, 'Required Approvals must be 10 or less'),

    keycloakGroup: z
      .string()
      .min(1, 'Keycloak Group is required')
      .max(100, 'Keycloak Group must be less than 100 characters')
      .regex(
        /^[A-Za-z0-9._-]+$/,
        'Keycloak Group can only contain letters, numbers, dots, hyphens, and underscores'
      )
      .refine((val) => val && val.trim() !== '', {
        message: 'Keycloak Group is required',
      }),

    stageKey: z
      .string()
      .min(1, 'Stage Key is required')
      .max(50, 'Stage Key must be less than 50 characters')
      .regex(
        /^[A-Za-z0-9_-]+$/,
        'Stage Key can only contain letters, numbers, hyphens, and underscores'
      )
      .refine((val) => val && val.trim() !== '', {
        message: 'Stage Key is required',
      }),

    workflowAmountRuleId: z
      .number()
      .int('Workflow Amount Rule ID must be a whole number')
      .positive('Valid Workflow Amount Rule is required'),
  }),

  // Form validation schema for UI
  workflowAmountStageOverrideForm: z.object({
    stageOrder: z
      .number()
      .int('Stage Order must be a whole number')
      .min(0, 'Stage Order must be 0 or greater')
      .max(10, 'Stage Order must be 10 or less'),

    requiredApprovals: z
      .number()
      .int('Required Approvals must be a whole number')
      .min(0, 'Required Approvals must be 0 or greater')
      .max(10, 'Required Approvals must be 10 or less'),

    keycloakGroup: z
      .string()
      .min(1, 'Keycloak Group is required')
      .max(100, 'Keycloak Group must be less than 100 characters')
      .regex(
        /^[A-Za-z0-9._-]+$/,
        'Keycloak Group can only contain letters, numbers, dots, hyphens, and underscores'
      )
      .refine((val) => val && val.trim() !== '', {
        message: 'Keycloak Group is required',
      }),

    stageKey: z
      .string()
      .min(1, 'Stage Key is required')
      .max(50, 'Stage Key must be less than 50 characters')
      .regex(
        /^[A-Za-z0-9_-]+$/,
        'Stage Key can only contain letters, numbers, hyphens, and underscores'
      )
      .refine((val) => val && val.trim() !== '', {
        message: 'Stage Key is required',
      }),

    amountRuleName: z
      .string()
      .min(1, 'Amount Rule Name is required')
      .refine((val) => val && val.trim() !== '', {
        message: 'Amount Rule Name is required',
      }),
  }),
}

// Helper function to validate workflow amount stage override data
export const validateWorkflowAmountStageOverride = (
  data: any,
  isUpdate: boolean = false
) => {
  const schema = isUpdate
    ? WorkflowAmountStageOverrideSchemas.updateWorkflowAmountStageOverride
    : WorkflowAmountStageOverrideSchemas.createWorkflowAmountStageOverride

  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      }
    }
    return {
      success: false,
      errors: [{ field: 'general', message: 'Validation failed' }],
    }
  }
}

// Cross-field validation function
export function validateStageOrderAndRequiredApprovals(
  stageOrder: number | string | null | undefined,
  requiredApprovals: number | string | null | undefined
): string | true {
  const stageOrderValue =
    stageOrder === '' || stageOrder === null || stageOrder === undefined
      ? 0
      : Number(stageOrder)
  const requiredApprovalsValue =
    requiredApprovals === '' ||
    requiredApprovals === null ||
    requiredApprovals === undefined
      ? 0
      : Number(requiredApprovals)

  if (isNaN(stageOrderValue) || isNaN(requiredApprovalsValue)) {
    return true
  }

  // Prevent both values being 0
  if (stageOrderValue === 0 && requiredApprovalsValue === 0) {
    return 'At least one of Stage Order or Required Approvals must be greater than 0'
  }

  if (stageOrderValue < 0 && requiredApprovalsValue > 0) {
    return 'If Stage Order is negative, Required Approvals must be 0 or less'
  }

  if (stageOrderValue === 0 && requiredApprovalsValue > 0) {
    return 'If Stage Order is 0, Required Approvals must be 0'
  }

  if (stageOrderValue > 0 && requiredApprovalsValue <= 0) {
    return 'If Stage Order is positive, Required Approvals must be greater than 0'
  }

  return true
}

// Helper function to get field validation rules for react-hook-form
export const getWorkflowAmountStageOverrideValidationRules = () => {
  return {
    stageOrder: {
      required: 'Stage Order is required',
      min: { value: 0, message: 'Stage Order must be 0 or greater' },
      max: { value: 10, message: 'Stage Order must be 10 or less' },
      valueAsNumber: true,
      validate: (value: any) => {
        // Handle undefined/null values - return true to allow form to initialize
        if (value === undefined || value === null) {
          return true // Allow undefined during initialization
        }

        // Handle empty string - allow it for now, will be converted to 0 on submit
        if (value === '') {
          return true // Allow empty string, will be converted to 0 on submit
        }

        // Convert to number and check if it's valid
        const numValue = Number(value)
        if (isNaN(numValue) || !Number.isInteger(numValue)) {
          return 'Stage Order must be a whole number'
        }

        // Check if input is too long (more than 2 digits)
        if (value.toString().length > 2) {
          return 'Stage Order cannot exceed 2 digits'
        }

        if (numValue < 0) {
          return 'Stage Order must be 0 or greater'
        }
        if (numValue > 10) {
          return 'Stage Order must be 10 or less'
        }
        return true
      },
    },
    requiredApprovals: {
      required: 'Required Approvals is required',
      min: { value: 0, message: 'Required Approvals must be 0 or greater' },
      max: { value: 10, message: 'Required Approvals must be 10 or less' },
      valueAsNumber: true,
      validate: (value: any) => {
        // Handle undefined/null values - return true to allow form to initialize
        if (value === undefined || value === null) {
          return true // Allow undefined during initialization
        }

        // Handle empty string - allow it for now, will be converted to 0 on submit
        if (value === '') {
          return true // Allow empty string, will be converted to 0 on submit
        }

        // Convert to number and check if it's valid
        const numValue = Number(value)
        if (isNaN(numValue) || !Number.isInteger(numValue)) {
          return 'Required Approvals must be a whole number'
        }

        // Check if input is too long (more than 2 digits)
        if (value.toString().length > 2) {
          return 'Required Approvals cannot exceed 2 digits'
        }

        if (numValue < 0) {
          return 'Required Approvals must be 0 or greater'
        }
        if (numValue > 10) {
          return 'Required Approvals must be 10 or less'
        }
        return true
      },
    },
    keycloakGroup: {
      required: 'Keycloak Group is required',
      minLength: { value: 1, message: 'Keycloak Group is required' },
      maxLength: {
        value: 100,
        message: 'Keycloak Group must be less than 100 characters',
      },
      pattern: {
        value: /^[A-Za-z\s._-]+$/,
        message:
          'Keycloak Group can only contain letters, spaces, dots, hyphens, and underscores',
      },
      validate: (value: any) => {
        if (!value || value.trim() === '') {
          return 'Keycloak Group is required'
        }
        if (!/^[A-Za-z\s._-]+$/.test(value)) {
          return 'Keycloak Group can only contain letters, spaces, dots, hyphens, and underscores'
        }
        if (value.length > 100) {
          return 'Keycloak Group must be less than 100 characters'
        }
        return true
      },
    },
    stageKey: {
      required: 'Stage Key is required',
      minLength: { value: 1, message: 'Stage Key is required' },
      maxLength: {
        value: 50,
        message: 'Stage Key must be less than 50 characters',
      },
      pattern: {
        value: /^[A-Za-z\s_-]+$/,
        message:
          'Stage Key can only contain letters, spaces, hyphens, and underscores',
      },
      validate: (value: any) => {
        if (!value || value.trim() === '') {
          return 'Stage Key is required'
        }
        if (!/^[A-Za-z\s_-]+$/.test(value)) {
          return 'Stage Key can only contain letters, spaces, hyphens, and underscores'
        }
        if (value.length > 50) {
          return 'Stage Key must be less than 50 characters'
        }
        return true
      },
    },
    amountRuleName: {
      required: 'Amount Rule Name is required',
      validate: (value: any) => {
        if (!value || value === '' || value === null) {
          return 'Amount Rule Name is required'
        }
        return true
      },
    },
  }
}

// Type definitions for form data
export type WorkflowAmountStageOverrideFormData = z.infer<
  typeof WorkflowAmountStageOverrideSchemas.workflowAmountStageOverrideForm
>
export type CreateWorkflowAmountStageOverrideData = z.infer<
  typeof WorkflowAmountStageOverrideSchemas.createWorkflowAmountStageOverride
>
export type UpdateWorkflowAmountStageOverrideData = z.infer<
  typeof WorkflowAmountStageOverrideSchemas.updateWorkflowAmountStageOverride
>

// Validation error type
export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  success: boolean
  data?: any
  errors?: ValidationError[]
}
