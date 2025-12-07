'use client'

import React, { useState, useEffect, useRef } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { DateRangePicker } from './components/filters/DateRangePicker'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { Autocomplete } from '@/components/atoms/Autocomplete'
import { GlobalLoading, GlobalError } from '@/components/atoms'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { useDashboardSummary } from '@/hooks/useDashboard'
import { useBuildPartnerAutocomplete } from '@/hooks/useBuildPartnerAutocomplete'
import { useRealEstateAssetAutocomplete } from '@/hooks/useRealEstateAssetAutocomplete'
import type { BuildPartner } from '@/services/api/buildPartnerService'
import type { RealEstateAsset } from '@/services/api/realEstateAssetService'

const formatIndianCurrency = (amount: string | number): string => {
  // Handle null, undefined, or empty values
  if (amount === null || amount === undefined || amount === '') {
    return '0'
  }

  const numStr = amount.toString()

  // If it's already formatted (contains commas), return as is
  if (numStr.includes(',')) {
    return numStr
  }

  // Handle non-numeric strings
  if (isNaN(Number(numStr))) {
    return '0'
  }

  const lastThree = numStr.substring(numStr.length - 3)
  const otherNumbers = numStr.substring(0, numStr.length - 3)
  if (otherNumbers !== '') {
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
  }
  return lastThree
}

const kpiData = {
  deposits: [
    { name: 'Equity Fund', y: 35, color: '#0d9488' },
    { name: 'Investor Fund', y: 25, color: '#14b8a6' },
    { name: 'DLD', y: 20, color: '#2dd4bf' },
    { name: 'Unit Installment', y: 15, color: '#5eead4' },
    { name: 'VAT', y: 5, color: '#99f6e4' },
  ],
  payments: [
    { name: 'Equity Fund', y: 30, color: '#86198f' },
    { name: 'Investor Fund', y: 25, color: '#a21caf' },
    { name: 'DLD', y: 20, color: '#c026d3' },
    { name: 'Unit Installment', y: 15, color: '#d946ef' },
    { name: 'VAT', y: 10, color: '#e879f9' },
  ],
  fees: [
    { name: 'Equity Fund', y: 40, color: '#4c1d95' },
    { name: 'Investor Fund', y: 30, color: '#6d28d9' },
    { name: 'DLD', y: 15, color: '#7c3aed' },
    { name: 'Unit Installment', y: 10, color: '#8b5cf6' },
    { name: 'VAT', y: 5, color: '#a78bfa' },
  ],
}

const statusData = [
  { name: 'Sold', y: 60, color: '#8b5cf6' },
  { name: 'Unsold', y: 60, color: '#a78bfa' },
  { name: 'Freeze', y: 76, color: '#8b5cf6' },
  { name: 'Resold', y: 44, color: '#8b5cf6' },
  { name: 'Cancelled', y: 56, color: '#8b5cf6' },
]

const guaranteeData = [
  { name: 'Advanced Guarantee', y: 35, color: '#8b5cf6' },
  { name: 'Retention Guarantee', y: 28, color: '#a78bfa' },
  { name: 'Performance Guarantee', y: 12, color: '#c4b5fd' },
]

const developersData = [
  { name: 'In Review', y: 312, color: '#c4b5fd' },
  { name: 'Active', y: 342, color: '#8b5cf6' },
  { name: 'Approved', y: 468, color: '#6d28d9' },
]

const getDonutChartOptions = (
  data: Array<{ name: string; y: number; color: string }>,
  isDark: boolean = false
) => ({
  chart: {
    type: 'pie',
    backgroundColor: 'transparent',
    height: 200,
  },
  title: {
    text: null,
  },
  plotOptions: {
    pie: {
      innerSize: '60%',
      dataLabels: {
        enabled: false,
      },
      showInLegend: false,
    },
  },
  legend: {
    enabled: false,
  },
  series: [
    {
      name: 'Data',
      data: data,
    },
  ],
  credits: {
    enabled: false,
  },
  tooltip: {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    style: {
      color: isDark ? '#F3F4F6' : '#1F2937',
    },
  },
})

