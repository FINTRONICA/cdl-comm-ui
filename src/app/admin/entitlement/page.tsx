'use client'

import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { DashboardLayout } from '../../../components/templates/DashboardLayout'
import { RoleCard } from '../../../components/molecules/RoleCard'
import { PageActionButtons } from '../../../components/molecules/PageActionButtons'
import LeftSlidePanel from '@/components/organisms/LeftSlidePanel/LeftSlidePanel'
import { RightSlideRolePanel } from '../../../components/organisms/RightSlidePanel/RightSlideRolePanel'
import { Search, Filter, Shield } from 'lucide-react'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { useRoles, useRoleManager } from '@/hooks/useRoles'
import { GlobalLoading } from '@/components/atoms'
import { useDeleteConfirmation } from '@/store/confirmationDialogStore'

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

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
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
  } = useRoles(0, 999)

  // Use the role manager hook for CRUD operations
  const { createRole, deleteRole, createError, deleteError } = useRoleManager()
  const confirmDelete = useDeleteConfirmation()

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

  const handleDeleteRole = async (roleName: string, roleId: string) => {
    confirmDelete({
      itemName: `role: ${roleName}`,
      itemId: roleId,
      onConfirm: async () => {
        try {
          await deleteRole(roleName)
          // Success notification is handled by the useDeleteConfirmation hook
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred'
          console.error(`Failed to delete role: ${errorMessage}`)
          throw error // Re-throw to let the dialog handle the error
        }
      },
    })
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

  // Filter and search the role data
  const filteredRoles = React.useMemo(() => {
    return roleData.filter((role) => {
      const matchesSearch =
        searchQuery === '' ||
        role.roleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.roleId.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        role.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [roleData, searchQuery, statusFilter])

  // Pagination state for cards
  const [currentPage, setCurrentPage] = useState(1)
  const [cardsPerPage, setCardsPerPage] = useState(12)

  // Calculate pagination
  const totalCards = filteredRoles.length
  const totalPages = Math.ceil(totalCards / cardsPerPage)
  const startIndex = (currentPage - 1) * cardsPerPage
  const endIndex = startIndex + cardsPerPage
  const paginatedRoles = filteredRoles.slice(startIndex, endIndex)

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  // Handle cards per page change
  const handleCardsPerPageChange = (newCardsPerPage: number) => {
    setCardsPerPage(newCardsPerPage)
    setCurrentPage(1) // Reset to first page
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
        <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
          {/* Action Buttons - positioned above status cards */}
          <PageActionButtons
            entityType="roleManagement"
            showButtons={{ addNew: true }}
            onAddNew={handleAddNewRole}
          />

          {/* Loading State */}
          {fetching ? (
            <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
              <GlobalLoading fullHeight />
            </div>
          ) : (
            <>
              {/* Error Display */}
              {(error || createError || deleteError) && (
                <div className="mx-4 mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded">
                  <div className="font-semibold mb-2">Error Details:</div>
                  {error && <div>Roles: {error.message}</div>}
                  {createError && <div>Create: {createError.message}</div>}
                  {deleteError && <div>Delete: {deleteError.message}</div>}
                </div>
              )}

              {/* Search and Filter Bar */}
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search roles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards Grid Container */}
              <div className="flex-1 p-6 bg-white dark:bg-gray-800/50">
                {paginatedRoles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <Shield className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
                      No roles found
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {searchQuery || statusFilter !== 'all'
                        ? 'Try adjusting your search or filter criteria'
                        : 'Get started by creating your first role'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Responsive Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                      {paginatedRoles.map((role) => (
                        <RoleCard
                          key={role.roleId}
                          roleName={role.roleName}
                          roleId={role.roleId}
                          usersAssigned={role.usersAssigned.length}
                          activeUsers={role.activeUsers}
                          inactiveUsers={role.inactiveUsers}
                          permissions={role.permissions}
                          status={role.status}
                          onView={() => handleViewRole(role)}
                          onDelete={() =>
                            handleDeleteRole(role.roleName, role.roleId)
                          }
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span>
                            Showing {startIndex + 1}-
                            {Math.min(endIndex, totalCards)} of {totalCards}{' '}
                            roles
                          </span>
                          <select
                            value={cardsPerPage}
                            onChange={(e) =>
                              handleCardsPerPageChange(Number(e.target.value))
                            }
                            className="ml-4 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value={6}>6 per page</option>
                            <option value={12}>12 per page</option>
                            <option value={24}>24 per page</option>
                            <option value={48}>48 per page</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200"
                          >
                            ««
                          </button>
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200"
                          >
                            «
                          </button>

                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              const pageNum =
                                Math.max(
                                  1,
                                  Math.min(totalPages - 4, currentPage - 2)
                                ) + i
                              if (pageNum > totalPages) return null

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`px-3 py-1 text-sm border rounded ${
                                    currentPage === pageNum
                                      ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500'
                                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              )
                            }
                          )}

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200"
                          >
                            »
                          </button>
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200"
                          >
                            »»
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </>
  )
}

export default RoleManagementPage
