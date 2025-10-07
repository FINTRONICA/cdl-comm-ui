import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'

// ---------- Request DTO ----------
export interface CapitalPartnerPaymentPlanRequest {
  cpppInstallmentNumber?: number
  cpppInstallmentDate?: string
  cpppBookingAmount?: number
  capitalPartnerDTO?: {
    id: number
  }
  deleted?: boolean
}

// ---------- Response DTO ----------
export interface CapitalPartnerPaymentPlanResponse {
  id: number
  cpppInstallmentNumber: number
  cpppInstallmentDate: string
  cpppBookingAmount: number
  capitalPartnerDTO: any
  deleted: boolean
}

// ---------- Service ----------
class CapitalPartnerPaymentPlanService {
  async getCapitalPartnerPaymentPlanById(
    id: number
  ): Promise<CapitalPartnerPaymentPlanResponse> {
    const url = buildApiUrl(
      API_ENDPOINTS.CAPITAL_PARTNER_PAYMENT_PLAN.GET_BY_ID(id.toString())
    )
    const data = await apiClient.get<CapitalPartnerPaymentPlanResponse>(url)
    return data
  }

  async updateCapitalPartnerPaymentPlan(
    id: number,
    payload: Partial<CapitalPartnerPaymentPlanRequest>
  ): Promise<CapitalPartnerPaymentPlanResponse> {
    const url = buildApiUrl(
      API_ENDPOINTS.CAPITAL_PARTNER_PAYMENT_PLAN.UPDATE(id.toString())
    )
    const response = await apiClient.put(url, payload)
    return response as CapitalPartnerPaymentPlanResponse
  }

  async deleteCapitalPartnerPaymentPlan(id: number): Promise<void> {
    const url = buildApiUrl(
      API_ENDPOINTS.CAPITAL_PARTNER_PAYMENT_PLAN.DELETE(id.toString())
    )
    await apiClient.delete(url)
  }

  async createCapitalPartnerPaymentPlan(
    payload: any
  ): Promise<CapitalPartnerPaymentPlanResponse> {
    const url = buildApiUrl(API_ENDPOINTS.CAPITAL_PARTNER_PAYMENT_PLAN.SAVE)
    const response = await apiClient.post(url, payload)
    return response as CapitalPartnerPaymentPlanResponse
  }
}

// Export service instance
export const capitalPartnerPaymentPlanService =
  new CapitalPartnerPaymentPlanService()
export { CapitalPartnerPaymentPlanService }
