import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentLabelsService } from '@/services/api/customerApi/documentLabelsService'
import { useLabels, useLabelsActions } from '@/store'

// Document Labels with Cache Hook
export const useDocumentLabelsWithCache = () => {
  const queryClient = useQueryClient()
  const { documentLabels, documentLabelsLoading, documentLabelsError } = useLabels()
  const { 
    setDocumentLabels, 
    setDocumentLabelsLoading, 
    setDocumentLabelsError 
  } = useLabelsActions()

  // Get document labels with cache
  const useGetDocumentLabels = (language: string = 'EN') => {
    return useQuery({
      queryKey: ['documentLabels', language],
      queryFn: () => documentLabelsService.getLabels(language),
      enabled: !documentLabels || documentLabelsLoading,
      onSuccess: (data) => {
        setDocumentLabels(data)
        setDocumentLabelsLoading(false)
        setDocumentLabelsError(null)
      },
      onError: (error: any) => {
        setDocumentLabelsError(error.message)
        setDocumentLabelsLoading(false)
      },
    })
  }

  // Get document label by config ID with cache
  const useGetDocumentLabelByConfigId = (configId: string, language: string = 'EN') => {
    return useQuery({
      queryKey: ['documentLabel', configId, language],
      queryFn: () => documentLabelsService.getLabelByConfigId(configId, language),
      enabled: !!configId,
    })
  }

  // Create document label
  const useCreateDocumentLabel = () => {
    return useMutation({
      mutationFn: documentLabelsService.createLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['documentLabels'] })
        setDocumentLabelsLoading(true)
      },
    })
  }

  // Update document label
  const useUpdateDocumentLabel = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        documentLabelsService.updateLabel(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['documentLabels'] })
        setDocumentLabelsLoading(true)
      },
    })
  }

  // Delete document label
  const useDeleteDocumentLabel = () => {
    return useMutation({
      mutationFn: documentLabelsService.deleteLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['documentLabels'] })
        setDocumentLabelsLoading(true)
      },
    })
  }

  // Get available languages for document labels
  const useGetDocumentLabelLanguages = () => {
    return useQuery({
      queryKey: ['documentLabelLanguages'],
      queryFn: documentLabelsService.getAvailableLanguages,
    })
  }

  return {
    useGetDocumentLabels,
    useGetDocumentLabelByConfigId,
    useCreateDocumentLabel,
    useUpdateDocumentLabel,
    useDeleteDocumentLabel,
    useGetDocumentLabelLanguages,
    // Store state
    documentLabels,
    documentLabelsLoading,
    documentLabelsError,
  }
}
