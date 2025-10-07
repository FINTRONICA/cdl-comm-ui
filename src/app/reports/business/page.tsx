'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '../../../components/templates/DashboardLayout'
import {
  PackageOpen,
  Box,
  IndianRupee,
  FileUser,
  SquareChartGantt,
  SquareUser,
  FileChartLine,
  FolderKanban,
  PcCase,
  ChevronDown,
  ChevronRight,
  Building2,
  Users,
  CreditCard,
  FolderOpen,
  Shield,
  Calendar,
  Activity,
  Settings,
} from 'lucide-react'
import { ReportCard } from '@/components'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'

interface Report {
  id: string
  title: string
  icon: React.ReactNode
}

interface ReportCategory {
  id: string
  title: string
  icon: React.ReactNode
  reports: Report[]
}

const reportsData: ReportCategory[] = [
  {
    id: 'account-banking',
    title: 'Account & Banking Reports',
    icon: <Building2 className="w-6 h-6 text-[#1E2939]" strokeWidth={2} />,
    reports: [
      {
        id: 'account-opening',
        title: 'Account Opening Letter Report',
        icon: (
          <PackageOpen className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />
        ),
      },
      {
        id: 'account-closure',
        title: 'Account Closure Report',
        icon: <Box className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />,
      },
      {
        id: 'balance-confirmation',
        title: 'Balance Confirmation Letter',
        icon: (
          <IndianRupee className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />
        ),
      },
      {
        id: 'charges',
        title: 'Charges Report',
        icon: (
          <SquareChartGantt
            className="w-8 h-8 text-[#1E2939]"
            strokeWidth={2}
          />
        ),
      },
    ],
  },
  {
    id: 'beneficiary-capital',
    title: 'Beneficiary & Capital Partner Reports',
    icon: <Users className="w-6 h-6 text-[#1E2939]" strokeWidth={2} />,
    reports: [
      {
        id: 'beneficiary',
        title: 'Beneficiary Report',
        icon: <FileUser className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />,
      },
      {
        id: 'capital-partner-audit',
        title: 'Capital Partner Audit Report',
        icon: <SquareUser className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />,
      },
      {
        id: 'build-partner',
        title: 'Build Partner Report',
        icon: (
          <FolderKanban className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />
        ),
      },
      {
        id: 'build-partner-audit',
        title: 'Build Partner Audit Report',
        icon: (
          <FileChartLine className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />
        ),
      },
    ],
  },
  {
    id: 'transactions-payments',
    title: 'Transactions & Payment Reports',
    icon: <CreditCard className="w-6 h-6 text-[#1E2939]" strokeWidth={2} />,
    reports: [
      {
        id: 'transactions-audit',
        title: 'Transactions Audit Report',
        icon: (
          <FileChartLine className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />
        ),
      },
      {
        id: 'transactions-discard',
        title: 'Transactions Discard Report',
        icon: (
          <FolderKanban className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />
        ),
      },
      {
        id: 'payment-discard',
        title: 'Payment Discard Report',
        icon: <FileUser className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />,
      },
      {
        id: 'payment-master',
        title: 'Payment Master Report',
        icon: (
          <FolderKanban className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />
        ),
      },
      {
        id: 'payment-audit',
        title: 'Payment Audit Report',
        icon: <PcCase className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />,
      },
    ],
  },
  {
    id: 'project-escrow',
    title: 'Project & Escrow Reports',
    icon: <FolderOpen className="w-6 h-6 text-[#1E2939]" strokeWidth={2} />,
    reports: [
      {
        id: 'capital-partner-assets',
        title: 'Capital Partner Assets Report',
        icon: <SquareUser className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />,
      },
      {
        id: 'capital-partner-assets-audit',
        title: 'Capital Partner Assets Audit Report',
        icon: (
          <FileChartLine className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />
        ),
      },
      {
        id: 'capital-partner-assets-financial',
        title: 'Capital Partner Assets Financial Report',
        icon: (
          <IndianRupee className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />
        ),
      },
      {
        id: 'escrow-transaction',
        title: 'Escrow Transaction Detailed Report',
        icon: (
          <IndianRupee className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />
        ),
      },
      {
        id: 'escrow-regulatory',
        title: 'Escrow Regulatory Tas Report',
        icon: <SquareUser className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />,
      },
    ],
  },
  {
    id: 'surety-compliance',
    title: 'Surety Bond & Compliance Reports',
    icon: <Shield className="w-6 h-6 text-[#1E2939]" strokeWidth={2} />,
    reports: [
      {
        id: 'surety-bond',
        title: 'Surety Bond Report',
        icon: <Shield className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />,
      },
      {
        id: 'surety-bond-audit',
        title: 'Surety Bond Audit Report',
        icon: (
          <FileChartLine className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />
        ),
      },
      {
        id: 'financial-data',
        title: 'Financial Data Report',
        icon: <PcCase className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />,
      },
    ],
  },
  {
    id: 'periodic-regulatory',
    title: 'Periodic / Regulatory Reports',
    icon: <Calendar className="w-6 h-6 text-[#1E2939]" strokeWidth={2} />,
    reports: [
      {
        id: 'monthly-rera',
        title: 'Monthly Rera Report',
        icon: <Box className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />,
      },
      {
        id: 'monthly-tas',
        title: 'Monthly Tas Report',
        icon: (
          <PackageOpen className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />
        ),
      },
      {
        id: 'rak-monthly-rera',
        title: 'RAK Monthly Rera Report',
        icon: <PcCase className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />,
      },
      {
        id: 'abu-dhabi-rera',
        title: 'SBI Rera Report',
        icon: <PcCase className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />,
      },
    ],
  },
  {
    id: 'operational-performance',
    title: 'Operational & Performance Reports',
    icon: <Activity className="w-6 h-6 text-[#1E2939]" strokeWidth={2} />,
    reports: [
      {
        id: 'tas-batch-status',
        title: 'TAS Batch Status Report',
        icon: (
          <SquareChartGantt
            className="w-8 h-8 text-[#1E2939]"
            strokeWidth={2}
          />
        ),
      },
      {
        id: 'staff-productivity',
        title: 'Staff Productivity Report',
        icon: <Activity className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />,
      },
      {
        id: 'unit-history',
        title: 'Unit History Report',
        icon: (
          <FileChartLine className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />
        ),
      },
      {
        id: 'unit-management',
        title: 'Unit Management Report',
        icon: <Settings className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />,
      },
      {
        id: 'rt04-trust',
        title: 'R/T/04 (Trust Report)',
        icon: <Shield className="w-8 h-8 text-[#1E2939]" strokeWidth={2} />,
      },
    ],
  },
]

