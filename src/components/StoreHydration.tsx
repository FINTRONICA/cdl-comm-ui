'use client'

import { useRef } from 'react'
import { useAppStore } from '@/store'

export function StoreHydration({ children }: { children: React.ReactNode }) {
  const hasHydrated = useRef(false)

  // Only hydrate once, but don't block rendering
  if (!hasHydrated.current) {
    hasHydrated.current = true
    // Rehydrate immediately in background without blocking
    Promise.resolve().then(() => {
      try {
        useAppStore.persist.rehydrate()
      } catch (error) {
        console.warn('Store rehydration failed:', error)
      }
    })
  }

  // Always render children immediately
  return <>{children}</>
}
