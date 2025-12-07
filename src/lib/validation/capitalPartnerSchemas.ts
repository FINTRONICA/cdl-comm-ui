import { z } from 'zod'
import dayjs, { Dayjs } from 'dayjs'

const dayjsSchema = z
  .custom<Dayjs | null>((val) => {
    if (val === null || val === undefined) return true
    return dayjs.isDayjs(val)
  }, 'Must be a valid Dayjs object or null')
  .nullable()

export const CapitalPartnerStep1Schema = z.object({
  investorType: z.string().min(1, 'Capital Partner Type is required'),

  investorFirstName: z
    .string()
    .min(1, 'Capital Partner Name is required')
    .max(50, 'Capital Partner Name must be 50 characters or less'),

  // Optional name parts used in the Step 1 form (no validation constraints)
  investorMiddleName: z.string().optional(),

  investorLastName: z.string().optional(),

  arabicName: z.string().optional(),

  investorId: z.string().min(1, 'Capital Partner Reference ID is required'),

  investorIdType: z.string().min(1, 'Capital Partner ID Type is required'),

  idNumber: z
    .string()
    .min(1, 'ID Number is required')
    .max(15, 'ID Number must be 15 characters or less')
    .regex(
      /^[A-Za-z0-9]+$/,
      'ID Number can only contain alphanumeric characters'
    ),

  ownership: z
    .string()
    .max(15, 'Ownership Percentage must be 15 characters or less')
    .regex(/^\d*\.?\d*$/, 'Ownership Percentage must be a valid number')
    .optional()
    .or(z.literal('')),

  idExpiryDate: dayjsSchema.optional(),

  // Align with Step 1 form field name
  accountContact: z
    .string()
    .max(15, 'Account Contact Number must be 15 characters or less')
    .regex(
      /^[\d]*$/,
      'Account Contact Number can only contain numerical characters'
    )
    .optional()
    .or(z.literal('')),

  // Additional contact used in Step 1
  mpmobileNumber: z
    .string()
    .max(15, 'Mobile Number must be 15 characters or less')
    .regex(/^[\d]*$/, 'Mobile Number can only contain numerical characters')
    .optional()
    .or(z.literal('')),

  nationality: z.string().optional().or(z.literal('')),

  // Align with Step 1 form field name
  email: z
    .string()
    .max(100, 'Email Address must be 100 characters or less')
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
})

export const CapitalPartnerStep3Schema = z.object({
  projectId: z.string().min(1, 'Project selection is required'),

  unitId: z.string().min(1, 'Unit selection is required'),

  unitStatus: z.string().min(1, 'Unit status is required'),

  purchasePrice: z
    .string()
    .min(1, 'Purchase price is required')
    .regex(/^\d*\.?\d*$/, 'Purchase price must be a valid number')
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num > 0
    }, 'Purchase price must be a positive number'),

  currency: z.string().min(1, 'Currency is required'),

  paymentPlan: z.string().min(1, 'Payment plan is required'),
})

