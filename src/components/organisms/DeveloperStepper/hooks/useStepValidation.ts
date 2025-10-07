import { useCallback } from 'react'
import { ValidationHelper } from '@/lib/validation/utils/validationHelper'
import {
  DeveloperStepperSchemas,
  getStepValidationKey,
} from '@/lib/validation/developerSchemas'
import { ValidationResult } from '../types'

/**
 * Custom hook for managing step validation logic
 */
export const useStepValidation = () => {
  const validateStepData = useCallback(async (step: number, data: unknown): Promise<ValidationResult> => {
    try {
      if (step === 4) {
        return { isValid: true, errors: [], source: 'skipped' }
      }

      const stepKey = getStepValidationKey(step)
      const schema = DeveloperStepperSchemas[stepKey]
      const clientValidation = await ValidationHelper.validateAndSanitize(schema as any, data)

      return {
        isValid: clientValidation.success,
        errors: clientValidation.success ? [] : clientValidation.errors,
        source: 'client',
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
      if (step === 4) {
        return { isValid: true, errors: [], source: 'skipped' }
      }

      // For synchronous validation, we can add basic checks here
      // This is a simplified version - in real implementation you might want more robust validation
      return {
        isValid: true,
        errors: [],
        source: 'client',
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
