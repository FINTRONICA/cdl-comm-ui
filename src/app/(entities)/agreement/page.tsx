"use client";

import dynamic from "next/dynamic";
import React from "react";

const AgreementsPageClient = dynamic(
  () => Promise.resolve(AgreementsPageImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
        <GlobalLoading fullHeight />
      </div>
    ),
  }
);

import { useCallback, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { PermissionAwareDataTable } from "@/components/organisms/PermissionAwareDataTable";
import { useTableState } from "@/hooks/useTableState";
import { PageActionButtons } from "@/components/molecules/PageActionButtons";
import LeftSlidePanel from "@/components/organisms/LeftSlidePanel/LeftSlidePanel";
import { useAgreementLabelsWithCache } from "@/hooks";
import { getAgreementLabel } from "@/constants/mappings/master/Entity/agreementMapping";
import { useAppStore } from "@/store";
import { GlobalLoading } from "@/components/atoms";
import { useAgreements, useDeleteAgreement } from "@/hooks";
import {
  mapAgreementToUIData,
  type AgreementUIData,
  type Agreement,
} from "@/services/api/masterApi/Entitie/agreementService";
import type { AgreementFilters } from "@/services/api/masterApi/Entitie/agreementService";
import { useSidebarConfig } from "@/hooks/useSidebarConfig";
// import { useTemplateDownload } from '@/hooks/useRealEstateDocumentTemplate'
// import { TEMPLATE_FILES } from '@/constants' // TODO: Add when AGREEMENT template is available
import { useDeleteConfirmation } from "@/store/confirmationDialogStore";
import { useRouter } from "next/navigation";

interface AgreementData extends AgreementUIData, Record<string, unknown> {}

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
          Failed to load agreements
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

const AgreementsPageImpl: React.FC = () => {
  const router = useRouter();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentLanguage = useAppStore((state) => state.language);

  // const {
  //   downloadTemplate,
  //   isLoading: isDownloading,
  //   error: downloadError,
  //   clearError,
  // } = useTemplateDownload() // TODO: Enable when template is available
  const isDownloading = false;
  const downloadError = null;
  const clearError = () => {};

  const { data: agreementLabels, getLabel } = useAgreementLabelsWithCache();

  const [currentApiPage, setCurrentApiPage] = useState(1);
  const [currentApiSize, setCurrentApiSize] = useState(20);
  const [filters] = useState<AgreementFilters>({});

  const { getLabelResolver } = useSidebarConfig();

  const agrementPageTitle = getLabelResolver
    ? getLabelResolver("agreement", "Agreements")
    : "Agreements";

  const {
    data: apiResponse,
    isLoading: agreementsLoading,
    error: agreementsError,
    refetch: refetchAgreements,
    updatePagination,
    apiPagination,
  } = useAgreements(Math.max(0, currentApiPage - 1), currentApiSize, filters);

  const deleteMutation = useDeleteAgreement();
  const confirmDelete = useDeleteConfirmation();

  const agreementsData = useMemo(() => {
    if (apiResponse?.content) {
      return apiResponse.content.map((item) =>
        mapAgreementToUIData(item as Agreement)
      ) as AgreementData[];
    }
    return [];
  }, [apiResponse]);

  const getAgreementLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getAgreementLabel(configId);

      if (agreementLabels) {
        return getLabel(configId, currentLanguage || "EN", fallback);
      }
      return fallback;
    },
    [agreementLabels, currentLanguage, getLabel]
  );

  const tableColumns = [
    {
      key: "productManagerName",
      label: getAgreementLabelDynamic("CDL_ESCROW_PRODUCT_MANAGET_NAME"),
      type: "text" as const,
      width: "w-40",
      sortable: true,
    },
    {
      key: "id",
      label: getAgreementLabelDynamic("CDL_ESCROW_AGREEMENT_ID"),
      type: "text" as const,
      width: "w-48",
      sortable: true,
    },
    {
      key: "primaryEscrowCifNumber",
      label: getAgreementLabelDynamic("CDL_ESCROW_CIF_NUMBER"),
      type: "text" as const,
      width: "w-40",
      sortable: true,
    },
    {
      key: "relationshipManagerName",
      label: getAgreementLabelDynamic("CDL_ESCROW_RM_NAME"),
      type: "text" as const,
      width: "w-48",
      sortable: true,
    },
    {
      key: "status",
      label: getAgreementLabelDynamic("CDL_ESCROW_STATUS"),
      type: "status" as const,
      width: "w-32",
      sortable: true,
    },
    {
      key: "actions",
      label: getAgreementLabelDynamic("CDL_COMMON_ACTION"),
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
    data: agreementsData,
    searchFields: [
      "productManagerName",
      "id",
      "primaryEscrowCifNumber",
      "relationshipManagerName",
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

  const handleRowDelete = (row: AgreementData) => {
    if (isDeleting) {
      return;
    }

    confirmDelete({
      itemName: `agreement: ${row.productManagerName}`,
      itemId: row.primaryEscrowCifNumber,
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          await deleteMutation.mutateAsync(row.id);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          console.error(`Failed to delete agreement: ${errorMessage}`);

          throw error;
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handleRowView = (row: AgreementData) => {
    router.push(`/agreement/${row.primaryEscrowCifNumber}/step/1?mode=view`);
  };

  const handleRowEdit = (row: AgreementData) => {
    router.push(`/agreement/${row.primaryEscrowCifNumber}/step/1?editing=true`);
  };

  const handleDownloadTemplate = async () => {
    // TODO: Add AGREEMENT template file when available
    // await downloadTemplate(TEMPLATE_FILES.AGREEMENT)
  };

  const renderExpandedContent = () => (
    <div className="grid grid-cols-2 gap-8"></div>
  );

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

      <DashboardLayout title={agrementPageTitle}>
        <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
          {agreementsLoading ? (
            <LoadingSpinner />
          ) : agreementsError ? (
            <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
              <ErrorMessage
                error={agreementsError}
                onRetry={refetchAgreements}
              />
            </div>
          ) : (
            <>
              <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/75 dark:bg-gray-800/80 dark:border-gray-700 rounded-t-2xl">
                <PageActionButtons
                  entityType="agreement"
                  customActionButtons={actionButtons}
                  onDownloadTemplate={handleDownloadTemplate}
                  isDownloading={isDownloading}
                  showButtons={{
                    downloadTemplate: true,
                    uploadDetails: true,
                    addNew: true,
                  }}
                />
              </div>

              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-auto">
                  <PermissionAwareDataTable<AgreementData>
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
                    deletePermissions={["bp_delete"]}
                    viewPermissions={["bp_view"]}
                    editPermissions={["bp_update"]}
                    updatePermissions={["bp_update"]}
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

const AgreementsPage: React.FC = () => {
  return <AgreementsPageClient />;
};

export default AgreementsPage;
