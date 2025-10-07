'use client'

import { useEffect } from 'react'
import { initializeSecurityServices } from '@/lib/securityInit'

export function SecurityInitializer() {
  useEffect(() => {
    // Initialize security services after the app has loaded
    // This prevents blocking the initial render
    const timeout = setTimeout(() => {
      try {
        initializeSecurityServices()
      } catch (error) {
        console.warn('Security services initialization failed:', error)
      }
    }, 2000) // Wait 2 seconds after app loads

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  return null // This component doesn't render anything
} 