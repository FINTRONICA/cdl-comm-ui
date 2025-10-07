import React from 'react'

interface SearchInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search',
  value,
  onChange,
  className = '',
  disabled = false,
}) => {
  return (
    <input
      className={`w-full h-8 min-w-0 px-2 py-1 bg-white border border-[#9CA3AF] font-sans text-[#1E2939] font-normal text-xs leading-[1rem] tracking-normal rounded-md placeholder:font-sans placeholder:font-normal placeholder:text-xs placeholder:leading-3 placeholder:text-[#99A1AF] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  )
}
