import { useCallback } from 'react'
import { useBuildPartnerStepManager } from '@/hooks'
import { ApiError } from '../types'
import { SKIP_VALIDATION_STEPS } from '../constants'
import { useStepNavigation } from './useStepNavigation'
import { useStepValidation } from './useStepValidation'
import { useStepNotifications } from './useStepNotifications'
import { transformStepData, useStepDataTransformers } from '../transformers'


export const useStepHandlers = (
  activeStep: number,
  developerId?: string,
  methods?: any,
  isEditingMode?: boolean  // Add editing mode parameter
) => {
  const stepManager = useBuildPartnerStepManager()
  const navigation = useStepNavigation(developerId)
  const validation = useStepValidation()
  const notifications = useStepNotifications()
  const transformers = useStepDataTransformers()

  const handleSaveAndNext = useCallback(async () => {
    try {
    

      notifications.clearNotifications()

      const isEditing = !!isEditingMode
  
      
      if (SKIP_VALIDATION_STEPS.includes(activeStep as any)) {
       
        const nextStep = navigation.navigateToNextStep({ 
          currentStep: activeStep,
          developerId: developerId || ''
        })
        return nextStep
      }
      
      

      if (activeStep === 5) {
        navigation.navigateToCompletion()
        notifications.showSuccess('Developer registration completed successfully!')
        return
      }
      if (!methods) {
        notifications.showError('Form methods not available') 
        return
      }

      const currentFormData = methods.getValues()
      
      const stepSpecificData = transformStepData(activeStep + 1, currentFormData, transformers)

      const validationResult = await validation.validateStepData(activeStep, stepSpecificData)



      if (!validationResult.isValid) {
        const errorPrefix = validationResult.source === 'client' 
          ? 'Form validation failed' 
          : 'Server validation failed'
        notifications.showError(`${errorPrefix}: ${validationResult.errors?.join(', ')}`)
        return
      }


      const saveResponse = await stepManager.saveStep(activeStep + 1, stepSpecificData, isEditing, developerId)

      if (isEditing) {
        notifications.showSuccess('Step updated successfully!')
      } else {
        notifications.showSuccess('Step saved successfully!')
      }


      const savedDeveloperId = (saveResponse as any)?.data?.id || (saveResponse as any)?.id
      const nextStep = navigation.navigateToNextStep({ 
        currentStep: activeStep,
        developerId: developerId || '',
        savedDeveloperId 
      })
      return nextStep

    } catch (error: unknown) {
      const errorData = error as ApiError
      const errorMessage = errorData?.response?.data?.message ||
        errorData?.message ||
        'Failed to save step. Please try again.'
      notifications.showError(errorMessage)
      return
    }
  }, [
    activeStep,
    developerId,
    methods,
    stepManager,
    navigation,
    validation,
    notifications,
    transformers,
    isEditingMode  
  ])

  const handleBack = useCallback(() => {
    if (activeStep > 0) {
      return activeStep - 1
    }
    return activeStep
  }, [activeStep])

  const handleReset = useCallback(() => {
    if (methods) {
      methods.reset()
    }
    notifications.clearNotifications()
    return 0 
  }, [methods, notifications])

  return {
    handleSaveAndNext,
    handleBack,
    handleReset,
    notifications,
  }
}