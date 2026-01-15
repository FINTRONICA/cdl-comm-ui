import React from 'react'

import {
  DocumentItem,
  ApiDocumentResponse,
} from "../../../Master/PartyStepper/partyTypes";
import { escrowAccountService } from '@/services/api/masterApi/Customer/escrowAccountService'
import {
  DocumentUploadConfig,
  DocumentService,
  TableColumn,
  DocumentAction,
} from '../../types'
import { formatDate, downloadFile } from '../../utils'
import { Download, Trash2 } from 'lucide-react'
// Service adapter for escrow account documents
export const escrowAccountDocumentService: DocumentService<
  DocumentItem,
  ApiDocumentResponse
> = {
  getDocuments: async (escrowAccountId: string, page = 0, size = 20) => {
    return escrowAccountService.getEscrowAccountDocuments(
      escrowAccountId,
      'ESCROW_ACCOUNT',
      page,
      size
    )
  },

  uploadDocument: async (
    file: File,
    escrowAccountId: string,
    documentType?: string
  ) => {
    return escrowAccountService.uploadEscrowAccountDocument(
      file,
      escrowAccountId,
      'ESCROW_ACCOUNT',
      documentType
    )
  },
}

// Mapping function from API response to DocumentItem
export const mapApiToEscrowAccountDocumentItem = (
  apiResponse: ApiDocumentResponse
): DocumentItem => {
  const getFileTypeFromName = (filename: string): string => {
    if (!filename) return 'application/octet-stream'

    const extension = filename.toLowerCase().split('.').pop()
    const typeMap: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
    }

    return typeMap[extension || ''] || 'application/octet-stream'
  }

  // Extract classification from documentType or documentTypeDTO
  const getClassification = (): string | undefined => {
    // Check for new upload response format (documentType)
    if (apiResponse.documentType?.settingValue) {
      return apiResponse.documentType.settingValue
    }

    // Check for get response format (documentTypeDTO)
    if (apiResponse.documentTypeDTO?.languageTranslationId?.configValue) {
      return apiResponse.documentTypeDTO.languageTranslationId.configValue
    }

    // Fallback to settingValue from documentTypeDTO
    if (apiResponse.documentTypeDTO?.settingValue) {
      return apiResponse.documentTypeDTO.settingValue
    }

    return undefined
  }

  const documentItem: DocumentItem = {
    id:
      apiResponse.id?.toString() ||
      `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: apiResponse.documentName || 'Unknown Document',
    size: apiResponse.documentSize
      ? parseInt(apiResponse.documentSize.replace(' bytes', ''))
      : 0,
    type:
      getFileTypeFromName(apiResponse.documentName) ||
      'application/octet-stream',
    uploadDate: apiResponse.uploadDate
      ? new Date(apiResponse.uploadDate)
      : new Date(),
    status: 'completed' as const,
    url: apiResponse.location,
  }

  const classification = getClassification()
  if (classification) {
    documentItem.classification = classification
  }

  return documentItem
}

// Table columns configuration for escrow account documents
export const escrowAccountColumns: TableColumn<DocumentItem>[] = [
  {
    key: 'name',
    label: 'Document Name',
    width: '40%',
  },
  {
    key: 'uploadDate',
    label: 'Upload Date',
    render: (value: Date) => formatDate(value),
    width: '25%',
  },
  {
    key: 'classification',
    label: 'Document Type',
    render: (_value: unknown, document: DocumentItem) => {
      // Check if document has classification data from API
      if (document.classification) {
        return document.classification
      }
      // Fallback to N/A for documents without classification
      return 'N/A'
    },
    width: '25%',
  },
]

// Document actions configuration for escrow account documents
export const escrowAccountActions: DocumentAction<DocumentItem>[] = [
  {
    key: 'download',
    label: 'Download',
    icon: <Download className="w-4 h-4" />,
    onClick: (document: DocumentItem) => {
      if (document.file) {
        downloadFile(document.file, document.name)
      } else if (document.url) {
        // For server-hosted files, create a download link
        const a = window.document.createElement('a')
        a.href = document.url
        a.download = document.name
        window.document.body.appendChild(a)
        a.click()
        window.document.body.removeChild(a)
      }
    },
    disabled: (document: DocumentItem) => !document.file && !document.url,
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: <Trash2 className="w-4 h-4" />,
    color: 'error' as const,
    requiresConfirmation: true,
    confirmationMessage:
      'Are you sure you want to delete this document? This action cannot be undone.',
    onClick: async (_document: DocumentItem) => {
      // Note: This would need to be implemented in the parent component
      // as it requires updating the local state
    },
  },
]

// Factory function to create escrow account document upload configuration
export const createEscrowAccountDocumentConfig = (
  escrowAccountId: string,
  options?: {
    title?: string
    description?: string
    isOptional?: boolean
    isReadOnly?: boolean
    onDocumentsChange?: (documents: DocumentItem[]) => void
    onUploadSuccess?: (documents: DocumentItem[]) => void
    onUploadError?: (error: string) => void
    onDelete?: (document: DocumentItem) => void
  }
): DocumentUploadConfig<DocumentItem, ApiDocumentResponse> => {
  // Create actions with custom delete handler if provided
  const actions = [...escrowAccountActions]
  if (options?.onDelete) {
    const deleteActionIndex = actions.findIndex(
      (action) => action.key === 'delete'
    )
    if (deleteActionIndex !== -1) {
      actions[deleteActionIndex] = {
        ...actions[deleteActionIndex],
        onClick: options.onDelete,
        key: 'delete',
        label: 'Delete',
      }
    }
  }

  const config: DocumentUploadConfig<DocumentItem, ApiDocumentResponse> = {
    entityId: escrowAccountId,
    entityType: 'ESCROW_ACCOUNT',
    documentService: escrowAccountDocumentService,
    mapApiToDocument: mapApiToEscrowAccountDocumentItem,
    documentTypeSettingKey: 'ESCROW_ACCOUNT_ID_TYPE',
    title: options?.title || 'Escrow Account Documents',
    description:
      options?.description ||
      'This step is optional. You can upload escrow account-related documents or skip to continue.',
    isOptional: options?.isOptional ?? true,
    isReadOnly: options?.isReadOnly ?? false,
    columns: escrowAccountColumns,
    actions,
  }

  // Add optional callbacks only if they exist
  if (options?.onDocumentsChange) {
    config.onDocumentsChange = options.onDocumentsChange
  }
  if (options?.onUploadSuccess) {
    config.onUploadSuccess = options.onUploadSuccess
  }
  if (options?.onUploadError) {
    config.onUploadError = options.onUploadError
  }

  return config
}

