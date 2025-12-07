import { z } from 'zod';

export const feeValidationSchema = z.object({
  bpFeeCategoryDTO: z.object({
    id: z.number().min(1, 'Fee category is required'),
  }),
  bpFeeFrequencyDTO: z.object({
    id: z.number().min(1, 'Fee frequency is required'),
  }),
  bpAccountTypeDTO: z.object({
    id: z.number().min(1, 'Account type is required'),
  }),
  debitAmount: z.number().min(0, 'Debit amount must be positive'),
  totalAmount: z.number().min(0, 'Total amount must be positive').refine((val) => val > 0, 'Total amount is required'),
  feeCollectionDate: z.string().min(1, 'Fee collection date is required'),
  feeNextRecoveryDate: z.string().optional(),
  feePercentage: z.number().min(0, 'Fee percentage must be positive'),
  vatPercentage: z.number().min(0, 'VAT percentage must be positive'),
  bpFeeCurrencyDTO: z.object({
    id: z.number().min(1, 'Currency is required'),
  }),
});

// Project-specific fee validation schema
export const projectFeeValidationSchema = z.object({
  reafCategoryDTO: z.object({
    id: z.number().min(1, 'Fee category is required'),
  }),
  reafFrequencyDTO: z.object({
    id: z.number().min(1, 'Fee frequency is required'),
  }),
  reafAccountTypeDTO: z.object({
    id: z.number().min(1, 'Account type is required'),
  }),
  reafDebitAmount: z.number().min(0, 'Debit amount must be positive'),
  reafTotalAmount: z.number().min(0, 'Total amount must be positive').refine((val) => val > 0, 'Total amount is required'),
  reafCollectionDate: z.string().min(1, 'Fee collection date is required'),
  reafNextRecoveryDate: z.string().optional(),
  reafFeePercentage: z.number().min(0, 'Fee percentage must be positive'),
  reafVatPercentage: z.number().min(0, 'VAT percentage must be positive'),
  reafCurrencyDTO: z.object({
    id: z.number().min(1, 'Currency is required'),
  }),
});

// Form-level validation schema for Step 4: Fee Details
export const feeDetailsFormValidationSchema = z.object({
  // Fee Category * - Dropdown - Mandatory
  feeType: z.any().refine((val) => val && val !== '' && val !== null && val !== undefined, {
    message: 'Fee Category is required'
  }),
  
  // Frequency * - Dropdown - Mandatory  
  frequency: z.any().refine((val) => val && val !== '' && val !== null && val !== undefined, {
    message: 'Frequency is required'
  }),
  
  // Currency - Dropdown - Optional
  currency: z.any().optional(),
  
  // Debit Account* - Dropdown - Mandatory
  debitAccount: z.any().refine((val) => val && val !== '' && val !== null && val !== undefined, {
    message: 'Debit Account is required'
  }),
  
  // Date Fee to be collected - Calendar - Mandatory
  feeToBeCollected: z.any().refine((val) => {
    if (!val) return false;
    // Handle dayjs objects
    if (val.isValid && typeof val.isValid === 'function') {
      return val.isValid();
    }
    // Handle other date formats
    return val && val !== '';
  }, 'Fee Collection Date is required'),
  
  // Next Recovery Date - Calendar - Optional
  nextRecoveryDate: z.any().optional(),
  
  // Amount* - Text Box - Mandatory, Numerical only, max 10 characters
  debitAmount: z.any().refine((val) => {
    if (!val) return false;
    const strVal = val.toString();
    return strVal.trim() !== '' && strVal.length <= 10 && /^[0-9,.\s]+$/.test(strVal);
  }, 'Amount is required and must contain only numbers, commas, dots, and spaces (max 10 characters)'),
  
  // Fee Percentage - Optional with validation when provided
  feePercentage: z.any().optional().refine((val) => {
    if (!val || val === '') return true; // Allow empty
    const strVal = val.toString();
    return /^[0-9,.\s%]+$/.test(strVal);
  }, 'Fee Percentage must contain only numbers, commas, dots, and %'),
  
  // VAT Percentage - Optional with validation when provided
  vatPercentage: z.any().optional().refine((val) => {
    if (!val || val === '') return true; // Allow empty
    const strVal = val.toString();
    return /^[0-9,.\s%]+$/.test(strVal);
  }, 'VAT Percentage must contain only numbers, commas, dots, and %'),
  
  // Total Amount - Required
  totalAmount: z.any().refine((val) => {
    if (!val) return false;
    const strVal = val.toString();
    return strVal.trim() !== '' && strVal.length <= 10 && /^[0-9,.\s]+$/.test(strVal);
  }, 'Total Amount is required and must contain only numbers, commas, dots, and spaces (max 10 characters)'),
});

// Field-level validation rules for Step 4: Fee Details
export const FEE_DETAILS_FIELD_VALIDATION_RULES = {
  feeType: {
    required: true,
    message: 'Fee Category is required'
  },
  frequency: {
    required: true,
    message: 'Frequency is required'
  },
  currency: {
    maxLength: 10,
    message: 'Currency must be maximum 10 characters'
  },
  debitAccount: {
    required: true,
    message: 'Debit Account is required'
  },
  feeToBeCollected: {
    required: true,
    message: 'Fee Collection Date is required'
  },
  nextRecoveryDate: {
    required: false,
    message: 'Next Recovery Date is optional'
  },
  debitAmount: {
    required: true,
    maxLength: 10,
    pattern: /^[0-9,]+$/,
    message: 'Amount is required and must contain only numbers and commas (max 10 characters)'
  },
  feePercentage: {
    required: false,
    message: 'Fee Percentage is optional'
  },
  vatPercentage: {
    required: false,
    message: 'VAT Percentage is optional'
  },
  totalAmount: {
    required: true,
    maxLength: 10,
    pattern: /^[0-9,]+$/,
    message: 'Total Amount is required and must contain only numbers and commas (max 10 characters)'
  }
} as const;

// Individual field validation function for Step 4: Fee Details
export const validateFeeDetailsField = (fieldName: string, value: any): string | true => {
  const rules = FEE_DETAILS_FIELD_VALIDATION_RULES[fieldName as keyof typeof FEE_DETAILS_FIELD_VALIDATION_RULES];
  
  if (!rules) return true;
  
  // Required validation
  if ('required' in rules && rules.required && (!value || value === '')) {
    return rules.message;
  }
  
  // Skip other validations if field is empty and not required
  if (!value || value === '') return true;
  
  // Max length validation
  if ('maxLength' in rules && typeof value === 'string' && value.length > rules.maxLength) {
    return rules.message;
  }
  
  // Pattern validation
  if ('pattern' in rules && typeof value === 'string' && !rules.pattern.test(value)) {
    return rules.message;
  }
  
  return true;
};

export type FeeDetailsFormData = {
  feeType: any;
  frequency: any;
  debitAccount: any;
  feeToBeCollected: any;
  nextRecoveryDate?: any;
  debitAmount: any;
  feePercentage?: any;
  vatPercentage?: any;
  currency?: any;
  totalAmount: any;
};