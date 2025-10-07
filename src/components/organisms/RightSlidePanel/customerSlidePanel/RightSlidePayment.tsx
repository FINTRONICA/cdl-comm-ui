'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  Button,
  Drawer,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { Controller, useForm, FieldErrors } from 'react-hook-form'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'

import { getLabelByConfigId as getPaymentLabel } from '@/constants/mappings/customerMapping'

interface PaymentData extends Record<string, unknown> {
  id: number
  paymentRefNo: string
  dealNo: string
  clientName: string
  paymentAmount: string
  paymentDate: string
  paymentMethod: string
  transactionReference: string
  status: string
  // Additional fields for form compatibility
  ruleRefNo?: string
  fromAccountDr?: string
  amountCapDr?: string
  amountDr?: string
  minimumBalance?: string
  thresholdAmount?: string
  transferType?: string
  occurrence?: string
  recurringFrequency?: string
  firstTxnDate?: Date | null
  endDate?: Date | null
  retryDays?: string
  retryUptoEndOfMonthExecution?: boolean
  resetCounter?: string
  dependence?: string
  remarks?: string
  toAccount?: string
  paymentType?: string
  swiftCode?: string
  amountCapCr?: string
  amountCr?: string
  priority?: string
  percentageShare?: string
  beneficiaryName?: string
}

interface RightSlidePaymentPanelProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'add' | 'edit' | 'view'
  paymentData?: PaymentData | null
}

type PaymentFormData = {
  ruleRefNo: string
  dealNo: string
  clientName: string
  fromAccountDr: string
  amountCapDr: string
  amountDr: string
  minimumBalance: string
  thresholdAmount: string
  status: string
  transferType: string
  occurrence: string
  recurringFrequency: string
  firstTxnDate: Date | null
  endDate: Date | null
  retryDays: string
  retryUptoEndOfMonthExecution: boolean
  resetCounter: string
  dependence: string
  remarks: string
  toAccount: string
  paymentType: string
  swiftCode: string
  amountCapCr: string
  amountCr: string
  priority: string
  percentageShare: string
  beneficiaryName: string
}

const DEFAULT_VALUES: PaymentFormData = {
  ruleRefNo: '',
  dealNo: '',
  clientName: '',
  fromAccountDr: '',
  amountCapDr: '',
  amountDr: '',
  minimumBalance: '',
  thresholdAmount: '',
  status: '',
  transferType: '',
  occurrence: '',
  recurringFrequency: '',
  firstTxnDate: null,
  endDate: null,
  retryDays: '',
  retryUptoEndOfMonthExecution: false,
  resetCounter: '',
  dependence: '',
  remarks: '',
  toAccount: '',
  paymentType: '',
  swiftCode: '',
  amountCapCr: '',
  amountCr: '',
  priority: '',
  percentageShare: '',
  beneficiaryName: '',
}

export const RightSlidePaymentPanel: React.FC<
  RightSlidePaymentPanelProps
