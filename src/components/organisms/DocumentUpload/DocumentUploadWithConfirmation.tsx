import React from 'react'
import { ConfirmationDialog } from '../../molecules/ConfirmationDialog'
import { useConfirmationDialog } from '../../../hooks/useConfirmationDialog'
import { DocumentUploadConfig, BaseDocument, DocumentAction } from './types'

export interface DocumentUploadWithConfirmationProps<
  T extends BaseDocument = BaseDocument,
  ApiResponse = unknown
> {
  config: DocumentUploadConfig<T, ApiResponse>
  onDeleteDocument?: (document: T) => Promise<void>
  children: (enhancedConfig: DocumentUploadConfig<T, ApiResponse>) => React.ReactNode
}

export const DocumentUploadWithConfirmation = <
  T extends BaseDocument = BaseDocument,
  ApiResponse = unknown
>({
  config,
  onDeleteDocument,
  children,
}: DocumentUploadWithConfirmationProps<T, ApiResponse>) => {
  const confirmationDialog = useConfirmationDialog({
    title: 'Delete Document',
    message: 'Are you sure you want to delete this document? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'error',
  })

  // Enhanced actions with confirmation dialog integration
  const enhancedActions: DocumentAction<T>[] = config.actions.map((action) => {
    if (action.key === 'delete' && action.requiresConfirmation) {
      return {
        ...action,
        onClick: async (document: T) => {
          confirmationDialog.openDialog({
            title: 'Delete Document',
            message: action.confirmationMessage || 'Are you sure you want to delete this document? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'error',
          })

          // Store the document and action for confirmation
          await confirmationDialog.confirm(async () => {
            if (onDeleteDocument) {
              await onDeleteDocument(document)
            } else {
              // Fallback to original action if no custom delete handler
              await action.onClick(document)
            }
          })
        },
      }
    }
    return action
  })

  const enhancedConfig: DocumentUploadConfig<T, ApiResponse> = {
    ...config,
    actions: enhancedActions,
  }

  return (
    <>
      {children(enhancedConfig)}
      <ConfirmationDialog
        open={confirmationDialog.isOpen}
        onClose={confirmationDialog.closeDialog}
        onConfirm={async () => {
          // This will be handled by the confirm method in the onClick
        }}
        title={confirmationDialog.dialogProps.title}
        message={confirmationDialog.dialogProps.message}
        confirmText={confirmationDialog.dialogProps.confirmText}
        cancelText={confirmationDialog.dialogProps.cancelText}
        variant={confirmationDialog.dialogProps.variant}
        loading={confirmationDialog.isLoading}
      />
    </>
  )
}

export default DocumentUploadWithConfirmation
