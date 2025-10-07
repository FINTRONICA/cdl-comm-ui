import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'

// ---------- Request DTO ----------
export interface CapitalPartnerUnitPurchaseRequest {
  cpuPurchaseDate?: string
  cpupSaleRate?: number
  cpuPurchasePrice?: number
  cpupUnitRegistrationFee?: number
  cpupAgentName?: string
  cpupAgentId?: string
  cpupGrossSaleprice?: number
  cpupVatApplicable?: boolean
  cpupDeedNo?: string
  cpupAgreementNo?: string
  cpupAgreementDate?: string
  cpupSalePurchaseAgreement?: boolean
  cpupWorldCheck?: boolean
  cpupAmtPaidToDevInEscorw?: number
  cpupAmtPaidToDevOutEscorw?: number
  cpupTotalAmountPaid?: number
  cpupUnitIban?: string
  cpupOqood?: boolean
  cpupOqoodPaid?: boolean
  cpupOqoodAmountPaid?: number
  cpupUnitAreaSize?: number
  cpupForfeitAmount?: number
  cpupDldAmount?: number
  cpupRefundAmount?: number
  cpupRemarks?: string
  cpupTransferredAmount?: number
  cpupUnitNoOtherFormat?: string
  cpupSalePrice?: number
  cpupProjectPaymentPlan?: boolean
  cpupReservationBookingForm?: boolean
  cpupModificationFeeNeeded?: boolean
  cpupCreditCurrencyDTO?: any
  cpuPurchasePriceCurrencyDTO?: any
  capitalPartnerUnitDTO?: {
    id: number
    capitalPartnerDTOS?: Array<{ id: number }>
  }
  deleted?: boolean
}

// ---------- Response DTO ----------
export interface CapitalPartnerUnitPurchaseResponse {
  id: number
  cpuPurchaseDate?: string
  cpupSaleRate?: number
  cpuPurchasePrice?: number
  cpupUnitRegistrationFee?: number
  cpupAgentName?: string
  cpupAgentId?: string
  cpupGrossSaleprice?: number
  cpupVatApplicable?: boolean
  cpupDeedNo?: string
  cpupAgreementNo?: string
  cpupAgreementDate?: string
  cpupSalePurchaseAgreement?: boolean
  cpupWorldCheck?: boolean
  cpupAmtPaidToDevInEscorw?: number
  cpupAmtPaidToDevOutEscorw?: number
  cpupTotalAmountPaid?: number
  cpupUnitIban?: string
  cpupOqood?: boolean
  cpupOqoodPaid?: boolean
  cpupOqoodAmountPaid?: number
  cpupUnitAreaSize?: number
  cpupForfeitAmount?: number
  cpupDldAmount?: number
  cpupRefundAmount?: number
  cpupRemarks?: string
  cpupTransferredAmount?: number
  cpupUnitNoOtherFormat?: string
  cpupSalePrice?: number
  cpupProjectPaymentPlan?: boolean
  cpupReservationBookingForm?: boolean
  cpupModificationFeeNeeded?: boolean
  cpupCreditCurrencyDTO?: any
  cpuPurchasePriceCurrencyDTO?: any
  capitalPartnerUnitDTO?: {
    id: number
    capitalPartnerDTOS?: Array<{ id: number }>
  }
  deleted: boolean
  createdAt?: string
  updatedAt?: string
}

// ---------- Service ----------
class CapitalPartnerUnitPurchaseService {
  async getCapitalPartnerUnitPurchaseById(
    id: number
  ): Promise<CapitalPartnerUnitPurchaseResponse> {
    const url = buildApiUrl(
      API_ENDPOINTS.CAPITAL_PARTNER_UNIT_PURCHASE.GET_BY_ID(id.toString())
    )
    const data = await apiClient.get<CapitalPartnerUnitPurchaseResponse>(url)
    return data
  }

  async updateCapitalPartnerUnitPurchase(
    id: number,
    payload: Partial<CapitalPartnerUnitPurchaseRequest>
  ): Promise<CapitalPartnerUnitPurchaseResponse> {
    const url = buildApiUrl(
      API_ENDPOINTS.CAPITAL_PARTNER_UNIT_PURCHASE.UPDATE(id.toString())
    )
    const response = await apiClient.put(url, payload)
    return response as CapitalPartnerUnitPurchaseResponse
  }

  async deleteCapitalPartnerUnitPurchase(id: number): Promise<void> {
    const url = buildApiUrl(
      API_ENDPOINTS.CAPITAL_PARTNER_UNIT_PURCHASE.DELETE(id.toString())
    )
    await apiClient.delete(url)
  }

  async createCapitalPartnerUnitPurchase(
    payload: any
  ): Promise<CapitalPartnerUnitPurchaseResponse> {
    const url = buildApiUrl(API_ENDPOINTS.CAPITAL_PARTNER_UNIT_PURCHASE.SAVE)
    const response = await apiClient.post(url, payload)
    return response as CapitalPartnerUnitPurchaseResponse
  }
}

// Export service instance
export const capitalPartnerUnitPurchaseService =
  new CapitalPartnerUnitPurchaseService()
export { CapitalPartnerUnitPurchaseService }
