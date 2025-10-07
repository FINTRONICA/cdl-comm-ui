import { useCallback, useEffect } from 'react'
import {
  CustomerStep1,
  CustomerStep2,
  CustomerStep3,
  CustomerStep4,
  LazyStepWrapper,
  preloadNextStep,
} from './lazyComponents'
import { StepContentProps } from './types'


export const useStepContentRenderer = ({
  customerId,
  methods,
  activeStep,
  onEditStep,
  isReadOnly = false,
}: StepContentProps & { isReadOnly?: boolean }) => {
  // Preload next step for better performance
  useEffect(() => {
    if (activeStep !== undefined) {
      preloadNextStep(activeStep)
    }
  }, [activeStep])

  const getStepContent = useCallback(
    (step: number) => {
      const stepComponents = {
        0: () => (
          <LazyStepWrapper>
            <CustomerStep1 isReadOnly={isReadOnly} />
          </LazyStepWrapper>
        ),
        1: () => (
          <LazyStepWrapper>
            <CustomerStep2 isReadOnly={isReadOnly} />
          </LazyStepWrapper>
        ),
        2: () => (
          <LazyStepWrapper>
            <CustomerStep3
              customerId={customerId || ''}
              isReadOnly={isReadOnly}
            />
          </LazyStepWrapper>
        ),
        3: () => (
          <LazyStepWrapper>
            <CustomerStep4
              customerId={customerId}
              onEditStep={onEditStep}
              isReadOnly={isReadOnly}
            />
          </LazyStepWrapper>
        ),
      }

      const StepComponent = stepComponents[step as keyof typeof stepComponents]
      return StepComponent ? StepComponent() : null
    },
    [customerId, methods, isReadOnly, onEditStep]
  )

  return {
    getStepContent,
  }
}
