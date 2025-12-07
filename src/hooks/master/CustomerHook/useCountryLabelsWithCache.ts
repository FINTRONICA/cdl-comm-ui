import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import {
  CountryLabelsService,
  type ProcessedCountryLabels,
} from '@/services/api/masterApi/Customer/countryLabelsService'
import { getMasterLabel } from '@/constants/mappings/master/masterMapping'

const COUNTRY_LABELS_QUERY_KEY = 'countryLabels'

export function useCountryLabelsWithCache() {
  const { data: labels, isLoading, error } = useQuery({
    queryKey: [COUNTRY_LABELS_QUERY_KEY],
    queryFn: async () => {
      const rawLabels = await CountryLabelsService.fetchLabels()
      return CountryLabelsService.processLabels(rawLabels)
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })

  const getCountryLabelDynamic = useCallback(
    (configId: string, language: string = 'EN'): string => {
      if (!labels) {
        return getMasterLabel(configId)
      }
      return (
        CountryLabelsService.getLabel(labels, configId, language, getMasterLabel(configId)) ||
        getMasterLabel(configId)
      )
    },
    [labels]
  )

  const hasLabels = useMemo(() => {
    return CountryLabelsService.hasLabels(labels || {})
  }, [labels])

  const availableLanguages = useMemo(() => {
    return CountryLabelsService.getAvailableLanguages(labels || {})
  }, [labels])

  return {
    labels: labels || ({} as ProcessedCountryLabels),
    isLoading,
    error,
    getCountryLabelDynamic,
    hasLabels,
    availableLanguages,
  }
}
