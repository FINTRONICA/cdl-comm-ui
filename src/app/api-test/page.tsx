'use client'

import React, { useState } from 'react'
import { useBuildPartners } from '@/hooks/useBuildPartners'
import { Spinner } from '@/components/atoms/Spinner'

const ApiTestPage: React.FC = () => {
  const [testParams] = useState({
    // eslint-disable-line @typescript-eslint/no-unused-vars
    page: 0,
    size: 10,
    filters: {},
  })

  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useBuildPartners(testParams.page, testParams.size, testParams.filters)

  const handleTest = () => {
    console.log('🧪 API Test Starting...')
    refetch()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          API Integration Test
        </h1>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex gap-4 items-center">
            <button
              onClick={handleTest}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? <Spinner size="sm" /> : 'Test API'}
            </button>
            <span className="text-sm text-gray-600">
              {isLoading ? 'Testing...' : 'Click to test the API'}
            </span>
          </div>
        </div>

        {/* API Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              {isLoading && <span className="text-yellow-600">Loading...</span>}
              {error && <span className="text-red-600">❌ Error</span>}
              {!isLoading && !error && apiResponse && (
                <span className="text-green-600">✅ Success</span>
              )}
              {!isLoading && !error && !apiResponse && (
                <span className="text-gray-600">⏸️ Idle</span>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <h3 className="font-medium text-red-800">Error Details:</h3>
                <p className="text-red-700 text-sm mt-1">{error.message}</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-red-600 text-sm">
                    Show Stack Trace
                  </summary>
                  <pre className="text-xs text-red-600 mt-1 bg-red-50 p-2 rounded overflow-auto">
                    {error.stack}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>

        {/* API Response */}
        {apiResponse && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">API Response</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Response Summary:
                </h3>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <div>Response Type: {typeof apiResponse}</div>
                  <div>Has Content: {apiResponse.content ? 'Yes' : 'No'}</div>
                  <div>Content Type: {typeof apiResponse.content}</div>
                  <div>
                    Content Length:{' '}
                    {Array.isArray(apiResponse.content)
                      ? apiResponse.content.length
                      : 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Raw Response:
                </h3>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Label System Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Label System Status</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                Implementation Complete:
              </h3>
              <div className="bg-green-50 p-3 rounded text-sm space-y-2">
                <p>
                  ✅ <strong>Phase 1:</strong> API Service & React Query Hook -
                  Complete
                </p>
                <p>
                  ✅ <strong>Phase 2:</strong> Label Utility Hook - Complete
                </p>
                <p>
                  ✅ <strong>Phase 3:</strong> Form Integration (25+ labels) -
                  Complete
                </p>
                <p>
                  ✅ <strong>Phase 4:</strong> Error Handling & Performance -
                  Complete
                </p>
                <p>
                  ✅ <strong>Phase 5:</strong> Final Testing & Validation -
                  Complete
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">System Ready:</h3>
              <div className="bg-blue-50 p-3 rounded text-sm">
                <p>
                  🎯 <strong>API-Driven Labels:</strong> All form labels now
                  come from API endpoint
                </p>
                <p>
                  🔄 <strong>Dynamic Updates:</strong> Labels can be changed
                  without code deployment
                </p>
                <p>
                  🛡️ <strong>Robust Fallbacks:</strong> Form works even when API
                  fails
                </p>
                <p>
                  ⚡ <strong>Performance Optimized:</strong> Memoized components
                  and efficient rendering
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiTestPage
