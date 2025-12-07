import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
} from '@mui/material'
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material'

const useIsDarkMode = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  return isDark
}

export interface ConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'warning' | 'error' | 'info' | 'success'
  loading?: boolean
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  error?: string | null
}

const variantConfig = {
  warning: {
    icon: WarningIcon,
    color: '#2196f3',
    confirmButtonColor: 'primary' as const,
  },
  error: {
    icon: ErrorIcon,
    color: '#2196f3',
    confirmButtonColor: 'primary' as const,
  },
  info: {
    icon: InfoIcon,
    color: '#2196f3',
    confirmButtonColor: 'primary' as const,
  },
  success: {
    icon: SuccessIcon,
    color: '#2196f3',
    confirmButtonColor: 'primary' as const,
  },
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  loading = false,
  maxWidth = 'sm',
  error = null,
}) => {
  const config = variantConfig[variant]
  const IconComponent = config.icon
  const isDark = useIsDarkMode()

  const handleConfirm = async () => {
    try {
      await onConfirm()
    } catch (error) {
      console.error('Error in confirmation action:', error)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        },
      }}
    >
      <DialogTitle
        id="confirmation-dialog-title"
        sx={{
          fontFamily: 'Outfit',
          fontWeight: 600,
          fontSize: '18px',
          color: isDark ? '#F9FAFB' : '#1F2937',
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconComponent
            sx={{
              color: variant === 'error' ? '#DC2626' : '#2563EB',
              fontSize: 20,
            }}
          />
          <Typography
            variant="h6"
            component="span"
            sx={{
              fontFamily: 'Outfit',
              fontWeight: 600,
              fontSize: '18px',
              color: isDark ? '#F9FAFB' : '#1F2937',
            }}
          >
            {title}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={loading}
          sx={{
            color: isDark ? '#9CA3AF' : '#6B7280',
            '&:hover': {
              backgroundColor: isDark ? '#374151' : '#F3F4F6',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ pt: 2, backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }}
      >
        <DialogContentText
          id="confirmation-dialog-description"
          sx={{
            color: isDark ? '#E5E7EB' : '#6B7280',
            fontSize: '14px',
            fontFamily: 'Outfit',
            lineHeight: '20px',
          }}
        >
          {message}
        </DialogContentText>
        {error && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: isDark ? '#7F1D1D' : '#FEF2F2',
              border: isDark ? '1px solid #991B1B' : '1px solid #FECACA',
              borderRadius: '8px',
            }}
          >
            <Typography
              sx={{
                color: isDark ? '#FCA5A5' : '#DC2626',
                fontSize: '14px',
                fontFamily: 'Outfit',
                fontWeight: 500,
              }}
            >
              {error}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          pt: 2,
          gap: 2,
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            fontFamily: 'Outfit',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '20px',
            letterSpacing: '0px',
            borderRadius: '8px',
            padding: '10px 24px',
            border: isDark ? '1px solid #4B5563' : '1px solid #D1D5DB',
            color: isDark ? '#F9FAFB' : '#374151',
            backgroundColor: isDark ? '#374151' : '#FFFFFF',
            '&:hover': {
              backgroundColor: isDark ? '#4B5563' : '#F9FAFB',
              borderColor: isDark ? '#6B7280' : '#9CA3AF',
            },
            '&:disabled': {
              backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
              color: isDark ? '#6B7280' : '#9CA3AF',
              borderColor: isDark ? '#374151' : '#E5E7EB',
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          autoFocus
          sx={{
            fontFamily: 'Outfit',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '20px',
            letterSpacing: '0px',
            borderRadius: '8px',
            padding: '10px 24px',
            backgroundColor: variant === 'error' ? '#DC2626' : '#2563EB',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: variant === 'error' ? '#B91C1C' : '#1D4ED8',
              color: '#FFFFFF',
            },
            '&:disabled': {
              backgroundColor: isDark ? '#6B7280' : '#9CA3AF',
              color: '#FFFFFF',
            },
          }}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
