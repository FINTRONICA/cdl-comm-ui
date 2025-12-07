import React from 'react'

interface StatusBadgeProps {
  status: string | null | undefined
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const getStatusVariant = (status: string | null | undefined) => {
    const statusStr = String(status || 'incomplete').toLowerCase()
    switch (statusStr) {
      case 'approved':
        return 'rounded-md bg-[#00DC821A] dark:bg-green-900/30 border border-[#00DC8240] dark:border-green-800 text-[#00A155] dark:text-green-400 font-sans text-sm not-italic font-medium leading-4'
      case 'rejected':
        return 'rounded-md bg-[#FB2C361A] dark:bg-red-900/30 border border-[#FB2C3626] dark:border-red-800 text-[#FB2C36] dark:text-red-400 font-sans text-sm not-italic font-medium leading-4'
      case 'failed':
        return 'rounded-md bg-[#FB2C361A] dark:bg-red-900/30 border border-[#FB2C3626] dark:border-red-800 text-[#FB2C36] dark:text-red-400 font-sans text-sm not-italic font-medium leading-4'
      case 'incomplete':
        return 'rounded-md bg-[rgba(239,177,0,0.10)] dark:bg-yellow-900/30 text-[#EFB100] dark:text-yellow-400 border border-[#EFB10040] dark:border-yellow-800 font-sans text-sm not-italic font-medium leading-4'
      case 'in_progress':
        return 'rounded-md bg-[#3B82F61A] dark:bg-blue-900/30 border border-[#3B82F640] dark:border-blue-800 text-[#3B82F6] dark:text-blue-400 font-sans text-sm not-italic font-medium leading-4'
      case 'in review':
        return 'rounded-md bg-[#F1F5F9] dark:bg-gray-700 text-[#314158] dark:text-gray-300 border border-[#CAD5E2] dark:border-gray-600 font-sans text-sm not-italic font-medium leading-4'
      case 'active':
        return 'rounded-md bg-[#00DC821A] dark:bg-green-900/30 border border-[#00DC8240] dark:border-green-800 text-[#00A155] dark:text-green-400 font-sans text-sm not-italic font-medium leading-4'
      case 'closed':
        return 'rounded-md bg-[#FB2C361A] dark:bg-red-900/30 border border-[#FB2C3626] dark:border-red-800 text-[#FB2C36] dark:text-red-400 font-sans text-sm not-italic font-medium leading-4'
      case 'pending':
        return 'rounded-md bg-[#EFB1001A] dark:bg-yellow-900/30 border border-[#EFB10040] dark:border-yellow-800 text-[#EFB100] dark:text-yellow-400 font-sans text-sm not-italic font-medium leading-4'
      case 'draft':
        return 'rounded-md bg-[#E5E7EB] dark:bg-gray-700 border border-[#D1D5DB] dark:border-gray-600 text-[#1E2939] dark:text-gray-300 font-sans text-sm not-italic font-medium leading-4'
      case 'initiated':
        return 'rounded-md bg-[#8B5CF61A] dark:bg-purple-900/30 border border-[#8B5CF640] dark:border-purple-800 text-[#8B5CF6] dark:text-purple-400 font-sans text-sm not-italic font-medium leading-4'
      case 'expired':
        return 'rounded-md bg-[#FB2C361A] dark:bg-red-900/30 border border-[#FB2C3626] dark:border-red-800 text-[#FB2C36] dark:text-red-400 font-sans text-sm not-italic font-medium leading-4'
      case 'cancelled':
        return 'rounded-md bg-[#6B7280] dark:bg-gray-600 border border-[#6B7280] dark:border-gray-500 text-[#FFFFFF] dark:text-gray-200 font-sans text-sm not-italic font-medium leading-4'
      case 'inactive':
        return 'rounded-md bg-[#F1F5F9] dark:bg-gray-700 text-[#314158] dark:text-gray-300 border border-[#CAD5E2] dark:border-gray-600 font-sans text-sm not-italic font-medium leading-4'
      default:
        return 'rounded-md bg-[#F1F5F9] dark:bg-gray-700 text-[#314158] dark:text-gray-300 border border-[#CAD5E2] dark:border-gray-600 font-sans text-sm not-italic font-medium leading-4'
    }
  }

  const getStatusDotColor = (status: string | null | undefined) => {
    const statusStr = String(status || 'incomplete').toLowerCase()
    switch (statusStr) {
      case 'approved':
        return 'bg-[#00A155]'
      case 'rejected':
        return 'bg-[#FB2C36]'
      case 'failed':
        return 'bg-[#FB2C36]'
      case 'incomplete':
        return 'bg-[#EFB100]'
      case 'in_progress':
        return 'bg-[#3B82F6]'
      case 'in review':
        return 'bg-[#314158]'
      case 'active':
        return 'bg-[#00A155]'
      case 'closed':
        return 'bg-[#FB2C36]'
      case 'pending':
        return 'bg-[#EFB100]'
      case 'in_progress':
        return 'bg-[#3B82F6]'
      case 'draft':
        return 'bg-[#1E2939]'
      case 'initiated':
        return 'bg-[#8B5CF6]'
      case 'expired':
        return 'bg-[#FB2C36]'
      case 'cancelled':
        return 'bg-[#6B7280]'
      case 'inactive':
        return 'bg-[#314158]'
      default:
        return 'bg-[#314158]'
    }
  }

  return (
    <div
      className={`${getStatusVariant(status)} ${className} inline-flex items-center gap-1 px-3 py-1.5 min-w-fit`}
    >
      <span
        className={`w-3 h-3 border rounded-full shrink-0 ${getStatusDotColor(status)}`}
      ></span>
      <span className="whitespace-nowrap">{status || 'Incomplete'}</span>
    </div>
  )
}
