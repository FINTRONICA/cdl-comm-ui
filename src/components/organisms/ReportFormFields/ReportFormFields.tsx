'use client'

import React from 'react'
import { useTheme } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { CalendarTodayOutlined } from '@mui/icons-material'
import {
  ProjectSelector,
  ProjectOption,
} from '@/components/molecules/ProjectSelector'
import {
  DeveloperSelector,
  DeveloperOption,
} from '@/components/molecules/DeveloperSelector'

interface ReportField {
  id: string
  label: string
  type: 'select' | 'date' | 'text' | 'multiselect'
  required: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
}

interface ReportFormFieldsProps {
  fields: ReportField[]
  values: Record<string, string | string[]>
  onChange: (fieldId: string, value: string | string[]) => void
}

export const ReportFormFields: React.FC<ReportFormFieldsProps> = ({
  fields,
  values,
  onChange,
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const renderField = (field: ReportField) => {
    const value = values[field.id] || ''

    switch (field.type) {
      case 'select':
        // Use ProjectSelector for project fields
        if (field.id === 'projectId' || field.id === 'project') {
          const projectOptions: ProjectOption[] =
            field.options?.map((option) => {
              const originalId = option.value.includes('-')
                ? option.value.split('-')[0]
                : option.value
              return {
                value: option.value,
                label: option.label,
                ...(originalId && originalId !== option.value
                  ? { originalId }
                  : {}),
              }
            }) || []

          return (
            <div key={field.id} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <ProjectSelector
                value={value as string}
                onChange={(selectedValue) => onChange(field.id, selectedValue)}
                options={projectOptions}
                placeholder={
                  field.placeholder || 'Search and select project...'
                }
                required={field.required}
                className="text-sm"
              />
            </div>
          )
        }

        // Use DeveloperSelector for developer fields
        if (field.id === 'developerId' || field.id === 'developer') {
          const developerOptions: DeveloperOption[] =
            field.options?.map((option) => ({
              value: option.value,
              label: option.label,
              ...(option.value !== option.label
                ? { originalId: option.value }
                : {}),
            })) || []

          return (
            <div key={field.id} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <DeveloperSelector
                value={value as string}
                onChange={(selectedValue) => onChange(field.id, selectedValue)}
                options={developerOptions}
                placeholder={
                  field.placeholder || 'Search and select developer...'
                }
                required={field.required}
                className="text-sm"
              />
            </div>
          )
        }

        return (
          <div key={field.id} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <select
                value={value as string}
                onChange={(e) => onChange(field.id, e.target.value)}
                required={field.required}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-colors duration-200 appearance-none cursor-pointer"
              >
                <option value="" disabled className="bg-white dark:bg-gray-800">
                  {field.placeholder || 'Select an option'}
                </option>
                {field.options?.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-white dark:bg-gray-800"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        )

      case 'date':
        // Parse date value - handle both YYYY-MM-DD and DD-MM-YYYY formats
        let dateValue = null
        if (value) {
          const dateStr = value as string
          // Try YYYY-MM-DD first (API format)
          if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
            dateValue = dayjs(dateStr, 'YYYY-MM-DD')
          } else {
            // Try DD-MM-YYYY format
            dateValue = dayjs(dateStr, 'DD-MM-YYYY')
          }
          // If invalid, set to null
          if (!dateValue.isValid()) {
            dateValue = null
          }
        }
        
        const datePickerStyles = {
          height: '46px',
          '& .MuiOutlinedInput-root': {
            height: '46px',
            borderRadius: '8px',
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            '& fieldset': {
              borderColor: isDark ? '#334155' : '#CAD5E2',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: isDark ? '#475569' : '#CAD5E2',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563EB',
            },
            '& .MuiInputBase-input': {
              color: isDark ? '#F1F5F9' : '#1E2939',
            },
          },
        }

        const labelStyles = {
          color: isDark ? '#94A3B8' : '#6A7282',
          fontFamily: 'Outfit',
          fontWeight: 400,
          fontSize: '12px',
          '&.Mui-focused': {
            color: '#2563EB',
          },
        }

        const valueStyles = {
          color: isDark ? '#F1F5F9' : '#1E2939',
          fontFamily: 'Outfit',
          fontWeight: 400,
          fontSize: '14px',
        }

        return (
          <div key={field.id} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={dateValue}
                onChange={(newValue) => {
                  const formattedDate = newValue
                    ? newValue.format('YYYY-MM-DD')
                    : ''
                  onChange(field.id, formattedDate)
                }}
                format="DD-MM-YYYY"
                slots={{
                  openPickerIcon: CalendarTodayOutlined,
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: field.required,
                    sx: datePickerStyles,
                    InputLabelProps: { sx: labelStyles },
                    InputProps: {
                      sx: valueStyles,
                      style: { height: '46px' },
                    },
                  },
                  popper: {
                    sx: {
                      '& .MuiPaper-root': {
                        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                        color: isDark ? '#F1F5F9' : '#1E2939',
                      },
                      '& .MuiPickersCalendarHeader-root': {
                        color: isDark ? '#F1F5F9' : '#1E2939',
                      },
                      '& .MuiPickersDay-root': {
                        color: isDark ? '#F1F5F9' : '#1E2939',
                        '&:hover': {
                          backgroundColor: isDark ? '#334155' : '#F3F4F6',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#2563EB',
                          color: '#FFFFFF',
                          '&:hover': {
                            backgroundColor: '#1D4ED8',
                          },
                        },
                        '&.Mui-disabled': {
                          color: isDark ? '#475569' : '#9CA3AF',
                        },
                      },
                      '& .MuiDayCalendar-weekContainer': {
                        '& .MuiPickersDay-root': {
                          color: isDark ? '#F1F5F9' : '#1E2939',
                        },
                      },
                      '& .MuiPickersCalendarHeader-labelContainer': {
                        '& .MuiPickersCalendarHeader-label': {
                          color: isDark ? '#F1F5F9' : '#1E2939',
                        },
                      },
                      '& .MuiPickersArrowSwitcher-root': {
                        '& .MuiIconButton-root': {
                          color: isDark ? '#F1F5F9' : '#1E2939',
                          '&:hover': {
                            backgroundColor: isDark ? '#334155' : '#F3F4F6',
                          },
                        },
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </div>
        )

      case 'text':
        return (
          <div key={field.id} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value as string}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder || 'Enter text'}
              required={field.required}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg font-medium placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200"
            />
          </div>
        )

      case 'multiselect':
        return (
          <div key={field.id} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <select
                multiple
                value={value as string[]}
                onChange={(e) => {
                  const selectedValues = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  )
                  onChange(field.id, selectedValues)
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-colors duration-200"
                required={field.required}
                size={Math.min(field.options?.length || 3, 5)}
              >
                {field.options?.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-white dark:bg-gray-800"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Hold Ctrl/Cmd to select multiple options
            </p>
          </div>
        )

      default:
        return null
    }
  }

  if (!fields.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <p className="text-sm font-medium mb-1">No form fields configured</p>
        <p className="text-xs">
          This report does not require any input parameters.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {fields.map(renderField)}
    </div>
  )
}
