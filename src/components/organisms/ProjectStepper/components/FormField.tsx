'use client'

import React from 'react'
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Typography,
} from '@mui/material'
import { Controller, FieldError, Control } from 'react-hook-form'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import {
  commonFieldStyles,
  selectStyles,
  errorFieldStyles,
  labelSx,
  valueSx,
  compactFieldStyles,
  compactLabelSx,
  compactValueSx,
  calendarIconSx,
} from '../styles'
import { VALIDATION_PATTERNS, ERROR_MESSAGES } from '../constants'

interface FormFieldProps {
  name: string
  control: Control<any>
  label: string
  type?: 'text' | 'select' | 'date' | 'number' | 'email' | 'password'
  options?: { value: string | number; label: string }[]
  error?: FieldError
  required?: boolean
  disabled?: boolean
  helperText?: string
  placeholder?: string
  rules?: any
  defaultValue?: any
  onChange?: (value: any) => void
  datePickerProps?: any
  endAdornment?: React.ReactNode
  startAdornment?: React.ReactNode
  size?: 'small' | 'medium'
  fullWidth?: boolean
  multiline?: boolean
  rows?: number
  maxRows?: number
  minRows?: number
  gridSize?: { xs?: number; md?: number }
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  control,
  label,
  type = 'text',
  options = [],
  error,
  required = false,
  disabled = false,
  helperText,
  placeholder,
  rules,
  defaultValue,
  onChange,
  datePickerProps,
  endAdornment,
  startAdornment,
  size = 'medium',
  fullWidth = true,
  multiline = false,
  rows,
  maxRows,
  minRows,
  // gridSize, // Removed unused parameter
}) => {
  const fieldError = error
  const hasError = !!fieldError
  const isCompact = size === 'small'

  const fieldStyles = hasError
    ? errorFieldStyles
    : isCompact
      ? compactFieldStyles
      : commonFieldStyles

  const labelStyles = isCompact ? compactLabelSx : labelSx
  const valueStyles = isCompact ? compactValueSx : valueSx

  const renderField = ({ field }: any) => {
    const commonProps = {
      ...field,
      fullWidth,
      label: label + (required ? '*' : ''),
      error: hasError,
      helperText: fieldError?.message || helperText,
      disabled,
      placeholder,
      InputLabelProps: { sx: labelStyles },
      InputProps: {
        sx: valueStyles,
        startAdornment,
        endAdornment,
      },
      sx: fieldStyles,
      multiline,
      rows,
      maxRows,
      minRows,
    }

    switch (type) {
      case 'select':
        return (
          <FormControl fullWidth error={hasError}>
            <InputLabel sx={labelStyles}>
              {label + (required ? '*' : '')}
            </InputLabel>
            <Select
              {...field}
              label={label + (required ? '*' : '')}
              disabled={disabled}
              sx={{ ...selectStyles, ...valueStyles }}
              onChange={(e) => {
                field.onChange(e)
                onChange?.(e.target.value)
              }}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {fieldError && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 0.5, ml: 1.75 }}
              >
                {fieldError.message}
              </Typography>
            )}
          </FormControl>
        )

      case 'date':
        const StyledCalendarIcon = (props: any) => (
          <props.icon {...props} sx={calendarIconSx} />
        )

        return (
          <DatePicker
            label={label + (required ? '*' : '')}
            value={field.value}
            onChange={(value) => {
              field.onChange(value)
              onChange?.(value)
            }}
            format="DD/MM/YYYY"
            slots={{
              openPickerIcon: StyledCalendarIcon,
            }}
            slotProps={{
              textField: {
                fullWidth,
                error: hasError,
                helperText: fieldError?.message || helperText,
                sx: fieldStyles,
                InputLabelProps: { sx: labelStyles },
                InputProps: {
                  sx: valueStyles,
                  style: { height: isCompact ? '32px' : '46px' },
                  startAdornment,
                  endAdornment,
                },
                ...datePickerProps,
              },
            }}
            {...datePickerProps}
          />
        )

      case 'number':
        return (
          <TextField
            {...commonProps}
            type="number"
            onChange={(e) => {
              field.onChange(e)
              onChange?.(e.target.value)
            }}
          />
        )

      case 'email':
        return (
          <TextField
            {...commonProps}
            type="email"
            onChange={(e) => {
              field.onChange(e)
              onChange?.(e.target.value)
            }}
          />
        )

      case 'password':
        return (
          <TextField
            {...commonProps}
            type="password"
            onChange={(e) => {
              field.onChange(e)
              onChange?.(e.target.value)
            }}
          />
        )

      default:
        return (
          <TextField
            {...commonProps}
            onChange={(e) => {
              field.onChange(e)
              onChange?.(e.target.value)
            }}
          />
        )
    }
  }

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={rules}
      render={renderField}
    />
  )
}

// Helper function to create validation rules
export const createValidationRules = (
  fieldType: string,
  required: boolean = false
) => {
  const rules: any = {}

  if (required) {
    rules.required = ERROR_MESSAGES.REQUIRED
  }

  switch (fieldType) {
    case 'percentage':
      rules.pattern = {
        value: VALIDATION_PATTERNS.PERCENTAGE,
        message: ERROR_MESSAGES.INVALID_PERCENTAGE,
      }
      break
    case 'amount':
      rules.pattern = {
        value: VALIDATION_PATTERNS.AMOUNT,
        message: ERROR_MESSAGES.INVALID_AMOUNT,
      }
      break
  }

  return rules
}
