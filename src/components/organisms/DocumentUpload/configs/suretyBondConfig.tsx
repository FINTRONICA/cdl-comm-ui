import React from 'react'

import {
  DocumentItem,
  ApiDocumentResponse,
} from '../../DeveloperStepper/developerTypes'
import { buildPartnerService } from '@/services/api/buildPartnerService'
import {
  DocumentUploadConfig,
  DocumentService,
  DocumentAction,
} from '../types'
import {
  mapApiToDocumentItem,
  buildPartnerColumns,
  buildPartnerActions,
} from './buildPartnerConfig'

// Service adapter for surety bond documents using SURETY_BOND module
export const suretyBondDocumentService: DocumentService<
  DocumentItem,
  ApiDocumentResponse
> = {
  getDocuments: async (suretyBondId: string, page = 0, size = 20) => {
    return buildPartnerService.getBuildPartnerDocuments(
      suretyBondId,
      'SURETY_BOND',
      page,
      size
    )
  },

  uploadDocument: async (
    file: File,
    suretyBondId: string,
    documentType?: string
  ) => {
    return buildPartnerService.uploadBuildPartnerDocument(
      file,
      suretyBondId,
      'SURETY_BOND',
      documentType
    )
  },
}

// Factory function to create surety bond document upload configuration
export const createSuretyBondDocumentConfig = (
  suretyBondId: string,
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
  const actions = [...buildPartnerActions]
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
    entityId: suretyBondId,
    entityType: 'SURETY_BOND',
    documentService: suretyBondDocumentService,
    mapApiToDocument: mapApiToDocumentItem,
    documentTypeSettingKey: 'INVESTOR_ID_TYPE',
    title: options?.title || 'Surety Bond Documents',
    description:
      options?.description ||
      'Upload supporting documents for the surety bond or skip to continue.',
    isOptional: options?.isOptional ?? true,
    isReadOnly: options?.isReadOnly ?? false,
    columns: buildPartnerColumns,
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

