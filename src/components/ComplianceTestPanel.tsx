'use client'

// 🧪 Banking Compliance Test Panel
// Add this component to any page to verify the compliance system is working

import React, { useState, useEffect } from 'react'
import { useBuildPartnerLabelsWithCache } from '@/hooks/useBuildPartnerLabelsWithCache'
import { useCapitalPartnerLabelsWithCache } from '@/hooks/useCapitalPartnerLabelsWithCache'
import { useBuildPartnerAssetLabelsWithCache } from '@/hooks/useBuildPartnerAssetLabelsWithCache'
import { useLabels, useLabelsActions } from '@/store'

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: string
}

export function ComplianceTestPanel() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  // Get hooks to test
  const buildPartnerHook = useBuildPartnerLabelsWithCache()
  const capitalPartnerHook = useCapitalPartnerLabelsWithCache()
  const buildPartnerAssetHook = useBuildPartnerAssetLabelsWithCache()
  
  // Get store data
  const storeLabels = useLabels()
  const { getLabel } = useLabelsActions()

  const runTests = async () => {
    setIsRunning(true)
    const results: TestResult[] = []

    try {
      // Test 1: Hook APIs work
      const hookTests = [
        {
          name: 'Build Partner Hook API',
          hasGetLabel: typeof buildPartnerHook.getLabel === 'function',
          hasHasLabels: typeof buildPartnerHook.hasLabels === 'function',
          hasData: 'data' in buildPartnerHook,
          hasLoading: 'isLoading' in buildPartnerHook
        },
        {
          name: 'Capital Partner Hook API',
          hasGetLabel: typeof capitalPartnerHook.getLabel === 'function',
          hasHasLabels: typeof capitalPartnerHook.hasLabels === 'function',
          hasData: 'data' in capitalPartnerHook,
          hasLoading: 'isLoading' in capitalPartnerHook
        },
        {
          name: 'Build Partner Asset Hook API',
          hasGetLabel: typeof buildPartnerAssetHook.getLabel === 'function',
          hasHasLabels: typeof buildPartnerAssetHook.hasLabels === 'function',
          hasData: 'data' in buildPartnerAssetHook,
          hasLoading: 'isLoading' in buildPartnerAssetHook
        }
      ]

      hookTests.forEach(test => {
        const allMethodsExist = test.hasGetLabel && test.hasHasLabels && test.hasData && test.hasLoading
        results.push({
          name: test.name,
          status: allMethodsExist ? 'pass' : 'fail',
          message: allMethodsExist ? 'All hook methods available' : 'Missing hook methods',
          details: `getLabel: ${test.hasGetLabel}, hasLabels: ${test.hasHasLabels}, data: ${test.hasData}, isLoading: ${test.hasLoading}`
        })
      })

      // Test 2: localStorage cleanup
      const labelKeys = Object.keys(localStorage).filter(key => 
        key.toLowerCase().includes('label')
      )
      results.push({
        name: 'localStorage Cleanup',
        status: labelKeys.length === 0 ? 'pass' : 'warning',
        message: labelKeys.length === 0 
          ? 'No label localStorage entries found'
          : `Found ${labelKeys.length} localStorage entries`,
        details: labelKeys.join(', ')
      })

      // Test 3: Zustand store integration
      const hasStoreData = !!(
        storeLabels.sidebarLabels || 
        storeLabels.buildPartnerLabels || 
        storeLabels.capitalPartnerLabels || 
        storeLabels.buildPartnerAssetLabels
      )
      results.push({
        name: 'Zustand Store Integration',
        status: hasStoreData ? 'pass' : 'warning',
        message: hasStoreData ? 'Labels found in Zustand store' : 'No labels in store (may still be loading)',
        details: `Store loading: ${storeLabels.allLabelsLoading}, Error: ${storeLabels.allLabelsError || 'None'}`
      })

      // Test 4: Label functionality
      try {
        const testLabel1 = buildPartnerHook.getLabel('CDL_BP_NAME', 'EN', 'Test Fallback')
        const testLabel2 = capitalPartnerHook.getLabel('CDL_CP_FIRSTNAME', 'EN', 'Test Fallback')
        const storeLabel = getLabel('sidebar', 'TEST_ID', 'EN', 'Store Fallback')
        
        results.push({
          name: 'Label Functions Working',
          status: 'pass',
          message: 'All label functions return values',
          details: `BP: "${testLabel1}", CP: "${testLabel2}", Store: "${storeLabel}"`
        })
      } catch (error) {
        results.push({
          name: 'Label Functions Working',
          status: 'fail',
          message: 'Label function error',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      // Test 5: Compliance loader
      try {
        const { getComplianceLoader } = await import('@/services/complianceLabelsLoader')
        const loader = getComplianceLoader()
        const session = loader.getCurrentSession()
        const auditLogs = loader.getAuditLogs()
        
        results.push({
          name: 'Compliance Loader Active',
          status: session ? 'pass' : 'warning',
          message: session ? 'Compliance session active' : 'No active session',
          details: session ? `Session: ${session.sessionId}, Logs: ${auditLogs.length}` : 'No session data'
        })
      } catch (error) {
        results.push({
          name: 'Compliance Loader Active',
          status: 'fail',
          message: 'Could not access compliance loader',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }

    } catch (error) {
      results.push({
        name: 'Test Framework',
        status: 'fail',
        message: 'Test execution failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    setTestResults(results)
    setIsRunning(false)
  }

  // Auto-run tests on mount
  useEffect(() => {
    const timer = setTimeout(runTests, 1000)
    return () => clearTimeout(timer)
  }, [])

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return '✅'
      case 'fail': return '❌'
      case 'warning': return '⚠️'
      default: return '❓'
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return '#10b981'
      case 'fail': return '#ef4444'
      case 'warning': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  const passCount = testResults.filter(r => r.status === 'pass').length
  const failCount = testResults.filter(r => r.status === 'fail').length
  const warningCount = testResults.filter(r => r.status === 'warning').length

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '80vh',
      overflowY: 'auto',
      backgroundColor: 'white',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      zIndex: 9999
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <span style={{ fontSize: '20px' }}>🏦</span>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          Banking Compliance Test
        </h3>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <button
          onClick={runTests}
          disabled={isRunning}
          style={{
            padding: '8px 16px',
            backgroundColor: isRunning ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontWeight: '500'
          }}
        >
          {isRunning ? 'Testing...' : 'Run Tests'}
        </button>
      </div>

      {testResults.length > 0 && (
        <>
          <div style={{
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Results Summary:</div>
            <div>✅ Passed: {passCount}</div>
            <div>⚠️ Warnings: {warningCount}</div>
            <div>❌ Failed: {failCount}</div>
            <div style={{ 
              marginTop: '8px', 
              fontWeight: '600',
              color: failCount === 0 ? '#10b981' : '#ef4444'
            }}>
              Status: {failCount === 0 ? (warningCount === 0 ? 'ALL PASS' : 'PASS WITH WARNINGS') : 'NEEDS ATTENTION'}
            </div>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: '#ffffff'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px'
                }}>
                  <span>{getStatusIcon(result.status)}</span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: getStatusColor(result.status)
                  }}>
                    {result.name}
                  </span>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#4b5563',
                  marginBottom: '4px'
                }}>
                  {result.message}
                </div>
                {result.details && (
                  <div style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    fontFamily: 'monospace',
                    backgroundColor: '#f3f4f6',
                    padding: '4px 6px',
                    borderRadius: '4px',
                    wordBreak: 'break-all'
                  }}>
                    {result.details}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{
        marginTop: '16px',
        padding: '8px',
        backgroundColor: '#ecfdf5',
        borderRadius: '6px',
        fontSize: '11px',
        color: '#047857',
        textAlign: 'center'
      }}>
        🎯 Banking compliance verification panel
      </div>
    </div>
  )
}

export default ComplianceTestPanel
