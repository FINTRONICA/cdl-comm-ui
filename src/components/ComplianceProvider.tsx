'use client'

import { useEffect, useState } from 'react'
import { useAppInitialization } from '@/hooks/useAppInitialization'
import { useAuthStore } from '@/store/authStore'

interface ComplianceProviderProps {
  children: React.ReactNode
  showLoadingUI?: boolean
  enableDetailedLogging?: boolean
}

function ComplianceLoadingUI() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #2563eb',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function ComplianceErrorUI({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#fef2f2',
      color: '#1e293b'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        {/* Error Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 24px',
          backgroundColor: '#dc2626',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          color: 'white'
        }}>
          ERROR
        </div>

        {/* Title */}
        <h2 style={{
          margin: '0 0 16px',
          fontSize: '24px',
          fontWeight: '600',
          color: '#dc2626'
        }}>
          Compliance Loading Failed
        </h2>

        {/* Error Message */}
        <p style={{
          margin: '0 0 32px',
          fontSize: '16px',
          color: '#7f1d1d',
          lineHeight: '1.5'
        }}>
          {error}
        </p>

        {/* Retry Button */}
        <button
          onClick={onRetry}
          style={{
            padding: '12px 24px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            marginBottom: '24px'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
        >
          Retry Loading
        </button>

        {/* Support Info */}
        <div style={{
          padding: '16px',
          backgroundColor: '#fee2e2',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#7f1d1d',
          lineHeight: '1.4'
        }}>
          <div style={{ fontWeight: '500', marginBottom: '4px' }}>
            Need Help?
          </div>
          If this issue persists, please contact your system administrator.
        </div>
      </div>
    </div>
  )
}

export function ComplianceProvider({ 
  children, 
  showLoadingUI = true,
  enableDetailedLogging = false // eslint-disable-line @typescript-eslint/no-unused-vars 
}: ComplianceProviderProps) {
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
