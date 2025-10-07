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
  FormControlLabel,
  Checkbox,
  InputAdornment,
} from '@mui/material'
import { Controller, useForm, FieldErrors } from 'react-hook-form'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

import {
  useCreateWorkflowAction,
  useUpdateWorkflowAction,
} from '@/hooks/workflow'
import type {
  WorkflowActionUIData,
} from '@/services/api/workflowApi'
import { getLabelByConfigId as getDealPrimaryLabel } from '@/constants/mappings/customerMapping'

interface RightSlideDealPrimaryPanelProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'add' | 'edit' | 'view'
  actionData?: WorkflowActionUIData & {
    dealId?: string
    dealStatus?: string
    mainEscrowCif?: string
    clientName?: string
    productManager?: string
    businessSegment?: string
    businessSubsegment?: string
    regulatory?: string
    fees?: string
    rmName?: string
    location?: string
    dealType?: string
    dealSubType?: string
    productProgram?: string
    dealPriority?: string
    freeField1?: string
    freeField2?: string
    freeField3?: string
    freeField4?: string
  } | null
}

type DealPrimaryFormData = {
  dealId: string
  dealStatus: string
  mainEscrowCif: string
  clientName: string
  productManager: string
  businessSegment: string
  businessSubsegment: string
  regulatory: string
  fees: string
  rmName: string
  location: string
  dealType: string
  dealSubType: string
  productProgram: string
  dealPriority: string
  freeField1: string
  freeField2: string
  freeField3: string
  freeField4: string
}

const DEFAULT_VALUES: DealPrimaryFormData = {
  dealId: '',
  dealStatus: '',
  mainEscrowCif: '',
  clientName: '',
  productManager: '',
  businessSegment: '',
  businessSubsegment: '',
  regulatory: '',
  fees: '',
  rmName: '',
  location: '',
  dealType: '',
  dealSubType: '',
  productProgram: '',
  dealPriority: '',
  freeField1: '',
  freeField2: '',
  freeField3: '',
  freeField4: '',
}

// Mock data for dropdowns
const DEAL_STATUS_OPTIONS = [
  { id: 'active', displayName: 'Active' },
  { id: 'pending', displayName: 'Pending' },
  { id: 'completed', displayName: 'Completed' },
  { id: 'cancelled', displayName: 'Cancelled' },
]

const REGULATORY_OPTIONS = [
  { id: 'yes', displayName: 'Yes' },
  { id: 'no', displayName: 'No' },
]

const FEES_OPTIONS = [
  { id: 'yes', displayName: 'Yes' },
  { id: 'no', displayName: 'No' },
]

const DEAL_PRIORITY_OPTIONS = [
  { id: 'yellow_channel', displayName: 'Yellow Channel' },
  { id: 'green_channel', displayName: 'Green Channel' },
  { id: 'grey_channel', displayName: 'Grey Channel' },
  { id: 'others', displayName: 'Others' },
]

const BUSINESS_SEGMENT_OPTIONS = [
  { id: 'commercial', displayName: 'Commercial' },
  { id: 'investment', displayName: 'Investment' },
  { id: 'retail', displayName: 'Retail' },
]

const BUSINESS_SUBSEGMENT_OPTIONS = [
  { id: 'real_estate', displayName: 'Real Estate' },
  { id: 'securities', displayName: 'Securities' },
  { id: 'banking', displayName: 'Banking' },
]

const DEAL_TYPE_OPTIONS = [
  { id: 'escrow', displayName: 'Escrow' },
  { id: 'investment', displayName: 'Investment' },
  { id: 'loan', displayName: 'Loan' },
]

const DEAL_SUBTYPE_OPTIONS = [
  { id: 'property', displayName: 'Property' },
  { id: 'bond', displayName: 'Bond' },
  { id: 'equity', displayName: 'Equity' },
]

const PRODUCT_PROGRAM_OPTIONS = [
  { id: 'standard', displayName: 'Standard' },
  { id: 'premium', displayName: 'Premium' },
  { id: 'basic', displayName: 'Basic' },
]

export const RightSlideDealPrimaryPanel: React.FC<
  RightSlideDealPrimaryPanelProps
