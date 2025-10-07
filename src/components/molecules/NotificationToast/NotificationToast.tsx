import React from 'react'
import {
  Alert,
  AlertTitle,
  IconButton,
  Slide,
  Box,
} from '@mui/material'
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import type { Notification } from '../../../store/notificationStore'

export interface NotificationToastProps {
  notification: Notification
  onClose: (id: string) => void
}

const severityMap = {
  success: 'success' as const,
  error: 'error' as const,
  warning: 'warning' as const,
  info: 'info' as const,
}

const iconMap = {
  success: SuccessIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
}) => {
  const IconComponent = iconMap[notification.type]

  return (
    <Slide direction="left" in={true} mountOnEnter unmountOnExit>
      <Alert
        severity={severityMap[notification.type]}
        icon={<IconComponent />}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => onClose(notification.id)}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{
          mb: 1,
          minWidth: 300,
          maxWidth: 500,
          fontFamily: 'Outfit',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          '& .MuiAlert-message': {
            fontFamily: 'Outfit',
          },
        }}
      >
        <AlertTitle sx={{ fontFamily: 'Outfit', fontWeight: 600 }}>
          {notification.title}
        </AlertTitle>
        {notification.message && (
          <Box sx={{ fontFamily: 'Outfit', fontSize: '0.875rem' }}>
            {notification.message}
          </Box>
        )}
      </Alert>
    </Slide>
  )
}

export default NotificationToast
