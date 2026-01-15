import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, useEffect } from "react";
import {
  generalLedgerAccountService,
  type GeneralLedgerAccountFilters,
  type CreateGeneralLedgerAccountRequest,
  type UpdateGeneralLedgerAccountRequest,
} from "@/services/api/masterApi/Customer/generalLedgerAccountService";

export const GENERAL_LEDGER_ACCOUNTS_QUERY_KEY = "generalLedgerAccounts";

export function useGeneralLedgerAccounts(
  page = 0,
  size = 20,
  filters?: GeneralLedgerAccountFilters
) {
  const [pagination, setPagination] = useState({ page, size });
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  });

  const query = useQuery({
    queryKey: [
      GENERAL_LEDGER_ACCOUNTS_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      generalLedgerAccountService.getGeneralLedgerAccount(
        pagination.page,
        pagination.size,
        filters
      ),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 3,
  });

  useEffect(() => {
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
  }, [query.data, apiPagination.totalElements, apiPagination.totalPages]);

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

export function useGeneralLedgerAccount(id: string | null) {
  return useQuery({
    queryKey: [GENERAL_LEDGER_ACCOUNTS_QUERY_KEY, id],
    queryFn: () => generalLedgerAccountService.getGeneralLedgerAccountById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
}

export function useDeleteGeneralLedgerAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      generalLedgerAccountService.deleteGeneralLedgerAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GENERAL_LEDGER_ACCOUNTS_QUERY_KEY],
      });
    },
    retry: 0,
  });
}

export function useSaveGeneralLedgerAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      isEditing,
      generalLedgerAccountId,
    }: {
      data:
        | CreateGeneralLedgerAccountRequest
        | UpdateGeneralLedgerAccountRequest;
      isEditing: boolean;
      generalLedgerAccountId?: string;
    }) => {
      if (isEditing && generalLedgerAccountId) {
        return generalLedgerAccountService.updateGeneralLedgerAccount(
          generalLedgerAccountId,
          data as UpdateGeneralLedgerAccountRequest
        );
      }
      return generalLedgerAccountService.createGeneralLedgerAccount(
        data as CreateGeneralLedgerAccountRequest
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GENERAL_LEDGER_ACCOUNTS_QUERY_KEY],
      });
    },
    retry: 0,
  });
}

export function useRefreshGeneralLedgerAccounts() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [GENERAL_LEDGER_ACCOUNTS_QUERY_KEY],
    });
  }, [queryClient]);
}

export function useAllGeneralLedgerAccounts() {
  return useQuery({
    queryKey: [GENERAL_LEDGER_ACCOUNTS_QUERY_KEY, "all"],
    queryFn: () => generalLedgerAccountService.getAllGeneralLedgerAccount(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
}
