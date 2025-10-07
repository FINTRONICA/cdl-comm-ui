import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { businessSubSegmentLabelsService } from '@/services/api/customerApi/businessSubSegmentLabelsService'
import { useLabels, useLabelsActions } from '@/store'

// Business Sub Segment Labels with Cache Hook
export const useBusinessSubSegmentLabelsWithCache = () => {
  const queryClient = useQueryClient()
  const { businessSubSegmentLabels, businessSubSegmentLabelsLoading, businessSubSegmentLabelsError } = useLabels()
  const { 
    setBusinessSubSegmentLabels, 
    setBusinessSubSegmentLabelsLoading, 
    setBusinessSubSegmentLabelsError 
  } = useLabelsActions()

  // Get business sub segment labels with cache
  const useGetBusinessSubSegmentLabels = (language: string = 'EN') => {
    return useQuery({
      queryKey: ['businessSubSegmentLabels', language],
      queryFn: () => businessSubSegmentLabelsService.getLabels(language),
      enabled: !businessSubSegmentLabels || businessSubSegmentLabelsLoading,
      onSuccess: (data) => {
        setBusinessSubSegmentLabels(data)
        setBusinessSubSegmentLabelsLoading(false)
        setBusinessSubSegmentLabelsError(null)
      },
      onError: (error: any) => {
        setBusinessSubSegmentLabelsError(error.message)
        setBusinessSubSegmentLabelsLoading(false)
      },
    })
  }

  // Get business sub segment label by config ID with cache
  const useGetBusinessSubSegmentLabelByConfigId = (configId: string, language: string = 'EN') => {
    return useQuery({
      queryKey: ['businessSubSegmentLabel', configId, language],
      queryFn: () => businessSubSegmentLabelsService.getLabelByConfigId(configId, language),
      enabled: !!configId,
    })
  }

  // Create business sub segment label
  const useCreateBusinessSubSegmentLabel = () => {
    return useMutation({
      mutationFn: businessSubSegmentLabelsService.createLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businessSubSegmentLabels'] })
        setBusinessSubSegmentLabelsLoading(true)
      },
    })
  }

  // Update business sub segment label
  const useUpdateBusinessSubSegmentLabel = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        businessSubSegmentLabelsService.updateLabel(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businessSubSegmentLabels'] })
        setBusinessSubSegmentLabelsLoading(true)
      },
    })
  }

  // Delete business sub segment label
  const useDeleteBusinessSubSegmentLabel = () => {
    return useMutation({
      mutationFn: businessSubSegmentLabelsService.deleteLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businessSubSegmentLabels'] })
        setBusinessSubSegmentLabelsLoading(true)
      },
    })
  }

  // Get available languages for business sub segment labels
  const useGetBusinessSubSegmentLabelLanguages = () => {
    return useQuery({
      queryKey: ['businessSubSegmentLabelLanguages'],
      queryFn: businessSubSegmentLabelsService.getAvailableLanguages,
    })
  }

  return {
    useGetBusinessSubSegmentLabels,
    useGetBusinessSubSegmentLabelByConfigId,
    useCreateBusinessSubSegmentLabel,
    useUpdateBusinessSubSegmentLabel,
    useDeleteBusinessSubSegmentLabel,
    useGetBusinessSubSegmentLabelLanguages,
    // Store state
    businessSubSegmentLabels,
    businessSubSegmentLabelsLoading,
    businessSubSegmentLabelsError,
  }
}
