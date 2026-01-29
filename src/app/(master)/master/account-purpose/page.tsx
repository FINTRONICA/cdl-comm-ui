"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PermissionAwareDataTable } from "@/components/organisms/PermissionAwareDataTable";
import { useTableState } from "@/hooks/useTableState";
import { PageActionButtons } from "@/components/molecules/PageActionButtons";
import { getLabelByConfigId as getMasterLabel } from "@/constants/mappings/master/masterMapping";
import { GlobalLoading } from "@/components/atoms";
import { RightSlideAccountPurposePanel } from "@/components/organisms/RightSlidePanel/MasterRightSlidePanel/RightSlideAccountPurposePanel";
import {
  useAccountPurposes,
  useDeleteAccountPurpose,
  useRefreshAccountPurposes,
  ACCOUNT_PURPOSES_QUERY_KEY,
} from "@/hooks/master/CustomerHook/useAccountPurpose";
import { useTemplateDownload } from "@/hooks/useRealEstateDocumentTemplate";
import { UploadDialog } from "@/components/molecules/UploadDialog";
import {
  AccountPurpose,
  CriticalityDTO,
  TaskStatusDTO,
} from "@/services/api/masterApi/Customer/accountPurposeService";
import {
  useDeleteConfirmation,
  useApproveConfirmation,
} from "@/store/confirmationDialogStore";
import { useCreateWorkflowRequest } from "@/hooks/workflow";

interface AccountPurposeData extends Record<string, unknown> {
  id: number;
  accountPurposeId?: string;
  uuid?: string;
  accountPurposeCode: string;
  accountPurposeName: string;
  criticalityDTO?: CriticalityDTO | null;
  taskStatusDTO?: TaskStatusDTO | null;
  active?: boolean;
  enabled?: boolean;
  deleted?: boolean;
  status?: string;
}

const STATUS_OPTIONS = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "IN_PROGRESS",
  "DRAFT",
  "INITIATED",
];

// Memoized dynamic component to prevent unnecessary re-renders
export const AccountPurposePageClient = dynamic(
  () => Promise.resolve(AccountPurposePageImpl),
  {
    ssr: false,
  },
);

