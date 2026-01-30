'use client'

import React from 'react'
import { RotateCw } from 'lucide-react'

interface RefreshIconButtonProps {
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

export const RefreshIconButton: React.FC<RefreshIconButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  className = '',
  ariaLabel = 'Refresh',
}) => {
  const isDisabled = disabled || loading

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      className={`flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
    </button>
  )
}
