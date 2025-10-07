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
