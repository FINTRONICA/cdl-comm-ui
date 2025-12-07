import { z } from 'zod';

// Workflow Stage Template validation schemas
export const WorkflowStageTemplateSchemas = {
  createWorkflowStageTemplate: z.object({
    stageOrder: z
      .number()
      .int('Stage Order must be a whole number')
      .min(0, 'Stage Order must be 0 or greater')
      .max(10, 'Stage Order must be 10 or less'),
    
    stageKey: z
      .string()
      .min(1, 'Stage Key is required')
      .max(50, 'Stage Key must be less than 50 characters')
      .regex(
        /^[A-Za-z_-]+$/,
        'Stage Key can only contain letters, hyphens, and underscores (no numbers allowed)'
      )
      .refine((val) => val && val.trim() !== '', {
        message: 'Stage Key is required',
      }),
    
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
    
    requiredApprovals: z
      .number()
      .int('Required Approvals must be a whole number')
      .min(0, 'Required Approvals must be 0 or greater')
      .max(10, 'Required Approvals must be 10 or less'),
    
    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name must be exactly 100 characters or less')
      .regex(/^[A-Za-z0-9\s_-]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores'),
    
    description: z.string()
      .max(500, 'Description must be exactly 500 characters or less')
      .optional(),
    
    slaHours: z.number()
      .int('SLA Hours must be a whole number')
      .min(1, 'SLA Hours must be at least 1')
      .max(9999, 'SLA Hours must be less than 10000 (4 digits maximum)'),
    
    workflowDefinitionDTO: z.string()
      .min(1, 'Workflow Definition is required')
      .refine((val) => val && val.trim() !== '', {
        message: 'Workflow Definition is required'
      }),
    
    createdBy: z.string()
      .min(1, 'Created By is required')
      .max(100, 'Created By must be less than 100 characters')
      .optional(),
  }),

  updateWorkflowStageTemplate: z.object({
    id: z.number().int().positive('Valid ID is required'),
    stageOrder: z
      .number()
      .int('Stage Order must be a whole number')
      .min(0, 'Stage Order must be 0 or greater')
      .max(10, 'Stage Order must be 10 or less'),
    
    stageKey: z
      .string()
      .min(1, 'Stage Key is required')
      .max(50, 'Stage Key must be less than 50 characters')
      .regex(
        /^[A-Za-z_-]+$/,
        'Stage Key can only contain letters, hyphens, and underscores (no numbers allowed)'
      )
      .refine((val) => val && val.trim() !== '', {
        message: 'Stage Key is required',
      }),
    
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
    
    requiredApprovals: z
      .number()
      .int('Required Approvals must be a whole number')
      .min(0, 'Required Approvals must be 0 or greater')
      .max(10, 'Required Approvals must be 10 or less'),
    
    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name must be exactly 100 characters or less')
      .regex(/^[A-Za-z0-9\s_-]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores'),
    
    description: z.string()
      .max(500, 'Description must be exactly 500 characters or less')
      .optional(),
    
    slaHours: z.number()
      .int('SLA Hours must be a whole number')
      .min(1, 'SLA Hours must be at least 1')
      .max(9999, 'SLA Hours must be less than 10000 (4 digits maximum)'),
    
    workflowDefinitionDTO: z.string()
      .min(1, 'Workflow Definition is required')
      .refine((val) => val && val.trim() !== '', {
        message: 'Workflow Definition is required'
      }),
    
    createdBy: z.string()
      .min(1, 'Created By is required')
      .max(100, 'Created By must be less than 100 characters')
      .optional(),
    
    updatedBy: z.string()
      .min(1, 'Updated By is required')
      .max(100, 'Updated By must be less than 100 characters')
      .optional(),
  }),

  // Form validation schema for UI
  workflowStageTemplateForm: z.object({
    stageOrder: z
      .number()
      .int('Stage Order must be a whole number')
      .min(0, 'Stage Order must be 0 or greater')
      .max(10, 'Stage Order must be 10 or less'),
    
    stageKey: z
      .string()
      .min(1, 'Stage Key is required')
      .max(50, 'Stage Key must be less than 50 characters')
      .regex(
        /^[A-Za-z_-]+$/,
        'Stage Key can only contain letters, hyphens, and underscores (no numbers allowed)'
      )
      .refine((val) => val && val.trim() !== '', {
        message: 'Stage Key is required',
      }),
    
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
    
    requiredApprovals: z
      .number()
      .int('Required Approvals must be a whole number')
      .min(0, 'Required Approvals must be 0 or greater')
      .max(10, 'Required Approvals must be 10 or less'),
    
    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name must be exactly 100 characters or less')
      .regex(/^[A-Za-z0-9\s_-]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores'),
    
    description: z.string()
      .max(500, 'Description must be exactly 500 characters or less')
      .optional(),
    
    slaHours: z.number()
      .int('SLA Hours must be a whole number')
      .min(1, 'SLA Hours must be at least 1')
      .max(9999, 'SLA Hours must be less than 10000 (4 digits maximum)'),
    
    workflowDefinitionId: z.string()
      .min(1, 'Workflow Definition is required')
      .refine((val) => val && val.trim() !== '', {
        message: 'Workflow Definition is required'
      }),
  }),
};

// Helper function to validate workflow stage template data
export const validateWorkflowStageTemplate = (data: any, isUpdate: boolean = false) => {
  const schema = isUpdate ? WorkflowStageTemplateSchemas.updateWorkflowStageTemplate : WorkflowStageTemplateSchemas.createWorkflowStageTemplate;
  
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      };
    }
    return {
      success: false,
      errors: [{ field: 'general', message: 'Validation failed' }]
    };
  }
};

