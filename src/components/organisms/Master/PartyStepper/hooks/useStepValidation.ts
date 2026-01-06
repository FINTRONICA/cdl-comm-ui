import { useCallback } from 'react'
import { validateStepData as validateStepDataHelper } from '@/lib/validation/masterValidation/partySchemas'
import { ValidationResult } from '../types'

/**
 * Custom hook for managing step validation logic
 * Validates only the current step's fields, not all form fields
 */
export const useStepValidation = () => {
  const validateStepData = useCallback(async (step: number, data: unknown): Promise<ValidationResult> => {
    try {
      // Skip validation for step 4 (beneficiaries) if needed
      if (step === 4) {
        return { isValid: true, errors: [], source: 'skipped' }
      }

      // For Step 1, remove id field if it's empty or undefined (new party creation)
      let dataToValidate = data
      if (step === 1 && data && typeof data === 'object') {
        const dataObj = data as Record<string, unknown>
        // If id is empty string or undefined, remove it for validation (new party)
        if (!dataObj.id || dataObj.id === '' || dataObj.id === 'undefined') {
          dataToValidate = { ...dataObj }
          delete (dataToValidate as Record<string, unknown>).id
        }
      }

      // Use the helper that validates only step-specific fields
      const result = validateStepDataHelper(step, dataToValidate)

      if (result.success) {
        return {
          isValid: true,
          errors: [],
          source: 'client',
        }
      } else {
        // Extract detailed error messages with field names
        const errorMessages = 'error' in result && result.error?.issues
          ? result.error.issues.map((issue) => {
            const fieldPath = issue.path.map(String).join('.');
            return fieldPath ? `${fieldPath}: ${issue.message}` : issue.message;
          })
          : ['Validation failed'];


        return {
          isValid: false,
          errors: errorMessages,
          source: 'client',
        }
      }
    } catch {
      return {
        isValid: false,
        errors: ['Validation failed'],
        source: 'client',
      }
    }
  }, [])

  const validateStepDataSync = useCallback((step: number, data: unknown): ValidationResult => {
    try {
      // Skip validation for step 4 if needed
      if (step === 4) {
        return { isValid: true, errors: [], source: 'skipped' }
      }

      // For Step 1, remove id field if it's empty or undefined (new party creation)
      let dataToValidate = data
      if (step === 1 && data && typeof data === 'object') {
        const dataObj = data as Record<string, unknown>
        // If id is empty string or undefined, remove it for validation (new party)
        if (!dataObj.id || dataObj.id === '' || dataObj.id === 'undefined') {
          dataToValidate = { ...dataObj }
          delete (dataToValidate as Record<string, unknown>).id
        }
      }

      // Use synchronous validation
      const result = validateStepDataHelper(step, dataToValidate)

      if (result.success) {
        return {
          isValid: true,
          errors: [],
          source: 'client',
        }
      } else {
        // Extract detailed error messages with field names
        const errorMessages = 'error' in result && result.error?.issues
          ? result.error.issues.map((issue) => {
            const fieldPath = issue.path.map(String).join('.');
            return fieldPath ? `${fieldPath}: ${issue.message}` : issue.message;
          })
          : ['Validation failed'];

        return {
          isValid: false,
          errors: errorMessages,
          source: 'client',
        }
      }
    } catch {
      return {
        isValid: false,
        errors: ['Validation failed'],
        source: 'client',
      }
    }
  }, [])

  return {
    validateStepData,
    validateStepDataSync,
  }
}
