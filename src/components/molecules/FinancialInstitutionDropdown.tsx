'use client'

import React, { useState } from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
  Chip,
} from '@mui/material'
import { useEnabledFinancialInstitutionsDropdown } from '@/hooks/useFinancialInstitutions'

interface FinancialInstitutionDropdownProps {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
  disabled?: boolean
  error?: boolean
  helperText?: string
  fullWidth?: boolean
  size?: 'small' | 'medium'
  variant?: 'outlined' | 'filled' | 'standard'
}

/**
 * Financial Institution Dropdown with Load More functionality
 * Automatically handles pagination and loads more institutions when needed
 */
const FinancialInstitutionDropdown: React.FC<FinancialInstitutionDropdownProps> = ({
  value,
  onChange,
  label = 'Select Financial Institution',
  required = false,
  disabled = false,
  error = false,
  helperText,
  fullWidth = true,
  size = 'medium',
  variant = 'outlined',
}) => {
  const {
    dropdownOptions,
    loading,
    loadingMore,
    error: apiError,
    hasMore,
    totalElements,
    loadMore,
  } = useEnabledFinancialInstitutionsDropdown()

  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (event: any) => {
    const selectedValue = event.target.value
    
    if (selectedValue === '__LOAD_MORE__') {
      // Load more institutions
      loadMore()
      return
    }
    
    if (selectedValue === '__LOADING__') {
      // Don't allow selection of loading item
      return
    }
    
    onChange(selectedValue)
  }

  const handleOpen = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const renderMenuItem = (option: any, index: number) => {
    if (option.settingValue === '__LOAD_MORE__') {
      return (
        <MenuItem
          key={option.id}
          value={option.settingValue}
          onClick={loadMore}
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'primary.contrastText',
            },
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="center" width="100%">
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {option.displayName}
            </Typography>
            {hasMore && (
              <Chip
                label={`${totalElements - dropdownOptions.filter(opt => opt.settingValue !== '__LOAD_MORE__' && opt.settingValue !== '__LOADING__').length} more`}
                size="small"
                sx={{ ml: 1, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </MenuItem>
      )
    }

    if (option.settingValue === '__LOADING__') {
      return (
        <MenuItem key={option.id} value={option.settingValue} disabled>
          <Box display="flex" alignItems="center" justifyContent="center" width="100%">
            <CircularProgress size={16} sx={{ mr: 1 }} />
            <Typography variant="body2">{option.displayName}</Typography>
          </Box>
        </MenuItem>
      )
    }

    return (
      <MenuItem key={option.id} value={option.settingValue}>
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
          <Typography variant="body2">{option.displayName}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {option.settingValue}
          </Typography>
        </Box>
      </MenuItem>
    )
  }

  return (
    <FormControl
      fullWidth={fullWidth}
      required={required}
      error={error || !!apiError}
      size={size}
      variant={variant}
      disabled={disabled || loading}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={handleChange}
        onOpen={handleOpen}
        onClose={handleClose}
        open={isOpen}
        label={label}
        disabled={disabled || loading}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300, // Limit height to show scroll
            },
          },
        }}
      >
        {loading ? (
          <MenuItem disabled>
            <Box display="flex" alignItems="center" justifyContent="center" width="100%">
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography variant="body2">Loading...</Typography>
            </Box>
          </MenuItem>
        ) : (
          dropdownOptions.map((option, index) => renderMenuItem(option, index))
        )}
      </Select>
      {helperText && (
        <Typography variant="caption" color={error || apiError ? 'error' : 'text.secondary'} sx={{ mt: 0.5 }}>
          {helperText}
        </Typography>
      )}
      {apiError && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
          Error loading institutions: {apiError}
        </Typography>
      )}
    </FormControl>
  )
}

export default FinancialInstitutionDropdown
