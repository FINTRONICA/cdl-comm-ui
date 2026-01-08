import { z } from "zod";

export const AgreementStep1Schema = z.object({
  // Primary Escrow CIF Number - mandatory field
  primaryEscrowCifNumber: z
    .string()
    .min(1, "Primary Escrow CIF Number is required")
    .max(50, "CIF Number must be 50 characters or less"),

  // Product Manager Name - mandatory
  productManagerName: z
    .string()
    .min(1, "Product Manager Name is required")
    .max(100, "Product Manager Name must be 100 characters or less"),

  // Client Name - mandatory
  clientName: z
    .string()
    .min(1, "Client Name is required")
    .max(100, "Client Name must be 100 characters or less"),

  // Relationship Manager Name - mandatory
  relationshipManagerName: z
    .string()
    .min(1, "Relationship Manager Name is required")
    .max(100, "Relationship Manager Name must be 100 characters or less"),

  // Operating Location Code - mandatory
  operatingLocationCode: z
    .string()
    .min(1, "Operating Location Code is required")
    .max(50, "Operating Location Code must be 50 characters or less"),

  // Custom Fields - optional
  customField1: z
    .string()
    .max(200, "Custom Field 1 must be 200 characters or less")
    .optional()
    .or(z.literal("")),

  customField2: z
    .string()
    .max(200, "Custom Field 2 must be 200 characters or less")
    .optional()
    .or(z.literal("")),

  customField3: z
    .string()
    .max(200, "Custom Field 3 must be 200 characters or less")
    .optional()
    .or(z.literal("")),

  customField4: z
    .string()
    .max(200, "Custom Field 4 must be 200 characters or less")
    .optional()
    .or(z.literal("")),

  // Active status - optional boolean, accepts boolean, string, or null/undefined
  active: z.preprocess((val) => {
    if (val === null || val === undefined) return true;
    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val === "true" || val === "1";
    return Boolean(val);
  }, z.boolean().optional().default(true)),

  // DTO fields - optional, can be ID or full object
  agreementParametersDTO: z
    .union([z.object({ id: z.number().min(1) }), z.number().min(1)])
    .optional()
    .nullable(),

  agreementFeeDTO: z
    .union([z.object({ id: z.number().min(1) }), z.number().min(1)])
    .optional()
    .nullable(),

  clientNameDTO: z
    .union([z.object({ id: z.number().min(1) }), z.number().min(1)])
    .optional()
    .nullable(),

  businessSegmentDTO: z
    .union([z.object({ id: z.number().min(1) }), z.number().min(1)])
    .optional()
    .nullable(),

  businessSubSegmentDTO: z
    .union([z.object({ id: z.number().min(1) }), z.number().min(1)])
    .optional()
    .nullable(),

  dealStatusDTO: z
    .union([z.object({ id: z.number().min(1) }), z.number().min(1)])
    .optional()
    .nullable(),

  feesDTO: z
    .union([z.object({ id: z.number().min(1) }), z.number().min(1)])
    .optional()
    .nullable(),

  dealTypeDTO: z
    .union([z.object({ id: z.number().min(1) }), z.number().min(1)])
    .optional()
    .nullable(),

  dealSubTypeDTO: z
    .union([z.object({ id: z.number().min(1) }), z.number().min(1)])
    .optional()
    .nullable(),

  productProgramDTO: z
    .union([z.object({ id: z.number().min(1) }), z.number().min(1)])
    .optional()
    .nullable(),

  dealPriorityDTO: z
    .union([z.object({ id: z.number().min(1) }), z.number().min(1)])
    .optional()
    .nullable(),

  // System fields
  enabled: z.boolean().optional().default(true),
  deleted: z.boolean().optional().default(false),
});

// Agreement Step 2: Documents Schema (Optional)
export const AgreementStep2Schema = z.object({
  documents: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Document name is required"),
        size: z.number(),
        type: z.string(),
        uploadDate: z.date(),
        status: z.enum(["uploading", "completed", "error", "failed"]),
        progress: z.number().optional(),
        file: z.any().optional(),
        url: z.string().optional(),
        classification: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

// Agreement Step 3: Review Schema
export const AgreementStep3Schema = z.object({
  termsAccepted: z.boolean().optional(),
  dataAccuracyConfirmed: z.boolean().optional(),
  reviewNotes: z
    .string()
    .max(1000, "Review notes must be 1000 characters or less")
    .optional()
    .or(z.literal("")),
});

// Combined schema for all steps
export const AgreementStepperSchemas = {
  step1: AgreementStep1Schema,
  step2: AgreementStep2Schema,
  step3: AgreementStep3Schema,
} as const;

// Helper function to get step schema
export const getAgreementStepSchema = (stepNumber: number) => {
  const stepKeys = ["step1", "step2", "step3"] as const;
  const stepKey = stepKeys[stepNumber];
  return stepKey ? AgreementStepperSchemas[stepKey] : null;
};

// Helper to validate only step-specific data
export const validateAgreementStepData = (
  stepNumber: number,
  data: unknown
) => {
  const schema = getAgreementStepSchema(stepNumber);
  if (!schema) {
    return { success: true, data, errors: [] };
  }

  // Extract only the fields that belong to this step's schema
  const stepFields = Object.keys(schema.shape);
  const stepData: Record<string, unknown> = {};
  const dataObj = data as Record<string, unknown>;

  stepFields.forEach((field) => {
    if (field in dataObj) {
      stepData[field] = dataObj[field];
    }
  });

  // Validate only the step-specific data
  const result = schema.safeParse(stepData);

  return result;
};

// Helper function to get step validation key
export function getAgreementStepValidationKey(
  step: number
): keyof typeof AgreementStepperSchemas {
  const stepKeys: Array<keyof typeof AgreementStepperSchemas> = [
    "step1",
    "step2",
    "step3",
  ];
  return stepKeys[step] || "step1";
}

// Validation helper function for individual field
export const validateAgreementField = (
  stepNumber: number,
  fieldName: string,
  value: unknown
): string | true => {
  try {
    const schema = getAgreementStepSchema(stepNumber);
    if (!schema) return true;

    // Handle nested field paths
    if (fieldName.includes("[") || fieldName.includes(".")) {
      return true;
    }

    // Get the specific field schema
    const fieldSchema = (schema.shape as Record<string, z.ZodTypeAny>)[
      fieldName
    ];
    if (!fieldSchema) return true;

    // Validate using safeParse
    const result = fieldSchema.safeParse(value);
    if (!result.success) {
      const error = result.error.issues[0];
      return error?.message || "Invalid value";
    }

    return true;
  } catch {
    return "Validation failed";
  }
};

// Type exports for TypeScript inference
export type AgreementStep1Data = z.infer<typeof AgreementStep1Schema>;
export type AgreementStep2Data = z.infer<typeof AgreementStep2Schema>;
export type AgreementStep3Data = z.infer<typeof AgreementStep3Schema>;

// Combined type for all steps
export type AgreementStepperData = {
  step1: AgreementStep1Data;
  step2: AgreementStep2Data;
  step3: AgreementStep3Data;
};
