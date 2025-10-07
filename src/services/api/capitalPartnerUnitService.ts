import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'

// ---------- Request DTO ----------
export interface CapitalPartnerUnitRequest {
  unitRefId?: string
  altUnitRefId?: string
  name?: string
  isResale?: boolean
  resaleDate?: string
  unitSysId?: string
  otherFormatUnitNo?: string
  virtualAccNo?: string
  towerName?: string
  unitPlotSize?: string
  floor?: string
  noofBedroom?: string
  isModified?: boolean
  partnerUnitDTO?: string
  capitalPartnerUnitTypeDTO?: any
  realEstateAssestDTO?: any
  unitStatusDTO?: {
    id: number
    enabled?: boolean
  }
  propertyIdDTO?: {
    id: number
    enabled?: boolean
  }
  paymentPlanTypeDTO?: {
    id: number
    enabled?: boolean
  }
  capitalPartnerUnitBookingDTO?: {
    cpubAmountPaid?: number
    cpubAreaSize?: number
    cpubForFeitAmount?: number
    cpubDldAmount?: number
    cpubRefundAmount?: number
    cpubRemarks?: string
    cpubTransferredAmount?: number
    capitalPartnerUnitDTOS?: string[]
    deleted?: boolean
  }
  childCapitalPartnerUnitDTO?: string[]
  deleted?: boolean
}

// ---------- Response DTO ----------
export interface CapitalPartnerUnitResponse {
  id: number
  unitRefId: string
  altUnitRefId: string
  name: string
  isResale: boolean
  resaleDate: string
  unitSysId: string
  otherFormatUnitNo: string
  virtualAccNo: string
  towerName: string
  unitPlotSize: string
  floor: string
  noofBedroom: string
  isModified: boolean
  partnerUnitDTO: string
  capitalPartnerUnitTypeDTO: any
  realEstateAssestDTO: any
  unitStatusDTO: any
  propertyIdDTO: any
  paymentPlanTypeDTO: any
  capitalPartnerUnitBookingDTO: any
  childCapitalPartnerUnitDTO: string[]
  deleted: boolean
}

// ---------- Service ----------
class CapitalPartnerUnitService {
  async getCapitalPartnerUnitById(
    id: number
  ): Promise<CapitalPartnerUnitResponse> {
    const url = buildApiUrl(
      API_ENDPOINTS.CAPITAL_PARTNER_UNIT.GET_BY_ID(id.toString())
    )
    const data = await apiClient.get<CapitalPartnerUnitResponse>(url)
    return data
  }

  async updateCapitalPartnerUnit(
    id: number,
    payload: Partial<CapitalPartnerUnitRequest>
  ): Promise<CapitalPartnerUnitResponse> {
    const url = buildApiUrl(
      API_ENDPOINTS.CAPITAL_PARTNER_UNIT.UPDATE(id.toString())
    )
    const response = await apiClient.put(url, payload)
    return response as CapitalPartnerUnitResponse
  }

  async deleteCapitalPartnerUnit(id: number): Promise<void> {
    const url = buildApiUrl(
      API_ENDPOINTS.CAPITAL_PARTNER_UNIT.DELETE(id.toString())
    )
    await apiClient.delete(url)
  }

  async createCapitalPartnerUnit(
    payload: any
  ): Promise<CapitalPartnerUnitResponse> {
    const url = buildApiUrl(API_ENDPOINTS.CAPITAL_PARTNER_UNIT.SAVE)
    const response = await apiClient.post(url, payload)
    return response as CapitalPartnerUnitResponse
  }
}

// Export service instance
export const capitalPartnerUnitService = new CapitalPartnerUnitService()
export { CapitalPartnerUnitService }
