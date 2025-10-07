import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerMasterLabelsService } from '@/services/api/customerApi/customerMasterLabelsService'
import { useLabels, useLabelsActions } from '@/store'

// Customer Master Labels with Cache Hook
export const useCustomerMasterLabelsWithCache = () => {
  const queryClient = useQueryClient()
  const { customerMasterLabels, customerMasterLabelsLoading, customerMasterLabelsError } = useLabels()
  const { 
    setCustomerMasterLabels, 
    setCustomerMasterLabelsLoading, 
    setCustomerMasterLabelsError 
  } = useLabelsActions()

  // Get customer master labels with cache
  const useGetCustomerMasterLabels = (language: string = 'EN') => {
    return useQuery({
      queryKey: ['customerMasterLabels', language],
      queryFn: () => customerMasterLabelsService.getLabels(language),
      enabled: !customerMasterLabels || customerMasterLabelsLoading,
      onSuccess: (data) => {
        setCustomerMasterLabels(data)
        setCustomerMasterLabelsLoading(false)
        setCustomerMasterLabelsError(null)
      },
      onError: (error: any) => {
        setCustomerMasterLabelsError(error.message)
        setCustomerMasterLabelsLoading(false)
      },
    })
  }

  // Get customer master label by config ID with cache
  const useGetCustomerMasterLabelByConfigId = (configId: string, language: string = 'EN') => {
    return useQuery({
      queryKey: ['customerMasterLabel', configId, language],
      queryFn: () => customerMasterLabelsService.getLabelByConfigId(configId, language),
      enabled: !!configId,
    })
  }

  // Create customer master label
  const useCreateCustomerMasterLabel = () => {
    return useMutation({
      mutationFn: customerMasterLabelsService.createLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['customerMasterLabels'] })
        setCustomerMasterLabelsLoading(true)
      },
    })
  }

  // Update customer master label
  const useUpdateCustomerMasterLabel = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        customerMasterLabelsService.updateLabel(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['customerMasterLabels'] })
        setCustomerMasterLabelsLoading(true)
      },
    })
  }

  // Delete customer master label
  const useDeleteCustomerMasterLabel = () => {
    return useMutation({
      mutationFn: customerMasterLabelsService.deleteLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['customerMasterLabels'] })
        setCustomerMasterLabelsLoading(true)
      },
    })
  }

  // Get available languages for customer master labels
  const useGetCustomerMasterLabelLanguages = () => {
    return useQuery({
      queryKey: ['customerMasterLabelLanguages'],
      queryFn: customerMasterLabelsService.getAvailableLanguages,
    })
  }

  return {
    useGetCustomerMasterLabels,
    useGetCustomerMasterLabelByConfigId,
    useCreateCustomerMasterLabel,
    useUpdateCustomerMasterLabel,
    useDeleteCustomerMasterLabel,
    useGetCustomerMasterLabelLanguages,
    // Store state
    customerMasterLabels,
    customerMasterLabelsLoading,
    customerMasterLabelsError,
  }
}
