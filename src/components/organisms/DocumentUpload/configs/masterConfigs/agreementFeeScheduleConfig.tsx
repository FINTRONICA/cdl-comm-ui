import React from 'react'

import {
  DocumentItem,
  ApiDocumentResponse,
} from '../../DeveloperStepper/developerTypes'
import { agreementFeeScheduleService } from '@/services/api/masterApi/Entitie/agreementFeeScheduleService'
import {
  DocumentUploadConfig,
  DocumentService,
  TableColumn,
  DocumentAction,
} from '../../types'
import { formatDate, downloadFile } from '../../utils'
import { Download, Trash2 } from 'lucide-react'

// Service adapter for agreement fee schedule documents
export const agreementFeeScheduleDocumentService: DocumentService<
  DocumentItem,
  ApiDocumentResponse
> = {
  getDocuments: async (agreementFeeScheduleId: string, page = 0, size = 20) => {
    return agreementFeeScheduleService.getAgreementFeeScheduleDocuments(
      agreementFeeScheduleId,
      'AGREEMENT_FEE_SCHEDULE',
      page,
      size
    )
  },

  uploadDocument: async (
    file: File,
    agreementFeeScheduleId: string,
    documentType?: string
  ) => {
    return agreementFeeScheduleService.uploadAgreementFeeScheduleDocument(
      file,
      agreementFeeScheduleId,
      'AGREEMENT_FEE_SCHEDULE',
      documentType
    )
  },
}

// Mapping function from API response to DocumentItem
export const mapApiToAgreementFeeScheduleDocumentItem = (
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

// Table columns configuration for agreement fee schedule documents
export const agreementFeeScheduleColumns: TableColumn<DocumentItem>[] = [
  {
    key: 'name',
    label: 'Document Title',
    width: '40%',
  },
  {
    key: 'uploadDate',
    label: 'Date of Submission',
    render: (value: Date) => formatDate(value),
    width: '25%',
  },
  {
    key: 'classification',
    label: 'Document Classification',
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

// Document actions configuration for agreement fee schedule documents
export const agreementFeeScheduleActions: DocumentAction<DocumentItem>[] = [
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
    onClick: async (document: DocumentItem) => {
      // Note: This would need to be implemented in the parent component
      // as it requires updating the local state
    },
  },
]

// Factory function to create agreement fee schedule document upload configuration
export const createAgreementFeeScheduleDocumentConfig = (
  agreementFeeScheduleId: string,
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
  const actions = [...agreementFeeScheduleActions]
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
    entityId: agreementFeeScheduleId,
    entityType: 'AGREEMENT_FEE_SCHEDULE',
    documentService: agreementFeeScheduleDocumentService,
    mapApiToDocument: mapApiToAgreementFeeScheduleDocumentItem,
    documentTypeSettingKey: 'INVESTOR_ID_TYPE', // Setting key for agreement fee schedule document types (using standard document type key)
    title: options?.title || 'Agreement Fee Schedule Documents',
    description:
      options?.description ||
      'This step is optional. You can upload agreement fee schedule-related documents or skip to continue.',
    isOptional: options?.isOptional ?? true,
    isReadOnly: options?.isReadOnly ?? false,
    columns: agreementFeeScheduleColumns,
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


