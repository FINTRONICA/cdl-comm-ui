"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useState, useMemo } from "react";
import { PermissionAwareDataTable } from "@/components/organisms/PermissionAwareDataTable";
import { useTableState } from "@/hooks/useTableState";
import { PageActionButtons } from "@/components/molecules/PageActionButtons";
import { getLabelByConfigId as getMasterLabel } from "@/constants/mappings/master/masterMapping";
import { GlobalLoading } from "@/components/atoms";
import { RightSlideAgreementSegmentPanel } from "@/components/organisms/RightSlidePanel/MasterRightSlidePanel/RightSlideAgreementSegment";
import {
  useAgreementSegments,
  useRefreshAgreementSegments,
  useDeleteAgreementSegment,
} from "@/hooks/master/CustomerHook/useAgreementSegment";
import { useTemplateDownload } from "@/hooks/useRealEstateDocumentTemplate";
import { UploadDialog } from "@/components/molecules/UploadDialog";
import { AgreementSegment } from "@/services/api/masterApi/Customer/agreementSegmentService";
import {
  useDeleteConfirmation,
  useApproveConfirmation,
} from "@/store/confirmationDialogStore";
import { useCreateWorkflowRequest } from "@/hooks/workflow";

interface AgreementSegmentData extends Record<string, unknown> {
  id: number;
  agreementSegmentId?: string;
  uuid?: string;
  agreementSegmentName: string;
  agreementSegmentDescription: string;
  active?: boolean;
  enabled?: boolean;
  deleted?: boolean;
}

export const AgreementSegmentPageClient = dynamic(
  () => Promise.resolve(AgreementSegmentPageImpl),
  {
    ssr: false,
  }
);

const AgreementSegmentPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"add" | "edit" | "approve">("add");
  const [editingItem, setEditingItem] = useState<AgreementSegment | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // API-driven pagination state
  const [currentApiPage, setCurrentApiPage] = useState(1);
  const [currentApiSize, setCurrentApiSize] = useState(20);
  const [searchFilters] = useState<{ name?: string }>({});

  // API hooks
  const {
    data: agreementSegmentsResponse,
    isLoading: agreementSegmentsLoading,
    error: agreementSegmentsError,
    updatePagination,
    apiPagination,
  } = useAgreementSegments(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    searchFilters
  );

  const refreshAgreementSegments = useRefreshAgreementSegments();
  const deleteAgreementSegmentMutation = useDeleteAgreementSegment();
  const confirmDelete = useDeleteConfirmation();
  const confirmApprove = useApproveConfirmation();
  const createWorkflowRequest = useCreateWorkflowRequest();
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload();

  // Transform API data to table format
  const agreementSegmentData = useMemo(() => {
    if (!agreementSegmentsResponse?.content) return [];
    return agreementSegmentsResponse.content.map(
      (agreementSegment: AgreementSegment) => ({
        id: agreementSegment.id,
        agreementSegmentId:
          agreementSegment.uuid || `MAS-${agreementSegment.id}`,
        uuid: agreementSegment.uuid,
        agreementSegmentName: agreementSegment.segmentName,
        agreementSegmentDescription: agreementSegment.segmentDescription,
        active: agreementSegment.active,
        enabled: agreementSegment.enabled,
        deleted: agreementSegment.deleted,
      })
    ) as AgreementSegmentData[];
  }, [agreementSegmentsResponse]);

  const getAgreementSegmentLabel = useCallback((configId: string): string => {
    return getMasterLabel(configId);
  }, []);

  const tableColumns = useMemo(
    () => [
      {
        key: "agreementSegmentId",
        label: getAgreementSegmentLabel("CDL_MAS_ID"),
        type: "text" as const,
        width: "w-48",
        sortable: true,
      },
      {
        key: "agreementSegmentName",
        label: getAgreementSegmentLabel("CDL_MAS_NAME"),
        type: "text" as const,
        width: "w-64",
        sortable: true,
      },
      {
        key: "agreementSegmentDescription",
        label: getAgreementSegmentLabel("CDL_MAS_DESCRIPTION"),
        type: "text" as const,
        width: "w-96",
        sortable: true,
      },
      {
        key: "status",
        label: getAgreementSegmentLabel("CDL_MAS_STATUS"),
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
    [getAgreementSegmentLabel]
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
    data: agreementSegmentData,
    searchFields: [
      "agreementSegmentId",
      "agreementSegmentName",
      "agreementSegmentDescription",
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
    (row: AgreementSegmentData, _index: number) => {
      if (isDeleting) {
        return;
      }

      confirmDelete({
        itemName: `agreement segment: ${row.agreementSegmentName}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            setIsDeleting(true);
            await deleteAgreementSegmentMutation.mutateAsync(String(row.id));
            refreshAgreementSegments();
          } catch (error) {
            throw error;
          } finally {
            setIsDeleting(false);
          }
        },
      });
    },
    [
      deleteAgreementSegmentMutation,
      confirmDelete,
      isDeleting,
      refreshAgreementSegments,
    ]
  );

  const handleRowEdit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: AgreementSegmentData, _index: number) => {
      const dataIndex = agreementSegmentData.findIndex(
        (item) => item.id === row.id
      );

      // Convert table data format to API format for the panel
      const apiFormatData: AgreementSegment = {
        id: row.id,
        uuid: row.uuid || row.agreementSegmentId || "",
        segmentName: row.agreementSegmentName,
        segmentDescription: row.agreementSegmentDescription,
        active: row.active ?? true,
        enabled: row.enabled ?? true,
        deleted: row.deleted ?? false,
      };

      setEditingItem(apiFormatData);
      setEditingItemIndex(dataIndex >= 0 ? dataIndex : null);
      setPanelMode("edit");
      setIsPanelOpen(true);
    },
    [agreementSegmentData]
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
      await downloadTemplate("AgreementSegmentTemplate.xlsx");
    } catch {
      // Error handling is done by the hook
    }
  }, [downloadTemplate]);

  const handleUploadSuccess = useCallback(() => {
    refreshAgreementSegments();
    setIsUploadDialogOpen(false);
  }, [refreshAgreementSegments]);

  const handleUploadError = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_error: string) => {
      // Error is handled by UploadDialog component
    },
    []
  );

  const handleRowApprove = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: AgreementSegmentData, _index: number) => {
      confirmApprove({
        itemName: `agreement segment: ${row.agreementSegmentName}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            await createWorkflowRequest.mutateAsync({
              referenceId: String(row.id),
              referenceType: "AGREEMENT_SEGMENT",
              moduleName: "AGREEMENT_SEGMENT",
              actionKey: "APPROVE",
              payloadJson: row as Record<string, unknown>,
            });
            refreshAgreementSegments();
          } catch (error) {
            throw error;
          }
        },
      });
    },
    [confirmApprove, createWorkflowRequest, refreshAgreementSegments]
  );

  const handleAgreementSegmentAdded = useCallback(() => {
    refreshAgreementSegments();
    handleClosePanel();
  }, [handleClosePanel, refreshAgreementSegments]);

  const handleAgreementSegmentUpdated = useCallback(() => {
    refreshAgreementSegments();
    handleClosePanel();
  }, [handleClosePanel, refreshAgreementSegments]);

  const renderExpandedContent = useCallback(
    (row: AgreementSegmentData) => (
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {getAgreementSegmentLabel("CDL_MAS_ID")}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.agreementSegmentId || "-"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 dark:text-gray-400">
                {getAgreementSegmentLabel("CDL_MAS_NAME")}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.agreementSegmentName || "-"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 dark:text-gray-400">
                {getAgreementSegmentLabel("CDL_MAS_DESCRIPTION")}:
              </span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {row.agreementSegmentDescription || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    [getAgreementSegmentLabel]
  );

  return (
    <>
      <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/75 dark:bg-gray-800/80 dark:border-gray-700 rounded-t-2xl">
          <PageActionButtons
            entityType="agreementSegment"
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
          {agreementSegmentsLoading ? (
            <div className="flex items-center justify-center flex-1">
              <GlobalLoading />
            </div>
          ) : agreementSegmentsError ? (
            <div className="flex items-center justify-center flex-1 p-4">
              <div className="text-red-600 dark:text-red-400">
                Error loading agreement segments. Please try again.
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <PermissionAwareDataTable<AgreementSegmentData>
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
                // deletePermissions={['agreement_segment_delete']}
                deletePermissions={["*"]}
                // editPermissions={['agreement_segment_update']}
                editPermissions={["*"]}
                // approvePermissions={['agreement_segment_approve']}
                approvePermissions={["*"]}
                updatePermissions={["agreement_segment_update"]}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </div>
          )}
        </div>
      </div>

      {isPanelOpen && (
        <RightSlideAgreementSegmentPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onAgreementSegmentAdded={handleAgreementSegmentAdded}
          onAgreementSegmentUpdated={handleAgreementSegmentUpdated}
          mode={panelMode === "approve" ? "edit" : panelMode}
          actionData={editingItem}
          {...(editingItemIndex !== null && {
            agreementSegmentIndex: editingItemIndex,
          })}
        />
      )}

      {isUploadDialogOpen && (
        <UploadDialog
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          title="Upload Agreement Segment Data"
          entityType="agreementSegment"
        />
      )}
    </>
  );
};

const AgreementSegmentPage: React.FC = () => {
  return <AgreementSegmentPageClient />;
};

export default AgreementSegmentPage;
