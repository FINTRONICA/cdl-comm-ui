import { z } from 'zod';

// Workflow Amount Rule validation schemas
export const WorkflowAmountRuleSchemas = {
  createWorkflowAmountRule: z.object({
    currency: z.string()
      .min(1, 'Currency is required')
      .max(10, 'Currency must be exactly 10 characters or less')
      .regex(/^[A-Za-z]+$/, 'Currency can only contain letters (no numbers or special characters)')
      .refine((val) => val && val.trim() !== '', {
        message: 'Currency is required'
      })
      .refine((val) => val.length <= 10, {
        message: 'Currency cannot exceed 10 characters'
      }),
    
    minAmount: z.number()
      .min(100, 'Minimum amount must be at least 100')
      .max(99999999999999999999999999999999999999999, 'Maximum amount exceeded')
      .refine((val) => !isNaN(val) && isFinite(val), {
        message: 'Minimum amount must be a valid number'
      }),
    
    maxAmount: z.number()
      .min(100, 'Maximum amount must be at least 100')
      .max(99999999999999999999999999999999999999999, 'Maximum amount exceeded')
      .refine((val) => !isNaN(val) && isFinite(val), {
        message: 'Maximum amount must be a valid number'
      }),
    
    priority: z.number()
      .int('Priority must be a whole number')
      .min(1, 'Priority must be at least 1')
      .max(10, 'Priority must be between 1 and 10'),
    
    requiredMakers: z.number()
      .int('Required makers must be a whole number')
      .min(1, 'Required makers must be at least 1')
      .max(10, 'Required makers must be 10 or less'),
    
    requiredCheckers: z.number()
      .int('Required checkers must be a whole number')
      .min(1, 'Required checkers must be at least 1')
      .max(10, 'Required checkers must be 10 or less'),
    
    workflowDefinitionId: z.number()
      .int('Workflow Definition ID must be a whole number')
      .positive('Valid Workflow Definition is required'),
    
    workflowId: z.number()
      .int('Workflow ID must be a whole number')
      .positive('Valid Workflow ID is required'),
    
    amountRuleName: z.string()
      .min(1, 'Amount rule name is required')
      .max(100, 'Amount rule name must be less than 100 characters')
      .regex(/^[A-Za-z0-9_-]+$/, 'Amount rule name can only contain letters, numbers, hyphens, and underscores'),
    
    enabled: z.boolean(),
  })
  .refine((data) => data.maxAmount >= data.minAmount, {
    message: 'Maximum amount must be greater than or equal to minimum amount',
    path: ['maxAmount']
  }),

  updateWorkflowAmountRule: z.object({
    id: z.number()
      .int('ID must be a whole number')
      .positive('Valid ID is required'),
    
    currency: z.string()
      .min(1, 'Currency is required')
      .max(10, 'Currency must be exactly 10 characters or less')
      .regex(/^[A-Za-z]+$/, 'Currency can only contain letters (no numbers or special characters)')
      .refine((val) => val && val.trim() !== '', {
        message: 'Currency is required'
      })
      .refine((val) => val.length <= 10, {
        message: 'Currency cannot exceed 10 characters'
      }),
    
    minAmount: z.number()
      .min(100, 'Minimum amount must be at least 100')
      .max(99999999999999999999999999999999999999999, 'Maximum amount exceeded')
      .refine((val) => !isNaN(val) && isFinite(val), {
        message: 'Minimum amount must be a valid number'
      }),
    
    maxAmount: z.number()
      .min(100, 'Maximum amount must be at least 100')
      .max(99999999999999999999999999999999999999999, 'Maximum amount exceeded')
      .refine((val) => !isNaN(val) && isFinite(val), {
        message: 'Maximum amount must be a valid number'
      }),
    
    priority: z.number()
      .int('Priority must be a whole number')
      .min(1, 'Priority must be at least 1')
      .max(10, 'Priority must be between 1 and 10'),
    
    requiredMakers: z.number()
      .int('Required makers must be a whole number')
      .min(1, 'Required makers must be at least 1')
      .max(10, 'Required makers must be 10 or less'),
    
    requiredCheckers: z.number()
      .int('Required checkers must be a whole number')
      .min(1, 'Required checkers must be at least 1')
      .max(10, 'Required checkers must be 10 or less'),
    
    workflowDefinitionId: z.number()
      .int('Workflow Definition ID must be a whole number')
      .positive('Valid Workflow Definition is required'),
    
    enabled: z.boolean(),
  })
  .refine((data) => data.maxAmount >= data.minAmount, {
    message: 'Maximum amount must be greater than or equal to minimum amount',
    path: ['maxAmount']
  }),

  // Form validation schema for UI
  workflowAmountRuleForm: z.object({
    currency: z.string()
      .min(1, 'Currency is required')
      .max(10, 'Currency must be exactly 10 characters or less')
      .regex(/^[A-Za-z]+$/, 'Currency can only contain letters (no numbers or special characters)')
      .refine((val) => val && val.trim() !== '', {
        message: 'Currency is required'
      })
      .refine((val) => val.length <= 10, {
        message: 'Currency cannot exceed 10 characters'
      }),
    
    minAmount: z.number()
      .min(100, 'Minimum amount must be at least 100')
      .max(99999999999999999999999999999999999999999, 'Maximum amount exceeded')
      .refine((val) => !isNaN(val) && isFinite(val), {
        message: 'Minimum amount must be a valid number'
      }),
    
    maxAmount: z.number()
      .min(100, 'Maximum amount must be at least 100')
      .max(99999999999999999999999999999999999999999, 'Maximum amount exceeded')
      .refine((val) => !isNaN(val) && isFinite(val), {
        message: 'Maximum amount must be a valid number'
      }),
    
    priority: z.number()
      .int('Priority must be a whole number')
      .min(1, 'Priority must be at least 1')
      .max(10, 'Priority must be between 1 and 10'),
    
    requiredMakers: z.number()
      .int('Required makers must be a whole number')
      .min(1, 'Required makers must be at least 1')
      .max(10, 'Required makers must be 10 or less'),
    
    requiredCheckers: z.number()
      .int('Required checkers must be a whole number')
      .min(1, 'Required checkers must be at least 1')
      .max(10, 'Required checkers must be 10 or less'),
    
    workflowDefinitionName: z.string()
      .min(1, 'Workflow Definition is required')
      .refine((val) => val && val.trim() !== '', {
        message: 'Workflow Definition is required'
      }),
    
    enabled: z.boolean(),
  })
  .refine((data) => data.maxAmount >= data.minAmount, {
    message: 'Maximum amount must be greater than or equal to minimum amount',
    path: ['maxAmount']
  })
  .refine((data) => data.minAmount <= data.maxAmount, {
    message: 'Minimum amount must be less than or equal to maximum amount',
    path: ['minAmount']
  }),
};

