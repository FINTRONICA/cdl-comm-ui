import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { countryCodeLabelsService } from '@/services/api/customerApi/countryCodeLabelsService'
import { useLabels, useLabelsActions } from '@/store'

// Country Code Labels with Cache Hook
export const useCountryCodeLabelsWithCache = () => {
  const queryClient = useQueryClient()
  const { countryCodeLabels, countryCodeLabelsLoading, countryCodeLabelsError } = useLabels()
  const { 
    setCountryCodeLabels, 
    setCountryCodeLabelsLoading, 
    setCountryCodeLabelsError 
  } = useLabelsActions()

  // Get country code labels with cache
  const useGetCountryCodeLabels = (language: string = 'EN') => {
    return useQuery({
      queryKey: ['countryCodeLabels', language],
      queryFn: () => countryCodeLabelsService.getLabels(language),
      enabled: !countryCodeLabels || countryCodeLabelsLoading,
      onSuccess: (data) => {
        setCountryCodeLabels(data)
        setCountryCodeLabelsLoading(false)
        setCountryCodeLabelsError(null)
      },
      onError: (error: any) => {
        setCountryCodeLabelsError(error.message)
        setCountryCodeLabelsLoading(false)
      },
    })
  }

  // Get country code label by config ID with cache
  const useGetCountryCodeLabelByConfigId = (configId: string, language: string = 'EN') => {
    return useQuery({
      queryKey: ['countryCodeLabel', configId, language],
      queryFn: () => countryCodeLabelsService.getLabelByConfigId(configId, language),
      enabled: !!configId,
    })
  }

  // Create country code label
  const useCreateCountryCodeLabel = () => {
    return useMutation({
      mutationFn: countryCodeLabelsService.createLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['countryCodeLabels'] })
        setCountryCodeLabelsLoading(true)
      },
    })
  }

  // Update country code label
  const useUpdateCountryCodeLabel = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        countryCodeLabelsService.updateLabel(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['countryCodeLabels'] })
        setCountryCodeLabelsLoading(true)
      },
    })
  }

  // Delete country code label
  const useDeleteCountryCodeLabel = () => {
    return useMutation({
      mutationFn: countryCodeLabelsService.deleteLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['countryCodeLabels'] })
        setCountryCodeLabelsLoading(true)
      },
    })
  }

  // Get available languages for country code labels
  const useGetCountryCodeLabelLanguages = () => {
    return useQuery({
      queryKey: ['countryCodeLabelLanguages'],
      queryFn: countryCodeLabelsService.getAvailableLanguages,
    })
  }

  return {
    useGetCountryCodeLabels,
    useGetCountryCodeLabelByConfigId,
    useCreateCountryCodeLabel,
    useUpdateCountryCodeLabel,
    useDeleteCountryCodeLabel,
    useGetCountryCodeLabelLanguages,
    // Store state
    countryCodeLabels,
    countryCodeLabelsLoading,
    countryCodeLabelsError,
  }
}
