import { useState, useEffect, useCallback, useRef } from 'react'

interface UseDataLoaderOptions {
  cacheKey?: string
  cacheTime?: number
  retryCount?: number
  retryDelay?: number
  preload?: boolean
}

interface UseDataLoaderReturn<T> {
  data: T[]
  loading: boolean
  error: string | null
  refetch: () => void
}

// Global preload cache
const preloadCache = new Map<string, { data: unknown[]; timestamp: number }>()

export function useDataLoader<T>(
  dataLoader: () => Promise<T[]> | T[],
  options: UseDataLoaderOptions = {}
): UseDataLoaderReturn<T> {
  const {
    cacheKey,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    retryCount = 3,
    retryDelay = 1000,
    // preload = false,
  } = options

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Track timeout for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Check cache first
  const getCachedData = useCallback(() => {
    if (!cacheKey || typeof window === 'undefined') return null
    
    try {
      // Check preload cache first
      const preloaded = preloadCache.get(cacheKey)
      if (preloaded && Date.now() - preloaded.timestamp < cacheTime) {
        return preloaded.data
      }

      // Check localStorage cache
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < cacheTime) {
            return cachedData
          }
        }
      }
    } catch (err) {
      console.warn('Failed to read cache:', err)
    }
    return null
  }, [cacheKey, cacheTime])

  // Save to cache
  const saveToCache = useCallback((dataToCache: T[]) => {
    if (!cacheKey || typeof window === 'undefined') return
    
    try {
      // Save to preload cache
      preloadCache.set(cacheKey, {
        data: dataToCache,
        timestamp: Date.now(),
      })

      // Save to localStorage cache
      const cacheData = {
        data: dataToCache,
        timestamp: Date.now(),
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (err) {
      console.warn('Failed to save cache:', err)
    }
  }, [cacheKey])

  // Load data with retry logic
  const loadData = useCallback(async (attempt: number = 0) => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    try {
      if (isMountedRef.current) {
        setLoading(true)
        setError(null)
      }

      // Check cache first
      const cachedData = getCachedData()
      if (cachedData) {
        if (isMountedRef.current) {
          setData(cachedData)
          setLoading(false)
        }
        return
      }

      // Load fresh data
      const result = await dataLoader()
      
      if (isMountedRef.current) {
        setData(result)
        saveToCache(result)
      }
    } catch (err) {
      if (!isMountedRef.current) return
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      setError(errorMessage)
      
      // Retry logic
      if (attempt < retryCount) {
        timeoutRef.current = setTimeout(() => {
          loadData(attempt + 1)
        }, retryDelay)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [dataLoader, getCachedData, saveToCache, retryCount, retryDelay])

  // Initial load
  useEffect(() => {
    isMountedRef.current = true
    loadData(0)
    
    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [loadData])

  // Refetch function
  const refetch = useCallback(() => {
    loadData(0)
  }, [loadData])

  return {
    data,
    loading,
    error,
    refetch,
  }
}

// Preload function for better performance
export function preloadData<T>(
  dataLoader: () => Promise<T[]> | T[],
  cacheKey: string,
  cacheTime: number = 5 * 60 * 1000
): void {
  // Only preload on client-side
  if (typeof window === 'undefined') return

  // Check if already preloaded
  const preloaded = preloadCache.get(cacheKey)
  if (preloaded && Date.now() - preloaded.timestamp < cacheTime) {
    return
  }

  // Preload in background
  setTimeout(async () => {
    try {
      const result = await dataLoader()
      preloadCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      })
     
    } catch (error) {
      console.warn(`Failed to preload data for: ${cacheKey}`, error)
    }
  }, 0)
}

// Clear preload cache
export function clearPreloadCache(cacheKey?: string): void {
  if (cacheKey) {
    preloadCache.delete(cacheKey)
  } else {
    preloadCache.clear()
  }
} 