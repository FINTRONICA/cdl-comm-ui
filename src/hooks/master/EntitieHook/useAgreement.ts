import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, useEffect } from "react";
import type { Agreement } from "@/services/api/masterApi/Entitie/agreementService";
import {
  agreementService,
  type AgreementFilters,
  type CreateAgreementRequest,
  type UpdateAgreementRequest,
  type AgreementDetailsData,
  type AgreementReviewData,
  type StepValidationResponse,
} from "@/services/api/masterApi/Entitie/agreementService";
import { AgreementLabelsService } from "@/services/api/masterApi/Entitie/agreementLabelsService";
import { useIsAuthenticated } from "@/hooks";

export const AGREEMENTS_QUERY_KEY = "agreements";

export function useAgreements(page = 0, size = 20, filters?: AgreementFilters) {
  const [pagination, setPagination] = useState({ page, size });
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  });

  const query = useQuery({
    queryKey: [
      AGREEMENTS_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      agreementService.getAgreements(pagination.page, pagination.size, filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      // Disable retry on 500 errors to prevent retry storms
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return false
        }
      }
      // Limit retries for other errors
      return failureCount < 1
    },
  });

  useEffect(() => {
    if (query.data?.page) {
      const newApiPagination = {
        totalElements: query.data.page.totalElements,
        totalPages: query.data.page.totalPages,
      };
      setApiPagination((prev) => {
        if (
          prev.totalElements !== newApiPagination.totalElements ||
          prev.totalPages !== newApiPagination.totalPages
        ) {
          return newApiPagination;
        }
        return prev;
      });
    }
  }, [query.data?.page]);

  const updatePagination = useCallback((newPage: number, newSize?: number) => {
    setPagination((prev) => ({
      page: newPage,
      size: newSize !== undefined ? newSize : prev.size,
    }));
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

export function useAgreement(id: string) {
  return useQuery({
    queryKey: [AGREEMENTS_QUERY_KEY, id],
    queryFn: () => agreementService.getAgreement(id),
    enabled: !!id && id.trim() !== "",
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Disable retry on 500 errors to prevent retry storms
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return false
        }
      }
      // Limit retries for other errors
      return failureCount < 1
    },
  });
}

export function useCreateAgreement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAgreementRequest) =>
      agreementService.createAgreement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENTS_QUERY_KEY] });
    },
    retry: (failureCount, error) => {
      // Disable retry on 500 errors to prevent retry storms
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return false
        }
      }
      // Limit retries for other errors
      return failureCount < 1
    },
  });
}

export function useUpdateAgreement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateAgreementRequest;
    }) => agreementService.updateAgreement(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [AGREEMENTS_QUERY_KEY, id],
      });
    },
    retry: (failureCount, error) => {
      // Disable retry on 500 errors to prevent retry storms
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return false
        }
      }
      // Limit retries for other errors
      return failureCount < 1
    },
  });
}

export function useDeleteAgreement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => agreementService.deleteAgreement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENTS_QUERY_KEY] });
    },
    retry: 0,
  });
}

export function useAgreementLabels() {
  const { isAuthenticated } = useIsAuthenticated();
  return useQuery({
    queryKey: ["agreementLabels"],
    queryFn: async () => {
      const rawLabels = await agreementService.getAgreementLabels();
      return rawLabels.reduce(
        (
          processed: Record<string, Record<string, string>>,
          {
            key,
            value,
            language,
          }: { key: string; value: string; language: string }
        ) => {
          if (!processed[key]) {
            processed[key] = {};
          }
          processed[key][language] = value;
          return processed;
        },
        {} as Record<string, Record<string, string>>
      );
    },
    enabled: !!isAuthenticated,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000, // 24 hours cache time
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Disable retry on 500 errors to prevent retry storms
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return false
        }
      }
      // Limit retries for other errors
      return failureCount < 1
    },
  });
}

export function useRefreshAgreements() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: [AGREEMENTS_QUERY_KEY] });
  };
}

export function useAgreementLabelsWithUtils() {
  const query = useAgreementLabels();

  return {
    ...query,

    hasLabels: () => AgreementLabelsService.hasLabels(query.data || {}),
    getLabel: (configId: string, language: string, fallback: string) =>
      AgreementLabelsService.getLabel(
        query.data || {},
        configId,
        language,
        fallback
      ),
    getAvailableLanguages: () =>
      AgreementLabelsService.getAvailableLanguages(query.data || {}),
  };
}

export function useSaveAgreementDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      isEditing = false,
      developerId,
    }: {
      data: AgreementDetailsData;
      isEditing?: boolean;
      developerId?: string | undefined;
    }) => agreementService.saveAgreementDetails(data, isEditing, developerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENTS_QUERY_KEY] });
      if (variables.developerId) {
        queryClient.invalidateQueries({
          queryKey: [AGREEMENTS_QUERY_KEY, variables.developerId],
        });
        queryClient.invalidateQueries({
          queryKey: [AGREEMENTS_QUERY_KEY, "stepStatus", variables.developerId],
        });
      }
    },
    retry: (failureCount, error) => {
      // Disable retry on 500 errors to prevent retry storms
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return false
        }
      }
      // Limit retries for other errors
      return failureCount < 1
    },
  });
}

