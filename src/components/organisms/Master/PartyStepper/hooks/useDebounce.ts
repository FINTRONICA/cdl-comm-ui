import { useCallback, useRef, useEffect, useState } from 'react'

/**
 * Custom hook for debouncing values
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Custom hook for debouncing function calls
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const callbackRef = useRef(callback)

  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback
  }, deps)

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    }) as T,
    [delay]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

/**
 * Custom hook for throttling function calls
 */
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const callbackRef = useRef(callback)
  const lastCallTime = useRef<number>(0)

  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback
  }, deps)

  const throttledCallback = useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()

      if (now - lastCallTime.current >= delay) {
        lastCallTime.current = now
        callbackRef.current(...args)
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          lastCallTime.current = Date.now()
          callbackRef.current(...args)
        }, delay - (now - lastCallTime.current))
      }
    }) as T,
    [delay]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return throttledCallback
}

/**
 * Custom hook for debounced validation
 */
export const useDebouncedValidation = (
  validationFn: (value: any) => Promise<boolean> | boolean,
  delay: number = 300
) => {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<boolean | null>(null)

  const debouncedValidate = useDebouncedCallback(
    async (value: any) => {
      setIsValidating(true)
      try {
        const result = await validationFn(value)
        setValidationResult(result)
      } catch (error) {
        setValidationResult(false)
      } finally {
        setIsValidating(false)
      }
    },
    delay
  )

  return {
    debouncedValidate,
    isValidating,
    validationResult,
  }
}

/**
 * Custom hook for debounced form updates
 */
export const useDebouncedFormUpdate = (
  updateFn: (value: any) => void,
  delay: number = 500
) => {
  const [isUpdating, setIsUpdating] = useState(false)

  const debouncedUpdate = useDebouncedCallback(
    async (value: any) => {
      setIsUpdating(true)
      try {
        await updateFn(value)
      } finally {
        setIsUpdating(false)
      }
    },
    delay
  )

  return {
    debouncedUpdate,
    isUpdating,
  }
}
