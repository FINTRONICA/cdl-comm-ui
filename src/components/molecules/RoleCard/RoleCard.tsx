import React from 'react'
import { Eye, Trash2, Shield, Users, Settings } from 'lucide-react'
import { IconButton } from '@mui/material'

interface RoleCardProps {
  roleName: string
  roleId: string
  usersAssigned?: number
  activeUsers?: number
  inactiveUsers?: number
  permissions?: string[]
  status?: string
  onView: () => void
  onDelete: () => void
  onEdit?: () => void
}

export const RoleCard: React.FC<RoleCardProps> = ({
  roleName,
  roleId,
  usersAssigned = 0,
  activeUsers = 0,
  inactiveUsers = 0,
  permissions = [],
  status = 'Active',
  onView,
  onDelete,
  onEdit,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700'
      case 'inactive':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700'
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
    }
  }

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-500">
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {roleName}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Role Stats - Stacked Vertically */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Total Users</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {usersAssigned}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Permissions</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {permissions.length}
            </span>
          </div>
        </div>

        {/* User Status Breakdown */}
        {(activeUsers > 0 || inactiveUsers > 0) && (
          <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              {activeUsers} Active
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              {inactiveUsers} Inactive
            </span>
          </div>
        )}
      </div>

      {/* Card Footer with Actions */}
      <div className="px-6 py-4 bg-white dark:bg-gray-800 rounded-b-xl border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {/* Status Chip on the left */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
          >
            {status}
          </div>

          {/* Action Buttons on the right */}
          <div className="flex items-center gap-2">
            <IconButton
              aria-label="view role"
              onClick={onView}
              size="small"
              sx={{
                color: '#155DFC',
                backgroundColor: '#EFF6FF',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#DBEAFE',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Eye size={16} />
            </IconButton>
            <IconButton
              aria-label="delete role"
              onClick={onDelete}
              size="small"
              sx={{
                color: '#DC2626',
                backgroundColor: '#FEE2E2',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#FECACA',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Trash2 size={16} />
            </IconButton>
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors px-2 py-1"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleCard
