export const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'rounded-md bg-[#00DC821A] border border-[#00DC8240] text-[#00A155] font-sans text-sm not-italic font-medium leading-4'
    case 'rejected':
      return 'rounded-md bg-[#FB2C361A] border border-[#FB2C3626] text-[#FB2C36] font-sans text-sm not-italic font-medium leading-4'
    case 'incomplete':
      return 'rounded-md bg-[rgba(239,177,0,0.10)] text-[#EFB100] border border-[#EFB10040] font-sans text-sm not-italic font-medium leading-4'
    case 'in review':
      return 'rounded-md bg-[#F1F5F9] text-[#314158] border border-[#CAD5E2] font-sans text-sm not-italic font-medium leading-4'
    case 'partial payment':
      return 'rounded-md bg-[#3B82F61A] border border-[#3B82F640] text-[#3B82F6] font-sans text-sm not-italic font-medium leading-4'
    case 'pending':
      return 'rounded-md bg-[#EFB1001A] border border-[#EFB10040] text-[#EFB100] font-sans text-sm not-italic font-medium leading-4'
    case 'in_progress':
      return 'rounded-md bg-[#3B82F61A] border border-[#3B82F640] text-[#3B82F6] font-sans text-sm not-italic font-medium leading-4'
    case 'draft':
      return 'rounded-md bg-[#E5E7EB] border border-[#D1D5DB] text-[#1E2939] font-sans text-sm not-italic font-medium leading-4'
    case 'initiated':
      return 'rounded-md bg-[#8B5CF61A] border border-[#8B5CF640] text-[#8B5CF6] font-sans text-sm not-italic font-medium leading-4'
    case 'unknown':
      return 'rounded-md bg-[#6B72801A] border border-[#6B728040] text-[#6B7280] font-sans text-sm not-italic font-medium leading-4'
    case 'n/a':
      return 'rounded-md bg-[#9CA3AF1A] border border-[#9CA3AF40] text-[#9CA3AF] font-sans text-sm not-italic font-medium leading-4'
    default:
      return 'rounded-md bg-[#F1F5F9] text-[#314158] border border-[#CAD5E2] font-sans text-sm not-italic font-medium leading-4'
  }
}

export const getStatusDotColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-[#00A155]'
    case 'rejected':
      return 'bg-[#FB2C36]'
    case 'incomplete':
      return 'bg-[#EFB100]'
    case 'in review':
      return 'bg-[#314158]'
    case 'partial payment':
      return 'bg-[#3B82F6]'
    case 'pending':
      return 'bg-[#EFB100]'
    case 'in_progress':
      return 'bg-[#3B82F6]'
    case 'draft':
      return 'bg-[#1E2939]'
    case 'initiated':
      return 'bg-[#8B5CF6]'
    case 'unknown':
      return 'bg-[#6B7280]'
    case 'n/a':
      return 'bg-[#9CA3AF]'
    default:
      return 'bg-[#314158]'
  }
}

export const getStatusCardConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case 'rejected':
      return {
        color: 'bg-[#FB2C361A] border border-[#FB2C3626]',
        textColor: 'text-[#FB2C36]',
        dotColor: 'bg-[#FB2C36]',
      }
    case 'incomplete':
      return {
        color: 'bg-[#EFB1001A] border border-[#EFB10040]',
        textColor: 'text-[#EFB100]',
        dotColor: 'bg-[#EFB100]',
      }
    case 'in review':
      return {
        color: 'bg-[#E5E7EB] border border-[#D1D5DB]',
        textColor: 'text-[#1E2939]',
        dotColor: 'bg-[#1E2939]',
      }
    case 'partial payment':
      return {
        color: 'bg-[#3B82F61A] border border-[#3B82F640]',
        textColor: 'text-[#3B82F6]',
        dotColor: 'bg-[#3B82F6]',
      }
    case 'approved':
      return {
        color: 'bg-[#00DC821A] border border-[#00DC8240]',
        textColor: 'text-[#00A155]',
        dotColor: 'bg-[#00A155]',
      }
    case 'active':
      return {
        color: 'bg-[#00DC821A] border border-[#00DC8240]',
        textColor: 'text-[#00A155]',
        dotColor: 'bg-[#00A155]',
      }
    case 'inactive':
      return {
        color: 'bg-[#FB2C361A] border border-[#FB2C3626]',
        textColor: 'text-[#FB2C36]',
        dotColor: 'bg-[#FB2C36]',
      }
    case 'pending':
      return {
        color: 'bg-[#EFB1001A] border border-[#EFB10040]',
        textColor: 'text-[#EFB100]',
        dotColor: 'bg-[#EFB100]',
      }
    case 'draft':
      return {
        color: 'bg-[#E5E7EB] border border-[#D1D5DB]',
        textColor: 'text-[#1E2939]',
        dotColor: 'bg-[#1E2939]',
      }
    case 'in_progress':
      return {
        color: 'bg-[#3B82F61A] border border-[#3B82F640]',
        textColor: 'text-[#3B82F6]',
        dotColor: 'bg-[#3B82F6]',
      }
    case 'initiated':
      return {
        color: 'bg-[#8B5CF61A] border border-[#8B5CF640]',
        textColor: 'text-[#8B5CF6]',
        dotColor: 'bg-[#8B5CF6]',
      }
    case 'unknown':
      return {
        color: 'bg-[#6B72801A] border border-[#6B728040]',
        textColor: 'text-[#6B7280]',
        dotColor: 'bg-[#6B7280]',
      }
    case 'n/a':
      return {
        color: 'bg-[#9CA3AF1A] border border-[#9CA3AF40]',
        textColor: 'text-[#9CA3AF]',
        dotColor: 'bg-[#9CA3AF]',
      }
    default:
      return {
        color: 'bg-[#F1F5F9] border border-[#CAD5E2]',
        textColor: 'text-[#314158]',
        dotColor: 'bg-[#314158]',
      }
  }
}