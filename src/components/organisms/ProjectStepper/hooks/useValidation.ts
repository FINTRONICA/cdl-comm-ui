'use client'

import { useCallback, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { VALIDATION_PATTERNS, ERROR_MESSAGES } from '../constants'

export const useValidation = () => {
  const formContext = useFormContext()
  
  // Early return if form context is not available
  if (!formContext) {
    return {
      createFieldRules: () => ({}),
      validateField: async () => false,
      validateFields: async () => false,
      hasFieldError: () => false,
      getFieldError: () => '',
      validateForm: async () => false,
      isFormValid: false,
      getAllErrors: {},
      validateStep: async () => false,
      validatePercentage: () => true,
      validateAmount: () => true,
      validateEmail: () => true,
      validateRequired: () => true,
      validateMinLength: () => () => true,
      validateMaxLength: () => () => true,
    }
  }

  const { trigger, formState: { errors } } = formContext

  // Create validation rules for different field types
  const createFieldRules = useCallback((
    type: 'text' | 'email' | 'number' | 'percentage' | 'amount' | 'date' | 'select',
    required: boolean = false,
    customRules?: any
  ) => {
    const rules: any = {}

    if (required) {
      rules.required = ERROR_MESSAGES.REQUIRED
    }

    switch (type) {
      case 'email':
        rules.pattern = {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: 'Please enter a valid email address'
        }
        break
      case 'percentage':
        rules.pattern = {
          value: VALIDATION_PATTERNS.PERCENTAGE,
          message: ERROR_MESSAGES.INVALID_PERCENTAGE
        }
        break
      case 'amount':
        rules.pattern = {
          value: VALIDATION_PATTERNS.AMOUNT,
          message: ERROR_MESSAGES.INVALID_AMOUNT
        }
        break
      case 'number':
        rules.min = {
          value: 0,
          message: 'Value must be greater than or equal to 0'
        }
        break
    }

    return { ...rules, ...customRules }
  }, [])

  // Validate specific field
  const validateField = useCallback(async (fieldName: string) => {
    return await trigger(fieldName)
  }, [trigger])

  // Validate multiple fields
  const validateFields = useCallback(async (fieldNames: string[]) => {
    return await trigger(fieldNames)
  }, [trigger])

  // Check if field has error
  const hasFieldError = useCallback((fieldName: string) => {
    const fieldError = fieldName.split('.').reduce((obj: any, key) => obj?.[key], errors)
    return !!fieldError
  }, [errors])

  // Get field error message
  const getFieldError = useCallback((fieldName: string) => {
    const fieldError = fieldName.split('.').reduce((obj: any, key) => obj?.[key], errors)
    return fieldError?.message || ''
  }, [errors])

  // Validate entire form
  const validateForm = useCallback(async () => {
    return await trigger()
  }, [trigger])

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return Object.keys(errors).length === 0
  }, [errors])

  // Get all form errors
  const getAllErrors = useMemo(() => {
    return errors
  }, [errors])

  // Validate step data
  const validateStep = useCallback(async (stepFields: string[]) => {
    return await trigger(stepFields)
  }, [trigger])

  // Custom validation functions
  const validatePercentage = useCallback((value: string) => {
    if (!value) return true
    return VALIDATION_PATTERNS.PERCENTAGE.test(value) || ERROR_MESSAGES.INVALID_PERCENTAGE
  }, [])

  const validateAmount = useCallback((value: string) => {
    if (!value) return true
    return VALIDATION_PATTERNS.AMOUNT.test(value) || ERROR_MESSAGES.INVALID_AMOUNT
  }, [])

  const validateEmail = useCallback((value: string) => {
    if (!value) return true
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) || 'Please enter a valid email address'
  }, [])

  const validateRequired = useCallback((value: any) => {
    return !!value || ERROR_MESSAGES.REQUIRED
  }, [])

  const validateMinLength = useCallback((minLength: number) => {
    return (value: string) => {
      if (!value) return true
      return value.length >= minLength || `Must be at least ${minLength} characters`
    }
  }, [])

  const validateMaxLength = useCallback((maxLength: number) => {
    return (value: string) => {
      if (!value) return true
      return value.length <= maxLength || `Must be no more than ${maxLength} characters`
    }
  }, [])

  return {
    createFieldRules,
    validateField,
    validateFields,
    hasFieldError,
    getFieldError,
    validateForm,
    isFormValid,
    getAllErrors,
    validateStep,
    validatePercentage,
    validateAmount,
    validateEmail,
    validateRequired,
    validateMinLength,
    validateMaxLength,
  }
}
