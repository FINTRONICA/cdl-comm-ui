import { apiClient } from '@/lib/apiClient'

export class ReportService {
  async generateReport(type: string, filters: Record<string, unknown>): Promise<any> {
    return apiClient.post<any>('/reports/generate', { type, filters })
  }

  async getReport(id: string): Promise<any> {
    return apiClient.get<any>(`/reports/${id}`)
  }

  async exportReport(id: string, format: 'pdf' | 'xlsx' | 'csv'): Promise<Blob> {
    const response = await apiClient.get(`/reports/${id}/export?format=${format}`, {
      responseType: 'blob'
    })
    return response as Blob
  }
}

export const reportService = new ReportService() 