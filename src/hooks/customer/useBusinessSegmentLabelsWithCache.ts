import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { businessSegmentLabelsService } from '@/services/api/customerApi/businessSegmentLabelsService'
import { useLabels, useLabelsActions } from '@/store'

// Business Segment Labels with Cache Hook
export const useBusinessSegmentLabelsWithCache = () => {
  const queryClient = useQueryClient()
  const { businessSegmentLabels, businessSegmentLabelsLoading, businessSegmentLabelsError } = useLabels()
  const { 
    setBusinessSegmentLabels, 
    setBusinessSegmentLabelsLoading, 
    setBusinessSegmentLabelsError 
  } = useLabelsActions()

  // Get business segment labels with cache
  const useGetBusinessSegmentLabels = (language: string = 'EN') => {
    return useQuery({
      queryKey: ['businessSegmentLabels', language],
      queryFn: () => businessSegmentLabelsService.getLabels(language),
      enabled: !businessSegmentLabels || businessSegmentLabelsLoading,
      onSuccess: (data) => {
        setBusinessSegmentLabels(data)
        setBusinessSegmentLabelsLoading(false)
        setBusinessSegmentLabelsError(null)
      },
      onError: (error: any) => {
        setBusinessSegmentLabelsError(error.message)
        setBusinessSegmentLabelsLoading(false)
      },
    })
  }

  // Get business segment label by config ID with cache
  const useGetBusinessSegmentLabelByConfigId = (configId: string, language: string = 'EN') => {
    return useQuery({
      queryKey: ['businessSegmentLabel', configId, language],
      queryFn: () => businessSegmentLabelsService.getLabelByConfigId(configId, language),
      enabled: !!configId,
    })
  }

  // Create business segment label
  const useCreateBusinessSegmentLabel = () => {
    return useMutation({
      mutationFn: businessSegmentLabelsService.createLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businessSegmentLabels'] })
        setBusinessSegmentLabelsLoading(true)
      },
    })
  }

  // Update business segment label
  const useUpdateBusinessSegmentLabel = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        businessSegmentLabelsService.updateLabel(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businessSegmentLabels'] })
        setBusinessSegmentLabelsLoading(true)
      },
    })
  }

  // Delete business segment label
  const useDeleteBusinessSegmentLabel = () => {
    return useMutation({
      mutationFn: businessSegmentLabelsService.deleteLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businessSegmentLabels'] })
        setBusinessSegmentLabelsLoading(true)
      },
    })
  }

  // Get available languages for business segment labels
  const useGetBusinessSegmentLabelLanguages = () => {
    return useQuery({
      queryKey: ['businessSegmentLabelLanguages'],
      queryFn: businessSegmentLabelsService.getAvailableLanguages,
    })
  }

  return {
    useGetBusinessSegmentLabels,
    useGetBusinessSegmentLabelByConfigId,
    useCreateBusinessSegmentLabel,
    useUpdateBusinessSegmentLabel,
    useDeleteBusinessSegmentLabel,
    useGetBusinessSegmentLabelLanguages,
    // Store state
    businessSegmentLabels,
    businessSegmentLabelsLoading,
    businessSegmentLabelsError,
  }
}
