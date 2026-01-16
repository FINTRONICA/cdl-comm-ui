import React, { useRef, useState, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  LinearProgress,
  Alert,
  Chip,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import FileIcon from '@mui/icons-material/Description'
import { DropdownOption } from '../../../../services/api/applicationSettingService'
import { validateFile } from '../utils'
import { UploadConfig } from '../types'
import { useAppTheme } from '@/hooks/useAppTheme'

interface FileWithProgress {
  id: string
  file: File
  progress?: number
  status?: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

interface UploadPopupProps {
  open: boolean
  onClose: () => void
  onUpload: (files: File[], documentType: string) => Promise<void>
  documentTypes: DropdownOption[]
  loading?: boolean
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number // in MB
  uploadConfig?: UploadConfig
}

export const UploadPopup: React.FC<UploadPopupProps> = ({
  open,
  onClose,
  onUpload,
  documentTypes,
  loading = false,
  accept = '.pdf,.docx,.xlsx,.jpg,.jpeg,.png',
  multiple = true,
  maxFiles = 10,
  maxSize = 25,
  uploadConfig,
}) => {
  const [files, setFiles] = useState<FileWithProgress[]>([])
  const [selectedDocumentType, setSelectedDocumentType] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const theme = useTheme()
  const { isDark, colors } = useAppTheme()

  // Reset selected document type when documentTypes change or popup opens
  useEffect(() => {
    if (open && documentTypes && documentTypes.length > 0) {
      // Auto-select first option if none selected
      if (!selectedDocumentType && documentTypes[0]) {
        setSelectedDocumentType(documentTypes[0].id.toString())
      }
    } else if (open && (!documentTypes || documentTypes.length === 0)) {
      // Reset if no document types available
      setSelectedDocumentType('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, documentTypes])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [])

  const handleFileSelect = useCallback(
    (selectedFiles: FileList) => {
      const fileArray = Array.from(selectedFiles)
      const validFiles: FileWithProgress[] = []
      const newErrors: string[] = []

      fileArray.forEach((file) => {
        // Use the same validation logic as DocumentUpload
        if (uploadConfig) {
          const validationResult = validateFile(file, uploadConfig)
          if (!validationResult.isValid) {
            newErrors.push(validationResult.error || 'File validation failed')
            return
          }
        } else {
          // Fallback validation if no uploadConfig provided
          // Check file size
          if (file.size > maxSize * 1024 * 1024) {
            newErrors.push(`${file.name} is too large (max ${maxSize}MB)`)
            return
          }

          // Check file type - allow PDF, DOCX, XLSX, JPEG, PNG
          const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
          const allowedExtensions = [
            '.pdf',
            '.docx',
            '.xlsx',
            '.jpg',
            '.jpeg',
            '.png',
          ]
          if (!allowedExtensions.includes(fileExtension)) {
            newErrors.push(
              `Only PDF, DOCX, XLSX, JPEG, PNG files are allowed. ${file.name} is not a supported file type.`
            )
            return
          }
        }

        // Check file count
        if (files.length + validFiles.length >= maxFiles) {
          newErrors.push(`Maximum ${maxFiles} files allowed`)
          return
        }

        validFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file: file,
          status: 'pending',
          progress: 0,
        })
      })

      setErrors(newErrors)

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles])
      }
    },
    [files, maxFiles, maxSize, accept, uploadConfig]
  )

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files)
    }
  }

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== fileId)

      return filtered
    })

    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleUpload = async () => {
    if (!selectedDocumentType) {
      setErrors(['Please select a document type'])
      return
    }

    if (files.length === 0) {
      setErrors(['Please select at least one file'])
      return
    }

    setIsUploading(true)
    setErrors([])

    try {
      // Extract the actual File objects from FileWithProgress objects
      const fileObjects = files.map((f) => f.file)
      await onUpload(fileObjects, selectedDocumentType)
      handleClose()
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Upload failed'])
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    setFiles([])
    setSelectedDocumentType('')
    setErrors([])
    setIsUploading(false)
    onClose()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: isDark
            ? '0 18px 40px rgba(15, 23, 42, 0.55)'
            : '0 10px 25px rgba(0, 0, 0, 0.1)',
          backgroundColor: isDark ? '#101828' : colors.background.card,
          color: colors.text.primary,
          border: `1px solid ${colors.border.primary}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: 'Outfit',
          fontWeight: 600,
          fontSize: '18px',
          color: colors.text.primary,
          backgroundColor: isDark ? '#101828' : colors.background.card,
          // borderBottom: `1px solid ${colors.border.primary}`,
          pb: 1,
        }}
      >
        Upload File
      </DialogTitle>

      <DialogContent
        sx={{
          pt: 2,
          backgroundColor: isDark ? '#101828' : colors.background.card,
        }}
      >
        {/* File Type Instructions */}
        <Typography
          variant="body2"
          sx={{
            mb: 3,
            fontFamily: 'Outfit',
            color: colors.text.secondary,
            fontSize: '14px',
          }}
        >
          Supported formats: PDF, DOCX, XLSX, JPEG, PNG • Max size: {maxSize}MB
        </Typography>

        {/* Drag and Drop Area */}
        <Box
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleUploadClick}
          sx={{
            border: '2px dashed',
            borderColor: dragActive
              ? theme.palette.primary.main
              : colors.border.secondary,
            borderRadius: '8px',
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: dragActive
              ? alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12)
              : isDark
                ? '#1E293B'
                : alpha(colors.background.secondary, 0.25),
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(
                theme.palette.primary.main,
                isDark ? 0.18 : 0.12
              ),
            },
          }}
        >
          <CloudUploadIcon
            sx={{
              fontSize: 48,
              color: dragActive
                ? theme.palette.primary.main
                : colors.text.muted,
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Outfit',
              fontWeight: 500,
              color: colors.text.primary,
              mb: 1,
            }}
          >
            Choose files or drag and drop
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Outfit',
              color: colors.text.secondary,
              fontSize: '14px',
            }}
          >
            Select a file to upload
          </Typography>
        </Box>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {/* Document Type Selection */}
        <FormControl
          fullWidth
          sx={{
            mt: 3,
            '& .MuiOutlinedInput-notchedOutline': {
              border: `1px solid ${isDark ? alpha('#FFFFFF', 0.3) : '#d1d5db'}`,
              borderRadius: '6px',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              border: `1px solid ${isDark ? alpha('#FFFFFF', 0.5) : '#9ca3af'}`,
            },
            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
              border: `2px solid ${theme.palette.primary.main}`,
            },
          }}
          variant="outlined"
        >
          <InputLabel
            sx={{
              fontFamily: 'Outfit',
              color: colors.text.secondary,
              '&.Mui-focused': {
                color: theme.palette.primary.main,
              },
            }}
          >
            Document Type
          </InputLabel>
          <Select
            value={selectedDocumentType}
            onChange={(e: SelectChangeEvent) =>
              setSelectedDocumentType(e.target.value)
            }
            label="Document Type"
            disabled={loading}
            sx={{
              height: '52px',
              fontFamily: 'Outfit',
              fontSize: '14px',
              color: colors.text.primary,
              backgroundColor: isDark ? '#1E293B' : 'transparent',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? alpha('#FFFFFF', 0.3) : '#D1D5DB',
                borderWidth: '1px',
                borderRadius: '8px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? alpha('#FFFFFF', 0.5) : '#9CA3AF',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
                borderWidth: '2px',
              },
              '& .MuiSelect-icon': {
                color: isDark ? alpha('#FFFFFF', 0.7) : '#666',
              },
              '& .MuiSelect-select': {
                padding: '12px 14px',
                fontFamily: 'Outfit',
                fontSize: '14px',
                color: colors.text.primary,
              },
            }}
            variant="outlined"
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: isDark ? '#101828' : '#FFFFFF',
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: '8px',
                  mt: 0.5,
                  boxShadow: isDark
                    ? '0 10px 25px rgba(0, 0, 0, 0.5)'
                    : '0 4px 12px rgba(0, 0, 0, 0.1)',
                  '& .MuiList-root': {
                    padding: '4px',
                  },
                  '& .MuiMenuItem-root': {
                    fontFamily: 'Outfit',
                    fontSize: '14px',
                    color: colors.text.primary,
                    borderRadius: '6px',
                    margin: '2px 0',
                  },
                },
              },
            }}
          >
            {documentTypes && documentTypes.length > 0 ? (
              documentTypes.map((docType) => (
                <MenuItem
                  key={docType.id}
                  value={docType.id.toString()}
                  sx={{
                    fontFamily: 'Outfit',
                    fontSize: '14px',
                    color: colors.text.primary,
                    backgroundColor: isDark ? '#101828' : 'transparent',
                    '&:hover': {
                      backgroundColor: isDark
                        ? '#1E293B'
                        : alpha(theme.palette.primary.main, 0.08),
                    },
                    '&.Mui-selected': {
                      backgroundColor: isDark
                        ? '#1E293B'
                        : alpha(theme.palette.primary.main, 0.12),
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: isDark
                          ? '#334155'
                          : alpha(theme.palette.primary.main, 0.15),
                      },
                    },
                  }}
                >
                  {docType.label}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled value="">
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.text.secondary,
                    fontStyle: 'italic',
                  }}
                >
                  No document types available
                </Typography>
              </MenuItem>
            )}
          </Select>
        </FormControl>

        {/* Loading Indicator */}
        {loading && (
          <Box display="flex" justifyContent="center" py={2}>
            <LinearProgress sx={{ width: '100%' }} />
          </Box>
        )}

        {/* Selected Files */}
        {files.length > 0 && (
          <Box mt={3}>
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: 'Outfit',
                mb: 2,
                fontWeight: 500,
                color: colors.text.primary,
                fontSize: '14px',
              }}
            >
              Selected Files ({files.length}):
            </Typography>
            {files.map((fileWithProgress) => (
              <Box
                key={fileWithProgress.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: '8px',
                  mb: 1,
                  backgroundColor: isDark
                    ? '#1E293B'
                    : alpha(colors.background.secondary, 0.45),
                }}
              >
                <FileIcon sx={{ mr: 2, color: colors.text.muted }} />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Outfit',
                      fontWeight: 500,
                      color: colors.text.primary,
                      fontSize: '14px',
                    }}
                  >
                    {fileWithProgress.file.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'Outfit',
                      color: colors.text.secondary,
                      fontSize: '12px',
                    }}
                  >
                    {formatFileSize(fileWithProgress.file.size)}
                  </Typography>
                  {fileWithProgress.status === 'uploading' && (
                    <LinearProgress
                      variant="determinate"
                      value={fileWithProgress.progress || 0}
                      sx={{ mt: 1, height: 4 }}
                    />
                  )}
                  {fileWithProgress.status === 'error' && (
                    <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                      {fileWithProgress.error}
                    </Alert>
                  )}
                  {fileWithProgress.status === 'success' && (
                    <Chip
                      label="Uploaded"
                      size="small"
                      color="success"
                      sx={{ mt: 1, height: 20 }}
                    />
                  )}
                </Box>
                <Button
                  onClick={() => handleRemoveFile(fileWithProgress.id)}
                  disabled={fileWithProgress.status === 'uploading'}
                  sx={{
                    minWidth: 'auto',
                    p: 1,
                    color: theme.palette.error.main,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: alpha(
                        theme.palette.error.main,
                        isDark ? 0.2 : 0.1
                      ),
                    },
                    '&:disabled': {
                      color: colors.text.muted,
                      cursor: 'not-allowed',
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </Button>
              </Box>
            ))}
          </Box>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <Box mt={2}>
            {errors.map((error, index) => (
              <Alert key={index} severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          pt: 2,
          gap: 2,
          backgroundColor: isDark
            ? '#0F172A'
            : alpha(colors.background.secondary, 0.3),
          borderTop: `1px solid ${colors.border.primary}`,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isUploading}
          sx={{
            fontFamily: 'Outfit',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '20px',
            letterSpacing: '0px',
            borderRadius: '8px',
            padding: '10px 24px',
            border: `1px solid ${colors.border.primary}`,
            color: colors.text.primary,
            backgroundColor: isDark ? '#1E293B' : colors.background.card,
            '&:hover': {
              backgroundColor: isDark
                ? '#334155'
                : alpha(colors.background.secondary, 0.3),
              borderColor: alpha(colors.border.primary, 0.8),
            },
            '&:disabled': {
              color: colors.text.muted,
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={
            !selectedDocumentType ||
            files.length === 0 ||
            isUploading ||
            loading
          }
          sx={{
            fontFamily: 'Outfit',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '20px',
            letterSpacing: '0px',
            borderRadius: '8px',
            padding: '10px 24px',
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              color: theme.palette.primary.contrastText,
            },
            '&:disabled': {
              backgroundColor: alpha(theme.palette.primary.main, 0.4),
              color: alpha(theme.palette.primary.contrastText, 0.8),
            },
          }}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
