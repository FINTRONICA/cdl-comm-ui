"use client";

import dynamic from "next/dynamic";
import React from "react";
import { useCallback, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PermissionAwareDataTable } from "@/components/organisms/PermissionAwareDataTable";
import { useTableState } from "@/hooks/useTableState";
import { PageActionButtons } from "@/components/molecules/PageActionButtons";
import { getLabelByConfigId as getMasterLabel } from "@/constants/mappings/master/masterMapping";
import { GlobalLoading } from "@/components/atoms";
import { RightSlideBusinessSegmentPanel } from "@/components/organisms/RightSlidePanel/MasterRightSlidePanel/RightSlideBusinessSegmentPanel";
import {
  useBusinessSegments,
  useDeleteBusinessSegment,
  useRefreshBusinessSegments,
  BUSINESS_SEGMENTS_QUERY_KEY,
} from "@/hooks/master/CustomerHook/useBusinessSegment";
import { useTemplateDownload } from "@/hooks/useRealEstateDocumentTemplate";
import { UploadDialog } from "@/components/molecules/UploadDialog";
import { BusinessSegment } from "@/services/api/masterApi/Customer/businessSegmentService";
import {
  useDeleteConfirmation,
  useApproveConfirmation,
} from "@/store/confirmationDialogStore";
import { useCreateWorkflowRequest } from "@/hooks/workflow";

interface BusinessSegmentData extends Record<string, unknown> {
  id: number;
  businessSegmentId?: string;
  uuid?: string;
  businessSegmentName: string;
  businessSegmentDescription: string;
  active?: boolean;
  enabled?: boolean;
  deleted?: boolean;
}

const statusOptions = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "IN_PROGRESS",
  "DRAFT",
  "INITIATED",
];

const BusinessSegmentPageClient = dynamic(
  () => Promise.resolve(BusinessSegmentPageImpl),
  {
    ssr: false,
    // Removed loading prop to prevent duplicate loading - page handles its own loading state
  }
);

const BusinessSegmentPageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"add" | "edit" | "approve">("add");
  const [editingItem, setEditingItem] = useState<BusinessSegmentData | null>(
    null
  );
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [tableKey, setTableKey] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // API-driven pagination state
  const [currentApiPage, setCurrentApiPage] = useState(1);
  const [currentApiSize, setCurrentApiSize] = useState(20);
  const [searchFilters] = useState<{ name?: string }>({});

  // API hooks
  const {
    data: businessSegmentsResponse,
    isLoading: businessSegmentsLoading,
    error: businessSegmentsError,
    updatePagination,
    apiPagination,
  } = useBusinessSegments(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    searchFilters
  );

  const deleteBusinessSegmentMutation = useDeleteBusinessSegment();
  const confirmDelete = useDeleteConfirmation();
  const confirmApprove = useApproveConfirmation();
  const createWorkflowRequest = useCreateWorkflowRequest();
  const refreshBusinessSegments = useRefreshBusinessSegments();
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload();
  const queryClient = useQueryClient();

  // Transform API data to table format
  const businessSegmentData = useMemo(() => {
    if (!businessSegmentsResponse?.content) return [];
    return businessSegmentsResponse.content.map(
      (businessSegment: BusinessSegment) => ({
        id: businessSegment.id,
        businessSegmentId: businessSegment.uuid || `MBS-${businessSegment.id}`,
        uuid: businessSegment.uuid,
        businessSegmentName: businessSegment.segmentName,
        businessSegmentDescription: businessSegment.segmentDescription,
        active: businessSegment.active,
        enabled: businessSegment.enabled,
        deleted: businessSegment.deleted,
      })
    ) as BusinessSegmentData[];
  }, [businessSegmentsResponse]);

  const getBusinessSegmentLabelDynamic = useCallback(
    (configId: string): string => {
      return getMasterLabel(configId);
    },
    []
  );

  const tableColumns = [
    {
      key: "businessSegmentId",
      label: getBusinessSegmentLabelDynamic("CDL_MBS_ID"),
      type: "text" as const,
      width: "w-48",
      sortable: true,
    },
    {
      key: "businessSegmentName",
      label: getBusinessSegmentLabelDynamic("CDL_MBS_NAME"),
      type: "text" as const,
      width: "w-64",
      sortable: true,
    },
    {
      key: "businessSegmentDescription",
      label: getBusinessSegmentLabelDynamic("CDL_MBS_DESCRIPTION"),
      type: "text" as const,
      width: "w-96",
      sortable: true,
    },
    {
      key: "status",
      label: getBusinessSegmentLabelDynamic("CDL_MBS_STATUS"),
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
    data: businessSegmentData,
    searchFields: [
      "businessSegmentId",
      "businessSegmentName",
      "businessSegmentDescription",
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

  const handleRowDelete = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: BusinessSegmentData, _index: number) => {
      if (isDeleting) {
        return;
      }

      confirmDelete({
        itemName: `business segment: ${row.businessSegmentName}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            setIsDeleting(true);
            await deleteBusinessSegmentMutation.mutateAsync(String(row.id));
            await new Promise((resolve) => setTimeout(resolve, 500));
            await queryClient.invalidateQueries({
              queryKey: [BUSINESS_SEGMENTS_QUERY_KEY],
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
      deleteBusinessSegmentMutation,
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
    (row: BusinessSegmentData, _index: number) => {
      const dataIndex = businessSegmentData.findIndex(
        (item) => item.id === row.id
      );
      setEditingItem(row);
      setEditingItemIndex(dataIndex >= 0 ? dataIndex : null);
      setPanelMode("edit");
      setIsPanelOpen(true);
    },
    [businessSegmentData]
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
      await downloadTemplate("BusinessSegmentTemplate.xlsx");
    } catch {
      // Error handling is done by the hook
    }
  }, [downloadTemplate]);

  const handleUploadSuccess = useCallback(() => {
    refreshBusinessSegments();
    setIsUploadDialogOpen(false);
  }, [refreshBusinessSegments]);

  const handleUploadError = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_error: string) => {
      // Error is handled by UploadDialog component
    },
    []
  );

  const handleRowApprove = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: BusinessSegmentData, _index: number) => {
      confirmApprove({
        itemName: `business segment: ${row.businessSegmentName}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            await createWorkflowRequest.mutateAsync({
              referenceId: String(row.id),
              referenceType: "BUSINESS_SEGMENT",
              moduleName: "BUSINESS_SEGMENT",
              actionKey: "APPROVE",
              payloadJson: row as Record<string, unknown>,
            });
            refreshBusinessSegments();
          } catch (error) {
            throw error;
          }
        },
      });
    },
    [confirmApprove, createWorkflowRequest, refreshBusinessSegments]
  );

  const handleBusinessSegmentAdded = useCallback(() => {
    refreshBusinessSegments();
    handleClosePanel();
  }, [handleClosePanel, refreshBusinessSegments]);

  const handleBusinessSegmentUpdated = useCallback(() => {
    refreshBusinessSegments();
    handleClosePanel();
  }, [handleClosePanel, refreshBusinessSegments]);

  const renderExpandedContent = (row: BusinessSegmentData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getBusinessSegmentLabelDynamic("CDL_MBS_ID")}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.businessSegmentId || "-"}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">
              {getBusinessSegmentLabelDynamic("CDL_MBS_NAME")}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.businessSegmentName || "-"}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">
              {getBusinessSegmentLabelDynamic("CDL_MBS_DESCRIPTION")}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.businessSegmentDescription || "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col h-full bg-white/75 dark:bg-gray-800/80 rounded-2xl">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/75 dark:bg-gray-800/80 dark:border-gray-700 rounded-t-2xl">
          <PageActionButtons
            entityType="businessSegment"
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
          {businessSegmentsLoading ? (
            <div className="flex items-center justify-center flex-1">
              <GlobalLoading />
            </div>
          ) : businessSegmentsError ? (
            <div className="flex items-center justify-center flex-1 p-4">
              <div className="text-red-600">
                Error loading business segments. Please try again.
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <PermissionAwareDataTable<BusinessSegmentData>
                key={`business-segments-table-${tableKey}`}
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
                onRowApprove={handleRowApprove}
                onRowEdit={handleRowEdit}
                deletePermissions={["master_business_segment_delete"]}
                editPermissions={["master_business_segment_update"]}
                approvePermissions={["master_business_segment_approve"]}
                updatePermissions={["master_business_segment_update"]}
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
        <RightSlideBusinessSegmentPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onBusinessSegmentAdded={handleBusinessSegmentAdded}
          onBusinessSegmentUpdated={handleBusinessSegmentUpdated}
          mode={panelMode === "approve" ? "edit" : panelMode}
          actionData={editingItem as BusinessSegment | null}
          {...(editingItemIndex !== null && {
            businessSegmentIndex: editingItemIndex,
          })}
        />
      )}

      {isUploadDialogOpen && (
        <UploadDialog
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          title="Upload Business Segment Data"
          entityType="businessSegment"
        />
      )}
    </>
  );
};

const BusinessSegmentPage: React.FC = () => {
  return <BusinessSegmentPageClient />;
};

export default BusinessSegmentPage;
