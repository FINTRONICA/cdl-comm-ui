'use client'

import React, { useCallback, useRef, useState } from 'react'
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
  Alert,
  Chip,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import FileIcon from '@mui/icons-material/Description'
import { Controller, useFormContext } from 'react-hook-form'
import { primaryButtonSx } from '../styles'

interface FileUploadProps {
  name: string
  label: string
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number // in MB
  onUpload?: (files: File[]) => Promise<void>
  onRemove?: (file: File) => void
  error?: any
  helperText?: string
  sx?: any
}

interface FileWithProgress extends File {
  id: string
  progress?: number
  status?: 'uploading' | 'success' | 'error'
  error?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  name,
  label,
  accept = '*/*',
  multiple = false,
  maxFiles = 5,
  maxSize = 10, // 10MB default
  onUpload,
  onRemove,
  error,
  helperText,
  sx,
}) => {
  const formContext = useFormContext()

  // Early return if form context is not available
  if (!formContext) {
    return (
      <Box sx={sx}>
        <Typography color="error" align="center">
          Form context not available. Please ensure FormProvider is properly set
          up.
        </Typography>
      </Box>
    )
  }

  const { control, setValue } = formContext
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<FileWithProgress[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return

      const fileArray = Array.from(selectedFiles)
      const validFiles: FileWithProgress[] = []
      const errors: string[] = []

      fileArray.forEach((file) => {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
          errors.push(`${file.name} is too large (max ${maxSize}MB)`)
          return
        }

        // Check file count
        if (files.length + validFiles.length >= maxFiles) {
          errors.push(`Maximum ${maxFiles} files allowed`)
          return
        }

        validFiles.push({
          ...file,
          id: Math.random().toString(36).substr(2, 9),
          status: 'uploading',
          progress: 0,
        })
      })

      if (errors.length > 0) {
        // Handle errors (you might want to show these in a toast or alert)
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles])
        setValue(name, [...files, ...validFiles])

        // Simulate upload progress
        validFiles.forEach((file) => {
          simulateUpload(file)
        })
      }
    },
    [files, maxFiles, maxSize, name, setValue]
  )

  const simulateUpload = useCallback(
    async (file: FileWithProgress) => {
      try {
        setUploading(true)

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
          )
        }

        // Mark as success
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: 'success', progress: 100 } : f
          )
        )

        // Call onUpload if provided
        if (onUpload) {
          await onUpload([file])
        }
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: 'error',
                  error:
                    error instanceof Error ? error.message : 'Upload failed',
                }
              : f
          )
        )
      } finally {
        setUploading(false)
      }
    },
    [onUpload]
  )

  const handleRemoveFile = useCallback(
    (fileId: string) => {
      const fileToRemove = files.find((f) => f.id === fileId)
      if (fileToRemove) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId))
        setValue(
          name,
          files.filter((f) => f.id !== fileId)
        )
        onRemove?.(fileToRemove)
      }
    },
    [files, name, setValue, onRemove]
  )

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Controller
      name={name}
      control={control}
      render={() => (
        <Box sx={sx}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            {label}
            {helperText && (
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
              >
                {helperText}
              </Typography>
            )}
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: 'none' }}
          />

          <Button
            onClick={handleClick}
            startIcon={<CloudUploadIcon />}
            variant="outlined"
            disabled={uploading || files.length >= maxFiles}
            sx={primaryButtonSx}
            fullWidth
          >
            {uploading
              ? 'Uploading...'
              : `Choose Files (${files.length}/${maxFiles})`}
          </Button>

          {files.length > 0 && (
            <Box mt={2}>
              <List dense>
                {files.map((file) => (
                  <ListItem key={file.id} sx={{ px: 0 }}>
                    <FileIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <ListItemText
                      primary={file.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            {formatFileSize(file.size)}
                          </Typography>
                          {file.status === 'uploading' && (
                            <LinearProgress
                              variant="determinate"
                              value={file.progress || 0}
                              sx={{ mt: 1, height: 4 }}
                            />
                          )}
                          {file.status === 'error' && (
                            <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                              {file.error}
                            </Alert>
                          )}
                          {file.status === 'success' && (
                            <Chip
                              label="Uploaded"
                              size="small"
                              color="success"
                              sx={{ mt: 1, height: 20 }}
                            />
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => handleRemoveFile(file.id)}
                        disabled={file.status === 'uploading'}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error.message}
            </Alert>
          )}
        </Box>
      )}
    />
  )
}
