import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { investmentMasterLabelsService } from '@/services/api/customerApi/investmentMasterLabelsService'
import { useLabels, useLabelsActions } from '@/store'

// Investment Master Labels with Cache Hook
export const useInvestmentMasterLabelsWithCache = () => {
  const queryClient = useQueryClient()
  const { investmentMasterLabels, investmentMasterLabelsLoading, investmentMasterLabelsError } = useLabels()
  const { 
    setInvestmentMasterLabels, 
    setInvestmentMasterLabelsLoading, 
    setInvestmentMasterLabelsError 
  } = useLabelsActions()

  // Get investment master labels with cache
  const useGetInvestmentMasterLabels = (language: string = 'EN') => {
    return useQuery({
      queryKey: ['investmentMasterLabels', language],
      queryFn: () => investmentMasterLabelsService.getLabels(language),
      enabled: !investmentMasterLabels || investmentMasterLabelsLoading,
      onSuccess: (data) => {
        setInvestmentMasterLabels(data)
        setInvestmentMasterLabelsLoading(false)
        setInvestmentMasterLabelsError(null)
      },
      onError: (error: any) => {
        setInvestmentMasterLabelsError(error.message)
        setInvestmentMasterLabelsLoading(false)
      },
    })
  }

  // Get investment master label by config ID with cache
  const useGetInvestmentMasterLabelByConfigId = (configId: string, language: string = 'EN') => {
    return useQuery({
      queryKey: ['investmentMasterLabel', configId, language],
      queryFn: () => investmentMasterLabelsService.getLabelByConfigId(configId, language),
      enabled: !!configId,
    })
  }

  // Create investment master label
  const useCreateInvestmentMasterLabel = () => {
    return useMutation({
      mutationFn: investmentMasterLabelsService.createLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['investmentMasterLabels'] })
        setInvestmentMasterLabelsLoading(true)
      },
    })
  }

  // Update investment master label
  const useUpdateInvestmentMasterLabel = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        investmentMasterLabelsService.updateLabel(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['investmentMasterLabels'] })
        setInvestmentMasterLabelsLoading(true)
      },
    })
  }

  // Delete investment master label
  const useDeleteInvestmentMasterLabel = () => {
    return useMutation({
      mutationFn: investmentMasterLabelsService.deleteLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['investmentMasterLabels'] })
        setInvestmentMasterLabelsLoading(true)
      },
    })
  }

  // Get available languages for investment master labels
  const useGetInvestmentMasterLabelLanguages = () => {
    return useQuery({
      queryKey: ['investmentMasterLabelLanguages'],
      queryFn: investmentMasterLabelsService.getAvailableLanguages,
    })
  }

  return {
    useGetInvestmentMasterLabels,
    useGetInvestmentMasterLabelByConfigId,
    useCreateInvestmentMasterLabel,
    useUpdateInvestmentMasterLabel,
    useDeleteInvestmentMasterLabel,
    useGetInvestmentMasterLabelLanguages,
    // Store state
    investmentMasterLabels,
    investmentMasterLabelsLoading,
    investmentMasterLabelsError,
  }
}
