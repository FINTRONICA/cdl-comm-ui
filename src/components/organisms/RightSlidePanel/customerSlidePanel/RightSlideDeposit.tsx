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
  Checkbox,
  FormControlLabel,
  FormHelperText,
} from '@mui/material'
import { Controller, useForm, FieldErrors } from 'react-hook-form'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'

import {
  useCreateDeposit,
  useUpdateDeposit,
} from '@/hooks/useDeposits'
import { getLabelByConfigId as getDepositLabel } from '@/constants/mappings/customerMapping'
import { DocumentUpload } from '@/components/organisms/DocumentUpload/DocumentUpload'
import { createDepositDocumentConfig } from './depositDocumentService'

interface RightSlideDepositProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'add' | 'edit' | 'view'
  actionData?: {
    name: string
    actionKey: string
    actionName: string
    moduleCode: string
    description: string
    id?: number
    depositRefNo?: string
    dealNo?: string
    clientName?: string
    depositReceivableCategory?: string
    depositReceivableAmount?: string
    subDepositType?: string
    transactionDate?: string
    transactionReference?: string
    escrowAccountNumber?: string
    transactionDescription?: string
    transactionAmount?: string
    transactionDate2?: string
    narration?: string
  } | null
}

type DepositFormData = {
  depositRefNo: string
  dealNo: string
  clientName: string
  depositReceivableCategory: string
  depositReceivableAmount: string
  subDepositType: string
  transactionDate: string
  transactionReference: string
  escrowAccountNumber: string
  transactionDescription: string
  transactionAmount: string
  transactionDate2: string
  narration: string
}

const DEFAULT_VALUES: DepositFormData = {
  depositRefNo: '',
  dealNo: '',
  clientName: '',
  depositReceivableCategory: '',
  depositReceivableAmount: '',
  subDepositType: '',
  transactionDate: '',
  transactionReference: '',
  escrowAccountNumber: '',
  transactionDescription: '',
  transactionAmount: '',
  transactionDate2: '',
  narration: '',
}

