import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productProgramLabelsService } from '@/services/api/customerApi/productProgramLabelsService'
import { useLabels, useLabelsActions } from '@/store'

// Product Program Labels with Cache Hook
export const useProductProgramLabelsWithCache = () => {
  const queryClient = useQueryClient()
  const { productProgramLabels, productProgramLabelsLoading, productProgramLabelsError } = useLabels()
  const { 
    setProductProgramLabels, 
    setProductProgramLabelsLoading, 
    setProductProgramLabelsError 
  } = useLabelsActions()

  // Get product program labels with cache
  const useGetProductProgramLabels = (language: string = 'EN') => {
    return useQuery({
      queryKey: ['productProgramLabels', language],
      queryFn: () => productProgramLabelsService.getLabels(language),
      enabled: !productProgramLabels || productProgramLabelsLoading,
      onSuccess: (data) => {
        setProductProgramLabels(data)
        setProductProgramLabelsLoading(false)
        setProductProgramLabelsError(null)
      },
      onError: (error: any) => {
        setProductProgramLabelsError(error.message)
        setProductProgramLabelsLoading(false)
      },
    })
  }

  // Get product program label by config ID with cache
  const useGetProductProgramLabelByConfigId = (configId: string, language: string = 'EN') => {
    return useQuery({
      queryKey: ['productProgramLabel', configId, language],
      queryFn: () => productProgramLabelsService.getLabelByConfigId(configId, language),
      enabled: !!configId,
    })
  }

  // Create product program label
  const useCreateProductProgramLabel = () => {
    return useMutation({
      mutationFn: productProgramLabelsService.createLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['productProgramLabels'] })
        setProductProgramLabelsLoading(true)
      },
    })
  }

  // Update product program label
  const useUpdateProductProgramLabel = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        productProgramLabelsService.updateLabel(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['productProgramLabels'] })
        setProductProgramLabelsLoading(true)
      },
    })
  }

  // Delete product program label
  const useDeleteProductProgramLabel = () => {
    return useMutation({
      mutationFn: productProgramLabelsService.deleteLabel,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['productProgramLabels'] })
        setProductProgramLabelsLoading(true)
      },
    })
  }

  // Get available languages for product program labels
  const useGetProductProgramLabelLanguages = () => {
    return useQuery({
      queryKey: ['productProgramLabelLanguages'],
      queryFn: productProgramLabelsService.getAvailableLanguages,
    })
  }

  return {
    useGetProductProgramLabels,
    useGetProductProgramLabelByConfigId,
    useCreateProductProgramLabel,
    useUpdateProductProgramLabel,
    useDeleteProductProgramLabel,
    useGetProductProgramLabelLanguages,
    // Store state
    productProgramLabels,
    productProgramLabelsLoading,
    productProgramLabelsError,
  }
}
