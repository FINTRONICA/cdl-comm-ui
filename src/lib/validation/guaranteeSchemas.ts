import { z } from 'zod'
import dayjs, { Dayjs } from 'dayjs'

// Reusable Dayjs-or-null schema aligned with capitalPartnerSchemas.ts
const dayjsSchema = z.custom<Dayjs | null>((val) => {
  if (val === null || val === undefined) return true
  return dayjs.isDayjs(val)
}, 'Must be a valid date or null').nullable()

export const GuaranteeDetailsSchema = z.object({

  projectName: z.string()
    .min(1, 'Build Partner Assets name is required'),
  
  developerName: z.string()
    .min(1, 'Build Partner name is required'),
  
  guaranteeType: z.string()
    .min(1, 'Type of guarantee is required'),
  
  issuerBank: z.string()
    .min(1, 'Issuing bank is required'),
  
  guaranteeRefNo: z.string()
    .min(1, 'Guarantee reference number is required'),
  
  guaranteeExpirationDate: dayjsSchema,
  
  openEndedGuarantee: z.boolean()
    .refine((val) => val !== undefined, 'Open Ended selection is required'),
  
  projectCompletionDate: dayjsSchema,
  
  guaranteeAmount: z.string()
    .min(1, 'Amount is required')
    .max(15, 'Amount must be 15 characters or less')
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num > 0
    }, 'Amount must be a positive number'),
  
  noOfAmendments: z.string()
    .max(15, 'Number of amendments must be 15 characters or less')
    .optional()
    .or(z.literal('')),
  
  accountNumber: z.string()
    .min(1, 'Account number is required'),
  
  action: z.string()
    .optional()
    .or(z.literal('')),
  
  // Keep required: must be present and a valid Dayjs
  guaranteeDate: dayjsSchema.refine((val) => val !== null, 'Surety Bond Date is required'),
  
  projectCif: z.string()
    .min(1, 'Project CIF is required'),
  
  suretyBondNewReadingAmendment: z.string()
    .max(500, 'Amendment text must be 500 characters or less')
    .optional()
    .or(z.literal('')),
  
  status: z.string(),
}).refine((data) => {
 
  if (!data.openEndedGuarantee && !data.guaranteeExpirationDate) {
    return false
  }
  return true
}, {
  message: 'Guarantee expiration date is required when "Open Ended" is not checked',
  path: ['guaranteeExpirationDate']
}).refine((data) => {
 
  if (data.openEndedGuarantee && !data.projectCompletionDate) {
    return false
  }
  return true
}, {
  message: 'Project completion date is required when "Open ended" is checked',
  path: ['projectCompletionDate']
})


export const GuaranteeDocumentsSchema = z.object({
  documents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    size: z.number().positive(),
    url: z.string().optional(),
    file: File,
  })).optional(),
})


export const GuaranteeFormSchema = GuaranteeDetailsSchema.safeExtend({
  documents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    size: z.number().positive(),
    url: z.string().optional(),
    file: z.any(), 
  })).optional(),
})


export type GuaranteeDetailsData = z.infer<typeof GuaranteeDetailsSchema>
export type GuaranteeDocumentsData = z.infer<typeof GuaranteeDocumentsSchema>
export type GuaranteeFormData = z.infer<typeof GuaranteeFormSchema>


export const GuaranteeStepValidationSchemas = {
  details: GuaranteeDetailsSchema,
  documents: GuaranteeDocumentsSchema,
} as const


export const getGuaranteeStepSchema = (stepNumber: number) => {
  switch (stepNumber) {
    case 0: return GuaranteeDetailsSchema
    case 1: return GuaranteeDocumentsSchema
    case 2: return null 
    default: return GuaranteeDetailsSchema
  }
}


export const getGuaranteeStepSchemaByName = (stepName: 'details' | 'documents') => {
  return GuaranteeStepValidationSchemas[stepName]
}
