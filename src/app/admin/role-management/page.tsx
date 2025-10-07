'use client'

import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { DashboardLayout } from '../../../components/templates/DashboardLayout'
import { ExpandableDataTable } from '../../../components/organisms/ExpandableDataTable'
import { useTableState } from '../../../hooks/useTableState'
import { PageActionButtons } from '../../../components/molecules/PageActionButtons'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { RightSlideRolePanel } from '../../../components/organisms/RightSlidePanel/RightSlideRolePanel'
import { Trash2, Eye } from 'lucide-react'
import { IconButton } from '@mui/material'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { useRoles, useRoleManager } from '@/hooks/useRoles'
import { useRoleManagementLabelApi } from '@/hooks/useRoleManagementLabelApi'
import { getRoleManagementLabel } from '@/constants/mappings/roleManagementMapping'
import { useAppStore } from '@/store'

// Define the role management data structure
interface User {
  id: string
  name: string
  initials?: string
}

interface RoleManagementData extends Record<string, unknown> {
  roleName: string
  roleId: string
  usersAssigned: User[]
  activeUsers: number
  inactiveUsers: number
  permissions: string[]
  status: string
}

const RoleManagementPage: React.FC = () => {
  const { getLabelResolver } = useSidebarConfig()
  const roleManagementTitle = getLabelResolver
    ? getLabelResolver('role', 'Entitlement')
    : 'Role Management'

  // Get current language from store
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  // Role Management Label API
  const {
    getLabel: getLabelFromApi,
    isLoading: labelsLoading,
    error: labelsError
  } = useRoleManagementLabelApi()

  // Dynamic label function
  const getRoleManagementLabelDynamic = React.useCallback(
    (configId: string): string => {
      const apiLabel = getLabelFromApi(configId, currentLanguage)

      if (apiLabel !== configId) {
        return apiLabel
      }

      const fallbackLabel = getRoleManagementLabel(configId)
      return fallbackLabel
    },
    [getLabelFromApi, currentLanguage]
  )

  // Table columns with dynamic labels
  const tableColumns = React.useMemo(() => [
    {
      key: 'roleName',
      label: getRoleManagementLabelDynamic('CDL_ROLE_NAME'),
      type: 'text' as const,
      width: 'w-full',
      sortable: true,
    },
    {
      key: 'actions',
      label: getRoleManagementLabelDynamic('CDL_ROLE_ACTION'),
      type: 'custom' as const,
      width: 'w-20',
    },
  ], [getRoleManagementLabelDynamic])
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isRolePanelOpen, setIsRolePanelOpen] = useState(false)
  const [currentRole, setCurrentRole] = useState<RoleManagementData | null>(
    null
  )
  const [panelMode, setPanelMode] = useState<'add' | 'edit' | 'view'>('add')

  // Use the roles query hook
  const {
    data = [], // ← Use data directly
    isLoading: fetching,
    error,
    refetch: refreshRoles,
  } = useRoles(0, 20)

  // Use the role manager hook for CRUD operations
  const { createRole, deleteRole, createError, deleteError } = useRoleManager()

  // Transform API data to match table structure
  const roleData: RoleManagementData[] = data.map((role) => ({
    roleName: role.name || 'N/A',
    roleId: role.id || 'N/A',
    usersAssigned: [],
    activeUsers: 0,
    inactiveUsers: 0,
    permissions: [],
    status: 'Active',
  }))

  const handleDeleteRole = async (roleName: string) => {
    if (
      window.confirm(`Are you sure you want to delete the role "${roleName}"?`)
    ) {
      try {
        await deleteRole(roleName)
        toast.success(`Role "${roleName}" deleted successfully`)
      } catch (error) {
       
        toast.error(`Failed to delete role "${roleName}"`)
      }
    }
  }

  // Handler for adding a new role
  const handleAddRole = async (roleName: string) => {
    try {
      await createRole({ name: roleName })
      toast.success(`Role "${roleName}" created successfully`)
    } catch (error) {
     
      toast.error(`Failed to create role "${roleName}"`)
    }
  }

  // Handler for viewing a role
  const handleViewRole = (role: RoleManagementData) => {
    setCurrentRole(role)
    setPanelMode('view')
    setIsRolePanelOpen(true)
  }

  // Handler for adding a new role (opens panel)
  const handleAddNewRole = () => {
    setCurrentRole(null)
    setPanelMode('add')
    setIsRolePanelOpen(true)
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
  } = useTableState({
    data: roleData,
    searchFields: [
      'roleName',
      'roleId',
      'activeUsers',
      'inactiveUsers',
      'status',
    ],
    initialRowsPerPage: 20,
  })

  // Render expanded content
  const renderExpandedContent = (row: RoleManagementData) => {
    // Find the corresponding role from API data
    const apiRole = data.find((role) => role.name === row.roleName)

    return (
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">
            Role Information
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Role Name:</span>
              <span className="ml-2 text-gray-800 font-medium">
                {apiRole?.name || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Role ID:</span>
              <span className="ml-2 text-gray-800 font-medium">
                {apiRole?.id || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Description:</span>
              <span className="ml-2 text-gray-800 font-medium">
                {apiRole?.description || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Client Role:</span>
              <span className="ml-2 text-gray-800 font-medium">
                {apiRole?.clientRole !== undefined
                  ? apiRole.clientRole
                    ? 'Yes'
                    : 'No'
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Composite:</span>
              <span className="ml-2 text-gray-800 font-medium">
                {apiRole?.composite !== undefined
                  ? apiRole.composite
                    ? 'Yes'
                    : 'No'
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Container ID:</span>
              <span className="ml-2 text-gray-800 font-medium">
                {apiRole?.containerId || 'N/A'}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">
            Role Actions
          </h4>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
              Edit Role
            </button>
            <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
              View Permissions
            </button>
            <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
              Manage Users
            </button>
            <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
              Deactivate Role
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Action buttons for bulk operations
  const actionButtons = [
    {
      label: getRoleManagementLabelDynamic('CDL_DEACTIVATE'),
      onClick: () => console.log('Deactivate selected roles'),
      disabled: selectedRows.length === 0,
      variant: 'secondary' as const,
    },
    {
      label: getRoleManagementLabelDynamic('CDL_ACTIVATE'),
      onClick: () => console.log('Activate selected roles'),
      disabled: selectedRows.length === 0,
      variant: 'primary' as const,
    },
    {
      label: getRoleManagementLabelDynamic('CDL_DOWNLOAD'),
      onClick: () => console.log('Download selected roles'),
      icon: '/download.svg',
      disabled: selectedRows.length === 0,
      iconAlt: 'download icon',
    },
  ]

  // Custom cell renderer for the table
  const renderCustomCell = (
    column: string,
    value: unknown,
    row: RoleManagementData
  ) => {
    switch (column) {
      case 'actions':
        return (
          <div className="flex space-x-2">
            <IconButton
              aria-label="view"
              onClick={() => handleViewRole(row)}
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
              onClick={() => handleDeleteRole(row.roleName)}
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
      {isSidePanelOpen && (
        <LeftSlidePanel
          isOpen={isSidePanelOpen}
          onClose={() => setIsSidePanelOpen(false)}
        />
      )}

      {/* Role Panel */}
      <RightSlideRolePanel
        isOpen={isRolePanelOpen}
        onClose={() => {
          setIsRolePanelOpen(false)
          setCurrentRole(null)
          setPanelMode('add')
        }}
        onSave={handleAddRole}
        mode={panelMode}
        userData={
          currentRole
            ? { id: currentRole.roleId, name: currentRole.roleName }
            : undefined
        }
        onSuccess={(role) => {
          toast.success(
            `Role "${role.name}" ${panelMode === 'edit' ? 'updated' : 'created'} successfully`
          )
          refreshRoles()
        }}
        onError={(error) => {
          toast.error(error)
        }}
        onSwitchToEdit={handleSwitchToEdit}
      />

      <DashboardLayout title={roleManagementTitle}>
        <div className="bg-[#FFFFFFBF] rounded-2xl flex flex-col h-full">
          {/* Action Buttons - positioned above status cards */}
          <PageActionButtons
            entityType="roleManagement"
            showButtons={{ addNew: true }}
            onAddNew={handleAddNewRole}
          />

          {/* Loading State */}
          {(fetching || labelsLoading) && (
            <div className="flex justify-center items-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="text-gray-500 text-sm">
                  {fetching && labelsLoading
                    ? 'Loading roles and labels...'
                    : fetching
                    ? 'Loading roles...'
                    : 'Loading labels...'}
                </div>
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {(error || createError || deleteError || labelsError) && (
            <div className="mx-4 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <div className="font-semibold mb-2">Error Details:</div>
              {error && <div>Roles: {error.message}</div>}
              {createError && <div>Create: {createError.message}</div>}
              {deleteError && <div>Delete: {deleteError.message}</div>}
              {labelsError && <div>Labels: {labelsError}</div>}
            </div>
          )}

          {/* Bulk Action Buttons - shown when rows are selected */}
          {selectedRows.length > 0 && (
            <div className="flex justify-end gap-2 py-3.5 px-4 border-b border-gray-200">
              {actionButtons.map((button, index) => (
                <button
                  key={index}
                  onClick={button.onClick}
                  disabled={button.disabled}
                  className={`flex items-center h-8 py-1.5 px-2.5 gap-1.5 font-sans font-medium text-sm rounded-md transition-colors ${
                    button.variant === 'primary'
                      ? 'bg-[#155DFC] text-[#FAFAF9] hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${button.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {button.icon && (
                    <img src={button.icon} alt={button.iconAlt} />
                  )}
                  {button.label}
                </button>
              ))}
            </div>
          )}
          {/* Table Container with Fixed Pagination */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-auto">
              {/* Table Content */}
              <ExpandableDataTable<RoleManagementData>
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
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}

export default RoleManagementPage
