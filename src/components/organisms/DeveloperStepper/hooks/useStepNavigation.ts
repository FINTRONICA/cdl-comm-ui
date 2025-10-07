import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { STEP_LABELS } from '../constants'
import { NavigationOptions } from '../types'

/**
 * Custom hook for managing step navigation logic
 */
export const useStepNavigation = (developerId?: string) => {
  const router = useRouter()

  const navigateToStep = useCallback((step: number) => {
    if (developerId) {
      router.push(`/developers/${developerId}/step/${step + 1}`)
    } else {
      // Fallback for local state navigation
      return step
    }
  }, [developerId, router])

  const navigateToNextStep = useCallback((options: NavigationOptions) => {
    const { currentStep, savedDeveloperId } = options

    if (currentStep < STEP_LABELS.length - 1) {
      if (currentStep === 0 && savedDeveloperId) {
        router.push(`/developers/${savedDeveloperId}/step/2`)
      } else if (developerId) {
        navigateToStep(currentStep + 1)
      } else {
        // Return next step for local state management
        return currentStep + 1
      }
    } else {
      router.push('/developers')
      return 'completed'
    }
  }, [developerId, router, navigateToStep])

  const navigateToPreviousStep = useCallback((currentStep: number) => {
    if (currentStep > 0) {
      return navigateToStep(currentStep - 1)
    }
  }, [navigateToStep])

  const navigateToCompletion = useCallback(() => {
    router.push('/developers')
  }, [router])

  return {
    navigateToStep,
    navigateToNextStep,
    navigateToPreviousStep,
    navigateToCompletion,
  }
}
