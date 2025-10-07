import { apiClient } from '@/lib/apiClient'

export interface ComplianceCheck {
  id: string
  type: 'kyc' | 'aml' | 'sanctions'
  status: 'pending' | 'approved' | 'rejected'
  userId: string
  createdAt: string
  completedAt?: string
  details?: Record<string, unknown>
}

export class ComplianceService {
  async runKYC(userId: string): Promise<ComplianceCheck> {
    return apiClient.post<ComplianceCheck>('/compliance/kyc', { userId })
  }

  async runAML(userId: string): Promise<ComplianceCheck> {
    return apiClient.post<ComplianceCheck>('/compliance/aml', { userId })
  }

  async getComplianceChecks(userId: string): Promise<ComplianceCheck[]> {
    return apiClient.get<ComplianceCheck[]>(`/compliance/checks/${userId}`)
  }

  async approveComplianceCheck(checkId: string): Promise<ComplianceCheck> {
    return apiClient.post<ComplianceCheck>(`/compliance/checks/${checkId}/approve`)
  }

  async rejectComplianceCheck(checkId: string, reason: string): Promise<ComplianceCheck> {
    return apiClient.post<ComplianceCheck>(`/compliance/checks/${checkId}/reject`, { reason })
  }
}

export const complianceService = new ComplianceService() 