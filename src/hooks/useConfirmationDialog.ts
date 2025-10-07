import { useState, useCallback } from 'react'

export interface UseConfirmationDialogProps {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'warning' | 'error' | 'info' | 'success'
}

export interface UseConfirmationDialogReturn {
  isOpen: boolean
  isLoading: boolean
  dialogProps: {
    title: string
    message: string
    confirmText: string
    cancelText: string
    variant: 'warning' | 'error' | 'info' | 'success'
  }
  openDialog: (props?: Partial<UseConfirmationDialogProps>) => void
  closeDialog: () => void
  setLoading: (loading: boolean) => void
  confirm: (onConfirm: () => void | Promise<void>) => Promise<void>
}

export const useConfirmationDialog = (
  defaultProps?: UseConfirmationDialogProps
): UseConfirmationDialogReturn => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentProps, setCurrentProps] = useState<UseConfirmationDialogProps>({
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'warning',
    ...defaultProps,
  })

  const openDialog = useCallback((props?: Partial<UseConfirmationDialogProps>) => {
    setCurrentProps(prev => ({
      ...prev,
      ...props,
    }))
    setIsOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setIsOpen(false)
    setIsLoading(false)
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  const confirm = useCallback(async (onConfirm: () => void | Promise<void>) => {
    try {
      setIsLoading(true)
      await onConfirm()
      closeDialog()
    } catch (error) {
      console.error('Confirmation action failed:', error)
      setIsLoading(false)
      // Don't close dialog on error, let user retry or cancel
    }
  }, [closeDialog])

  return {
    isOpen,
    isLoading,
    dialogProps: {
      title: currentProps.title || 'Confirm Action',
      message: currentProps.message || 'Are you sure you want to proceed?',
      confirmText: currentProps.confirmText || 'Confirm',
      cancelText: currentProps.cancelText || 'Cancel',
      variant: currentProps.variant || 'warning',
    },
    openDialog,
    closeDialog,
    setLoading,
    confirm,
  }
}

export default useConfirmationDialog