> = ({ isOpen, onClose, mode = 'add', paymentData }) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [ruleRefId, setRuleRefId] = useState<string>('')
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false)

  // Mock data for dropdowns - these would typically come from API calls
  const [dealOptions, setDealOptions] = useState<any[]>([])
  const [accountOptions, setAccountOptions] = useState<any[]>([])
  const [transferTypeOptions, setTransferTypeOptions] = useState<any[]>([])
  const [occurrenceOptions, setOccurrenceOptions] = useState<any[]>([])
  const [recurringFrequencyOptions, setRecurringFrequencyOptions] = useState<any[]>([])
  const [resetCounterOptions, setResetCounterOptions] = useState<any[]>([])
  const [dependenceOptions, setDependenceOptions] = useState<any[]>([])
  const [paymentTypeOptions, setPaymentTypeOptions] = useState<any[]>([])
  const [swiftCodeOptions, setSwiftCodeOptions] = useState<any[]>([])
  const [beneficiaryOptions, setBeneficiaryOptions] = useState<any[]>([])

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting: isFormSubmitting, isDirty },
    clearErrors,
  } = useForm<PaymentFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  })

  const isSubmitting = isFormSubmitting
  const isViewMode = mode === 'view'

  // Load values when opening / changing mode
  useEffect(() => {
    if (!isOpen) return

    const values: PaymentFormData = mode === 'edit' && paymentData
      ? {
          ruleRefNo: paymentData.ruleRefNo ?? paymentData.paymentRefNo ?? '',
          dealNo: paymentData.dealNo ?? '',
          clientName: paymentData.clientName ?? '',
          fromAccountDr: paymentData.fromAccountDr ?? '',
          amountCapDr: paymentData.amountCapDr ?? '',
          amountDr: paymentData.amountDr ?? paymentData.paymentAmount ?? '',
          minimumBalance: paymentData.minimumBalance ?? '',
          thresholdAmount: paymentData.thresholdAmount ?? '',
          status: paymentData.status ?? '',
          transferType: paymentData.transferType ?? '',
          occurrence: paymentData.occurrence ?? '',
          recurringFrequency: paymentData.recurringFrequency ?? '',
          firstTxnDate: paymentData.firstTxnDate ?? (paymentData.paymentDate ? new Date(paymentData.paymentDate) : null),
          endDate: paymentData.endDate ?? null,
          retryDays: paymentData.retryDays ?? '',
          retryUptoEndOfMonthExecution: paymentData.retryUptoEndOfMonthExecution ?? false,
          resetCounter: paymentData.resetCounter ?? '',
          dependence: paymentData.dependence ?? '',
          remarks: paymentData.remarks ?? '',
          toAccount: paymentData.toAccount ?? '',
          paymentType: paymentData.paymentType ?? paymentData.paymentMethod ?? '',
          swiftCode: paymentData.swiftCode ?? '',
          amountCapCr: paymentData.amountCapCr ?? '',
          amountCr: paymentData.amountCr ?? '',
          priority: paymentData.priority ?? '',
          percentageShare: paymentData.percentageShare ?? '',
          beneficiaryName: paymentData.beneficiaryName ?? '',
        }
      : DEFAULT_VALUES

    reset(values, { keepDirty: false })
    clearErrors()
    setSuccessMessage(null)
    setErrorMessage(null)
    setRuleRefId(values.ruleRefNo)
  }, [isOpen, mode, paymentData, reset, clearErrors])

  // Mock function to generate rule reference ID
  const handleGenerateRuleRefId = useCallback(async () => {
    setIsGeneratingId(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      const generatedId = `PAY-${Date.now().toString().slice(-8)}`
      setRuleRefId(generatedId)
    } catch (error) {
      console.error('Error generating rule reference ID:', error)
    } finally {
      setIsGeneratingId(false)
    }
  }, [])

  const onSubmit = (data: PaymentFormData) => {
    if (isSubmitting) {
      return
    }

    if (!isDirty) {
      setErrorMessage('No changes to save.')
      return
    }

    setSuccessMessage(null)
    setErrorMessage(null)

    // Here you would typically call your API to create/update payment
    console.log('Payment data:', data)
    
    // Simulate API call
    setTimeout(() => {
      setSuccessMessage(mode === 'edit' ? 'Payment updated successfully.' : 'Payment created successfully.')
      setTimeout(() => {
        onClose()
      }, 1000)
    }, 1000)
  }

  const handleResetToLoaded = useCallback(() => {
    const loaded: PaymentFormData = mode === 'edit' && paymentData
      ? {
          ruleRefNo: paymentData.ruleRefNo ?? paymentData.paymentRefNo ?? '',
          dealNo: paymentData.dealNo ?? '',
          clientName: paymentData.clientName ?? '',
          fromAccountDr: paymentData.fromAccountDr ?? '',
          amountCapDr: paymentData.amountCapDr ?? '',
          amountDr: paymentData.amountDr ?? paymentData.paymentAmount ?? '',
          minimumBalance: paymentData.minimumBalance ?? '',
          thresholdAmount: paymentData.thresholdAmount ?? '',
          status: paymentData.status ?? '',
          transferType: paymentData.transferType ?? '',
          occurrence: paymentData.occurrence ?? '',
          recurringFrequency: paymentData.recurringFrequency ?? '',
          firstTxnDate: paymentData.firstTxnDate ?? (paymentData.paymentDate ? new Date(paymentData.paymentDate) : null),
          endDate: paymentData.endDate ?? null,
          retryDays: paymentData.retryDays ?? '',
          retryUptoEndOfMonthExecution: paymentData.retryUptoEndOfMonthExecution ?? false,
          resetCounter: paymentData.resetCounter ?? '',
          dependence: paymentData.dependence ?? '',
          remarks: paymentData.remarks ?? '',
          toAccount: paymentData.toAccount ?? '',
          paymentType: paymentData.paymentType ?? paymentData.paymentMethod ?? '',
          swiftCode: paymentData.swiftCode ?? '',
          amountCapCr: paymentData.amountCapCr ?? '',
          amountCr: paymentData.amountCr ?? '',
          priority: paymentData.priority ?? '',
          percentageShare: paymentData.percentageShare ?? '',
          beneficiaryName: paymentData.beneficiaryName ?? '',
        }
      : DEFAULT_VALUES
    reset(loaded, { keepDirty: false })
    clearErrors()
    setRuleRefId(loaded.ruleRefNo)
  }, [mode, paymentData, reset, clearErrors])

  const onError = (errors: FieldErrors<PaymentFormData>) => {
    console.log(errors)
    setErrorMessage('Please fix the form errors before submitting.')
  }

  const handleDrawerClose = (
    _event: React.KeyboardEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      onClose()
    }
  }

  // Field renderers
  const renderRuleRefIdField = (
    name: string,
    label: string,
    gridSize: number = 6
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name as keyof PaymentFormData}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label={label}
            value={ruleRefId}
            onChange={(e) => {
              setRuleRefId(e.target.value)
              field.onChange(e)
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ mr: 0 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handleGenerateRuleRefId}
                    disabled={isGeneratingId || !!isViewMode}
                    sx={{
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      textTransform: 'none',
                      background: '#2563EB',
                      '&:hover': {
                        background: '#1D4ED8',
                      },
                      minWidth: '100px',
                      height: '32px',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 500,
                      fontStyle: 'normal',
                      fontSize: '11px',
                      lineHeight: '14px',
                      letterSpacing: '0.3px',
                      px: 1,
                    }}
                  >
                    {isGeneratingId ? 'Generating...' : 'Generate ID'}
                  </Button>
                </InputAdornment>
              ),
              sx: valueSx,
            }}
            InputLabelProps={{ sx: labelSx }}
            sx={commonFieldStyles}
          />
        )}
      />
    </Grid>
  )

  const renderSelectField = (
    name: string,
    label: string,
    options: any[],
    gridSize = 6,
    isRequired = true
  ) => {
    const validationRules: any = {}

    if (isRequired && !isViewMode) {
      validationRules.required = `${label} is required`
    }

    return (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name as keyof PaymentFormData}
          control={control}
          rules={validationRules}
          defaultValue={''}
          render={({ field, fieldState: { error } }) => (
            <FormControl fullWidth error={!!error && !isViewMode}>
              <InputLabel sx={labelSx}>{label}</InputLabel>
              <Select
                {...field}
                label={label}
                disabled={!!isViewMode}
                sx={{
                  ...selectStyles,
                  ...valueSx,
                  ...(isViewMode && {
                    backgroundColor: '#F9FAFB',
                    color: '#6B7280',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E5E7EB',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E5E7EB',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E5E7EB',
                    },
                  }),
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
                }}
                IconComponent={isViewMode ? () => null : KeyboardArrowDownIcon}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #E5E7EB',
                      marginTop: '8px',
                      minHeight: '120px',
                      maxHeight: '300px',
                      overflow: 'auto',
                      '& .MuiMenuItem-root': {
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontFamily:
                          'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        color: '#374151',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: '#F3F4F6',
                          color: '#111827',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#EBF4FF',
                          color: '#2563EB',
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: '#DBEAFE',
                          },
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  -- Select --
                </MenuItem>
                {options.map((opt, index) => (
                  <MenuItem
                    key={opt.id || opt || `option-${index}`}
                    value={String(opt.id || opt.settingValue || opt || '')}
                    sx={{
                      fontSize: '14px',
                      fontFamily:
                        'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color: '#374151',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#F3F4F6',
                        color: '#111827',
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#EBF4FF',
                        color: '#2563EB',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: '#DBEAFE',
                        },
                      },
                    }}
                  >
                    {opt.displayName || opt.name || opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>
    )
  }

  const renderCheckboxField = (
    name: string,
    label?: string,
    gridSize: number = 6
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <div className="text-sm">{label}</div>
      <Controller
        name={name as keyof PaymentFormData}
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                checked={!!field.value}
                disabled={!!isViewMode}
                sx={{
                  color: isViewMode ? '#D1D5DB' : '#CAD5E2',
                  '&.Mui-checked': {
                    color: isViewMode ? '#9CA3AF' : '#2563EB',
                  },
                }}
              />
            }
            label="Yes"
            sx={{
              '& .MuiFormControlLabel-label': {
                fontFamily: 'Outfit, sans-serif',
                fontStyle: 'normal',
                fontSize: '14px',
                lineHeight: '24px',
                letterSpacing: '0.5px',
                verticalAlign: 'middle',
                color: isViewMode ? '#6B7280' : 'inherit',
              },
            }}
          />
        )}
      />
    </Grid>
  )

  const renderDatePickerField = (
    name: string,
    label: string,
    gridSize: number = 6,
    isRequired = false
  ) => {
    const validationRules: any = {}

    if (isRequired && !isViewMode) {
      validationRules.required = `${label} is required`
    }

    return (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name as keyof PaymentFormData}
          control={control}
          rules={validationRules}
          defaultValue={null}
          render={({ field, fieldState: { error } }) => (
            <DatePicker
              label={label}
              value={field.value}
              onChange={field.onChange}
              format="DD/MM/YYYY"
              disabled={!!isViewMode}
              slots={{
                openPickerIcon: isViewMode ? () => null : StyledCalendarIcon,
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!error && !isViewMode,
                  helperText: isViewMode ? '' : error?.message,
                  sx: {
                    ...datePickerStyles,
                    ...(isViewMode && {
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#F9FAFB',
                        color: '#6B7280',
                        '& fieldset': {
                          borderColor: '#E5E7EB',
                        },
                        '&:hover fieldset': {
                          borderColor: '#E5E7EB',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#E5E7EB',
                        },
                      },
                    }),
                  },
                  InputLabelProps: { sx: labelSx },
                  InputProps: {
                    sx: {
                      ...valueSx,
                      ...(isViewMode && {
                        color: '#6B7280',
                      }),
                    },
                    style: { height: '46px' },
                  },
                },
              }}
            />
          )}
        />
      </Grid>
    )
  }

  const renderTextField = (
    name: string,
    label: string,
    gridSize = 6,
    defaultValue = '',
    isRequired = false
  ) => {
    const validationRules: any = {}

    if (isRequired && !isViewMode) {
      validationRules.required = `${label} is required`
    }

    if (name === 'amountCapDr' || name === 'amountDr' || name === 'amountCapCr' || name === 'amountCr' || name === 'minimumBalance' || name === 'thresholdAmount' || name === 'priority' || name === 'percentageShare') {
      validationRules.pattern = {
        value: /^\d+(\.\d{1,2})?$/,
        message:
          'Please enter a valid amount (numbers and up to 2 decimal places)',
      }
      validationRules.min = {
        value: 0,
        message: 'Amount must be greater than or equal to 0',
      }
    }

    return (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name as keyof PaymentFormData}
          control={control}
          rules={validationRules}
          defaultValue={defaultValue}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              label={label}
              fullWidth
              disabled={!!isViewMode}
              error={!!error && !isViewMode}
              helperText={isViewMode ? '' : error?.message}
              InputLabelProps={{ sx: labelSx }}
              InputProps={{
                sx: {
                  ...valueSx,
                  ...(isViewMode && {
                    backgroundColor: '#F9FAFB',
                    color: '#6B7280',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E5E7EB',
                    },
                  }),
                },
              }}
              sx={{
                ...commonFieldStyles,
                ...(isViewMode && {
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#E5E7EB',
                    },
                    '&:hover fieldset': {
                      borderColor: '#E5E7EB',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#E5E7EB',
                    },
                  },
                }),
              }}
            />
          )}
        />
      </Grid>
    )
  }

  // Styles
  const commonFieldStyles = {
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

  const selectStyles = {
    height: '48px',
    '& .MuiOutlinedInput-root': {
      height: '48px',
      borderRadius: '12px',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease-in-out',
      '& fieldset': {
        borderColor: '#E2E8F0',
        borderWidth: '1.5px',
        transition: 'border-color 0.2s ease-in-out',
      },
      '&:hover fieldset': {
        borderColor: '#3B82F6',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2563EB',
        borderWidth: '2px',
        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
      },
    },
    '& .MuiSelect-icon': {
      color: '#64748B',
      fontSize: '20px',
      transition: 'color 0.2s ease-in-out',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
    },
    '&:hover .MuiSelect-icon': {
      color: '#3B82F6',
    },
    '&.Mui-focused .MuiSelect-icon': {
      color: '#2563EB',
    },
  }

  const datePickerStyles = {
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

  const labelSx = {
    color: '#374151',
    fontFamily:
      'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: 500,
    fontStyle: 'normal',
    fontSize: '13px',
    letterSpacing: '0.025em',
    marginBottom: '4px',
    '&.Mui-focused': {
      color: '#2563EB',
    },
    '&.MuiFormLabel-filled': {
      color: '#374151',
    },
  }

  const valueSx = {
    color: '#111827',
    fontFamily:
      'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '14px',
    letterSpacing: '0.01em',
    wordBreak: 'break-word',
    '& .MuiSelect-select': {
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
    },
  }

  const StyledCalendarIcon = (props: any) => (
    <CalendarTodayOutlinedIcon
      {...props}
      sx={{
        width: '18px',
        height: '20px',
        position: 'relative',
        padding: '1px',
        transform: 'rotate(0deg)',
        opacity: 1,
      }}
    />
  )

  const isFormDirty = isDirty
  const canSave = isFormDirty && !isSubmitting && !isViewMode
  const canReset = isFormDirty && !isSubmitting && !isViewMode

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={handleDrawerClose}
      PaperProps={{
        sx: {
          width: '460px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid #E5E7EB' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <DialogTitle
            sx={{
              p: 0,
              fontSize: '20px',
              fontWeight: 500,
              fontStyle: 'normal',
            }}
          >
            {mode === 'edit' ? 'Edit Payment' : mode === 'view' ? 'View Payment' : 'Add Payment'}
          </DialogTitle>
          <IconButton onClick={onClose} size="small">
            <CancelOutlinedIcon />
          </IconButton>
        </Box>
      </Box>

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <DialogContent dividers>
          {errorMessage && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="error" onClose={() => setErrorMessage(null)}>
                {errorMessage}
              </Alert>
            </Box>
          )}

          <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
            {/* Rule Reference Number - Auto Generated */}
            {renderRuleRefIdField(
              'ruleRefNo',
              getPaymentLabel('CDL_PAY_RULE_REF_NO'),
              6
            )}

            {/* Deal Number - Selection */}
            {renderSelectField(
              'dealNo',
              getPaymentLabel('CDL_PAY_DEAL_NO'),
              dealOptions,
              6,
              true
            )}

            {/* Client Name - Fetch */}
            {renderTextField(
              'clientName',
              getPaymentLabel('CDL_PAY_CLIENT_NAME'),
              6,
              '',
              true
            )}

            {/* From Account (Dr) - Selection */}
            {renderSelectField(
              'fromAccountDr',
              getPaymentLabel('CDL_PAY_FROM_ACCOUNT_DR'),
              accountOptions,
              6,
              true
            )}

            {/* Amount Cap (Dr) - Text field */}
            {renderTextField(
              'amountCapDr',
              getPaymentLabel('CDL_PAY_AMOUNT_CAP_DR'),
              6,
              '',
              true
            )}

            {/* Amount (Dr) - Text Field */}
            {renderTextField(
              'amountDr',
              getPaymentLabel('CDL_PAY_AMOUNT_DR'),
              6,
              '',
              true
            )}

            {/* Minimum Balance - Text Field (Optional) */}
            {renderTextField(
              'minimumBalance',
              getPaymentLabel('CDL_PAY_MINIMUM_BALANCE'),
              6,
              '',
              false
            )}

            {/* Threshold Amount - Text Field (Optional) */}
            {renderTextField(
              'thresholdAmount',
              getPaymentLabel('CDL_PAY_THRESHOLD_AMOUNT'),
              6,
              '',
              false
            )}

            {/* Status - Auto generated */}
            {renderTextField(
              'status',
              getPaymentLabel('CDL_PAY_STATUS'),
              6,
              '',
              true
            )}

            {/* Transfer Type - Drop Down */}
            {renderSelectField(
              'transferType',
              getPaymentLabel('CDL_PAY_TRANSFER_TYPE'),
              transferTypeOptions,
              6,
              true
            )}

            {/* Occurrence - Drop Down */}
            {renderSelectField(
              'occurrence',
              getPaymentLabel('CDL_PAY_OCCURRENCE'),
              occurrenceOptions,
              6,
              true
            )}

            {/* Recurring Frequency - Drop Down */}
            {renderSelectField(
              'recurringFrequency',
              getPaymentLabel('CDL_PAY_RECURRING_FREQUENCY'),
              recurringFrequencyOptions,
              6,
              true
            )}

            {/* First Txn Date - Calendar */}
            {renderDatePickerField(
              'firstTxnDate',
              getPaymentLabel('CDL_PAY_FIRST_TXN_DATE'),
              6,
              true
            )}

            {/* End Date - Calendar */}
            {renderDatePickerField(
              'endDate',
              getPaymentLabel('CDL_PAY_END_DATE'),
              6,
              true
            )}

            {/* Retry Days - Text Field */}
            {renderTextField(
              'retryDays',
              getPaymentLabel('CDL_PAY_RETRY_DAYS'),
              6,
              '',
              true
            )}

            {/* Retry upto End of the Month Execution - Checkbox */}
            {renderCheckboxField(
              'retryUptoEndOfMonthExecution',
              getPaymentLabel('CDL_PAY_RETRY_UPTO_END_OF_MONTH_EXECUTION'),
              6
            )}

            {/* Reset Counter - Drop Down */}
            {renderSelectField(
              'resetCounter',
              getPaymentLabel('CDL_PAY_RESET_COUNTER'),
              resetCounterOptions,
              6,
              true
            )}

            {/* Dependence - Selection (Optional) */}
            {renderSelectField(
              'dependence',
              getPaymentLabel('CDL_PAY_DEPENDENCE'),
              dependenceOptions,
              6,
              false
            )}

            {/* Remarks - Text field (Optional) */}
            {renderTextField(
              'remarks',
              getPaymentLabel('CDL_PAY_REMARKS'),
              12,
              '',
              false
            )}

            {/* To Account - Text field */}
            {renderTextField(
              'toAccount',
              getPaymentLabel('CDL_PAY_TO_ACCOUNT'),
              6,
              '',
              true
            )}

            {/* Payment type - Drop Down */}
            {renderSelectField(
              'paymentType',
              getPaymentLabel('CDL_PAY_PAYMENT_TYPE'),
              paymentTypeOptions,
              6,
              true
            )}

            {/* Swift Code - Selection */}
            {renderSelectField(
              'swiftCode',
              getPaymentLabel('CDL_PAY_SWIFT_CODE'),
              swiftCodeOptions,
              6,
              true
            )}

            {/* Amount Cap (Cr) - Text field (Optional) */}
            {renderTextField(
              'amountCapCr',
              getPaymentLabel('CDL_PAY_AMOUNT_CAP_CR'),
              6,
              '',
              false
            )}

            {/* Amount (Cr) - Text Field (Optional) */}
            {renderTextField(
              'amountCr',
              getPaymentLabel('CDL_PAY_AMOUNT_CR'),
              6,
              '',
              false
            )}

            {/* Priority - Text Field */}
            {renderTextField(
              'priority',
              getPaymentLabel('CDL_PAY_PRIORITY'),
              6,
              '',
              true
            )}

            {/* Percentage Share - Text Field (Optional) */}
            {renderTextField(
              'percentageShare',
              getPaymentLabel('CDL_PAY_PERCENTAGE_SHARE'),
              6,
              '',
              false
            )}

            {/* Beneficiary Name - Selection */}
            {renderSelectField(
              'beneficiaryName',
              getPaymentLabel('CDL_PAY_BENEFICIARY_NAME'),
              beneficiaryOptions,
              6,
              true
            )}
          </Grid>
        </DialogContent>

        {!isViewMode && (
          <Box
            sx={{
              position: 'relative',
              top: 20,
              left: 0,
              right: 0,
              padding: 2,
            }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleResetToLoaded}
                  disabled={!canReset}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontStyle: 'normal',
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: 0,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    opacity: canReset ? 1 : 0.5,
                  }}
                >
                  Reset
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={!canSave}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontStyle: 'normal',
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: 0,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    opacity: canSave ? 1 : 0.5,
                  }}
                >
                  {isSubmitting && (
                    <CircularProgress
                      size={20}
                      sx={{
                        color: 'white',
                      }}
                    />
                  )}
                  {isSubmitting
                    ? mode === 'edit'
                      ? 'Updating...'
                      : 'Creating...'
                    : mode === 'edit'
                      ? 'Update'
                      : 'Save'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </form>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Drawer>
  )
}
