'use client'
import React from 'react'
import { useTheme } from '@mui/material/styles'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  // Theme-aware colors
  const spinnerColors = isDark
    ? 'border-gray-600 border-t-blue-400'
    : 'border-gray-300 border-t-blue-600'

  return (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-2 ${spinnerColors}`}
    />
  )
}