const AccountPurposePageImpl: React.FC = () => {
  // Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"add" | "edit" | "approve">("add");
  const [editingItem, setEditingItem] = useState<AccountPurposeData | null>(
    null,
  );
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [tableKey, setTableKey] = useState(0);

  const [isDeleting, setIsDeleting] = useState(false);

  // Upload dialog state
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // API-driven pagination state
  const [currentApiPage, setCurrentApiPage] = useState(1);
  const [currentApiSize, setCurrentApiSize] = useState(20);
  const searchFilters = useMemo(() => ({}) as { name?: string }, []);

  // API hooks
  const {
    data: accountPurposesResponse,
    isLoading: accountPurposesLoading,
    error: accountPurposesError,
    updatePagination,
    apiPagination,
  } = useAccountPurposes(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    searchFilters,
  );

  const deleteAccountPurposeMutation = useDeleteAccountPurpose();
  const confirmDelete = useDeleteConfirmation();
  const confirmApprove = useApproveConfirmation();
  const createWorkflowRequest = useCreateWorkflowRequest();
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload();
  const refreshAccountPurposes = useRefreshAccountPurposes();
  const queryClient = useQueryClient();

  // Transform API data to table format
  const accountPurposeData = useMemo(() => {
    if (!accountPurposesResponse?.content) return [];
    return accountPurposesResponse.content.map(
      (accountPurpose: AccountPurpose) => ({
        id: accountPurpose.id,
        accountPurposeId: accountPurpose.uuid || `AP-${accountPurpose.id}`,
        uuid: accountPurpose.uuid,
        accountPurposeCode: accountPurpose.accountPurposeCode || "",
        accountPurposeName: accountPurpose.accountPurposeName,
        criticalityDTO: accountPurpose.criticalityDTO,
        taskStatusDTO: accountPurpose.taskStatusDTO,
        active: accountPurpose.active,
        enabled: accountPurpose.enabled,
        deleted: accountPurpose.deleted,
        status: accountPurpose.active ? "ACTIVE" : "INACTIVE",
      }),
    ) as AccountPurposeData[];
  }, [accountPurposesResponse]);

  // Memoized label getter
  const getAccountPurposeLabel = useCallback((configId: string): string => {
    return getMasterLabel(configId);
  }, []);

  // Table columns configuration
  const tableColumns = useMemo(
    () => [
      {
        key: "accountPurposeId",
        label: getAccountPurposeLabel("CDL_MAP_ID"),
        type: "text" as const,
        width: "w-48",
        sortable: true,
        copyable: true,
      },
      {
        key: "accountPurposeName",
        label: getAccountPurposeLabel("CDL_MAP_NAME"),
        type: "text" as const,
        width: "w-64",
        sortable: true,
        copyable: true,
      },
      {
        key: "accountPurposeCode",
        label: getAccountPurposeLabel("CDL_MAP_CODE"),
        type: "text" as const,
        width: "w-96",
        sortable: true,
        copyable: true,
      },
      {
        key: "status",
        label: getAccountPurposeLabel("CDL_MAP_STATUS"),
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
    [getAccountPurposeLabel],
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
    data: accountPurposeData,
    searchFields: [
      "accountPurposeId",
      "accountPurposeName",
      "accountPurposeCode",
    ],
    initialRowsPerPage: currentApiSize,
  });

  // Pagination handlers
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
    [search, currentApiSize, localHandlePageChange, updatePagination],
  );

  const handleRowsPerPageChange = useCallback(
    (newRowsPerPage: number) => {
      setCurrentApiSize(newRowsPerPage);
      setCurrentApiPage(1);
      updatePagination(0, newRowsPerPage);
      localHandleRowsPerPageChange(newRowsPerPage);
    },
    [localHandleRowsPerPageChange, updatePagination],
  );

  // Effective pagination values
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

  // Delete handlers
  const handleRowDelete = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: AccountPurposeData, _index: number) => {
      if (isDeleting) {
        return;
      }

      confirmDelete({
        itemName: `account purpose: ${row.accountPurposeName}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            setIsDeleting(true);
            await deleteAccountPurposeMutation.mutateAsync(String(row.id));
            await new Promise((resolve) => setTimeout(resolve, 500));
            await queryClient.invalidateQueries({
              queryKey: [ACCOUNT_PURPOSES_QUERY_KEY],
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
      deleteAccountPurposeMutation,
      confirmDelete,
      isDeleting,
      queryClient,
      updatePagination,
      currentApiPage,
      currentApiSize,
    ],
  );

  // Edit handler
  const handleRowEdit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: AccountPurposeData, _index: number) => {
      const dataIndex = accountPurposeData.findIndex(
        (item) => item.id === row.id,
      );
      setEditingItem(row);
      setEditingItemIndex(dataIndex >= 0 ? dataIndex : null);
      setPanelMode("edit");
      setIsPanelOpen(true);
    },
    [accountPurposeData],
  );

  // Add new handler
  const handleAddNew = useCallback(() => {
    setEditingItem(null);
    setEditingItemIndex(null);
    setPanelMode("add");
    setIsPanelOpen(true);
  }, []);

  // Panel close handler
  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setEditingItem(null);
    setEditingItemIndex(null);
  }, []);

  // Template download handler
  const handleDownloadTemplate = useCallback(async () => {
    try {
      await downloadTemplate("AccountPurposeTemplate.xlsx");
    } catch {
      // Error handling is done by the hook
    }
  }, [downloadTemplate]);

  // Upload handlers
  const handleUploadSuccess = useCallback(() => {
    refreshAccountPurposes();
    setIsUploadDialogOpen(false);
  }, [refreshAccountPurposes]);

  const handleUploadError = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_error: string) => {
      // Error is handled by UploadDialog component
    },
    [],
  );

  // Account purpose added/updated handlers
  const handleAccountPurposeAdded = useCallback(() => {
    refreshAccountPurposes();
    handleClosePanel();
  }, [handleClosePanel, refreshAccountPurposes]);

  const handleAccountPurposeUpdated = useCallback(() => {
    refreshAccountPurposes();
    handleClosePanel();
  }, [handleClosePanel, refreshAccountPurposes]);

  // Expanded content renderer
  const renderExpandedContent = useCallback(
    (row: AccountPurposeData) => (
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {getAccountPurposeLabel("CDL_MAP_ID")}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.accountPurposeId || "-"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 dark:text-gray-400">
                {getAccountPurposeLabel("CDL_MAP_NAME")}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.accountPurposeName || "-"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 dark:text-gray-400">
                {getAccountPurposeLabel("CDL_MAP_CODE")}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.accountPurposeCode || "-"}
              </span>
            </div>
            {row.criticalityDTO && (
              <div className="col-span-2">
                <span className="text-gray-600 dark:text-gray-400">
                  {getAccountPurposeLabel("CDL_MAP_CRITICALITY")}:
                </span>
                <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                  {row.criticalityDTO.languageTranslationId?.configValue ||
                    row.criticalityDTO.settingValue ||
                    "-"}
                </span>
              </div>
            )}
            {row.taskStatusDTO && (
              <div className="col-span-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Task Status:
                </span>
                <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                  {row.taskStatusDTO.name || row.taskStatusDTO.code || "-"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    [getAccountPurposeLabel],
  );

  const handleRowApprove = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: AccountPurposeData, _index: number) => {
      confirmApprove({
        itemName: `account purpose: ${row.accountPurposeName}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            await createWorkflowRequest.mutateAsync({
              referenceId: String(row.id),
              referenceType: "ACCOUNT_PURPOSE",
              moduleName: "ACCOUNT_PURPOSE",
              actionKey: "APPROVE",
              payloadJson: row as Record<string, unknown>,
            });
            refreshAccountPurposes();
          } catch (error) {
            throw error;
          }
        },
      });
    },
    [confirmApprove, createWorkflowRequest, refreshAccountPurposes],
  );

  return (
    <>
      <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/75 dark:bg-gray-800/80 dark:border-gray-700 rounded-t-2xl">
          <PageActionButtons
            entityType="accountPurpose"
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
          {accountPurposesLoading ? (
            <div className="flex items-center justify-center flex-1">
              <GlobalLoading />
            </div>
          ) : accountPurposesError ? (
            <div className="flex items-center justify-center flex-1 p-4">
              <div className="text-red-600 dark:text-red-400">
                Error loading account purposes. Please try again.
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <PermissionAwareDataTable<AccountPurposeData>
                key={`account-purpose-table-${tableKey}`}
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
                onRowApprove={handleRowApprove}
                onRowDelete={handleRowDelete}
                onRowEdit={handleRowEdit}
                deletePermissions={["master_account_purpose_delete"]}
                editPermissions={["master_account_purpose_update"]}
                approvePermissions={["master_account_purpose_approve"]}
                updatePermissions={["master_account_purpose_update"]}
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
        <RightSlideAccountPurposePanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onAccountPurposeAdded={handleAccountPurposeAdded}
          onAccountPurposeUpdated={handleAccountPurposeUpdated}
          mode={panelMode === "approve" ? "edit" : panelMode}
          actionData={editingItem as AccountPurpose | null}
          {...(editingItemIndex !== null && {
            accountPurposeIndex: editingItemIndex,
          })}
        />
      )}

      {isUploadDialogOpen && (
        <UploadDialog
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          title="Upload Account Purpose Data"
          entityType="accountPurpose"
        />
      )}
    </>
  );
};

const AccountPurposePage: React.FC = () => {
  return <AccountPurposePageClient />;
};

export default AccountPurposePage;
