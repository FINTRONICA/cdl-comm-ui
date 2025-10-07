import React from 'react'
import { cn } from '@/utils'
import { type SelectProps } from '@/types'
import { ChevronDown } from 'lucide-react'

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  error,
  required = false,
  className,
  ...props
}) => {
  const baseClasses =
    'w-full px-4 py-3 border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm transition-colors duration-200 appearance-none'
  const errorClasses = error
    ? 'border-error-500 focus:ring-error-500 focus:border-error-500'
    : ''
  const disabledClasses = disabled
    ? 'bg-gray-100 cursor-not-allowed opacity-60'
    : ''

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  return (
    <div className="relative">
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        className={cn(baseClasses, errorClasses, disabledClasses, className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
      {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
    </div>
  )
}