export const CapitalPartnerStep2Schema = z
  .object({
    projectNameDropdown: z.string().min(1, 'Project Name is required'),
    projectId: z.string().min(1, 'Project ID is required'),
    developerIdInput: z.string().min(1, 'Build Partner ID is required'),
    developerNameInput: z.string().min(1, 'Build Partner Name is required'),
    unitNoQaqood: z
      .string()
      .max(20, 'Unit no. must be 20 characters or less')
      .regex(
        /^[A-Za-z0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]*$/,
        'Unit no. can contain alphanumeric and special characters'
      )
      .optional()
      .or(z.literal('')),

    unitStatus: z.string().min(1, 'Unit Status is required'),

    plotSize: z
      .string()
      .min(1, 'Plot Size is required')
      .max(20, 'Plot Size must be 20 characters or less')
      .regex(
        /^[A-Za-z0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]*$/,
        'Plot Size can contain alphanumeric and special characters'
      ),

    propertyId: z.string().min(1, 'Property ID is required'),

    floor: z.string().optional().or(z.literal('')),
    bedroomCount: z.string().optional().or(z.literal('')),

    buildingName: z
      .string()
      .max(50, 'Building Name must be 50 characters or less')
      .optional()
      .or(z.literal('')),

    unitIban: z.string().optional().or(z.literal('')),

    registrationFees: z
      .string()
      .max(10, 'Unit Registration fee must be 10 characters or less')
      .optional()
      .or(z.literal('')),

    agentName: z
      .string()
      .max(35, 'Agent Name must be 35 characters or less')
      .optional()
      .or(z.literal('')),

    agentNationalId: z
      .string()
      .max(10, 'Agent National ID must be 10 digits or less')
      .optional()
      .or(z.literal('')),

    // grossSalePrice: z
    // .preprocess((val) => (val === undefined || val === null ? '' : val),
    //   z.coerce.string()
    //     .min(1, 'Gross Sale Price is required')
    //     .max(15, 'Gross Sale Price must be 15 characters or less')
    // ),

    VatApplicable: z.boolean().optional(),
    SalesPurchaseAgreement: z.boolean().optional(),
    ProjectPaymentPlan: z.boolean().optional(),

    salePrice: z
      .string()
      .max(15, 'Sale Price must be 15 characters or less')
      .regex(/^\d*(\.\d+)?$/, 'Sale Price must be a valid number')
      .optional()
      .or(z.literal('')),

    deedNo: z
      .string()
      .max(15, 'Deed No. must be 15 characters or less')
      .optional()
      .or(z.literal('')),
    contractNo: z
      .string()
      .max(15, 'Contract No. must be 15 characters or less')
      .regex(
        /^[A-Za-z0-9\s._\-\/,]*$/,
        'Contract No. can contain letters, numbers, spaces, and -_./,'
      )
      .optional()
      .or(z.literal('')),

    agreementDate: dayjsSchema.optional(),

    ModificationFeeNeeded: z.boolean().optional(),
    ReservationBookingForm: z.boolean().optional(),
    OqoodPaid: z.boolean().optional(),
    worldCheck: z.boolean().optional(),

    paidInEscrow: z
      .string()
      .max(15, 'Amount Paid Within Escrow must be 15 characters or less')
      .regex(
        /^\d*(\.\d+)?$/,
        'Amount Paid Within Escrow must be a valid number'
      )
      .optional()
      .or(z.literal('')),
    paidOutEscrow: z
      .string()
      .max(15, 'Amount Paid Out of Escrow must be 15 characters or less')
      .regex(
        /^\d*(\.\d+)?$/,
        'Amount Paid Out of Escrow must be a valid number'
      )
      .optional()
      .or(z.literal('')),
    totalPaid: z
      .string()
      .max(15, 'Total Amount Paid must be 15 characters or less')
      .regex(/^\d*(\.\d+)?$/, 'Total Amount Paid must be a valid number')
      .optional()
      .or(z.literal('')),

    qaqoodAmount: z
      .string()
      .max(15, 'Qaqood Amount must be 15 characters or less')
      .regex(/^\d*(\.\d+)?$/, 'Qaqood Amount must be a valid number')
      .optional()
      .or(z.literal('')),
    unitAreaSize: z
      .string()
      .max(15, 'Unit Area Size must be 15 characters or less')
      .regex(/^\d*(\.\d+)?$/, 'Unit Area Size must be a valid number')
      .optional()
      .or(z.literal('')),
    forfeitAmount: z
      .string()
      .max(15, 'Forfeit Amount must be 15 characters or less')
      .regex(/^\d*(\.\d+)?$/, 'Forfeit Amount must be a valid number')
      .optional()
      .or(z.literal('')),
    dldAmount: z
      .string()
      .max(15, 'DLD Amount must be 15 characters or less')
      .regex(/^\d*(\.\d+)?$/, 'DLD Amount must be a valid number')
      .optional()
      .or(z.literal('')),
    refundAmount: z
      .string()
      .max(15, 'Refund Amount must be 15 characters or less')
      .regex(/^\d*(\.\d+)?$/, 'Refund Amount must be a valid number')
      .optional()
      .or(z.literal('')),
    transferredAmount: z
      .string()
      .max(15, 'Transferred Amount must be 15 characters or less')
      .regex(/^\d*(\.\d+)?$/, 'Transferred Amount must be a valid number')
      .optional()
      .or(z.literal('')),

    unitRemarks: z
      .string()
      .max(50, 'Remarks must be 50 characters or less')
      .optional()
      .or(z.literal('')),
  })
  .superRefine((values, ctx) => {
    if (values.propertyId === '3') {
      const buildingName = values.buildingName ?? ''
      if (!buildingName || buildingName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['buildingName'],
          message: 'Building Name is required when Property ID is Unit',
        })
      }
    }

    if (values.totalPaid && (values.paidInEscrow || values.paidOutEscrow)) {
      const within = parseFloat(values.paidInEscrow || '0')
      const out = parseFloat(values.paidOutEscrow || '0')
      const total = parseFloat(values.totalPaid)

      if (!Number.isNaN(within) && !Number.isNaN(out) && !Number.isNaN(total)) {
        const sum = +(within + out).toFixed(2)
        const totalRounded = +total.toFixed(2)
        if (sum !== totalRounded) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['totalPaid'],
            message:
              'Total Amount Paid must equal Within Escrow + Out of Escrow',
          })
        }
      }
    }
  })

