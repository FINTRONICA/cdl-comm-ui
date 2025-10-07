import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ledgerAccountLabelsService } from '@/services/api/customerApi/ledgerAccountLabelsService'
import { useLabels, useLabelsActions } from '@/store'

// Ledger Account Labels with Cache Hook
export const useLedgerAccountLabelsWithCache = () => {
  const queryClient = useQueryClient()
  const { ledgerAccountLabels, ledgerAccountLabelsLoading, ledgerAccountLabelsError } = useLabels()
  const { 
    setLedgerAccountLabels, 
    setLedgerAccountLabelsLoading, 
    setLedgerAccountLabelsError 
  } = useLabelsActions()

  // Get ledger account labels with cache
  const useGetLedgerAccountLabels = (language: string = 'EN') => {
    return useQuery({
      queryKey: ['ledgerAccountLabels', language],
      queryFn: () => ledgerAccountLabelsService.getLabels(language),
      enabled: !ledgerAccountLabels || ledgerAccountLabelsLoading,
      onSuccess: (data) => {
        setLedgerAccountLabels(data)
        setLedgerAccountLabelsLoading(false)
        setLedgerAccountLabelsError(null)
      },
      onError: (error: any) => {
        setLedgerAccountLabelsError(error.message)
        setLedgerAccountLabelsLoading(false)
      },
    })
  }

  // Get ledger account label by config ID with cache
  const useGetLedgerAccountLabelByConfigId = (configId: string, language: string = 'EN') => {
    return useQuery({
      queryKey: ['ledgerAccountLabel', configId, language],
      queryFn: () => ledgerAccountLabelsService.getLabelByConfigId(configId, language),
      enabled: !!configId,
    })
  }

  // Create ledger account label
  const useCreateLedgerAccountLabel = () => {
    return useMutation({
      mutationFn: ledgerAccountLabelsService.createLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ledgerAccountLabels'] })
        setLedgerAccountLabelsLoading(true)
      },
    })
  }

  // Update ledger account label
  const useUpdateLedgerAccountLabel = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        ledgerAccountLabelsService.updateLabel(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ledgerAccountLabels'] })
        setLedgerAccountLabelsLoading(true)
      },
    })
  }

  // Delete ledger account label
  const useDeleteLedgerAccountLabel = () => {
    return useMutation({
      mutationFn: ledgerAccountLabelsService.deleteLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ledgerAccountLabels'] })
        setLedgerAccountLabelsLoading(true)
      },
    })
  }

  // Get available languages for ledger account labels
  const useGetLedgerAccountLabelLanguages = () => {
    return useQuery({
      queryKey: ['ledgerAccountLabelLanguages'],
      queryFn: ledgerAccountLabelsService.getAvailableLanguages,
    })
  }

  return {
    useGetLedgerAccountLabels,
    useGetLedgerAccountLabelByConfigId,
    useCreateLedgerAccountLabel,
    useUpdateLedgerAccountLabel,
    useDeleteLedgerAccountLabel,
    useGetLedgerAccountLabelLanguages,
    // Store state
    ledgerAccountLabels,
    ledgerAccountLabelsLoading,
    ledgerAccountLabelsError,
  }
}
