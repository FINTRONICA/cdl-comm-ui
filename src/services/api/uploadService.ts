import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS, buildApiUrl } from '@/constants/apiEndpoints'
import type { AxiosResponse } from 'axios'

// Upload response interface
export interface UploadResponse {
  id: string
  fileName: string
  fileSize: number
  uploadedAt: string
  status?: 'success' | 'error'
  message?: string
  [key: string]: unknown
}

// Upload request interface
export interface UploadRequest {
  file: File
  entityType?: string
  entityId?: string
  uploadEndpoint?: string
  description?: string
}

// Upload progress callback type
export type UploadProgressCallback = (progress: number) => void

// Upload error interface
export interface UploadError {
  code: string
  message: string
  details?: unknown
}

class UploadService {
  /**
   * Upload a file to the specified endpoint
   * @param request - Upload request containing file and optional metadata
   * @param onProgress - Optional progress callback function
   * @returns Promise resolving to upload response
   */
  async uploadFile(
    request: UploadRequest,
    onProgress?: UploadProgressCallback
  ): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', request.file)
    
    // Add optional metadata
    if (request.entityType) {
      formData.append('entityType', request.entityType)
    }
    if (request.entityId) {
      formData.append('entityId', request.entityId)
    }
    if (request.description) {
      formData.append('description', request.description)
    }

    try {
      const response: AxiosResponse<UploadResponse> = await apiClient.post(
        buildApiUrl(request.uploadEndpoint || API_ENDPOINTS.REAL_ESTATE_DOCUMENT.UPLOAD),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              onProgress(progress)
            }
          },
        }
      )

      return {
        ...response.data,
        status: 'success'
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      
      // Create a structured error response
      const errorResponse: UploadResponse = {
        id: '',
        fileName: request.file.name,
        fileSize: request.file.size,
        uploadedAt: new Date().toISOString(),
        status: 'error',
        message: error.response?.data?.message || error.message || 'Upload failed'
      }

      throw errorResponse
    }
  }

  /**
   * Upload multiple files sequentially
   * @param requests - Array of upload requests
   * @param onProgress - Optional progress callback function for overall progress
   * @returns Promise resolving to array of upload responses
   */
  async uploadFiles(
    requests: UploadRequest[],
    onProgress?: UploadProgressCallback
  ): Promise<UploadResponse[]> {
    const results: UploadResponse[] = []
    const totalFiles = requests.length
    
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i]
      
      if (!request) {
        continue // Skip undefined requests
      }
      
      try {
        // Calculate overall progress
        const fileProgressCallback = (fileProgress: number) => {
          if (onProgress) {
            const overallProgress = Math.round(((i * 100) + fileProgress) / totalFiles)
            onProgress(overallProgress)
          }
        }

        const result = await this.uploadFile(request, fileProgressCallback)
        results.push(result)
      } catch (error) {
        // Add error result to maintain order
        results.push({
          id: '',
          fileName: request.file.name,
          fileSize: request.file.size,
          uploadedAt: new Date().toISOString(),
          status: 'error',
          message: error instanceof Error ? error.message : 'Upload failed'
        })
      }
    }
    
    return results
  }

  /**
   * Upload multiple files in parallel (use with caution for large files)
   * @param requests - Array of upload requests
   * @returns Promise resolving to array of upload responses
   */
  async uploadFilesParallel(requests: UploadRequest[]): Promise<UploadResponse[]> {
    try {
      const uploadPromises = requests.map(request => this.uploadFile(request))
      const results = await Promise.allSettled(uploadPromises)
      
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          const request = requests[index]
          if (!request) {
            return {
              id: '',
              fileName: 'Unknown',
              fileSize: 0,
              uploadedAt: new Date().toISOString(),
              status: 'error' as const,
              message: 'Invalid request'
            }
          }
          return {
            id: '',
            fileName: request.file.name,
            fileSize: request.file.size,
            uploadedAt: new Date().toISOString(),
            status: 'error' as const,
            message: result.reason?.message || 'Upload failed'
          }
        }
      })
    } catch (error: any) {
      console.error('Parallel upload error:', error)
      throw error
    }
  }

  /**
   * Validate file before upload
   * @param file - File to validate
   * @param maxSize - Maximum file size in MB
   * @param allowedTypes - Array of allowed MIME types
   * @returns Validation result
   */
  validateFile(
    file: File,
    maxSize: number = 10,
    allowedTypes: string[] = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv']
  ): { isValid: boolean; error?: string } {
    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size exceeds ${maxSize}MB limit`
      }
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed`
      }
    }

    return { isValid: true }
  }

  /**
   * Get upload history for a specific entity
   * @param entityType - Type of entity
   * @param entityId - ID of the entity
   * @returns Promise resolving to upload history
   */
  async getUploadHistory(entityType: string, entityId: string): Promise<UploadResponse[]> {
    try {
      const params = new URLSearchParams({
        entityType,
        entityId
      })
      
      const response: AxiosResponse<UploadResponse[]> = await apiClient.get(
        `${buildApiUrl(API_ENDPOINTS.REAL_ESTATE_DOCUMENT.UPLOAD)}/history?${params}`
      )
      
      return response.data
    } catch (error: any) {
      console.error('Get upload history error:', error)
      return []
    }
  }

  /**
   * Delete an uploaded file
   * @param fileId - ID of the file to delete
   * @returns Promise resolving to deletion result
   */
  async deleteFile(fileId: string): Promise<{ success: boolean; message: string }> {
    try {
      await apiClient.delete(buildApiUrl(`${API_ENDPOINTS.REAL_ESTATE_DOCUMENT.UPLOAD}/${fileId}`))
      
      return {
        success: true,
        message: 'File deleted successfully'
      }
    } catch (error: any) {
      console.error('Delete file error:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete file'
      }
    }
  }
}

// Export singleton instance
export const uploadService = new UploadService()
export { UploadService }
