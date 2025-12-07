import { useCallback } from 'react'
import { validateStandingInstructionBeneficiaryStepData } from '@/lib/validation/masterValidation/paymentBeneficiarySchemas'
import { ValidationResult } from '../../../DeveloperStepper/types'

/**
 * Custom hook for managing step validation logic for Payment Beneficiary Stepper
 * Validates only the current step's fields using Payment Beneficiary schemas
 */
export const useStepValidation = () => {
  const validateStepData = useCallback(async (step: number, data: unknown): Promise<ValidationResult> => {
    try {
      // Skip validation for step 2 (documents) if needed
      if (step === 1) {
        return { isValid: true, errors: [], source: 'skipped' }
      }

      // Use the payment beneficiary validation helper that validates only step-specific fields
      const result = validateStandingInstructionBeneficiaryStepData(step, data)

      if (result.success) {
        return {
          isValid: true,
          errors: [],
          source: 'client',
        }
      } else {
        // Extract detailed error messages with field names
        const errorMessages = 'error' in result && result.error?.issues
          ? result.error.issues.map((issue: any) => {
            const fieldPath = issue.path.join('.')
            return fieldPath ? `${fieldPath}: ${issue.message}` : issue.message
          })
          : ['Validation failed']

        return {
          isValid: false,
          errors: errorMessages,
          source: 'client',
        }
      }
    } catch (error) {
      return {
        isValid: false,
        errors: ['Validation failed'],
        source: 'client',
      }
    }
  }, [])

  const validateStepDataSync = useCallback((step: number, data: unknown): ValidationResult => {
    try {
      // Skip validation for step 2 (documents) if needed
      if (step === 1) {
        return { isValid: true, errors: [], source: 'skipped' }
      }

      // Use synchronous validation
      const result = validateStandingInstructionBeneficiaryStepData(step, data)

      if (result.success) {
        return {
          isValid: true,
          errors: [],
          source: 'client',
        }
      } else {
        // Extract detailed error messages with field names
        const errorMessages = 'error' in result && result.error?.issues
          ? result.error.issues.map((issue: any) => {
            const fieldPath = issue.path.join('.')
            return fieldPath ? `${fieldPath}: ${issue.message}` : issue.message
          })
          : ['Validation failed']

        return {
          isValid: false,
          errors: errorMessages,
          source: 'client',
        }
      }
    } catch (error) {
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


