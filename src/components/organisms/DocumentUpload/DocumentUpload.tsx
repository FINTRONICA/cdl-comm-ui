import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
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
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { TablePagination } from '../../molecules/TablePagination/TablePagination'
import { FileUploadOutlined as FileUploadOutlinedIcon } from '@mui/icons-material'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { useDeleteConfirmation } from '../../../store/confirmationDialogStore'
import { useAppTheme } from '@/hooks/useAppTheme'

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
import { UploadPopup } from './components/UploadPopup'

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
  const confirmDelete = useDeleteConfirmation()
  const theme = useTheme()
  const { isDark, colors } = useAppTheme()
  const cardBackground = alpha(colors.background.card, isDark ? 0.92 : 0.85)
  const tableHeaderBackground = alpha(
    colors.background.secondary,
    isDark ? 0.6 : 0.8
  )
  const tableRowHover = isDark ? alpha('#FFFFFF', 0.05) : alpha('#000000', 0.04)
  const dividerColor = colors.border.primary

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

  const [uploadPopup, setUploadPopup] = useState<{
    open: boolean
    documentTypes: DropdownOption[]
    loading: boolean
  }>({
    open: false,
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

  const handleUploadClick = async () => {
    setUploadPopup((prev) => ({
      ...prev,
      open: true,
      loading: true,
    }))

    try {
      const settingKey = config.documentTypeSettingKey || 'INVESTOR_ID_TYPE'
      console.log('[DocumentUpload] Fetching document types for setting key:', settingKey)
      
      const documentTypes =
        await applicationSettingService.getDropdownOptionsByKey(settingKey)
      
      console.log('[DocumentUpload] Received document types:', documentTypes?.length || 0, documentTypes)
      
      // Only use fallback if we truly have no options
      if (!documentTypes || documentTypes.length === 0) {
        console.warn('[DocumentUpload] No document types found for setting key:', settingKey)
        // Don't use fallback - let the user see that no types are available
        setUploadPopup((prev) => ({
          ...prev,
          documentTypes: [],
          loading: false,
        }))
      } else {
        setUploadPopup((prev) => ({
          ...prev,
          documentTypes,
          loading: false,
        }))
      }
    } catch (error) {
      console.error('[DocumentUpload] Error fetching document types:', error)
      // On error, show empty array so user knows something went wrong
      setUploadPopup((prev) => ({
        ...prev,
        documentTypes: [],
        loading: false,
      }))
    }
  }

  const handlePopupUpload = async (files: File[], documentType: string) => {
    setIsUploading(true)
    setUploadError(null)

    try {
      const newDocuments: T[] = []

      for (const file of files) {
        // Final validation - ensure only supported file types
        const fileExtension = '.' + file.name.toLowerCase().split('.').pop()
        const allowedExtensions = [
          '.pdf',
          '.docx',
          '.xlsx',
          '.jpg',
          '.jpeg',
          '.png',
        ]
        if (!allowedExtensions.includes(fileExtension)) {
          setUploadError(
            `Only PDF, DOCX, XLSX, JPEG, PNG files are allowed. ${file.name} is not a supported file type.`
          )
          continue
        }

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
              documentType
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
    }
  }

  const handlePopupClose = () => {
    setUploadPopup((prev) => ({ ...prev, open: false }))
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
      // Get document name for display
      const documentName =
        (document as any).name ||
        (document as any).fileName ||
        (document as any).documentName ||
        'document'

      // Use global delete confirmation dialog (same as build partner main page)
      confirmDelete({
        itemName: documentName,
        itemId: (document as any).id?.toString(),
        ...(action.confirmationMessage && {
          message: action.confirmationMessage,
        }),
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
            throw error // Re-throw to keep dialog open on error
          }
        },
      })
    } else {
      try {
        // For actions without confirmation
        if (action.key === 'download') {
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
        backgroundColor: cardBackground,
        width: '84%',
        margin: '0 auto',
        border: `1px solid ${dividerColor}`,
        color: colors.text.primary,
        ...config.cardProps,
      }}
    >
      <CardContent sx={{ color: colors.text.primary }}>
        {config.isOptional && config.description && (
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              color: colors.text.secondary,
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
                color: colors.text.primary,
              }}
            >
              {config.title || 'Document Management'}
            </Typography>
            {!config.isReadOnly && (
              <Button
                variant="outlined"
                startIcon={<FileUploadOutlinedIcon />}
                onClick={handleUploadClick}
                disabled={!!isUploading}
                sx={{
                  textTransform: 'none',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '0px',
                  borderColor: alpha(
                    theme.palette.primary.main,
                    isDark ? 0.4 : 0.6
                  ),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(
                      theme.palette.primary.main,
                      isDark ? 0.12 : 0.08
                    ),
                  },
                }}
              >
                {isUploading ? 'Uploading...' : 'Upload Documents'}
              </Button>
            )}
          </Box>

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
            sx={{
              mt: 2,
              backgroundColor: colors.background.card,
              borderRadius: '16px',
              border: `1px solid ${dividerColor}`,
              boxShadow: 'none',
              ...config.tableProps,
            }}
          >
            <Table>
              <TableHead
                sx={{
                  backgroundColor: tableHeaderBackground,
                  '& .MuiTableCell-root': {
                    fontFamily: 'Outfit',
                    fontWeight: 500,
                    color: colors.text.secondary,
                    borderBottom: `1px solid ${dividerColor}`,
                  },
                }}
              >
                <TableRow>
                  {config.columns.map((column) => (
                    <TableCell
                      key={column.key.toString()}
                      sx={{ width: column.width }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                  <TableCell>Available Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingDocuments ? (
                  <TableRow>
                    <TableCell
                      colSpan={config.columns.length + 1}
                      align="center"
                      sx={{
                        fontFamily: 'Outfit',
                        fontWeight: 'normal',
                        color: colors.text.secondary,
                        borderBottom: `1px solid ${dividerColor}`,
                      }}
                    >
                      <LinearProgress sx={{ width: '100%', mb: 2 }} />
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : uploadedDocuments.filter((doc) => doc.status !== 'failed')
                    .length > 0 ? (
                  uploadedDocuments
                    .filter((doc) => doc.status !== 'failed')
                    .map((doc, index) => (
                      <TableRow
                        key={doc.id || index}
                        sx={{
                          backgroundColor: colors.background.card,
                          '&:hover': { backgroundColor: tableRowHover },
                        }}
                      >
                        {config.columns.map((column) => (
                          <TableCell
                            key={column.key.toString()}
                            sx={{
                              fontFamily: 'Outfit',
                              fontWeight: 'normal',
                              color: colors.text.primary,
                              borderBottom: `1px solid ${alpha(dividerColor, 0.6)}`,
                            }}
                          >
                            {renderCellValue(column, doc)}
                          </TableCell>
                        ))}
                        <TableCell
                          sx={{
                            fontFamily: 'Outfit',
                            fontWeight: 'normal',
                            color: colors.text.secondary,
                            borderBottom: `1px solid ${alpha(dividerColor, 0.6)}`,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {config.actions
                              .filter((action) => {
                                // Hide delete and edit actions in read-only mode
                                if (
                                  config.isReadOnly &&
                                  (action.key === 'delete' ||
                                    action.key === 'edit')
                                ) {
                                  return false
                                }
                                return true
                              })
                              .map((action) => {
                                const isDisabled =
                                  (config.isReadOnly &&
                                    (action.key === 'delete' ||
                                      action.key === 'edit')) ||
                                  doc.status === 'uploading' ||
                                  (action.disabled?.(doc) ?? false)

                                const getButtonClass = () => {
                                  if (isDisabled) {
                                    return 'p-1 transition-colors rounded cursor-not-allowed opacity-50 dark:opacity-40'
                                  }

                                  if (action.color === 'error') {
                                    return 'p-1 transition-colors rounded cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20'
                                  }

                                  if (action.key === 'edit') {
                                    return 'p-1 transition-colors rounded cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                  }

                                  return 'p-1 transition-colors rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
                                }

                                const getIconClass = () => {
                                  if (isDisabled) {
                                    return 'w-4 h-4 text-gray-300 dark:text-gray-500'
                                  }

                                  if (action.color === 'error') {
                                    return 'w-4 h-4 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                                  }

                                  if (action.key === 'edit') {
                                    return 'w-4 h-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                                  }

                                  return 'w-4 h-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'
                                }

                                return (
                                  <button
                                    key={action.key}
                                    onClick={() =>
                                      handleActionClick(action, doc)
                                    }
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
                      sx={{
                        fontFamily: 'Outfit',
                        fontWeight: 'normal',
                        color: colors.text.secondary,
                        borderBottom: `1px solid ${alpha(dividerColor, 0.6)}`,
                      }}
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
              className="border-t border-gray-200 dark:border-gray-700"
            />
          )}
        </Box>

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

        {/* Upload Popup */}
        <UploadPopup
          open={uploadPopup.open}
          onClose={handlePopupClose}
          onUpload={handlePopupUpload}
          documentTypes={uploadPopup.documentTypes}
          loading={uploadPopup.loading}
          accept={uploadConfig.accept || '.pdf,.docx,.xlsx,.jpg,.jpeg,.png'}
          multiple={uploadConfig.multiple || true}
          maxFiles={10}
          maxSize={Math.round(
            (uploadConfig.maxFileSize || 25 * 1024 * 1024) / (1024 * 1024)
          )}
          uploadConfig={uploadConfig}
        />
      </CardContent>
    </Card>
  )
}

export default DocumentUpload
