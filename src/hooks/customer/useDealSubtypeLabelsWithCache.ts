import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dealSubtypeLabelsService } from '@/services/api/customerApi/dealSubtypeLabelsService'
import { useLabels, useLabelsActions } from '@/store'

// Deal Subtype Labels with Cache Hook
export const useDealSubtypeLabelsWithCache = () => {
  const queryClient = useQueryClient()
  const { dealSubtypeLabels, dealSubtypeLabelsLoading, dealSubtypeLabelsError } = useLabels()
  const { 
    setDealSubtypeLabels, 
    setDealSubtypeLabelsLoading, 
    setDealSubtypeLabelsError 
  } = useLabelsActions()

  // Get deal subtype labels with cache
  const useGetDealSubtypeLabels = (language: string = 'EN') => {
    return useQuery({
      queryKey: ['dealSubtypeLabels', language],
      queryFn: () => dealSubtypeLabelsService.getLabels(language),
      enabled: !dealSubtypeLabels || dealSubtypeLabelsLoading,
      onSuccess: (data) => {
        setDealSubtypeLabels(data)
        setDealSubtypeLabelsLoading(false)
        setDealSubtypeLabelsError(null)
      },
      onError: (error: any) => {
        setDealSubtypeLabelsError(error.message)
        setDealSubtypeLabelsLoading(false)
      },
    })
  }

  // Get deal subtype label by config ID with cache
  const useGetDealSubtypeLabelByConfigId = (configId: string, language: string = 'EN') => {
    return useQuery({
      queryKey: ['dealSubtypeLabel', configId, language],
      queryFn: () => dealSubtypeLabelsService.getLabelByConfigId(configId, language),
      enabled: !!configId,
    })
  }

  // Create deal subtype label
  const useCreateDealSubtypeLabel = () => {
    return useMutation({
      mutationFn: dealSubtypeLabelsService.createLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dealSubtypeLabels'] })
        setDealSubtypeLabelsLoading(true)
      },
    })
  }

  // Update deal subtype label
  const useUpdateDealSubtypeLabel = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        dealSubtypeLabelsService.updateLabel(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dealSubtypeLabels'] })
        setDealSubtypeLabelsLoading(true)
      },
    })
  }

  // Delete deal subtype label
  const useDeleteDealSubtypeLabel = () => {
    return useMutation({
      mutationFn: dealSubtypeLabelsService.deleteLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dealSubtypeLabels'] })
        setDealSubtypeLabelsLoading(true)
      },
    })
  }

  // Get available languages for deal subtype labels
  const useGetDealSubtypeLabelLanguages = () => {
    return useQuery({
      queryKey: ['dealSubtypeLabelLanguages'],
      queryFn: dealSubtypeLabelsService.getAvailableLanguages,
    })
  }

  return {
    useGetDealSubtypeLabels,
    useGetDealSubtypeLabelByConfigId,
    useCreateDealSubtypeLabel,
    useUpdateDealSubtypeLabel,
    useDeleteDealSubtypeLabel,
    useGetDealSubtypeLabelLanguages,
    // Store state
    dealSubtypeLabels,
    dealSubtypeLabelsLoading,
    dealSubtypeLabelsError,
  }
}
