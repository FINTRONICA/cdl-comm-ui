"use client";

import dynamic from "next/dynamic";
import React from "react";
import { useCallback, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { PermissionAwareDataTable } from "@/components/organisms/PermissionAwareDataTable";
import { useTableState } from "@/hooks/useTableState";
import { PageActionButtons } from "@/components/molecules/PageActionButtons";
import LeftSlidePanel from "@/components/organisms/LeftSlidePanel/LeftSlidePanel";
import { usePaymentBeneficiaryLabelsWithCache } from "@/hooks/master/PaymentHook";
import { getPaymentBeneficiaryLabel } from "@/constants/mappings/master/paymentMapping";
import { useAppStore } from "@/store";
import { GlobalLoading } from "@/components/atoms";
import {
  usePaymentBeneficiaries,
  useDeletePaymentBeneficiary,
  PAYMENT_BENEFICIARIES_QUERY_KEY,
} from "@/hooks/master/PaymentHook";
import {
  mapPaymentBeneficiaryToUIData,
  type PaymentBeneficiaryUIData,
  type PaymentBeneficiary,
} from "@/services/api/masterApi/Payment/paymentBeneficiaryService";
import type { PaymentBeneficiaryFilters } from "@/services/api/masterApi/Payment/paymentBeneficiaryService";
import { useSidebarConfig } from "@/hooks/useSidebarConfig";
import { useDeleteConfirmation } from "@/store/confirmationDialogStore";
import { useRouter } from "next/navigation";

interface PaymentBeneficiaryData
  extends PaymentBeneficiaryUIData,
    Record<string, unknown> {}

const statusOptions = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "IN_PROGRESS",
  "DRAFT",
  "INITIATED",
];

