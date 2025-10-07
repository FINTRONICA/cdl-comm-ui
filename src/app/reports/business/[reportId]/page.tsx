'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { ArrowLeft, Download, RefreshCw } from 'lucide-react'
import { useReportsConfig } from '@/hooks/useReportsConfig'
import { useProjects } from '@/hooks/useProjects'
import { useBuildPartners } from '@/hooks/useBuildPartners'
import { ReportFormFields } from '@/components/organisms/ReportFormFields'
import { ReportResultsTable } from '@/components/organisms/ReportResultsTable'
import { Button } from '@/components/atoms/Button'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { apiClient } from '@/lib/apiClient'
import { getReportConfiguration } from '@/config/reportsConfig'


const ReportDetailPage = () => {
  const router = useRouter()
  const params = useParams()
  const reportId = params?.reportId as string
  
  const [formData, setFormData] = useState<Record<string, string | string[]>>({})
  const [isGenerating, setIsGenerating] = useState(true) // Start with loading state
  const [isDownloading, setIsDownloading] = useState(false)
  const [reportResults, setReportResults] = useState<Array<{
    id: string
    [key: string]: string | number | boolean | null | undefined
  }>>([])

  const { getLabelResolver } = useSidebarConfig()
  
  // Fetch real project data
  const { data: projectsData } = useProjects(0, 1000)
  
  // Fetch real developer data (build partners)
  const { data: developersData } = useBuildPartners(0, 1000)

  const projectOptions = useMemo(() => {
    if (!projectsData?.content) return []
    return projectsData.content
      .filter(project => project.id) // Only include projects with valid IDs
      .map((project, index) => ({
        value: project.id?.toString(), // Use actual API id field
        label: project.reaName || `Unnamed Project ${index + 1}`,
        originalId: project.id?.toString() // Use actual API id field
      }))
      .filter(option => option.value && option.value !== '')
  }, [projectsData])

  const developerOptions = useMemo(() => {
    if (!developersData?.content) return []
    return developersData.content
      .filter(buildPartner => buildPartner.id) // Only include developers with valid IDs
      .map((buildPartner, index) => ({
        value: buildPartner.id?.toString(), // Use actual API id field
        label: buildPartner.bpName || `Developer ${index + 1}`,
        originalId: buildPartner.id?.toString() // Use actual API id field
      }))
      .filter(option => option.value && option.value !== '')
  }, [developersData])

  const reportConfig = useMemo(() => {
    return getReportConfiguration(reportId, projectOptions, developerOptions)
  }, [reportId, projectOptions, developerOptions])

  const businessReportTitle = getLabelResolver 
    ? getLabelResolver('business', 'Business Report')
    : 'Business Report'

  const handleBack = () => {
    router.push('/reports/business')
  }

  const handleFieldChange = (fieldId: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloading(true)
      
      const getFormValue = (value: string | string[]) => {
        return Array.isArray(value) ? value[0] : value
      }
      
      // Since we now use actual API IDs directly, just return the value
      const getOriginalProjectId = (uniqueValue: string) => {
        return uniqueValue || null
      }
      
      // For download-only reports, use main endpoint; for regular reports, use downloadEndpoint
      const downloadEndpoint = reportConfig.api.downloadOnly 
        ? reportConfig.api.endpoint 
        : (reportConfig.api.downloadEndpoint || reportConfig.api.endpoint)
      
      // Build payload dynamically
      const downloadPayload: Record<string, string | number | null> = {}
      
      // For download-only reports, don't add format and pagination
      if (!reportConfig.api.downloadOnly) {
        downloadPayload.format = 'template'
        downloadPayload.page = 0
        downloadPayload.size = 100
      }
      
      // Add only the fields specified in the configuration
      reportConfig.api.payloadFields.forEach(fieldName => {
        if (fieldName === 'projectId' && formData.projectId) {
          downloadPayload[fieldName] = getOriginalProjectId(getFormValue(formData.projectId) || '')
        } else if (fieldName === 'developerId' && formData.developerId) {
          downloadPayload[fieldName] = getOriginalProjectId(getFormValue(formData.developerId) || '')
        } else if (formData[fieldName]) {
          downloadPayload[fieldName] = getFormValue(formData[fieldName]) || null
        } else {
          downloadPayload[fieldName] = null
        }
      })
      
      console.log('Download Endpoint:', downloadEndpoint)
      console.log('Download Payload:', downloadPayload)
      
      // For download-only reports, call API directly and handle file response
      if (reportConfig.api.downloadOnly) {
        // For download-only reports, the API returns a file directly
        const response = await apiClient.post(downloadEndpoint, downloadPayload, {
          responseType: 'blob'
        })
        
        // Generate filename based on report type and current date (generic extension)
        const reportName = reportConfig.title.replace(/\s+/g, '-').toLowerCase()
        const currentDate = new Date().toISOString().split('T')[0]
        const filename = `${reportName}-${currentDate}`
        
        // Create blob and trigger download (let browser determine file type)
        const blob = response instanceof Blob ? response : new Blob([response as BlobPart])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        console.log('File download completed successfully:', filename)
      } else {
        // For regular reports, use downloadEndpoint and handle file response
        const response = await apiClient.post(downloadEndpoint, downloadPayload, {
          responseType: 'blob'
        })
        
        // Generate filename based on report type and current date (generic extension)
        const reportName = reportConfig.title.replace(/\s+/g, '-').toLowerCase()
        const currentDate = new Date().toISOString().split('T')[0]
        const filename = `${reportName}-template-${currentDate}`
        
        // Create blob and trigger download (let browser determine file type)
        const blob = response instanceof Blob ? response : new Blob([response as BlobPart])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        console.log('Template file download completed successfully:', filename)
      }
      
    } catch (error) {
      console.error('Error downloading file:', error)
      // Handle error - show toast notification
    } finally {
      setIsDownloading(false)
    }
  }

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true)
      
      const getFormValue = (value: string | string[]) => {
        return Array.isArray(value) ? value[0] : value
      }
      
      // Since we now use actual API IDs directly, just return the value
      const getOriginalProjectId = (uniqueValue: string) => {
        return uniqueValue || null
      }

      // Get API configuration from the centralized config
      const apiEndpoint = reportConfig.api.endpoint
      
      // Build payload dynamically based on configuration
      const configPayload: Record<string, string | number | null> = {
        page: 0,
        size: 100
      }
      
      // Add only the fields specified in the configuration
      reportConfig.api.payloadFields.forEach(fieldName => {
        if (fieldName === 'projectId' && formData.projectId) {
          configPayload[fieldName] = getOriginalProjectId(getFormValue(formData.projectId) || '')
        } else if (fieldName === 'developerId' && formData.developerId) {
          configPayload[fieldName] = getOriginalProjectId(getFormValue(formData.developerId) || '')
        } else if (formData[fieldName]) {
          configPayload[fieldName] = getFormValue(formData[fieldName]) || null
        } else {
          configPayload[fieldName] = null
        }
      })
      
      console.log('API Endpoint:', apiEndpoint)
      console.log('Payload:', configPayload)
      
      // Use the same apiClient as other parts of the application
      const data = await apiClient.post<{
        content?: Array<{
          [key: string]: string | number | boolean | null | undefined;
        }>;
      }>(apiEndpoint, configPayload)
      
      // Transform API response to match table structure
      const transformedResults = data.content?.map((item: {
        serialNo?: number;
        transactionDate?: string;
        developerName?: string;
        projectName?: string;
        chargeType?: string;
        frequency?: string;
        perUnit?: string;
        transactionStatus?: string;
        rejectReason?: string;
      }, index: number) => ({
        id: item.serialNo?.toString() || index.toString(),
        serialNo: item.serialNo,
        transactionDate: item.transactionDate,
        developerName: item.developerName,
        projectName: item.projectName,
        chargeType: item.chargeType,
        frequency: item.frequency,
        perUnit: item.perUnit,
        transactionStatus: item.transactionStatus,
        rejectReason: item.rejectReason
      })) || []
      
      setReportResults(transformedResults)
    } catch (error) {
      console.error('Error generating report:', error)
      // Handle error - show toast notification
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadResults = async (format: 'pdf' | 'excel') => {
    try {
      setIsDownloading(true)
      
      const getFormValue = (value: string | string[]) => {
        return Array.isArray(value) ? value[0] : value
      }
      
      // Since we now use actual API IDs directly, just return the value
      const getOriginalProjectId = (uniqueValue: string) => {
        return uniqueValue || null
      }
      
      // Get download endpoint from configuration
      const downloadEndpoint = reportConfig.api.downloadEndpoint
      
      if (!downloadEndpoint) {
        console.warn('No download endpoint configured for this report')
        return
      }
      
      // Build payload dynamically using same logic as generate report
      const downloadPayload: Record<string, string | number | null> = {
        format: format, // Add the format to the payload
        page: 0,
        size: 100
      }
      
      // Add only the fields specified in the configuration
      reportConfig.api.payloadFields.forEach(fieldName => {
        if (fieldName === 'projectId' && formData.projectId) {
          downloadPayload[fieldName] = getOriginalProjectId(getFormValue(formData.projectId) || '')
        } else if (fieldName === 'developerId' && formData.developerId) {
          downloadPayload[fieldName] = getOriginalProjectId(getFormValue(formData.developerId) || '')
        } else if (formData[fieldName]) {
          downloadPayload[fieldName] = getFormValue(formData[fieldName]) || null
        } else {
          downloadPayload[fieldName] = null
        }
      })
      
      console.log('Download Endpoint:', downloadEndpoint)
      console.log('Download Payload:', downloadPayload)
      
      // Use apiClient to make the download request
      await apiClient.post(downloadEndpoint, downloadPayload)
      
      console.log(`${format.toUpperCase()} download completed successfully`)
      
    } catch (error) {
      console.error('Error downloading results:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  // Auto-load report data on page mount with null values (only for non-download-only reports)
  useEffect(() => {
    if (reportId && !reportConfig.api.downloadOnly) {
      handleGenerateReport()
    } else if (reportConfig.api.downloadOnly) {
      // For download-only reports, just set loading to false
      setIsGenerating(false)
    }
  }, [reportId, reportConfig.api.downloadOnly])

  return (
    <DashboardLayout title={businessReportTitle}>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
              </button>
              <h1 className="text-lg font-semibold text-[#1E2939]">
                {reportConfig.title}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                disabled={isDownloading}
                className="flex items-center gap-1 px-3 py-1 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                {isDownloading ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                {reportConfig.api.downloadOnly ? 'Download Report' : 'Download Template'}
              </Button>
              
              {!reportConfig.api.downloadOnly && (
                <Button
                  size="sm"
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  Generate Report
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-4">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <ReportFormFields
              fields={reportConfig.fields}
              values={formData}
              onChange={handleFieldChange}
            />
          </div>

          {/* Results Section - Only show table for non-download-only reports */}
          {!reportConfig.api.downloadOnly && (
            <ReportResultsTable
              data={reportResults}
              columns={reportConfig.api.columns}
              isLoading={isGenerating}
              onDownload={handleDownloadResults}
              reportTitle={reportConfig.title}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ReportDetailPage
