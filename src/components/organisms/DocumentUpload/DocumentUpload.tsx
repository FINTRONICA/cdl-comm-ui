import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
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
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
  const { setValue } = useFormContext()
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

  const queryClient = useQueryClient()
  const previousFormDocsRef = useRef<T[]>([])

  const uploadConfig = useMemo(() => ({ ...DEFAULT_UPLOAD_CONFIG, ...config.uploadConfig }), [config.uploadConfig])

  // Memoize stable query key to prevent unnecessary re-renders
  // Flatten object to prevent query key instability
  const queryKey = useMemo(
    () => [
      'documents',
      config.entityType,
      config.entityId,
      currentPage - 1,
      rowsPerPage,
    ],
    [config.entityType, config.entityId, currentPage, rowsPerPage]
  )

  // FIXED: Use React Query instead of useEffect for document fetching
  const {
    data: documentsResponse,
    isLoading: isLoadingDocumentsQuery,
    error: documentsError,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!config.entityId || config.entityId.trim() === '') {
        return null
      }
      return await config.documentService.getDocuments(
        config.entityId,
        currentPage - 1, // API expects 0-based page numbers
        rowsPerPage
      )
    },
    enabled: !!config.entityId && config.entityId.trim() !== '',
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      // Disable retry on 500 errors to prevent retry storms
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return false
        }
      }
      // Limit retries for other errors
      return failureCount < 1
    },
  })

  // Memoize mapApiToDocument to prevent unnecessary re-renders
  const mapApiToDocumentMemo = useMemo(
    () => config.mapApiToDocument,
    [config.mapApiToDocument]
  )

  // Update local state from React Query response - single source of truth
  useEffect(() => {
    if (documentsResponse) {
      const mappedDocuments: T[] = documentsResponse.content.map(
        mapApiToDocumentMemo
      )
      setUploadedDocuments(mappedDocuments)
      setTotalPages(documentsResponse.page.totalPages)
      setTotalDocuments(documentsResponse.page.totalElements)
      // Only update form if documents actually changed to prevent circular updates
      const currentFormDocs = previousFormDocsRef.current
      const mappedIds = mappedDocuments.map((d) => d.id).sort().join(',')
      const currentIds = currentFormDocs.map((d: T) => d.id).sort().join(',')
      
      if (mappedIds !== currentIds) {
        setValue(formFieldName, mappedDocuments, { shouldDirty: false })
        previousFormDocsRef.current = mappedDocuments
      }
    }
  }, [documentsResponse, mapApiToDocumentMemo, setValue, formFieldName])

  // Set loading state from React Query
  useEffect(() => {
    setIsLoadingDocuments(isLoadingDocumentsQuery)
  }, [isLoadingDocumentsQuery])

  // Handle errors from React Query
  useEffect(() => {
    if (documentsError && !config.isOptional) {
      setUploadError('Failed to load existing documents')
    }
  }, [documentsError, config.isOptional])

  // Pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
  }, [])

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setCurrentPage(1) // Reset to first page when changing rows per page
  }, [])

  // Calculate pagination values
  const startItem = totalDocuments > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0
  const endItem = Math.min(currentPage * rowsPerPage, totalDocuments)

  // Only sync form changes when documents are manually updated (not from React Query)
  // This prevents circular updates between form and React Query
  const previousUploadedDocumentsRef = useRef<T[]>([])
  const onDocumentsChangeRef = useRef(config.onDocumentsChange)
  
  // Update ref when callback changes
  useEffect(() => {
    onDocumentsChangeRef.current = config.onDocumentsChange
  }, [config.onDocumentsChange])
  
  useEffect(() => {
    // Only update form if documents changed from user actions (not from React Query fetch)
    const successfulDocuments = uploadedDocuments.filter(
      (doc) => doc.status !== 'failed'
    )
    
    // Check if this is a user-initiated change (upload/delete) vs React Query fetch
    const isUserAction = 
      uploadedDocuments.length !== previousUploadedDocumentsRef.current.length ||
      uploadedDocuments.some((doc, idx) => 
        doc.id !== previousUploadedDocumentsRef.current[idx]?.id
      )
    
    if (isUserAction && successfulDocuments.length > 0) {
      setValue(formFieldName, successfulDocuments, { shouldDirty: false })
      if (onDocumentsChangeRef.current) {
        onDocumentsChangeRef.current(successfulDocuments)
      }
    }
    
    previousUploadedDocumentsRef.current = uploadedDocuments
  }, [uploadedDocuments, setValue, formFieldName])

  // Memoize document types query key
  const documentTypesQueryKey = useMemo(
    () => ['documentTypes', config.documentTypeSettingKey || 'INVESTOR_ID_TYPE'],
    [config.documentTypeSettingKey]
  )

  // Use React Query for document types
  const { data: documentTypes = [], isLoading: isLoadingDocumentTypes } = useQuery({
    queryKey: documentTypesQueryKey,
    queryFn: async () => {
      const settingKey = config.documentTypeSettingKey || 'INVESTOR_ID_TYPE'
      return await applicationSettingService.getDropdownOptionsByKey(settingKey)
    },
    enabled: false, // Only fetch when popup opens
    staleTime: 10 * 60 * 1000, // 10 minutes - document types rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Disable retry on 500 errors
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return false
        }
      }
      return failureCount < 1
    },
  })

  const handleUploadClick = useCallback(async () => {
    setUploadPopup((prev) => ({
      ...prev,
      open: true,
      loading: true,
    }))

    // Fetch document types using React Query
    try {
      await queryClient.fetchQuery({
        queryKey: documentTypesQueryKey,
        queryFn: async () => {
          const settingKey = config.documentTypeSettingKey || 'INVESTOR_ID_TYPE'
          return await applicationSettingService.getDropdownOptionsByKey(settingKey)
        },
      })
    } catch (error) {
      // Error handled by query
    } finally {
      setUploadPopup((prev) => ({
        ...prev,
        loading: false,
      }))
    }
  }, [queryClient, documentTypesQueryKey, config.documentTypeSettingKey])

  // Update popup state when document types load - only when popup is open
  useEffect(() => {
    if (uploadPopup.open) {
      setUploadPopup((prev) => ({
        ...prev,
        documentTypes: documentTypes || [],
        loading: isLoadingDocumentTypes,
      }))
    }
  }, [documentTypes, isLoadingDocumentTypes, uploadPopup.open])

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
        const successfullyUploadedDocs: T[] = []

        for (const document of newDocuments) {
          try {
            const response = await config.documentService.uploadDocument(
              document.file!,
              config.entityId,
              documentType
            )

            const updatedDocument = config.mapApiToDocument(response)
            setUploadedDocuments((prev) => {
              const updated = prev.map((doc) =>
                doc.id === document.id ? updatedDocument : doc
              )
              return updated
            })
            successfullyUploadedDocs.push(updatedDocument)
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

          // Invalidate queries - this will automatically trigger refetch
          queryClient.invalidateQueries({ queryKey })

          // Call success callback with successfully uploaded documents
          // Use the documents we just uploaded, not the full state
          if (config.onUploadSuccess && successfullyUploadedDocs.length > 0) {
            // Call callback in next tick to ensure state updates are complete
            Promise.resolve().then(() => {
              config.onUploadSuccess?.(successfullyUploadedDocs as T[])
            })
          }
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

              // Remove the document from the local state and update form
              setUploadedDocuments((prev) => {
                const filtered = prev.filter((doc) => doc.id !== document.id)
                setValue(formFieldName, filtered, { shouldDirty: false })
                return filtered
              })

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
          documentTypes={documentTypes || uploadPopup.documentTypes}
          loading={uploadPopup.loading || isLoadingDocumentTypes}
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
