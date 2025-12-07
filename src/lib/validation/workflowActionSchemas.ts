import { z } from 'zod';

// Workflow Action validation schemas
export const WorkflowActionSchemas = {
  createWorkflowAction: z.object({
    actionKey: z.string()
      .min(1, 'Action Key is required')
      .max(100, 'Action Key must be less than 100 characters')
      .regex(/^[A-Za-z_-]+$/, 'Action Key can only contain letters, hyphens, and underscores (no numbers allowed)'),

    actionName: z.string()
      .min(1, 'Action Name is required')
      .max(200, 'Action Name must be less than 200 characters')
      .regex(/^[A-Za-z\s_-]+$/, 'Action Name can only contain letters, spaces, hyphens, and underscores (no numbers allowed)'),

    moduleCode: z.string()
      .min(1, 'Module Code is required')
      .max(50, 'Module Code must be less than 50 characters')
      .regex(/^[A-Za-z_-]+$/, 'Module Code can only contain letters, hyphens, and underscores (no numbers allowed)'),

    name: z.string()
      .min(1, 'Name is required')
      .max(200, 'Name must be less than 200 characters')
      .regex(/^[A-Za-z\s_-]+$/, 'Name can only contain letters, spaces, hyphens, and underscores (no numbers allowed)'),

    description: z.string()
      .max(500, 'Description must be less than 500 characters')
      .optional()
      .or(z.literal('')),
  }),

  updateWorkflowAction: z.object({
    id: z.number().int().positive('Valid ID is required'),
    actionKey: z.string()
      .min(1, 'Action Key is required')
      .max(100, 'Action Key must be less than 100 characters')
      .regex(/^[A-Za-z_-]+$/, 'Action Key can only contain letters, hyphens, and underscores (no numbers allowed)'),

    actionName: z.string()
      .min(1, 'Action Name is required')
      .max(200, 'Action Name must be less than 200 characters')
      .regex(/^[A-Za-z\s_-]+$/, 'Action Name can only contain letters, spaces, hyphens, and underscores (no numbers allowed)'),

    moduleCode: z.string()
      .min(1, 'Module Code is required')
      .max(50, 'Module Code must be less than 50 characters')
      .regex(/^[A-Za-z_-]+$/, 'Module Code can only contain letters, hyphens, and underscores (no numbers allowed)'),

    name: z.string()
      .min(1, 'Name is required')
      .max(200, 'Name must be less than 200 characters')
      .regex(/^[A-Za-z\s_-]+$/, 'Name can only contain letters, spaces, hyphens, and underscores (no numbers allowed)'),

    description: z.string()
      .max(500, 'Description must be less than 500 characters')
      .optional()
      .or(z.literal('')),
  }),

  // Form validation schema for UI
  workflowActionForm: z.object({
    actionKey: z.string()
      .min(1, 'Action Key is required')
      .max(100, 'Action Key must be less than 100 characters')
      .regex(/^[A-Za-z_-]+$/, 'Action Key can only contain letters, hyphens, and underscores (no numbers allowed)'),

    actionName: z.string()
      .min(1, 'Action Name is required')
      .max(200, 'Action Name must be less than 200 characters')
      .regex(/^[A-Za-z\s_-]+$/, 'Action Name can only contain letters, spaces, hyphens, and underscores (no numbers allowed)'),

    moduleCode: z.string()
      .min(1, 'Module Code is required')
      .max(50, 'Module Code must be less than 50 characters')
      .regex(/^[A-Za-z_-]+$/, 'Module Code can only contain letters, hyphens, and underscores (no numbers allowed)'),

    name: z.string()
      .min(1, 'Name is required')
      .max(200, 'Name must be less than 200 characters')
      .regex(/^[A-Za-z\s_-]+$/, 'Name can only contain letters, spaces, hyphens, and underscores (no numbers allowed)'),

    description: z.string()
      .max(500, 'Description must be less than 500 characters')
      .optional()
      .or(z.literal('')),
  }),
};

// Helper function to validate workflow action data
export const validateWorkflowAction = (data: unknown, isUpdate: boolean = false) => {
  const schema = isUpdate ? WorkflowActionSchemas.updateWorkflowAction : WorkflowActionSchemas.createWorkflowAction;

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
export const getWorkflowActionValidationRules = () => {
  return {
    actionKey: {
      required: 'Action Key is required',
      minLength: { value: 1, message: 'Action Key is required' },
      maxLength: { value: 100, message: 'Action Key must be less than 100 characters' },
      pattern: {
        value: /^[A-Za-z_-]+$/,
        message: 'Action Key can only contain letters, hyphens, and underscores (no numbers allowed)'
      }
    },
    actionName: {
      required: 'Action Name is required',
      minLength: { value: 1, message: 'Action Name is required' },
      maxLength: { value: 200, message: 'Action Name must be less than 200 characters' },
      pattern: {
        value: /^[A-Za-z\s_-]+$/,
        message: 'Action Name can only contain letters, spaces, hyphens, and underscores (no numbers allowed)'
      }
    },
    moduleCode: {
      required: 'Module Code is required',
      minLength: { value: 1, message: 'Module Code is required' },
      maxLength: { value: 50, message: 'Module Code must be less than 50 characters' },
      pattern: {
        value: /^[A-Za-z\s_-]+$/,
        message: 'Module Code can only contain letters, hyphens, and underscores (no numbers allowed)'
      }
    },
    name: {
      required: 'Name is required',
      minLength: { value: 1, message: 'Name is required' },
      maxLength: { value: 200, message: 'Name must be less than 200 characters' },
      pattern: {
        value: /^[A-Za-z\s_-]+$/,
        message: 'Name can only contain letters, spaces, hyphens, and underscores (no numbers allowed)'
      }
    },
    description: {
      maxLength: { value: 500, message: 'Description must be less than 500 characters' }
    }
  };
};


