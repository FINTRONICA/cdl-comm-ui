'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/atoms/Button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter()

  useEffect(() => {
    // Error logged to error reporting service
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-error-100 mb-6">
            <svg
              className="h-12 w-12 text-error-600"
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
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Something went wrong!
          </h1>
          <p className="text-gray-600 mb-8">
            An unexpected error occurred. Please try again or contact support if
            the problem persists.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            onClick={reset}
            className="w-full"
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/')}
            className="w-full"
          >
            Go Home
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-gray-600 font-medium">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs text-gray-500 bg-gray-100 p-4 rounded overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
