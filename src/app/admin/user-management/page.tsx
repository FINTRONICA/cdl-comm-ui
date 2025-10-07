'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '../../../components/templates/DashboardLayout'
import { ExpandableDataTable } from '../../../components/organisms/ExpandableDataTable'
import { useTableState } from '../../../hooks/useTableState'
import { PageActionButtons } from '../../../components/molecules/PageActionButtons'
import { RightSlideUserPanel } from '../../../components/organisms/RightSlidePanel'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { useAuthAdminUsers } from '@/hooks/useAuthUser'
import { useUserManagementLabelApi } from '@/hooks/useUserManagementLabelApi'
import { getUserManagementLabel } from '@/constants/mappings/userManagementMapping'
import { Pencil } from 'lucide-react'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { UserManagementData } from '@/services/api/authAdminUserService'
import { useAppStore } from '@/store'

// ---------------- Interfaces ----------------
interface Permission {
  id: string
  name: string
  description: string
  enabled: boolean
}

interface EditUserData {
  firstName: string
  lastName: string
  emailId: string
  status: string
  username: string
  userId: string
  selectedRoles: string[]
  rolePermissions: Record<string, Permission[]>
  roleEnabled: Record<string, boolean>
}

// ---------------- Table Columns ----------------

// ---------------- Component ----------------
const UserManagementPage: React.FC = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false)
  const [selectedUserForEdit, setSelectedUserForEdit] =
    useState<EditUserData | null>(null)
  const { getLabelResolver } = useSidebarConfig()
  const userManagementTitle = getLabelResolver
    ? getLabelResolver('user', 'User Management')
    : 'User Management'

  // Get current language from store
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  // User Management Label API
  const {
    getLabel: getLabelFromApi,
    isLoading: labelsLoading,
    error: labelsError,
  } = useUserManagementLabelApi()

  // Dynamic label function
  const getUserManagementLabelDynamic = React.useCallback(
    (configId: string): string => {
      const apiLabel = getLabelFromApi(configId, currentLanguage)

      if (apiLabel !== configId) {
        return apiLabel
      }

      const fallbackLabel = getUserManagementLabel(configId)
      return fallbackLabel
    },
    [getLabelFromApi, currentLanguage]
  )

  // Table columns with dynamic labels
  const tableColumns = React.useMemo(
    () => [
      {
        key: 'userName',
        label: getUserManagementLabelDynamic('CDL_USER_NAME'),
        type: 'user' as const,
        width: 'w-48',
        sortable: true,
      },

      {
        key: 'emailId',
        label: getUserManagementLabelDynamic('CDL_EMAIL_ID'),
        type: 'text' as const,
        width: 'w-56',
        sortable: true,
      },
      {
        key: 'roleName',
        label: getUserManagementLabelDynamic('CDL_ROLES'),
        type: 'custom' as const,
        width: 'w-48',
        sortable: true,
      },
      {
        key: 'status',
        label: getUserManagementLabelDynamic('CDL_STATUS'),
        type: 'status' as const,
        width: 'w-32',
        sortable: true,
      },
      {
        key: 'actions',
        label: getUserManagementLabelDynamic('CDL_ACTION'),
        type: 'actions' as const,
        width: 'w-20',
      },
    ],
    [getUserManagementLabelDynamic]
  )
  // Hook for API data with proper server-side pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  const { data, isLoading, error } = useAuthAdminUsers(page, rowsPerPage)
  const userData = data?.content || []
  const totalRows = data?.page?.totalElements || 0
  const totalPages = data?.page?.totalPages || 1

  const statusOptions = ['ACTIVE', 'CLOSED']

  // Table state hook for search and selection (not pagination)
  const {
    search,
    selectedRows,
    expandedRows,
    handleSearchChange,
    handleRowSelectionChange,
    handleRowExpansionChange,
  } = useTableState({
    data: userData,
    searchFields: ['userName', 'userId', 'emailId', 'roleName', 'status'],
    initialRowsPerPage: rowsPerPage,
  })

  // Calculate pagination display values
  const startItem = totalRows > 0 ? page * rowsPerPage + 1 : 0
  const endItem = Math.min((page + 1) * rowsPerPage, totalRows)

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  // Handle rows per page changes
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(0) // Reset to first page when changing page size
  }

  // Wrapper functions for table handlers
  const handleTableRowSelectionChange = (newSelectedRows: number[]) => {
    // Convert array-based selection to individual calls
    // Clear current selection first
    selectedRows.forEach(rowIndex => {
      if (!newSelectedRows.includes(rowIndex)) {
        handleRowSelectionChange(rowIndex, false)
      }
    })
    // Add new selections
    newSelectedRows.forEach(rowIndex => {
      if (!selectedRows.includes(rowIndex)) {
        handleRowSelectionChange(rowIndex, true)
      }
    })
  }

  const handleTableRowExpansionChange = (newExpandedRows: number[]) => {
    // Convert array-based expansion to individual calls
    // Clear current expansion first
    expandedRows.forEach(rowIndex => {
      if (!newExpandedRows.includes(rowIndex)) {
        handleRowExpansionChange(rowIndex, false)
      }
    })
    // Add new expansions
    newExpandedRows.forEach(rowIndex => {
      if (!expandedRows.includes(rowIndex)) {
        handleRowExpansionChange(rowIndex, true)
      }
    })
  }

  if (isLoading || labelsLoading) {
    return (
      <DashboardLayout title={userManagementTitle}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {isLoading && labelsLoading
                ? 'Loading...'
                : isLoading
                  ? 'Loading...'
                  : 'Loading...'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || labelsError) {
    return (
      <DashboardLayout title={userManagementTitle}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error && labelsError
                ? 'Error Loading Users and Labels'
                : error
                  ? 'Error Loading Users'
                  : 'Error Loading Labels'}
            </h3>
            <p className="text-gray-600 mb-4">Please try refreshing the page</p>
            <div className="text-left text-xs bg-red-50 p-4 rounded border max-w-md mx-auto">
              <p>
                <strong>Error Details:</strong>
              </p>
              {error && (
                <div className="mb-2">
                  <p>
                    <strong>Users:</strong> {error.message || 'Unknown error'}
                  </p>
                </div>
              )}
              {labelsError && (
                <div className="mb-2">
                  <p>
                    <strong>Labels:</strong> {labelsError}
                  </p>
                </div>
              )}
              {process.env.NODE_ENV === 'development' && (
                <pre className="mt-2 text-xs">
                  {JSON.stringify({ error, labelsError }, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }
  // inside UserManagementPage.tsx (before return)

  const renderUserActions = (
    row: UserManagementData,
    _index: number,
    handleRowClick: (row: UserManagementData) => void
  ) => {
    return (
      <div className="flex gap-2">
        {/* Edit button only */}
        <button
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Edit"
          title="Edit"
          onClick={(e) => {
            e.stopPropagation()
            handleRowClick(row)
          }}
        >
          <Pencil className="w-4 h-4 text-blue-600 hover:text-blue-800" />
        </button>
      </div>
    )
  }

  // Handle row click → prepare RightSlideUserPanel data
  const handleRowClick = (user: UserManagementData) => {
    const userForEdit: EditUserData = {
      firstName: user.userName.split(' ')[0] || '',
      lastName: user.userName.split(' ').slice(1).join(' ') || '',
      emailId: user.emailId,
      status: user.status.toLowerCase(),
      username: user.username, // Use the actual username for display
      userId: user.userId, // Use the actual UUID for API calls
      selectedRoles: user.roleName,
      rolePermissions: user.roleName.reduce(
        (acc, role) => {
          const roleId = role.toLowerCase().replace(' ', '-')
          acc[roleId] = [
            {
              id: 'permission_1',
              name: 'Permission 1',
              description: 'General permission 1',
              enabled: true,
            },
            {
              id: 'permission_2',
              name: 'Permission 2',
              description: 'General permission 2',
              enabled: false,
            },
          ]
          return acc
        },
        {} as Record<string, Permission[]>
      ),
      roleEnabled: user.roleName.reduce(
        (acc, role) => {
          const roleId = role.toLowerCase().replace(' ', '-')
          acc[roleId] = true
          return acc
        },
        {} as Record<string, boolean>
      ),
    }

    setSelectedUserForEdit(userForEdit)
    setIsUserPanelOpen(true)
  }

  // Custom cell renderer for role names
  const renderCustomCell = (column: string, value: unknown) => {
    if (column === 'roleName' && Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((role, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {role}
            </span>
          ))}
        </div>
      )
    }
    return value as string
  }

  // Bulk action buttons
  const actionButtons = [
    {
      label: getUserManagementLabelDynamic('CDL_DEACTIVATE'),
      onClick: () => console.log('Deactivate users'),
      disabled: selectedRows.length === 0,
      variant: 'secondary' as const,
    },
    {
      label: getUserManagementLabelDynamic('CDL_ACTIVATE'),
      onClick: () => console.log('Activate users'),
      disabled: selectedRows.length === 0,
      variant: 'primary' as const,
    },
    {
      label: getUserManagementLabelDynamic('CDL_DOWNLOAD'),
      onClick: () => console.log('Download users'),
      disabled: selectedRows.length === 0,
      icon: '/download.svg',
      iconAlt: 'download icon',
    },
  ]

  return (
    <>
      {isSidePanelOpen && (
        <LeftSlidePanel
          isOpen={isSidePanelOpen}
          onClose={() => setIsSidePanelOpen(false)}
        />
      )}
      <RightSlideUserPanel
        isOpen={isUserPanelOpen}
        onClose={() => {
          setIsUserPanelOpen(false)
          setSelectedUserForEdit(null) // Clear selected user when closing
        }}
        mode={selectedUserForEdit ? 'edit' : 'add'}
        userData={selectedUserForEdit}
      />

      <DashboardLayout title={userManagementTitle}>
        <div className="bg-[#FFFFFFBF] rounded-2xl flex flex-col h-full">
          {/* Header with actions */}
          <div className="sticky top-0 z-10 bg-[#FFFFFFBF] border-b border-gray-200 rounded-t-2xl">
            <PageActionButtons
              entityType="userManagement"
              showButtons={{ addNew: true }}
              onAddNew={() => {
                setSelectedUserForEdit(null) // Clear any selected user data
                setIsUserPanelOpen(true)
              }}
            />
            {selectedRows.length > 0 && (
              <div className="flex justify-end gap-2 py-3.5 px-4 border-b border-gray-200">
                {actionButtons.map((button, index) => (
                  <button
                    key={index}
                    onClick={button.onClick}
                    disabled={button.disabled}
                    className={`flex items-center h-8 py-1.5 px-2.5 gap-1.5 font-medium text-sm rounded-md ${button.variant === 'primary' ? 'bg-[#155DFC] text-white' : 'bg-gray-100 text-gray-700'} ${button.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {button.icon && (
                      <img src={button.icon} alt={button.iconAlt} />
                    )}
                    {button.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <ExpandableDataTable<UserManagementData>
              data={userData}
              columns={tableColumns}
              searchState={search}
              onSearchChange={handleSearchChange}
              paginationState={{
                page: page + 1, // Convert 0-based to 1-based for display
                rowsPerPage,
                totalRows,
                totalPages,
                startItem,
                endItem,
              }}
              onPageChange={(newPage) => handlePageChange(newPage - 1)} // Convert 1-based to 0-based for API
              onRowsPerPageChange={handleRowsPerPageChange}
              selectedRows={selectedRows}
              onRowSelectionChange={handleTableRowSelectionChange}
              expandedRows={expandedRows}
              onRowExpansionChange={handleTableRowExpansionChange}
              onRowClick={handleRowClick}
              statusOptions={statusOptions}
              renderCustomCell={renderCustomCell}
              renderActions={(row, index) =>
                renderUserActions(row, index, handleRowClick)
              }
            />
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}

export default UserManagementPage
