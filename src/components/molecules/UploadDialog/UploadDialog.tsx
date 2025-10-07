'use client'

import React, { useState, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Button,
  LinearProgress,
  Alert,
} from '@mui/material'
import { Close as CloseIcon, CloudUpload, Delete } from '@mui/icons-material'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { uploadService, type UploadResponse } from '@/services/api/uploadService'


interface UploadDialogProps {
  open: boolean
  onClose: () => void
  onUploadSuccess?: (response: UploadResponse) => void
  onUploadError?: (error: string) => void
  title?: string
  titleConfigId?: string // Label config ID for dynamic title
  acceptedFileTypes?: string
  maxFileSize?: number // in MB
  uploadEndpoint?: string
  entityType?: string
  entityId?: string
  allowMultiple?: boolean // Allow multiple files or single file only
}

interface UploadedFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string | undefined
  response?: UploadResponse
}

export const UploadDialog: React.FC<UploadDialogProps> = ({
  open,
  onClose,
  onUploadSuccess,
  onUploadError,
  title = 'Upload File',
  titleConfigId,
  acceptedFileTypes = '.xlsx,.xls,.csv,.pdf,.doc,.docx',
  maxFileSize = 10, // 10MB default
  uploadEndpoint = '/real-estate-document/upload',
  entityType,
  entityId,
  allowMultiple = false, // Default to single file upload
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get label resolver from sidebar config
  const { getLabelResolver } = useSidebarConfig()

  // Get dynamic labels using getLabelResolver pattern
  const dialogTitle = titleConfigId && getLabelResolver 
    ? getLabelResolver(titleConfigId, title) 
    : title
  const dragDropText = getLabelResolver 
    ? getLabelResolver('upload_drag_drop_text', 'Choose files or drag and drop')
    : 'Choose files or drag and drop'
  const dropFilesText = getLabelResolver 
    ? getLabelResolver('upload_drop_files_text', 'Drop files here')
    : 'Drop files here'
  const selectFilesText = getLabelResolver 
    ? getLabelResolver('upload_select_files_text', allowMultiple ? 'Select multiple files to upload' : 'Select a file to upload')
    : (allowMultiple ? 'Select multiple files to upload' : 'Select a file to upload')
  const selectedFilesText = getLabelResolver 
    ? getLabelResolver('upload_selected_files_text', 'Selected Files')
    : 'Selected Files'
  const supportedFormatsText = getLabelResolver 
    ? getLabelResolver('upload_supported_formats_text', 'Supported formats')
    : 'Supported formats'
  const maxSizeText = getLabelResolver 
    ? getLabelResolver('upload_max_size_text', 'Max size')
    : 'Max size'
  const cancelText = getLabelResolver 
    ? getLabelResolver('upload_cancel_text', 'Cancel')
    : 'Cancel'
  const doneText = getLabelResolver 
    ? getLabelResolver('upload_done_text', 'Done')
    : 'Done'
  const uploadText = getLabelResolver 
    ? getLabelResolver('upload_button_text', 'Upload')
    : 'Upload'
  const uploadingText = getLabelResolver 
    ? getLabelResolver('upload_uploading_text', 'Uploading...')
    : 'Uploading...'
  const fileSizeErrorText = getLabelResolver 
    ? getLabelResolver('upload_file_size_error', 'File size must be less than')
    : 'File size must be less than'
  const fileTypeErrorText = getLabelResolver 
    ? getLabelResolver('upload_file_type_error', 'File type not supported. Allowed types:')
    : 'File type not supported. Allowed types:'

  const generateFileId = () => Math.random().toString(36).substr(2, 9)

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `${fileSizeErrorText} ${maxFileSize}MB`
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const allowedTypes = acceptedFileTypes.toLowerCase().split(',')
    
    if (!allowedTypes.includes(fileExtension)) {
      return `${fileTypeErrorText} ${acceptedFileTypes}`
    }

    return null
  }

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: UploadedFile[] = []
    
    // If single file mode, only take the first file
    const filesToProcess = allowMultiple 
      ? Array.from(selectedFiles) 
      : selectedFiles.length > 0 ? [selectedFiles[0]] : []
    
    filesToProcess.forEach((file) => {
      const validationError = validateFile(file)
      
      newFiles.push({
        file,
        id: generateFileId(),
        progress: 0,
        status: validationError ? 'error' : 'pending',
        error: validationError ? validationError : undefined,
      })
    })

    // If single file mode, replace existing files
    if (allowMultiple) {
      setFiles(prev => [...prev, ...newFiles])
    } else {
      setFiles(newFiles)
    }
  }, [acceptedFileTypes, maxFileSize, fileSizeErrorText, fileTypeErrorText, allowMultiple])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  const uploadFile = async (uploadFile: UploadedFile): Promise<void> => {

    try {
      // Use the upload service which handles authentication automatically
      const result = await uploadService.uploadFile({
        file: uploadFile.file,
        ...(entityType && { entityType }),
        ...(entityId && { entityId }),
        uploadEndpoint
      })

      
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'success', progress: 100, response: result }
          : f
      ))

      onUploadSuccess?.(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'error', error: errorMessage }
          : f
      ))

      onUploadError?.(errorMessage)
    }
  }

  const handleUploadAll = async () => {
    const validFiles = files.filter(f => f.status === 'pending')
    if (validFiles.length === 0) return

    setIsUploading(true)

    // Update status to uploading
    setFiles(prev => prev.map(f => 
      f.status === 'pending' ? { ...f, status: 'uploading' } : f
    ))

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (const file of validFiles) {
        await uploadFile(file)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (isUploading) return // Prevent closing during upload
    setFiles([])
    onClose()
  }

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'success': return '#10B981'
      case 'error': return '#EF4444'
      case 'uploading': return '#3B82F6'
      default: return '#6B7280'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const hasValidFiles = files.some(f => f.status === 'pending')
  const hasSuccessfulUploads = files.some(f => f.status === 'success')

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e5e7eb',
          pb: 2,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Outfit',
              fontWeight: 400,
              fontSize: '24px',
              color: '#1E2939',
            }}
          >
            {dialogTitle}
          </Typography>
          <Typography
            variant="body2"
            sx={{ 
              mt: 0.5, 
              fontFamily: 'Outfit', 
              fontWeight: 400,
              color: '#6B7280'
            }}
          >
            {supportedFormatsText}: {acceptedFileTypes} • {maxSizeText}: {maxFileSize}MB
          </Typography>
        </Box>
        <IconButton 
          onClick={handleClose} 
          size="small"
          disabled={isUploading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {/* Upload Area */}
        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: `2px dashed ${isDragOver ? '#3B82F6' : '#D1D5DB'}`,
            borderRadius: '12px',
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragOver ? '#EFF6FF' : '#F9FAFB',
            transition: 'all 0.2s ease',
            mb: 3,
            '&:hover': {
              borderColor: '#3B82F6',
              backgroundColor: '#EFF6FF',
            },
          }}
        >
          <CloudUpload sx={{ fontSize: 48, color: '#6B7280', mb: 2 }} />
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Outfit',
              fontWeight: 500,
              color: '#1F2937',
              mb: 1,
            }}
          >
            {isDragOver ? dropFilesText : dragDropText}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Outfit',
              color: '#6B7280',
            }}
          >
            {selectFilesText}
          </Typography>
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          multiple={allowMultiple}
          accept={acceptedFileTypes}
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{ display: 'none' }}
        />

        {/* File List */}
        {files.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontFamily: 'Outfit',
                fontWeight: 500,
                color: '#1F2937',
                mb: 2,
              }}
            >
              {allowMultiple ? `${selectedFilesText} (${files.length})` : selectedFilesText}
            </Typography>
            
            {files.map((uploadFile) => (
              <Box
                key={uploadFile.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  mb: 1,
                  backgroundColor: '#FAFAFA',
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Outfit',
                      fontWeight: 500,
                      color: '#1F2937',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {uploadFile.file.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'Outfit',
                      color: '#6B7280',
                    }}
                  >
                    {formatFileSize(uploadFile.file.size)} • {uploadFile.status}
                  </Typography>
                  
                  {uploadFile.status === 'uploading' && (
                    <LinearProgress
                      variant="indeterminate"
                      sx={{ mt: 1, height: 4, borderRadius: 2 }}
                    />
                  )}
                  
                  {uploadFile.error && (
                    <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                      {uploadFile.error}
                    </Alert>
                  )}
                </Box>
                
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(uploadFile.status),
                    mr: 2,
                  }}
                />
                
                <IconButton
                  size="small"
                  onClick={() => removeFile(uploadFile.id)}
                  disabled={uploadFile.status === 'uploading'}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={isUploading}
            sx={{ 
              textTransform: 'none', 
              borderRadius: '8px',
              fontFamily: 'Outfit',
            }}
          >
            {hasSuccessfulUploads ? doneText : cancelText}
          </Button>
          
          {hasValidFiles && (
            <button
              onClick={handleUploadAll}
              disabled={isUploading}
              className="flex items-center cursor-pointer h-8 py-1.5 bg-[#155DFC] rounded-md px-2.5 gap-1.5 text-[#FAFAF9] font-sans font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src="/upload-white.svg" alt="upload icon" className="w-4 h-4" />
              {isUploading ? uploadingText : allowMultiple ? `${uploadText} ${files.filter(f => f.status === 'pending').length} Files` : uploadText}
            </button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}