export const CapitalPartnerStep4Schema = z.object({
  // All fields are Non-Mandatory per spec
  payMode: z.string().optional().or(z.literal('')),

  accountNumber: z
    .string()
    .max(16, 'Account / IBAN Number must be 16 characters or less')
    .optional()
    .or(z.literal('')),

  payeeName: z
    .string()
    .max(50, 'Payee Name must be 50 characters or less')
    .optional()
    .or(z.literal('')),

  payeeAddress: z
    .string()
    .max(35, 'Payee Address must be 35 characters or less')
    .optional()
    .or(z.literal('')),

  bankName: z
    .string()
    .max(35, 'Bank Name must be 35 characters or less')
    .optional()
    .or(z.literal('')),

  bankAddress: z
    .string()
    .max(35, 'Bank Address must be 35 characters or less')
    .optional()
    .or(z.literal('')),

  beneficiaryRoutingCode: z
    .string()
    .max(35, 'Beneficiary Routing Code must be 35 characters or less')
    .optional()
    .or(z.literal('')),

  bic: z
    .string()
    .max(15, 'BIC Code must be 15 characters or less')
    .optional()
    .or(z.literal('')),
})

// Capital Partner Stepper Step 5: Bank Details Schema
export const CapitalPartnerStep5Schema = z.object({
  bankName: z
    .string()
    .min(1, 'Bank name is required')
    .max(100, 'Bank name must be 100 characters or less'),

  accountNumber: z
    .string()
    .min(1, 'Account number is required')
    .max(50, 'Account number must be 50 characters or less')
    .regex(
      /^[A-Za-z0-9]+$/,
      'Account number can only contain alphanumeric characters'
    ),

  iban: z
    .string()
    .min(1, 'IBAN is required')
    .max(50, 'IBAN must be 50 characters or less')
    .regex(/^[A-Za-z0-9]+$/, 'IBAN can only contain alphanumeric characters'),

  swiftCode: z
    .string()
    .min(1, 'SWIFT code is required')
    .max(20, 'SWIFT code must be 20 characters or less')
    .regex(
      /^[A-Za-z0-9]+$/,
      'SWIFT code can only contain alphanumeric characters'
    ),

  accountHolderName: z
    .string()
    .min(1, 'Account holder name is required')
    .max(100, 'Account holder name must be 100 characters or less')
    .regex(
      /^[A-Za-z\s\u0600-\u06FF]+$/,
      'Account holder name can only contain letters and spaces'
    ),

  currency: z.string().min(1, 'Currency is required'),

  // Optional fields
  branchCode: z
    .string()
    .max(20, 'Branch code must be 20 characters or less')
    .regex(
      /^[A-Za-z0-9]*$/,
      'Branch code can only contain alphanumeric characters'
    )
    .optional()
    .or(z.literal('')),

  remarks: z
    .string()
    .max(500, 'Remarks must be 500 characters or less')
    .optional()
    .or(z.literal('')),
})

// Capital Partner Stepper Step 6: Review Schema
export const CapitalPartnerStep6Schema = z.object({
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, 'Terms and conditions must be accepted'),

  dataAccuracyConfirmed: z
    .boolean()
    .refine((val) => val === true, 'Data accuracy must be confirmed'),

  // Optional review notes
  reviewNotes: z
    .string()
    .max(1000, 'Review notes must be 1000 characters or less')
    .optional()
    .or(z.literal('')),
})

// Combined schema for all steps
export const CapitalPartnerStepperSchemas = {
  step1: CapitalPartnerStep1Schema,
  step2: CapitalPartnerStep2Schema,
  step3: CapitalPartnerStep3Schema,
  step4: CapitalPartnerStep4Schema,
  step5: CapitalPartnerStep5Schema,
  step6: CapitalPartnerStep6Schema,
} as const

// Helper function to get step schema
export const getCapitalPartnerStepSchema = (stepNumber: number) => {
  const stepKeys = [
    'step1',
    'step2',
    'step3',
    'step4',
    'step5',
    'step6',
  ] as const
  const stepKey = stepKeys[stepNumber]
  return stepKey ? CapitalPartnerStepperSchemas[stepKey] : null
}

// Type exports for TypeScript inference
export type CapitalPartnerStep1Data = z.infer<typeof CapitalPartnerStep1Schema>
export type CapitalPartnerStep2Data = z.infer<typeof CapitalPartnerStep2Schema>
export type CapitalPartnerStep3Data = z.infer<typeof CapitalPartnerStep3Schema>
export type CapitalPartnerStep4Data = z.infer<typeof CapitalPartnerStep4Schema>
export type CapitalPartnerStep5Data = z.infer<typeof CapitalPartnerStep5Schema>
export type CapitalPartnerStep6Data = z.infer<typeof CapitalPartnerStep6Schema>

// Combined type for all steps
export type CapitalPartnerStepperData = {
  step1: CapitalPartnerStep1Data
  step2: CapitalPartnerStep2Data
  step3: CapitalPartnerStep3Data
  step4: CapitalPartnerStep4Data
  step5: CapitalPartnerStep5Data
  step6: CapitalPartnerStep6Data
}
