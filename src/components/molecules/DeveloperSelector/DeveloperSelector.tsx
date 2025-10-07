'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

export interface DeveloperOption {
  value: string
  label: string
  originalId?: string
}

interface DeveloperSelectorProps {
  value?: string
  onChange: (value: string) => void
  options: DeveloperOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
}

export const DeveloperSelector: React.FC<DeveloperSelectorProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Search and select developer...',
  disabled = false,
  className = '',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options
    
    const query = searchQuery.toLowerCase()
    return options.filter(option => 
      option.label.toLowerCase().includes(query) ||
      (option.originalId && option.originalId.toLowerCase().includes(query))
    )
  }, [options, searchQuery])

  // Get selected option display
  const selectedOption = useMemo(() => {
    return options.find(option => option.value === value)
  }, [options, value])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setFocusedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          )
          break
        case 'Enter':
          event.preventDefault()
          if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
            handleSelect(filteredOptions[focusedIndex])
          }
          break
        case 'Escape':
          setIsOpen(false)
          setSearchQuery('')
          setFocusedIndex(-1)
          inputRef.current?.blur()
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, focusedIndex, filteredOptions])

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[focusedIndex] as HTMLElement
      if (focusedElement) {
        focusedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
      }
    }
  }, [focusedIndex])

  const handleSelect = (option: DeveloperOption) => {
    onChange(option.value)
    setIsOpen(false)
    setSearchQuery('')
    setFocusedIndex(-1)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setSearchQuery('')
  }

  const handleToggle = () => {
    if (disabled) return
    
    setIsOpen(!isOpen)
    setFocusedIndex(-1)
    
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setFocusedIndex(-1)
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <div
        onClick={handleToggle}
        className={`
          relative w-full min-h-[40px] px-3 py-2 text-left bg-white border border-gray-300 rounded-md cursor-pointer
          transition-colors duration-200
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400'}
          ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''}
          ${required && !value ? 'border-red-300' : ''}
        `}
      >
        {/* Selected Value or Placeholder */}
        <div className="flex items-center justify-between">
          <span className={`block truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-900'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          
          <div className="flex items-center gap-1">
            {/* Clear Button */}
            {value && !disabled && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                type="button"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            
            {/* Dropdown Arrow */}
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </div>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder="Type to search developers..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Options List */}
          <ul
            ref={listRef}
            className="max-h-60 overflow-auto py-1"
            role="listbox"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`
                    px-3 py-2 text-sm cursor-pointer transition-colors duration-150
                    ${index === focusedIndex ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
                    ${option.value === value ? 'bg-blue-100 text-blue-900 font-medium' : ''}
                    hover:bg-gray-50
                  `}
                  role="option"
                  aria-selected={option.value === value}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    {option.originalId && option.originalId !== option.label && (
                      <span className="text-xs text-gray-500 mt-1">ID: {option.originalId}</span>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-gray-500 italic">
                No developers found matching &ldquo;{searchQuery}&rdquo;
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
