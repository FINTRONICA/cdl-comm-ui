import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'

// ---------- Response DTOs ----------
export interface BuildPartnerDTO {
  id: number
  bpDeveloperId: string
  bpCifrera: string
  bpDeveloperRegNo: string
  bpName: string
  bpMasterName: string
  bpNameLocal: string
  bpOnboardingDate: string
  bpContactAddress: string
  bpContactTel: string
  bpPoBox: string
  bpMobile: string
  bpFax: string
  bpEmail: string
  bpLicenseNo: string
  bpLicenseExpDate: string
  bpWorldCheckFlag: string
  bpWorldCheckRemarks: string
  bpMigratedData: boolean
  bpremark: string
  bpRegulatorDTO: any
  bpActiveStatusDTO: any
  beneficiaryIds: number[]
  deleted: boolean | null
  taskStatusDTO: any
}

export interface RealEstateAsset {
  id: number
  reaId: string
  reaCif: string
  reaName: string
  reaNameLocal: string
  reaLocation: string
  reaReraNumber: string
  reaStartDate: string
  reaCompletionDate: string
  reaPercentComplete: string
  reaConstructionCost: number
  reaAccStatusDate: string
  reaRegistrationDate: string
  reaNoOfUnits: number
  reaRemarks: string
  reaSpecialApproval: string
  reaManagedBy: string
  reaBackupUser: string
  reaRetentionPercent: string
  reaAdditionalRetentionPercent: string
  reaTotalRetentionPercent: string
  reaRetentionEffectiveDate: string
  reaManagementExpenses: string
  reaMarketingExpenses: string
  reaAccoutStatusDate: string
  reaTeamLeadName: string
  reaRelationshipManagerName: string
  reaAssestRelshipManagerName: string
  reaRealEstateBrokerExp: number
  reaAdvertisementExp: number
  reaLandOwnerName: string
  buildPartnerDTO: BuildPartnerDTO
  reaStatusDTO: any
  reaTypeDTO: any
  reaAccountStatusDTO: any
  reaConstructionCostCurrencyDTO: any
  status: any
  reaBlockPaymentTypeDTO: any
  deleted: boolean
  taskStatusDTO: any
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

// ---------- Service ----------
class RealEstateAssetService {
  async getRealEstateAssetById(id: number): Promise<RealEstateAsset> {
    const url = buildApiUrl(
      API_ENDPOINTS.REAL_ESTATE_ASSET.GET_BY_ID(id.toString())
    )
    const data = await apiClient.get<RealEstateAsset>(url)
    return data
  }

  async updateRealEstateAsset(
    id: number,
    payload: Partial<RealEstateAsset>
  ): Promise<RealEstateAsset> {
    const url = buildApiUrl(
      API_ENDPOINTS.REAL_ESTATE_ASSET.UPDATE(id.toString())
    )
    const response = await apiClient.put(url, payload)
    return response as RealEstateAsset
  }

  async deleteRealEstateAsset(id: number): Promise<void> {
    const url = buildApiUrl(
      API_ENDPOINTS.REAL_ESTATE_ASSET.SOFT_DELETE(id.toString())
    )
    await apiClient.delete(url)
  }

  async createRealEstateAsset(payload: any): Promise<RealEstateAsset> {
    const url = buildApiUrl(API_ENDPOINTS.REAL_ESTATE_ASSET.SAVE)
    const response = await apiClient.post(url, payload)
    return response as RealEstateAsset
  }

  async findAllRealEstateAssets(): Promise<RealEstateAssetResponse> {
    const url = buildApiUrl(API_ENDPOINTS.REAL_ESTATE_ASSET.FIND_ALL)
    const filteredUrl = `${url}`
    const data = await apiClient.get<RealEstateAssetResponse>(filteredUrl)
    return data
  }

  async getRealEstateAssets(
    page = 0,
    size = 1000
  ): Promise<RealEstateAssetResponse> {
    const url = buildApiUrl(API_ENDPOINTS.REAL_ESTATE_ASSET.GET_ALL)
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })
    const fullUrl = `${url}&${queryParams.toString()}`
    const data = await apiClient.get<RealEstateAssetResponse>(fullUrl)
    return data
  }
}

// Export service instance
export const realEstateAssetService = new RealEstateAssetService()
export { RealEstateAssetService }
