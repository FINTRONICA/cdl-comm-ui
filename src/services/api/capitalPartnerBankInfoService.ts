import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'

// ---------- Request DTO ----------
export interface CapitalPartnerBankInfoRequest {
  cpbiPayeeName?: string
  cpbiPayeeAddress?: string
  cpbiBankName?: string
  cpbiBankAddress?: string
  cpbiBicCode?: string
  cpbiBeneRoutingCode?: string
  cpbiAccountNumber?: string
  cpbiIban?: string
  capitalPartnerDTO?: { id: string }
  payModeDTO?: {
    id: number
  }
  deleted?: boolean
}

// ---------- Response DTO ----------
export interface CapitalPartnerBankInfoResponse {
  id: number
  cpbiPayeeName?: string
  cpbiPayeeAddress?: string
  cpbiBankName?: string
  cpbiBankAddress?: string
  cpbiBicCode?: string
  cpbiBeneRoutingCode?: string
  cpbiAccountNumber?: string
  cpbiIban?: string
  capitalPartnerDTO?: { id: string }
  payModeDTO?: {
    id: number
    settingKey?: string
    settingValue?: string
    languageTranslationId?: any
    remarks?: string
    status?: string
    enabled?: boolean
    deleted?: boolean
  }
  deleted: boolean
  createdAt?: string
  updatedAt?: string
}

// ---------- Service ----------
class CapitalPartnerBankInfoService {
  async getCapitalPartnerBankInfoById(
    id: number
  ): Promise<CapitalPartnerBankInfoResponse> {
    const url = buildApiUrl(
      API_ENDPOINTS.CAPITAL_PARTNER_BANK_INFO.GET_BY_ID(id.toString())
    )
    const data = await apiClient.get<CapitalPartnerBankInfoResponse>(url)
    return data
  }

  async updateCapitalPartnerBankInfo(
    id: number,
    payload: Partial<CapitalPartnerBankInfoRequest>
  ): Promise<CapitalPartnerBankInfoResponse> {
    const url = buildApiUrl(
      API_ENDPOINTS.CAPITAL_PARTNER_BANK_INFO.UPDATE(id.toString())
    )
    const response = await apiClient.put(url, payload)
    return response as CapitalPartnerBankInfoResponse
  }

  async deleteCapitalPartnerBankInfo(id: number): Promise<void> {
    const url = buildApiUrl(
      API_ENDPOINTS.CAPITAL_PARTNER_BANK_INFO.DELETE(id.toString())
    )
    await apiClient.delete(url)
  }

  async createCapitalPartnerBankInfo(
    payload: any
  ): Promise<CapitalPartnerBankInfoResponse> {
    const url = buildApiUrl(API_ENDPOINTS.CAPITAL_PARTNER_BANK_INFO.SAVE)
    const response = await apiClient.post(url, payload)
    return response as CapitalPartnerBankInfoResponse
  }
}

// Export service instance
export const capitalPartnerBankInfoService = new CapitalPartnerBankInfoService()
export { CapitalPartnerBankInfoService }
