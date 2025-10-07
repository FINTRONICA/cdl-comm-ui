import { useState, useCallback } from 'react'
import {
  realEstateDocumentTemplateService,
  type TemplateDownloadResponse,
  type TemplateMetadata,
  AVAILABLE_TEMPLATES
} from '@/services/api/realEstateDocumentTemplateService'

// Hook return types
export interface UseTemplateDownloadReturn {
  downloadTemplate: (fileName: string) => Promise<TemplateDownloadResponse>
  isLoading: boolean
  error: string | null
  lastDownloaded: TemplateDownloadResponse | null
  clearError: () => void
}

export interface UseTemplateListReturn {
  templates: TemplateMetadata[]
  getTemplatesByCategory: (category: TemplateMetadata['category']) => TemplateMetadata[]
  getTemplateMetadata: (fileName: string) => TemplateMetadata | undefined
  isValidTemplate: (fileName: string) => boolean
  isLoading: boolean
}

export interface UseTemplateDownloadWithProgressReturn extends UseTemplateDownloadReturn {
  downloadProgress: number
  isDownloading: boolean
}

/**
 * Hook for downloading real estate document templates
 * @returns Object containing download function, loading state, error, and utility functions
 */
export function useTemplateDownload(): UseTemplateDownloadReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastDownloaded, setLastDownloaded] = useState<TemplateDownloadResponse | null>(null)

  const downloadTemplate = useCallback(async (fileName: string): Promise<TemplateDownloadResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await realEstateDocumentTemplateService.downloadTemplate(fileName)
      setLastDownloaded(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download template'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    downloadTemplate,
    isLoading,
    error,
    lastDownloaded,
    clearError
  }
}

/**
 * Hook for managing template lists and metadata
 * @returns Object containing template data and utility functions
 */
export function useTemplateList(): UseTemplateListReturn {
  const [isLoading] = useState(false) // Templates are static, so no loading needed

  const getTemplatesByCategory = useCallback((category: TemplateMetadata['category']) => {
    return realEstateDocumentTemplateService.getTemplatesByCategory(category)
  }, [])

  const getTemplateMetadata = useCallback((fileName: string) => {
    return realEstateDocumentTemplateService.getTemplateMetadata(fileName)
  }, [])

  const isValidTemplate = useCallback((fileName: string) => {
    return realEstateDocumentTemplateService.isValidTemplate(fileName)
  }, [])

  return {
    templates: AVAILABLE_TEMPLATES,
    getTemplatesByCategory,
    getTemplateMetadata,
    isValidTemplate,
    isLoading
  }
}

/**
 * Enhanced hook for template downloads with progress tracking
 * @returns Object containing download function with progress tracking
 */
export function useTemplateDownloadWithProgress(): UseTemplateDownloadWithProgressReturn {
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastDownloaded, setLastDownloaded] = useState<TemplateDownloadResponse | null>(null)

  const downloadTemplate = useCallback(async (fileName: string): Promise<TemplateDownloadResponse> => {
    setIsLoading(true)
    setIsDownloading(true)
    setError(null)
    setDownloadProgress(0)

    try {
      // Simulate progress updates (since we can't track actual download progress with blob downloads)
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const result = await realEstateDocumentTemplateService.downloadTemplate(fileName)
      
      clearInterval(progressInterval)
      setDownloadProgress(100)
      setLastDownloaded(result)
      
      // Reset progress after a short delay
      setTimeout(() => {
        setDownloadProgress(0)
        setIsDownloading(false)
      }, 1000)

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download template'
      setError(errorMessage)
      setIsDownloading(false)
      setDownloadProgress(0)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    downloadTemplate,
    isLoading,
    error,
    lastDownloaded,
    clearError,
    downloadProgress,
    isDownloading
  }
}

/**
 * Hook for downloading templates by category
 * @param category - The category of templates to work with
 * @returns Object containing category-specific template functions
 */
export function useTemplateDownloadByCategory(category: TemplateMetadata['category']) {
  const { getTemplatesByCategory } = useTemplateList()
  const { downloadTemplate, isLoading, error, clearError } = useTemplateDownload()

  const categoryTemplates = getTemplatesByCategory(category)

  const downloadTemplateByCategory = useCallback(async (fileName: string) => {
    // Validate that the template belongs to the specified category
    const template = categoryTemplates.find(t => t.fileName === fileName)
    if (!template) {
      throw new Error(`Template ${fileName} not found in category ${category}`)
    }
    
    return downloadTemplate(fileName)
  }, [categoryTemplates, downloadTemplate, category])

  return {
    templates: categoryTemplates,
    downloadTemplate: downloadTemplateByCategory,
    isLoading,
    error,
    clearError
  }
}

// Export types for external use
export type {
  TemplateDownloadResponse,
  TemplateMetadata
} from '@/services/api/realEstateDocumentTemplateService'
