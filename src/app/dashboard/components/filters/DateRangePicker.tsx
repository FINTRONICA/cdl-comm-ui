import React from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { CalendarTodayOutlined } from '@mui/icons-material'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onChange: (start: string, end: string) => void
  className?: string
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  className = '',
}) => {
  const handleStartDateChange = (date: any) => {
    if (date) {
      onChange(date.format('DD-MM-YYYY'), endDate)
    }
  }

  const handleEndDateChange = (date: any) => {
    if (date) {
      onChange(startDate, date.format('DD-MM-YYYY'))
    }
  }

  const labelSx = {
    color: '#6A7282',
    fontFamily: 'Outfit',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '12px',
    letterSpacing: 0,
  }

  const valueSx = {
    color: '#1E2939',
    fontFamily: 'Outfit',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '14px',
    letterSpacing: 0,
    wordBreak: 'break-word',
  }

  const commonFieldStyles = {
    height: '46px',
    '& .MuiOutlinedInput-root': {
      height: '46px',
      borderRadius: '8px',
      '& fieldset': {
        borderColor: '#CAD5E2',
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: '#CAD5E2',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2563EB',
      },
    },
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={`date-range-picker flex gap-2 ${className}`}>
        <DatePicker
          label="Start Date"
          value={dayjs(startDate, 'DD-MM-YYYY')}
          onChange={handleStartDateChange}
          format="DD-MM-YYYY"
          slots={{
            openPickerIcon: CalendarTodayOutlined,
          }}
          slotProps={{
            textField: {
              fullWidth: true,
              sx: commonFieldStyles,
              InputLabelProps: { sx: labelSx },
              InputProps: {
                sx: valueSx,
                style: { height: '46px' },
              },
            },
          }}
        />

        <span className="flex items-center text-gray-400">|</span>

        <DatePicker
          label="End Date"
          value={dayjs(endDate, 'DD-MM-YYYY')}
          onChange={handleEndDateChange}
          format="DD-MM-YYYY"
          slots={{
            openPickerIcon: CalendarTodayOutlined,
          }}
          slotProps={{
            textField: {
              fullWidth: true,
              sx: commonFieldStyles,
              InputLabelProps: { sx: labelSx },
              InputProps: {
                sx: valueSx,
                style: { height: '46px' },
              },
            },
          }}
        />
      </div>
    </LocalizationProvider>
  )
}
