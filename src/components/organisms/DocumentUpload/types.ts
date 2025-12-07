import { ReactNode } from 'react'

// Base document interface that can be extended
export interface BaseDocument {
  id: string
  name: string
  size: number
  type: string
  uploadDate: Date
  status: 'uploading' | 'completed' | 'error' | 'failed'
  progress?: number
  file?: File
  url?: string
}

// Configuration for table columns
export interface TableColumn<T = BaseDocument> {
  key: keyof T | string
  label: string
  render?: (value: any, document: T) => ReactNode
  sortable?: boolean
  width?: string
}

// Configuration for document actions
export interface DocumentAction<T = BaseDocument> {
  key: string
  label: string
  icon?: ReactNode
  onClick: (document: T) => void | Promise<void>
  disabled?: (document: T) => boolean
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  requiresConfirmation?: boolean
  confirmationMessage?: string
}

// Upload configuration
export interface UploadConfig {
  maxFileSize?: number // in bytes
  allowedTypes?: string[]
  allowedExtensions?: string[]
  multiple?: boolean
  accept?: string
}

// API service interface for document operations
export interface DocumentService<T = BaseDocument, ApiResponse = unknown> {
  getDocuments: (
    entityId: string,
    page?: number,
    size?: number
  ) => Promise<{
    content: ApiResponse[]
    page: {
      size: number
      number: number
      totalElements: number
      totalPages: number
    }
  }>
  uploadDocument: (
    file: File,
    entityId: string,
    documentType?: string
  ) => Promise<ApiResponse>
  deleteDocument?: (documentId: string) => Promise<void>
  downloadDocument?: (document: T) => Promise<void>
}

// Configuration for the DocumentUpload component
export interface DocumentUploadConfig<T = BaseDocument, ApiResponse = unknown> {
  // Entity configuration
  entityId: string
  entityType: string

  // Service configuration
  documentService: DocumentService<T, ApiResponse>
  mapApiToDocument: (apiResponse: ApiResponse) => T

  // Document type configuration
  documentTypeSettingKey?: string // Setting key for fetching document types (e.g., 'INVESTOR_ID_TYPE', 'PROJECT_DOC_TYPE')

  // UI configuration
  title?: string
  description?: string
  isOptional?: boolean
  isReadOnly?: boolean

  // Table configuration
  columns: TableColumn<T>[]
  actions: DocumentAction<T>[]

  // Upload configuration
  uploadConfig?: UploadConfig

  // Callbacks
  onDocumentsChange?: (documents: T[]) => void
  onUploadSuccess?: (documents: T[]) => void
  onUploadError?: (error: string) => void

  // Styling
  cardProps?: Record<string, unknown>
  tableProps?: Record<string, unknown>
}

// Default upload configuration
export const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  maxFileSize: 25 * 1024 * 1024, // 25MB
  allowedTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
  ],
  allowedExtensions: [
    '.pdf',
    '.docx',
    '.xlsx',
    '.jpg',
    '.jpeg',
    '.png',
  ],
  multiple: true,
  accept: '.pdf,.docx,.xlsx,.jpg,.jpeg,.png',
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean
  error?: string
}

// File validation function type
export type FileValidator = (
  file: File,
  config: UploadConfig
) => ValidationResult