// Helper function to get field validation rules for react-hook-form
export const getWorkflowStageTemplateValidationRules = () => {
  return {
    stageOrder: {
      required: 'Stage Order is required',
      min: { value: 0, message: 'Stage Order must be 0 or greater' },
      max: { value: 10, message: 'Stage Order must be 10 or less' },
      valueAsNumber: true,
      validate: (value: any) => {
        if (isNaN(value) || !Number.isInteger(Number(value))) {
          return 'Stage Order must be a whole number';
        }
        return true;
      }
    },
    stageKey: {
      required: 'Stage Key is required',
      minLength: { value: 1, message: 'Stage Key is required' },
      maxLength: { value: 50, message: 'Stage Key must be less than 50 characters' },
      pattern: {
        value: /^[A-Za-z_-]+$/,
        message: 'Stage Key can only contain letters, hyphens, and underscores (no numbers allowed)'
      },
      validate: (value: any) => {
        if (!value || value.trim() === '') {
          return 'Stage Key is required';
        }
        // Additional check to ensure no digits are present
        if (/[0-9]/.test(value)) {
          return 'Stage Key cannot contain any numbers (0-9)';
        }
        return true;
      }
    },
    keycloakGroup: {
      required: 'Keycloak Group is required',
      minLength: { value: 1, message: 'Keycloak Group is required' },
      maxLength: { value: 100, message: 'Keycloak Group must be less than 100 characters' },
      pattern: {
        value: /^[A-Za-z0-9._-]+$/,
        message: 'Keycloak Group can only contain letters, numbers, dots, hyphens, and underscores'
      },
      validate: (value: any) => {
        if (!value || value.trim() === '') {
          return 'Keycloak Group is required';
        }
        return true;
      }
    },
    requiredApprovals: {
      required: 'Required Approvals is required',
      min: { value: 0, message: 'Required Approvals must be 0 or greater' },
      max: { value: 10, message: 'Required Approvals must be 10 or less' },
      valueAsNumber: true,
      validate: (value: any) => {
        if (isNaN(value) || !Number.isInteger(Number(value))) {
          return 'Required Approvals must be a whole number';
        }
        return true;
      }
    },
    name: {
      required: 'Name is required',
      minLength: { value: 1, message: 'Name is required' },
      maxLength: { value: 100, message: 'Name must be exactly 100 characters or less' },
      pattern: {
        value: /^[A-Za-z0-9\s_-]+$/,
        message: 'Name can only contain letters, numbers, spaces, hyphens, and underscores'
      }
    },
    description: {
      maxLength: { value: 500, message: 'Description must be exactly 500 characters or less' }
    },
    slaHours: {
      required: 'SLA Hours is required',
      min: { value: 1, message: 'SLA Hours must be at least 1' },
      max: { value: 9999, message: 'SLA Hours must be less than 10000 (4 digits maximum)' },
      valueAsNumber: true,
      validate: (value: any) => {
        if (isNaN(value) || !Number.isInteger(Number(value))) {
          return 'SLA Hours must be a whole number';
        }
        return true;
      }
    },
    workflowDefinitionId: {
      required: 'Workflow Definition is required',
      validate: (value: any) => {
        if (!value || value === '' || value === null) {
          return 'Workflow Definition is required'
        }
        return true
      }
    }
  };
};

// Type definitions for form data
export type WorkflowStageTemplateFormData = z.infer<typeof WorkflowStageTemplateSchemas.workflowStageTemplateForm>;
export type CreateWorkflowStageTemplateData = z.infer<typeof WorkflowStageTemplateSchemas.createWorkflowStageTemplate>;
export type UpdateWorkflowStageTemplateData = z.infer<typeof WorkflowStageTemplateSchemas.updateWorkflowStageTemplate>;

// Validation error type
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  success: boolean;
  data?: any;
  errors?: ValidationError[];
}
