import React from 'react'
import { Download, Trash2 } from 'lucide-react'

import {
  DocumentItem,
  ApiDocumentResponse,
} from '../../DeveloperStepper/developerTypes'
import { buildPartnerService } from '../../../../services/api/buildPartnerService'
import {
  DocumentUploadConfig,
  DocumentService,
  TableColumn,
  DocumentAction,
} from '../types'
import { formatDate, downloadFile } from '../utils'

export const investorDocumentService: DocumentService<
  DocumentItem,
  ApiDocumentResponse
> = {
  getDocuments: async (investorId: string, page = 0, size = 20) => {
    return buildPartnerService.getBuildPartnerDocuments(
      investorId,
      'CAPITAL_PARTNER',
      page,
      size
    )
  },

  uploadDocument: async (
    file: File,
    investorId: string,
    documentType?: string
  ) => {
    return buildPartnerService.uploadBuildPartnerDocument(
      file,
      investorId,
      'CAPITAL_PARTNER',
      documentType
    )
  },
}

export const mapApiToInvestorDocumentItem = (
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

  const getClassification = (): string | undefined => {
    if (apiResponse.documentType?.settingValue) {
      return apiResponse.documentType.settingValue
    }

    if (apiResponse.documentTypeDTO?.languageTranslationId?.configValue) {
      return apiResponse.documentTypeDTO.languageTranslationId.configValue
    }

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

export const investorColumns: TableColumn<DocumentItem>[] = [
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
      if (document.classification) {
        return document.classification
      }
      return 'N/A'
    },
    width: '25%',
  },
]

export const investorActions: DocumentAction<DocumentItem>[] = [
  {
    key: 'download',
    label: 'Download',
    icon: <Download className="w-4 h-4" />,
    onClick: (document: DocumentItem) => {
      if (document.file) {
        downloadFile(document.file, document.name)
      } else if (document.url) {
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
    onClick: async (_document: DocumentItem) => {},
  },
]

export const createInvestorDocumentConfig = (
  investorId: string,
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
  const actions = [...investorActions]
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
    entityId: investorId,
    entityType: 'CAPITAL_PARTNER',
    documentService: investorDocumentService,
    mapApiToDocument: mapApiToInvestorDocumentItem,
    documentTypeSettingKey: 'INVESTOR_ID_TYPE',
    title: options?.title || 'Investor Documents',
    description:
      options?.description ||
      'This step is optional. You can upload investor-related documents or skip to continue.',
    isOptional: options?.isOptional ?? true,
    isReadOnly: options?.isReadOnly ?? false,
    columns: investorColumns,
    actions,
  }

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
