import React from 'react'
import { useJWTParser, useStoredJWTParser } from '@/hooks/useJWTParser'

/**
 * Example component demonstrating JWT parser usage
 */
export function JWTParserExample() {
  // Example with a specific token
  const sampleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJwZXJtaXNzaW9ucyI6WyJyZWFkIiwid3JpdGUiXSwiaWF0IjoxNzM0NTY3ODkwLCJleHAiOjE3MzQ1NzE0OTB9.example-signature"
  
  const { tokenInfo, userInfo, isExpired, isExpiringSoon, isValid } = useJWTParser(sampleToken)
  
  // Using stored token from localStorage/sessionStorage
  const storedTokenInfo = useStoredJWTParser()

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">JWT Parser Example</h2>
      
      {/* Sample Token Analysis */}
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">Sample Token Analysis</h3>
        <div className="space-y-2 text-sm">
          <div><strong>Is Valid:</strong> {isValid ? 'Yes' : 'No'}</div>
          <div><strong>Is Expired:</strong> {isExpired ? 'Yes' : 'No'}</div>
          <div><strong>Is Expiring Soon:</strong> {isExpiringSoon ? 'Yes' : 'No'}</div>
          {userInfo && (
            <div>
              <strong>User Info:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1 text-xs">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Stored Token Analysis */}
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">Stored Token Analysis</h3>
        <div className="space-y-2 text-sm">
          <div><strong>Has Token:</strong> {storedTokenInfo.tokenInfo ? 'Yes' : 'No'}</div>
          <div><strong>Is Valid:</strong> {storedTokenInfo.isValid ? 'Yes' : 'No'}</div>
          <div><strong>Is Expired:</strong> {storedTokenInfo.isExpired ? 'Yes' : 'No'}</div>
          {storedTokenInfo.userInfo && (
            <div>
              <strong>User Info:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1 text-xs">
                {JSON.stringify(storedTokenInfo.userInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Token Info Details */}
      {tokenInfo && (
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Detailed Token Information</h3>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(tokenInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

/**
 * Hook usage example
 */
export function JWTParserHookExample() {
  const { userInfo, isValid, isExpired, timeUntilExpiry } = useStoredJWTParser()

  // Example of using the parser in a component
  if (!userInfo) {
    return <div>No valid token found</div>
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Current User from JWT</h3>
      <div className="space-y-1 text-sm">
        <div><strong>User ID:</strong> {userInfo.userId}</div>
        <div><strong>Email:</strong> {userInfo.email}</div>
        <div><strong>Role:</strong> {userInfo.role}</div>
        <div><strong>Permissions:</strong> {userInfo.permissions.join(', ')}</div>
        <div><strong>Token Valid:</strong> {isValid ? 'Yes' : 'No'}</div>
        <div><strong>Token Expired:</strong> {isExpired ? 'Yes' : 'No'}</div>
        <div><strong>Time Until Expiry:</strong> {Math.floor(timeUntilExpiry / 1000)} seconds</div>
      </div>
    </div>
  )
}
