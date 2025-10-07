import React from 'react'

interface StatusCardProps {
  label: string
  count: number
  color: string
  textColor: string
  dotColor: string
  borderColor?: string
  variant?: 'default' | 'compact'
  className?: string
}

export const StatusCard: React.FC<StatusCardProps> = ({
  label,
  count,
  color,
  textColor,
  dotColor,
  borderColor = '',
  variant = 'default',
  className = '',
}) => {
  if (variant === 'compact') {
    return (
      <div
        className={`flex-1 flex flex-col items-start justify-start py-4 pr-4 pl-6 gap-[10px] rounded-2xl ${color} ${className}`}
      >
        <div className="flex items-center gap-1">
          <span className={`w-3 h-3 rounded-full ${dotColor}`}></span>
          <span className={`text-sm font-medium ${textColor}`}>{label}</span>
        </div>
        <div className="font-medium text-[32px] leading-[100%] tracking-[-0.02em] align-middle font-sans text-[#1E2939]">{count}</div>
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col justify-between px-6 py-6 rounded-xl ${color} ${borderColor} min-h-[120px] ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-3 h-3 rounded-full ${dotColor}`}></span>
        <span className={`text-sm font-medium ${textColor}`}>{label}</span>
      </div>
      <div className={`text-3xl font-bold ${textColor}`}>{count}</div>
    </div>
  )
}
