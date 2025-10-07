import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/utils'

export interface AutocompleteOption {
  value: string
  label: string
  [key: string]: any // Allow additional properties
}

export interface AutocompleteProps {
  options: AutocompleteOption[]
  value: string
  onChange: (value: string) => void
  onOptionSelect?: (option: AutocompleteOption) => void
  onSearch?: (
    query: string
  ) => Promise<AutocompleteOption[]> | AutocompleteOption[]
  selectedOption?: AutocompleteOption | null
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  error?: string
  required?: boolean
  className?: string
  minSearchLength?: number
  searchDelay?: number
  noResultsText?: string
  clearable?: boolean
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  options = [],
  value,
  onChange,
  onOptionSelect,
  onSearch,
  selectedOption: propSelectedOption,
  placeholder = 'Search and select...',
  disabled = false,
  loading = false,
  error,
  required = false,
  className = '',
  minSearchLength = 1,
  searchDelay = 300,
  noResultsText = 'No results found',
  clearable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredOptions, setFilteredOptions] =
    useState<AutocompleteOption[]>(options)
  const [isSearching, setIsSearching] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [selectedOption, setSelectedOption] =
    useState<AutocompleteOption | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Use prop selectedOption or internal state
  const displaySelectedOption = propSelectedOption || selectedOption

  // Update selected option when value changes
  React.useEffect(() => {
    if (propSelectedOption) {
      setSelectedOption(propSelectedOption)
    } else if (value && !selectedOption) {
      // Try to find in options first, then in filteredOptions
      const foundOption =
        options.find((option) => option.value === value) ||
        filteredOptions.find((option) => option.value === value)
      if (foundOption) {
        setSelectedOption(foundOption)
      }
    } else if (!value) {
      setSelectedOption(null)
    }
  }, [value, options, filteredOptions, selectedOption, propSelectedOption])

  // Debounced search function
  const debouncedSearch = useCallback(
    async (query: string) => {
      if (query.length < minSearchLength) {
        setFilteredOptions(options)
        return
      }

      setIsSearching(true)
      try {
        if (onSearch) {
          const searchResults = await onSearch(query)
          console.log('Autocomplete search results:', searchResults)
          setFilteredOptions(searchResults)
        } else {
          // Local filtering if no search function provided
          const filtered = options.filter((option) =>
            option.label.toLowerCase().includes(query.toLowerCase())
          )
          setFilteredOptions(filtered)
        }
      } catch (error) {
        console.error('Search error:', error)
        setFilteredOptions([])
      } finally {
        setIsSearching(false)
      }
    },
    [onSearch, options, minSearchLength]
  )

  // Handle search input changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setHighlightedIndex(-1)

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      debouncedSearch(query)
    }, searchDelay)
  }

  // Handle option selection
  const handleOptionSelect = (option: AutocompleteOption) => {
    setSelectedOption(option)
    onChange(option.value)
    onOptionSelect?.(option)
    setSearchQuery('')
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.blur()
  }

  // Handle clear selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedOption(null)
    onChange('')
    setSearchQuery('')
    setFilteredOptions(options)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === 'Enter' || e.key === 'ArrowDown')) {
      e.preventDefault()
      setIsOpen(true)
      return
    }

    if (e.key === 'Escape') {
      setIsOpen(false)
      setHighlightedIndex(-1)
      inputRef.current?.blur()
      return
    }

    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]!)
        }
        break
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchQuery('')
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Update filtered options when options prop changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredOptions(options)
    }
  }, [options, searchQuery])

  const baseClasses =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200'
  const errorClasses = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : ''
  const disabledClasses = disabled
    ? 'bg-gray-100 cursor-not-allowed opacity-60'
    : ''

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : displaySelectedOption?.label || ''}
          onChange={(e) => {
            if (isOpen) {
              handleSearchChange(e.target.value)
            }
          }}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true)
              setSearchQuery('')
              setFilteredOptions(options)
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={selectedOption ? selectedOption.label : placeholder}
          disabled={disabled}
          required={required}
          className={cn(
            baseClasses,
            errorClasses,
            disabledClasses,
            'pl-10 pr-20'
          )}
        />

        {/* Clear button */}
        {clearable && value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {loading || isSearching ? (
            <div className="px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              Searching...
            </div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={option.value}
                className={cn(
                  'px-3 py-2 cursor-pointer transition-colors',
                  index === highlightedIndex
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700'
                )}
                onClick={() => handleOptionSelect(option)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              {noResultsText}
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
