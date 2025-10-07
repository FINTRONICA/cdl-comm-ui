import { useEffect, useRef, useCallback } from 'react'

interface PerformanceMetrics {
  renderCount: number
  lastRenderTime: number
  averageRenderTime: number
  stepSwitchTime: number
  memoryUsage?: number
}

interface PerformanceConfig {
  trackMemory?: boolean
  logMetrics?: boolean
  threshold?: number // Render time threshold in ms
}

/**
 * Custom hook for monitoring component performance
 */
export const usePerformanceMonitor = (
  componentName: string,
  config: PerformanceConfig = {}
) => {
  const {
    trackMemory = false,
    logMetrics = false,
    threshold = 16, // 60fps threshold
  } = config

  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    stepSwitchTime: 0,
  })

  const renderStartTime = useRef<number>(0)
  const stepStartTime = useRef<number>(0)

  // Track render performance
  useEffect(() => {
    const startTime = performance.now()
    renderStartTime.current = startTime

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime

      metricsRef.current.renderCount++
      metricsRef.current.lastRenderTime = renderTime

      // Calculate average render time
      const { renderCount, averageRenderTime } = metricsRef.current
      metricsRef.current.averageRenderTime = 
        (averageRenderTime * (renderCount - 1) + renderTime) / renderCount

      // Track memory usage if enabled
      if (trackMemory && 'memory' in performance) {
        const memory = (performance as any).memory
        metricsRef.current.memoryUsage = memory.usedJSHeapSize
      }

      // Log performance warnings
      if (logMetrics && renderTime > threshold) {
        console.warn(
          `[${componentName}] Slow render detected: ${renderTime.toFixed(2)}ms (threshold: ${threshold}ms)`
        )
      }

      if (logMetrics && renderCount % 10 === 0) {
        // Performance metrics logged for debugging when enabled
      }
    }
  })

  // Track step switching performance
  const startStepTimer = useCallback(() => {
    stepStartTime.current = performance.now()
  }, [])

  const endStepTimer = useCallback(() => {
    const stepTime = performance.now() - stepStartTime.current
    metricsRef.current.stepSwitchTime = stepTime

    if (logMetrics) {
      // Step switch time logged for debugging when enabled
    }
  }, [componentName, logMetrics])

  // Get current metrics
  const getMetrics = useCallback(() => ({
    ...metricsRef.current,
    componentName,
  }), [componentName])

  // Reset metrics
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      stepSwitchTime: 0,
    }
  }, [])

  return {
    getMetrics,
    resetMetrics,
    startStepTimer,
    endStepTimer,
    isSlowRender: metricsRef.current.lastRenderTime > threshold,
  }
}

/**
 * Hook for measuring specific operations
 */
export const useOperationTimer = () => {
  const startTime = useRef<number>(0)

  const startTimer = useCallback(() => {
    startTime.current = performance.now()
  }, [])

  const endTimer = useCallback((_operationName: string) => {
    const duration = performance.now() - startTime.current
    // Duration logged for debugging when needed
    return duration
  }, [])

  return {
    startTimer,
    endTimer,
  }
}
