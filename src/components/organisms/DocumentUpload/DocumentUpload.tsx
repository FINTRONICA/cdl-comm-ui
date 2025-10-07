import React, { useRef, useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Snackbar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material'
import { TablePagination } from '../../molecules/TablePagination/TablePagination'
import { FileUploadOutlined as FileUploadOutlinedIcon } from '@mui/icons-material'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import {
  BaseDocument,
  DocumentUploadConfig,
  DEFAULT_UPLOAD_CONFIG,
} from './types'
import {
  validateFile,
  generateDocumentId,
  formatDate,
  isDuplicateFile,
} from './utils'
import {
  applicationSettingService,
  DropdownOption,
} from '../../../services/api/applicationSettingService'
import { apiClient } from '../../../lib/apiClient'
import { API_ENDPOINTS } from '../../../constants/apiEndpoints'

interface DocumentUploadProps<
  T extends BaseDocument = BaseDocument,
  ApiResponse = unknown,
> {
  config: DocumentUploadConfig<T, ApiResponse>
  formFieldName?: string
}

const DocumentUpload = <
  T extends BaseDocument = BaseDocument,
  ApiResponse = unknown,
>({
  config,
  formFieldName = 'documents',
}: DocumentUploadProps<T, ApiResponse>) => {
  const { setValue, watch } = useFormContext()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State management
  const [uploadedDocuments, setUploadedDocuments] = useState<T[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  const [documentTypeDialog, setDocumentTypeDialog] = useState<{
    open: boolean
    files: File[]
    selectedDocumentType: string
    documentTypes: DropdownOption[]
    loading: boolean
  }>({
    open: false,
    files: [],
    selectedDocumentType: '',
    documentTypes: [],
    loading: false,
  })

  const existingDocuments = watch(formFieldName) || []

  const uploadConfig = { ...DEFAULT_UPLOAD_CONFIG, ...config.uploadConfig }

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setCurrentPage(1) // Reset to first page when changing rows per page
  }

  // Calculate pagination values
  const startItem = totalDocuments > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0
  const endItem = Math.min(currentPage * rowsPerPage, totalDocuments)

  useEffect(() => {
    const loadExistingDocuments = async () => {
      try {
        setIsLoadingDocuments(true)
        const response = await config.documentService.getDocuments(
          config.entityId,
          currentPage - 1, // API expects 0-based page numbers
          rowsPerPage
        )
        const mappedDocuments: T[] = response.content.map(
          config.mapApiToDocument
        )

        setUploadedDocuments(mappedDocuments)
        setTotalPages(response.page.totalPages)
        setTotalDocuments(response.page.totalElements)
        setValue(formFieldName, mappedDocuments)
      } catch (error) {
        if (!config.isOptional) {
          setUploadError('Failed to load existing documents')
        }
      } finally {
        setIsLoadingDocuments(false)
      }
    }

    if (config.entityId) {
      loadExistingDocuments()
    }
  }, [config.entityId, currentPage, rowsPerPage, setValue, formFieldName])

  // Initialize documents from form data (fallback)
  useEffect(() => {
    if (existingDocuments.length > 0 && uploadedDocuments.length === 0) {
      setUploadedDocuments(existingDocuments)
    }
  }, [existingDocuments, uploadedDocuments.length])

  useEffect(() => {
    const successfulDocuments = uploadedDocuments.filter(
      (doc) => doc.status !== 'failed'
    )
    setValue(formFieldName, successfulDocuments)
    if (config.onDocumentsChange) {
      config.onDocumentsChange(successfulDocuments)
    }
  }, [uploadedDocuments, setValue, formFieldName])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (files.length === 0) return

    setDocumentTypeDialog((prev) => ({
      ...prev,
      open: true,
      files,
      loading: true,
    }))

    try {
      const settingKey = config.documentTypeSettingKey || 'INVESTOR_ID_TYPE'
      const documentTypes =
        await applicationSettingService.getDropdownOptionsByKey(settingKey)
      setDocumentTypeDialog((prev) => ({
        ...prev,
        documentTypes,
        loading: false,
      }))
    } catch (error) {
      setDocumentTypeDialog((prev) => ({
        ...prev,
        documentTypes: [{ id: 0, value: 'CP_OTHER', label: 'Other' }],
        loading: false,
      }))
    }
  }

  const handleDocumentTypeConfirm = async () => {
    const { files, selectedDocumentType } = documentTypeDialog

    if (!selectedDocumentType) {
      setUploadError('Please select a document type')
      return
    }

    setDocumentTypeDialog((prev) => ({ ...prev, open: false }))
    setIsUploading(true)
    setUploadError(null)

    try {
      const newDocuments: T[] = []

      for (const file of files) {
        const validationResult = validateFile(file, uploadConfig)
        if (!validationResult.isValid) {
          setUploadError(validationResult.error || 'File validation failed')
          continue
        }
        const existingFiles = uploadedDocuments
          .map((doc) => doc.file)
          .filter(Boolean) as File[]
        if (isDuplicateFile(file, existingFiles)) {
          setUploadError(`File "${file.name}" already exists`)
          continue
        }

        const newDocument: T = {
          id: generateDocumentId(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadDate: new Date(),
          status: 'uploading',
          file: file,
        } as T

        newDocuments.push(newDocument)
      }

      if (newDocuments.length > 0) {
        setUploadedDocuments((prev) => [...prev, ...newDocuments])

        let successfulUploads = 0

        for (const document of newDocuments) {
          try {
            const response = await config.documentService.uploadDocument(
              document.file!,
              config.entityId,
              selectedDocumentType
            )

            const updatedDocument = config.mapApiToDocument(response)
            setUploadedDocuments((prev) =>
              prev.map((doc) =>
                doc.id === document.id ? updatedDocument : doc
              )
            )
            successfulUploads++
          } catch (error) {
            setUploadedDocuments((prev) => {
              const filtered = prev.filter((doc) => doc.id !== document.id)

              setValue(formFieldName, filtered)
              return filtered
            })
            const errorMessage = `Failed to upload ${document.name}. Please try again.`
            setUploadError(errorMessage)
            if (config.onUploadError) {
              config.onUploadError(errorMessage)
            }
          }
        }

        if (successfulUploads > 0) {
          const successMessage = `${successfulUploads} document(s) uploaded successfully`
          setUploadSuccess(successMessage)

          if (config.onUploadSuccess) {
            config.onUploadSuccess(uploadedDocuments)
          }

          try {
            const refreshedResponse = await config.documentService.getDocuments(
              config.entityId,
              currentPage - 1,
              rowsPerPage
            )
            const mappedDocuments: T[] = refreshedResponse.content.map(
              config.mapApiToDocument
            )

            setUploadedDocuments(mappedDocuments)
            setTotalPages(refreshedResponse.page.totalPages)
            setTotalDocuments(refreshedResponse.page.totalElements)
            setValue(formFieldName, mappedDocuments)
          } catch (refreshError) {}
        }
      }
    } catch (error) {
      const errorMessage = 'Failed to upload documents. Please try again.'
      setUploadError(errorMessage)
      if (config.onUploadError) {
        config.onUploadError(errorMessage)
      }
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDownload = async (doc: T) => {
    if (!doc.id) {
      setUploadError('Cannot download: No document ID found')
      return
    }

    try {
      const response = await apiClient.downloadFile(
        API_ENDPOINTS.REAL_ESTATE_DOCUMENT.DOWNLOAD(doc.id),
        {
          headers: {
            Accept: '*/*',
          },
        }
      )

      const contentDisposition = response.headers['content-disposition']
      let fileName = doc.name || 'document'

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        )
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '')
        }
      }

      const blob = response.data
      const blobUrl = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000)

      setUploadSuccess('Document downloaded successfully')
    } catch (error) {
      setUploadError('Failed to download document. Please try again.')
    }
  }

  const handleActionClick = async (
    action: (typeof config.actions)[0],
    document: T
  ) => {
    if (action.requiresConfirmation) {
      setConfirmDialog({
        open: true,
        title: `Confirm ${action.label}`,
        message:
          action.confirmationMessage ||
          `Are you sure you want to ${action.label.toLowerCase()} this document?`,
        onConfirm: async () => {
          try {
            // If it's a delete action, call the DELETE API
            if (action.key === 'delete' && document.id) {
              const deleteUrl = API_ENDPOINTS.REAL_ESTATE_DOCUMENT.DELETE(
                document.id
              )
              await apiClient.delete(deleteUrl)

              // Remove the document from the local state
              setUploadedDocuments((prev) =>
                prev.filter((doc) => doc.id !== document.id)
              )

              // Update form value
              const updatedDocuments = uploadedDocuments.filter(
                (doc) => doc.id !== document.id
              )
              setValue(formFieldName, updatedDocuments)

              // Show success message
              setUploadSuccess('Document deleted successfully')

              // Call the original action handler if it exists
              if (action.onClick) {
                await action.onClick(document)
              }
            } else if (action.key === 'download') {
              // Handle download action
              await handleDownload(document)

              // Call the original action handler if it exists
              if (action.onClick) {
                await action.onClick(document)
              }
            } else {
              // For other actions, call the original action handler
              await action.onClick(document)
            }
          } catch (error) {
            const errorMessage = `Failed to ${action.label.toLowerCase()} document. Please try again.`
            setUploadError(errorMessage)
          } finally {
            setConfirmDialog((prev) => ({ ...prev, open: false }))
          }
        },
      })
    } else {
      try {
        // If it's a delete action, call the DELETE API
        if (action.key === 'delete' && document.id) {
          const deleteUrl = API_ENDPOINTS.REAL_ESTATE_DOCUMENT.DELETE(
            document.id
          )
          await apiClient.delete(deleteUrl)

          // Remove the document from the local state
          setUploadedDocuments((prev) =>
            prev.filter((doc) => doc.id !== document.id)
          )

          // Update form value
          const updatedDocuments = uploadedDocuments.filter(
            (doc) => doc.id !== document.id
          )
          setValue(formFieldName, updatedDocuments)

          // Show success message
          setUploadSuccess('Document deleted successfully')

          // Call the original action handler if it exists
          if (action.onClick) {
            await action.onClick(document)
          }
        } else if (action.key === 'download') {
          // Handle download action
          await handleDownload(document)

          // Call the original action handler if it exists
          if (action.onClick) {
            await action.onClick(document)
          }
        } else {
          // For other actions, call the original action handler
          await action.onClick(document)
        }
      } catch (error) {
        const errorMessage = `Failed to ${action.label.toLowerCase()} document. Please try again.`
        setUploadError(errorMessage)
      }
    }
  }

  const renderCellValue = (column: (typeof config.columns)[0], document: T) => {
    const value = document[column.key as keyof T]

    if (column.render) {
      return column.render(value, document)
    }

    if (column.key === 'uploadDate' && value instanceof Date) {
      return formatDate(value)
    }

    return value?.toString() || ''
  }

  return (
    <Card
      sx={{
        boxShadow: 'none',
        backgroundColor: '#FFFFFFBF',
        width: '84%',
        margin: '0 auto',
        ...config.cardProps,
      }}
    >
      <CardContent>
        {config.isOptional && config.description && (
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              color: '#6A7282',
              mb: 3,
              textAlign: 'center',
            }}
          >
            {config.description}
          </Typography>
        )}

        <Box mt={6}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={3}
          >
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '18px',
                lineHeight: '28px',
                letterSpacing: '0.15px',
                verticalAlign: 'middle',
              }}
            >
              {config.title || 'Document Management'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<FileUploadOutlinedIcon />}
              onClick={handleUploadClick}
              disabled={isUploading}
              sx={{
                textTransform: 'none',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '0px',
              }}
            >
              {isUploading ? 'Uploading...' : 'Upload Documents'}
            </Button>
          </Box>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            multiple={uploadConfig.multiple}
            accept={uploadConfig.accept}
          />

          {/* Progress Bar */}
          {isUploading && (
            <Box mb={3}>
              <LinearProgress />
              <Typography
                variant="caption"
                sx={{ mt: 1, display: 'block', textAlign: 'center' }}
              >
                Uploading documents...
              </Typography>
            </Box>
          )}

          <TableContainer
            component={Paper}
            sx={{ mt: 2, ...config.tableProps }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  {config.columns.map((column) => (
                    <TableCell
                      key={column.key.toString()}
                      sx={{
                        fontFamily: 'Outfit',
                        fontWeight: 'normal',
                        width: column.width,
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{ fontFamily: 'Outfit', fontWeight: 'normal' }}
                  >
                    Available Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingDocuments ? (
                  <TableRow>
                    <TableCell
                      colSpan={config.columns.length + 1}
                      align="center"
                      sx={{ fontFamily: 'Outfit', fontWeight: 'normal' }}
                    >
                      <LinearProgress sx={{ width: '100%', mb: 2 }} />
                      Loading documents...
                    </TableCell>
                  </TableRow>
                ) : uploadedDocuments.filter((doc) => doc.status !== 'failed')
                    .length > 0 ? (
                  uploadedDocuments
                    .filter((doc) => doc.status !== 'failed')
                    .map((doc, index) => (
                      <TableRow key={doc.id || index}>
                        {config.columns.map((column) => (
                          <TableCell
                            key={column.key.toString()}
                            sx={{ fontFamily: 'Outfit', fontWeight: 'normal' }}
                          >
                            {renderCellValue(column, doc)}
                          </TableCell>
                        ))}
                        <TableCell
                          sx={{ fontFamily: 'Outfit', fontWeight: 'normal' }}
                        >
                          <div className="flex items-center gap-2">
                            {config.actions.map((action) => {
                              const isDisabled =
                                doc.status === 'uploading' ||
                                (action.disabled?.(doc) ?? false)

                              const getButtonClass = () => {
                                if (isDisabled) {
                                  return 'p-1 transition-colors rounded cursor-not-allowed opacity-50'
                                }

                                if (action.color === 'error') {
                                  return 'p-1 transition-colors rounded cursor-pointer hover:bg-red-50'
                                }

                                if (action.key === 'edit') {
                                  return 'p-1 transition-colors rounded cursor-pointer hover:bg-blue-50'
                                }

                                return 'p-1 transition-colors rounded cursor-pointer hover:bg-gray-100'
                              }

                              const getIconClass = () => {
                                if (isDisabled) {
                                  return 'w-4 h-4 text-gray-300'
                                }

                                if (action.color === 'error') {
                                  return 'w-4 h-4 text-red-600 hover:text-red-800'
                                }

                                if (action.key === 'edit') {
                                  return 'w-4 h-4 text-blue-600 hover:text-blue-800'
                                }

                                return 'w-4 h-4 text-gray-500 hover:text-gray-700'
                              }

                              return (
                                <button
                                  key={action.key}
                                  onClick={() => handleActionClick(action, doc)}
                                  disabled={isDisabled}
                                  className={getButtonClass()}
                                  title={action.label}
                                  data-row-action={action.key}
                                >
                                  {action.icon ? (
                                    <div className={getIconClass()}>
                                      {action.icon}
                                    </div>
                                  ) : (
                                    <>
                                      {action.key === 'view' && (
                                        <Eye className={getIconClass()} />
                                      )}
                                      {action.key === 'edit' && (
                                        <Pencil className={getIconClass()} />
                                      )}
                                      {action.key === 'delete' && (
                                        <Trash2 className={getIconClass()} />
                                      )}
                                    </>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell
                      sx={{ fontFamily: 'Outfit', fontWeight: 'normal' }}
                      colSpan={config.columns.length + 1}
                      align="center"
                    >
                      No documents uploaded
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalDocuments > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRows={totalDocuments}
              rowsPerPage={rowsPerPage}
              startItem={startItem}
              endItem={endItem}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              className="border-t border-gray-200"
            />
          )}
        </Box>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        >
          <DialogTitle>{confirmDialog.title}</DialogTitle>
          <DialogContent>
            <Typography>{confirmDialog.message}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setConfirmDialog((prev) => ({ ...prev, open: false }))
              }
              sx={{ fontFamily: 'Outfit' }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDialog.onConfirm}
              color="primary"
              sx={{ fontFamily: 'Outfit' }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Notifications */}
        <Snackbar
          open={!!uploadError}
          autoHideDuration={6000}
          onClose={() => setUploadError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setUploadError(null)}
            severity="error"
            sx={{ width: '100%' }}
          >
            {uploadError}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!uploadSuccess}
          autoHideDuration={4000}
          onClose={() => setUploadSuccess(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setUploadSuccess(null)}
            severity="success"
            sx={{ width: '100%' }}
          >
            {uploadSuccess}
          </Alert>
        </Snackbar>

        {/* Document Type Selection Dialog */}
        <Dialog
          open={documentTypeDialog.open}
          onClose={() =>
            setDocumentTypeDialog((prev) => ({ ...prev, open: false }))
          }
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontFamily: 'Outfit' }}>
            Select Document Type
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 3, fontFamily: 'Outfit' }}>
              Please select the type of document you are uploading:
            </Typography>

            {documentTypeDialog.files.length > 0 && (
              <Box mb={2}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontFamily: 'Outfit', mb: 1 }}
                >
                  Files to upload:
                </Typography>
                {documentTypeDialog.files.map((file, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{ fontFamily: 'Outfit', color: '#666' }}
                  >
                    • {file.name}
                  </Typography>
                ))}
              </Box>
            )}

            {documentTypeDialog.loading ? (
              <Box display="flex" justifyContent="center" py={2}>
                <LinearProgress sx={{ width: '100%' }} />
              </Box>
            ) : (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel sx={{ fontFamily: 'Outfit' }}>
                  Document Type
                </InputLabel>
                <Select
                  value={documentTypeDialog.selectedDocumentType}
                  onChange={(e: SelectChangeEvent) =>
                    setDocumentTypeDialog((prev) => ({
                      ...prev,
                      selectedDocumentType: e.target.value,
                    }))
                  }
                  label="Document Type"
                  sx={{ fontFamily: 'Outfit' }}
                >
                  {documentTypeDialog.documentTypes.map((docType) => (
                    <MenuItem
                      key={docType.id}
                      value={docType.id.toString()}
                      sx={{ fontFamily: 'Outfit' }}
                    >
                      {docType.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setDocumentTypeDialog((prev) => ({ ...prev, open: false }))
              }
              sx={{ fontFamily: 'Outfit' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDocumentTypeConfirm}
              color="primary"
              disabled={
                !documentTypeDialog.selectedDocumentType ||
                documentTypeDialog.loading
              }
              sx={{ fontFamily: 'Outfit' }}
            >
              Upload
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default DocumentUpload
