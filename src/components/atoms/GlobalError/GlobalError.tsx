import React from 'react'

interface GlobalErrorProps {
  error: Error | string
  onRetry?: () => void
  title?: string
  className?: string
  showDetails?: boolean
  fullHeight?: boolean
}

export const GlobalError: React.FC<GlobalErrorProps> = ({
  error,
  onRetry,
  title = 'Something went wrong',
  className = '',
  showDetails = process.env.NODE_ENV === 'development',
  fullHeight = false
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message
  const errorStack = typeof error === 'object' ? error.stack : undefined

  const containerClasses = fullHeight 
    ? 'flex items-center justify-center min-h-[400px] bg-gray-50 rounded-2xl px-4'
    : 'flex items-center justify-center px-4'

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="mb-4 text-2xl font-semibold text-gray-900">
            {title}
          </h1>
          <p className="text-gray-600 mb-4">
            {errorMessage}
          </p>
          {showDetails && errorStack && (
            <details className="text-left">
              <summary className="text-sm font-medium text-gray-600 cursor-pointer">
                Error Details (Development)
              </summary>
              <pre className="p-4 mt-2 overflow-auto text-xs text-gray-500 bg-gray-100 rounded">
                {errorStack}
              </pre>
            </details>
          )}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
