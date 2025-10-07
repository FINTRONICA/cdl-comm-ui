import { z } from 'zod';

// Enhanced validation schema for beneficiary details
export const beneficiaryValidationSchema = z.object({
  bpbBeneficiaryId: z.string()
    .min(1, 'Beneficiary ID is required')
    .max(50, 'Beneficiary ID must be less than 50 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Beneficiary ID can only contain letters, numbers, hyphens, and underscores'),
  
  bpbBeneficiaryType: z.union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => val && val.length > 0, {
      message: 'Beneficiary type is required'
    }),
  
  bpbName: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[A-Za-z\s.-]+$/, 'Name can only contain letters, spaces, dots, and hyphens'),
  
  bpbBankName: z.union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => val && val.length > 0, {
      message: 'Bank name is required'
    }),
  
  bpbSwiftCode: z.string()
    .min(1, 'Swift code is required')
    .min(2, 'Swift code must be at least 2 characters')
    .max(11, 'Swift code must be less than 11 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Swift code can only contain letters and numbers'),
  
  bpbRoutingCode: z.string()
    .optional()
    .refine((val) => !val || val.length >= 2, {
      message: 'Routing code must be at least 2 characters if provided'
    })
    .refine((val) => !val || /^[A-Za-z0-9]+$/.test(val), {
      message: 'Routing code can only contain letters and numbers'
    }),
  
  bpbAccountNumber: z.string()
    .min(1, 'Account number is required')
    .min(2, 'Account number must be at least 2 characters')
    .max(34, 'Account number must be less than 34 characters (IBAN standard)')
    .regex(/^[A-Za-z0-9]+$/, 'Account number can only contain letters and numbers'),
});

// Data sanitization functions
export const sanitizeBeneficiaryData = (data: any) => {
  return {
    bpbBeneficiaryId: data.bpbBeneficiaryId?.toString().trim().toUpperCase(),
    bpbBeneficiaryType: data.bpbBeneficiaryType?.toString().trim(),
    bpbName: data.bpbName?.toString().trim().replace(/\s+/g, ' '), // Normalize whitespace
    bpbBankName: data.bpbBankName?.toString().trim(),
    bpbSwiftCode: data.bpbSwiftCode?.toString().trim().toUpperCase(),
    bpbRoutingCode: data.bpbRoutingCode?.toString().trim() || undefined,
    bpbAccountNumber: data.bpbAccountNumber?.toString().trim().toUpperCase(),
  };
};

// Validation with sanitization
export const validateAndSanitizeBeneficiaryData = (data: any) => {
  const sanitizedData = sanitizeBeneficiaryData(data);
  return beneficiaryValidationSchema.parse(sanitizedData);
};

// Project-specific validation schema for beneficiary details
export const projectBeneficiaryValidationSchema = z.object({
  reaBeneficiaryId: z.string()
    .min(1, 'Beneficiary ID is required')
    .max(50, 'Beneficiary ID must be less than 50 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Beneficiary ID can only contain letters, numbers, hyphens, and underscores'),
  
  reaBeneficiaryType: z.union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => val && val.length > 0, {
      message: 'Beneficiary type is required'
    }),
  
  reaName: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[A-Za-z\s.-]+$/, 'Name can only contain letters, spaces, dots, and hyphens'),
  
  reaBankName: z.union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => val && val.length > 0, {
      message: 'Bank name is required'
    }),
  
  reaSwiftCode: z.string()
    .min(1, 'Swift code is required')
    .min(2, 'Swift code must be at least 2 characters')
    .max(11, 'Swift code must be less than 11 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Swift code can only contain letters and numbers'),
  
  reaRoutingCode: z.string()
    .optional()
    .refine((val) => !val || val.length >= 2, {
      message: 'Routing code must be at least 2 characters if provided'
    })
    .refine((val) => !val || /^[A-Za-z0-9]+$/.test(val), {
      message: 'Routing code can only contain letters and numbers'
    }),
  
  reaAccountNumber: z.string()
    .min(1, 'Account number is required')
    .min(2, 'Account number must be at least 2 characters')
    .max(34, 'Account number must be less than 34 characters (IBAN standard)')
    .regex(/^[A-Za-z0-9]+$/, 'Account number can only contain letters and numbers'),
});

// Project-specific data sanitization functions
export const sanitizeProjectBeneficiaryData = (data: any) => {
  return {
    reaBeneficiaryId: data.reaBeneficiaryId?.toString().trim().toUpperCase(),
    reaBeneficiaryType: data.reaBeneficiaryType?.toString().trim(),
    reaName: data.reaName?.toString().trim().replace(/\s+/g, ' '), // Normalize whitespace
    reaBankName: data.reaBankName?.toString().trim(),
    reaSwiftCode: data.reaSwiftCode?.toString().trim().toUpperCase(),
    reaRoutingCode: data.reaRoutingCode?.toString().trim() || undefined,
    reaAccountNumber: data.reaAccountNumber?.toString().trim().toUpperCase(),
  };
};

// Project-specific validation with sanitization
export const validateAndSanitizeProjectBeneficiaryData = (data: any) => {
  const sanitizedData = sanitizeProjectBeneficiaryData(data);
  return projectBeneficiaryValidationSchema.parse(sanitizedData);
};

// Type for validated beneficiary data
export type ValidatedBeneficiaryData = z.infer<typeof beneficiaryValidationSchema>;
export type ValidatedProjectBeneficiaryData = z.infer<typeof projectBeneficiaryValidationSchema>;