const DateRangeDisplay = ({
  startDate,
  endDate,
  onDateChange,
}: {
  startDate: string
  endDate: string
  onDateChange: (start: string, end: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [prevStartDate, setPrevStartDate] = useState(startDate)
  const [prevEndDate, setPrevEndDate] = useState(endDate)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-close when both dates are selected (only when end date is selected after start date)
  useEffect(() => {
    const endDateChanged = endDate !== prevEndDate
    const startDateWasAlreadySelected = prevStartDate && prevStartDate !== ''

    // Only auto-close if:
    // 1. End date was just selected (changed)
    // 2. Start date was already selected before this change
    // 3. Both dates now exist
    // 4. Picker is currently open
    if (
      endDateChanged &&
      startDateWasAlreadySelected &&
      startDate &&
      endDate &&
      isOpen
    ) {
      setIsOpen(false)
    }

    setPrevStartDate(startDate)
    setPrevEndDate(endDate)
  }, [startDate, endDate, isOpen, prevStartDate, prevEndDate])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <div
        className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 cursor-pointer flex items-center gap-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="flex-1">
          {startDate} | {endDate}
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 w-96 max-w-[90vw] right-0">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={onDateChange}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg dark:shadow-gray-900/50 p-4 w-full"
          />
        </div>
      )}
    </div>
  )
}

const FiltersRow = ({
  onSubmit,
  isSubmitting,
}: {
  onSubmit?: () => void
  isSubmitting?: boolean
}) => {
  const [selectedDeveloper, setSelectedDeveloper] = useState('')
  const [selectedBuildPartner, setSelectedBuildPartner] =
    useState<BuildPartner | null>(null)
  const [selectedBuildPartnerOption, setSelectedBuildPartnerOption] =
    useState<any>(null)
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedRealEstateAsset, setSelectedRealEstateAsset] =
    useState<RealEstateAsset | null>(null)
  const [selectedRealEstateAssetOption, setSelectedRealEstateAssetOption] =
    useState<any>(null)
  const [dateRange, setDateRange] = useState({
    startDate: '10-05-2025',
    endDate: '25-05-2025',
  })

  // Use the build partner autocomplete hook
  const { searchBuildPartners, isLoading: isSearchingBuildPartners } =
    useBuildPartnerAutocomplete({
      debounceMs: 300,
      minSearchLength: 1,
    })

  // Use the real estate asset autocomplete hook
  const { searchRealEstateAssets, isLoading: isSearchingRealEstateAssets } =
    useRealEstateAssetAutocomplete({
      debounceMs: 300,
      minSearchLength: 1,
    })

  const handleDateRangeChange = (start: string, end: string) => {
    setDateRange({ startDate: start, endDate: end })
  }

  // Handle build partner selection
  const handleBuildPartnerChange = (value: string) => {
    setSelectedDeveloper(value)
  }

  const handleBuildPartnerOptionSelect = (option: any) => {
    setSelectedBuildPartnerOption(option)
    if (option.buildPartner) {
      setSelectedBuildPartner(option.buildPartner)
    }
  }

  // Handle real estate asset selection
  const handleRealEstateAssetChange = (value: string) => {
    setSelectedProject(value)
  }

  const handleRealEstateAssetOptionSelect = (option: any) => {
    setSelectedRealEstateAssetOption(option)
    if (option.realEstateAsset) {
      setSelectedRealEstateAsset(option.realEstateAsset)
    }
  }

  // Log selected build partner for debugging (remove in production)
  React.useEffect(() => {
    if (selectedBuildPartner) {
      // Example of accessing build partner data for other API calls:
    }
  }, [selectedBuildPartner])

  // Log selected real estate asset for debugging (remove in production)
  React.useEffect(() => {
    if (selectedRealEstateAsset) {
      // Example of accessing real estate asset data for other API calls:
    }
  }, [selectedRealEstateAsset])

  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 mb-6 mt-2">
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            Build Partner
          </label>
          <Autocomplete
            value={selectedDeveloper}
            onChange={handleBuildPartnerChange}
            onOptionSelect={handleBuildPartnerOptionSelect}
            selectedOption={selectedBuildPartnerOption}
            options={[]}
            onSearch={searchBuildPartners}
            placeholder="Search build partners..."
            loading={isSearchingBuildPartners}
            className="min-w-[150px]"
            clearable={true}
            minSearchLength={1}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            Build Partner Assets
          </label>
          <Autocomplete
            value={selectedProject}
            onChange={handleRealEstateAssetChange}
            onOptionSelect={handleRealEstateAssetOptionSelect}
            selectedOption={selectedRealEstateAssetOption}
            options={[]}
            onSearch={searchRealEstateAssets}
            placeholder="Search real estate assets..."
            loading={isSearchingRealEstateAssets}
            className="min-w-[150px]"
            clearable={true}
            minSearchLength={1}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            Date
          </label>
          <DateRangeDisplay
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateChange={handleDateRangeChange}
          />
        </div>
        <div className="flex flex-col items-center justify-end mb-[2px]">
          <button
            className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}

