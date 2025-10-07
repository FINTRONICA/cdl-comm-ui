import { useRef, useEffect, useCallback, useMemo } from 'react'

/**
 * Custom hook for memory-efficient caching using WeakMap
 */
export const useWeakMapCache = <K extends object, V>() => {
  const cacheRef = useRef(new WeakMap<K, V>())

  const get = useCallback((key: K): V | undefined => {
    return cacheRef.current.get(key)
  }, [])

  const set = useCallback((key: K, value: V): void => {
    cacheRef.current.set(key, value)
  }, [])

  const has = useCallback((key: K): boolean => {
    return cacheRef.current.has(key)
  }, [])

  const clear = useCallback(() => {
    cacheRef.current = new WeakMap<K, V>()
  }, [])

  return { get, set, has, clear }
}

/**
 * Custom hook for memory cleanup and resource management
 */
export const useResourceCleanup = () => {
  const cleanupFunctions = useRef<Set<() => void>>(new Set())

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.add(cleanup)
  }, [])

  const removeCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.delete(cleanup)
  }, [])

  const cleanup = useCallback(() => {
    cleanupFunctions.current.forEach(cleanupFn => {
      try {
        cleanupFn()
      } catch (error) {
        console.warn('Cleanup function failed:', error)
      }
    })
    cleanupFunctions.current.clear()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    addCleanup,
    removeCleanup,
    cleanup,
  }
}

/**
 * Custom hook for memory-efficient event listeners
 */
export const useMemoryOptimizedEventListeners = () => {
  const listenersRef = useRef<Map<string, EventListener>>(new Map())
  const cleanup = useResourceCleanup()

  const addEventListener = useCallback(
    (element: EventTarget, event: string, listener: EventListener, options?: AddEventListenerOptions) => {
      const key = `${element.toString()}-${event}`
      
      // Remove existing listener if any
      if (listenersRef.current.has(key)) {
        element.removeEventListener(event, listenersRef.current.get(key)!)
      }

      // Add new listener
      element.addEventListener(event, listener, options)
      listenersRef.current.set(key, listener)

      // Add cleanup function
      const cleanupFn = () => {
        element.removeEventListener(event, listener)
        listenersRef.current.delete(key)
      }
      cleanup.addCleanup(cleanupFn)

      return cleanupFn
    },
    [cleanup]
  )

  const removeEventListener = useCallback(
    (element: EventTarget, event: string, listener: EventListener) => {
      const key = `${element.toString()}-${event}`
      element.removeEventListener(event, listener)
      listenersRef.current.delete(key)
    },
    []
  )

  return {
    addEventListener,
    removeEventListener,
  }
}

/**
 * Custom hook for memory-efficient timers
 */
export const useMemoryOptimizedTimers = () => {
  const timersRef = useRef<Set<NodeJS.Timeout | number>>(new Set())
  const cleanup = useResourceCleanup()

  const setTimeout = useCallback((callback: () => void, delay: number) => {
    const timerId = window.setTimeout(() => {
      timersRef.current.delete(timerId)
      callback()
    }, delay)
    
    timersRef.current.add(timerId)
    cleanup.addCleanup(() => {
      window.clearTimeout(timerId)
      timersRef.current.delete(timerId)
    })

    return timerId
  }, [cleanup])

  const setInterval = useCallback((callback: () => void, delay: number) => {
    const timerId = window.setInterval(callback, delay)
    
    timersRef.current.add(timerId)
    cleanup.addCleanup(() => {
      window.clearInterval(timerId)
      timersRef.current.delete(timerId)
    })

    return timerId
  }, [cleanup])

  const clearTimeout = useCallback((timerId: NodeJS.Timeout | number) => {
    window.clearTimeout(timerId)
    timersRef.current.delete(timerId)
  }, [])

  const clearInterval = useCallback((timerId: NodeJS.Timeout | number) => {
    window.clearInterval(timerId)
    timersRef.current.delete(timerId)
  }, [])

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(timerId => {
      if (typeof timerId === 'number') {
        window.clearTimeout(timerId)
        window.clearInterval(timerId)
      }
    })
    timersRef.current.clear()
  }, [])

  return {
    setTimeout,
    setInterval,
    clearTimeout,
    clearInterval,
    clearAllTimers,
  }
}

/**
 * Custom hook for memory monitoring
 */
export const useMemoryMonitor = (componentName: string) => {
  const memoryInfo = useRef<{
    initialMemory: number
    peakMemory: number
    currentMemory: number
  }>({
    initialMemory: 0,
    peakMemory: 0,
    currentMemory: 0,
  })

  const updateMemoryInfo = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const currentMemory = memory.usedJSHeapSize

      if (memoryInfo.current.initialMemory === 0) {
        memoryInfo.current.initialMemory = currentMemory
      }

      memoryInfo.current.currentMemory = currentMemory
      memoryInfo.current.peakMemory = Math.max(
        memoryInfo.current.peakMemory,
        currentMemory
      )
    }
  }, [])

  const getMemoryStats = useCallback(() => {
    updateMemoryInfo()
    const { initialMemory, peakMemory, currentMemory } = memoryInfo.current

    return {
      initialMemory,
      peakMemory,
      currentMemory,
      memoryIncrease: currentMemory - initialMemory,
      peakIncrease: peakMemory - initialMemory,
    }
  }, [updateMemoryInfo])

  // Monitor memory periodically
  useEffect(() => {
    const interval = setInterval(updateMemoryInfo, 5000) // Check every 5 seconds
    return () => clearInterval(interval)
  }, [updateMemoryInfo])

  return {
    getMemoryStats,
    updateMemoryInfo,
  }
}

/**
 * Custom hook for object pooling to reduce garbage collection
 */
export const useObjectPool = <T>(
  createFn: () => T,
  resetFn: (obj: T) => void,
  initialSize: number = 10
) => {
  const poolRef = useRef<T[]>([])
  const activeObjectsRef = useRef<Set<T>>(new Set())

  // Initialize pool
  useEffect(() => {
    for (let i = 0; i < initialSize; i++) {
      poolRef.current.push(createFn())
    }
  }, [createFn, initialSize])

  const acquire = useCallback((): T => {
    let obj = poolRef.current.pop()
    
    if (!obj) {
      obj = createFn()
    }
    
    activeObjectsRef.current.add(obj)
    return obj
  }, [createFn])

  const release = useCallback((obj: T) => {
    if (activeObjectsRef.current.has(obj)) {
      resetFn(obj)
      poolRef.current.push(obj)
      activeObjectsRef.current.delete(obj)
    }
  }, [resetFn])

  const releaseAll = useCallback(() => {
    activeObjectsRef.current.forEach(obj => {
      resetFn(obj)
      poolRef.current.push(obj)
    })
    activeObjectsRef.current.clear()
  }, [resetFn])

  return {
    acquire,
    release,
    releaseAll,
    poolSize: poolRef.current.length,
    activeCount: activeObjectsRef.current.size,
  }
}
