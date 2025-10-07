import React from 'react'
import { Input } from '../../atoms/Input'

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  className = '',
}) => {
  const handleChange = (value: string) => {
    onChange?.(value)
  }

  return (
    <div className={`flex justify-center w-full mb-8 ${className}`}>
      <Input
        type="search"
        placeholder={placeholder}
        value={value || ''}
        onChange={handleChange}
        icon
        className="max-w-md"
      />
    </div>
  )
}
