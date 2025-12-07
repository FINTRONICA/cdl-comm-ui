import { useCallback, useEffect } from 'react'
import {
  Step1,
  Step2,
  Step3,
  DocumentUploadStep,
  LazyStepWrapper,
  preloadNextStep,
} from './lazyComponents'
import { StepContentProps } from './types'
import { DocumentItem } from './partyTypes'

export const useStepContentRenderer = ({
  partyId,
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

  // Memoized callbacks to prevent infinite re-renders

  const getStepContent = useCallback(
    (step: number) => {
      const stepComponents = {
        0: () => (
          <LazyStepWrapper>
            <Step1 isReadOnly={isReadOnly} partyId={partyId} />
          </LazyStepWrapper>
        ),
        1: () => (
          <LazyStepWrapper>
            <DocumentUploadStep
              partyId={partyId || ''}
              onDocumentsChange={(documents: DocumentItem[]) =>
                methods.setValue('documents', documents)
              }
              isOptional={true}
              isReadOnly={isReadOnly}
            />
          </LazyStepWrapper>
        ),
        2: () => (
          <LazyStepWrapper>
            <Step2
              partyId={partyId || ''}
              isReadOnly={isReadOnly}
            />
          </LazyStepWrapper>
        ),
        3: () => (
          <LazyStepWrapper>
            <Step3
              partyId={partyId}
              onEditStep={onEditStep || undefined}
              isReadOnly={isReadOnly}
            />
          </LazyStepWrapper>
        ),
      }

      const StepComponent = stepComponents[step as keyof typeof stepComponents]
      return StepComponent ? StepComponent() : null
    },
    [partyId, methods, isReadOnly, onEditStep]
  )

  return {
    getStepContent,
  }
}
