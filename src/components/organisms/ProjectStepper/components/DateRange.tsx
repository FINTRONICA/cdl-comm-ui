'use client'

import React from 'react'
import { Box, Typography } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Controller, useFormContext } from 'react-hook-form'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import { commonFieldStyles, labelSx, valueSx, calendarIconSx } from '../styles'

interface DateRangeProps {
  startName: string
  endName: string
  startLabel: string
  endLabel: string
  required?: boolean
  error?: any
  helperText?: string
  minDate?: Dayjs
  maxDate?: Dayjs
  sx?: any
}

export const DateRange: React.FC<DateRangeProps> = ({
  startName,
  endName,
  startLabel,
  endLabel,
  required = false,
  error,
  helperText,
  minDate,
  maxDate,
  sx,
}) => {
  const formContext = useFormContext()

  // Early return if form context is not available
  if (!formContext) {
    return (
      <Box sx={sx}>
        <Typography color="error" align="center">
          Form context not available. Please ensure FormProvider is properly set
          up.
        </Typography>
      </Box>
    )
  }

  const { control, watch, setValue } = formContext

  const startDate = watch(startName)
  const endDate = watch(endName)

  const StyledCalendarIcon = (props: any) => (
    <props.icon {...props} sx={calendarIconSx} />
  )

  const handleStartDateChange = (date: Dayjs | null) => {
    setValue(startName, date)

    // Auto-adjust end date if it's before start date
    if (date && endDate && dayjs(endDate).isBefore(date)) {
      setValue(endName, date.add(1, 'day'))
    }
  }

  const handleEndDateChange = (date: Dayjs | null) => {
    setValue(endName, date)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={sx}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
          <Box flex={1}>
            <Controller
              name={startName}
              control={control}
              rules={{ required: required ? 'Start date is required' : false }}
              render={({ field, fieldState }) => (
                <DatePicker
                  label={`${startLabel}${required ? '*' : ''}`}
                  value={field.value}
                  onChange={handleStartDateChange}
                  {...(minDate && { minDate })}
                  {...(endDate || maxDate
                    ? { maxDate: endDate || maxDate }
                    : {})}
                  format="DD/MM/YYYY"
                  slots={{
                    openPickerIcon: StyledCalendarIcon,
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!fieldState.error,
                      helperText: fieldState.error?.message || helperText,
                      sx: commonFieldStyles,
                      InputLabelProps: { sx: labelSx },
                      InputProps: {
                        sx: valueSx,
                        style: { height: '46px' },
                      },
                    },
                  }}
                />
              )}
            />
          </Box>

          <Box flex={1}>
            <Controller
              name={endName}
              control={control}
              rules={{
                required: required ? 'End date is required' : false,
                validate: (value) => {
                  if (!value || !startDate) return true
                  return (
                    dayjs(value).isAfter(dayjs(startDate)) ||
                    'End date must be after start date'
                  )
                },
              }}
              render={({ field, fieldState }) => (
                <DatePicker
                  label={`${endLabel}${required ? '*' : ''}`}
                  value={field.value}
                  onChange={handleEndDateChange}
                  {...(startDate || minDate
                    ? { minDate: startDate || minDate }
                    : {})}
                  {...(maxDate && { maxDate })}
                  format="DD/MM/YYYY"
                  slots={{
                    openPickerIcon: StyledCalendarIcon,
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!fieldState.error,
                      helperText: fieldState.error?.message || helperText,
                      sx: commonFieldStyles,
                      InputLabelProps: { sx: labelSx },
                      InputProps: {
                        sx: valueSx,
                        style: { height: '46px' },
                      },
                    },
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {error && (
          <Typography
            variant="caption"
            color="error"
            sx={{ mt: 1, display: 'block' }}
          >
            {error.message}
          </Typography>
        )}
      </Box>
    </LocalizationProvider>
  )
}
