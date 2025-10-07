import { useState, useCallback } from 'react'
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { type ApiResponse } from '@/types'
import { API_CONFIG } from '@/constants'

interface UseApiOptions {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
}

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (config: AxiosRequestConfig) => Promise<T>
  reset: () => void
}

export function useApi<T = unknown>(options: UseApiOptions = {}): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (config: AxiosRequestConfig): Promise<T> => {
      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
        const response: AxiosResponse<ApiResponse<T>> = await axios({
          baseURL: options.baseURL || API_CONFIG.BASE_URL,
          timeout: options.timeout || 10000,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          ...config,
        })

        const result = response.data.data
        setState({ data: result, loading: false, error: null })
        return result
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred'
        setState({ data: null, loading: false, error: errorMessage })
        throw error
      }
    },
    [options.baseURL, options.timeout, options.headers]
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}

// Specialized hooks for common operations
export function useGet<T = unknown>(url: string, options?: UseApiOptions) {
  const api = useApi<T>(options)
  
  const get = useCallback(
    async (params?: Record<string, unknown>) => {
      return api.execute({
        method: 'GET',
        url,
        params,
      })
    },
    [api, url]
  )

  return {
    ...api,
    get,
  }
}

export function usePost<T = unknown>(url: string, options?: UseApiOptions) {
  const api = useApi<T>(options)
  
  const post = useCallback(
    async (data?: unknown) => {
      return api.execute({
        method: 'POST',
        url,
        data,
      })
    },
    [api, url]
  )

  return {
    ...api,
    post,
  }
}

export function usePut<T = unknown>(url: string, options?: UseApiOptions) {
  const api = useApi<T>(options)
  
  const put = useCallback(
    async (data?: unknown) => {
      return api.execute({
        method: 'PUT',
        url,
        data,
      })
    },
    [api, url]
  )

  return {
    ...api,
    put,
  }
}

export function useDelete<T = unknown>(url: string, options?: UseApiOptions) {
  const api = useApi<T>(options)
  
  const del = useCallback(
    async () => {
      return api.execute({
        method: 'DELETE',
        url,
      })
    },
    [api, url]
  )

  return {
    ...api,
    delete: del,
  }
} 