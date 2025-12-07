import { useState, useEffect, useCallback } from 'react'
import {
  suretyBondTranslationService,
  type SuretyBondTranslation,
} from '@/services/api/suretyBondTranslationService'
import { getSuretyBondLabel } from '@/constants/mappings/suretyBondMapping'

let CACHE: SuretyBondTranslation[] | null = null

export interface UseSuretyBondLabelsWithCacheResult {
  data: SuretyBondTranslation[] | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getLabel: (
    configId: string,
    languageCode?: string,
    fallback?: string
  ) => string
  clearCache: () => void
}

export const useSuretyBondLabelsWithCache = (
  languageCode: string = 'EN'
): UseSuretyBondLabelsWithCacheResult => {
  const [data, setData] = useState<SuretyBondTranslation[] | null>(CACHE)
  const [loading, setLoading] = useState<boolean>(!CACHE)
  const [error, setError] = useState<string | null>(null)

  const fetchLabels = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const labels =
        await suretyBondTranslationService.getAllSuretyBondTranslations()
      CACHE = labels
      setData(labels)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to fetch surety bond labels'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [languageCode])

  const getLabel = useCallback(
    (
      configId: string,
      language: string = languageCode,
      fallback?: string
    ): string => {
      const fb = fallback ?? getSuretyBondLabel(configId)
      const source = data ?? CACHE
      if (!source || !source.length) return fb

      const byLang = source.find(
        (t) =>
          t.configId === configId &&
          t.appLanguageCode?.languageCode === language
      )
      if (byLang?.configValue) return byLang.configValue

      const any = source.find((t) => t.configId === configId)
      return any?.configValue || fb
    },
    [data, languageCode]
  )

  const refetch = useCallback(async () => {
    CACHE = null
    await fetchLabels()
  }, [fetchLabels])

  const clearCache = useCallback(() => {
    CACHE = null
    setData(null)
  }, [])

  useEffect(() => {
    if (!CACHE) fetchLabels()
  }, [fetchLabels])

  return { data, loading, error, refetch, getLabel, clearCache }
}


