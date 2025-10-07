import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import type { AxiosResponse } from 'axios'

// Template download response type
export interface TemplateDownloadResponse {
  success: boolean
  fileName: string
  fileSize: number
  downloadUrl: string
}

// Template metadata type
export interface TemplateMetadata {
  fileName: string
  displayName: string
  description: string
  category: 'build-partner' | 'capital-partner' | 'investor' | 'staff' | 'unit-plan' | 'split'
  fileSize?: number
  lastModified?: string
}

// Available templates metadata
export const AVAILABLE_TEMPLATES: TemplateMetadata[] = [
  {
    fileName: 'BuildPartnerAssestBeneficiaryTemplate.xlsx',
    displayName: 'Build Partner Asset Beneficiary Template',
    description: 'Template for uploading build partner asset beneficiary data',
    category: 'build-partner'
  },
  {
    fileName: 'BuildPartnerAssestTemplate.xlsx',
    displayName: 'Build Partner Asset Template',
    description: 'Template for uploading build partner asset data',
    category: 'build-partner'
  },
  {
    fileName: 'BuildPartnerBeneficiaryTemplate.xlsx',
    displayName: 'Build Partner Beneficiary Template',
    description: 'Template for uploading build partner beneficiary data',
    category: 'build-partner'
  },
  {
    fileName: 'BuildPartnerTemplate.xlsx',
    displayName: 'Build Partner Template',
    description: 'Template for uploading build partner data',
    category: 'build-partner'
  },
  {
    fileName: 'InvesterUpload.xlsx',
    displayName: 'Investor Upload Template',
    description: 'Template for uploading investor data',
    category: 'investor'
  },
  {
    fileName: 'OffUnitPlanTemplate.xlsx',
    displayName: 'Off Unit Plan Template',
    description: 'Template for uploading off unit plan data',
    category: 'unit-plan'
  },
  {
    fileName: 'SplitUploadTemplate.xlsx',
    displayName: 'Split Upload Template',
    description: 'Template for uploading split data',
    category: 'split'
  },
  {
    fileName: 'STAFF_FILE_TEMPLATE.xlsx',
    displayName: 'Staff File Template',
    description: 'Template for uploading staff data',
    category: 'staff'
  }
]

/**
 * Real Estate Document Template Service
 * Handles template download operations
 */
export class RealEstateDocumentTemplateService {
  /**
   * Download a template file by filename
   * @param fileName - The name of the template file to download
   * @returns Promise that resolves to the download response
   */
  async downloadTemplate(fileName: string): Promise<TemplateDownloadResponse> {
    try {
      // Validate fileName
      if (!fileName || !fileName.endsWith('.xlsx')) {
        throw new Error('Invalid file name. Only .xlsx files are allowed.')
      }

      // Check if template exists in our metadata
      const template = AVAILABLE_TEMPLATES.find(t => t.fileName === fileName)
      if (!template) {
        throw new Error('Template not found or access denied')
      }

      // Construct the download URL
      const downloadUrl = API_ENDPOINTS.REAL_ESTATE_DOCUMENT.DOWNLOAD_TEMPLATE(fileName)
      
      // Make the download request
      const response: AxiosResponse<Blob> = await apiClient.get(downloadUrl, {
        responseType: 'blob', // Important for file downloads
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      })

      // Create blob URL for download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      
      const blobUrl = URL.createObjectURL(blob)
      
      // Trigger download
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up blob URL
      URL.revokeObjectURL(blobUrl)

      return {
        success: true,
        fileName,
        fileSize: blob.size,
        downloadUrl: blobUrl
      }
    } catch (error) {
      console.error('Template download error:', error)
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to download template'
      )
    }
  }

  /**
   * Get all available templates
   * @returns Array of template metadata
   */
  getAvailableTemplates(): TemplateMetadata[] {
    return AVAILABLE_TEMPLATES
  }

  /**
   * Get templates by category
   * @param category - The category to filter by
   * @returns Array of template metadata for the specified category
   */
  getTemplatesByCategory(category: TemplateMetadata['category']): TemplateMetadata[] {
    return AVAILABLE_TEMPLATES.filter(template => template.category === category)
  }

  /**
   * Get template metadata by filename
   * @param fileName - The filename to search for
   * @returns Template metadata or undefined if not found
   */
  getTemplateMetadata(fileName: string): TemplateMetadata | undefined {
    return AVAILABLE_TEMPLATES.find(template => template.fileName === fileName)
  }

  /**
   * Validate template filename
   * @param fileName - The filename to validate
   * @returns True if valid, false otherwise
   */
  isValidTemplate(fileName: string): boolean {
    return AVAILABLE_TEMPLATES.some(template => template.fileName === fileName)
  }
}

// Export service instance
export const realEstateDocumentTemplateService = new RealEstateDocumentTemplateService()
