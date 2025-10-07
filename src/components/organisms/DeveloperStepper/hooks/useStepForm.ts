import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { ProjectData } from '../developerTypes'
import { DEFAULT_FORM_VALUES, RESET_FORM_STEPS } from '../constants'
import { FormState } from '../types'

/**
 * Custom hook for managing step form state and operations
 */
export const useStepForm = (developerId?: string, activeStep?: number) => {
  const [formState, setFormState] = useState<FormState>({
    shouldResetForm: true,
    isAddingContact: false,
  })

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
    if (RESET_FORM_STEPS.includes(activeStep as number) && developerId) {
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
