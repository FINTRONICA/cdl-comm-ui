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
        return 'rounded-md bg-[#00DC821A] border border-[#00DC8240] text-[#00A155] font-sans text-sm not-italic font-medium leading-4'
      case 'rejected':
        return 'rounded-md bg-[#FB2C361A] border border-[#FB2C3626] text-[#FB2C36] font-sans text-sm not-italic font-medium leading-4'
      case 'failed':
        return 'rounded-md bg-[#FB2C361A] border border-[#FB2C3626] text-[#FB2C36] font-sans text-sm not-italic font-medium leading-4'
      case 'incomplete':
        return 'rounded-md bg-[rgba(239,177,0,0.10)] text-[#EFB100] border border-[#EFB10040] font-sans text-sm not-italic font-medium leading-4'
      case 'in_progress':
        return 'rounded-md bg-[#3B82F61A] border border-[#3B82F640] text-[#3B82F6] font-sans text-sm not-italic font-medium leading-4'
      case 'in review':
        return 'rounded-md bg-[#F1F5F9] text-[#314158] border border-[#CAD5E2] font-sans text-sm not-italic font-medium leading-4'
      case 'active':
        return 'rounded-md bg-[#00DC821A] border border-[#00DC8240] text-[#00A155] font-sans text-sm not-italic font-medium leading-4'
      case 'closed':
        return 'rounded-md bg-[#FB2C361A] border border-[#FB2C3626] text-[#FB2C36] font-sans text-sm not-italic font-medium leading-4'
      case 'pending':
        return 'rounded-md bg-[#EFB1001A] border border-[#EFB10040] text-[#EFB100] font-sans text-sm not-italic font-medium leading-4'
      case 'in_progress':
        return 'rounded-md bg-[#3B82F61A] border border-[#3B82F640] text-[#3B82F6] font-sans text-sm not-italic font-medium leading-4'
      case 'draft':
        return 'rounded-md bg-[#E5E7EB] border border-[#D1D5DB] text-[#1E2939] font-sans text-sm not-italic font-medium leading-4'
      case 'initiated':
        return 'rounded-md bg-[#8B5CF61A] border border-[#8B5CF640] text-[#8B5CF6] font-sans text-sm not-italic font-medium leading-4'
      default:
        return 'rounded-md bg-[#F1F5F9] text-[#314158] border border-[#CAD5E2] font-sans text-sm not-italic font-medium leading-4'
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
      default:
        return 'bg-[#314158]'
    }
  }

  return (
    <div className={`${getStatusVariant(status)} ${className} inline-block max-w-full`}>
      <div className="flex items-center gap-1 mx-1.5 my-1 min-w-0">
        <span
          className={`w-3 h-3 border rounded-full shrink-0 ${getStatusDotColor(status)}`}
        ></span>
        <span className="truncate text-ellipsis overflow-hidden whitespace-nowrap">
          {status || 'Incomplete'}
        </span>
      </div>
    </div>
  )
}