// Helper function to validate workflow amount rule data
export const validateWorkflowAmountRule = (data: any, isUpdate: boolean = false) => {
  const schema = isUpdate ? WorkflowAmountRuleSchemas.updateWorkflowAmountRule : WorkflowAmountRuleSchemas.createWorkflowAmountRule;
  
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
export const getWorkflowAmountRuleValidationRules = () => {
  return {
    currency: {
      required: 'Currency is required',
      minLength: { value: 1, message: 'Currency is required' },
      maxLength: { value: 10, message: 'Currency must be exactly 10 characters or less' },
      pattern: {
        value: /^[A-Za-z]+$/,
        message: 'Currency can only contain letters (no numbers or special characters)'
      },
      validate: (value: any) => {
        // Check for empty/null/undefined
        if (!value || value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
          return 'Currency is required';
        }
        const strValue = String(value).trim();
        if (strValue.length === 0) {
          return 'Currency is required';
        }
        if (!/^[A-Za-z]+$/.test(strValue)) {
          return 'Currency can only contain letters (no numbers or special characters)';
        }
        if (strValue.length > 10) {
          return 'Currency cannot exceed 10 characters';
        }
        return true;
      }
    },
    minAmount: {
      required: 'Minimum amount is required',
      valueAsNumber: true,
      validate: (value: any, formValues: any) => {
        // Check for empty string first (before valueAsNumber conversion)
        if (value === '' || value === null || value === undefined) {
          return 'Minimum amount is required';
        }
        // Convert to number if it's a string
        const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
        if (isNaN(numValue) || !isFinite(numValue)) {
          return 'Minimum amount must be a valid number';
        }
        if (numValue < 100) {
          return 'Minimum amount must be at least 100';
        }
        if (numValue > 99999999999999999999999999999999999999999) {
          return 'Maximum amount exceeded';
        }
        if (formValues?.maxAmount !== undefined) {
          const maxValue = typeof formValues.maxAmount === 'string' ? parseFloat(formValues.maxAmount) : Number(formValues.maxAmount);
          if (!isNaN(maxValue) && isFinite(maxValue) && numValue > maxValue) {
            return 'Minimum amount must be less than or equal to maximum amount';
          }
        }
        return true;
      }
    },
    maxAmount: {
      required: 'Maximum amount is required',
      valueAsNumber: true,
      validate: (value: any, formValues: any) => {
        // Check for empty string first (before valueAsNumber conversion)
        if (value === '' || value === null || value === undefined) {
          return 'Maximum amount is required';
        }
        // Convert to number if it's a string
        const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
        if (isNaN(numValue) || !isFinite(numValue)) {
          return 'Maximum amount must be a valid number';
        }
        if (numValue < 100) {
          return 'Maximum amount must be at least 100';
        }
        if (numValue > 99999999999999999999999999999999999999999) {
          return 'Maximum amount exceeded';
        }
        if (formValues?.minAmount !== undefined) {
          const minValue = typeof formValues.minAmount === 'string' ? parseFloat(formValues.minAmount) : Number(formValues.minAmount);
          if (!isNaN(minValue) && isFinite(minValue) && numValue < minValue) {
            return 'Maximum amount must be greater than or equal to minimum amount';
          }
        }
        return true;
      }
    },
    priority: {
      required: 'Priority is required',
      min: { value: 1, message: 'Priority must be at least 1' },
      max: { value: 10, message: 'Priority must be between 1 and 10' },
      valueAsNumber: true,
      validate: (value: any) => {
        // Check for empty string first (before valueAsNumber conversion)
        if (value === '' || value === null || value === undefined) {
          return 'Priority is required';
        }
        // Convert to number if it's a string
        const numValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);
        if (isNaN(numValue) || !Number.isInteger(numValue)) {
          return 'Priority must be a whole number';
        }
        if (numValue < 1) {
          return 'Priority must be at least 1';
        }
        if (numValue > 10) {
          return 'Priority must be between 1 and 10';
        }
        return true;
      }
    },
    requiredMakers: {
      required: 'Required makers is required',
      min: { value: 1, message: 'Required makers must be at least 1' },
      max: { value: 10, message: 'Required makers must be 10 or less' },
      valueAsNumber: true,
      validate: (value: any) => {
        // Check for empty string first (before valueAsNumber conversion)
        if (value === '' || value === null || value === undefined) {
          return 'Required makers is required';
        }
        // Convert to number if it's a string
        const numValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);
        if (isNaN(numValue) || !Number.isInteger(numValue)) {
          return 'Required makers must be a whole number';
        }
        if (numValue < 1) {
          return 'Required makers must be at least 1';
        }
        if (numValue > 10) {
          return 'Required makers must be 10 or less';
        }
        return true;
      }
    },
    requiredCheckers: {
      required: 'Required checkers is required',
      min: { value: 1, message: 'Required checkers must be at least 1' },
      max: { value: 10, message: 'Required checkers must be 10 or less' },
      valueAsNumber: true,
      validate: (value: any) => {
        // Check for empty string first (before valueAsNumber conversion)
        if (value === '' || value === null || value === undefined) {
          return 'Required checkers is required';
        }
        // Convert to number if it's a string
        const numValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);
        if (isNaN(numValue) || !Number.isInteger(numValue)) {
          return 'Required checkers must be a whole number';
        }
        if (numValue < 1) {
          return 'Required checkers must be at least 1';
        }
        if (numValue > 10) {
          return 'Required checkers must be 10 or less';
        }
        return true;
      }
    },
    workflowDefinitionName: {
      required: 'Workflow Definition is required',
      validate: (value: any) => {
        // Check for empty/null/undefined
        if (!value || value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
          return 'Workflow Definition is required';
        }
        const strValue = String(value).trim();
        if (strValue.length === 0) {
          return 'Workflow Definition is required';
        }
        return true;
      }
    },
    enabled: {
    }
  };
};

// Type definitions for form data
export type WorkflowAmountRuleFormData = z.infer<typeof WorkflowAmountRuleSchemas.workflowAmountRuleForm>;
export type CreateWorkflowAmountRuleData = z.infer<typeof WorkflowAmountRuleSchemas.createWorkflowAmountRule>;
export type UpdateWorkflowAmountRuleData = z.infer<typeof WorkflowAmountRuleSchemas.updateWorkflowAmountRule>;

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
