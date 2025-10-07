import { apiClient } from '@/lib/apiClient'
import type { FeeType } from '@/types'

export class FeeService {
  async getFeeTypes(): Promise<FeeType[]> {
    return apiClient.get<FeeType[]>('/fees/types')
  }

  async createFeeType(data: Omit<FeeType, 'id' | 'createdAt' | 'updatedAt'>): Promise<FeeType> {
    return apiClient.post<FeeType>('/fees/types', data)
  }

  async updateFeeType(id: string, updates: Partial<FeeType>): Promise<FeeType> {
    return apiClient.put<FeeType>(`/fees/types/${id}`, updates)
  }

  async deleteFeeType(id: string): Promise<void> {
    await apiClient.delete(`/fees/types/${id}`)
  }
}

export const feeService = new FeeService() 