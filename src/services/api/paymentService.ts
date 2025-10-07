import { apiClient } from '@/lib/apiClient'

export interface PaymentMethod {
  id: string
  type: 'bank_account' | 'credit_card' | 'wire_transfer'
  name: string
  isDefault: boolean
  last4?: string
  bankName?: string
}

export interface CreatePaymentRequest {
  amount: number
  currency: string
  paymentMethodId: string
  description: string
  metadata?: Record<string, unknown>
}

export class PaymentService {
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return apiClient.get<PaymentMethod[]>('/transactions/methods')
  }

  async createPayment(data: CreatePaymentRequest): Promise<any> {
    return apiClient.post<any>('/transactions', data)
  }

  async getPayment(id: string): Promise<any> {
    return apiClient.get<any>(`/transactions/${id}`)
  }
}

export const paymentService = new PaymentService() 