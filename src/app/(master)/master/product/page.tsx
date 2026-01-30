"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PermissionAwareDataTable } from "@/components/organisms/PermissionAwareDataTable";
import { useTableState } from "@/hooks/useTableState";
import { PageActionButtons } from "@/components/molecules/PageActionButtons";
import { getLabelByConfigId as getMasterLabel } from "@/constants/mappings/master/masterMapping";
import { GlobalLoading } from "@/components/atoms";
import { RightSlideProductProgramPanel } from "@/components/organisms/RightSlidePanel/MasterRightSlidePanel/RightSlideProductProgramPanel";
import {
  useProductPrograms,
  useDeleteProductProgram,
  useRefreshProductPrograms,
  PRODUCT_PROGRAMS_QUERY_KEY,
} from "@/hooks/master/CustomerHook/useProductProgram";
import { useTemplateDownload } from "@/hooks/useRealEstateDocumentTemplate";
import { UploadDialog } from "@/components/molecules/UploadDialog";
import { ProductProgram } from "@/services/api/masterApi/Customer/productProgramService";
import {
  useDeleteConfirmation,
  useApproveConfirmation,
} from "@/store/confirmationDialogStore";
import { useCreateWorkflowRequest } from "@/hooks/workflow";

// Constants
const STATUS_OPTIONS: string[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "IN_PROGRESS",
  "DRAFT",
  "INITIATED",
];

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE = 1;
const TEMPLATE_NAME = "ProductProgramTemplate.xlsx";

// Types
interface ProductProgramData extends Record<string, unknown> {
  id: number;
  productProgramId?: string;
  uuid?: string;
  productProgramName: string;
  productProgramDescription: string;
  active?: boolean;
  enabled?: boolean;
  deleted?: boolean;
  status?: string;
}

// Dynamic import
export const ProductProgramPageClient = dynamic(
  () => Promise.resolve(ProductProgramPageImpl),
  {
    ssr: false,
  },
);

