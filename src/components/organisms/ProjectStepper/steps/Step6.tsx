'use client'

import React from 'react'
import {
  Grid,
  TextField,
  Typography,
  Card,
  CardContent,
  Box,
  useTheme,
} from '@mui/material'
import { FinancialData } from '../types'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Controller, useFormContext } from 'react-hook-form'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
// import { useProjectLabels } from '@/hooks/useProjectLabels'
import { useBuildPartnerAssetLabelsWithUtils } from '@/hooks/useBuildPartnerAssetLabels'
import {
  commonFieldStyles,
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
  const theme = useTheme()
  const textPrimary = theme.palette.mode === 'dark' ? '#FFFFFF' : '#1E2939'
  const { getLabel } = useBuildPartnerAssetLabelsWithUtils()
  const language = 'EN'

  const StyledCalendarIcon = (
    props: React.ComponentProps<typeof CalendarTodayOutlinedIcon>
  ) => <CalendarTodayOutlinedIcon {...props} sx={calendarIconSx} />

  const { control } = useFormContext()

  const renderTextField = (
    name: string,
    label: string,
    gridSize = 3,
    required = false
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name as any}
        control={control}
        defaultValue=""
        rules={{
          required: required ? `${label} is required` : false,
          pattern: {
            value: /^[0-9.,\s]*$/,
            message: 'Must contain only numbers, decimals, and commas',
          },
          maxLength: {
            value: 20,
            message: 'Maximum 20 characters allowed',
          },
        }}
        render={({ field, fieldState: { error, isTouched } }) => {
          const shouldShowError = (isTouched || !!error) && !!error
          return (
            <TextField
              {...field}
              fullWidth
              disabled={isViewMode}
              label={label}
              required={required}
              error={shouldShowError}
              helperText={shouldShowError ? error?.message : ''}
              InputLabelProps={{ sx: labelSx }}
              InputProps={{ sx: valueSx }}
              sx={commonFieldStyles}
            />
          )
        }}
      />
    </Grid>
  )

  const renderDateField = (name: string, label: string, gridSize = 3) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name as any}
        control={control}
        defaultValue={null}
        rules={{}}
        render={({ field, fieldState: { error, isTouched } }) => {
          const shouldShowError = (isTouched || !!error) && !!error
          return (
            <DatePicker
              disabled={isViewMode}
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
                  error: shouldShowError,
                  helperText: shouldShowError ? error?.message : '',
                },
              }}
            />
          )
        }}
      />
    </Grid>
  )

  const groupedFields = [
    {
      title: getLabel(
        'CDL_BPA_FINANCIAL',
        language,
        'Asset Financial Overview'
      ),
      fields: [
        renderTextField(
          'estimate.revenue',
          getLabel('CDL_BPA_EST_ASS_COST', language, 'Estimated Asset Cost'),
          6,
          true
        ),
        renderTextField(
          'estimate.constructionCost',
          getLabel('CDL_BPA_BUILD_COST', language, 'Build Cost'),
          6,
          true
        ),
        renderTextField(
          'estimate.projectManagementExpense',
          getLabel(
            'CDL_BPA_ASST_MGMT_EXP',
            language,
            'Asset Management Expense'
          ),
          6,
          true
        ),
        renderTextField(
          'estimate.landCost',
          getLabel('CDL_BPA_LAND_ACQ_COST', language, 'Land Acquisition Cost'),
          6,
          true
        ),
        renderTextField(
          'estimate.marketingExpense',
          getLabel('CDL_BPA_MARK_EXP', language, 'Marketing Expense'),
          6,
          true
        ),
        renderDateField(
          'estimate.date',
          getLabel('CDL_BPA_TRAN_DATE', language, 'Transaction Date'),
          6
        ),
      ],
    },
    {
      title: getLabel(
        'CDL_BPA_ACTUAL_ASSEST_COST',
        language,
        'Actual Asset Cost'
      ),
      fields: [
        renderTextField(
          'actual.soldValue',
          getLabel(
            'CDL_BPA_TOTAL_UNIT_SOLD',
            language,
            'Total Units Sold Value'
          ),
          6,
          true
        ),
        renderTextField(
          'actual.constructionCost',
          getLabel('CDL_BPA_BUILD_COST', language, 'Build Cost'),
          6,
          true
        ),
        renderTextField(
          'actual.infraCost',
          getLabel(
            'CDL_BPA_INFRA_COST',
            language,
            'Infrastructure Development Cost'
          ),
          4,
          false
        ),
        renderTextField(
          'actual.landCost',
          getLabel('CDL_BPA_LAND_ACQ_COST', language, 'Land Acquisition Cost'),
          4,
          true
        ),
        renderTextField(
          'actual.projectManagementExpense',
          getLabel(
            'CDL_BPA_ASST_MGMT_EXP',
            language,
            'Asset Management Expense'
          ),
          4,
          true
        ),
        renderTextField(
          'actual.marketingExpense',
          getLabel('CDL_BPA_MARK_EXP', language, 'Marketing Expense'),
          6,
          true
        ),
        renderDateField(
          'actual.date',
          getLabel('CDL_BPA_TRAN_DATE', language, 'Transaction Date'),
          6
        ),
      ],
    },
  ]

  const breakdownSections = [
    getLabel(
      'CDL_BPA_CASH_FROM_UNIT',
      language,
      'Cash Inflow from Unit Holders'
    ),
    getLabel('CDL_BPA_LAND_ACQ_COST', language, 'Land Acquisition Cost'),
    getLabel('CDL_BPA_BUILD_COST', language, 'Build Cost'),
    getLabel('CDL_BPA_MARK_EXP', language, 'Marketing Expense'),
    getLabel('CDL_BPA_ASST_MGMT_EXP', language, 'Asset Management Expense'),
    getLabel('CDL_BPA_MORTGAGE_AMT', language, 'Mortgage Amount'),
    getLabel('CDL_BPA_VAT_AMT', language, 'VAT Payment'),
    getLabel('CDL_BPA_TOTAL_AMOUNT', language, 'Total Amount'),
    getLabel('CDL_BPA_REFUND_AMT', language, 'Refund Amount'),
    getLabel('CDL_BPA_RETEN_ACC_BAL', language, 'Retention Account Balance'),
    getLabel('CDL_BPA_TRUST_ACC_BAL', language, 'Trust Account Balance'),
    getLabel(
      'CDL_BPA_SUBCONS_ACC_BAL',
      language,
      'Sub-Construction Account Balance'
    ),
    getLabel('CDL_BPA_TECH_FEES', language, 'Technical Fees'),
    getLabel('CDL_BPA_UNALLO_COST', language, 'Unallocated Costs'),
    getLabel('CDL_BPA_LOAN', language, 'Loan/Installment Payments'),
    getLabel('CDL_BPA_INFRA_COST', language, 'Infrastructure Development Cost'),
    getLabel('CDL_BPA_OTHER_EXP', language, 'Other Expenses'),
    getLabel('CDL_BPA_TRANS_AMT', language, 'Transferred Amount'),
    getLabel('CDL_BPA_FORFEIT_AMT', language, 'Forfeited Amount'),
    getLabel(
      'CDL_BPA_DEV_EQUITY_CONT',
      language,
      'Developer Equity Contribution'
    ),
    getLabel('CDL_BPA_AMANAT_FUND', language, 'Amanat Fund Allocation'),
    getLabel('CDL_BPA_OTHER_WITHDRAW', language, 'Other Withdrawals'),
    getLabel('CDL_BPA_OQOOD_OTHER_PMT', language, 'Oqood and Other Payments'),
    getLabel('CDL_BPA_VAT_DEPOSIT_AMT', language, 'VAT Deposited Amount'),
  ]

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={cardStyles}>
        <CardContent
          sx={{
            color: textPrimary,
          }}
        >
          {groupedFields.map(({ title, fields }, sectionIndex) => (
            <Box key={sectionIndex} mb={6}>
              <Typography
                variant="h6"
                mb={2}
                sx={{
                  color: textPrimary,
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
                  color: textPrimary,
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
                  getLabel(
                    'CDL_BPA_FUND_OUT_ESCROW',
                    language,
                    'Funds Outside Escrow'
                  ),
                  3
                )}
                {renderTextField(
                  `breakdown.${index}.withinEscrow`,
                  getLabel(
                    'CDL_BPA_FUND_WITHIN_ESCROW',
                    language,
                    'Funds Within Escrow'
                  ),
                  3
                )}
                {renderTextField(
                  `breakdown.${index}.total`,
                  getLabel('CDL_BPA_TOTAL_AMOUNT', language, 'Total Amount'),
                  3
                )}
                {renderTextField(
                  `breakdown.${index}.exceptionalCapValue`,
                  getLabel(
                    'CDL_BPA_EXCEP_CAP_VAL',
                    language,
                    'Exceptional Capital Value'
                  ),
                  3
                )}
              </Grid>
            </Box>
          ))}

          <Box mb={4}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderTextField(
                  'additional.creditInterestRetention',
                  getLabel(
                    'CDL_BPA_PROFIT_ERND',
                    language,
                    'Credit Interest/Profit Earned for Retention A/c'
                  ),
                  12,
                  false
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderTextField(
                  'additional.paymentsRetentionAccount',
                  getLabel(
                    'CDL_BPA_PMT_FRM_RETENTION',
                    language,
                    'Payments for Retention Account'
                  ),
                  12,
                  false
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderTextField(
                  'additional.reimbursementsDeveloper',
                  getLabel(
                    'CDL_BPA_REIMB_AMT',
                    language,
                    'Re-Imbursements (Developer)'
                  ),
                  12,
                  false
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderTextField(
                  'additional.unitRegistrationFees',
                  getLabel(
                    'CDL_BPA_UNIT_REG_FEES',
                    language,
                    'Unit Registration Fees'
                  ),
                  12,
                  false
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderTextField(
                  'additional.creditInterestEscrow',
                  getLabel(
                    'CDL_BPA_INT_ERND_ESCROW',
                    language,
                    'Credit Interest/Profit Earned for ESCROW A/c'
                  ),
                  12,
                  false
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderTextField(
                  'additional.vatCapped',
                  getLabel('CDL_BPA_CAP_VAT_AMT', language, 'VAT Capped'),
                  12,
                  false
                )}
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  )
}

export default Step6
