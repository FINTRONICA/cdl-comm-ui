import { useState, useEffect, useCallback } from 'react'
import {
  realEstateAssetService,
  type RealEstateAsset,
} from '@/services/api/realEstateAssetService'

// Hook return type
export interface UseRealEstateAssetsReturn {
  assets: RealEstateAsset[]
  loading: boolean
  error: string | null
  refetch: () => void
  findAssetByName: (name: string) => RealEstateAsset | undefined
  findAssetById: (id: string) => RealEstateAsset | undefined
}

// Stats hook return type
export interface UseRealEstateAssetStatsReturn {
  data: {
    total: number;
    approved: number;
    rejected: number;
    incomplete: number;
    inReview: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

// Delete hook return type
export interface UseDeleteRealEstateAssetReturn {
  mutateAsync: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and manage real estate assets data
 * @param page - Page number (default: 0)
 * @param size - Page size (default: 20)
 * @returns Object containing assets data, loading state, error, and utility functions
 */

export function useRealEstateAssets(
  page: number = 0,
  size: number = 20
): UseRealEstateAssetsReturn {
  const [assets, setAssets] = useState<RealEstateAsset[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await realEstateAssetService.getRealEstateAssets(
        page,
        size
      )
      setAssets(result)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      setAssets([])
    } finally {
      setLoading(false)
    }
  }, [page, size])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  const findAssetByName = useCallback(
    (name: string): RealEstateAsset | undefined => {
      return assets.find((asset) => asset.reaName === name)
    },
    [assets]
  )

  const findAssetById = useCallback(
    (id: string): RealEstateAsset | undefined => {
      return assets.find((asset) => asset.reaId === id)
    },
    [assets]
  )

  return {
    assets,
    loading,
    error,
    refetch: fetchAssets,
    findAssetByName,
    findAssetById,
  }
}

/**
 * Hook to fetch real estate asset statistics
 * @returns Object containing stats data, loading state, and error
 */
export function useRealEstateAssetStats(): UseRealEstateAssetStatsReturn {
  const [data, setData] = useState<UseRealEstateAssetStatsReturn['data']>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch all assets to calculate stats
      const assets = await realEstateAssetService.getRealEstateAssets(0, 1000)

      // Calculate statistics based on asset status
      const stats = {
        total: assets.length,
        approved: assets.filter(
          (asset) => asset.reaStatusDTO?.settingValue === 'APPROVED'
        ).length,
        rejected: assets.filter(
          (asset) => asset.reaStatusDTO?.settingValue === 'REJECTED'
        ).length,
        incomplete: assets.filter(
          (asset) => asset.reaStatusDTO?.settingValue === 'INCOMPLETE'
        ).length,
        inReview: assets.filter(
          (asset) => asset.reaStatusDTO?.settingValue === 'IN_REVIEW'
        ).length,
      }

      setData(stats)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    data,
    isLoading,
    error,
  }
}

/**
 * Hook to delete a real estate asset
 * @returns Object containing delete mutation function, loading state, and error
 */
export function useDeleteRealEstateAsset(): UseDeleteRealEstateAssetReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const mutateAsync = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('🔄 useDeleteRealEstateAsset: Deleting asset...', {
        id,
        timestamp: new Date().toISOString(),
      })

      await realEstateAssetService.deleteRealEstateAsset(id)

      console.log('✅ useDeleteRealEstateAsset: Successfully deleted asset:', {
        id,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)

      console.error('❌ useDeleteRealEstateAsset: Failed to delete asset:', {
        error: errorMessage,
        errorType: err instanceof Error ? err.name : 'Unknown',
        timestamp: new Date().toISOString(),
      })

      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    mutateAsync,
    isLoading,
    error,
  }
}
