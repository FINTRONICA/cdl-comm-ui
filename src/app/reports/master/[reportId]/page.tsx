'use client'

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { ArrowLeft, Download, RefreshCw } from 'lucide-react'
import { ReportFormFields } from '@/components/organisms/ReportFormFields'
import { ReportResultsTable } from '@/components/organisms/ReportResultsTable'
import { Button } from '@/components/atoms/Button'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { apiClient } from '@/lib/apiClient'
import { getReportConfiguration } from '@/config/reportsConfig'

const MasterReportDetailPage = () => {
  const router = useRouter()
  const params = useParams()
  const reportId = params?.reportId as string

  const [formData, setFormData] = useState<Record<string, string | string[]>>(
    {}
  )
  const [isGenerating, setIsGenerating] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [reportResults, setReportResults] = useState<
    Array<{
      id: string
      [key: string]: string | number | boolean | null | undefined
    }>
  >([])

  const { getLabelResolver } = useSidebarConfig()
  const initialLoadReportId = useRef<string | null>(null)

  const reportConfig = useMemo(() => {
    const config = getReportConfiguration(reportId, [], [])
    return config
  }, [reportId])

  const masterReportTitle = getLabelResolver
    ? getLabelResolver('master', 'Master Report')
    : 'Master Report'

  const handleBack = () => {
    router.push('/reports/master')
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

      const getOriginalProjectId = (uniqueValue: string) => {
        return uniqueValue || null
      }

      const downloadEndpoint =
        reportConfig.api.downloadOnly
          ? reportConfig.api.endpoint
          : reportConfig.api.downloadEndpoint || reportConfig.api.endpoint

      const downloadPayload: Record<string, string | number | null> = {}

      if (!reportConfig.api.downloadOnly) {
        downloadPayload.format = 'template'
        downloadPayload.page = 0
        downloadPayload.size = 100
      }

      reportConfig.api.payloadFields.forEach((fieldName) => {
        if ((fieldName === 'projectId' || fieldName === 'project') && formData[fieldName]) {
          downloadPayload[fieldName] = getOriginalProjectId(
            getFormValue(formData[fieldName]!) || ''
          )
        } else if ((fieldName === 'developerId' || fieldName === 'developer') && formData[fieldName]) {
          downloadPayload[fieldName] = getOriginalProjectId(
            getFormValue(formData[fieldName]!) || ''
          )
        } else if (formData[fieldName]) {
          downloadPayload[fieldName] =
            getFormValue(formData[fieldName]!) || null
        } else {
          downloadPayload[fieldName] = null
        }
      })

      if (
        reportConfig.api.downloadOnly
      ) {
        const response = await apiClient.post(
          downloadEndpoint,
          downloadPayload,
          {
            responseType: 'blob',
          }
        )

        const reportName = reportConfig.title.replace(/\s+/g, '-').toLowerCase()
        const currentDate = new Date().toISOString().split('T')[0]
        const filename = `${reportName}-${currentDate}`

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
        const response = await apiClient.post(
          downloadEndpoint,
          downloadPayload,
          {
            responseType: 'blob',
          }
        )

        const reportName = reportConfig.title.replace(/\s+/g, '-').toLowerCase()
        const currentDate = new Date().toISOString().split('T')[0]
        const filename = `${reportName}-template-${currentDate}`

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
      // Handle error - show toast notification
    } finally {
      setIsDownloading(false)
    }
  }

  const handleGenerateReport = useCallback(async () => {
    try {
      setIsGenerating(true)

      const getFormValue = (value: string | string[]) => {
        return Array.isArray(value) ? value[0] : value
      }

      const getOriginalProjectId = (uniqueValue: string) => {
        return uniqueValue || null
      }

      const apiEndpoint = reportConfig.api.endpoint

      const configPayload: Record<string, string | number | null> = {
        page: 0,
        size: 100,
      }

      reportConfig.api.payloadFields.forEach((fieldName) => {
        if ((fieldName === 'projectId' || fieldName === 'project') && formData[fieldName]) {
          configPayload[fieldName] = getOriginalProjectId(
            getFormValue(formData[fieldName]!) || ''
          )
        } else if ((fieldName === 'developerId' || fieldName === 'developer') && formData[fieldName]) {
          configPayload[fieldName] = getOriginalProjectId(
            getFormValue(formData[fieldName]!) || ''
          )
        } else if (formData[fieldName]) {
          configPayload[fieldName] = getFormValue(formData[fieldName]!) || null
        } else {
          configPayload[fieldName] = null
        }
      })

      const data = await apiClient.post<{
        content?: Array<{
          [key: string]: string | number | boolean | null | undefined
        }>
      }>(apiEndpoint, configPayload)

      const transformedResults = reportConfig.api.transformResponse
        ? reportConfig.api.transformResponse(data)
        : data.content?.map((item: any, index: number) => ({
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
      // Handle error - show toast notification
    } finally {
      setIsGenerating(false)
    }
  }, [formData, reportConfig])

  const handleDownloadResults = async (format: 'pdf' | 'excel') => {
    try {
      setIsDownloading(true)

      const getFormValue = (value: string | string[]) => {
        return Array.isArray(value) ? value[0] : value
      }

      const getOriginalProjectId = (uniqueValue: string) => {
        return uniqueValue || null
      }

      const downloadEndpoint = reportConfig.api.downloadEndpoint

      if (!downloadEndpoint) {
        return
      }

      const downloadPayload: Record<string, string | number | null> = {
        format: format,
        page: 0,
        size: 100,
      }

      reportConfig.api.payloadFields.forEach((fieldName) => {
        if ((fieldName === 'projectId' || fieldName === 'project') && formData[fieldName]) {
          downloadPayload[fieldName] = getOriginalProjectId(
            getFormValue(formData[fieldName]!) || ''
          )
        } else if ((fieldName === 'developerId' || fieldName === 'developer') && formData[fieldName]) {
          downloadPayload[fieldName] = getOriginalProjectId(
            getFormValue(formData[fieldName]!) || ''
          )
        } else if (formData[fieldName]) {
          downloadPayload[fieldName] =
            getFormValue(formData[fieldName]!) || null
        } else {
          downloadPayload[fieldName] = null
        }
      })

      await apiClient.post(downloadEndpoint, downloadPayload)
    } catch (error) {
      // Handle error
    } finally {
      setIsDownloading(false)
    }
  }

  useEffect(() => {
    if (initialLoadReportId.current !== reportId) {
      initialLoadReportId.current = reportId
      if (reportId && !reportConfig.api.downloadOnly) {
        handleGenerateReport()
      } else if (reportConfig.api.downloadOnly) {
        setIsGenerating(false)
      }
    }
  }, [reportId, reportConfig.api.downloadOnly, handleGenerateReport])

  return (
    <DashboardLayout title={masterReportTitle}>
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="px-4 py-3 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-8 h-8 transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 group"
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
                className="flex items-center gap-1 px-3 py-1 text-xs text-gray-700 transition-all duration-200 border border-gray-300 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                  className="flex items-center gap-1 px-3 py-1 text-xs text-white transition-all duration-200 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
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
          <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm dark:bg-gray-900 dark:border-gray-700">
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

export default MasterReportDetailPage

