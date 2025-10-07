import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios'
import { toast } from 'react-hot-toast'
import { API_CONFIG } from '@/constants'
import { getAuthCookies, clearAuthCookies } from '@/utils/cookieUtils'
import { serviceNavigation } from '@/utils/navigation'

export enum BankingErrorCode {
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  TRANSACTION_LIMIT_EXCEEDED = 'TRANSACTION_LIMIT_EXCEEDED',
  INVALID_ACCOUNT = 'INVALID_ACCOUNT',
  DUPLICATE_TRANSACTION = 'DUPLICATE_TRANSACTION',
  COMPLIANCE_VIOLATION = 'COMPLIANCE_VIOLATION',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export interface ApiErrorResponse {
  code: BankingErrorCode | string
  message: string
  details?: Record<string, unknown>
  timestamp: string
  requestId?: string
}

class RequestQueue {
  private queue: Array<() => Promise<void>> = []
  private processing = false
  private rateLimit = 100
  private requestCount = 0
  private lastReset = Date.now()

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.processing) return
    this.processing = true

    while (this.queue.length > 0) {
      // Reset counter if a minute has passed
      if (Date.now() - this.lastReset > 60000) {
        this.requestCount = 0
        this.lastReset = Date.now()
      }

      // Check rate limit
      if (this.requestCount >= this.rateLimit) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        continue
      }

      const request = this.queue.shift()
      if (request) {
        this.requestCount++
        await request()
      }
    }

    this.processing = false
  }
}

// Enhanced API Client
export class ApiClient {
  private client: AxiosInstance
  private queue: RequestQueue
  private retryAttempts = 3
  private retryDelay = 1000

