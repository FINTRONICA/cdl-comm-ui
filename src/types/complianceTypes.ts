// 🏦 Banking Compliance Types for Label Management

/**
 * Audit log entry for compliance tracking
 */
export interface ComplianceAuditLog {
  sessionId: string
  timestamp: number
  action: 'LOAD_START' | 'LOAD_SUCCESS' | 'LOAD_ERROR' | 'RETRY' | 'APP_INIT'
  apiName: string
  duration?: number
  errorMessage?: string
  recordCount?: number
  retryAttempt?: number
  userAgent?: string
  requestId?: string
}

/**
 * Loading result for individual API calls
 */
export interface APILoadResult {
  apiName: string
  success: boolean
  data?: any
  error?: string
  duration: number
  recordCount?: number
  timestamp: number
}

/**
 * Overall loading result for all APIs
 */
export interface ComplianceLoadResult {
  sessionId: string
  startTime: number
  endTime: number
  totalDuration: number
  results: APILoadResult[]
  successCount: number
  errorCount: number
  retryCount: number
  auditLogs: ComplianceAuditLog[]
}

/**
 * Label API configuration
 */
export interface LabelAPIConfig {
  name: string
  apiCall: () => Promise<any>
  processor: (data: any) => any
  storeAction: string
  errorAction: string
  loadingAction: string
  required: boolean
  retryCount: number
  timeout: number
}

/**
 * Loading options for compliance loader
 */
export interface ComplianceLoadingOptions {
  enableRetry?: boolean
  retryCount?: number
  retryDelay?: number
  parallel?: boolean
  enableAuditLogging?: boolean
  enablePerformanceMetrics?: boolean
  onProgress?: (completed: number, total: number) => void
  onComplete?: (result: ComplianceLoadResult) => void
  onError?: (error: string, apiName?: string) => void
}

/**
 * Progress tracking
 */
export interface LoadingProgress {
  total: number
  completed: number
  current: string | null
  percentage: number
  startTime: number
  estimatedTimeRemaining?: number
}

/**
 * Session information for compliance
 */
export interface ComplianceSession {
  sessionId: string
  startTime: number
  userAgent: string
  initialLoadComplete: boolean
  lastRefreshTime: number | null
  totalApiCalls: number
  successfulApiCalls: number
  failedApiCalls: number
}

/**
 * Error details for compliance reporting
 */
export interface ComplianceError {
  apiName: string
  errorType: 'NETWORK' | 'TIMEOUT' | 'AUTH' | 'VALIDATION' | 'UNKNOWN'
  errorMessage: string
  timestamp: number
  retryAttempt: number
  stackTrace?: string
  requestId?: string
}

/**
 * Performance metrics for compliance monitoring
 */
export interface ComplianceMetrics {
  sessionId: string
  loadingStartTime: number
  loadingEndTime: number
  totalDuration: number
  apiMetrics: {
    [apiName: string]: {
      attempts: number
      successCount: number
      errorCount: number
      averageDuration: number
      fastestDuration: number
      slowestDuration: number
    }
  }
  memoryUsage?: {
    before: number
    after: number
    peak: number
  }
}

/**
 * API validation result
 */
export interface APIValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  expectedStructure: any
  actualStructure?: any
}

/**
 * Compliance configuration
 */
export interface ComplianceConfig {
  enableAuditLogging: boolean
  enablePerformanceMetrics: boolean
  enableRetryMechanism: boolean
  maxRetryAttempts: number
  retryDelayMs: number
  apiTimeoutMs: number
  enableBackgroundRefresh: boolean
  sessionTimeoutMs: number
  enableErrorReporting: boolean
  strictValidation: boolean
}

/**
 * Default compliance configuration for banking
 */
export const DEFAULT_COMPLIANCE_CONFIG: ComplianceConfig = {
  enableAuditLogging: true,
  enablePerformanceMetrics: true,
  enableRetryMechanism: true,
  maxRetryAttempts: 3,
  retryDelayMs: 1000,
  apiTimeoutMs: 10000,
  enableBackgroundRefresh: false, // Banking: Always fresh, no background
  sessionTimeoutMs: 24 * 60 * 60 * 1000, // 24 hours
  enableErrorReporting: true,
  strictValidation: true,
}
