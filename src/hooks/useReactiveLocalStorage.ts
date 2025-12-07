import { useState, useEffect, useCallback } from 'react'

/**
 * A reactive localStorage hook that listens to storage events
 * and updates components when localStorage changes from external sources
 */
export function useReactiveLocalStorage<T>(
  key: string, 
  initialValue: T,
  options?: {
    serializer?: {
      parse: (value: string) => T
      stringify: (value: T) => string
    }
    syncAcrossTabs?: boolean
  }
) {
  const serializer = options?.serializer || {
    parse: JSON.parse,
    stringify: JSON.stringify
  }
  
  const syncAcrossTabs = options?.syncAcrossTabs ?? true

  // Get initial value from localStorage
  const getStoredValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? serializer.parse(item) : initialValue
    } catch (error) {
      
      return initialValue
    }
  }, [key, initialValue, serializer])

  const [storedValue, setStoredValue] = useState<T>(getStoredValue)

  // Update localStorage and state
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, serializer.stringify(valueToStore))
        
        // Dispatch custom event to notify other components/tabs
        window.dispatchEvent(new CustomEvent('localStorage-change', {
          detail: { key, value: valueToStore }
        }))
      }
    } catch (error) {
      throw error
    }
  }, [key, storedValue, serializer])

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      // Handle native storage events (cross-tab changes)
      if (e instanceof StorageEvent) {
        if (e.key === key && e.newValue !== null) {
          try {
            const newValue = serializer.parse(e.newValue)
            setStoredValue(newValue)
            
          } catch (error) {
            throw error
          }
        }
      }
      
      // Handle custom events (same-tab changes)
      if (e instanceof CustomEvent && e.detail?.key === key) {
        setStoredValue(e.detail.value)
        
      }
    }

    if (typeof window !== 'undefined') {
      // Listen for cross-tab changes
      if (syncAcrossTabs) {
        window.addEventListener('storage', handleStorageChange)
      }
      
      // Listen for same-tab changes
      window.addEventListener('localStorage-change', handleStorageChange as EventListener)
    }

    return () => {
      if (typeof window !== 'undefined') {
        if (syncAcrossTabs) {
          window.removeEventListener('storage', handleStorageChange)
        }
        window.removeEventListener('localStorage-change', handleStorageChange as EventListener)
      }
    }
  }, [key, serializer, syncAcrossTabs])

  // Refresh value from localStorage (useful for manual refresh)
  const refreshValue = useCallback(() => {
    const newValue = getStoredValue()
    setStoredValue(newValue)
    return newValue
  }, [getStoredValue])

  return [storedValue, setValue, refreshValue] as const
}

/**
 * Hook to listen for specific localStorage key changes
 */
export function useLocalStorageListener<T = unknown>(
  key: string,
  callback: (newValue: T | null, oldValue: T | null) => void,
  options?: { syncAcrossTabs?: boolean }
) {
  const syncAcrossTabs = options?.syncAcrossTabs ?? true

  useEffect(() => {
    let oldValue: T | null = null
    
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(key)
        oldValue = item ? JSON.parse(item) : null
      } catch (error) {
        throw error
      }
    }

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      let newValue: T | null = null
      
      // Handle native storage events (cross-tab changes)
      if (e instanceof StorageEvent && e.key === key) {
        try {
          newValue = e.newValue ? JSON.parse(e.newValue) : null
          callback(newValue, oldValue)
          oldValue = newValue
        } catch (error) {
          throw error
        }
      }
      
      // Handle custom events (same-tab changes)
      if (e instanceof CustomEvent && e.detail?.key === key) {
        newValue = e.detail.value
        callback(newValue, oldValue)
        oldValue = newValue
      }
    }

    if (typeof window !== 'undefined') {
      if (syncAcrossTabs) {
        window.addEventListener('storage', handleStorageChange)
      }
      window.addEventListener('localStorage-change', handleStorageChange as EventListener)
    }

    return () => {
      if (typeof window !== 'undefined') {
        if (syncAcrossTabs) {
          window.removeEventListener('storage', handleStorageChange)
        }
        window.removeEventListener('localStorage-change', handleStorageChange as EventListener)
      }
    }
  }, [key, callback, syncAcrossTabs])
}
