import { z } from 'zod';
import { BaseSchemas } from './baseSchemas';

// Developer Stepper validation schemas
export const DeveloperStepperSchemas = {
  step1Details: z.object({

    // CIF from Core Banking - up to 8-digit numerical, mandatory
    bpCifrera: z.string()
      .min(1, 'CIF is required')
      .max(8, 'CIF must be 8 digits or less')
      .regex(/^\d+$/, 'CIF must be numerical'),
    
    // Developer ID - required
    bpDeveloperId: z.string().min(1, 'Developer ID is required'),

    bpDeveloperRegNo: z.string()
      .min(1, 'Developer Registration number is required')
      .max(14, 'Developer Registration number must be 14 characters or less'),
    
    bpOnboardingDate: z.union([
      z.string().min(1, 'RERA Registration date is required'),
      z.date(),
      z.null(),
      z.undefined()
    ]).transform((val) => {
      if (!val) return null;
      if (val instanceof Date) return val.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
      if (typeof val === 'string') {
        // Handle ISO string format from API
        if (val.includes('T') && val.includes('Z')) {
          return new Date(val).toISOString().split('T')[0]; // Convert ISO to YYYY-MM-DD
        }
        return val;
      }
      return null;
    }).refine((date) => {
      if (!date) return false;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;
      return dateRegex.test(date) || isoRegex.test(date);
    }, 'Date must be in YYYY-MM-DD format or ISO 8601 format with timezone'),
    
    bpName: z.string()
      .min(1, 'Developer name is required')
      .max(35, 'Developer name must be 35 characters or less'),
    
    bpNameLocal: z.string()
      .max(35, 'Developer name (Hindi) must be 35 characters or less')
      // .regex(/^[\u0900-\u097F\s]*$/, 'Only Hindi text is permitted')
      .optional(),
    
    bpMasterName: z.string()
      .max(35, 'Parent Developer name must be 35 characters or less')
      .optional(),
    
    bpRegulatorDTO: z.object({
      id: z.number().min(1, 'Please select a regulator'),
    }),
    
    bpLicenseNo: z.string()
      .min(1, 'License number is required')
      .max(50, 'License number must be 50 characters or less')
      .regex(/^[a-zA-Z0-9]*$/, 'License number can only contain alphanumeric characters'),
    
    bpLicenseExpDate: z.union([
      z.string().min(1, 'License expiry date is required'),
      z.date(),
      z.null(),
      z.undefined()
    ]).transform((val) => {
      if (!val) return null;
      if (val instanceof Date) return val.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
      if (typeof val === 'string') {
        // Handle ISO string format from API
        if (val.includes('T') && val.includes('Z')) {
          return new Date(val).toISOString().split('T')[0]; // Convert ISO to YYYY-MM-DD
        }
        return val;
      }
      return null;
    }).refine((date) => {
      if (!date) return false;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;
      return dateRegex.test(date) || isoRegex.test(date);
    }, 'Date must be in YYYY-MM-DD format or ISO 8601 format with timezone'),
    
    bpWorldCheckFlag: z.union([
      z.boolean(),
      z.string(),
      z.undefined(),
      z.null()
    ]).optional().transform((val) => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'string') return val === 'true';
      return Boolean(val);
    }),
    
    bpWorldCheckRemarks: z.string()
      .max(100, 'World Check Flag remarks must be 100 characters or less')
      .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\s]*$/, 'Remarks can contain alphanumeric and special characters')
      .optional(),
  }),
  
  step2Contact: z.object({
    contactPerson: z.string().min(1, 'Contact person is required'),
    email: BaseSchemas.email,
    phone: BaseSchemas.phone,
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  
  step3Fees: z.object({
    feeStructure: z.object({
      setupFee: z.number().min(0, 'Setup fee must be non-negative'),
      transactionFee: z.number().min(0, 'Transaction fee must be non-negative'),
      monthlyFee: z.number().min(0, 'Monthly fee must be non-negative'),
    }),
    collectionMethod: z.enum(['automatic', 'manual']),
    paymentTerms: z.string().min(1, 'Payment terms are required'),
  }),
  
  step4Beneficiary: z.object({
    beneficiaryInfo: z.object({
      name: z.string().optional(),
      accountNumber: z.string().optional(),
      bankName: z.string().optional(),
      swiftCode: z.string().optional(),
    }).optional(),
    beneficiaryType: z.enum(['individual', 'company']).optional(),
  }).optional(),
  
  step5Review: z.object({
    reviewData: z.any(), // Could be more specific based on your needs
    termsAccepted: z.union([
      z.boolean(),
      z.undefined(),
      z.null()
    ]).transform((val) => Boolean(val)).refine(val => val === true, 'Terms must be accepted'),
  }),
};

// Helper function to get step name for validation
export const getStepValidationKey = (step: number): keyof typeof DeveloperStepperSchemas => {
  const stepNames = ['step1Details', 'step2Contact', 'step3Fees', 'step4Beneficiary', 'step5Review'];
  return stepNames[step] as keyof typeof DeveloperStepperSchemas;
};
