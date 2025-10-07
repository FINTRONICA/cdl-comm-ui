import { useMemo, useCallback, useRef } from 'react'

/**
 * Custom hook for optimized memoization with dependency comparison
 */
export const useOptimizedMemo = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  const ref = useRef<{ deps: React.DependencyList; value: T }>()
  
  return useMemo(() => {
    if (!ref.current || !areEqual(deps, ref.current.deps)) {
      ref.current = { deps, value: factory() }
    }
    return ref.current.value
  }, deps)
}

/**
 * Custom hook for optimized callback with dependency comparison
 */
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  const ref = useRef<{ deps: React.DependencyList; callback: T }>()
  
  return useCallback(() => {
    if (!ref.current || !areEqual(deps, ref.current.deps)) {
      ref.current = { deps, callback }
    }
    return ref.current.callback
  }, deps) as T
}

/**
 * Shallow comparison for dependency arrays
 */
const areEqual = (a: React.DependencyList, b: React.DependencyList): boolean => {
  if (a.length !== b.length) return false
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  
  return true
}

/**
 * Memoize object creation with deep comparison
 */
export const useMemoizedObject = <T extends Record<string, any>>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return useOptimizedMemo(() => {
    const obj = factory()
    return { ...obj } // Create new object reference
  }, deps)
}

/**
 * Memoize array creation with deep comparison
 */
export const useMemoizedArray = <T>(
  factory: () => T[],
  deps: React.DependencyList
): T[] => {
  return useOptimizedMemo(() => {
    const arr = factory()
    return [...arr] // Create new array reference
  }, deps)
}
