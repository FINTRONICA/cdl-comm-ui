import { useState, useEffect } from 'react'
import {
  realEstateAssetService,
  type RealEstateAsset,
} from '../services/api/realEstateAssetService1'

interface UseRealEstateAssetsReturn {
  data: RealEstateAsset[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch real estate assets for project dropdown
 */
export const useRealEstateAssets = (): UseRealEstateAssetsReturn => {
  const [data, setData] = useState<RealEstateAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRealEstateAssets = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await realEstateAssetService.findAllRealEstateAssets()

      // Extract the content array from the response
      setData(response.content || [])
    } catch (err) {
      console.error('Error fetching real estate assets:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch real estate assets'
      )
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRealEstateAssets()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchRealEstateAssets,
  }
}

/**
 * Transform real estate asset data for dropdown usage
 */
export const transformRealEstateAssetsForDropdown = (
  assets: RealEstateAsset[]
) => {
  return assets.map((asset) => ({
    id: asset.id,
    displayName: asset.reaName, // Project Name
    settingValue: asset.reaId, // Project ID
    // Additional data for dependent fields
    projectId: asset.reaId,
    developerId: asset.buildPartnerDTO?.bpDeveloperId || '',
    developerName: asset.buildPartnerDTO?.bpName || '',
    // Store the full asset for reference
    fullAsset: asset,
  }))
}
