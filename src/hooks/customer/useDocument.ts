import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentService } from '@/services/api/customerApi/documentService'

// Document Hooks
export const useDocument = () => {
  const queryClient = useQueryClient()

  // Get all documents
  const useGetAllDocuments = () => {
    return useQuery({
      queryKey: ['documents'],
      queryFn: documentService.getAll,
    })
  }

  // Get document by ID
  const useGetDocumentById = (id: string) => {
    return useQuery({
      queryKey: ['document', id],
      queryFn: () => documentService.getById(id),
      enabled: !!id,
    })
  }

  // Create document
  const useCreateDocument = () => {
    return useMutation({
      mutationFn: documentService.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['documents'] })
      },
    })
  }

  // Update document
  const useUpdateDocument = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        documentService.update(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['documents'] })
        queryClient.invalidateQueries({ queryKey: ['document', id] })
      },
    })
  }

  // Delete document
  const useDeleteDocument = () => {
    return useMutation({
      mutationFn: documentService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['documents'] })
      },
    })
  }

  // Soft delete document
  const useSoftDeleteDocument = () => {
    return useMutation({
      mutationFn: documentService.softDelete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['documents'] })
      },
    })
  }

  // Find all documents with filters
  const useFindAllDocuments = (filters?: any) => {
    return useQuery({
      queryKey: ['documents', 'findAll', filters],
      queryFn: () => documentService.findAll(filters),
    })
  }

  return {
    useGetAllDocuments,
    useGetDocumentById,
    useCreateDocument,
    useUpdateDocument,
    useDeleteDocument,
    useSoftDeleteDocument,
    useFindAllDocuments,
  }
}
