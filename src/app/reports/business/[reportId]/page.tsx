'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { ArrowLeft, Download, RefreshCw } from 'lucide-react'
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

  const [formData, setFormData] = useState<Record<string, string | string[]>>(
    {}
  )
  const [isGenerating, setIsGenerating] = useState(true) // Start with loading state
  const [isDownloading, setIsDownloading] = useState(false)
  const [reportResults, setReportResults] = useState<
    Array<{
      id: string
      [key: string]: string | number | boolean | null | undefined
    }>
  >([])

  const { getLabelResolver } = useSidebarConfig()

  // Fetch real project data
  const { data: projectsData } = useProjects(0, 1000)

  // Fetch real developer data (build partners)
  const { data: developersData } = useBuildPartners(0, 1000)

  const projectOptions = useMemo(() => {
    if (!projectsData?.content) return []
    return projectsData.content
      .filter((project) => project.id) // Only include projects with valid IDs
      .map((project, index) => ({
        value: project.id?.toString(), // Use actual API id field
        label: project.reaName || `Unnamed Project ${index + 1}`,
        originalId: project.id?.toString(), // Use actual API id field
      }))
      .filter((option) => option.value && option.value !== '')
  }, [projectsData])

  const developerOptions = useMemo(() => {
    if (!developersData?.content) return []
    return developersData.content
      .filter((buildPartner) => buildPartner.id) // Only include developers with valid IDs
      .map((buildPartner, index) => ({
        value: buildPartner.id?.toString(), // Use actual API id field
        label: buildPartner.bpName || `Developer ${index + 1}`,
        originalId: buildPartner.id?.toString(), // Use actual API id field
      }))
      .filter((option) => option.value && option.value !== '')
  }, [developersData])

  const reportConfig = useMemo(() => {
    const config = getReportConfiguration(
      reportId,
      projectOptions,
      developerOptions
    )
    return config
  }, [reportId, projectOptions, developerOptions])

  const businessReportTitle = getLabelResolver
    ? getLabelResolver('business', 'Business Report')
    : 'Business Report'

  const handleBack = () => {
    router.push('/reports/business')
  }

  const handleFieldChange = (fieldId: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
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

      // For beneficiary, transactions-audit, monthly-rera, monthly-tas, tas-batch-status, rt04-trust, and unit-history reports, use download endpoint
      const downloadEndpoint =
        reportId === 'beneficiary' ||
        reportId === 'transactions-audit' ||
        reportId === 'monthly-rera' ||
        reportId === 'monthly-tas' ||
        reportId === 'tas-batch-status' ||
        reportId === 'rt04-trust' ||
        reportId === 'unit-history'
          ? reportConfig.api.downloadEndpoint || reportConfig.api.endpoint
          : reportConfig.api.downloadOnly
            ? reportConfig.api.endpoint
            : reportConfig.api.downloadEndpoint || reportConfig.api.endpoint

      // Build payload dynamically based on report type
      const downloadPayload: Record<string, string | number | null> = {}

      // For beneficiary report, use specific payload structure from Swagger
      if (reportId === 'beneficiary') {
        downloadPayload.fromDate = formData.fromDate
          ? getFormValue(formData.fromDate) || null
          : null
        downloadPayload.toDate = formData.toDate
          ? getFormValue(formData.toDate) || null
          : null
        downloadPayload.status = formData.status
          ? getFormValue(formData.status) || null
          : null
        downloadPayload.page = 0
        downloadPayload.size = 100
      } else if (reportId === 'transactions-audit') {
        // For transactions-audit report, use specific payload structure
        downloadPayload.project = formData.project
          ? getFormValue(formData.project) || null
          : null
        downloadPayload.asOnDate = formData.asOnDate
          ? getFormValue(formData.asOnDate) || null
          : null
        downloadPayload.page = 0
        downloadPayload.size = 100
      } else if (reportId === 'monthly-rera') {
        // For monthly-rera report, use specific payload structure
        downloadPayload.developer = formData.developer
          ? getFormValue(formData.developer) || null
          : null
        downloadPayload.project = formData.project
          ? getFormValue(formData.project) || null
          : null
        downloadPayload.asOnDate = formData.asOnDate
          ? getFormValue(formData.asOnDate) || null
          : null
        downloadPayload.fromDate = formData.fromDate
          ? getFormValue(formData.fromDate) || null
          : null
        downloadPayload.toDate = formData.toDate
          ? getFormValue(formData.toDate) || null
          : null
        downloadPayload.page = 0
        downloadPayload.size = 100
      } else if (reportId === 'monthly-tas') {
        // For monthly-tas report, use specific payload structure
        downloadPayload.developer = formData.developer
          ? getFormValue(formData.developer) || null
          : null
        downloadPayload.project = formData.project
          ? getFormValue(formData.project) || null
          : null
        downloadPayload.asOnDate = formData.asOnDate
          ? getFormValue(formData.asOnDate) || null
          : null
        downloadPayload.fromDate = formData.fromDate
          ? getFormValue(formData.fromDate) || null
          : null
        downloadPayload.toDate = formData.toDate
          ? getFormValue(formData.toDate) || null
          : null
        downloadPayload.page = 0
        downloadPayload.size = 100
      } else if (reportId === 'tas-batch-status') {
        // For tas-batch-status report, use specific payload structure
        downloadPayload.fromDate = formData.fromDate
          ? getFormValue(formData.fromDate) || null
          : null
        downloadPayload.toDate = formData.toDate
          ? getFormValue(formData.toDate) || null
          : null
        downloadPayload.page = 0
        downloadPayload.size = 100
      } else if (reportId === 'rt04-trust') {
        // For rt04-trust report, use specific payload structure
        downloadPayload.developerName = formData.developerName
          ? getFormValue(formData.developerName) || null
          : null
        downloadPayload.projectName = formData.projectName
          ? getFormValue(formData.projectName) || null
          : null
        downloadPayload.unitNo = formData.unitNo
          ? getFormValue(formData.unitNo) || null
          : null
        downloadPayload.unitHolderName = formData.unitHolderName
          ? getFormValue(formData.unitHolderName) || null
          : null
        downloadPayload.page = 0
        downloadPayload.size = 100
      } else if (reportId === 'unit-history') {
        // For unit-history report, use specific payload structure
        downloadPayload.project = formData.project
          ? getFormValue(formData.project) || null
          : null
        downloadPayload.fromDate = formData.fromDate
          ? getFormValue(formData.fromDate) || null
          : null
        downloadPayload.toDate = formData.toDate
          ? getFormValue(formData.toDate) || null
          : null
        downloadPayload.page = 0
        downloadPayload.size = 100
      } else {
        // For other reports, use existing logic
        if (!reportConfig.api.downloadOnly) {
          downloadPayload.format = 'template'
          downloadPayload.page = 0
          downloadPayload.size = 100
        }

        // Add only the fields specified in the configuration
        reportConfig.api.payloadFields.forEach((fieldName) => {
          if (fieldName === 'projectId' && formData.projectId) {
            downloadPayload[fieldName] = getOriginalProjectId(
              getFormValue(formData.projectId) || ''
            )
          } else if (fieldName === 'developerId' && formData.developerId) {
            downloadPayload[fieldName] = getOriginalProjectId(
              getFormValue(formData.developerId) || ''
            )
          } else if (formData[fieldName]) {
            downloadPayload[fieldName] =
              getFormValue(formData[fieldName]!) || null
          } else {
            downloadPayload[fieldName] = null
          }
        })
      }

      // For beneficiary, transactions-audit, monthly-rera, monthly-tas, tas-batch-status, rt04-trust, unit-history reports or download-only reports, call API directly and handle file response
      if (
        reportId === 'beneficiary' ||
        reportId === 'transactions-audit' ||
        reportId === 'monthly-rera' ||
        reportId === 'monthly-tas' ||
        reportId === 'tas-batch-status' ||
        reportId === 'rt04-trust' ||
        reportId === 'unit-history' ||
        reportConfig.api.downloadOnly
      ) {
        // For download-only reports, the API returns a file directly
        const response = await apiClient.post(
          downloadEndpoint,
          downloadPayload,
          {
            responseType: 'blob',
          }
        )

        // Generate filename based on report type and current date (generic extension)
        const reportName = reportConfig.title.replace(/\s+/g, '-').toLowerCase()
        const currentDate = new Date().toISOString().split('T')[0]
        const filename = `${reportName}-${currentDate}`

        // Create blob and trigger download (let browser determine file type)
        const blob =
          response instanceof Blob ? response : new Blob([response as BlobPart])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        // For regular reports, use downloadEndpoint and handle file response
        const response = await apiClient.post(
          downloadEndpoint,
          downloadPayload,
          {
            responseType: 'blob',
          }
        )

        // Generate filename based on report type and current date (generic extension)
        const reportName = reportConfig.title.replace(/\s+/g, '-').toLowerCase()
        const currentDate = new Date().toISOString().split('T')[0]
        const filename = `${reportName}-template-${currentDate}`

        // Create blob and trigger download (let browser determine file type)
        const blob =
          response instanceof Blob ? response : new Blob([response as BlobPart])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
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
        size: 100,
      }

      // Add only the fields specified in the configuration
      reportConfig.api.payloadFields.forEach((fieldName) => {
        if (fieldName === 'projectId' && formData.projectId) {
          configPayload[fieldName] = getOriginalProjectId(
            getFormValue(formData.projectId) || ''
          )
        } else if (fieldName === 'developerId' && formData.developerId) {
          configPayload[fieldName] = getOriginalProjectId(
            getFormValue(formData.developerId) || ''
          )
        } else if (formData[fieldName]) {
          configPayload[fieldName] = getFormValue(formData[fieldName]!) || null
        } else {
          configPayload[fieldName] = null
        }
      })

      // Use the same apiClient as other parts of the application
      const data = await apiClient.post<{
        content?: Array<{
          [key: string]: string | number | boolean | null | undefined
        }>
      }>(apiEndpoint, configPayload)

      // Transform API response using report-specific transformation
      const transformedResults = reportConfig.api.transformResponse
        ? reportConfig.api.transformResponse(data)
        : data.content?.map((item: any, index: number) => ({
            // Fallback transformation for reports without specific transform
            id: item.serialNo?.toString() || index.toString(),
            serialNo: item.serialNo,
            transactionDate: item.transactionDate,
            developerName: item.developerName,
            projectName: item.projectName,
            chargeType: item.chargeType,
            frequency: item.frequency,
            perUnit: item.perUnit,
            transactionStatus: item.transactionStatus,
            rejectReason: item.rejectReason,
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
        size: 100,
      }

      // Add only the fields specified in the configuration
      reportConfig.api.payloadFields.forEach((fieldName) => {
        if (fieldName === 'projectId' && formData.projectId) {
          downloadPayload[fieldName] = getOriginalProjectId(
            getFormValue(formData.projectId) || ''
          )
        } else if (fieldName === 'developerId' && formData.developerId) {
          downloadPayload[fieldName] = getOriginalProjectId(
            getFormValue(formData.developerId) || ''
          )
        } else if (formData[fieldName]) {
          downloadPayload[fieldName] =
            getFormValue(formData[fieldName]!) || null
        } else {
          downloadPayload[fieldName] = null
        }
      })

      // Use apiClient to make the download request
      await apiClient.post(downloadEndpoint, downloadPayload)
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
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {reportConfig.title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                disabled={isDownloading}
                className="flex items-center gap-1 px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                {isDownloading ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                {reportConfig.api.downloadOnly
                  ? 'Download Report'
                  : 'Download Template'}
              </Button>

              {!reportConfig.api.downloadOnly && (
                <Button
                  size="sm"
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200"
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
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
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
