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
import { getLabelByConfigId as getPartySignatoryLabel } from '@/constants/mappings/customerMapping'

interface RightSlidePartySignatoryPanelProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'add' | 'edit' | 'view'
  actionData?: WorkflowActionUIData & {
    partiesRefNo?: string
    partyCrnNumber?: string
    partyName?: string
    partyAddress1?: string
    partyAddress2?: string
    partyAddress3?: string
    role?: string
    partyNoticeAddress1?: string
    partyNoticeAddress2?: string
    partyNoticeAddress3?: string
    partySignatory?: string
    noticePerson?: string
    noticePersonSignatory?: string
    noticePersonEmail?: string
    partyAssociateType?: string
  } | null
}

type PartySignatoryFormData = {
  partiesRefNo: string
  partyCrnNumber: string
  partyName: string
  partyAddress1: string
  partyAddress2: string
  partyAddress3: string
  role: string
  partyNoticeAddress1: string
  partyNoticeAddress2: string
  partyNoticeAddress3: string
  partySignatory: string
  noticePerson: string
  noticePersonSignatory: string
  noticePersonEmail: string
  partyAssociateType: string
}

const DEFAULT_VALUES: PartySignatoryFormData = {
  partiesRefNo: '',
  partyCrnNumber: '',
  partyName: '',
  partyAddress1: '',
  partyAddress2: '',
  partyAddress3: '',
  role: '',
  partyNoticeAddress1: '',
  partyNoticeAddress2: '',
  partyNoticeAddress3: '',
  partySignatory: '',
  noticePerson: '',
  noticePersonSignatory: '',
  noticePersonEmail: '',
  partyAssociateType: '',
}

// Mock data for dropdowns
const ROLE_OPTIONS = [
  { id: 'borrower', displayName: 'Borrower' },
  { id: 'lender', displayName: 'Lender' },
  { id: 'guarantor', displayName: 'Guarantor' },
  { id: 'witness', displayName: 'Witness' },
]

const PARTY_ASSOCIATE_TYPE_OPTIONS = [
  { id: 'individual', displayName: 'Individual' },
  { id: 'corporation', displayName: 'Corporation' },
  { id: 'partnership', displayName: 'Partnership' },
  { id: 'trust', displayName: 'Trust' },
]

export const RightSlidePartySignatoryPanel: React.FC<
  RightSlidePartySignatoryPanelProps
