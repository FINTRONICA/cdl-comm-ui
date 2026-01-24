"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PermissionAwareDataTable } from "@/components/organisms/PermissionAwareDataTable";
import { useTableState } from "@/hooks/useTableState";
import { PageActionButtons } from "@/components/molecules/PageActionButtons";
import { getLabelByConfigId as getMasterLabel } from "@/constants/mappings/master/masterMapping";
import { GlobalLoading } from "@/components/atoms";
import {
  useDeleteConfirmation,
  useApproveConfirmation,
} from "@/store/confirmationDialogStore";
import { useCreateWorkflowRequest } from "@/hooks/workflow";
import { RightSlideGeneralLedgerAccountPanel } from "@/components/organisms/RightSlidePanel/MasterRightSlidePanel/RightSlideGeneralLedgerAccount";
import {
  useGeneralLedgerAccounts,
  useDeleteGeneralLedgerAccount,
  useRefreshGeneralLedgerAccounts,
  GENERAL_LEDGER_ACCOUNTS_QUERY_KEY,
} from "@/hooks/master/CustomerHook/useGeneralLedgerAccount";
import { useTemplateDownload } from "@/hooks/useRealEstateDocumentTemplate";
import { UploadDialog } from "@/components/molecules/UploadDialog";
import type {
  GeneralLedgerAccount,
  GeneralLedgerAccountFilters,
} from "@/services/api/masterApi/Customer/generalLedgerAccountService";

interface GeneralLedgerAccountData extends Record<string, unknown> {
  id: number;
  generalLedgerAccountId?: string;
  uuid?: string;
  ledgerAccountNumber: string;
  branchIdentifierCode: string;
  ledgerAccountDescription: string;
  ledgerAccountTypeCode: string;
  active?: boolean;
  enabled?: boolean;
  deleted?: boolean;
  status?: string;
}

const statusOptions = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "IN_PROGRESS",
  "DRAFT",
  "INITIATED",
];

export const GeneralLedgerAccountPageClient = dynamic(
  () => Promise.resolve(GeneralLedgerAccountPageImpl),
  {
    ssr: false,
  }
);

const GeneralLedgerAccountPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"add" | "edit" | "approve">("add");
  const [editingItem, setEditingItem] =
    useState<GeneralLedgerAccountData | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [tableKey, setTableKey] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const [currentApiPage, setCurrentApiPage] = useState(1);
  const [currentApiSize, setCurrentApiSize] = useState(20);
  const [searchFilters] = useState<GeneralLedgerAccountFilters>({});

  const {
    data: generalLedgerAccountsResponse,
    isLoading: generalLedgerAccountsLoading,
    error: generalLedgerAccountsError,
    updatePagination,
    apiPagination,
  } = useGeneralLedgerAccounts(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    searchFilters
  );

  const deleteGeneralLedgerAccountMutation = useDeleteGeneralLedgerAccount();
  const confirmDelete = useDeleteConfirmation();
  const confirmApprove = useApproveConfirmation();
  const createWorkflowRequest = useCreateWorkflowRequest();
  const refreshGeneralLedgerAccounts = useRefreshGeneralLedgerAccounts();
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload();
  const queryClient = useQueryClient();

  const generalLedgerAccountData = useMemo(() => {
    if (!generalLedgerAccountsResponse?.content) return [];
    return generalLedgerAccountsResponse.content.map(
      (account: GeneralLedgerAccount) => ({
        id: account.id,
        generalLedgerAccountId: account.uuid || `GLA-${account.id}`,
        uuid: account.uuid,
        ledgerAccountNumber: account.ledgerAccountNumber || "",
        branchIdentifierCode: account.branchIdentifierCode || "",
        ledgerAccountDescription: account.ledgerAccountDescription || "",
        ledgerAccountTypeCode: account.ledgerAccountTypeCode || "",
        active: account.active,
        enabled: account.enabled,
        deleted: account.deleted,
        status: account.active ? "ACTIVE" : "INACTIVE",
      })
    ) as GeneralLedgerAccountData[];
  }, [generalLedgerAccountsResponse]);

  const getGeneralLedgerAccountLabelDynamic = useCallback(
    (configId: string): string => {
      return getMasterLabel(configId);
    },
    []
  );

  const tableColumns = useMemo(
    () => [
      {
        key: "generalLedgerAccountId",
        label: getGeneralLedgerAccountLabelDynamic("CDL_MGLA_ID"),
        type: "text" as const,
        width: "w-56",
        sortable: true,
      },
      {
        key: "ledgerAccountNumber",
        label: getGeneralLedgerAccountLabelDynamic("CDL_MGLA_ACCOUNT_NUMBER"),
        type: "text" as const,
        width: "w-56",
        sortable: true,
      },
      {
        key: "ledgerAccountTypeCode",
        label: getGeneralLedgerAccountLabelDynamic("CDL_MGLA_TYPE_CODE"),
        type: "text" as const,
        width: "w-56",
        sortable: true,
      },
      {
        key: "ledgerAccountDescription",
        label: getGeneralLedgerAccountLabelDynamic("CDL_MGLA_DESCRIPTION"),
        type: "text" as const,
        width: "w-65",
        sortable: true,
      },
      {
        key: "status",
        label: getGeneralLedgerAccountLabelDynamic("CDL_MGLA_STATUS"),
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
    [getGeneralLedgerAccountLabelDynamic]
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
    data: generalLedgerAccountData,
    searchFields: [
      "generalLedgerAccountId",
      "ledgerAccountNumber",
      "ledgerAccountDescription",
    ],
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
    [updatePagination, localHandleRowsPerPageChange]
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
    (row: GeneralLedgerAccountData, _index: number) => {
      if (isDeleting) {
        return;
      }

      confirmDelete({
        itemName: `general ledger account: ${row.ledgerAccountNumber}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            setIsDeleting(true);
            await deleteGeneralLedgerAccountMutation.mutateAsync(
              String(row.id)
            );
            await new Promise((resolve) => setTimeout(resolve, 500));
            await queryClient.invalidateQueries({
              queryKey: [GENERAL_LEDGER_ACCOUNTS_QUERY_KEY],
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
      deleteGeneralLedgerAccountMutation,
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
    (row: GeneralLedgerAccountData, _index: number) => {
      const dataIndex = generalLedgerAccountData.findIndex(
        (item) => item.id === row.id
      );
      setEditingItem(row);
      setEditingItemIndex(dataIndex >= 0 ? dataIndex : null);
      setPanelMode("edit");
      setIsPanelOpen(true);
    },
    [generalLedgerAccountData]
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
      await downloadTemplate("GeneralLedgerAccountTemplate.xlsx");
    } catch {
      // Error handling is done by the hook
    }
  }, [downloadTemplate]);

  const handleUploadSuccess = useCallback(() => {
    refreshGeneralLedgerAccounts();
    setIsUploadDialogOpen(false);
  }, [refreshGeneralLedgerAccounts]);

  const handleUploadError = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_error: string) => {
      // Error is handled by UploadDialog component
    },
    []
  );

  const handleRowApprove = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: GeneralLedgerAccountData, _index: number) => {
      confirmApprove({
        itemName: `general ledger account: ${row.ledgerAccountNumber}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            await createWorkflowRequest.mutateAsync({
              referenceId: String(row.id),
              referenceType: "GENERAL_LEDGER_ACCOUNT",
              moduleName: "GENERAL_LEDGER_ACCOUNT",
              actionKey: "APPROVE",
              payloadJson: row as Record<string, unknown>,
            });
            refreshGeneralLedgerAccounts();
          } catch (error) {
            throw error;
          }
        },
      });
    },
    [confirmApprove, createWorkflowRequest, refreshGeneralLedgerAccounts]
  );

  const handleGeneralLedgerAccountAdded = useCallback(() => {
    refreshGeneralLedgerAccounts();
    handleClosePanel();
  }, [handleClosePanel, refreshGeneralLedgerAccounts]);

  const handleGeneralLedgerAccountUpdated = useCallback(() => {
    refreshGeneralLedgerAccounts();
    handleClosePanel();
  }, [handleClosePanel, refreshGeneralLedgerAccounts]);

  const renderExpandedContent = useCallback(
    (row: GeneralLedgerAccountData) => (
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {getGeneralLedgerAccountLabelDynamic("CDL_MGLA_ID")}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.generalLedgerAccountId || "-"}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {getGeneralLedgerAccountLabelDynamic("CDL_MGLA_ACCOUNT_NUMBER")}
                :
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.ledgerAccountNumber || "-"}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {getGeneralLedgerAccountLabelDynamic(
                  "CDL_MGLA_IDENTIFIER_CODE"
                )}
                :
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.branchIdentifierCode || "-"}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {getGeneralLedgerAccountLabelDynamic("CDL_MGLA_TYPE_CODE")}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.ledgerAccountTypeCode || "-"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 dark:text-gray-400">
                {getGeneralLedgerAccountLabelDynamic("CDL_MGLA_DESCRIPTION")}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.ledgerAccountDescription || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    [getGeneralLedgerAccountLabelDynamic]
  );

  return (
    <>
      <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/75 dark:bg-gray-800/80 dark:border-gray-700 rounded-t-2xl">
          <PageActionButtons
            entityType="generalLedgerAccount"
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
          {generalLedgerAccountsLoading ? (
            <div className="flex items-center justify-center flex-1">
              <GlobalLoading />
            </div>
          ) : generalLedgerAccountsError ? (
            <div className="flex items-center justify-center flex-1 p-4">
              <div className="text-red-600 dark:text-red-400">
                Error loading general ledger accounts. Please try again.
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <PermissionAwareDataTable<GeneralLedgerAccountData>
                key={`general-ledger-accounts-table-${tableKey}`}
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
                onRowApprove={handleRowApprove}
                onRowDelete={handleRowDelete}
                onRowEdit={handleRowEdit}
                deletePermissions={["master_general_account_delete"]}
                editPermissions={["master_general_account_update"]}
                approvePermissions={["master_general_account_approve"]}
                updatePermissions={["master_general_account_update"]}
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
        <RightSlideGeneralLedgerAccountPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onGeneralLedgerAccountAdded={handleGeneralLedgerAccountAdded}
          onGeneralLedgerAccountUpdated={handleGeneralLedgerAccountUpdated}
          mode={panelMode === "approve" ? "edit" : panelMode}
          actionData={editingItem as GeneralLedgerAccount | null}
          {...(editingItemIndex !== null && {
            generalLedgerAccountIndex: editingItemIndex,
          })}
        />
      )}

      {isUploadDialogOpen && (
        <UploadDialog
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          title="Upload General Ledger Account Data"
          entityType="generalLedgerAccount"
        />
      )}
    </>
  );
};

const GeneralLedgerAccountPage: React.FC = () => {
  return <GeneralLedgerAccountPageClient />;
};

export default GeneralLedgerAccountPage;
