import React from 'react'
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
    >
      <DialogTitle
        id="confirmation-dialog-title"
        sx={{
          fontFamily: 'Outfit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconComponent
            sx={{
              color: config.color,
              fontSize: 24,
            }}
          />
          <Typography 
            variant="h6" 
            component="span"
            sx={{ fontFamily: 'Outfit' }}
          >
            {title}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={loading}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          id="confirmation-dialog-description"
          sx={{
            color: 'text.primary',
            fontSize: '1rem',
            fontFamily: 'Outfit',
          }}
        >
          {message}
        </DialogContentText>
        {error && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 1,
            }}
          >
            <Typography
              sx={{
                color: '#dc2626',
                fontSize: '0.875rem',
                fontFamily: 'Outfit',
                fontWeight: 500,
              }}
            >
              {error}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          color="primary"
          sx={{ 
            fontFamily: 'Outfit',
            height: '32px',
            fontSize: '14px',
            fontWeight: 500,
            textTransform: 'none'
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
            height: '32px',
            fontSize: '14px',
            fontWeight: 500,
            textTransform: 'none',
            backgroundColor: '#155DFC',
            color: '#FAFAF9',
            '&:hover': {
              backgroundColor: '#1d4ed8'
            },
            '&:disabled': {
              backgroundColor: '#9ca3af',
              color: '#f3f4f6'
            }
          }}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
