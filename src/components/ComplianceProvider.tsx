'use client'

import { useEffect, useState } from 'react'
import { useAppInitialization } from '@/hooks/useAppInitialization'
import { useAuthStore } from '@/store/authStore'
import { GlobalLoading, GlobalError } from './atoms'

interface ComplianceProviderProps {
  children: React.ReactNode
  showLoadingUI?: boolean
  enableDetailedLogging?: boolean
}

function ComplianceLoadingUI() {
  return (
    <GlobalLoading 
      fullHeight={true}
      className="min-h-screen bg-gray-50"
    />
  )
}

function ComplianceErrorUI({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <GlobalError 
      error={error}
      onRetry={onRetry}
      title="Compliance Loading Failed"
      fullHeight={true}
      className="min-h-screen bg-red-50"
    />
  )
}

export function ComplianceProvider({ 
  children, 
  showLoadingUI = true,
  enableDetailedLogging = false
}: ComplianceProviderProps) {
  // Suppress unused parameter warning
  void enableDetailedLogging
  // Use state to avoid hydration mismatch
  const [isClient, setIsClient] = useState(false)
  const [shouldLoadLabels, setShouldLoadLabels] = useState(false)
  
  // Get auth state only after client-side hydration
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Update shouldLoadLabels after hydration
  useEffect(() => {
    if (isClient) {
      setShouldLoadLabels(isAuthenticated && !!user)
    }
  }, [isClient, isAuthenticated, user])

  const {
    isInitializing,
    labelsLoaded,
    labelsError,
    retryLabelsLoading
  } = useAppInitialization({
    enableLabelLoading: shouldLoadLabels,
    enableRetryOnFailure: shouldLoadLabels,
    retryCount: 3
  })

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    if (showLoadingUI) {
      return <ComplianceLoadingUI />
    }

    return <>{children}</>
  }

  // Show loading UI when authenticated and loading
  if (shouldLoadLabels && isInitializing && showLoadingUI) {
    return <ComplianceLoadingUI />
  }

  // Show error UI when authenticated and there's an error
  if (shouldLoadLabels && labelsError && !labelsLoaded && showLoadingUI) {
    return (
      <ComplianceErrorUI 
        error={labelsError}
        onRetry={retryLabelsLoading}
      />
    )
  }

  // Always render children
  return <>{children}</>
}

export function MinimalComplianceProvider({ children }: { children: React.ReactNode }) {
  // Use state to avoid hydration mismatch
  const [isClient, setIsClient] = useState(false)
  const [shouldLoadLabels, setShouldLoadLabels] = useState(false)
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Update shouldLoadLabels after hydration
  useEffect(() => {
    if (isClient) {
      setShouldLoadLabels(isAuthenticated && !!user)
    }
  }, [isClient, isAuthenticated, user])

  useAppInitialization({
    enableLabelLoading: shouldLoadLabels,
  })

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return <>{children}</>
  }

  return <>{children}</>
}

export default ComplianceProvider
