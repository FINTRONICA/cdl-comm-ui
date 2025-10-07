import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { currencyCodeLabelsService } from '@/services/api/customerApi/currencyCodeLabelsService'
import { useLabels, useLabelsActions } from '@/store'

// Currency Code Labels with Cache Hook
export const useCurrencyCodeLabelsWithCache = () => {
  const queryClient = useQueryClient()
  const { currencyCodeLabels, currencyCodeLabelsLoading, currencyCodeLabelsError } = useLabels()
  const { 
    setCurrencyCodeLabels, 
    setCurrencyCodeLabelsLoading, 
    setCurrencyCodeLabelsError 
  } = useLabelsActions()

  // Get currency code labels with cache
  const useGetCurrencyCodeLabels = (language: string = 'EN') => {
    return useQuery({
      queryKey: ['currencyCodeLabels', language],
      queryFn: () => currencyCodeLabelsService.getLabels(language),
      enabled: !currencyCodeLabels || currencyCodeLabelsLoading,
      onSuccess: (data) => {
        setCurrencyCodeLabels(data)
        setCurrencyCodeLabelsLoading(false)
        setCurrencyCodeLabelsError(null)
      },
      onError: (error: any) => {
        setCurrencyCodeLabelsError(error.message)
        setCurrencyCodeLabelsLoading(false)
      },
    })
  }

  // Get currency code label by config ID with cache
  const useGetCurrencyCodeLabelByConfigId = (configId: string, language: string = 'EN') => {
    return useQuery({
      queryKey: ['currencyCodeLabel', configId, language],
      queryFn: () => currencyCodeLabelsService.getLabelByConfigId(configId, language),
      enabled: !!configId,
    })
  }

  // Create currency code label
  const useCreateCurrencyCodeLabel = () => {
    return useMutation({
      mutationFn: currencyCodeLabelsService.createLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['currencyCodeLabels'] })
        setCurrencyCodeLabelsLoading(true)
      },
    })
  }

  // Update currency code label
  const useUpdateCurrencyCodeLabel = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        currencyCodeLabelsService.updateLabel(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['currencyCodeLabels'] })
        setCurrencyCodeLabelsLoading(true)
      },
    })
  }

  // Delete currency code label
  const useDeleteCurrencyCodeLabel = () => {
    return useMutation({
      mutationFn: currencyCodeLabelsService.deleteLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['currencyCodeLabels'] })
        setCurrencyCodeLabelsLoading(true)
      },
    })
  }

  // Get available languages for currency code labels
  const useGetCurrencyCodeLabelLanguages = () => {
    return useQuery({
      queryKey: ['currencyCodeLabelLanguages'],
      queryFn: currencyCodeLabelsService.getAvailableLanguages,
    })
  }

  return {
    useGetCurrencyCodeLabels,
    useGetCurrencyCodeLabelByConfigId,
    useCreateCurrencyCodeLabel,
    useUpdateCurrencyCodeLabel,
    useDeleteCurrencyCodeLabel,
    useGetCurrencyCodeLabelLanguages,
    // Store state
    currencyCodeLabels,
    currencyCodeLabelsLoading,
    currencyCodeLabelsError,
  }
}
