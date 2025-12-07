'use client'
import React from 'react'
import { useTheme } from '@mui/material/styles'

interface GlobalLoadingProps {
  className?: string
  fullHeight?: boolean
}

export const GlobalLoading: React.FC<GlobalLoadingProps> = ({
  className = '',
  fullHeight = false,
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const displayMessage = 'Loading...'

  const containerClasses = fullHeight
    ? 'flex items-center justify-center h-full w-full'
    : 'flex items-center justify-center'

  // Theme-aware spinner colors
  const spinnerBorderClass = isDark
    ? 'border-gray-600 border-t-blue-400'
    : 'border-gray-300 border-t-blue-600'

  const textColorClass = isDark ? 'text-gray-300' : 'text-gray-600'

  // Inline background style to ensure it applies immediately
  const backgroundStyle = {
    backgroundColor: isDark ? '#101828' : 'rgba(255, 255, 255, 0.75)',
  }

  return (
    <div className={`${containerClasses} ${className}`} style={backgroundStyle}>
      <div className="text-center">
        <div
          className={`w-12 h-12 animate-spin rounded-full border-2 ${spinnerBorderClass} mx-auto mb-4`}
        />
        <p className={`${textColorClass} text-sm font-medium`}>
          {displayMessage}
        </p>
      </div>
    </div>
  )
}
