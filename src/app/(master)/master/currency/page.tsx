"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PermissionAwareDataTable } from "@/components/organisms/PermissionAwareDataTable";
import { useTableState } from "@/hooks/useTableState";
import { PageActionButtons } from "@/components/molecules/PageActionButtons";
import { getLabelByConfigId as getMasterLabel } from "@/constants/mappings/master/masterMapping";
import { GlobalLoading } from "@/components/atoms";
import { RightSlideCurrencyPanel } from "@/components/organisms/RightSlidePanel/MasterRightSlidePanel/RightSlideCurrency";
import {
  useCurrencies,
  useDeleteCurrency,
  useRefreshCurrencies,
  CURRENCIES_QUERY_KEY,
} from "@/hooks/master/CustomerHook/useCurrency";
import { useTemplateDownload } from "@/hooks/useRealEstateDocumentTemplate";
import { UploadDialog } from "@/components/molecules/UploadDialog";
import { Currency } from "@/services/api/masterApi/Customer/currencyService";
import {
  useDeleteConfirmation,
  useApproveConfirmation,
} from "@/store/confirmationDialogStore";
import { useCreateWorkflowRequest } from "@/hooks/workflow";

interface CurrencyTableData extends Currency, Record<string, unknown> {
  currencyId?: string;
  status?: string;
}

export const CurrencyPageClient = dynamic(
  () => Promise.resolve(CurrencyPageImpl),
  {
    ssr: false,
  }
);

const CurrencyPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"add" | "edit" | "approve">("add");
  const [editingItem, setEditingItem] = useState<CurrencyTableData | null>(
    null
  );
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [tableKey, setTableKey] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // API-driven pagination state
  const [currentApiPage, setCurrentApiPage] = useState(1);
  const [currentApiSize, setCurrentApiSize] = useState(20);
  const [searchFilters] = useState<{ description?: string }>({});

  // API hooks
  const {
    data: currenciesResponse,
    isLoading: currenciesLoading,
    error: currenciesError,
    updatePagination,
    apiPagination,
  } = useCurrencies(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    searchFilters
  );

  const deleteCurrencyMutation = useDeleteCurrency();
  const confirmDelete = useDeleteConfirmation();
  const confirmApprove = useApproveConfirmation();
  const createWorkflowRequest = useCreateWorkflowRequest();
  const refreshCurrencies = useRefreshCurrencies();
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload();
  const queryClient = useQueryClient();

  // Transform API data to table format
  const currencyData = useMemo(() => {
    if (!currenciesResponse?.content) return [];
    return currenciesResponse.content.map((currency: Currency) => ({
      id: currency.id,
      uuid: currency.uuid,
      currencyId: currency.uuid || `MCUR-${currency.id}`,
      description: currency.description,
      isEnabled: currency.isEnabled,
      enabled: currency.enabled,
      deleted: currency.deleted,
      taskStatusDTO: currency.taskStatusDTO,
      status: currency.taskStatusDTO?.name || "",
    })) as CurrencyTableData[];
  }, [currenciesResponse]);

  const getCurrencyLabelDynamic = useCallback((configId: string): string => {
    return getMasterLabel(configId);
  }, []);

  const tableColumns = useMemo(
    () => [
      {
        key: "currencyId",
        label: getCurrencyLabelDynamic("CDL_MCUR_ID"),
        type: "text" as const,
        width: "w-80",
        sortable: true,
      },
      {
        key: "description",
        label: getCurrencyLabelDynamic("CDL_MCUR_DESCRIPTION"),
        type: "text" as const,
        width: "w-80",
        sortable: true,
      },
      {
        key: "actions",
        label: getCurrencyLabelDynamic("CDL_COMMON_ACTIONS"),
        type: "actions" as const,
        width: "w-20",
      },
    ],
    [getCurrencyLabelDynamic]
  );

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
    data: currencyData,
    searchFields: ["currencyId", "description"],
    initialRowsPerPage: currentApiSize,
  });

  const handlePageChange = useCallback(
    (newPage: number) => {
      const hasSearch = Object.values(search).some((value) => value.trim());

      if (hasSearch) {
        localHandlePageChange(newPage);
      } else {
        setCurrentApiPage(newPage);
        updatePagination(Math.max(0, newPage - 1), currentApiSize);
      }
    },
    [search, localHandlePageChange, currentApiSize, updatePagination]
  );

  const handleRowsPerPageChange = useCallback(
    (newRowsPerPage: number) => {
      setCurrentApiSize(newRowsPerPage);
      setCurrentApiPage(1);
      updatePagination(0, newRowsPerPage);
      localHandleRowsPerPageChange(newRowsPerPage);
    },
    [localHandleRowsPerPageChange, updatePagination]
  );

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

  const handleRowDelete = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: CurrencyTableData, _index: number) => {
      if (isDeleting) {
        return;
      }

      confirmDelete({
        itemName: `currency: ${row.description}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            setIsDeleting(true);
            await deleteCurrencyMutation.mutateAsync(String(row.id));
            await new Promise((resolve) => setTimeout(resolve, 500));
            await queryClient.invalidateQueries({
              queryKey: [CURRENCIES_QUERY_KEY],
            });
            updatePagination(Math.max(0, currentApiPage - 1), currentApiSize);
            setTableKey((prev) => prev + 1);
          } catch (error) {
            throw error;
          } finally {
            setIsDeleting(false);
          }
        },
      });
    },
    [
      deleteCurrencyMutation,
      confirmDelete,
      isDeleting,
      queryClient,
      updatePagination,
      currentApiPage,
      currentApiSize,
    ]
  );

  const handleRowEdit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: CurrencyTableData, _index: number) => {
      const dataIndex = currencyData.findIndex((item) => item.id === row.id);
      setEditingItem(row);
      setEditingItemIndex(dataIndex >= 0 ? dataIndex : null);
      setPanelMode("edit");
      setIsPanelOpen(true);
    },
    [currencyData]
  );

  const handleAddNew = useCallback(() => {
    setEditingItem(null);
    setEditingItemIndex(null);
    setPanelMode("add");
    setIsPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setEditingItem(null);
    setEditingItemIndex(null);
  }, []);

  const handleDownloadTemplate = useCallback(async () => {
    try {
      await downloadTemplate("CurrencyTemplate.xlsx");
    } catch {
      // Error handling is done by the hook
    }
  }, [downloadTemplate]);

  const handleUploadSuccess = useCallback(() => {
    refreshCurrencies();
    setIsUploadDialogOpen(false);
  }, [refreshCurrencies]);

  const handleUploadError = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_error: string) => {
      // Error is handled by UploadDialog component
    },
    []
  );

  const handleRowApprove = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: CurrencyTableData, _index: number) => {
      confirmApprove({
        itemName: `currency: ${row.description}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            await createWorkflowRequest.mutateAsync({
              referenceId: String(row.id),
              referenceType: "CURRENCY",
              moduleName: "CURRENCY",
              actionKey: "APPROVE",
              payloadJson: row as Record<string, unknown>,
            });
            refreshCurrencies();
          } catch (error) {
            throw error;
          }
        },
      });
    },
    [confirmApprove, createWorkflowRequest, refreshCurrencies]
  );

  const handleCurrencyAdded = useCallback(() => {
    refreshCurrencies();
    handleClosePanel();
  }, [handleClosePanel, refreshCurrencies]);

  const handleCurrencyUpdated = useCallback(() => {
    refreshCurrencies();
    handleClosePanel();
  }, [handleClosePanel, refreshCurrencies]);

  const renderExpandedContent = useCallback(
    (row: CurrencyTableData) => (
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {getCurrencyLabelDynamic("CDL_MCUR_ID")}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.currencyId || row.uuid || `MCUR-${row.id}` || "-"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 dark:text-gray-400">
                {getCurrencyLabelDynamic("CDL_MCUR_DESCRIPTION")}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.description || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    [getCurrencyLabelDynamic]
  );

  return (
    <>
      <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/75 dark:bg-gray-800/80 dark:border-gray-700 rounded-t-2xl">
          <PageActionButtons
            entityType="currency"
            onAddNew={handleAddNew}
            onDownloadTemplate={handleDownloadTemplate}
            onUploadDetails={() => setIsUploadDialogOpen(true)}
            isDownloading={isDownloading}
            showButtons={{
              addNew: true,
              downloadTemplate: true,
              uploadDetails: true,
            }}
            customActionButtons={[]}
          />
        </div>
        <div className="flex flex-col flex-1 min-h-0">
          {currenciesLoading ? (
            <div className="flex items-center justify-center flex-1">
              <GlobalLoading />
            </div>
          ) : currenciesError ? (
            <div className="flex items-center justify-center flex-1 p-4">
              <div className="text-red-600 dark:text-red-400">
                Error loading currencies. Please try again.
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <PermissionAwareDataTable<CurrencyTableData>
                key={`currencies-table-${tableKey}`}
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
                onRowDelete={handleRowDelete}
                onRowApprove={handleRowApprove}
                onRowEdit={handleRowEdit}
                deletePermissions={['currency_delete']}
                editPermissions={['currency_update']}
                approvePermissions={['currency_approve']}
                updatePermissions={['currency_update']}
                showDeleteAction={true}
                showViewAction={true}
                showEditAction={true}
                showApproveAction={true}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </div>
          )}
        </div>
      </div>

      {isPanelOpen && (
        <RightSlideCurrencyPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onCurrencyAdded={handleCurrencyAdded}
          onCurrencyUpdated={handleCurrencyUpdated}
          mode={panelMode === "approve" ? "edit" : panelMode}
          actionData={editingItem as Currency | null}
          {...(editingItemIndex !== null && {
            currencyIndex: editingItemIndex,
          })}
        />
      )}

      {isUploadDialogOpen && (
        <UploadDialog
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          title="Upload Currency Data"
          entityType="currency"
        />
      )}
    </>
  );
};

const CurrencyPage: React.FC = () => {
  return <CurrencyPageClient />;
};

export default CurrencyPage;