export function useSaveAgreementReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AgreementReviewData) =>
      agreementService.saveAgreementReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGREEMENTS_QUERY_KEY] });
    },
    retry: (failureCount, error) => {
      // Disable retry on 500 errors to prevent retry storms
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return false
        }
      }
      // Limit retries for other errors
      return failureCount < 1
    },
  });
}

export function useAgreementStepData(step: number) {
  return useQuery({
    queryKey: [AGREEMENTS_QUERY_KEY, "step", step],
    queryFn: () => agreementService.getStepData(step),
    enabled: step > 0 && step <= 5,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Disable retry on 500 errors to prevent retry storms
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return false
        }
      }
      // Limit retries for other errors
      return failureCount < 1
    },
  });
}

export function useValidateAgreementStep() {
  return useMutation({
    mutationFn: ({
      step,
      data,
    }: {
      step: number;
      data: unknown;
    }): Promise<StepValidationResponse> =>
      agreementService.validateStep(step, data),
    retry: 0,
  });
}

export function useAgreementStepStatus(agreementId: string) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: [AGREEMENTS_QUERY_KEY, "stepStatus", agreementId],
    queryFn: async () => {
      if (!agreementId || agreementId.trim() === "") {
        return {
          step1: false,
          lastCompletedStep: 0,
          stepData: {
            step1: null,
          },
          errors: {
            step1: null,
          },
        };
      }

      // CRITICAL FIX: Use existing query cache instead of making new API call
      // This prevents duplicate API calls when useAgreement is also called
      const existingData = queryClient.getQueryData<Agreement>([AGREEMENTS_QUERY_KEY, agreementId]);
      
      let agreementData: Agreement | null = null;
      let step1Error: unknown = null;
      
      if (existingData) {
        // Use cached data - no API call needed
        agreementData = existingData;
      } else {
        // Only fetch if not in cache
        const [step1Result] = await Promise.allSettled([
          agreementService.getAgreement(agreementId),
        ]);

        if (step1Result.status === "fulfilled") {
          agreementData = step1Result.value;
          // Cache the result for useAgreement to use
          queryClient.setQueryData([AGREEMENTS_QUERY_KEY, agreementId], agreementData);
        } else {
          // Store error for proper error handling
          step1Error = step1Result.reason;
        }
      }

      const stepStatus = {
        step1: agreementData !== null,
        lastCompletedStep: 0,
        stepData: {
          step1: agreementData,
        },
        errors: {
          step1: step1Error,
        },
      };

      if (stepStatus.step1) stepStatus.lastCompletedStep = 1;

      return stepStatus;
    },
    enabled: !!agreementId && agreementId.trim() !== "",
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Disable retry on 500 errors to prevent retry storms
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return false
        }
      }
      // Limit retries for other errors
      return failureCount < 1
    },
  });
}

export function useAgreementStepManager() {
  const saveDetails = useSaveAgreementDetails();

  const saveReview = useSaveAgreementReview();
  const validateStep = useValidateAgreementStep();

  const saveStep = useCallback(
    async (
      step: number,
      data: unknown,
      isEditing = false,
      agreementId?: string
    ) => {
      switch (step) {
        case 1:
          return await saveDetails.mutateAsync({
            data: data as AgreementDetailsData,
            isEditing,
            developerId: agreementId || undefined,
          });
        case 3:
          return await saveReview.mutateAsync(data as AgreementReviewData);
        default:
          throw new Error(`Invalid step: ${step}`);
      }
    },
    [saveDetails, saveReview]
  );

  return {
    saveStep,
    validateStep,
    isLoading: saveDetails.isPending || saveReview.isPending,
    error: saveDetails.error || saveReview.error,
  };
}

export function useCustomerDetailsByCif(cif: string, options?: { skipMinimumLength?: boolean }) {
  // CRITICAL FIX: Only enable query when CIF is complete (not on every keystroke)
  // Minimum length check prevents API calls on partial input
  // But allow override for edit mode where CIF might be short but valid
  const isValidCif = !!cif && cif.trim() !== "" && (options?.skipMinimumLength || cif.trim().length >= 3);
  
  return useQuery({
    queryKey: [AGREEMENTS_QUERY_KEY, "customerDetails", cif],
    queryFn: () => agreementService.getCustomerDetailsByCif(cif),
    enabled: isValidCif, // Only fetch when CIF is valid
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Disable retry on 500 errors to prevent retry storms
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return false
        }
        // Also don't retry on 404 (customer not found) - this is expected
        if (httpError.response?.status === 404) {
          return false
        }
      }
      // Limit retries for other errors
      return failureCount < 1
    },
  });
}

export function useAgreementDocuments(
  agreementId: string,
  module: string = "AGREEMENT",
  page: number = 0,
  size: number = 20
) {
  return useQuery({
    queryKey: [
      AGREEMENTS_QUERY_KEY,
      "documents",
      agreementId,
      module,
      page,
      size,
    ],
    queryFn: () =>
      agreementService.getAgreementDocuments(agreementId, module, page, size),
    enabled: !!agreementId && agreementId.trim() !== "",
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Disable retry on 500 errors to prevent retry storms
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return false
        }
      }
      // Limit retries for other errors
      return failureCount < 1
    },
  });
}