const BusinessReportPage = () => {
  const router = useRouter()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  )
  const { getLabelResolver } = useSidebarConfig()
  const businessReportTitle = getLabelResolver
    ? getLabelResolver('business', 'Business Report')
    : 'Business Report'
  
  const handleReportClick = (report: Report) => {
    router.push(`/reports/business/${report.id}`)
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  return (
    <DashboardLayout title={businessReportTitle}>
      <div className="flex flex-col gap-4 px-6 py-6 bg-gray-50 min-h-screen">
        {/* Main Categories */}
        <div className="space-y-6">
          {reportsData.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50/50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors duration-200">
                    {category.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-semibold text-[#1E2939] group-hover:text-blue-600 transition-colors duration-200">
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {category.reports.length} report
                      {category.reports.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {category.reports.length}
                  </span>
                  <div className="p-1 rounded-full group-hover:bg-gray-100 transition-colors duration-200">
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                    )}
                  </div>
                </div>
              </button>

              {/* Category Content */}
              {expandedCategories.has(category.id) && (
                <div className="px-6 pb-6 bg-gray-50/30">
                  <div className="border-t border-gray-100 pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {category.reports.map((report, index) => (
                        <div key={report.id} className="relative">
                          <ReportCard
                            title={report.title}
                            icon={report.icon}
                            onClick={() => handleReportClick(report)}
                          />
                          {/* Vertical separator for larger screens */}
                          {(index + 1) % 4 !== 0 &&
                            index !== category.reports.length - 1 && (
                              <div className="hidden xl:block absolute top-0 -right-3 h-full w-px bg-gray-200" />
                            )}
                          {(index + 1) % 3 !== 0 &&
                            index !== category.reports.length - 1 && (
                              <div className="hidden lg:block xl:hidden absolute top-0 -right-3 h-full w-px bg-gray-200" />
                            )}
                          {(index + 1) % 2 !== 0 &&
                            index !== category.reports.length - 1 && (
                              <div className="hidden sm:block lg:hidden absolute top-0 -right-3 h-full w-px bg-gray-200" />
                            )}
                          {/* Horizontal separator */}
                          {index < category.reports.length - 1 && (
                            <div className="sm:hidden mt-4 border-b border-gray-200" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default BusinessReportPage
