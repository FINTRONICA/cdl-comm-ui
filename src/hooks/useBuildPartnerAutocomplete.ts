import { useCallback, useState } from 'react'
import { buildPartnerService } from '@/services/api/buildPartnerService'
import type { AutocompleteOption } from '@/components/atoms/Autocomplete'

export interface UseBuildPartnerAutocompleteOptions {
  debounceMs?: number
  minSearchLength?: number
}

export const useBuildPartnerAutocomplete = (
  options: UseBuildPartnerAutocompleteOptions = {}
) => {
  const { minSearchLength = 1 } = options
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchBuildPartners = useCallback(
    async (query: string): Promise<AutocompleteOption[]> => {
      if (!query || query.trim().length < minSearchLength) {
        return []
      }

      setIsLoading(true)
      setError(null)

      try {
        const results = await buildPartnerService.searchBuildPartners(
          query.trim(),
          0, // page
          20 // size - limit results for autocomplete
        )

        const mappedResults = results.map((partner) => ({
          value: partner.bpDeveloperId || partner.id.toString(),
          label: partner.bpName || partner.bpMasterName || 'Unnamed Partner',
          // Store the complete build partner object for later use
          buildPartner: partner,
        }))

        return mappedResults
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to search build partners'
        setError(errorMessage)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [minSearchLength]
  )

  return {
    searchBuildPartners,
    isLoading,
    error,
  }
}
