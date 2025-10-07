import { useState, useEffect, useCallback } from 'react'
import { 
  suretyBondTranslationService, 
  SuretyBondTranslation
} from '@/services/api/suretyBondTranslationService'

// Simplified hook for dropdown usage
export const useSuretyBondTranslationsDropdown = () => {
  const [translations, setTranslations] = useState<SuretyBondTranslation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTranslations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await suretyBondTranslationService.getAllSuretyBondTranslations()
      setTranslations(result)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch translations'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTranslations()
  }, [fetchTranslations])

  return {
    translations,
    loading,
    error,
    refetch: fetchTranslations
  }
}

// Hook for getting translations by config ID pattern (useful for form labels)
export const useSuretyBondTranslationsByPattern = (pattern: string) => {
  const [translations, setTranslations] = useState<SuretyBondTranslation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTranslations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await suretyBondTranslationService.getAllSuretyBondTranslations()
      
      // Filter by pattern client-side
      const filteredTranslations = result.filter(translation => 
        translation.configId.includes(pattern)
      )
      
      setTranslations(filteredTranslations)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch translations'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [pattern])

  useEffect(() => {
    if (pattern) {
      fetchTranslations()
    }
  }, [pattern, fetchTranslations])

  return {
    translations,
    loading,
    error,
    refetch: fetchTranslations
  }
}