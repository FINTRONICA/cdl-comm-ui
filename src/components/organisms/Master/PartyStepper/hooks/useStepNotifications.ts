import { useState, useCallback } from 'react'
import { NotificationState } from '../types'

/**
 * Custom hook for managing step notifications (error/success messages)
 */
export const useStepNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationState>({
    error: null,
    success: null,
  })

  const showError = useCallback((message: string) => {
    setNotifications(prev => ({ ...prev, error: message }))
  }, [])

  const showSuccess = useCallback((message: string) => {
    setNotifications(prev => ({ ...prev, success: message }))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications({ error: null, success: null })
  }, [])

  const clearError = useCallback(() => {
    setNotifications(prev => ({ ...prev, error: null }))
  }, [])

  const clearSuccess = useCallback(() => {
    setNotifications(prev => ({ ...prev, success: null }))
  }, [])

  return {
    notifications,
    showError,
    showSuccess,
    clearNotifications,
    clearError,
    clearSuccess,
  }
}
