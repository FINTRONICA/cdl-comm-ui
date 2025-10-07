import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'

// ---------- Request DTO ----------
export interface CapitalPartnerUnitBookingRequest {
  cpubAmountPaid?: number
  cpubAreaSize?: number
  cpubForFeitAmount?: number
  cpubDldAmount?: number
  cpubRefundAmount?: number
  cpubRemarks?: string
  cpubTransferredAmount?: number
  capitalPartnerUnitDTOS?: Array<{ id: number }>
  deleted?: boolean
}

// ---------- Response DTO ----------
export interface CapitalPartnerUnitBookingResponse {
  id: number
  cpubAmountPaid?: number
  cpubAreaSize?: number
  cpubForFeitAmount?: number
  cpubDldAmount?: number
  cpubRefundAmount?: number
  cpubRemarks?: string
  cpubTransferredAmount?: number
  capitalPartnerUnitDTOS?: Array<{ id: number }>
  deleted: boolean
  createdAt?: string
  updatedAt?: string
}

// ---------- Service ----------
class CapitalPartnerUnitBookingService {
  async getCapitalPartnerUnitBookingById(
    id: number
  ): Promise<CapitalPartnerUnitBookingResponse> {
    const url = buildApiUrl(
      API_ENDPOINTS.CAPITAL_PARTNER_UNIT_BOOKING.GET_BY_ID(id.toString())
    )
    const data = await apiClient.get<CapitalPartnerUnitBookingResponse>(url)
    return data
  }

  async updateCapitalPartnerUnitBooking(
    id: number,
    payload: Partial<CapitalPartnerUnitBookingRequest>
  ): Promise<CapitalPartnerUnitBookingResponse> {
    const url = buildApiUrl(
      API_ENDPOINTS.CAPITAL_PARTNER_UNIT_BOOKING.UPDATE(id.toString())
    )
    const response = await apiClient.put(url, payload)
    return response as CapitalPartnerUnitBookingResponse
  }

  async deleteCapitalPartnerUnitBooking(id: number): Promise<void> {
    const url = buildApiUrl(
      API_ENDPOINTS.CAPITAL_PARTNER_UNIT_BOOKING.DELETE(id.toString())
    )
    await apiClient.delete(url)
  }

  async createCapitalPartnerUnitBooking(
    payload: any
  ): Promise<CapitalPartnerUnitBookingResponse> {
    const url = buildApiUrl(API_ENDPOINTS.CAPITAL_PARTNER_UNIT_BOOKING.SAVE)
    const response = await apiClient.post(url, payload)
    return response as CapitalPartnerUnitBookingResponse
  }
}

// Export service instance
export const capitalPartnerUnitBookingService =
  new CapitalPartnerUnitBookingService()
export { CapitalPartnerUnitBookingService }