> = ({ isOpen, onClose, mode = 'add', actionData }) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [dealId, setDealId] = useState('')
  const [isGeneratingId, setIsGeneratingId] = useState(false)

  const createAction = useCreateWorkflowAction()
  const updateAction = useUpdateWorkflowAction()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting: isFormSubmitting, isDirty },
    clearErrors,
  } = useForm<DealPrimaryFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  })

  // isSubmitting overall: either react-hook-form isSubmitting OR our API hooks are pending
  const isSubmitting =
    createAction.isPending || updateAction.isPending || isFormSubmitting

  // Load values when opening / changing mode
  useEffect(() => {
    if (!isOpen) return

    const values: DealPrimaryFormData =
      mode === 'edit' && actionData
        ? {
            dealId: actionData.dealId ?? '',
            dealStatus: actionData.dealStatus ?? '',
            mainEscrowCif: actionData.mainEscrowCif ?? '',
            clientName: actionData.clientName ?? '',
            productManager: actionData.productManager ?? '',
            businessSegment: actionData.businessSegment ?? '',
            businessSubsegment: actionData.businessSubsegment ?? '',
            regulatory: actionData.regulatory ?? '',
            fees: actionData.fees ?? '',
            rmName: actionData.rmName ?? '',
            location: actionData.location ?? '',
            dealType: actionData.dealType ?? '',
            dealSubType: actionData.dealSubType ?? '',
            productProgram: actionData.productProgram ?? '',
            dealPriority: actionData.dealPriority ?? '',
            freeField1: actionData.freeField1 ?? '',
            freeField2: actionData.freeField2 ?? '',
            freeField3: actionData.freeField3 ?? '',
            freeField4: actionData.freeField4 ?? '',
          }
        : DEFAULT_VALUES

    reset(values, { keepDirty: false })
    clearErrors()
    setSuccessMessage(null)
    setErrorMessage(null)
    setDealId(values.dealId)
  }, [isOpen, mode, actionData, reset, clearErrors])

  const handleGenerateDealId = async () => {
    setIsGeneratingId(true)
    try {
      // Simulate API call to generate deal ID
      await new Promise(resolve => setTimeout(resolve, 1000))
      const generatedId = `DP${Date.now().toString().slice(-6)}`
      setDealId(generatedId)
    } catch (error) {
      console.error('Error generating deal ID:', error)
    } finally {
      setIsGeneratingId(false)
    }
  }

  const onSubmit = (data: DealPrimaryFormData) => {
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
        dealId: data.dealId.trim(),
        dealStatus: data.dealStatus.trim(),
        mainEscrowCif: data.mainEscrowCif.trim(),
        clientName: data.clientName.trim(),
        productManager: data.productManager.trim(),
        businessSegment: data.businessSegment.trim(),
        businessSubsegment: data.businessSubsegment.trim(),
        regulatory: data.regulatory.trim(),
        fees: data.fees.trim(),
        rmName: data.rmName.trim(),
        location: data.location.trim(),
        dealType: data.dealType.trim(),
        dealSubType: data.dealSubType.trim(),
        productProgram: data.productProgram.trim(),
        dealPriority: data.dealPriority.trim(),
        freeField1: data.freeField1.trim(),
        freeField2: data.freeField2.trim(),
        freeField3: data.freeField3.trim(),
        freeField4: data.freeField4.trim(),
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
            setSuccessMessage('Deal Primary updated successfully.')
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
              'Failed to update deal primary'
            setErrorMessage(message)
          },
        }
      )
    } else {
      const createPayload = {
        dealId: data.dealId.trim(),
        dealStatus: data.dealStatus.trim(),
        mainEscrowCif: data.mainEscrowCif.trim(),
        clientName: data.clientName.trim(),
        productManager: data.productManager.trim(),
        businessSegment: data.businessSegment.trim(),
        businessSubsegment: data.businessSubsegment.trim(),
        regulatory: data.regulatory.trim(),
        fees: data.fees.trim(),
        rmName: data.rmName.trim(),
        location: data.location.trim(),
        dealType: data.dealType.trim(),
        dealSubType: data.dealSubType.trim(),
        productProgram: data.productProgram.trim(),
        dealPriority: data.dealPriority.trim(),
        freeField1: data.freeField1.trim(),
        freeField2: data.freeField2.trim(),
        freeField3: data.freeField3.trim(),
        freeField4: data.freeField4.trim(),
      }

      const emptyFields = []
      if (!createPayload.dealId?.trim()) emptyFields.push('dealId')
      if (!createPayload.dealStatus?.trim()) emptyFields.push('dealStatus')
      if (!createPayload.mainEscrowCif?.trim()) emptyFields.push('mainEscrowCif')
      if (!createPayload.clientName?.trim()) emptyFields.push('clientName')
      if (!createPayload.productManager?.trim()) emptyFields.push('productManager')
      if (!createPayload.businessSegment?.trim()) emptyFields.push('businessSegment')
      if (!createPayload.businessSubsegment?.trim()) emptyFields.push('businessSubsegment')
      if (!createPayload.regulatory?.trim()) emptyFields.push('regulatory')
      if (!createPayload.fees?.trim()) emptyFields.push('fees')
      if (!createPayload.rmName?.trim()) emptyFields.push('rmName')
      if (!createPayload.location?.trim()) emptyFields.push('location')
      if (!createPayload.dealPriority?.trim()) emptyFields.push('dealPriority')

      if (emptyFields.length > 0) {
        setErrorMessage(
          `Required fields cannot be empty: ${emptyFields.join(', ')}`
        )
        return
      }

      // @ts-ignore - Custom payload structure for deal primary data
      createAction.mutate(createPayload, {
        onSuccess: () => {
          setSuccessMessage('Deal Primary created successfully.')
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
            'Failed to create deal primary'
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

  const renderDealIdField = (
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
            value={dealId}
            onChange={(e) => {
              setDealId(e.target.value)
              field.onChange(e)
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ mr: 0 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handleGenerateDealId}
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
    const loaded: DealPrimaryFormData =
      mode === 'edit' && actionData
        ? {
            dealId: actionData.dealId ?? '',
            dealStatus: actionData.dealStatus ?? '',
            mainEscrowCif: actionData.mainEscrowCif ?? '',
            clientName: actionData.clientName ?? '',
            productManager: actionData.productManager ?? '',
            businessSegment: actionData.businessSegment ?? '',
            businessSubsegment: actionData.businessSubsegment ?? '',
            regulatory: actionData.regulatory ?? '',
            fees: actionData.fees ?? '',
            rmName: actionData.rmName ?? '',
            location: actionData.location ?? '',
            dealType: actionData.dealType ?? '',
            dealSubType: actionData.dealSubType ?? '',
            productProgram: actionData.productProgram ?? '',
            dealPriority: actionData.dealPriority ?? '',
            freeField1: actionData.freeField1 ?? '',
            freeField2: actionData.freeField2 ?? '',
            freeField3: actionData.freeField3 ?? '',
            freeField4: actionData.freeField4 ?? '',
          }
        : DEFAULT_VALUES
    reset(loaded, { keepDirty: false })
    clearErrors()
    setDealId(loaded.dealId)
  }, [mode, actionData, reset, clearErrors])

  const onError = (errors: FieldErrors<DealPrimaryFormData>) => {
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
            {mode === 'edit' ? 'Edit Deal Primary' : 'Add Deal Primary'}
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
            {renderDealIdField(
              'dealId',
              getDealPrimaryLabel('CDL_EDP_DEAL_ID'),
              6
            )}
            {renderSelectField(
              'dealStatus',
              getDealPrimaryLabel('CDL_EDP_DEAL_STATUS'),
              DEAL_STATUS_OPTIONS,
              6,
              true
            )}
            {renderTextField(
              'mainEscrowCif',
              getDealPrimaryLabel('CDL_EDP_MAIN_ESCROW_CIF'),
              6,
              '',
              true
            )}
            {renderTextField(
              'clientName',
              getDealPrimaryLabel('CDL_EDP_CLIENT_NAME'),
              6,
              '',
              true
            )}
            {renderTextField(
              'productManager',
              getDealPrimaryLabel('CDL_EDP_PRODUCT_MANAGER'),
              6,
              '',
              true
            )}
            {renderSelectField(
              'businessSegment',
              getDealPrimaryLabel('CDL_EDP_BUSINESS_SEGMENT'),
              BUSINESS_SEGMENT_OPTIONS,
              6,
              true
            )}
            {renderSelectField(
              'businessSubsegment',
              getDealPrimaryLabel('CDL_EDP_BUSINESS_SUBSEGMENT'),
              BUSINESS_SUBSEGMENT_OPTIONS,
              6,
              true
            )}
            {renderSelectField(
              'regulatory',
              getDealPrimaryLabel('CDL_EDP_REGULATORY'),
              REGULATORY_OPTIONS,
              6,
              true
            )}
            {renderSelectField(
              'fees',
              getDealPrimaryLabel('CDL_EDP_FEES'),
              FEES_OPTIONS,
              6,
              true
            )}
            {renderTextField(
              'rmName',
              getDealPrimaryLabel('CDL_EDP_RM_NAME'),
              6,
              '',
              true
            )}
            {renderTextField(
              'location',
              getDealPrimaryLabel('CDL_EDP_LOCATION'),
              6,
              '',
              true
            )}
            {renderSelectField(
              'dealType',
              getDealPrimaryLabel('CDL_EDP_DEAL_TYPE'),
              DEAL_TYPE_OPTIONS,
              6,
              false
            )}
            {renderSelectField(
              'dealSubType',
              getDealPrimaryLabel('CDL_EDP_DEAL_SUB_TYPE'),
              DEAL_SUBTYPE_OPTIONS,
              6,
              false
            )}
            {renderSelectField(
              'productProgram',
              getDealPrimaryLabel('CDL_EDP_PRODUCT_PROGRAM'),
              PRODUCT_PROGRAM_OPTIONS,
              6,
              false
            )}
            {renderSelectField(
              'dealPriority',
              getDealPrimaryLabel('CDL_EDP_DEAL_PRIORITY'),
              DEAL_PRIORITY_OPTIONS,
              6,
              true
            )}
            {renderTextField(
              'freeField1',
              getDealPrimaryLabel('CDL_EDP_FREE_FIELD_1'),
              12,
              '',
              false
            )}
            {renderTextField(
              'freeField2',
              getDealPrimaryLabel('CDL_EDP_FREE_FIELD_2'),
              12,
              '',
              false
            )}
            {renderTextField(
              'freeField3',
              getDealPrimaryLabel('CDL_EDP_FREE_FIELD_3'),
              12,
              '',
              false
            )}
            {renderTextField(
              'freeField4',
              getDealPrimaryLabel('CDL_EDP_FREE_FIELD_4'),
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