const ErrorMessage: React.FC<{ error: Error; onRetry?: () => void }> = ({
  error,
  onRetry,
}) => (
  <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-2xl px-4">
    <div className="w-full max-w-md text-center">
      <div className="mb-8">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full">
          <svg
            className="w-12 h-12 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="mb-4 text-2xl font-semibold text-gray-900">
          Failed to load payment beneficiaries
        </h1>
        <p className="mb-4 text-gray-600">
          {error.message ||
            "An error occurred while loading the data. Please try again."}
        </p>
        {process.env.NODE_ENV === "development" && (
          <details className="text-left">
            <summary className="text-sm font-medium text-gray-600 cursor-pointer">
              Error Details (Development)
            </summary>
            <pre className="p-4 mt-2 overflow-auto text-xs text-gray-500 bg-gray-100 rounded">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="w-full px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

const LoadingSpinner: React.FC = () => <GlobalLoading fullHeight />;

const PaymentBeneficiaryPageImpl: React.FC = () => {
  const router = useRouter();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  const currentLanguage = useAppStore((state) => state.language);
  const queryClient = useQueryClient();

  const isDownloading = false;
  const downloadError = null;
  const clearError = () => {};

  const { data: paymentBeneficiaryLabels, getLabel } =
    usePaymentBeneficiaryLabelsWithCache();

  const [currentApiPage, setCurrentApiPage] = useState(1);
  const [currentApiSize, setCurrentApiSize] = useState(20);
  const [filters] = useState<PaymentBeneficiaryFilters>({});

  const { getLabelResolver } = useSidebarConfig();

  const paymentBeneficiaryPageTitle = getLabelResolver
    ? getLabelResolver("payment-beneficiary", "Payment Beneficiary")
    : "Payment Beneficiary";

  const {
    data: apiResponse,
    isLoading: paymentBeneficiariesLoading,
    isFetching: paymentBeneficiariesFetching,
    error: paymentBeneficiariesError,
    refetch: refetchPaymentBeneficiaries,
    updatePagination,
    apiPagination,
  } = usePaymentBeneficiaries(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    filters,
  );

  const deleteMutation = useDeletePaymentBeneficiary();
  const confirmDelete = useDeleteConfirmation();

  const paymentBeneficiariesData = useMemo(() => {
    if (apiResponse?.content) {
      return apiResponse.content.map((item) =>
        mapPaymentBeneficiaryToUIData(item as PaymentBeneficiary),
      ) as PaymentBeneficiaryData[];
    }
    return [];
  }, [apiResponse]);

  const getPaymentBeneficiaryLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getPaymentBeneficiaryLabel(configId);

      if (paymentBeneficiaryLabels) {
        return getLabel(configId, currentLanguage || "EN", fallback);
      }
      return fallback;
    },
    [paymentBeneficiaryLabels, currentLanguage, getLabel],
  );

  const tableColumns = [
    {
      key: "beneficiaryAccountNumber",
      label: getPaymentBeneficiaryLabelDynamic(
        "CDL_PAYMENT_BENEFICIARY_ACCOUNT_NUMBER",
      ),
      type: "text" as const,
      width: "w-48",
      sortable: true,
      copyable: true,
    },
    {
      key: "beneficiaryBankIfscCode",
      label: getPaymentBeneficiaryLabelDynamic(
        "CDL_PAYMENT_BENEFICIARY_IFSC_CODE",
      ),
      type: "text" as const,
      width: "w-40",
      sortable: true,
      copyable: true,
    },
    {
      key: "creditAmount",
      label: getPaymentBeneficiaryLabelDynamic("CDL_PAYMENT_CREDIT_AMOUNT"),
      type: "text" as const,
      width: "w-32",
      sortable: true,
      copyable: true,
    },

    {
      key: "status",
      label: getPaymentBeneficiaryLabelDynamic("CDL_COMMON_STATUS"),
      type: "status" as const,
      width: "w-32",
      sortable: true,
    },
    {
      key: "actions",
      label: getPaymentBeneficiaryLabelDynamic("CDL_COMMON_ACTION"),
      type: "actions" as const,
      width: "w-20",
    },
  ];

  const {
    search,
    paginated,
    totalRows: localTotalRows,
    totalPages: localTotalPages,
    startItem,
    endItem,
    page: localPage,
    rowsPerPage,
    selectedRows,
    expandedRows,
    sortConfig,
    handleSearchChange,
    handlePageChange: localHandlePageChange,
    handleRowsPerPageChange: localHandleRowsPerPageChange,
    handleRowSelectionChange,
    handleRowExpansionChange,
    handleSort,
  } = useTableState({
    data: paymentBeneficiariesData,
    searchFields: [
      "beneficiaryAccountNumber",
      "beneficiaryBankIfscCode",
      "creditAmount",
      "currencyCode",
      "status",
    ],
    initialRowsPerPage: currentApiSize,
  });

  const handlePageChange = (newPage: number) => {
    const hasSearch = Object.values(search).some((value) => value.trim());

    if (hasSearch) {
      localHandlePageChange(newPage);
    } else {
      setCurrentApiPage(newPage);
      updatePagination(Math.max(0, newPage - 1), currentApiSize);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setCurrentApiSize(newRowsPerPage);
    setCurrentApiPage(1);
    updatePagination(0, newRowsPerPage);
    localHandleRowsPerPageChange(newRowsPerPage);
  };

  const apiTotal = apiPagination?.totalElements || 0;
  const apiTotalPages = apiPagination?.totalPages || 1;

  const hasActiveSearch = Object.values(search).some((value) => value.trim());

  const effectiveTotalRows = hasActiveSearch ? localTotalRows : apiTotal;
  const effectiveTotalPages = hasActiveSearch ? localTotalPages : apiTotalPages;
  const effectivePage = hasActiveSearch ? localPage : currentApiPage;

  const effectiveStartItem = hasActiveSearch
    ? startItem
    : (currentApiPage - 1) * currentApiSize + 1;
  const effectiveEndItem = hasActiveSearch
    ? endItem
    : Math.min(currentApiPage * currentApiSize, apiTotal);

  const actionButtons: Array<{
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: "primary" | "secondary";
    icon?: string;
    iconAlt?: string;
  }> = [];

  const handleRowDelete = (row: PaymentBeneficiaryData) => {
    if (isDeleting) {
      return;
    }

    confirmDelete({
      itemName: `payment beneficiary: ${row.beneficiaryAccountNumber}`,
      itemId: row.id.toString(),
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          await deleteMutation.mutateAsync(row.id.toString());
          await new Promise((resolve) => setTimeout(resolve, 500));
          await queryClient.invalidateQueries({
            queryKey: [PAYMENT_BENEFICIARIES_QUERY_KEY],
          });
          updatePagination(Math.max(0, currentApiPage - 1), currentApiSize);
          setTableKey((prev) => prev + 1);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          console.error(
            `Failed to delete payment beneficiary: ${errorMessage}`,
          );

          throw error;
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handleRowView = (row: PaymentBeneficiaryData) => {
    router.push(`/payment-beneficiary/${row.id}/step/1?mode=view`);
  };

  const handleRowEdit = (row: PaymentBeneficiaryData) => {
    router.push(`/payment-beneficiary/${row.id}/step/1?editing=true`);
  };

  const handleDownloadTemplate = async () => {
    // TODO: Add STANDING_INSTRUCTION template file when available
  };

  const renderExpandedContent = () => (
    <div className="grid grid-cols-2 gap-8"></div>
  );

  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRefreshLoading = isRefreshing || paymentBeneficiariesFetching;
  const showRefreshOverlay = isRefreshLoading || paymentBeneficiariesLoading;

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    try {
      await refetchPaymentBeneficiaries();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refetchPaymentBeneficiaries]);

  return (
    <>
      {isSidePanelOpen && (
        <LeftSlidePanel
          isOpen={isSidePanelOpen}
          onClose={() => setIsSidePanelOpen(false)}
        />
      )}

      {downloadError && (
        <div className="fixed z-50 px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded shadow-lg top-4 right-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Download Error: {downloadError}
            </span>
            <button
              onClick={clearError}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <DashboardLayout title={paymentBeneficiaryPageTitle}>
        <div className="relative flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
          {showRefreshOverlay && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-2 rounded-md bg-white/90 dark:bg-gray-900/90 px-4 py-2 shadow">
                <span className="w-5 h-5 border-2 border-gray-300 rounded-full animate-spin border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Loading...
                </span>
              </div>
            </div>
          )}
          {paymentBeneficiariesLoading ? (
            <LoadingSpinner />
          ) : paymentBeneficiariesError ? (
            <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
              <ErrorMessage
                error={paymentBeneficiariesError}
                onRetry={refetchPaymentBeneficiaries}
              />
            </div>
          ) : (
            <>
              <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/75 dark:bg-gray-800/80 dark:border-gray-700 rounded-t-2xl">
                <PageActionButtons
                  entityType="paymentBeneficiary"
                  customActionButtons={actionButtons}
                  onDownloadTemplate={handleDownloadTemplate}
                  isDownloading={isDownloading}
                  onRefresh={handleRefresh}
                  isRefreshing={isRefreshLoading}
                  // showButtons={{
                  //   downloadTemplate: true,
                  //   uploadDetails: true,
                  //   addNew: true,
                  // }}
                />
              </div>

              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-auto">
                  <PermissionAwareDataTable<PaymentBeneficiaryData>
                    key={`payment-beneficiary-table-${tableKey}`}
                    data={paginated}
                    columns={tableColumns}
                    searchState={search}
                    onSearchChange={handleSearchChange}
                    paginationState={{
                      page: effectivePage,
                      rowsPerPage: rowsPerPage,
                      totalRows: effectiveTotalRows,
                      totalPages: effectiveTotalPages,
                      startItem: effectiveStartItem,
                      endItem: effectiveEndItem,
                    }}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    selectedRows={selectedRows}
                    onRowSelectionChange={handleRowSelectionChange}
                    expandedRows={expandedRows}
                    onRowExpansionChange={handleRowExpansionChange}
                    renderExpandedContent={renderExpandedContent}
                    statusOptions={statusOptions}
                    onRowDelete={handleRowDelete}
                    onRowView={handleRowView}
                    onRowEdit={handleRowEdit}
                    deletePermissions={["payment_beneficiary_delete"]}
                    viewPermissions={["payment_beneficiary_view"]}
                    editPermissions={["payment_beneficiary_update"]}
                    updatePermissions={["payment_beneficiary_update"]}
                    showDeleteAction={true}
                    showViewAction={true}
                    showEditAction={true}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

const PaymentBeneficiaryPageClient = dynamic(
  () => Promise.resolve(PaymentBeneficiaryPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
        <GlobalLoading fullHeight />
      </div>
    ),
  },
);

const PaymentBeneficiaryPage: React.FC = () => {
  return <PaymentBeneficiaryPageClient />;
};

export default PaymentBeneficiaryPage;
