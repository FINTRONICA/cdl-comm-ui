import React from 'react'

interface BadgeProps {
  variant?: 'approved' | 'rejected' | 'incomplete' | 'inReview' | 'default'
  children: React.ReactNode
  size?: 'sm' | 'md'
  showDot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  size = 'sm',
  showDot = false,
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-full font-medium gap-1.5'

  const variantClasses = {
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    incomplete: 'bg-yellow-100 text-yellow-800',
    inReview: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
  }

  const dotColors = {
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
    incomplete: 'bg-yellow-500',
    inReview: 'bg-blue-500',
    default: 'bg-gray-500',
  }

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  }

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}
        />
      )}
      {children}
    </span>
  )
}
