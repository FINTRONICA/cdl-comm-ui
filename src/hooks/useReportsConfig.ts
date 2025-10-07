import { useState, useCallback } from 'react'
import { useApi } from './useApi'

interface ReportFormData {
  [key: string]: string | string[] | number | boolean
}

interface ReportsConfigHook {
  generateReport: (reportId: string, formData: ReportFormData) => Promise<void>
  downloadTemplate: (reportId: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

export const useReportsConfig = (): ReportsConfigHook => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { execute } = useApi()

  const generateReport = useCallback(async (reportId: string, formData: ReportFormData) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await execute({
        method: 'POST',
        url: `/reports/generate/${reportId}`,
        data: formData,
      }) as { downloadUrl?: string; filename?: string }

      if (response?.downloadUrl) {
        // Trigger download
        const link = document.createElement('a')
        link.href = response.downloadUrl
        link.download = response.filename || `${reportId}-report.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err) {
      console.error('Error generating report:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate report')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [execute])

  const downloadTemplate = useCallback(async (reportId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await execute({
        method: 'GET',
        url: `/reports/template/${reportId}`,
        responseType: 'blob',
      }) as Blob

      // Create blob and download
      const blob = new Blob([response], { type: 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${reportId}-template.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading template:', err)
      setError(err instanceof Error ? err.message : 'Failed to download template')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [execute])

  return {
    generateReport,
    downloadTemplate,
    isLoading,
    error,
  }
}
