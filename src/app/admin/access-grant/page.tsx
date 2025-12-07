'use client'

import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { DashboardLayout } from '../../../components/templates/DashboardLayout'
import { ExpandableDataTable } from '../../../components/organisms/ExpandableDataTable'
import { useTableState } from '../../../hooks/useTableState'
import { PageActionButtons } from '../../../components/molecules/PageActionButtons'
import { RightSlideGroupPanel } from '../../../components/organisms/RightSlidePanel/RightSlideGroupPanel'
import { Trash2, Eye } from 'lucide-react'
import { IconButton } from '@mui/material'
import { useGroups, useGroupManager } from '@/hooks/useGroups'
import { useGroupManagementLabelApi } from '@/hooks/useGroupManagementLabelApi'
import { getGroupManagementLabel } from '@/constants/mappings/groupManagementMapping'
import { useAppStore } from '@/store'
import { GlobalLoading } from '@/components/atoms'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'

// Define the group management data structure
interface GroupManagementData extends Record<string, unknown> {
  groupName: string
  groupId: string
  description: string
  status: string
}

const FeeTypePage: React.FC = () => {
  // Get current language from store
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  // Group Management Label API
  const {
    getLabel: getLabelFromApi,
    isLoading: labelsLoading,
    error: labelsError,
  } = useGroupManagementLabelApi()

  // Dynamic label function
  const getGroupManagementLabelDynamic = React.useCallback(
    (configId: string): string => {
      const apiLabel = getLabelFromApi(configId, currentLanguage)

      if (apiLabel !== configId) {
        return apiLabel
      }

      const fallbackLabel = getGroupManagementLabel(configId)
      return fallbackLabel
    },
    [getLabelFromApi, currentLanguage]
  )

  // Table columns with dynamic labels
  const tableColumns = React.useMemo(
    () => [
      {
        key: 'groupName',
        label: getGroupManagementLabelDynamic('CDL_ACCESS_GRANT_NAME'),
        type: 'text' as const,
        width: 'w-full',
        sortable: true,
      },
      {
        key: 'actions',
        label: getGroupManagementLabelDynamic('CDL_ACCESS_GRANT_ACTION'),
        type: 'custom' as const,
        width: 'w-32',
      },
    ],
    [getGroupManagementLabelDynamic]
  )
  const [isGroupPanelOpen, setIsGroupPanelOpen] = useState(false)
  const [currentGroup, setCurrentGroup] = useState<GroupManagementData | null>(
    null
  )
  const [panelMode, setPanelMode] = useState<'add' | 'edit' | 'view'>('add')

  // Use the groups query hook
  const {
    data = [],
    isLoading: fetching,
    error,
    refetch: refreshGroups,
  } = useGroups(0, 999)

  // Use the group manager hook for CRUD operations
  const { createGroup, deleteGroup, createError, deleteError } =
    useGroupManager()
  const confirmDelete = useDeleteConfirmation()

  // Transform API data to match table structure
  const groupData: GroupManagementData[] = data.map((group) => ({
    groupName: group.name || 'N/A',
    groupId: group.id || 'N/A',
    description: group.description || 'N/A',
    status: 'Active',
  }))

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    confirmDelete({
      itemName: `group: ${groupName}`,
      itemId: groupId,
      onConfirm: async () => {
        try {
          await deleteGroup(groupId)
          // Success notification is handled by the useDeleteConfirmation hook
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred'
          console.error(`Failed to delete group: ${errorMessage}`)
          throw error // Re-throw to let the dialog handle the error
        }
      },
    })
  }

  // Handler for adding a new group
  const handleAddGroup = async (groupName: string, groupData?: any) => {
    try {
      await createGroup({
        name: groupName,
        description: groupData?.description,
      })
      toast.success(`Group "${groupName}" created successfully`)
    } catch (error) {
      toast.error(`Failed to create group "${groupName}"`)
    }
  }

  // Handler for viewing a group
  const handleViewGroup = (group: GroupManagementData) => {
    setCurrentGroup(group)
    setPanelMode('view')
    setIsGroupPanelOpen(true)
  }

  // Handler for adding a new group (opens panel)
  const handleAddNewGroup = () => {
    setCurrentGroup(null)
    setPanelMode('add')
    setIsGroupPanelOpen(true)
  }

  // Handler for switching from view to edit mode
  const handleSwitchToEdit = () => {
    setPanelMode('edit')
  }

  // Use the generic table state hook
  const {
    search,
    paginated,
    totalRows,
    totalPages,
    startItem,
    endItem,
    page,
    rowsPerPage,
    selectedRows,
    expandedRows,
    handleSearchChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleRowSelectionChange,
    handleRowExpansionChange,
    sortConfig,
    handleSort,
  } = useTableState({
    data: groupData,
    searchFields: ['groupName', 'groupId', 'description', 'status'],
    initialRowsPerPage: 100,
  })

  // Render expanded content
  const renderExpandedContent = (row: GroupManagementData) => {
    // Find the corresponding group from API data
    const apiGroup = data.find((group) => group.name === row.groupName)

    return (
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Group Information
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Group Name:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
                {apiGroup?.name || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Group ID:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
                {apiGroup?.id || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Description:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
                {apiGroup?.description || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Client Role:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
                {apiGroup?.clientRole !== undefined
                  ? apiGroup.clientRole
                    ? 'Yes'
                    : 'No'
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Composite:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
                {apiGroup?.composite !== undefined
                  ? apiGroup.composite
                    ? 'Yes'
                    : 'No'
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Container ID:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
                {apiGroup?.containerId || 'N/A'}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Group Actions
          </h4>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-200 shadow-sm">
              {getGroupManagementLabelDynamic('CDL_EDIT')}
            </button>
            <button className="w-full text-left p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-200 shadow-sm">
              {getGroupManagementLabelDynamic('CDL_VIEW_PERMISSIONS')}
            </button>
            <button className="w-full text-left p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-200 shadow-sm">
              {getGroupManagementLabelDynamic('CDL_MANAGE_USERS')}
            </button>
            <button className="w-full text-left p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-200 shadow-sm">
              {getGroupManagementLabelDynamic('CDL_DEACTIVATE')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Custom cell renderer for the table
  const renderCustomCell = (
    column: string,
    value: unknown,
    row: GroupManagementData
  ) => {
    switch (column) {
      case 'actions':
        return (
          <div
            className="flex justify-evenly"
            style={{ gap: '5px', padding: '0 8px' }}
          >
            <IconButton
              aria-label="view"
              onClick={() => handleViewGroup(row)}
              size="small"
              sx={{
                color: '#155DFC',
                backgroundColor: '#EFF6FF',
                borderRadius: '6px',
                '&:hover': {
                  backgroundColor: '#DBEAFE',
                },
              }}
            >
              <Eye size={16} />
            </IconButton>
            <IconButton
              aria-label="delete"
              onClick={() => handleDeleteGroup(row.groupId, row.groupName)}
              size="small"
              sx={{
                color: '#DC2626',
                backgroundColor: '#FEE2E2',
                borderRadius: '6px',
                '&:hover': {
                  backgroundColor: '#FECACA',
                },
              }}
            >
              <Trash2 size={16} />
            </IconButton>
          </div>
        )
      default:
        return <span>{String(value)}</span>
    }
  }

  return (
    <>
      {/* Group Panel */}
      <RightSlideGroupPanel
        isOpen={isGroupPanelOpen}
        onClose={() => {
          setIsGroupPanelOpen(false)
          setCurrentGroup(null)
          setPanelMode('add')
        }}
        onSave={handleAddGroup}
        mode={panelMode}
        userData={
          currentGroup
            ? {
                id: currentGroup.groupId,
                name: currentGroup.groupName,
                description: currentGroup.description,
              }
            : undefined
        }
        onSuccess={(group) => {
          toast.success(
            `Group "${group.name}" ${panelMode === 'edit' ? 'updated' : 'created'} successfully`
          )
          refreshGroups()
        }}
        onError={(error) => {
          toast.error(error)
        }}
        onSwitchToEdit={handleSwitchToEdit}
      />

      <DashboardLayout title="Access Grant">
        <div className="bg-white/75 dark:bg-[#1E293B] rounded-2xl flex flex-col h-full">
          {/* Header with actions */}
          <div className="sticky top-0 z-10 bg-white/75 dark:bg-[#1E293B] border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
            <PageActionButtons
              entityType="groupManagement"
              showButtons={{ addNew: true }}
              onAddNew={handleAddNewGroup}
            />
          </div>

          {/* Loading State */}
          {fetching || labelsLoading ? (
            <div className="bg-white/75 dark:bg-[#1E293B] rounded-2xl flex flex-col h-full">
              <GlobalLoading fullHeight />
            </div>
          ) : (
            <>
              {/* Error Display */}
              {(error || createError || deleteError || labelsError) && (
                <div className="mx-4 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  <div className="font-semibold mb-2">Error Details:</div>
                  {error && <div>Groups: {error.message}</div>}
                  {createError && <div>Create: {createError.message}</div>}
                  {deleteError && <div>Delete: {deleteError.message}</div>}
                  {labelsError && <div>Labels: {labelsError}</div>}
                </div>
              )}

              {/* Table Container with Fixed Pagination */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-auto">
                  {/* Table Content */}
                  <ExpandableDataTable<GroupManagementData>
                    data={paginated}
                    columns={tableColumns}
                    searchState={search}
                    onSearchChange={handleSearchChange}
                    paginationState={{
                      page,
                      rowsPerPage,
                      totalRows,
                      totalPages,
                      startItem,
                      endItem,
                    }}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    selectedRows={selectedRows}
                    onRowSelectionChange={handleRowSelectionChange}
                    expandedRows={expandedRows}
                    onRowExpansionChange={handleRowExpansionChange}
                    renderExpandedContent={renderExpandedContent}
                    renderCustomCell={renderCustomCell}
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
  )
}

export default FeeTypePage
