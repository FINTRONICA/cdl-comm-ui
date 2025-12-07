import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { ProjectData } from '../developerTypes'
import { DEFAULT_FORM_VALUES, RESET_FORM_STEPS } from '../constants'
import { FormState } from '../types'

/**
 * Custom hook for managing step form state and operations
 * Note: Validation is handled at field-level and step-level, not form-level
 * This prevents validation of fields from other steps
 */
export const useStepForm = (developerId?: string, activeStep?: number) => {
  const [formState, setFormState] = useState<FormState>({
    shouldResetForm: true,
    isAddingContact: false,
  })

  // Don't use zodResolver here - it would validate all fields at once
  // Instead, we validate field-by-field and step-by-step manually
  const methods = useForm<ProjectData>({
    defaultValues: DEFAULT_FORM_VALUES,
    mode: 'onChange',
  })

  const setShouldResetForm = useCallback((value: boolean) => {
    setFormState(prev => ({ ...prev, shouldResetForm: value }))
  }, [])

  const setIsAddingContact = useCallback((value: boolean) => {
    setFormState(prev => ({ ...prev, isAddingContact: value }))
  }, [])

  const resetForm = useCallback(() => {
    methods.reset()
    setFormState(prev => ({ ...prev, shouldResetForm: false }))
  }, [methods])

  const resetFormToDefaults = useCallback(() => {
    methods.reset(DEFAULT_FORM_VALUES)
    setFormState(prev => ({ ...prev, shouldResetForm: false }))
  }, [methods])

  // Reset form when step changes
  useEffect(() => {
    setShouldResetForm(true)
  }, [activeStep, setShouldResetForm])

  // Reset form for specific steps when developerId changes
  useEffect(() => {
    if (activeStep !== undefined && RESET_FORM_STEPS.includes(activeStep as 1 | 2 | 3) && developerId) {
      setShouldResetForm(true)
    }
  }, [activeStep, developerId, setShouldResetForm])

  return {
    methods,
    formState,
    setShouldResetForm,
    setIsAddingContact,
    resetForm,
    resetFormToDefaults,
  }
}