const MainBalance = ({ dashboardData }: { dashboardData: any }) => (
  <div className="mb-8 mt-8 pb-8 border-b border-gray-200 dark:border-gray-700">
    <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
      Available Balance in Accounts
    </h1>
    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">
      MAIN TRUST ACCOUNT SUMMARY
    </div>
    <div className="flex flex-wrap items-baseline gap-4 lg:gap-6">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
          ₹
        </span>
        <span className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-none">
          {formatIndianCurrency(
            dashboardData?.mainTrustSummary?.availableBalance
          )}
        </span>
      </div>
      <div className="flex flex-col">
        <div className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
          CRORE
        </div>
        <TrendBadge
          value={`${dashboardData?.mainTrustSummary?.depositVsLastPeriodPercent || 12}% vs last month`}
          isPositive={
            dashboardData?.mainTrustSummary?.depositVsLastPeriodPercent >= 0
          }
        />
      </div>
    </div>
  </div>
)

const TrendBadge = ({
  value,
  isPositive = true,
}: {
  value: string
  isPositive?: boolean
}) => (
  <div
    className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
      isPositive ? 'text-green-600' : 'text-red-600'
    }`}
  >
    <span className="text-sm">{isPositive ? '↗' : '↘'}</span>
    {value}
  </div>
)

const CustomLegend = ({
  data,
}: {
  data: Array<{ name: string; color: string }>
}) => (
  <div className="flex flex-col gap-2">
    {data.map((entry, i) => (
      <div key={i} className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-sm flex-shrink-0"
          style={{ backgroundColor: entry.color }}
        />
        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-relaxed">
          {entry.name}
        </span>
      </div>
    ))}
  </div>
)

const KpiCard = ({
  title,
  amount,
  trend,
  data,
  className = '',
}: {
  title: string
  amount: string
  trend: { value: string; isPositive: boolean }
  data: Array<{ name: string; y: number; color: string }>
  className?: string
}) => {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    checkDarkMode()

    // Watch for changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 h-full p-6 ${className}`}
    >
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        {title}
      </div>
      <div className="flex items-baseline gap-1 mb-8 flex-col">
        <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
          ₹{formatIndianCurrency(amount)}
        </div>
        <div className="-mt-1 -mb-1">
          <TrendBadge {...trend} />
        </div>
      </div>
      <div className="flex items-center justify-between h-[330px] flex-col">
        <div className="flex-1 flex justify-center w-full">
          <div className="w-48 h-48">
            <HighchartsReact
              highcharts={Highcharts}
              options={getDonutChartOptions(data, isDark)}
            />
          </div>
        </div>
        <div className="flex-1 flex items-start justify-center w-full px-4">
          <CustomLegend data={data} />
        </div>
      </div>
    </div>
  )
}

