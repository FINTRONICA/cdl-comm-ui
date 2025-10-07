import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'

// Real Estate Asset Response Types based on the API response
export interface BuildPartnerDTO {
  id: number
  bpDeveloperId: string
  bpCifrera: string
  bpDeveloperRegNo: string
  bpName: string
  bpMasterName: string
  bpNameLocal: string | null
  bpOnboardingDate: string | null
  bpContactAddress: string | null
  bpContactTel: string | null
  bpPoBox: string | null
  bpMobile: string | null
  bpFax: string | null
  bpEmail: string | null
  bpLicenseNo: string | null
  bpLicenseExpDate: string | null
  bpWorldCheckFlag: string | null
  bpWorldCheckRemarks: string | null
  bpMigratedData: boolean | null
  bpremark: string | null
  bpRegulatorDTO: any | null
  bpActiveStatusDTO: any | null
  beneficiaryIds: any[]
  deleted: boolean | null
  taskStatusDTO: any | null
}

export interface LanguageTranslationId {
  id: number
  configId: string
  configValue: string
  content: any | null
  status: any | null
  enabled: boolean
  deleted: boolean | null
}

export interface StatusDTO {
  id: number
  settingKey: string
  settingValue: string
  languageTranslationId: LanguageTranslationId
  remarks: any | null
  status: any | null
  enabled: boolean
  deleted: boolean | null
}

export interface RealEstateAsset {
  id: number
  reaId: string
  reaCif: string
  reaName: string
  reaNameLocal: string | null
  reaLocation: string
  reaReraNumber: string
  reaStartDate: string | null
  reaCompletionDate: string | null
  reaPercentComplete: string | null
  reaConstructionCost: number
  reaAccStatusDate: string | null
  reaRegistrationDate: string | null
  reaNoOfUnits: number
  reaRemarks: string | null
  reaSpecialApproval: string | null
  reaManagedBy: string | null
  reaBackupUser: string | null
  reaRetentionPercent: string | null
  reaAdditionalRetentionPercent: string | null
  reaTotalRetentionPercent: string | null
  reaRetentionEffectiveDate: string | null
  reaManagementExpenses: string | null
  reaMarketingExpenses: string | null
  reaAccoutStatusDate: string | null
  reaTeamLeadName: string | null
  reaRelationshipManagerName: string | null
  reaAssestRelshipManagerName: string | null
  reaRealEstateBrokerExp: number
  reaAdvertisementExp: number
  reaLandOwnerName: string | null
  buildPartnerDTO: BuildPartnerDTO
  reaStatusDTO: StatusDTO
  reaTypeDTO: StatusDTO
  reaAccountStatusDTO: StatusDTO
  reaConstructionCostCurrencyDTO: StatusDTO
  status: string | null
  reaBlockPaymentTypeDTO: StatusDTO | null
  deleted: boolean | null
  taskStatusDTO: any | null
}

export interface RealEstateAssetResponse {
  content: RealEstateAsset[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

export class RealEstateAssetService {
  /**
   * Fetch all real estate assets from the API
   * @param page - Page number (default: 0)
   * @param size - Page size (default: 20)
   * @returns Promise<RealEstateAsset[]>
   */
  async getRealEstateAssets(
    page: number = 0,
    size: number = 20
  ): Promise<RealEstateAsset[]> {
    try {
      const url = buildApiUrl(`/real-estate-assest?page=${page}&size=${size}`)
      const result = await apiClient.get<
        RealEstateAssetResponse | RealEstateAsset[]
      >(url)

      // Handle both response formats: direct array or paginated response
      let assets: RealEstateAsset[] = []

      if (Array.isArray(result)) {
        // Direct array response (as shown in your example)
        assets = result
      } else if (result && typeof result === 'object' && 'content' in result) {
        // Paginated response
        assets = result.content || []
      } else {
        assets = []
      }

      return assets
    } catch (error) {
      console.error(
        ' RealEstateAssetService.getRealEstateAssets Failed:',
        error
      )
      throw error
    }
  }

  /**
   * Find real estate asset by name
   * @param name - Asset name to search for
   * @returns RealEstateAsset | undefined
   */
  async findAssetByName(name: string): Promise<RealEstateAsset | undefined> {
    try {
      const assets = await this.getRealEstateAssets(0, 100) // Get more assets for search
      return assets.find((asset) => asset.reaName === name)
    } catch (error) {
      console.error('RealEstateAssetService.findAssetByName Failed:', {
        name,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
      return undefined
    }
  }

  /**
   * Find real estate asset by ID
   * @param assetId - Asset ID to search for
   * @returns RealEstateAsset | undefined
   */
  async findAssetById(assetId: string): Promise<RealEstateAsset | undefined> {
    try {
      const assets = await this.getRealEstateAssets(0, 100) // Get more assets for search
      return assets.find((asset) => asset.reaId === assetId)
    } catch (error) {
      console.error('RealEstateAssetService.findAssetById Failed:', {
        assetId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
      return undefined
    }
  }

  /**
   * Delete a real estate asset
   * @param assetId - Asset ID to delete
   * @returns Promise<void>
   */
  async deleteRealEstateAsset(assetId: string): Promise<void> {
    try {
      const url = buildApiUrl(`/real-estate-assest/${assetId}`)
      await apiClient.delete(url)

     
    } catch (error) {
      console.error('RealEstateAssetService.deleteRealEstateAsset Failed:', {
        assetId,
        error: error instanceof Error ? error.message : 'Unknown error',

        timestamp: new Date().toISOString(),
      })
      throw error
    }
  }

  /**
   * Search real estate assets by name with pagination
   * Used for autocomplete functionality
   */
  async searchRealEstateAssets(
    query: string,
    page = 0,
    size = 20
  ): Promise<RealEstateAsset[]> {
    try {
      if (!query || query.trim().length === 0) {
        return []
      }

      const params = new URLSearchParams({
        'reaName.contains': query.trim(),
        'page': page.toString(),
        'size': size.toString(),
        'deleted.equals': 'false',
        'enabled.equals': 'true',
      })

      const url = buildApiUrl(`/real-estate-assest?${params.toString()}`)
      const response = await apiClient.get(url)
      
      // Handle both single object and paginated response formats
      let assets: RealEstateAsset[] = []
      
      if (Array.isArray(response)) {
        // Direct array response
        assets = response
      } else if (response && typeof response === 'object') {
        if ('content' in response && Array.isArray(response.content)) {
          // Paginated response format
          assets = response.content
        } else if ('id' in response || 'reaName' in response) {
          // Single object response - wrap in array
          assets = [response as RealEstateAsset]
        }
      }
      
      return assets
    } catch (error) {
      console.error('Error searching real estate assets:', error)
      throw new Error('Failed to search real estate assets')
    }
  }
}

// Create service instance
export const realEstateAssetService = new RealEstateAssetService()
