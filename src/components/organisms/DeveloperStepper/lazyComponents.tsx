import React, { lazy, Suspense, useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { GlobalLoading } from '@/components/atoms'

// Hook to detect dark mode
const useIsDarkMode = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return isDark
}

// Lazy load step components
const Step1 = lazy(() => import('./steps/Step1'))
const Step2 = lazy(() => import('./steps/Step2'))
const Step3 = lazy(() => import('./steps/Step3'))
const Step4 = lazy(() => import('./steps/Step4'))
const Step5 = lazy(() => import('./steps/Step5'))
const DocumentUploadStep = lazy(() => import('./steps/DocumentUploadStep'))

const StepLoadingFallback = () => {
  const isDarkMode = useIsDarkMode()

  return (
    <Box
      sx={{
        backgroundColor: isDarkMode ? '#101828' : '#FFFFFFBF',
        borderRadius: '16px',
        margin: '0 auto',
        width: '100%',
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <GlobalLoading fullHeight className="min-h-[400px]" />
    </Box>
  )
}

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
