import React from 'react'

interface PageLoadingOverlayProps {
  show: boolean
  label?: string
}

export const PageLoadingOverlay: React.FC<PageLoadingOverlayProps> = ({
  show,
  label = 'Loading...',
}) => {
  if (!show) {
    return null
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
      <div className="flex items-center gap-2 rounded-md bg-white/90 dark:bg-gray-900/90 px-4 py-2 shadow">
        <span className="w-5 h-5 border-2 border-gray-300 rounded-full animate-spin border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </span>
      </div>
    </div>
  )
}
