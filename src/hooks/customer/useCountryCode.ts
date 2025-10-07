import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { countryCodeService } from '@/services/api/customerApi/countryCodeService'

// Country Code Hooks
export const useCountryCode = () => {
  const queryClient = useQueryClient()

  // Get all country codes
  const useGetAllCountryCodes = () => {
    return useQuery({
      queryKey: ['countryCodes'],
      queryFn: countryCodeService.getAll,
    })
  }

  // Get country code by ID
  const useGetCountryCodeById = (id: string) => {
    return useQuery({
      queryKey: ['countryCode', id],
      queryFn: () => countryCodeService.getById(id),
      enabled: !!id,
    })
  }

  // Create country code
  const useCreateCountryCode = () => {
    return useMutation({
      mutationFn: countryCodeService.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['countryCodes'] })
      },
    })
  }

  // Update country code
  const useUpdateCountryCode = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        countryCodeService.update(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['countryCodes'] })
        queryClient.invalidateQueries({ queryKey: ['countryCode', id] })
      },
    })
  }

  // Delete country code
  const useDeleteCountryCode = () => {
    return useMutation({
      mutationFn: countryCodeService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['countryCodes'] })
      },
    })
  }

  // Soft delete country code
  const useSoftDeleteCountryCode = () => {
    return useMutation({
      mutationFn: countryCodeService.softDelete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['countryCodes'] })
      },
    })
  }

  // Find all country codes with filters
  const useFindAllCountryCodes = (filters?: any) => {
    return useQuery({
      queryKey: ['countryCodes', 'findAll', filters],
      queryFn: () => countryCodeService.findAll(filters),
    })
  }

  return {
    useGetAllCountryCodes,
    useGetCountryCodeById,
    useCreateCountryCode,
    useUpdateCountryCode,
    useDeleteCountryCode,
    useSoftDeleteCountryCode,
    useFindAllCountryCodes,
  }
}
