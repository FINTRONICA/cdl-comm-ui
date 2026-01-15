"use client";

import dynamic from "next/dynamic";
import React from "react";
import { useCallback, useState, useMemo } from "react";
import { PermissionAwareDataTable } from "@/components/organisms/PermissionAwareDataTable";
import { useTableState } from "@/hooks/useTableState";
import { PageActionButtons } from "@/components/molecules/PageActionButtons";
import { getLabelByConfigId as getMasterLabel } from "@/constants/mappings/master/masterMapping";
import { GlobalLoading } from "@/components/atoms";
import { RightSlideAgreementSubTypePanel } from "@/components/organisms/RightSlidePanel/MasterRightSlidePanel/RightSlideAgreementSubType";
import { useTemplateDownload } from "@/hooks/useRealEstateDocumentTemplate";
import { UploadDialog } from "@/components/molecules/UploadDialog";
import {
  useAgreementSubTypes,
  useDeleteAgreementSubType,
  useRefreshAgreementSubTypes,
} from "@/hooks/master/CustomerHook/useAgreementSubType";
import {
  useDeleteConfirmation,
  useApproveConfirmation,
} from "@/store/confirmationDialogStore";
import { useCreateWorkflowRequest } from "@/hooks/workflow";

interface AgreementSubTypeData extends Record<string, unknown> {
  id: number;
  agreementSubTypeId?: string;
  uuid?: string;
  agreementSubTypeName: string;
  agreementSubTypeDescription: string;
  agreementTypeDTO: string;
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

const AgreementSubTypePageClient = dynamic(
  () => Promise.resolve(AgreementSubTypePageImpl),
  {
    ssr: false,
    // Removed loading prop to prevent duplicate loading - page handles its own loading state
  }
);

const AgreementSubTypePageImpl: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"add" | "edit" | "approve">("add");
  const [editingItem, setEditingItem] = useState<AgreementSubTypeData | null>(
    null
  );
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // API-driven pagination state
  const [currentApiPage, setCurrentApiPage] = useState(1);
  const [currentApiSize, setCurrentApiSize] = useState(20);
  const [searchFilters] = useState<{ name?: string }>({});

  // API hooks
  const {
    data: agreementSubTypesResponse,
    isLoading: agreementSubTypesLoading,
    error: agreementSubTypesError,
    updatePagination,
    apiPagination,
  } = useAgreementSubTypes(
    Math.max(0, currentApiPage - 1),
    currentApiSize,
    searchFilters
  );

  const deleteAgreementSubTypeMutation = useDeleteAgreementSubType();
  const confirmDelete = useDeleteConfirmation();
  const confirmApprove = useApproveConfirmation();
  const createWorkflowRequest = useCreateWorkflowRequest();
  const refreshAgreementSubTypes = useRefreshAgreementSubTypes();
  const { downloadTemplate, isLoading: isDownloading } = useTemplateDownload();

  // Transform API data to table format
  const agreementSubTypeData = useMemo(() => {
    if (!agreementSubTypesResponse?.content) return [];
    return agreementSubTypesResponse.content.map((agreementSubType) => ({
      id: agreementSubType.id,
      agreementSubTypeId:
        agreementSubType.uuid || `MASU-${agreementSubType.id}`,
      uuid: agreementSubType.uuid,
      agreementSubTypeName: agreementSubType.subTypeName || "",
      agreementSubTypeDescription: agreementSubType.subTypeDescription || "",
      agreementTypeDTO:
        agreementSubType.agreementTypeDTO?.agreementTypeName ||
        agreementSubType.agreementTypeDTO?.id?.toString() ||
        "-",
      active: agreementSubType.active,
      enabled: agreementSubType.enabled,
      deleted: agreementSubType.deleted,
    })) as unknown as AgreementSubTypeData[];
  }, [agreementSubTypesResponse]);

  const getAgreementSubTypeLabelDynamic = useCallback(
    (configId: string): string => {
      return getMasterLabel(configId);
    },
    []
  );

