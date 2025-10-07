'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
// Removed useDebounce import - defined inline below

interface UseAutoSaveOptions {
  interval?: number
  debounceMs?: number
  onSave?: (data: any) => Promise<void> | void
  onError?: (error: Error) => void
  enabled?: boolean
  saveOnUnmount?: boolean
  excludeFields?: string[]
}

export const useAutoSave = (options: UseAutoSaveOptions = {}) => {
  const {
    interval = 30000, // 30 seconds
    debounceMs = 2000, // 2 seconds
    onSave,
    onError,
    enabled = true,
    saveOnUnmount = true,
    excludeFields = [],
  } = options

  const formContext = useFormContext()
  
  // Early return if form context is not available
  if (!formContext) {
    return {
      manualSave: async () => {},
      isSaving: false,
      timeSinceLastSave: null,
      lastSaveTime: 0,
    }
  }

  const { watch, getValues, formState: { isDirty, isValid } } = formContext
  const savedDataRef = useRef<any>(null)
  const isSavingRef = useRef(false)
  const lastSaveTimeRef = useRef<number>(0)

  // Watch all form values
  const formData = watch()

  // Debounce the form data to avoid too frequent saves
  const debouncedFormData = useDebounce(formData, debounceMs)

  // Filter out excluded fields
  const filteredData = useCallback((data: any) => {
    if (excludeFields.length === 0) return data
    
    const filtered = { ...data }
    excludeFields.forEach(fieldPath => {
      const keys = fieldPath.split('.')
      let current: any = filtered
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        if (key && current[key] && typeof current[key] === 'object') {
          current = current[key]
        } else {
          return // Field path doesn't exist
        }
      }
      if (current && keys.length > 0) {
        const lastKey = keys[keys.length - 1]
        if (lastKey) {
          delete current[lastKey]
        }
      }
    })
    return filtered
  }, [excludeFields])

  // Save function
  const saveData = useCallback(async (data: any) => {
    if (isSavingRef.current || !onSave) return

    try {
      isSavingRef.current = true
      const filtered = filteredData(data)
      
      // Only save if data has changed
      if (JSON.stringify(filtered) !== JSON.stringify(savedDataRef.current)) {
        await onSave(filtered)
        savedDataRef.current = filtered
        lastSaveTimeRef.current = Date.now()
      }
    } catch (error) {
      onError?.(error as Error)
    } finally {
      isSavingRef.current = false
    }
  }, [onSave, onError, filteredData])

  // Auto-save on form data change
  useEffect(() => {
    if (!enabled || !isDirty || !isValid || !onSave) return

    const data = getValues()
    saveData(data)
  }, [debouncedFormData, enabled, isDirty, isValid, onSave, getValues, saveData])

  // Periodic save
  useEffect(() => {
    if (!enabled || !onSave) return

    const intervalId = setInterval(() => {
      if (isDirty && isValid && !isSavingRef.current) {
        const data = getValues()
        saveData(data)
      }
    }, interval)

    return () => clearInterval(intervalId)
  }, [enabled, isDirty, isValid, interval, onSave, getValues, saveData])

  // Save on unmount
  useEffect(() => {
    if (!saveOnUnmount || !onSave) return

    return () => {
      if (isDirty && isValid && !isSavingRef.current) {
        const data = getValues()
        saveData(data)
      }
    }
  }, [saveOnUnmount, isDirty, isValid, onSave, getValues, saveData])

  // Manual save function
  const manualSave = useCallback(async () => {
    if (!onSave) return

    const data = getValues()
    await saveData(data)
  }, [onSave, getValues, saveData])

  // Check if currently saving
  const isSaving = isSavingRef.current

  // Get time since last save
  const timeSinceLastSave = lastSaveTimeRef.current 
    ? Date.now() - lastSaveTimeRef.current 
    : null

  return {
    manualSave,
    isSaving,
    timeSinceLastSave,
    lastSaveTime: lastSaveTimeRef.current,
  }
}

// Hook for debouncing values
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

// Hook for form state persistence
export const useFormPersistence = (key: string, options: {
  enabled?: boolean
  version?: string
  excludeFields?: string[]
} = {}) => {
  const { enabled = true, version = '1.0', excludeFields = [] } = options
  const formContext = useFormContext()
  
  // Early return if form context is not available
  if (!formContext) {
    return {
      clearSavedData: () => {},
    }
  }

  const { setValue, watch } = formContext
  const storageKey = `form_${key}_${version}`

  // Load data from localStorage on mount
  useEffect(() => {
    if (!enabled) return

    try {
      const savedData = localStorage.getItem(storageKey)
      if (savedData) {
        const data = JSON.parse(savedData)
        
        // Set form values
        Object.keys(data).forEach(key => {
          if (!excludeFields.includes(key)) {
            setValue(key, data[key])
          }
        })
      }
    } catch (error) {
      throw error
    }
  }, [enabled, storageKey, setValue, excludeFields])

  // Save data to localStorage on form change
  useEffect(() => {
    if (!enabled) return

    const subscription = watch((data) => {
      try {
        const filtered = excludeFields.length > 0 
          ? Object.fromEntries(
              Object.entries(data).filter(([key]) => !excludeFields.includes(key))
            )
          : data
        
        localStorage.setItem(storageKey, JSON.stringify(filtered))
      } catch (error) {
        throw error
      }
    })

    return () => subscription.unsubscribe()
  }, [enabled, watch, storageKey, excludeFields])

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      throw error
    }
  }, [storageKey])

  return {
    clearSavedData,
  }
}
