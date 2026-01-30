'use client'

import React from 'react'
import { Tooltip } from '@mui/material'
import { PermissionButton } from '@/components/atoms/PermissionButton'

interface UploadActionButtonProps {
  onUpload: () => void
  requiredPermissions: string[]
  disabled?: boolean
  tooltip?: string
  className?: string
}

export const UploadActionButton: React.FC<UploadActionButtonProps> = ({
  onUpload,
  requiredPermissions,
  disabled = false,
  tooltip = 'Upload Details',
  className = '',
}) => {
  return (
    <PermissionButton
      requiredPermissions={requiredPermissions}
      onClick={onUpload}
      disabled={disabled}
      className={className}
    >
      <Tooltip title={tooltip} arrow placement="bottom">
        <img src="/upload.svg" alt="upload icon" />
      </Tooltip>
    </PermissionButton>
  )
}
