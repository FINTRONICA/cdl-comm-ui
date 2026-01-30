'use client'

import React from 'react'
import { Tooltip } from '@mui/material'
import { RefreshIconButton } from '@/components/atoms/RefreshIconButton'

interface RefreshActionButtonProps {
  onRefresh: () => void
  loading?: boolean
  disabled?: boolean
  tooltip?: string
  className?: string
}

export const RefreshActionButton: React.FC<RefreshActionButtonProps> = ({
  onRefresh,
  loading = false,
  disabled = false,
  tooltip = 'Refresh',
  className = '',
}) => {
  return (
    <RefreshIconButton
      onClick={onRefresh}
      loading={loading}
      disabled={disabled}
      className={className}
    />
  )
}
