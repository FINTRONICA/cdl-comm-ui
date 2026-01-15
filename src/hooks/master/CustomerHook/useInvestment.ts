import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  investmentService,
  type InvestmentFilters,
  type CreateInvestmentRequest,
  type UpdateInvestmentRequest,
} from "@/services/api/masterApi/Customer/investmentService";

export const INVESTMENTS_QUERY_KEY = "investments";

export function useInvestments(
  page = 0,
  size = 20,
  filters?: InvestmentFilters
) {
  const [pagination, setPagination] = useState({ page, size });
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  });

  const query = useQuery({
    queryKey: [
      INVESTMENTS_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      investmentService.getInvestments(
        pagination.page,
        pagination.size,
        filters
      ),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch when component mounts (e.g., tab navigation)
    retry: 3,
  });

  if (query.data?.page) {
    const newApiPagination = {
      totalElements: query.data.page.totalElements,
      totalPages: query.data.page.totalPages,
    };
    if (
      newApiPagination.totalElements !== apiPagination.totalElements ||
      newApiPagination.totalPages !== apiPagination.totalPages
    ) {
      setApiPagination(newApiPagination);
    }
  }

  const updatePagination = useCallback((newPage: number, newSize: number) => {
    setPagination({ page: newPage, size: newSize });
  }, []);

  return {
    ...query,
    updatePagination,
    apiPagination,
  } as typeof query & {
    updatePagination: typeof updatePagination;
    apiPagination: typeof apiPagination;
  };
}

export function useInvestment(id: string | null) {
  return useQuery({
    queryKey: [INVESTMENTS_QUERY_KEY, id],
    queryFn: () => investmentService.getInvestment(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
}

export function useDeleteInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => investmentService.deleteInvestment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVESTMENTS_QUERY_KEY] });
    },
    retry: 0,
  });
}

export function useSaveInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      isEditing,
      investmentId,
    }: {
      data: CreateInvestmentRequest | UpdateInvestmentRequest;
      isEditing: boolean;
      investmentId?: string;
    }) => {
      if (isEditing && investmentId) {
        return investmentService.updateInvestment(
          investmentId,
          data as UpdateInvestmentRequest
        );
      } else {
        return investmentService.createInvestment(
          data as CreateInvestmentRequest
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVESTMENTS_QUERY_KEY] });
    },
    retry: 0,
  });
}

export function useRefreshInvestments() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [INVESTMENTS_QUERY_KEY] });
  }, [queryClient]);
}
