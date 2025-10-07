import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accountPurposeLabelsService } from '@/services/api/customerApi/accountPurposeLabelsService'
import { useLabels, useLabelsActions } from '@/store'

// Account Purpose Labels with Cache Hook
export const useAccountPurposeLabelsWithCache = () => {
  const queryClient = useQueryClient()
  const { accountPurposeLabels, accountPurposeLabelsLoading, accountPurposeLabelsError } = useLabels()
  const { 
    setAccountPurposeLabels, 
    setAccountPurposeLabelsLoading, 
    setAccountPurposeLabelsError 
  } = useLabelsActions()

  // Get account purpose labels with cache
  const useGetAccountPurposeLabels = (language: string = 'EN') => {
    return useQuery({
      queryKey: ['accountPurposeLabels', language],
      queryFn: () => accountPurposeLabelsService.getLabels(language),
      enabled: !accountPurposeLabels || accountPurposeLabelsLoading,
      onSuccess: (data) => {
        setAccountPurposeLabels(data)
        setAccountPurposeLabelsLoading(false)
        setAccountPurposeLabelsError(null)
      },
      onError: (error: any) => {
        setAccountPurposeLabelsError(error.message)
        setAccountPurposeLabelsLoading(false)
      },
    })
  }

  // Get account purpose label by config ID with cache
  const useGetAccountPurposeLabelByConfigId = (configId: string, language: string = 'EN') => {
    return useQuery({
      queryKey: ['accountPurposeLabel', configId, language],
      queryFn: () => accountPurposeLabelsService.getLabelByConfigId(configId, language),
      enabled: !!configId,
    })
  }

  // Create account purpose label
  const useCreateAccountPurposeLabel = () => {
    return useMutation({
      mutationFn: accountPurposeLabelsService.createLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accountPurposeLabels'] })
        setAccountPurposeLabelsLoading(true)
      },
    })
  }

  // Update account purpose label
  const useUpdateAccountPurposeLabel = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        accountPurposeLabelsService.updateLabel(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accountPurposeLabels'] })
        setAccountPurposeLabelsLoading(true)
      },
    })
  }

  // Delete account purpose label
  const useDeleteAccountPurposeLabel = () => {
    return useMutation({
      mutationFn: accountPurposeLabelsService.deleteLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accountPurposeLabels'] })
        setAccountPurposeLabelsLoading(true)
      },
    })
  }

  // Get available languages for account purpose labels
  const useGetAccountPurposeLabelLanguages = () => {
    return useQuery({
      queryKey: ['accountPurposeLabelLanguages'],
      queryFn: accountPurposeLabelsService.getAvailableLanguages,
    })
  }

  return {
    useGetAccountPurposeLabels,
    useGetAccountPurposeLabelByConfigId,
    useCreateAccountPurposeLabel,
    useUpdateAccountPurposeLabel,
    useDeleteAccountPurposeLabel,
    useGetAccountPurposeLabelLanguages,
    // Store state
    accountPurposeLabels,
    accountPurposeLabelsLoading,
    accountPurposeLabelsError,
  }
}
