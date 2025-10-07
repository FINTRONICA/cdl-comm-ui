import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { currencyCodeService } from '@/services/api/customerApi/currencyCodeService'

// Currency Code Hooks
export const useCurrencyCode = () => {
  const queryClient = useQueryClient()

  // Get all currency codes
  const useGetAllCurrencyCodes = () => {
    return useQuery({
      queryKey: ['currencyCodes'],
      queryFn: currencyCodeService.getAll,
    })
  }

  // Get currency code by ID
  const useGetCurrencyCodeById = (id: string) => {
    return useQuery({
      queryKey: ['currencyCode', id],
      queryFn: () => currencyCodeService.getById(id),
      enabled: !!id,
    })
  }

  // Create currency code
  const useCreateCurrencyCode = () => {
    return useMutation({
      mutationFn: currencyCodeService.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['currencyCodes'] })
      },
    })
  }

  // Update currency code
  const useUpdateCurrencyCode = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        currencyCodeService.update(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['currencyCodes'] })
        queryClient.invalidateQueries({ queryKey: ['currencyCode', id] })
      },
    })
  }

  // Delete currency code
  const useDeleteCurrencyCode = () => {
    return useMutation({
      mutationFn: currencyCodeService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['currencyCodes'] })
      },
    })
  }

  // Soft delete currency code
  const useSoftDeleteCurrencyCode = () => {
    return useMutation({
      mutationFn: currencyCodeService.softDelete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['currencyCodes'] })
      },
    })
  }

  // Find all currency codes with filters
  const useFindAllCurrencyCodes = (filters?: any) => {
    return useQuery({
      queryKey: ['currencyCodes', 'findAll', filters],
      queryFn: () => currencyCodeService.findAll(filters),
    })
  }

  return {
    useGetAllCurrencyCodes,
    useGetCurrencyCodeById,
    useCreateCurrencyCode,
    useUpdateCurrencyCode,
    useDeleteCurrencyCode,
    useSoftDeleteCurrencyCode,
    useFindAllCurrencyCodes,
  }
}
