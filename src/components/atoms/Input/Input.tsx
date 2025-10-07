import React from 'react'
import { cn } from '@/utils'
import { type InputProps } from '@/types'

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  error,
  required = false,
  icon,
  className,
  ...props
}) => {
  const baseClasses =
    'w-full px-4 py-3 border border-gray-300 rounded-lg font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm transition-colors duration-200'
  const errorClasses = error
    ? 'border-error-500 focus:ring-error-500 focus:border-error-500'
    : ''
  const disabledClasses = disabled
    ? 'bg-gray-100 cursor-not-allowed opacity-60'
    : ''
  const iconClasses = icon ? 'pl-12' : ''

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  const handleBlur = () => {
    if (onBlur) {
      onBlur()
    }
  }

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        className={cn(
          baseClasses,
          errorClasses,
          disabledClasses,
          iconClasses,
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
    </div>
  )
}
