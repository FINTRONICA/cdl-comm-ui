import React from 'react'
import { useDeleteConfirmation } from '../../../store/confirmationDialogStore'
import { DocumentUploadConfig, BaseDocument, DocumentAction } from './types'

export interface DocumentUploadWithConfirmationProps<
  T extends BaseDocument = BaseDocument,
  ApiResponse = unknown,
> {
  config: DocumentUploadConfig<T, ApiResponse>
  onDeleteDocument?: (document: T) => Promise<void>
  children: (
    enhancedConfig: DocumentUploadConfig<T, ApiResponse>
  ) => React.ReactNode
}

export const DocumentUploadWithConfirmation = <
  T extends BaseDocument = BaseDocument,
  ApiResponse = unknown,
>({
  config,
  onDeleteDocument,
  children,
}: DocumentUploadWithConfirmationProps<T, ApiResponse>) => {
  const confirmDelete = useDeleteConfirmation()

  // Enhanced actions with confirmation dialog integration
  const enhancedActions: DocumentAction<T>[] = config.actions.map((action) => {
    if (action.key === 'delete' && action.requiresConfirmation) {
      return {
        ...action,
        onClick: async (document: T) => {
          // Get document name/identifier for display
          const documentName =
            (document as any).name ||
            (document as any).fileName ||
            (document as any).documentName ||
            'document'

          // Use the global delete confirmation dialog (same as build partner main page)
          confirmDelete({
            itemName: documentName,
            itemId: (document as any).id?.toString(),
            // Custom message if provided, otherwise use store's default message
            ...(action.confirmationMessage && {
              message: action.confirmationMessage,
            }),
            onConfirm: async () => {
              if (onDeleteDocument) {
                await onDeleteDocument(document)
              } else {
                // Fallback to original action if no custom delete handler
                await action.onClick(document)
              }
            },
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

  // No need to render a local ConfirmationDialog - using global one from layout
  return <>{children(enhancedConfig)}</>
}

export default DocumentUploadWithConfirmation
