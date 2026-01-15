import { useCallback } from "react";
import type { ZodIssue } from "zod";
import { validateAgreementFeeScheduleStepData } from "@/lib/validation/masterValidation/agreementFeeScheduleSchemas";
import { ValidationResult } from "@/components/organisms/Master/PartyStepper/types";

/**
 * Custom hook for managing step validation logic for Agreement Fee Schedule Stepper
 * Validates only the current step's fields using Agreement Fee Schedule schemas
 */
export const useStepValidation = () => {
  const validateStepData = useCallback(
    async (step: number, data: unknown): Promise<ValidationResult> => {
      try {
        // Skip validation for step 2 (documents) if needed
        if (step === 1) {
          return { isValid: true, errors: [], source: "skipped" };
        }

        // Use the agreement fee schedule validation helper that validates only step-specific fields
        const result = validateAgreementFeeScheduleStepData(step, data);

        if (result.success) {
          return {
            isValid: true,
            errors: [],
            source: "client",
          };
        } else {
          // Extract detailed error messages with field names
          const errorMessages =
            "error" in result && result.error?.issues
              ? result.error.issues.map((issue: ZodIssue) => {
                  const fieldPath = issue.path.join(".");
                  return fieldPath
                    ? `${fieldPath}: ${issue.message}`
                    : issue.message;
                })
              : ["Validation failed"];

          return {
            isValid: false,
            errors: errorMessages,
            source: "client",
          };
        }
      } catch {
        return {
          isValid: false,
          errors: ["Validation failed"],
          source: "client",
        };
      }
    },
    []
  );

  const validateStepDataSync = useCallback(
    (step: number, data: unknown): ValidationResult => {
      try {
        // Skip validation for step 2 (documents) if needed
        if (step === 1) {
          return { isValid: true, errors: [], source: "skipped" };
        }

        // Use synchronous validation
        const result = validateAgreementFeeScheduleStepData(step, data);

        if (result.success) {
          return {
            isValid: true,
            errors: [],
            source: "client",
          };
        } else {
          // Extract detailed error messages with field names
          const errorMessages =
            "error" in result && result.error?.issues
              ? result.error.issues.map((issue: ZodIssue) => {
                  const fieldPath = issue.path.join(".");
                  return fieldPath
                    ? `${fieldPath}: ${issue.message}`
                    : issue.message;
                })
              : ["Validation failed"];

          return {
            isValid: false,
            errors: errorMessages,
            source: "client",
          };
        }
      } catch {
        return {
          isValid: false,
          errors: ["Validation failed"],
          source: "client",
        };
      }
    },
    []
  );

  return {
    validateStepData,
    validateStepDataSync,
  };
};
