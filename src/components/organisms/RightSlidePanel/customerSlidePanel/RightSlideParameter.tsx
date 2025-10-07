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
  useCreateWorkflowAction,
  useUpdateWorkflowAction,
} from '@/hooks/workflow'
import type {
  WorkflowActionUIData,
} from '@/services/api/workflowApi'
import { getLabelByConfigId as getParameterLabel } from '@/constants/mappings/customerMapping'

interface RightSlideParameterPanelProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'add' | 'edit' | 'view'
  actionData?: WorkflowActionUIData & {
    parameterRefNo?: string
    dealStartDate?: Date
    dealEndDate?: Date
    permittedInvestmentAllowed?: string
    permittedInvestment?: string
    amendmentAllowed?: string
    dealClosureBasis?: string
    dealNotes?: string
  } | null
}

type ParameterFormData = {
  parameterRefNo: string
  dealStartDate: Date | null
  dealEndDate: Date | null
  permittedInvestmentAllowed: string
  permittedInvestment: string
  amendmentAllowed: string
  dealClosureBasis: string
  dealNotes: string
}

const DEFAULT_VALUES: ParameterFormData = {
  parameterRefNo: '',
  dealStartDate: null,
  dealEndDate: null,
  permittedInvestmentAllowed: '',
  permittedInvestment: '',
  amendmentAllowed: '',
  dealClosureBasis: '',
  dealNotes: '',
}

// Mock data for dropdowns
const PERMITTED_INVESTMENT_ALLOWED_OPTIONS = [
  { id: 'yes', displayName: 'Yes' },
  { id: 'no', displayName: 'No' },
]

const PERMITTED_INVESTMENT_OPTIONS = [
  { id: 'stocks', displayName: 'Stocks' },
  { id: 'bonds', displayName: 'Bonds' },
  { id: 'mutual_funds', displayName: 'Mutual Funds' },
  { id: 'real_estate', displayName: 'Real Estate' },
  { id: 'commodities', displayName: 'Commodities' },
]

const AMENDMENT_ALLOWED_OPTIONS = [
  { id: 'yes', displayName: 'Yes' },
  { id: 'no', displayName: 'No' },
]

const DEAL_CLOSURE_BASIS_OPTIONS = [
  { id: 'maturity', displayName: 'Maturity' },
  { id: 'early_termination', displayName: 'Early Termination' },
  { id: 'default', displayName: 'Default' },
  { id: 'mutual_agreement', displayName: 'Mutual Agreement' },
]

export const RightSlideParameterPanel: React.FC<
  RightSlideParameterPanelProps
