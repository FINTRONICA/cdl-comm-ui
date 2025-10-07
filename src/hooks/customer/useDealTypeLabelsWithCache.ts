import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dealTypeLabelsService } from '@/services/api/customerApi/dealTypeLabelsService'
import { useLabels, useLabelsActions } from '@/store'

// Deal Type Labels with Cache Hook
export const useDealTypeLabelsWithCache = () => {
  const queryClient = useQueryClient()
  const { dealTypeLabels, dealTypeLabelsLoading, dealTypeLabelsError } = useLabels()
  const { 
    setDealTypeLabels, 
    setDealTypeLabelsLoading, 
    setDealTypeLabelsError 
  } = useLabelsActions()

  // Get deal type labels with cache
  const useGetDealTypeLabels = (language: string = 'EN') => {
    return useQuery({
      queryKey: ['dealTypeLabels', language],
      queryFn: () => dealTypeLabelsService.getLabels(language),
      enabled: !dealTypeLabels || dealTypeLabelsLoading,
      onSuccess: (data) => {
        setDealTypeLabels(data)
        setDealTypeLabelsLoading(false)
        setDealTypeLabelsError(null)
      },
      onError: (error: any) => {
        setDealTypeLabelsError(error.message)
        setDealTypeLabelsLoading(false)
      },
    })
  }

  // Get deal type label by config ID with cache
  const useGetDealTypeLabelByConfigId = (configId: string, language: string = 'EN') => {
    return useQuery({
      queryKey: ['dealTypeLabel', configId, language],
      queryFn: () => dealTypeLabelsService.getLabelByConfigId(configId, language),
      enabled: !!configId,
    })
  }

  // Create deal type label
  const useCreateDealTypeLabel = () => {
    return useMutation({
      mutationFn: dealTypeLabelsService.createLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dealTypeLabels'] })
        setDealTypeLabelsLoading(true)
      },
    })
  }

  // Update deal type label
  const useUpdateDealTypeLabel = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        dealTypeLabelsService.updateLabel(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dealTypeLabels'] })
        setDealTypeLabelsLoading(true)
      },
    })
  }

  // Delete deal type label
  const useDeleteDealTypeLabel = () => {
    return useMutation({
      mutationFn: dealTypeLabelsService.deleteLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dealTypeLabels'] })
        setDealTypeLabelsLoading(true)
      },
    })
  }

  // Get available languages for deal type labels
  const useGetDealTypeLabelLanguages = () => {
    return useQuery({
      queryKey: ['dealTypeLabelLanguages'],
      queryFn: dealTypeLabelsService.getAvailableLanguages,
    })
  }

  return {
    useGetDealTypeLabels,
    useGetDealTypeLabelByConfigId,
    useCreateDealTypeLabel,
    useUpdateDealTypeLabel,
    useDeleteDealTypeLabel,
    useGetDealTypeLabelLanguages,
    // Store state
    dealTypeLabels,
    dealTypeLabelsLoading,
    dealTypeLabelsError,
  }
}
