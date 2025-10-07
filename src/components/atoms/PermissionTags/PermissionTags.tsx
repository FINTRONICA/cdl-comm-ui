import React from 'react'

interface PermissionTagsProps {
  permissions: string[]
  maxVisible?: number
}

export const PermissionTags: React.FC<PermissionTagsProps> = ({
  permissions,
  maxVisible = 2,
}) => {
  const visiblePermissions = permissions.slice(0, maxVisible)
  const remainingCount = permissions.length - maxVisible

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visiblePermissions.map((permission, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors"
        >
          {permission}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
          +{remainingCount}
        </span>
      )}
    </div>
  )
} 