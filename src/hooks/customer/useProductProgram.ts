import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productProgramService } from '@/services/api/customerApi/productProgramService'

// Product Program Hooks
export const useProductProgram = () => {
  const queryClient = useQueryClient()

  // Get all product programs
  const useGetAllProductPrograms = () => {
    return useQuery({
      queryKey: ['productPrograms'],
      queryFn: productProgramService.getAll,
    })
  }

  // Get product program by ID
  const useGetProductProgramById = (id: string) => {
    return useQuery({
      queryKey: ['productProgram', id],
      queryFn: () => productProgramService.getById(id),
      enabled: !!id,
    })
  }

  // Create product program
  const useCreateProductProgram = () => {
    return useMutation({
      mutationFn: productProgramService.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['productPrograms'] })
      },
    })
  }

  // Update product program
  const useUpdateProductProgram = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        productProgramService.update(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['productPrograms'] })
        queryClient.invalidateQueries({ queryKey: ['productProgram', id] })
      },
    })
  }

  // Delete product program
  const useDeleteProductProgram = () => {
    return useMutation({
      mutationFn: productProgramService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['productPrograms'] })
      },
    })
  }

  // Soft delete product program
  const useSoftDeleteProductProgram = () => {
    return useMutation({
      mutationFn: productProgramService.softDelete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['productPrograms'] })
      },
    })
  }

  // Find all product programs with filters
  const useFindAllProductPrograms = (filters?: any) => {
    return useQuery({
      queryKey: ['productPrograms', 'findAll', filters],
      queryFn: () => productProgramService.findAll(filters),
    })
  }

  return {
    useGetAllProductPrograms,
    useGetProductProgramById,
    useCreateProductProgram,
    useUpdateProductProgram,
    useDeleteProductProgram,
    useSoftDeleteProductProgram,
    useFindAllProductPrograms,
  }
}
