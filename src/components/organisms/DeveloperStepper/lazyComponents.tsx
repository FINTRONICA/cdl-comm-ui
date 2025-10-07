import React, { lazy, Suspense } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'

// Lazy load step components
const Step1 = lazy(() => import('./steps/Step1'))
const Step2 = lazy(() => import('./steps/Step2'))
const Step3 = lazy(() => import('./steps/Step3'))
const Step4 = lazy(() => import('./steps/Step4'))
const Step5 = lazy(() => import('./steps/Step5'))
const DocumentUploadStep = lazy(() => import('./steps/DocumentUploadStep'))

// Loading component for Suspense fallback
const StepLoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      gap: 2,
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      Loading step...
    </Typography>
  </Box>
)

// Error boundary component for lazy loading errors
const StepErrorBoundary = ({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) => {
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    const handleError = () => setHasError(true)
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return (
      fallback || (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            gap: 2,
          }}
        >
          <Typography variant="h6" color="error">
            Failed to load step
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please refresh the page and try again
          </Typography>
        </Box>
      )
    )
  }

  return <>{children}</>
}

// Wrapper component with Suspense and Error Boundary
const LazyStepWrapper = ({ children }: { children: React.ReactNode }) => (
  <StepErrorBoundary>
    <Suspense fallback={<StepLoadingFallback />}>{children}</Suspense>
  </StepErrorBoundary>
)

// Preload functions for better UX
export const preloadSteps = {
  step1: () => import('./steps/Step1'),
  step2: () => import('./steps/Step2'),
  step3: () => import('./steps/Step3'),
  step4: () => import('./steps/Step4'),
  step5: () => import('./steps/Step5'),
  documentUpload: () => import('./steps/DocumentUploadStep'),
}

// Preload next step for better performance
export const preloadNextStep = (currentStep: number) => {
  const preloadMap: Record<number, () => Promise<any>> = {
    0: preloadSteps.step2,
    1: preloadSteps.documentUpload,
    2: preloadSteps.step3,
    3: preloadSteps.step4,
    4: preloadSteps.step5,
  }

  const preloadFn = preloadMap[currentStep]
  if (preloadFn) {
    preloadFn().catch(() => {
      // Silently handle preload errors
    })
  }
}

// Export lazy components with wrappers
export {
  Step1,
  Step2,
  Step3,
  Step4,
  Step5,
  DocumentUploadStep,
  LazyStepWrapper,
  StepLoadingFallback,
}
