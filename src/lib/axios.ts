import axios from 'axios'
import { getAuthCookies } from '../utils/cookieUtils'

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available using existing utility
    const { token } = getAuthCookies()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - Let apiClient.ts handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just pass the error through - apiClient.ts will handle it
    return Promise.reject(error)
  }
)

export default axiosInstance
