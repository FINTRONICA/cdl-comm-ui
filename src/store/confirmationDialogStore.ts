import { create } from 'zustand'

export interface ConfirmationDialogState {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  variant: 'warning' | 'error' | 'info' | 'success'
  isLoading: boolean
  error: string | null
  onConfirm: (() => void | Promise<void>) | null
  onCancel: (() => void) | null
}

export interface ConfirmationDialogConfig {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'warning' | 'error' | 'info' | 'success'
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

export interface ConfirmationDialogActions {
  openDialog: (config: ConfirmationDialogConfig) => void
  closeDialog: () => void
  setLoading: (loading: boolean) => void
  confirm: () => Promise<void>
}

export type ConfirmationDialogStore = ConfirmationDialogState & ConfirmationDialogActions

const initialState: ConfirmationDialogState = {
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'warning',
  isLoading: false,
  error: null,
  onConfirm: null,
  onCancel: null,
}

export const useConfirmationDialogStore = create<ConfirmationDialogStore>((set, get) => ({
  ...initialState,

  openDialog: (config) => {
    set({
      isOpen: true,
      title: config.title || 'Confirm Action',
      message: config.message || 'Are you sure you want to proceed?',
      confirmText: config.confirmText || 'Confirm',
      cancelText: config.cancelText || 'Cancel',
      variant: config.variant || 'warning',
      onConfirm: config.onConfirm,
      onCancel: config.onCancel || null,
      isLoading: false,
      error: null,
    })
  },

  closeDialog: () => {
    const state = get()
    if (state.onCancel) {
      state.onCancel()
    }
    set(initialState)
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  confirm: async () => {
    const state = get()
    if (!state.onConfirm) return

    try {
      set({ isLoading: true, error: null })
      await state.onConfirm()
      set(initialState) // Close dialog on success
    } catch (error) {
      console.error('Confirmation action failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Operation failed'
      set({ 
        isLoading: false, 
        error: errorMessage,
        title: 'Delete Failed',
        confirmText: 'Try Again'
      })
    }
  },
}))

// Convenience function for common delete confirmations with full configurability
export const useDeleteConfirmation = () => {
  const openDialog = useConfirmationDialogStore((state) => state.openDialog)

  return (config: {
    itemName?: string
    itemId?: string
    onConfirm: () => void | Promise<void>
    onCancel?: () => void
    // All dialog properties are overridable
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
    variant?: 'warning' | 'error' | 'info' | 'success'
    // Success notification options
    successTitle?: string
    successMessage?: string
    showSuccessNotification?: boolean
  }) => {
    // Default delete message, but fully overridable
    const defaultMessage = config.itemName 
      ? `Are you sure you want to delete ${config.itemName}${config.itemId ? ` (ID: ${config.itemId})` : ''}?\n\nThis action cannot be undone.`
      : 'Are you sure you want to delete this item?\n\nThis action cannot be undone.'

    // Default success message
    const defaultSuccessTitle = config.itemName 
      ? `${config.itemName.charAt(0).toUpperCase() + config.itemName.slice(1)} deleted successfully`
      : 'Item deleted successfully'

    openDialog({
      title: config.title || 'Delete Confirmation',
      message: config.message || defaultMessage,
      confirmText: config.confirmText || 'Delete',
      cancelText: config.cancelText || 'Cancel',
      variant: config.variant || 'error',
      onConfirm: async () => {
        await config.onConfirm()
        
        // Show success notification if enabled (default: true)
        if (config.showSuccessNotification !== false) {
          // Dynamically import to avoid circular dependencies
          const { useNotificationStore } = await import('./notificationStore')
          const { addNotification } = useNotificationStore.getState()
          
          addNotification({
            type: 'success',
            title: config.successTitle || defaultSuccessTitle,
            ...(config.successMessage && { message: config.successMessage }),
          })
        }
      },
      ...(config.onCancel && { onCancel: config.onCancel }),
    })
  }
}

// Convenience function for general confirmations
export const useGeneralConfirmation = () => {
  const openDialog = useConfirmationDialogStore((state) => state.openDialog)

  return (config: ConfirmationDialogConfig) => {
    openDialog(config)
  }
}

export default useConfirmationDialogStore
