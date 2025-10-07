'use client'

import { useEffect } from 'react'

export function PerformanceMonitor() {
  useEffect(() => {
    // Monitor navigation performance
    const startTime = performance.now()
    
    console.log('🚀 App initialization started:', new Date().toISOString())

    // Monitor page load time
    const handleLoad = () => {
      const loadTime = performance.now() - startTime
      console.log(`⏱️ Page load time: ${loadTime.toFixed(2)}ms`)
    }

    // Monitor navigation performance
    const handleNavigation = () => {
      const navTime = performance.now() - startTime
      console.log(`🧭 Navigation time: ${navTime.toFixed(2)}ms`)
    }

    // Monitor component mount times
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`📊 Performance: ${entry.name} - ${entry.duration.toFixed(2)}ms`)
        }
      })
    })

    observer.observe({ entryTypes: ['measure'] })

    // Add event listeners
    window.addEventListener('load', handleLoad)
    window.addEventListener('popstate', handleNavigation)

    // Monitor DOM mutations for slow operations
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          console.log(`🔄 DOM mutation: ${mutation.addedNodes.length} nodes added`)
        }
      })
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      window.removeEventListener('load', handleLoad)
      window.removeEventListener('popstate', handleNavigation)
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  return null
} 