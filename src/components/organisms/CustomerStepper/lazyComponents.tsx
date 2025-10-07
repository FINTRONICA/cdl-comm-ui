import React, { lazy, Suspense } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'

// Customer-specific step components
const CustomerStep1 = lazy(() => import('./steps/CustomerStep1'))
const CustomerStep2 = lazy(() => import('./steps/CustomerStep2'))
const CustomerStep3 = lazy(() => import('./steps/CustomerStep3'))
const CustomerStep4 = lazy(() => import('./steps/CustomerStep4'))
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
  customerStep1: () => import('./steps/CustomerStep1'),
  customerStep2: () => import('./steps/CustomerStep2'),
  customerStep3: () => import('./steps/CustomerStep3'),
  customerStep4: () => import('./steps/CustomerStep4'),
  documentUpload: () => import('./steps/DocumentUploadStep'),
}

// Preload next step for better performance
export const preloadNextStep = (currentStep: number) => {
  const preloadMap: Record<number, () => Promise<any>> = {
    0: preloadSteps.customerStep2,
    1: preloadSteps.customerStep3,
    2: preloadSteps.customerStep4,
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
  CustomerStep1,
  CustomerStep2,
  CustomerStep3,
  CustomerStep4,
  DocumentUploadStep,
  LazyStepWrapper,
  StepLoadingFallback,
}
