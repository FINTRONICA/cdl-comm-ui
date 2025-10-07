import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dealSegmentLabelsService } from '@/services/api/customerApi/dealSegmentLabelsService'
import { useLabels, useLabelsActions } from '@/store'

// Deal Segment Labels with Cache Hook
export const useDealSegmentLabelsWithCache = () => {
  const queryClient = useQueryClient()
  const { dealSegmentLabels, dealSegmentLabelsLoading, dealSegmentLabelsError } = useLabels()
  const { 
    setDealSegmentLabels, 
    setDealSegmentLabelsLoading, 
    setDealSegmentLabelsError 
  } = useLabelsActions()

  // Get deal segment labels with cache
  const useGetDealSegmentLabels = (language: string = 'EN') => {
    return useQuery({
      queryKey: ['dealSegmentLabels', language],
      queryFn: () => dealSegmentLabelsService.getLabels(language),
      enabled: !dealSegmentLabels || dealSegmentLabelsLoading,
      onSuccess: (data) => {
        setDealSegmentLabels(data)
        setDealSegmentLabelsLoading(false)
        setDealSegmentLabelsError(null)
      },
      onError: (error: any) => {
        setDealSegmentLabelsError(error.message)
        setDealSegmentLabelsLoading(false)
      },
    })
  }

  // Get deal segment label by config ID with cache
  const useGetDealSegmentLabelByConfigId = (configId: string, language: string = 'EN') => {
    return useQuery({
      queryKey: ['dealSegmentLabel', configId, language],
      queryFn: () => dealSegmentLabelsService.getLabelByConfigId(configId, language),
      enabled: !!configId,
    })
  }

  // Create deal segment label
  const useCreateDealSegmentLabel = () => {
    return useMutation({
      mutationFn: dealSegmentLabelsService.createLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dealSegmentLabels'] })
        setDealSegmentLabelsLoading(true)
      },
    })
  }

  // Update deal segment label
  const useUpdateDealSegmentLabel = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        dealSegmentLabelsService.updateLabel(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dealSegmentLabels'] })
        setDealSegmentLabelsLoading(true)
      },
    })
  }

  // Delete deal segment label
  const useDeleteDealSegmentLabel = () => {
    return useMutation({
      mutationFn: dealSegmentLabelsService.deleteLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dealSegmentLabels'] })
        setDealSegmentLabelsLoading(true)
      },
    })
  }

  // Get available languages for deal segment labels
  const useGetDealSegmentLabelLanguages = () => {
    return useQuery({
      queryKey: ['dealSegmentLabelLanguages'],
      queryFn: dealSegmentLabelsService.getAvailableLanguages,
    })
  }

  return {
    useGetDealSegmentLabels,
    useGetDealSegmentLabelByConfigId,
    useCreateDealSegmentLabel,
    useUpdateDealSegmentLabel,
    useDeleteDealSegmentLabel,
    useGetDealSegmentLabelLanguages,
    // Store state
    dealSegmentLabels,
    dealSegmentLabelsLoading,
    dealSegmentLabelsError,
  }
}
