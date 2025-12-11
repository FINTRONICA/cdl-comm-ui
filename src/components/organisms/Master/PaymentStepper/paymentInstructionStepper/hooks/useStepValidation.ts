import { useCallback } from 'react'
import { validateStandingInstructionStepData } from '@/lib/validation/masterValidation/paymentInstructionSchemas'
import { ValidationResult } from '../../../../DeveloperStepper/types'

/**
 * Custom hook for managing step validation logic for Payment Instruction Stepper
 * Validates only the current step's fields using Payment Instruction schemas
 */
export const useStepValidation = () => {
  const validateStepData = useCallback(async (step: number, data: unknown): Promise<ValidationResult> => {
    try {
      // Skip validation for step 2 (documents) if needed
      if (step === 1) {
        return { isValid: true, errors: [], source: 'skipped' }
      }

      // Filter out date fields from validation data
      const dataObj = data as Record<string, unknown>
      const filteredData = { ...dataObj }
      delete filteredData.firstTransactionDateTime
      delete filteredData.instructionExpiryDateTime
      delete filteredData.nextExecutionDateTime

      // Use the payment instruction validation helper that validates only step-specific fields
      const result = validateStandingInstructionStepData(step, filteredData)

      if (result.success) {
        return {
          isValid: true,
          errors: [],
          source: 'client',
        }
      } else {
        // Extract detailed error messages with field names, but filter out date field errors
        const errorMessages = 'error' in result && result.error?.issues
          ? result.error.issues
              .filter((issue) => {
                const fieldPath = (issue.path as (string | number)[]).join('.')
                return fieldPath !== 'firstTransactionDateTime' && 
                       fieldPath !== 'instructionExpiryDateTime' && 
                       fieldPath !== 'nextExecutionDateTime'
              })
              .map((issue) => {
                const fieldPath = (issue.path as (string | number)[]).join('.')
                return fieldPath ? `${fieldPath}: ${issue.message}` : issue.message
              })
          : ['Validation failed']

        // If all errors were date fields, validation passes
        if (errorMessages.length === 0 || (errorMessages.length === 1 && errorMessages[0] === 'Validation failed')) {
          return {
            isValid: true,
            errors: [],
            source: 'client',
          }
        }

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
      // Skip validation for step 2 (documents) if needed
      if (step === 1) {
        return { isValid: true, errors: [], source: 'skipped' }
      }

      // Filter out date fields from validation data
      const dataObj = data as Record<string, unknown>
      const filteredData = { ...dataObj }
      delete filteredData.firstTransactionDateTime
      delete filteredData.instructionExpiryDateTime
      delete filteredData.nextExecutionDateTime

      // Use synchronous validation
      const result = validateStandingInstructionStepData(step, filteredData)

      if (result.success) {
        return {
          isValid: true,
          errors: [],
          source: 'client',
        }
      } else {
        // Extract detailed error messages with field names, but filter out date field errors
        const errorMessages = 'error' in result && result.error?.issues
          ? result.error.issues
              .filter((issue) => {
                const fieldPath = (issue.path as (string | number)[]).join('.')
                return fieldPath !== 'firstTransactionDateTime' && 
                       fieldPath !== 'instructionExpiryDateTime' && 
                       fieldPath !== 'nextExecutionDateTime'
              })
              .map((issue) => {
                const fieldPath = (issue.path as (string | number)[]).join('.')
                return fieldPath ? `${fieldPath}: ${issue.message}` : issue.message
              })
          : ['Validation failed']

        // If all errors were date fields, validation passes
        if (errorMessages.length === 0 || (errorMessages.length === 1 && errorMessages[0] === 'Validation failed')) {
          return {
            isValid: true,
            errors: [],
            source: 'client',
          }
        }

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