  const tableColumns = [
    {
      key: "agreementSubTypeId",
      label: getAgreementSubTypeLabelDynamic("CDL_MATSS_ID"),
      type: "text" as const,
      width: "w-48",
      sortable: true,
    },
    {
      key: "agreementSubTypeName",
      label: getAgreementSubTypeLabelDynamic("CDL_MATSS_NAME"),
      type: "text" as const,
      width: "w-56",
      sortable: true,
    },
    {
      key: "agreementSubTypeDescription",
      label: getAgreementSubTypeLabelDynamic("CDL_MATSS_DESCRIPTION"),
      type: "text" as const,
      width: "w-65",
      sortable: true,
    },
    {
      key: "agreementTypeDTO",
      label: getAgreementSubTypeLabelDynamic("CDL_MAT_NAME"),
      type: "text" as const,
      width: "w-56",
      sortable: true,
    },
    {
      key: "status",
      label: getAgreementSubTypeLabelDynamic("CDL_MATSS_STATUS"),
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
    data: agreementSubTypeData,
    searchFields: [
      "agreementSubTypeId",
      "agreementSubTypeName",
      "agreementSubTypeDescription",
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
    (row: AgreementSubTypeData, _index: number) => {
      if (isDeleting) {
        return;
      }

      confirmDelete({
        itemName: `agreement sub type: ${row.agreementSubTypeName}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            setIsDeleting(true);
            await deleteAgreementSubTypeMutation.mutateAsync(String(row.id));
            refreshAgreementSubTypes();
          } catch (error) {
            throw error;
          } finally {
            setIsDeleting(false);
          }
        },
      });
    },
    [
      deleteAgreementSubTypeMutation,
      confirmDelete,
      isDeleting,
      refreshAgreementSubTypes,
    ]
  );

  const handleRowEdit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: AgreementSubTypeData, _index: number) => {
      const dataIndex = agreementSubTypeData.findIndex(
        (item) => item.id === row.id
      );
      setEditingItem(row);
      setEditingItemIndex(dataIndex >= 0 ? dataIndex : null);
      setPanelMode("edit");
      setIsPanelOpen(true);
    },
    [agreementSubTypeData]
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
      await downloadTemplate("BusinessSubSegmentTemplate.xlsx");
    } catch {
      // Error handling is done by the hook
    }
  }, [downloadTemplate]);

  const handleUploadSuccess = useCallback(() => {
    refreshAgreementSubTypes();
    setIsUploadDialogOpen(false);
  }, [refreshAgreementSubTypes]);

  const handleUploadError = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_error: string) => {
      // Error is handled by UploadDialog component
    },
    []
  );

  const handleRowApprove = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (row: AgreementSubTypeData, _index: number) => {
      confirmApprove({
        itemName: `agreement sub type: ${row.agreementSubTypeName}`,
        itemId: String(row.id),
        onConfirm: async () => {
          try {
            await createWorkflowRequest.mutateAsync({
              referenceId: String(row.id),
              referenceType: "AGREEMENT_SUB_TYPE",
              moduleName: "AGREEMENT_SUB_TYPE",
              actionKey: "APPROVE",
              payloadJson: row as Record<string, unknown>,
            });
            refreshAgreementSubTypes();
          } catch (error) {
            throw error;
          }
        },
      });
    },
    [confirmApprove, createWorkflowRequest, refreshAgreementSubTypes]
  );

  const handleAgreementSubTypeAdded = useCallback(() => {
    refreshAgreementSubTypes();
    handleClosePanel();
  }, [handleClosePanel, refreshAgreementSubTypes]);

  const handleAgreementSubTypeUpdated = useCallback(() => {
    refreshAgreementSubTypes();
    handleClosePanel();
  }, [handleClosePanel, refreshAgreementSubTypes]);

  const renderExpandedContent = (row: AgreementSubTypeData) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {getAgreementSubTypeLabelDynamic("CDL_MATSS_ID")}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.agreementSubTypeId || "-"}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">
              {getAgreementSubTypeLabelDynamic("CDL_MATSS_NAME")}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.agreementSubTypeName || "-"}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">
              {getAgreementSubTypeLabelDynamic("CDL_MAT_NAME")}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.agreementTypeDTO || "-"}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">
              {getAgreementSubTypeLabelDynamic("CDL_MATSS_DESCRIPTION")}:
            </span>
            <span className="ml-2 font-medium text-gray-800">
              {row.agreementSubTypeDescription || "-"}
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
            entityType="businessSubSegment"
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
          {agreementSubTypesLoading ? (
            <div className="flex items-center justify-center flex-1">
              <GlobalLoading />
            </div>
          ) : agreementSubTypesError ? (
            <div className="flex items-center justify-center flex-1 p-4">
              <div className="text-red-600">
                Error loading agreement sub types. Please try again.
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <PermissionAwareDataTable<AgreementSubTypeData>
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
                // deletePermissions={['agreement_sub_type_delete']}
                deletePermissions={["*"]}
                // editPermissions={['agreement_sub_type_update']}
                editPermissions={["*"]}
                // approvePermissions={['agreement_sub_type_approve']}
                approvePermissions={["*"]}
                updatePermissions={["agreement_sub_type_update"]}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </div>
          )}
        </div>
      </div>

      {isPanelOpen && (
        <RightSlideAgreementSubTypePanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onAgreementSubTypeAdded={handleAgreementSubTypeAdded}
          onAgreementSubTypeUpdated={handleAgreementSubTypeUpdated}
          mode={panelMode === "approve" ? "edit" : panelMode}
          actionData={
            editingItem as unknown as
              | import("@/services/api/masterApi/Customer/agreementSubTypeService").AgreementSubType
              | null
          }
          {...(editingItemIndex !== null && {
            agreementSubTypeIndex: editingItemIndex,
          })}
        />
      )}

      {isUploadDialogOpen && (
        <UploadDialog
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          title="Upload Agreement Sub Type Data"
          entityType="agreementSubType"
        />
      )}
    </>
  );
};

const AgreementSubTypePage: React.FC = () => {
  return <AgreementSubTypePageClient />;
};

export default AgreementSubTypePage;