const AccountCard = ({
  type,
  title,
  amount,
  trend,
}: {
  type: 'retention' | 'wakala' | 'corporate' | 'trust'
  title: string
  amount: string
  trend: { value: string; isPositive: boolean }
}) => {
  const iconColors = {
    retention: 'bg-blue-100 border-blue-400',
    wakala: 'bg-green-100 border-green-400',
    corporate: 'bg-pink-100 border-pink-400',
    trust: 'bg-yellow-100 border-yellow-400',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-6 w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-3 h-3 rounded-full border-2 ${iconColors[type]}`} />
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </div>
      </div>
      <div className="flex items-baseline gap-1 flex-col">
        <div className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
          ₹{formatIndianCurrency(amount)}
        </div>
        <div className="-mt-1 -mb-1">
          <TrendBadge {...trend} />
        </div>
      </div>
    </div>
  )
}

const StatusBars = ({
  data,
  total,
}: {
  data: Array<{ name: string; y: number; color: string }>
  total: string
}) => {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  // Dynamic chart configuration based on actual data
  const maxValue = Math.max(...data.map((item) => item.y), 100)
  const hasData = data && data.length > 0
  const chartHeight = Math.max(300, data.length * 50 + 100) // Dynamic height based on data items

  const statusChartOptions = {
    chart: {
      type: 'bar',
      backgroundColor: 'transparent',
      height: chartHeight,
      marginBottom: 100,
      marginTop: 20,
    },
    title: {
      text: null,
    },
    xAxis: {
      categories: hasData ? data.map((item) => item.name) : [],
      labels: {
        style: {
          fontSize: '10px',
          color: isDark ? '#9CA3AF' : '#6B7280',
        },
        rotation: data.length > 4 ? -45 : 0, // Rotate labels if many items
      },
    },
    yAxis: {
      title: {
        text: null,
      },
      labels: {
        style: {
          fontSize: '10px',
          color: isDark ? '#9CA3AF' : '#6B7280',
        },
        formatter: function (this: any) {
          return this.value + '%'
        },
      },
      max: Math.min(maxValue * 1.1, 100), // Dynamic max based on data, cap at 100%
      min: 0,
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
          format: '{y}%',
          style: {
            fontSize: data.length > 4 ? '8px' : '10px',
            fontWeight: 'bold',
            color: 'white',
            textOutline: '1px contrast',
          },
        },
        colorByPoint: true, // Use different colors for each bar
      },
    },
    series: [
      {
        name: 'Percentage',
        data: hasData
          ? data.map((item) => ({
              y: item.y,
              color: item.color,
              name: item.name,
            }))
          : [],
      },
    ],
    credits: {
      enabled: false,
    },
    // Add responsive design
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            plotOptions: {
              bar: {
                dataLabels: {
                  enabled: false,
                },
              },
            },
          },
        },
      ],
    },
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 h-full p-6">
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        UNIT STATUS COUNT
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
        {total}
      </div>
      <div className="h-[330px] overflow-hidden">
        <HighchartsReact highcharts={Highcharts} options={statusChartOptions} />
      </div>
    </div>
  )
}

const GuaranteeChart = ({
  data,
  total,
}: {
  data: Array<{ name: string; y: number; color: string }>
  total: string
}) => {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  // Dynamic chart configuration based on actual data
  const maxValue = Math.max(...data.map((item) => item.y), 1)
  const hasData = data && data.length > 0
  const chartHeight = Math.max(300, data.length * 50 + 100) // Dynamic height based on data items

  const guaranteeChartOptions = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      height: chartHeight,
      marginBottom: 100,
      marginTop: 20,
    },
    title: {
      text: null,
    },
    xAxis: {
      categories: hasData ? data.map((item) => item.name) : [],
      labels: {
        style: {
          fontSize: '10px',
          color: isDark ? '#9CA3AF' : '#6B7280',
        },
        rotation: data.length > 3 ? -45 : 0, // Rotate labels if many items
      },
    },
    yAxis: {
      title: {
        text: 'Cr INR',
        style: {
          fontSize: '10px',
          color: isDark ? '#9CA3AF' : '#6B7280',
        },
      },
      labels: {
        style: {
          fontSize: '10px',
          color: isDark ? '#9CA3AF' : '#6B7280',
        },
        formatter: function (this: any) {
          return (this.value / 10000000).toFixed(1) + ' Cr' // Convert to crores
        },
      },
      max: Math.max(maxValue * 1.2, 10), // Dynamic max based on data, minimum 10
      min: 0,
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true,
          format: '{y:,.0f}',
          style: {
            fontSize: data.length > 3 ? '8px' : '10px',
            fontWeight: 'bold',
            color: 'white',
            textOutline: '1px contrast',
          },
        },
        colorByPoint: true, // Use different colors for each column
      },
    },
    series: [
      {
        name: 'Amount',
        data: hasData
          ? data.map((item) => ({
              y: item.y,
              color: item.color,
              name: item.name,
            }))
          : [],
      },
    ],
    credits: {
      enabled: false,
    },
    // Add responsive design
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            plotOptions: {
              column: {
                dataLabels: {
                  enabled: false,
                },
              },
            },
          },
        },
      ],
    },
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 h-full p-6">
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        GUARANTEE STATUS
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 leading-tight">
        {total}
      </div>
      <div className="h-[330px] overflow-hidden">
        <HighchartsReact
          highcharts={Highcharts}
          options={guaranteeChartOptions}
        />
      </div>
    </div>
  )
}

const Dashboard = () => {
  const { getLabelResolver } = useSidebarConfig()
  const dashboardTitle = getLabelResolver
    ? getLabelResolver('dashboard', 'Command Center')
    : 'Command Center'

  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useDashboardSummary(true)

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await refetch()
    } catch (error) {
      console.error('Error refetching dashboard data:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const transformApiDataToCharts = (data: any) => {
    // Debug: Log the actual API response structure
    if (data) {
    }

    // Return static data only if API data is completely missing
    if (
      !data ||
      (!data.mainTrustSummary && !data.unitStatus && !data.guaranteeStatus)
    )
      return {
        kpiData: {
          deposits: kpiData.deposits,
          payments: kpiData.payments,
          fees: kpiData.fees,
        },
        statusData: statusData,
        guaranteeData: guaranteeData,
        developersData: developersData,
        totals: {
          deposits: '0',
          payments: '0',
          fees: '0',
          status: '0',
          guarantee: '0',
          projects: '0',
          activities: '0',
        },
        accountData: {
          retention: '0',
          wakala: '0',
          corporate: '0',
          trust: '0',
        },
        trends: {
          deposits: { value: '12% vs last month', isPositive: true },
          payments: { value: '8% vs last month', isPositive: false },
          fees: { value: '12% vs last month', isPositive: true },
          retention: { value: '12% vs last month', isPositive: true },
          wakala: { value: '14% vs last month', isPositive: true },
          corporate: { value: '8% vs last month', isPositive: false },
          trust: { value: '12% vs last month', isPositive: true },
        },
      }

    // Extract data from API response and transform to chart format
    const mainTrust = data.mainTrustSummary || {}
    const otherAccounts = data.otherAccounts || []
    const unitStatus = data.unitStatus || {}
    const guaranteeStatus = data.guaranteeStatus || {}

    // Helper function to format currency
    const formatCurrency = (amount: number) => {
      if (!amount || amount === 0) return null
      return Math.round(amount).toLocaleString('en-IN')
    }

    // Helper function to format percentage
    const formatPercentage = (percent: number) => {
      const sign = percent >= 0 ? '+' : ''
      return `${sign}${percent.toFixed(1)}% vs last period`
    }

    // Transform deposit breakdown to chart format
    const transformDepositBreakdown = (breakdown: any[]) => {
      if (!breakdown) return kpiData.deposits
      const colors = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4']
      return breakdown.map((item, index) => ({
        name: item.bucketTypeName || 'Unknown',
        y: Math.round((item.amount / mainTrust.totalDeposits) * 100),
        color: colors[index % colors.length] || '#0d9488',
      }))
    }

    // Transform expense breakdown to chart format (for payments)
    const transformExpenseBreakdown = (breakdown: any[]) => {
      if (!breakdown) return kpiData.payments
      const colors = ['#86198f', '#a21caf', '#c026d3', '#d946ef', '#e879f9']
      return breakdown.map((item, index) => ({
        name: item.expenseTypeName || 'Unknown',
        y: Math.round((item.amount / mainTrust.totalPayments) * 100),
        color: colors[index % colors.length] || '#86198f',
      }))
    }

    // Transform fees breakdown to chart format
    const transformFeesBreakdown = (breakdown: any[]) => {
      if (!breakdown) return kpiData.fees
      const colors = ['#4c1d95', '#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa']
      return breakdown.map((item, index) => ({
        name: item.expenseTypeName || 'Unknown',
        y: Math.round((item.amount / mainTrust.totalFeesCollected) * 100),
        color: colors[index % colors.length] || '#4c1d95',
      }))
    }

    const transformUnitStatus = (_unitStatusData: any) => {
      return statusData
    }

    // Transform guarantee status data to chart format
    const transformGuaranteeStatus = (apiGuaranteeData: any) => {
      if (!apiGuaranteeData || !apiGuaranteeData.items) {
        return guaranteeData
      }

      // Log the structure of the first item to understand the field names
      if (apiGuaranteeData.items.length > 0) {
      }

      const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd']
      const transformed = apiGuaranteeData.items.map(
        (item: any, index: number) => {
          // Try different possible field names for guarantee type and amount
          const typeName =
            item.guaranteeType ||
            item.type ||
            item.name ||
            item.guaranteeTypeName ||
            'Unknown'
          const amountValue =
            item.amount || item.value || item.total || item.guaranteeAmount || 0

          return {
            name: typeName,
            y: amountValue,
            color: colors[index % colors.length] || '#8b5cf6',
          }
        }
      )
      return transformed
    }

    // Get account data from otherAccounts array
    const getAccountData = (accountType: string) => {
      const account = otherAccounts.find(
        (acc: any) => acc.accountType === accountType
      )
      return account ? formatCurrency(account.balance) : null
    }

    // Get account trend from otherAccounts array
    const getAccountTrend = (accountType: string) => {
      const account = otherAccounts.find(
        (acc: any) => acc.accountType === accountType
      )
      if (!account) return { value: '0% vs last period', isPositive: true }
      return {
        value: formatPercentage(account.changeVsLastPeriodPercent),
        isPositive: account.changeVsLastPeriodPercent >= 0,
      }
    }

    const transformedData = {
      kpiData: {
        deposits: transformDepositBreakdown(mainTrust.depositBreakdown),
        payments: transformExpenseBreakdown(mainTrust.expenseBreakdown),
        fees: transformFeesBreakdown(mainTrust.feesBreakdown),
      },
      statusData: transformUnitStatus(unitStatus),
      guaranteeData: transformGuaranteeStatus(guaranteeStatus),
      developersData: developersData, // Keep static for now
      totals: {
        deposits: formatCurrency(mainTrust.totalDeposits || 0) || '0',
        payments: formatCurrency(mainTrust.totalPayments || 0) || '0',
        fees: formatCurrency(mainTrust.totalFeesCollected || 0) || '0',
        status:
          formatCurrency(
            unitStatus.totalUnitsCount ||
              unitStatus.totalCount ||
              unitStatus.total ||
              0
          ) || '20,678',
        guarantee:
          formatCurrency(
            guaranteeStatus.totalGuaranteedAmount ||
              guaranteeStatus.totalAmount ||
              guaranteeStatus.total ||
              0
          ) || '14,679',
        projects: '13,824', // Keep static for now
        activities: '824', // Keep static for now
      },
      accountData: {
        retention: getAccountData('RETENTION') || '0',
        wakala: getAccountData('WAKALA') || '0',
        corporate: getAccountData('CORPORATE') || '0',
        trust: getAccountData('TRUST') || '0',
      },
      trends: {
        deposits: {
          value: formatPercentage(mainTrust.depositVsLastPeriodPercent || 0),
          isPositive: (mainTrust.depositVsLastPeriodPercent || 0) >= 0,
        },
        payments: {
          value: formatPercentage(mainTrust.paymentVsLastPeriodPercent || 0),
          isPositive: (mainTrust.paymentVsLastPeriodPercent || 0) >= 0,
        },
        fees: {
          value: formatPercentage(mainTrust.feesVsLastPeriodPercent || 0),
          isPositive: (mainTrust.feesVsLastPeriodPercent || 0) >= 0,
        },
        retention: getAccountTrend('RETENTION'),
        wakala: getAccountTrend('WAKALA'),
        corporate: getAccountTrend('CORPORATE'),
        trust: getAccountTrend('TRUST'),
      },
    }

    return transformedData
  }

  const chartData = transformApiDataToCharts(dashboardData)
  // Loading state
  if (isLoading || isSubmitting) {
    return (
      <DashboardLayout title={dashboardTitle} subtitle="">
        <GlobalLoading fullHeight />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title={dashboardTitle} subtitle="">
        <div className="bg-white/75 dark:bg-gray-800/80 rounded-2xl flex flex-col h-full">
          <GlobalError
            error={error}
            onRetry={() => window.location.reload()}
            title="Error loading dashboard data"
            fullHeight
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={dashboardTitle} subtitle="">
      <div className="w-full max-w-7xl mx-auto">
        <FiltersRow onSubmit={handleSubmit} isSubmitting={isSubmitting} />

        <MainBalance dashboardData={dashboardData} />

        <div className="flex gap-6 mb-8 mt-8 justify-between">
          <AccountCard
            type="retention"
            title="RETENTION ACCOUNT"
            amount={chartData.accountData.retention}
            trend={chartData.trends.retention}
          />
          <AccountCard
            type="wakala"
            title="WAKALA ACCOUNT"
            amount={chartData.accountData.wakala}
            trend={chartData.trends.wakala}
          />
          <AccountCard
            type="corporate"
            title="CORPORATE ACCOUNT"
            amount={chartData.accountData.corporate}
            trend={chartData.trends.corporate}
          />
          <AccountCard
            type="trust"
            title="TRUST ACCOUNT"
            amount={chartData.accountData.trust}
            trend={chartData.trends.trust}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <KpiCard
                title="TOTAL DEPOSITS (MAIN A/C)"
                amount={chartData.totals.deposits}
                trend={chartData.trends.deposits}
                data={chartData.kpiData.deposits}
              />
              <KpiCard
                title="TOTAL PAYMENTS (MAIN A/C)"
                amount={chartData.totals.payments}
                trend={chartData.trends.payments}
                data={chartData.kpiData.payments}
              />
              <KpiCard
                title="TOTAL FEES COLLECTED (MAIN A/C)"
                amount={chartData.totals.fees}
                trend={chartData.trends.fees}
                data={chartData.kpiData.fees}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <StatusBars
                  data={chartData.statusData}
                  total={chartData.totals.status}
                />
              </div>
              <div>
                <GuaranteeChart
                  data={chartData.guaranteeData}
                  total={chartData.totals.guarantee}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
