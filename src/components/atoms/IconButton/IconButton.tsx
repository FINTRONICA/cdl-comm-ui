import React from 'react'

interface IconButtonProps {
  icon: React.ComponentType<{ className?: string }>
  onClick?: () => void
  disabled?: boolean
  className?: string
  title?: string
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onClick,
  disabled = false,
  className = '',
  title,
}) => {
  return (
    <button
      className={`flex items-center justify-center w-11 h-11 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}