// Main component implementation
const ProductProgramPageImpl: React.FC = () => {
  // Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"add" | "edit" | "approve">("add");
  const [editingItem, setEditingItem] = useState<ProductProgramData | null>(
    null,
  );
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [tableKey, setTableKey] = useState(0);

  const [isDeleting, setIsDeleting] = useState(false);

  // Upload dialog state
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Pagination state
  const [currentApiPage, setCurrentApiPage] = useState(DEFAULT_PAGE);
  const [currentApiSize, setCurrentApiSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchFilters] = useState<{ name?: string }>({});

  // API hooks
  const {
    data: productProgramsResponse,
    isLoading: productProgramsLoading,
    isFetching: productProgramsFetching,
    error: productProgramsError,
    updatePagination,
    apiPagination,
  } = useProductPrograms(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    searchFilters,
  );

  const deleteProductProgramMutation = useDeleteProductProgram();
  const confirmDelete = useDeleteConfirmation();
  const confirmApprove = useApproveConfirmation();
  const createWorkflowRequest = useCreateWorkflowRequest();
  const refreshProductPrograms = useRefreshProductPrograms();
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload();
  const queryClient = useQueryClient();

  // Transform API data to table format
  const productProgramData = useMemo(() => {
    if (!productProgramsResponse?.content) return [];
    return productProgramsResponse.content.map(
      (productProgram: ProductProgram) => ({
        id: productProgram.id,
        productProgramId: productProgram.uuid || `MPP-${productProgram.id}`,
        uuid: productProgram.uuid,
        productProgramName: productProgram.programName,
        productProgramDescription: productProgram.programDescription,
        active: productProgram.active,
        enabled: productProgram.enabled,
        deleted: productProgram.deleted,
        status: productProgram.active ? "ACTIVE" : "INACTIVE",
      }),
    ) as ProductProgramData[];
  }, [productProgramsResponse]);

  // Label helper
  const getLabel = useCallback(
    (configId: string): string => getMasterLabel(configId),
    [],
  );

  // Table columns configuration
  const tableColumns = useMemo(
    () => [
      {
        key: "productProgramId",
        label: getLabel("CDL_MPP_ID"),
        type: "text" as const,
        width: "w-48",
        sortable: true,
        copyable: true,
      },
      {
        key: "productProgramName",
        label: getLabel("CDL_MPP_NAME"),
        type: "text" as const,
        width: "w-64",
        sortable: true,
        copyable: true,
      },
      {
        key: "productProgramDescription",
        label: getLabel("CDL_MPP_DESCRIPTION"),
        type: "text" as const,
        width: "w-96",
        sortable: true,
        copyable: true,
      },
      {
        key: "status",
        label: getLabel("CDL_MPP_STATUS"),
        type: "status" as const,
        width: "w-32",
        sortable: true,
      },
      {
        key: "actions",
        label: "Actions",
        type: "actions" as const,
        width: "w-20",
      },
    ],
    [getLabel],
  );

  // Table state management
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
    data: productProgramData,
    searchFields: [
      "productProgramId",
      "productProgramName",
      "productProgramDescription",
    ],
    initialRowsPerPage: currentApiSize,
  });

  // Pagination calculations
  const hasActiveSearch = useMemo(
    () => Object.values(search).some((value) => value.trim()),
    [search],
  );

  const apiTotal = apiPagination?.totalElements || 0;
  const apiTotalPages = apiPagination?.totalPages || 1;

  const effectiveTotalRows = hasActiveSearch ? localTotalRows : apiTotal;
  const effectiveTotalPages = hasActiveSearch ? localTotalPages : apiTotalPages;
  const effectivePage = hasActiveSearch ? localPage : currentApiPage;

  const effectiveStartItem = hasActiveSearch
    ? startItem
    : (currentApiPage - 1) * currentApiSize + 1;
  const effectiveEndItem = hasActiveSearch
    ? endItem
    : Math.min(currentApiPage * currentApiSize, apiTotal);

  // Event handlers
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (hasActiveSearch) {
        localHandlePageChange(newPage);
      } else {
        setCurrentApiPage(newPage);
        updatePagination(Math.max(0, newPage - 1), currentApiSize);
      }
    },
    [hasActiveSearch, localHandlePageChange, currentApiSize, updatePagination],
  );

  const handleRowsPerPageChange = useCallback(
    (newRowsPerPage: number) => {
      setCurrentApiSize(newRowsPerPage);
      setCurrentApiPage(DEFAULT_PAGE);
      updatePagination(0, newRowsPerPage);
      localHandleRowsPerPageChange(newRowsPerPage);
    },
    [localHandleRowsPerPageChange, updatePagination],
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

  const handleRowEdit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: ProductProgramData, _index: number) => {
      const dataIndex = productProgramData.findIndex(
        (item) => item.id === row.id,
      );
      setEditingItem(row);
      setEditingItemIndex(dataIndex >= 0 ? dataIndex : null);
      setPanelMode("edit");
      setIsPanelOpen(true);
    },
    [productProgramData],
  );

  const handleRowDelete = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: ProductProgramData, _index: number) => {
      if (isDeleting) {
        return;
      }

      confirmDelete({
        itemName: `product program: ${row.productProgramName}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            setIsDeleting(true);
            await deleteProductProgramMutation.mutateAsync(String(row.id));
            await new Promise((resolve) => setTimeout(resolve, 500));
            await queryClient.invalidateQueries({
              queryKey: [PRODUCT_PROGRAMS_QUERY_KEY],
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
      deleteProductProgramMutation,
      confirmDelete,
      isDeleting,
      queryClient,
      updatePagination,
      currentApiPage,
      currentApiSize,
    ],
  );

  const handleDownloadTemplate = useCallback(async () => {
    try {
      await downloadTemplate(TEMPLATE_NAME);
    } catch {
      // Error handling is managed by the hook
      // Could add user notification here if needed
    }
  }, [downloadTemplate]);

  const handleUploadSuccess = useCallback(() => {
    refreshProductPrograms();
    setIsUploadDialogOpen(false);
  }, [refreshProductPrograms]);

  const handleUploadError = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_error: string) => {
      // Error is handled by UploadDialog component
      // Could add additional error handling here if needed
    },
    [],
  );

  const handleRowApprove = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: ProductProgramData, _index: number) => {
      confirmApprove({
        itemName: `product program: ${row.productProgramName}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            await createWorkflowRequest.mutateAsync({
              referenceId: String(row.id),
              referenceType: "PRODUCT_PROGRAM",
              moduleName: "PRODUCT_PROGRAM",
              actionKey: "APPROVE",
              payloadJson: row as Record<string, unknown>,
            });
            refreshProductPrograms();
          } catch (error) {
            throw error;
          }
        },
      });
    },
    [confirmApprove, createWorkflowRequest, refreshProductPrograms],
  );

  const handleProductProgramAdded = useCallback(() => {
    refreshProductPrograms();
    handleClosePanel();
  }, [handleClosePanel, refreshProductPrograms]);

  const handleProductProgramUpdated = useCallback(() => {
    refreshProductPrograms();
    handleClosePanel();
  }, [handleClosePanel, refreshProductPrograms]);

  // Render expanded content
  const renderExpandedContent = useCallback(
    (row: ProductProgramData) => (
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {getLabel("CDL_MPP_ID")}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.productProgramId || "-"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 dark:text-gray-400">
                {getLabel("CDL_MPP_NAME")}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.productProgramName || "-"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 dark:text-gray-400">
                {getLabel("CDL_MPP_DESCRIPTION")}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.productProgramDescription || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    [getLabel],
  );

  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRefreshLoading = isRefreshing || productProgramsFetching;
  const showRefreshOverlay = isRefreshLoading || productProgramsLoading;

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    try {
      await refreshProductPrograms();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refreshProductPrograms]);

  if (productProgramsLoading || productProgramsFetching) {
    return (
      <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
        <GlobalLoading fullHeight />
      </div>
    );
  }
  return (
    <>
      <div className="relative flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
        {showRefreshOverlay && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 px-4 py-2 rounded-md shadow bg-white/90 dark:bg-gray-900/90">
              <span className="w-5 h-5 border-2 border-gray-300 rounded-full animate-spin border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Loading...
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
          <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white/75 dark:bg-gray-800/80 rounded-t-2xl">
            <PageActionButtons
              entityType="productProgram"
              onAddNew={handleAddNew}
              onDownloadTemplate={handleDownloadTemplate}
              onUploadDetails={() => setIsUploadDialogOpen(true)}
              isDownloading={isDownloading}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshLoading}
              showButtons={{
                addNew: true,
                downloadTemplate: true,
                uploadDetails: true,
                refresh: true,
              }}
              customActionButtons={[]}
            />
          </div>
          <div className="flex flex-col flex-1 min-h-0">
            {productProgramsLoading ? (
              <div className="flex items-center justify-center flex-1">
                <GlobalLoading />
              </div>
            ) : productProgramsError ? (
              <div className="flex items-center justify-center flex-1 p-4">
                <div className="text-red-600 dark:text-red-400">
                  Error loading product programs. Please try again.
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <PermissionAwareDataTable<ProductProgramData>
                  key={`product-programs-table-${tableKey}`}
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
                  statusOptions={STATUS_OPTIONS}
                  onRowDelete={handleRowDelete}
                  onRowApprove={handleRowApprove}
                  onRowEdit={handleRowEdit}
                  deletePermissions={["master_product_delete"]}
                  editPermissions={["master_product_update"]}
                  approvePermissions={["master_product_approve"]}
                  updatePermissions={["master_product_update"]}
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
      </div>

      {isPanelOpen && (
        <RightSlideProductProgramPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onProductProgramAdded={handleProductProgramAdded}
          onProductProgramUpdated={handleProductProgramUpdated}
          mode={panelMode === "approve" ? "edit" : panelMode}
          actionData={editingItem as ProductProgram | null}
          {...(editingItemIndex !== null && {
            productProgramIndex: editingItemIndex,
          })}
        />
      )}

      {isUploadDialogOpen && (
        <UploadDialog
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          title="Upload Product Program Data"
          entityType="productProgram"
        />
      )}
    </>
  );
};

// Export component
const ProductProgramPage: React.FC = () => {
  return <ProductProgramPageClient />;
};

export default ProductProgramPage;