export const RightSlideDeposit: React.FC<RightSlideDepositProps> = ({ 
  isOpen, 
  onClose, 
  mode = 'add', 
  actionData 
}) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [depositRefId, setDepositRefId] = useState<string>('')
  const [isGeneratingId, setIsGeneratingId] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])

  const createDeposit = useCreateDeposit()
  const updateDeposit = useUpdateDeposit()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting: isFormSubmitting, isDirty },
    clearErrors,
  } = useForm<DepositFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  })

  // isSubmitting overall: either react-hook-form isSubmitting OR our API hooks are pending
  const isSubmitting = createDeposit.isPending || updateDeposit.isPending || isFormSubmitting
  const isViewMode = mode === 'view'

  // Load values when opening / changing mode
  useEffect(() => {
    if (!isOpen) return

    const values: DepositFormData = mode === 'edit' && actionData
      ? {
          depositRefNo: actionData.depositRefNo ?? '',
          dealNo: actionData.dealNo ?? '',
          clientName: actionData.clientName ?? '',
          depositReceivableCategory: actionData.depositReceivableCategory ?? '',
          depositReceivableAmount: actionData.depositReceivableAmount ?? '',
          subDepositType: actionData.subDepositType ?? '',
          transactionDate: actionData.transactionDate ?? '',
          transactionReference: actionData.transactionReference ?? '',
          escrowAccountNumber: actionData.escrowAccountNumber ?? '',
          transactionDescription: actionData.transactionDescription ?? '',
          transactionAmount: actionData.transactionAmount ?? '',
          transactionDate2: actionData.transactionDate2 ?? '',
          narration: actionData.narration ?? '',
        }
      : DEFAULT_VALUES

    reset(values, { keepDirty: false })
    clearErrors()
    setSuccessMessage(null)
    setErrorMessage(null)
    setDepositRefId(values.depositRefNo)
  }, [isOpen, mode, actionData, reset, clearErrors])

  const handleGenerateDepositRefId = useCallback(async () => {
    setIsGeneratingId(true)
    try {
      // Simulate API call to generate deposit reference ID
      await new Promise(resolve => setTimeout(resolve, 1000))
      const generatedId = `DEP${Date.now().toString().slice(-6)}`
      setDepositRefId(generatedId)
    } catch (error) {
      console.error('Failed to generate deposit reference ID:', error)
    } finally {
      setIsGeneratingId(false)
    }
  }, [])

  const onSubmit = (data: DepositFormData) => {
    if (isSubmitting) {
      return
    }

    if (!isDirty) {
      setErrorMessage('No changes to save.')
      return
    }

    setSuccessMessage(null)
    setErrorMessage(null)

    if (mode === 'edit') {
      if (typeof actionData?.id !== 'number') {
        setErrorMessage('Invalid or missing deposit ID for update')
        return
      }

      updateDeposit.mutate(
        { 
          id: actionData.id.toString(), 
          updates: {
            ...data,
            depositRefNo: depositRefId || data.depositRefNo,
          }
        },
        {
          onSuccess: () => {
            setSuccessMessage('Deposit updated successfully.')
            setTimeout(() => {
              onClose()
            }, 1000)
          },
          onError: (err: Error | unknown) => {
            const error = err as Error & {
              response?: { data?: { message?: string } }
            }
            const message =
              error?.response?.data?.message ||
              error?.message ||
              'Failed to update deposit'
            setErrorMessage(message)
          },
        }
      )
    } else {
      createDeposit.mutate(
        {
          ...data,
          depositRefNo: depositRefId || data.depositRefNo,
        },
        {
          onSuccess: () => {
            setSuccessMessage('Deposit created successfully.')
            setTimeout(() => {
              onClose()
            }, 1000)
          },
          onError: (err: Error | unknown) => {
            const error = err as Error & {
              response?: { data?: { message?: string } }
            }
            const message =
              error?.response?.data?.message ||
              error?.message ||
              'Failed to create deposit'
            setErrorMessage(message)
          },
        }
      )
    }
  }

  const getTranslatedLabel = (configId: string, fallback: string): string => {
    try {
      const label = getDepositLabel(configId)
      return label || fallback
    } catch {
      return fallback
    }
  }

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

  const labelSx = {
    color: '#374151',
    fontFamily: 'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
    fontFamily: 'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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

  const renderDepositRefIdField = (
    name: string,
    label: string,
    gridSize: number = 6
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label={label}
            value={depositRefId}
            onChange={(e) => {
              setDepositRefId(e.target.value)
              field.onChange(e)
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ mr: 0 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handleGenerateDepositRefId}
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

  const renderTextField = (
    name: keyof DepositFormData,
    label: string,
    type: 'text' | 'number' = 'text',
    gridSize: number = 6,
    required: boolean = false
  ) => {
    const validationRules: any = {}

    if (required && !isViewMode) {
      validationRules.required = `${label} is required`
    }

    if (name === 'depositReceivableAmount' || name === 'transactionAmount') {
      validationRules.pattern = {
        value: /^\d+(\.\d{1,2})?$/,
        message: 'Please enter a valid amount (numbers and up to 2 decimal places)',
      }
      validationRules.min = {
        value: 0,
        message: 'Amount must be greater than or equal to 0',
      }
    }

    return (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          rules={validationRules}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              type={type}
              label={label}
              fullWidth
              disabled={isSubmitting || isViewMode}
              required={required}
              error={!!fieldState.error && !isViewMode}
              helperText={isViewMode ? '' : fieldState.error?.message || ''}
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

  const renderSelectField = (
    name: keyof DepositFormData,
    label: string,
    options: any[],
    gridSize = 6,
    isRequired = false
  ) => {
    const validationRules: any = {}

    if (isRequired && !isViewMode) {
      validationRules.required = `${label} is required`
    }

    return (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
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
                        fontFamily: 'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
                      fontFamily: 'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
              {error && !isViewMode && (
                <FormHelperText>{error.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>
    )
  }

  const renderDatePickerField = (
    name: keyof DepositFormData,
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
          name={name}
          control={control}
          rules={validationRules}
          defaultValue=""
          render={({ field, fieldState: { error } }) => (
            <DatePicker
              label={label}
              value={field.value ? new Date(field.value) : null}
              onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
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

  const handleResetToLoaded = useCallback(() => {
    const loaded: DepositFormData = mode === 'edit' && actionData
      ? {
          depositRefNo: actionData.depositRefNo ?? '',
          dealNo: actionData.dealNo ?? '',
          clientName: actionData.clientName ?? '',
          depositReceivableCategory: actionData.depositReceivableCategory ?? '',
          depositReceivableAmount: actionData.depositReceivableAmount ?? '',
          subDepositType: actionData.subDepositType ?? '',
          transactionDate: actionData.transactionDate ?? '',
          transactionReference: actionData.transactionReference ?? '',
          escrowAccountNumber: actionData.escrowAccountNumber ?? '',
          transactionDescription: actionData.transactionDescription ?? '',
          transactionAmount: actionData.transactionAmount ?? '',
          transactionDate2: actionData.transactionDate2 ?? '',
          narration: actionData.narration ?? '',
        }
      : DEFAULT_VALUES
    reset(loaded, { keepDirty: false })
    clearErrors()
    setDepositRefId(loaded.depositRefNo)
  }, [mode, actionData, reset, clearErrors])

  const onError = (errors: FieldErrors<DepositFormData>) => {
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

  const isFormDirty = isDirty
  const canSave = isFormDirty && !isSubmitting && !isViewMode
  const canReset = isFormDirty && !isSubmitting && !isViewMode

  // Mock options for dropdowns
  const depositCategories = [
    { id: 'initial', displayName: 'Initial Deposit' },
    { id: 'security', displayName: 'Security Deposit' },
    { id: 'performance', displayName: 'Performance Deposit' },
  ]

  const subDepositTypes = [
    { id: 'property', displayName: 'Property Deposit' },
    { id: 'rental', displayName: 'Rental Deposit' },
    { id: 'contract', displayName: 'Contract Deposit' },
  ]

  const dealOptions = [
    { id: 'deal001', displayName: 'DEAL001' },
    { id: 'deal002', displayName: 'DEAL002' },
    { id: 'deal003', displayName: 'DEAL003' },
  ]

  const clientOptions = [
    { id: 'client001', displayName: 'ABC Corporation' },
    { id: 'client002', displayName: 'XYZ Ltd' },
    { id: 'client003', displayName: 'Global Enterprises' },
  ]

  const escrowAccountOptions = [
    { id: 'esc001', displayName: 'ESC001' },
    { id: 'esc002', displayName: 'ESC002' },
    { id: 'esc003', displayName: 'ESC003' },
  ]

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
              {mode === 'edit' ? 'Edit Deposit' : 'Add Deposit'}
            </DialogTitle>
            <IconButton onClick={onClose} size="small">
              <CancelOutlinedIcon />
            </IconButton>
          </Box>
        </Box>

        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <DialogContent dividers sx={{ flex: 1, overflow: 'auto' }}>
            {errorMessage && (
              <Box sx={{ mb: 2 }}>
                <Alert severity="error" onClose={() => setErrorMessage(null)}>
                  {errorMessage}
                </Alert>
              </Box>
            )}

            <Grid container rowSpacing={3} columnSpacing={2} mt={2}>
              {renderDepositRefIdField(
                'depositRefNo',
                getTranslatedLabel(
                  'CDL_DEP_DEPOSIT_REF_NO',
                  'Deposit Reference Number*'
                ),
                6
              )}
              
              {renderSelectField(
                'dealNo',
                getTranslatedLabel('CDL_DEP_DEAL_NO', 'Deal No*'),
                dealOptions,
                6,
                true
              )}

              {renderSelectField(
                'clientName',
                getTranslatedLabel('CDL_DEP_CLIENT_NAME', 'Client Name*'),
                clientOptions,
                6,
                true
              )}

              {renderSelectField(
                'depositReceivableCategory',
                getTranslatedLabel('CDL_DEP_DEPOSIT_RECEIVABLE_CATEGORY', 'Deposit/Receivable Category*'),
                depositCategories,
                6,
                true
              )}

              {renderTextField(
                'depositReceivableAmount',
                getTranslatedLabel('CDL_DEP_DEPOSIT_RECEIVABLE_AMOUNT', 'Deposit/Receivable Amount*'),
                'number',
                6,
                true
              )}

              {renderSelectField(
                'subDepositType',
                getTranslatedLabel('CDL_DEP_SUB_DEPOSIT_TYPE', 'Sub Deposit Type*'),
                subDepositTypes,
                6,
                true
              )}

              {renderDatePickerField(
                'transactionDate',
                getTranslatedLabel('CDL_DEP_TRANSACTION_DATE', 'Transaction Date*'),
                6,
                true
              )}

              {renderTextField(
                'transactionReference',
                getTranslatedLabel('CDL_DEP_TRANSACTION_REFERENCE', 'Transaction Reference'),
                'text',
                6
              )}

              {renderSelectField(
                'escrowAccountNumber',
                getTranslatedLabel('CDL_DEP_ESCROW_ACCOUNT_NUMBER', 'Escrow Account Number'),
                escrowAccountOptions,
                6
              )}

              {renderTextField(
                'transactionDescription',
                getTranslatedLabel('CDL_DEP_TRANSACTION_DESCRIPTION', 'Transaction Description'),
                'text',
                12
              )}

              {renderTextField(
                'transactionAmount',
                getTranslatedLabel('CDL_DEP_TRANSACTION_AMOUNT', 'Transaction Amount'),
                'number',
                6
              )}

              {renderDatePickerField(
                'transactionDate2',
                getTranslatedLabel('CDL_DEP_TRANSACTION_DATE_2', 'Transaction Date 2'),
                6
              )}

              {renderTextField(
                'narration',
                getTranslatedLabel('CDL_DEP_NARRATION', 'Narration'),
                'text',
                12
              )}
            </Grid>

            {/* Document Upload Section */}
            {!isViewMode && (
              <Box sx={{ mt: 4 }}>
                <DocumentUpload
                  config={createDepositDocumentConfig('deposit-' + Date.now(), {
                    title: 'Deposit Documents',
                    description: 'Upload supporting documents for this deposit',
                    onDocumentsChange: setDocuments,
                  })}
                />
              </Box>
            )}
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
    </LocalizationProvider>
  )
}

export default RightSlideDeposit
