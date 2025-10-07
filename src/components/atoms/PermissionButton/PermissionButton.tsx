import React from 'react'
import { useReactivePermissionCheck } from '@/store/reactivePermissionsStore'

interface PermissionButtonProps {
  children: React.ReactNode
  requiredPermissions: string[]
  requireAll?: boolean // If true, requires ALL permissions. If false, requires ANY permission
  onClick: () => void
  disabled?: boolean
  className?: string
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  children,
  requiredPermissions,
  requireAll = false,
  onClick,
  disabled = false,
  className = '',
}) => {
  const { hasAnyPermission, hasAllPermissions } = useReactivePermissionCheck()

  // If wildcard permission "*" is present, show button to everyone
  const hasWildcardPermission = requiredPermissions.includes('*')
  
  // Check specific permissions if no wildcard
  const hasSpecificPermission = hasWildcardPermission || (requireAll 
    ? hasAllPermissions(requiredPermissions)
    : hasAnyPermission(requiredPermissions))

  // If no permission, hide the button completely
  if (!hasSpecificPermission) {
    return null
  }

  // Show the button
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  )
}
