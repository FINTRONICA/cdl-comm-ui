'use client'

import React from 'react'
import {
  Grid,
  TextField,
  Typography,
  Card,
  CardContent,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import { FinancialData } from '../types'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Controller, useFormContext } from 'react-hook-form'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import { useProjectLabels } from '@/hooks/useProjectLabels'
import {
  commonFieldStyles,
  selectStyles,
  datePickerStyles,
  labelSx,
  valueSx,
  cardStyles,
  calendarIconSx,
} from '../styles'

interface Step6Props {
  financialData: FinancialData
  onFinancialDataChange: (financialData: FinancialData) => void
  isViewMode?: boolean
}

const Step6: React.FC<Step6Props> = ({ isViewMode = false }) => {
  const { getLabel } = useProjectLabels()

  const StyledCalendarIcon = (
    props: React.ComponentProps<typeof CalendarTodayOutlinedIcon>
  ) => <CalendarTodayOutlinedIcon {...props} sx={calendarIconSx} />

  const { control } = useFormContext()

  const renderTextField = (name: string, label: string, gridSize = 3) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            disabled={isViewMode}
            label={label}
            InputLabelProps={{ sx: labelSx }}
            InputProps={{ sx: valueSx }}
            sx={commonFieldStyles}
          />
        )}
      />
    </Grid>
  )

  const renderSelectField = (
    name: string,
    label: string,
    options: { value: string; label: string }[],
    gridSize = 3
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <FormControl fullWidth>
            <InputLabel sx={labelSx}>{label}</InputLabel>
            <Select
              {...field}
              disabled={isViewMode}
              label={label}
              IconComponent={KeyboardArrowDownIcon}
              sx={{
                ...selectStyles,
                ...valueSx,
                '& .MuiOutlinedInput-notchedOutline': {
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: '1px solid #9ca3af',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: '2px solid #2563eb',
                },
              } as any}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
    </Grid>
  )

  const renderDateField = (name: string, label: string, gridSize = 3) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={null}
        render={({ field }) => (
          <DatePicker
            label={label}
            value={field.value}
            onChange={field.onChange}
            format="DD/MM/YYYY"
            slots={{ openPickerIcon: StyledCalendarIcon }}
            slotProps={{
              textField: {
                fullWidth: true,
                sx: datePickerStyles,
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
    </Grid>
  )

  const groupedFields = [
    {
      title: 'Project Estimate',
      fields: [
        renderTextField('estimate.revenue', 'Revenue (Project Value)*', 6),
        renderSelectField(
          'estimate.constructionCost',
          'Construction Cost*',
          [
            { value: '10,000', label: '10,000' },
            { value: '30,000', label: '30,000' },
            { value: '50,000', label: '50,000' },
          ],
          6
        ),
        renderTextField(
          'estimate.projectManagementExpense',
          'Project Management Expense*',
          6
        ),
        renderTextField('estimate.landCost', 'Land Cost*', 6),
        renderTextField('estimate.marketingExpense', 'Marketing Expense*', 6),
        renderDateField(
          'estimate.date',
          getLabel('CDL_BPA_ESTIMATE_DATE', 'Date*'),
          6
        ),
      ],
    },
    {
      title: 'Project Actual',
      fields: [
        renderTextField('actual.soldValue', 'Sold Value*', 6),
        renderTextField('actual.constructionCost', 'Construction Cost*', 6),
        renderTextField('actual.infraCost', 'Infra Cost*', 4),
        renderTextField('actual.landCost', 'Land Cost*', 4),
        renderTextField(
          'actual.projectManagementExpense',
          'Project Management Expense*',
          4
        ),
        renderTextField('actual.marketingExpense', 'Marketing Expense*', 6),
        renderDateField(
          'actual.date',
          getLabel('CDL_BPA_ACTUAL_DATE', 'Date*'),
          6
        ),
      ],
    },
  ]

  const breakdownSections = [
    'Cash Received from the Unit Holder',
    'Land Cost',
    'Construction Cost',
    'Marketing Expense',
    'Project Management Expense',
    'Mortgage',
    'VAT Payment',
    'Deposit',
    'Refund',
    'Balance in Retention A/C',
    'Balance in Trust A/C',
    'Balance in Sub Construction A/C',
    'Technical Fees',
    'Unidentified Funds',
    'Loan/Installments',
    'Infrastructure Cost',
    'Others',
    'Transferred',
    'Developer’s Equity',
    'Manager Funds',
    'Others Withdrawals',
    'Deposit/Other Fees and Payments',
    'VAT Deposit',
    'Credit Transfer/Profit Earned for Retention A/C',
    'Payments for Retention Account',
    'Re-imbursements (Developer)',
    'Unit Registration Fee',
    'Credit Interest/Profit Earned for ESCROW A/C',
    'VAT Support',
  ]

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={cardStyles}>
        <CardContent>
          {groupedFields.map(({ title, fields }, sectionIndex) => (
            <Box key={sectionIndex} mb={6}>
              <Typography
                variant="h6"
                mb={2}
                sx={{
                  color: '#1E2939',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '18px',
                  lineHeight: '28px',
                  letterSpacing: '0.15px',
                  verticalAlign: 'middle',
                }}
              >
                {title}
              </Typography>
              <Grid container spacing={3}>
                {fields}
              </Grid>
            </Box>
          ))}

          {breakdownSections.map((section, index) => (
            <Box key={index} mb={4}>
              <Typography
                variant="h6"
                mb={2}
                sx={{
                  color: '#1E2939',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '18px',
                  lineHeight: '28px',
                  letterSpacing: '0.15px',
                  verticalAlign: 'middle',
                }}
              >
                {section}
              </Typography>
              <Grid container spacing={3}>
                {renderTextField(
                  `breakdown.${index}.outOfEscrow`,
                  'Out of Escrow',
                  3
                )}
                {renderTextField(
                  `breakdown.${index}.withinEscrow`,
                  'Within Escrow',
                  3
                )}
                {renderTextField(`breakdown.${index}.total`, 'Total', 3)}
                {renderTextField(
                  `breakdown.${index}.exceptionalCapValue`,
                  'Exceptional Cap Value',
                  3
                )}
              </Grid>
            </Box>
          ))}
        </CardContent>
      </Card>

    </LocalizationProvider>
  )
}

export default Step6
