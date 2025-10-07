import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { beneficiaryLabelsService } from '@/services/api/customerApi/beneficiaryLabelsService'
import { useLabels, useLabelsActions } from '@/store'

// Beneficiary Labels with Cache Hook
export const useBeneficiaryLabelsWithCache = () => {
  const queryClient = useQueryClient()
  const { beneficiaryLabels, beneficiaryLabelsLoading, beneficiaryLabelsError } = useLabels()
  const { 
    setBeneficiaryLabels, 
    setBeneficiaryLabelsLoading, 
    setBeneficiaryLabelsError 
  } = useLabelsActions()

  // Get beneficiary labels with cache
  const useGetBeneficiaryLabels = (language: string = 'EN') => {
    return useQuery({
      queryKey: ['beneficiaryLabels', language],
      queryFn: () => beneficiaryLabelsService.getLabels(language),
      enabled: !beneficiaryLabels || beneficiaryLabelsLoading,
      onSuccess: (data) => {
        setBeneficiaryLabels(data)
        setBeneficiaryLabelsLoading(false)
        setBeneficiaryLabelsError(null)
      },
      onError: (error: any) => {
        setBeneficiaryLabelsError(error.message)
        setBeneficiaryLabelsLoading(false)
      },
    })
  }

  // Get beneficiary label by config ID with cache
  const useGetBeneficiaryLabelByConfigId = (configId: string, language: string = 'EN') => {
    return useQuery({
      queryKey: ['beneficiaryLabel', configId, language],
      queryFn: () => beneficiaryLabelsService.getLabelByConfigId(configId, language),
      enabled: !!configId,
    })
  }

  // Create beneficiary label
  const useCreateBeneficiaryLabel = () => {
    return useMutation({
      mutationFn: beneficiaryLabelsService.createLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['beneficiaryLabels'] })
        setBeneficiaryLabelsLoading(true)
      },
    })
  }

  // Update beneficiary label
  const useUpdateBeneficiaryLabel = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        beneficiaryLabelsService.updateLabel(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['beneficiaryLabels'] })
        setBeneficiaryLabelsLoading(true)
      },
    })
  }

  // Delete beneficiary label
  const useDeleteBeneficiaryLabel = () => {
    return useMutation({
      mutationFn: beneficiaryLabelsService.deleteLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['beneficiaryLabels'] })
        setBeneficiaryLabelsLoading(true)
      },
    })
  }

  // Get available languages for beneficiary labels
  const useGetBeneficiaryLabelLanguages = () => {
    return useQuery({
      queryKey: ['beneficiaryLabelLanguages'],
      queryFn: beneficiaryLabelsService.getAvailableLanguages,
    })
  }

  return {
    useGetBeneficiaryLabels,
    useGetBeneficiaryLabelByConfigId,
    useCreateBeneficiaryLabel,
    useUpdateBeneficiaryLabel,
    useDeleteBeneficiaryLabel,
    useGetBeneficiaryLabelLanguages,
    // Store state
    beneficiaryLabels,
    beneficiaryLabelsLoading,
    beneficiaryLabelsError,
  }
}