> = ({ isOpen, onClose, mode = 'add', actionData }) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [partiesRefNo, setPartiesRefNo] = useState('')
  const [isGeneratingId, setIsGeneratingId] = useState(false)

  const createAction = useCreateWorkflowAction()
  const updateAction = useUpdateWorkflowAction()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting: isFormSubmitting, isDirty },
    clearErrors,
  } = useForm<PartySignatoryFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  })

  // isSubmitting overall: either react-hook-form isSubmitting OR our API hooks are pending
  const isSubmitting =
    createAction.isPending || updateAction.isPending || isFormSubmitting

  // Load values when opening / changing mode
  useEffect(() => {
    if (!isOpen) return

    const values: PartySignatoryFormData =
      mode === 'edit' && actionData
        ? {
            partiesRefNo: actionData.partiesRefNo ?? '',
            partyCrnNumber: actionData.partyCrnNumber ?? '',
            partyName: actionData.partyName ?? '',
            partyAddress1: actionData.partyAddress1 ?? '',
            partyAddress2: actionData.partyAddress2 ?? '',
            partyAddress3: actionData.partyAddress3 ?? '',
            role: actionData.role ?? '',
            partyNoticeAddress1: actionData.partyNoticeAddress1 ?? '',
            partyNoticeAddress2: actionData.partyNoticeAddress2 ?? '',
            partyNoticeAddress3: actionData.partyNoticeAddress3 ?? '',
            partySignatory: actionData.partySignatory ?? '',
            noticePerson: actionData.noticePerson ?? '',
            noticePersonSignatory: actionData.noticePersonSignatory ?? '',
            noticePersonEmail: actionData.noticePersonEmail ?? '',
            partyAssociateType: actionData.partyAssociateType ?? '',
          }
        : DEFAULT_VALUES

    reset(values, { keepDirty: false })
    clearErrors()
    setSuccessMessage(null)
    setErrorMessage(null)
    setPartiesRefNo(values.partiesRefNo)
  }, [isOpen, mode, actionData, reset, clearErrors])

  const handleGeneratePartiesRefNo = async () => {
    setIsGeneratingId(true)
    try {
      // Simulate API call to generate parties ref no
      await new Promise(resolve => setTimeout(resolve, 1000))
      const generatedId = `PS${Date.now().toString().slice(-6)}`
      setPartiesRefNo(generatedId)
    } catch (error) {
      console.error('Error generating parties ref no:', error)
    } finally {
      setIsGeneratingId(false)
    }
  }

  const onSubmit = (data: PartySignatoryFormData) => {
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
        partiesRefNo: data.partiesRefNo.trim(),
        partyCrnNumber: data.partyCrnNumber.trim(),
        partyName: data.partyName.trim(),
        partyAddress1: data.partyAddress1.trim(),
        partyAddress2: data.partyAddress2.trim(),
        partyAddress3: data.partyAddress3.trim(),
        role: data.role.trim(),
        partyNoticeAddress1: data.partyNoticeAddress1.trim(),
        partyNoticeAddress2: data.partyNoticeAddress2.trim(),
        partyNoticeAddress3: data.partyNoticeAddress3.trim(),
        partySignatory: data.partySignatory.trim(),
        noticePerson: data.noticePerson.trim(),
        noticePersonSignatory: data.noticePersonSignatory.trim(),
        noticePersonEmail: data.noticePersonEmail.trim(),
        partyAssociateType: data.partyAssociateType.trim(),
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
            setSuccessMessage('Party Signatory updated successfully.')
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
              'Failed to update party signatory'
            setErrorMessage(message)
          },
        }
      )
    } else {
      const createPayload = {
        partiesRefNo: data.partiesRefNo.trim(),
        partyCrnNumber: data.partyCrnNumber.trim(),
        partyName: data.partyName.trim(),
        partyAddress1: data.partyAddress1.trim(),
        partyAddress2: data.partyAddress2.trim(),
        partyAddress3: data.partyAddress3.trim(),
        role: data.role.trim(),
        partyNoticeAddress1: data.partyNoticeAddress1.trim(),
        partyNoticeAddress2: data.partyNoticeAddress2.trim(),
        partyNoticeAddress3: data.partyNoticeAddress3.trim(),
        partySignatory: data.partySignatory.trim(),
        noticePerson: data.noticePerson.trim(),
        noticePersonSignatory: data.noticePersonSignatory.trim(),
        noticePersonEmail: data.noticePersonEmail.trim(),
        partyAssociateType: data.partyAssociateType.trim(),
      }

      const emptyFields = []
      if (!createPayload.partiesRefNo?.trim()) emptyFields.push('partiesRefNo')
      if (!createPayload.partyName?.trim()) emptyFields.push('partyName')
      if (!createPayload.partyAddress1?.trim()) emptyFields.push('partyAddress1')
      if (!createPayload.role?.trim()) emptyFields.push('role')

      if (emptyFields.length > 0) {
        setErrorMessage(
          `Required fields cannot be empty: ${emptyFields.join(', ')}`
        )
        return
      }

      // @ts-ignore - Custom payload structure for party signatory data
      createAction.mutate(createPayload, {
        onSuccess: () => {
          setSuccessMessage('Party Signatory created successfully.')
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
            'Failed to create party signatory'
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

  const isViewMode = mode === 'view'

  const renderPartiesRefNoField = (
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
            value={partiesRefNo}
            onChange={(e) => {
              setPartiesRefNo(e.target.value)
              field.onChange(e)
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ mr: 0 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handleGeneratePartiesRefNo}
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
    const loaded: PartySignatoryFormData =
      mode === 'edit' && actionData
        ? {
            partiesRefNo: actionData.partiesRefNo ?? '',
            partyCrnNumber: actionData.partyCrnNumber ?? '',
            partyName: actionData.partyName ?? '',
            partyAddress1: actionData.partyAddress1 ?? '',
            partyAddress2: actionData.partyAddress2 ?? '',
            partyAddress3: actionData.partyAddress3 ?? '',
            role: actionData.role ?? '',
            partyNoticeAddress1: actionData.partyNoticeAddress1 ?? '',
            partyNoticeAddress2: actionData.partyNoticeAddress2 ?? '',
            partyNoticeAddress3: actionData.partyNoticeAddress3 ?? '',
            partySignatory: actionData.partySignatory ?? '',
            noticePerson: actionData.noticePerson ?? '',
            noticePersonSignatory: actionData.noticePersonSignatory ?? '',
            noticePersonEmail: actionData.noticePersonEmail ?? '',
            partyAssociateType: actionData.partyAssociateType ?? '',
          }
        : DEFAULT_VALUES
    reset(loaded, { keepDirty: false })
    clearErrors()
    setPartiesRefNo(loaded.partiesRefNo)
  }, [mode, actionData, reset, clearErrors])

  const onError = (errors: FieldErrors<PartySignatoryFormData>) => {
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
            {mode === 'edit' ? 'Edit Party Signatory' : 'Add Party Signatory'}
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
            {renderPartiesRefNoField(
              'partiesRefNo',
              getPartySignatoryLabel('CDL_PS_PARTIES_REF_NO'),
              6
            )}
            {renderTextField(
              'partyCrnNumber',
              getPartySignatoryLabel('CDL_PS_PARTY_CRN_NUMBER'),
              6,
              '',
              false
            )}
            {renderTextField(
              'partyName',
              getPartySignatoryLabel('CDL_PS_PARTY_NAME'),
              6,
              '',
              true
            )}
            {renderTextField(
              'partyAddress1',
              getPartySignatoryLabel('CDL_PS_PARTY_ADDRESS_1'),
              6,
              '',
              true
            )}
            {renderTextField(
              'partyAddress2',
              getPartySignatoryLabel('CDL_PS_PARTY_ADDRESS_2'),
              6,
              '',
              false
            )}
            {renderTextField(
              'partyAddress3',
              getPartySignatoryLabel('CDL_PS_PARTY_ADDRESS_3'),
              6,
              '',
              false
            )}
            {renderSelectField(
              'role',
              getPartySignatoryLabel('CDL_PS_ROLE'),
              ROLE_OPTIONS,
              6,
              true
            )}
            {renderTextField(
              'partyNoticeAddress1',
              getPartySignatoryLabel('CDL_PS_PARTY_NOTICE_ADDRESS_1'),
              6,
              '',
              false
            )}
            {renderTextField(
              'partyNoticeAddress2',
              getPartySignatoryLabel('CDL_PS_PARTY_NOTICE_ADDRESS_2'),
              6,
              '',
              false
            )}
            {renderTextField(
              'partyNoticeAddress3',
              getPartySignatoryLabel('CDL_PS_PARTY_NOTICE_ADDRESS_3'),
              6,
              '',
              false
            )}
            {renderTextField(
              'partySignatory',
              getPartySignatoryLabel('CDL_PS_PARTY_SIGNATORY'),
              6,
              '',
              false
            )}
            {renderTextField(
              'noticePerson',
              getPartySignatoryLabel('CDL_PS_NOTICE_PERSON'),
              6,
              '',
              false
            )}
            {renderTextField(
              'noticePersonSignatory',
              getPartySignatoryLabel('CDL_PS_NOTICE_PERSON_SIGNATORY'),
              6,
              '',
              false
            )}
            {renderTextField(
              'noticePersonEmail',
              getPartySignatoryLabel('CDL_PS_NOTICE_PERSON_EMAIL'),
              6,
              '',
              false
            )}
            {renderSelectField(
              'partyAssociateType',
              getPartySignatoryLabel('CDL_PS_PARTY_ASSOCIATE_TYPE'),
              PARTY_ASSOCIATE_TYPE_OPTIONS,
              6,
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
