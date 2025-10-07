'use client'

import React from 'react'
import { ConfirmationDialog } from '../molecules/ConfirmationDialog'
import { useConfirmationDialogStore } from '../../store/confirmationDialogStore'

export const GlobalConfirmationDialog: React.FC = () => {
  const {
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    variant,
    isLoading,
    error,
    closeDialog,
    confirm,
  } = useConfirmationDialogStore()

  return (
    <ConfirmationDialog
      open={isOpen}
      onClose={closeDialog}
      onConfirm={confirm}
      title={title}
      message={error || message}
      confirmText={confirmText}
      cancelText={cancelText}
      variant={variant}
      loading={isLoading}
      error={error}
    />
  )
}

export default GlobalConfirmationDialog
