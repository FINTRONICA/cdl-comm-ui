import { useCallback, useState } from 'react'
import { realEstateAssetService } from '@/services/api/realEstateAssetService'
import type { AutocompleteOption } from '@/components/atoms/Autocomplete'

export interface UseRealEstateAssetAutocompleteOptions {
  debounceMs?: number
  minSearchLength?: number
}

export const useRealEstateAssetAutocomplete = (
  options: UseRealEstateAssetAutocompleteOptions = {}
) => {
  const { minSearchLength = 1 } = options
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchRealEstateAssets = useCallback(
    async (query: string): Promise<AutocompleteOption[]> => {
      if (!query || query.trim().length < minSearchLength) {
        return []
      }

      setIsLoading(true)
      setError(null)

      try {
        const results = await realEstateAssetService.searchRealEstateAssets(
          query.trim(),
          0, // page
          20 // size - limit results for autocomplete
        )

        const mappedResults = results.map((asset) => ({
          value: asset.reaId || asset.id.toString(),
          label: asset.reaName || 'Unnamed Asset',
          // Store the complete real estate asset object for later use
          realEstateAsset: asset,
        }))
        return mappedResults
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to search real estate assets'
        setError(errorMessage)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [minSearchLength]
  )

  return {
    searchRealEstateAssets,
    isLoading,
    error,
  }
}
