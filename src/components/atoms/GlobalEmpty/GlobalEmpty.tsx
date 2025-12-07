import React from 'react'

interface GlobalEmptyProps {
  title?: string
  message?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  fullHeight?: boolean
}

export const GlobalEmpty: React.FC<GlobalEmptyProps> = ({
  title = 'No Data Found',
  message = 'There is no data available at the moment.',
  icon,
  action,
  className = '',
  fullHeight = false
}) => {
  const defaultIcon = (
    <svg
      className="w-12 h-12 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  )

  const containerClasses = fullHeight 
    ? 'flex items-center justify-center min-h-[400px] bg-gray-50 rounded-2xl'
    : 'flex items-center justify-center'

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full">
          {icon || defaultIcon}
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>
        <p className="mb-6 text-gray-600">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}
