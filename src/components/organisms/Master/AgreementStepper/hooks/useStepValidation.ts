import { useCallback } from "react";
import { validateAgreementStepData } from "@/lib/validation/masterValidation/agreementSchemas";
import { ValidationResult } from "../../PartyStepper/types";

export const useStepValidation = () => {
  const validateStepData = useCallback(
    async (step: number, data: unknown): Promise<ValidationResult> => {
      try {
        if (step === 1) {
          return { isValid: true, errors: [], source: "skipped" };
        }
        const result = validateAgreementStepData(step, data);
        if (result.success) {
          return {
            isValid: true,
            errors: [],
            source: "client",
          };
        } else {
          const errorMessages =
            "error" in result && result.error?.issues
              ? result.error.issues.map((issue) => {
                  const fieldPath = issue.path.map(String).join(".");
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
        if (step === 1) {
          return { isValid: true, errors: [], source: "skipped" };
        }
        const result = validateAgreementStepData(step, data);
        if (result.success) {
          return {
            isValid: true,
            errors: [],
            source: "client",
          };
        } else {
          const errorMessages =
            "error" in result && result.error?.issues
              ? result.error.issues.map((issue) => {
                  const fieldPath = issue.path.map(String).join(".");
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
