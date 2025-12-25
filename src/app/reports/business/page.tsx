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
  FileText,
  Edit3,
  FileCheck,
  TrendingUp,
  Archive,
  FileEdit,
  Wallet,
  Receipt,
  Database,
} from 'lucide-react'
import { ReportCard } from '@/components'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { BUSINESS_REPORTS_CONFIG } from '@/config/reportsConfig'

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
  // {
  //   id: 'account-banking',
  //   title: 'Account & Banking Reports',
  //   icon: (
  //     <Building2
  //       className="w-6 h-6 text-gray-900 dark:text-gray-100"
  //       strokeWidth={2}
  //     />
  //   ),
  //   reports: [
  //     {
  //       id: 'account-opening',
  //       title: 'Account Opening Letter Report',
  //       icon: (
  //         <PackageOpen
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'account-closure',
  //       title: 'Account Closure Report',
  //       icon: (
  //         <Box
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'balance-confirmation',
  //       title: 'Balance Confirmation Letter',
  //       icon: (
  //         <IndianRupee
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'charges',
  //       title:
  //         BUSINESS_REPORTS_CONFIG['charges']?.title || 'Customer Report',
  //       icon: (
  //         <SquareChartGantt
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //   ],
  // },
  // {
  //   id: 'beneficiary-capital',
  //   title: 'Beneficiary & Capital Partner Reports',
  //   icon: (
  //     <Users
  //       className="w-6 h-6 text-gray-900 dark:text-gray-100"
  //       strokeWidth={2}
  //     />
  //   ),
  //   reports: [
  //     {
  //       id: 'beneficiary',
  //       title: 'Beneficiary Report',
  //       icon: (
  //         <FileUser
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'capital-partner-audit',
  //       title: 'Capital Partner Audit Report',
  //       icon: (
  //         <SquareUser
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'build-partner',
  //       title: 'Build Partner Report',
  //       icon: (
  //         <FolderKanban
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'build-partner-audit',
  //       title: 'Build Partner Audit Report',
  //       icon: (
  //         <FileChartLine
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //   ],
  // },
  // {
  //   id: 'transactions-payments',
  //   title: 'Transactions & Payment Reports',
  //   icon: (
  //     <CreditCard
  //       className="w-6 h-6 text-gray-900 dark:text-gray-100"
  //       strokeWidth={2}
  //     />
  //   ),
  //   reports: [
  //     {
  //       id: 'transactions-audit',
  //       title: 'Transactions Audit Report',
  //       icon: (
  //         <FileChartLine
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'transactions-discard',
  //       title: 'Transactions Discard Report',
  //       icon: (
  //         <FolderKanban
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'payment-discard',
  //       title: 'Payment Discard Report',
  //       icon: (
  //         <FileUser
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'payment-master',
  //       title: 'Payment Master Report',
  //       icon: (
  //         <FolderKanban
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'payment-audit',
  //       title: 'Payment Audit Report',
  //       icon: (
  //         <PcCase
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'tas-batch-status',
  //       title: 'TAS Batch Status Report',
  //       icon: (
  //         <FileChartLine
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //   ],
  // },
  // {
  //   id: 'project-escrow',
  //   title: 'Project & Escrow Reports',
  //   icon: (
  //     <FolderOpen
  //       className="w-6 h-6 text-gray-900 dark:text-gray-100"
  //       strokeWidth={2}
  //     />
  //   ),
  //   reports: [
  //     {
  //       id: 'capital-partner-assets',
  //       title: 'Capital Partner Assets Report',
  //       icon: (
  //         <SquareUser
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'capital-partner-assets-audit',
  //       title: 'Capital Partner Assets Audit Report',
  //       icon: (
  //         <FileChartLine
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'capital-partner-assets-financial',
  //       title: 'Capital Partner Assets Financial Report',
  //       icon: (
  //         <IndianRupee
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'escrow-transaction',
  //       title: 'Escrow Transaction Detailed Report',
  //       icon: (
  //         <IndianRupee
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'escrow-regulatory',
  //       title: 'Escrow Regulatory Tas Report',
  //       icon: (
  //         <SquareUser
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'rt04-trust',
  //       title: 'RT04 Trust Report',
  //       icon: (
  //         <Shield
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'unit-history',
  //       title: 'Unit History Report',
  //       icon: (
  //         <FileText
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //   ],
  // },
  // {
  //   id: 'surety-compliance',
  //   title: 'Surety Bond & Compliance Reports',
  //   icon: (
  //     <Shield
  //       className="w-6 h-6 text-gray-900 dark:text-gray-100"
  //       strokeWidth={2}
  //     />
  //   ),
  //   reports: [
  //     {
  //       id: 'surety-bond',
  //       title: 'Surety Bond Report',
  //       icon: (
  //         <Shield
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'surety-bond-audit',
  //       title: 'Surety Bond Audit Report',
  //       icon: (
  //         <FileChartLine
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'financial-data',
  //       title: 'Financial Data Report',
  //       icon: (
  //         <PcCase
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //   ],
  // },
  // {
  //   id: 'periodic-regulatory',
  //   title: 'Periodic / Regulatory Reports',
  //   icon: (
  //     <Calendar
  //       className="w-6 h-6 text-gray-900 dark:text-gray-100"
  //       strokeWidth={2}
  //     />
  //   ),
  //   reports: [
  //     {
  //       id: 'monthly-rera',
  //       title: 'Monthly RERA Report',
  //       icon: (
  //         <Box
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'monthly-tas',
  //       title: 'Monthly TAS Report',
  //       icon: (
  //         <PackageOpen
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'rak-monthly-rera',
  //       title: 'RAK Monthly Rera Report',
  //       icon: (
  //         <PcCase
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'abu-dhabi-rera',
  //       title: 'SBI Rera Report',
  //       icon: (
  //         <PcCase
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //   ],
  // },
  // {
  //   id: 'operational-performance',
  //   title: 'Operational & Performance Reports',
  //   icon: (
  //     <Activity
  //       className="w-6 h-6 text-gray-900 dark:text-gray-100"
  //       strokeWidth={2}
  //     />
  //   ),
  //   reports: [
  //     {
  //       id: 'tas-batch-status',
  //       title: 'TAS Batch Status Report',
  //       icon: (
  //         <SquareChartGantt
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'staff-productivity',
  //       title: 'Staff Productivity Report',
  //       icon: (
  //         <Activity
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'unit-history',
  //       title: 'Unit History Report',
  //       icon: (
  //         <FileChartLine
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'unit-management',
  //       title: 'Unit Management Report',
  //       icon: (
  //         <Settings
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'rt04-trust',
  //       title: 'R/T/04 (Trust Report)',
  //       icon: (
  //         <Shield
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //     {
  //       id: 'transactions-audit',
  //       title: 'Transactions Audit Report',
  //       icon: (
  //         <FileChartLine
  //           className="w-8 h-8 text-gray-900 dark:text-gray-100"
  //           strokeWidth={2}
  //         />
  //       ),
  //     },
  //   ],
  // },
  {
    id: 'customer-beneficiary-master',
    title: 'Customer & Beneficiary Reports',
    icon: (
      <Users
        className="w-6 h-6 text-gray-900 dark:text-gray-100"
        strokeWidth={2}
      />
    ),
    reports: [
      {
        id: 'partyReport',
        title:
          BUSINESS_REPORTS_CONFIG['partyReport']?.title || 'Party Report',
        icon: (
          <Users
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
      {
        id: 'beneficiaryReport',
        title:
          BUSINESS_REPORTS_CONFIG['beneficiaryReport']?.title ||
          'Beneficiary Report',
        icon: (
          <Users
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
    ],
  },
  {
    id: 'document-master',
    title: 'Document Reports',
    icon: (
      <FileText
        className="w-6 h-6 text-gray-900 dark:text-gray-100"
        strokeWidth={2}
      />
    ),
    reports: [
      {
        id: 'documentReport',
        title:
          BUSINESS_REPORTS_CONFIG['documentReport']?.title ||
          'Document Report',
        icon: (
          <FileText
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
    ],
  },
  {
    id: 'deal-management-master',
    title: 'Deal Management Reports',
    icon: (
      <FolderKanban
        className="w-6 h-6 text-gray-900 dark:text-gray-100"
        strokeWidth={2}
      />
    ),
    reports: [
      {
        id: 'dealSegmentReport',
        title:
          BUSINESS_REPORTS_CONFIG['dealSegmentReport']?.title ||
          'Deal Segment Report',
        icon: (
          <Database
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
      {
        id: 'dealInitiationReport',
        title:
          BUSINESS_REPORTS_CONFIG['dealInitiationReport']?.title ||
          'Deal Initiation Report',
        icon: (
          <FolderKanban
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
      {
        id: 'dealVerificationReport',
        title:
          BUSINESS_REPORTS_CONFIG['dealVerificationReport']?.title ||
          'Deal Verification Report',
        icon: (
          <FileCheck
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
      {
        id: 'dealClosureReport',
        title:
          BUSINESS_REPORTS_CONFIG['dealClosureReport']?.title ||
          'Deal Closure Report',
        icon: (
          <Archive
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
    ],
  },
  {
    id: 'deal-amendment-master',
    title: 'Deal Amendment Reports',
    icon: (
      <Edit3
        className="w-6 h-6 text-gray-900 dark:text-gray-100"
        strokeWidth={2}
      />
    ),
    reports: [
      {
        id: 'dealAmendmentReport',
        title:
          BUSINESS_REPORTS_CONFIG['dealAmendmentReport']?.title ||
          'Deal Amendment Report',
        icon: (
          <FileEdit
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
      {
        id: 'dealAmendmentVerificationReport',
        title:
          BUSINESS_REPORTS_CONFIG['dealAmendmentVerificationReport']?.title ||
          'Deal Amendment Verification Report',
        icon: (
          <FileCheck
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
      {
        id: 'dealAmendmentBasedRuleReport',
        title:
          BUSINESS_REPORTS_CONFIG['dealAmendmentBasedRuleReport']?.title ||
          'Deal Amendment Based Rule Report',
        icon: (
          <Edit3
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
    ],
  },
  {
    id: 'account-rule-master',
    title: 'Account & Rule Reports',
    icon: (
      <Wallet
        className="w-6 h-6 text-gray-900 dark:text-gray-100"
        strokeWidth={2}
      />
    ),
    reports: [
      {
        id: 'accountOpeningReport',
        title:
          BUSINESS_REPORTS_CONFIG['accountOpeningReport']?.title ||
          'Account Opening Report',
        icon: (
          <FileText
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
      {
        id: 'dealBasedRuleReport',
        title:
          BUSINESS_REPORTS_CONFIG['dealBasedRuleReport']?.title ||
          'Deal Based Rule Report',
        icon: (
          <TrendingUp
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
    ],
  },
  {
    id: 'funding-si-master',
    title: 'Funding & SI Reports',
    icon: (
      <CreditCard
        className="w-6 h-6 text-gray-900 dark:text-gray-100"
        strokeWidth={2}
      />
    ),
    reports: [
      {
        id: 'createFundingAndSIReport',
        title:
          BUSINESS_REPORTS_CONFIG['createFundingAndSIReport']?.title ||
          'Create Funding and SI Report',
        icon: (
          <CreditCard
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
      {
        id: 'amendmentFundingAndSIReport',
        title:
          BUSINESS_REPORTS_CONFIG['amendmentFundingAndSIReport']?.title ||
          'Amendment Funding and SI Report',
        icon: (
          <Edit3
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
    ],
  },
  {
    id: 'payment-master',
    title: 'Payment Reports',
    icon: (
      <Receipt
        className="w-6 h-6 text-gray-900 dark:text-gray-100"
        strokeWidth={2}
      />
    ),
    reports: [
      {
        id: 'unitaryPaymentReport',
        title:
          BUSINESS_REPORTS_CONFIG['unitaryPaymentReport']?.title ||
          'Unitary Payment Report',
        icon: (
          <Receipt
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
      {
        id: 'unitaryPaymentVerificationReport',
        title:
          BUSINESS_REPORTS_CONFIG['unitaryPaymentVerificationReport']?.title ||
          'Unitary Payment Verification Report',
        icon: (
          <FileCheck
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
      {
        id: 'unitaryPaymentInvestmentDetailReport',
        title:
          BUSINESS_REPORTS_CONFIG['unitaryPaymentInvestmentDetailReport']
            ?.title || 'Unitary Payment Investment Detail Report',
        icon: (
          <TrendingUp
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
    ],
  },
  {
    id: 'transaction-status-master',
    title: 'Transaction Status Reports',
    icon: (
      <Activity
        className="w-6 h-6 text-gray-900 dark:text-gray-100"
        strokeWidth={2}
      />
    ),
    reports: [
      {
        id: 'transactionStatusReport',
        title:
          BUSINESS_REPORTS_CONFIG['transactionStatusReport']?.title ||
          'Transaction Status Report',
        icon: (
          <Activity
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
      {
        id: 'ruleSITransactionStatusReport',
        title:
          BUSINESS_REPORTS_CONFIG['ruleSITransactionStatusReport']?.title ||
          'Rule SI Transaction Status Report',
        icon: (
          <Activity
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
      },
      {
        id: 'unitaryPaymentTransactionStatusReport',
        title:
          BUSINESS_REPORTS_CONFIG['unitaryPaymentTransactionStatusReport']
            ?.title || 'Unitary Payment Transaction Status Report',
        icon: (
          <Activity
            className="w-8 h-8 text-gray-900 dark:text-gray-100"
            strokeWidth={2}
          />
        ),
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
      <div className="flex flex-col min-h-screen gap-4 px-6 py-6 bg-gray-50 dark:bg-gray-900">
        {/* Main Categories */}
        <div className="space-y-6">
          {reportsData.map((category) => (
            <div
              key={category.id}
              className="overflow-hidden transition-shadow duration-300 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700 hover:shadow-md"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="flex items-center justify-between w-full p-6 transition-all duration-200 bg-white dark:bg-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700 group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 transition-colors duration-200 rounded-lg bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
                    {category.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-semibold text-gray-900 transition-colors duration-200 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {category.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {category.reports.length} report
                      {category.reports.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 text-sm font-medium text-blue-600 rounded-full dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                    {category.reports.length}
                  </span>
                  <div className="p-1 transition-colors duration-200 rounded-full group-hover:bg-gray-100 dark:group-hover:bg-gray-700">
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400 transition-colors duration-200 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400 transition-colors duration-200 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Category Content */}
              {expandedCategories.has(category.id) && (
                <div className="px-6 pb-6 bg-gray-50/30 dark:bg-gray-900/30">
                  <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                              <div className="absolute top-0 hidden w-px h-full bg-gray-200 xl:block -right-3 dark:bg-gray-700" />
                            )}
                          {(index + 1) % 3 !== 0 &&
                            index !== category.reports.length - 1 && (
                              <div className="absolute top-0 hidden w-px h-full bg-gray-200 lg:block xl:hidden -right-3 dark:bg-gray-700" />
                            )}
                          {(index + 1) % 2 !== 0 &&
                            index !== category.reports.length - 1 && (
                              <div className="absolute top-0 hidden w-px h-full bg-gray-200 sm:block lg:hidden -right-3 dark:bg-gray-700" />
                            )}
                          {/* Horizontal separator */}
                          {index < category.reports.length - 1 && (
                            <div className="mt-4 border-b border-gray-200 sm:hidden dark:border-gray-700" />
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
