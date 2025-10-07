'use client'

import React from 'react'
import { ExpandableDataTable } from '../ExpandableDataTable'
import { useReactivePermissionsStore } from '@/store/reactivePermissionsStore'

interface Column {
  key: string
  label: string
  type: "checkbox" | "text" | "custom" | "status" | "actions" | "select" | "date" | "expand" | "user" | "comment"
  width?: string
  sortable?: boolean
  searchable?: boolean
  options?: { value: string; label: string }[]
}

interface PermissionAwareDataTableProps<T = Record<string, unknown>> {
  data: T[]
  columns: Column[]
  searchState: Record<string, string>
  onSearchChange: (field: string, value: string) => void
  paginationState: {
    page: number
    rowsPerPage: number
    totalRows: number
    totalPages: number
    startItem: number
    endItem: number
  }
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  selectedRows: number[]
  onRowSelectionChange: (selectedRows: number[]) => void
  expandedRows: number[]
  onRowExpansionChange: (expandedRows: number[]) => void
  renderExpandedContent?: (row: T, index: number) => React.ReactNode
  statusOptions?: string[]
  className?: string
  onDataChange?: (
    rowIndex: number,
    field: string,
    value: string | string[]
  ) => void
  renderCustomCell?: (column: string, value: unknown, row: T, index: number) => React.ReactNode
  onRowDelete?: (row: T, index: number) => void
  onRowView?: (row: T, index: number) => void
  onRowEdit?: (row: T, index: number) => void
  onRowClick?: (row: T, index: number) => void
  
  // Permission-based props - can accept single permission or array of permissions
  // Supports "*" wildcard for universal access
  deletePermissions?: string | string[]
  viewPermissions?: string | string[]
  editPermissions?: string | string[]
  updatePermissions?: string | string[] // Controls row click and update actions
  
  // Permission logic - 'any' means user needs ANY of the permissions, 'all' means user needs ALL permissions
  permissionLogic?: 'any' | 'all'
  
  // Fallback props (if permissions are not provided, use these - maintains backward compatibility)
  showDeleteAction?: boolean
  showViewAction?: boolean
  showEditAction?: boolean
  
  // Sorting props
  sortConfig?: {
    key: string
    direction: 'asc' | 'desc'
  } | null
  onSort?: (key: string) => void
}

const PermissionAwareDataTableComponent = <T extends Record<string, unknown>>({
  deletePermissions,
  viewPermissions,
  editPermissions,
  updatePermissions,
  permissionLogic = 'any',
  showDeleteAction = true,
  showViewAction = true,
  showEditAction = true,
  onRowClick,
  sortConfig,
  onSort,
  ...props
}: PermissionAwareDataTableProps<T>) => {
  // Get permission checking functions
  const { hasAnyPermission, hasAllPermissions } = useReactivePermissionsStore()

  // Helper function to check permissions based on logic
  const checkPermissions = (permissions: string | string[] | undefined): boolean => {
    if (!permissions) return true // No permissions specified, allow action
    
    const permArray = Array.isArray(permissions) ? permissions : [permissions]
    
    // Check for wildcard permission "*" - if present, allow access for everyone
    if (permArray.includes('*')) {
      return true
    }
    
    // If no permissions in array, allow action
    if (permArray.length === 0) {
      return true
    }
    
    // Check permissions based on logic
    if (permissionLogic === 'all') {
      return hasAllPermissions(permArray)
    } else {
      return hasAnyPermission(permArray)
    }
  }

  // Determine action visibility based on permissions
  // Permission-based props always override fallback props when specified
  const canDelete = deletePermissions !== undefined ? checkPermissions(deletePermissions) : showDeleteAction
  const canView = viewPermissions !== undefined ? checkPermissions(viewPermissions) : showViewAction
  const canEdit = editPermissions !== undefined ? checkPermissions(editPermissions) : showEditAction
  const canUpdate = updatePermissions !== undefined ? checkPermissions(updatePermissions) : true

  // Create props object, applying permission logic and overriding any fallback props
  const tableProps = {
    ...props,
    // Override with permission-based visibility (this will override any showDeleteAction/showViewAction passed in)
    showDeleteAction: canDelete,
    showViewAction: canView,
    showEditAction: canEdit,
    // Only include onRowClick if user has update permissions
    ...(canUpdate && onRowClick ? { onRowClick } : {}),
    // Only include delete handler if user has delete permissions
    ...(canDelete && props.onRowDelete ? { onRowDelete: props.onRowDelete } : {}),
    // Only include view handler if user has view permissions
    ...(canView && props.onRowView ? { onRowView: props.onRowView } : {}),
    // Only include edit handler if user has edit permissions
    ...(canEdit && props.onRowEdit ? { onRowEdit: props.onRowEdit } : {}),
    // Pass through sorting props
    sortConfig,
    onSort,
  }

  return (
    <ExpandableDataTable<T>
      {...tableProps}
      // Note: showEditAction would need to be added to ExpandableDataTable if needed in the future
    />
  )
}

// Memoize the component to prevent unnecessary re-renders
export const PermissionAwareDataTable = React.memo(PermissionAwareDataTableComponent) as <
  T extends Record<string, unknown>,
>(
  props: PermissionAwareDataTableProps<T>
) => React.ReactElement
