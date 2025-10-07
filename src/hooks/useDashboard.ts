import { useQuery } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { getAuthCookies } from '@/utils/cookieUtils'
import {API_CONFIG} from '@/constants'
import {API_ENDPOINTS} from '@/constants/apiEndpoints'

// Types for dashboard data
export interface DashboardSummary {
  [key: string]: any
}

// Dashboard API function
export const dashboardApi = {
  getSummary: async (mock: boolean = true): Promise<DashboardSummary> => {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${API_ENDPOINTS.DASHBOARD.SUMMARY}`
    const params = mock ? { mock: 'true' } : {}
    
    // Get authentication token
    const { token } = getAuthCookies()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
    
    // Add Authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    const response: AxiosResponse<DashboardSummary> = await axios.get(url, { 
      params,
      headers
    })
    console.log('Dashboard API Response:', response.data)
    return response.data
  }
}

// React Query Hook
export function useDashboardSummary(mock: boolean = true) {
  return useQuery({
    queryKey: ['dashboard', 'summary', { mock }],
    queryFn: () => dashboardApi.getSummary(mock),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