> = ({ isOpen, onClose, mode = 'add', actionData }) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [parameterRefNo, setParameterRefNo] = useState('')
  const [isGeneratingId, setIsGeneratingId] = useState(false)

  const createAction = useCreateWorkflowAction()
  const updateAction = useUpdateWorkflowAction()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting: isFormSubmitting, isDirty },
    clearErrors,
  } = useForm<ParameterFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  })

  // isSubmitting overall: either react-hook-form isSubmitting OR our API hooks are pending
  const isSubmitting =
    createAction.isPending || updateAction.isPending || isFormSubmitting

  // Load values when opening / changing mode
  useEffect(() => {
    if (!isOpen) return

    const values: ParameterFormData =
      mode === 'edit' && actionData
        ? {
            parameterRefNo: actionData.parameterRefNo ?? '',
            dealStartDate: actionData.dealStartDate ? new Date(actionData.dealStartDate) : null,
            dealEndDate: actionData.dealEndDate ? new Date(actionData.dealEndDate) : null,
            permittedInvestmentAllowed: actionData.permittedInvestmentAllowed ?? '',
            permittedInvestment: actionData.permittedInvestment ?? '',
            amendmentAllowed: actionData.amendmentAllowed ?? '',
            dealClosureBasis: actionData.dealClosureBasis ?? '',
            dealNotes: actionData.dealNotes ?? '',
          }
        : DEFAULT_VALUES

    reset(values, { keepDirty: false })
    clearErrors()
    setSuccessMessage(null)
    setErrorMessage(null)
    setParameterRefNo(values.parameterRefNo)
  }, [isOpen, mode, actionData, reset, clearErrors])

  const handleGenerateParameterRefNo = async () => {
    setIsGeneratingId(true)
    try {
      // Simulate API call to generate parameter ref no
      await new Promise(resolve => setTimeout(resolve, 1000))
      const generatedId = `PAR${Date.now().toString().slice(-6)}`
      setParameterRefNo(generatedId)
    } catch (error) {
      console.error('Error generating parameter ref no:', error)
    } finally {
      setIsGeneratingId(false)
    }
  }

  const onSubmit = (data: ParameterFormData) => {
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
        setErrorMessage('Invalid or missing action ID for update')
        return
      }
      const updatePayload = {
        id: actionData.id,
        parameterRefNo: data.parameterRefNo.trim(),
        dealStartDate: data.dealStartDate,
        dealEndDate: data.dealEndDate,
        permittedInvestmentAllowed: data.permittedInvestmentAllowed.trim(),
        permittedInvestment: data.permittedInvestment.trim(),
        amendmentAllowed: data.amendmentAllowed.trim(),
        dealClosureBasis: data.dealClosureBasis.trim(),
        dealNotes: data.dealNotes.trim(),
      }

      try {
        const jsonString = JSON.stringify(updatePayload)
        JSON.parse(jsonString)
      } catch (errors) {
        console.log(errors)
        setErrorMessage('Invalid data format - cannot serialize to JSON')
        return
      }

      if (!updatePayload.id || updatePayload.id <= 0) {
        setErrorMessage(
          'Invalid or missing record ID - cannot update this record'
        )
        return
      }

      updateAction.mutate(
        { id: actionData.id.toString(), updates: updatePayload },
        {
          onSuccess: () => {
            setSuccessMessage('Parameter updated successfully.')
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
              'Failed to update parameter'
            setErrorMessage(message)
          },
        }
      )
    } else {
      const createPayload = {
        parameterRefNo: data.parameterRefNo.trim(),
        dealStartDate: data.dealStartDate,
        dealEndDate: data.dealEndDate,
        permittedInvestmentAllowed: data.permittedInvestmentAllowed.trim(),
        permittedInvestment: data.permittedInvestment.trim(),
        amendmentAllowed: data.amendmentAllowed.trim(),
        dealClosureBasis: data.dealClosureBasis.trim(),
        dealNotes: data.dealNotes.trim(),
      }

      const emptyFields = []
      if (!createPayload.parameterRefNo?.trim()) emptyFields.push('parameterRefNo')
      if (!createPayload.dealStartDate) emptyFields.push('dealStartDate')
      if (!createPayload.dealEndDate) emptyFields.push('dealEndDate')
      if (!createPayload.permittedInvestmentAllowed?.trim()) emptyFields.push('permittedInvestmentAllowed')
      if (!createPayload.amendmentAllowed?.trim()) emptyFields.push('amendmentAllowed')
      if (!createPayload.dealClosureBasis?.trim()) emptyFields.push('dealClosureBasis')

      if (emptyFields.length > 0) {
        setErrorMessage(
          `Required fields cannot be empty: ${emptyFields.join(', ')}`
        )
        return
      }

      // @ts-ignore - Custom payload structure for parameter data
      createAction.mutate(createPayload, {
        onSuccess: () => {
          setSuccessMessage('Parameter created successfully.')
          setTimeout(() => {
            onClose()
          }, 1000)
        },
        onError: (err: Error | unknown) => {
          console.log(err)
          const error = err as Error & {
            response?: { data?: { message?: string } }
          }
          const message =
            error?.response?.data?.message ||
            error?.message ||
            'Failed to create parameter'
          setErrorMessage(message)
        },
      })
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

  const isViewMode = mode === 'view'

  const renderParameterRefNoField = (
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
            value={parameterRefNo}
            onChange={(e) => {
              setParameterRefNo(e.target.value)
              field.onChange(e)
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ mr: 0 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handleGenerateParameterRefNo}
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
          name={name}
          control={control}
          rules={validationRules}
          defaultValue={null}
          render={({ field, fieldState: { error } }) => (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
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
            </LocalizationProvider>
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

    return (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
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

  const handleResetToLoaded = useCallback(() => {
    const loaded: ParameterFormData =
      mode === 'edit' && actionData
        ? {
            parameterRefNo: actionData.parameterRefNo ?? '',
            dealStartDate: actionData.dealStartDate ? new Date(actionData.dealStartDate) : null,
            dealEndDate: actionData.dealEndDate ? new Date(actionData.dealEndDate) : null,
            permittedInvestmentAllowed: actionData.permittedInvestmentAllowed ?? '',
            permittedInvestment: actionData.permittedInvestment ?? '',
            amendmentAllowed: actionData.amendmentAllowed ?? '',
            dealClosureBasis: actionData.dealClosureBasis ?? '',
            dealNotes: actionData.dealNotes ?? '',
          }
        : DEFAULT_VALUES
    reset(loaded, { keepDirty: false })
    clearErrors()
    setParameterRefNo(loaded.parameterRefNo)
  }, [mode, actionData, reset, clearErrors])

  const onError = (errors: FieldErrors<ParameterFormData>) => {
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
            {mode === 'edit' ? 'Edit Parameter' : 'Add Parameter'}
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
            {renderParameterRefNoField(
              'parameterRefNo',
              getParameterLabel('CDL_PAR_PARAMETER_REF_NO'),
              6
            )}
            {renderDatePickerField(
              'dealStartDate',
              getParameterLabel('CDL_PAR_DEAL_START_DATE'),
              6,
              true
            )}
            {renderDatePickerField(
              'dealEndDate',
              getParameterLabel('CDL_PAR_DEAL_END_DATE'),
              6,
              true
            )}
            {renderSelectField(
              'permittedInvestmentAllowed',
              getParameterLabel('CDL_PAR_PERMITTED_INVESTMENT_ALLOWED'),
              PERMITTED_INVESTMENT_ALLOWED_OPTIONS,
              6,
              true
            )}
            {renderSelectField(
              'permittedInvestment',
              getParameterLabel('CDL_PAR_PERMITTED_INVESTMENT'),
              PERMITTED_INVESTMENT_OPTIONS,
              6,
              false
            )}
            {renderSelectField(
              'amendmentAllowed',
              getParameterLabel('CDL_PAR_AMENDMENT_ALLOWED'),
              AMENDMENT_ALLOWED_OPTIONS,
              6,
              true
            )}
            {renderSelectField(
              'dealClosureBasis',
              getParameterLabel('CDL_PAR_DEAL_CLOSURE_BASIS'),
              DEAL_CLOSURE_BASIS_OPTIONS,
              6,
              true
            )}
            {renderTextField(
              'dealNotes',
              getParameterLabel('CDL_PAR_DEAL_NOTES'),
              12,
              '',
              false
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
