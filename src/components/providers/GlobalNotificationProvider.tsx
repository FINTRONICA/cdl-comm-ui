'use client'

import React from 'react'
import { Box } from '@mui/material'
import { NotificationToast } from '../molecules/NotificationToast/NotificationToast'
import { useNotificationStore } from '../../store/notificationStore'

export const GlobalNotificationProvider: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore()

  if (notifications.length === 0) {
    return null
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </Box>
  )
}

export default GlobalNotificationProvider