  constructor() {
    this.client = axios.create({
      baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`,
      timeout: 30000, // 30 seconds for banking operations
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Client-Version': '1.0.0',
        'X-Request-Source': 'web-app',
      },
    })

    this.queue = new RequestQueue()
    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request Interceptor
    this.client.interceptors.request.use(
      (config) => {
        const finalUrl = `${config.baseURL || ''}${config.url || ''}`
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        } else {
        }
        config.headers['X-Request-ID'] = this.generateRequestId()
        config.headers['X-Timestamp'] = new Date().toISOString()
        return config
      },
      (error) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        this.validateJsonResponse(response)

        // Log successful responses for audit
        this.logResponse(response)
        return response
      },
      async (error: AxiosError<ApiErrorResponse>) => {
        return this.handleError(error)
      }
    )
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      // Use the same cookie-based auth as the rest of the application
      try {
        const { token } = getAuthCookies()
        return token
      } catch (error) {
        return null
      }
    }
    return null
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private isSensitiveOperation(config: AxiosRequestConfig): boolean {
    const sensitivePaths = [
      '/transactions',

      '/accounts',
      '/transfers',
      '/withdrawals',
      '/deposits',
    ]
    return sensitivePaths.some((path) => config.url?.includes(path))
  }

  private logResponse(response: AxiosResponse) {
    const { status, config } = response
  }

  private validateJsonResponse(response: AxiosResponse) {
    const contentType = response.headers['content-type'] || ''
    const method = response.config.method?.toUpperCase()

    if (
      contentType.includes('text/html') ||
      contentType.includes('application/xhtml')
    ) {
      if (
        typeof response.data === 'string' &&
        response.data.includes('<html')
      ) {
        throw new Error(
          `API returned HTML instead of JSON. This usually indicates a server error or incorrect endpoint. URL: ${response.config.url}`
        )
      }
    }

    if (response.status >= 200 && response.status < 300) {
      // Allow plain text responses for DELETE operations (soft delete endpoints return plain text)
      if (method === 'DELETE' && typeof response.data === 'string') {
        // For DELETE operations, plain text responses are acceptable
        console.log(`✅ DELETE operation successful: ${response.data}`)
        return
      }

      if (contentType.includes('application/json')) {
        try {
          if (typeof response.data === 'string') {
            response.data = JSON.parse(response.data)
          }
        } catch (error) {
          throw new Error('Invalid JSON response from server')
        }
      }
    }
  }

  private async handleError(
    error: AxiosError<ApiErrorResponse>
  ): Promise<never> {
    const { response, config } = error
    const errorResponse = response?.data

    if (errorResponse?.code) {
      switch (errorResponse.code) {
        case BankingErrorCode.INSUFFICIENT_FUNDS:
          toast.error('Insufficient funds for this transaction')
          break
        case BankingErrorCode.ACCOUNT_LOCKED:
          toast.error('Account is temporarily locked. Please contact support.')
          break
        case BankingErrorCode.TRANSACTION_LIMIT_EXCEEDED:
          toast.error('Transaction limit exceeded for this period')
          break
        case BankingErrorCode.COMPLIANCE_VIOLATION:
          toast.error('Transaction blocked due to compliance requirements')
          break
        case BankingErrorCode.MAINTENANCE_MODE:
          toast.error('System is under maintenance. Please try again later.')
          break
        case BankingErrorCode.RATE_LIMIT_EXCEEDED:
          toast.error('Too many requests. Please wait before trying again.')
          break
        default:
          toast.error(errorResponse.message || 'An error occurred')
      }
    }

    switch (response?.status) {
      case 401:
        this.handleUnauthorized()
        break
      case 403:
        toast.error('Access denied. Insufficient permissions.')
        break
      case 404:
        toast.error('Resource not found')
        break
      case 422:
        toast.error('Invalid request data')
        break
      case 429:
        toast.error('Rate limit exceeded. Please wait before trying again.')
        break
      case 500:
        toast.error('Server error. Please try again later.')
        break
      case 503:
        toast.error('Service temporarily unavailable')
        break
      default:
        toast.error('Network error. Please check your connection.')
    }

    throw error
  }

  private handleUnauthorized() {
    // Clear auth cookies using the proper utility
    if (typeof window !== 'undefined') {
      clearAuthCookies()
      localStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_token')
    }

    // Use Next.js router instead of window.location.href
    serviceNavigation.goToLogin()
  }

  // Retry mechanism for failed requests
  private async retryRequest<T>(
    request: () => Promise<T>,
    attempts: number = this.retryAttempts
  ): Promise<T> {
    try {
      return await request()
    } catch (error) {
      if (attempts > 0 && this.shouldRetry(error as AxiosError)) {
        await this.delay(this.retryDelay)
        return this.retryRequest(request, attempts - 1)
      }
      throw error
    }
  }

  private shouldRetry(error: AxiosError): boolean {
    const retryableStatuses = [408, 429, 500, 502, 503, 504]
    return retryableStatuses.includes(error.response?.status || 0)
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Public API methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.queue.add(async () => {
      const response = await this.retryRequest(() =>
        this.client.get<T>(url, config)
      )
      return response.data
    })
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.queue.add(async () => {
      const finalUrl = `${this.client.defaults.baseURL}${url}`
      const response = await this.retryRequest(() =>
        this.client.post<T>(url, data, config)
      )
      return response.data
    })
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.queue.add(async () => {
      const response = await this.retryRequest(() =>
        this.client.put<T>(url, data, config)
      )
      return response.data
    })
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.queue.add(async () => {
      const response = await this.retryRequest(() =>
        this.client.patch<T>(url, data, config)
      )
      return response.data
    })
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.queue.add(async () => {
      const response = await this.retryRequest(() =>
        this.client.delete<T>(url, config)
      )
      return response.data
    })
  }

  // Download file method that returns full response for accessing headers
  async downloadFile(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    return this.queue.add(async () => {
      const response = await this.retryRequest(() =>
        this.client.get(url, {
          ...config,
          responseType: 'blob',
        })
      )
      return response
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient
