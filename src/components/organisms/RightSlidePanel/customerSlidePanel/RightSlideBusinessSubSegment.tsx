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
} from '@mui/material'
import { Controller, useForm, FieldErrors } from 'react-hook-form'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'

import {
  useCreateWorkflowAction,
  useUpdateWorkflowAction,
} from '@/hooks/workflow'
import type {
  WorkflowActionUIData,
} from '@/services/api/workflowApi'
import { getLabelByConfigId as getBusinessSubSegmentLabel } from '@/constants/mappings/customerMapping'

interface RightSlideBusinessSubSegmentPanelProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'add' | 'edit' | 'view'
  actionData?: WorkflowActionUIData | null
}

type BusinessSubSegmentFormData = {
  businessSubSegmentId: string
  businessSubSegmentName: string
  businessSubSegmentDescription: string
  businessSegmentName: string
}

const DEFAULT_VALUES: BusinessSubSegmentFormData = {
  businessSubSegmentId: '',
  businessSubSegmentName: '',
  businessSubSegmentDescription: '',
  businessSegmentName: '',
}

export const RightSlideBusinessSubSegmentPanel: React.FC<
  RightSlideBusinessSubSegmentPanelProps
> = ({ isOpen, onClose, mode = 'add', actionData }) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const createAction = useCreateWorkflowAction()
  const updateAction = useUpdateWorkflowAction()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting: isFormSubmitting, isDirty },
    clearErrors,
  } = useForm<BusinessSubSegmentFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  })

  // isSubmitting overall: either react-hook-form isSubmitting OR our API hooks are pending
  const isSubmitting =
    createAction.isPending || updateAction.isPending || isFormSubmitting

  // Load values when opening / changing mode
  useEffect(() => {
    if (!isOpen) return

    const values: BusinessSubSegmentFormData =
      mode === 'edit' && actionData
        ? {
            businessSubSegmentId: (actionData as any).businessSubSegmentId ?? '',
            businessSubSegmentName: (actionData as any).businessSubSegmentName ?? '',
            businessSubSegmentDescription: (actionData as any).businessSubSegmentDescription ?? '',
            businessSegmentName: (actionData as any).businessSegmentName ?? '',
          }
        : DEFAULT_VALUES

    reset(values, { keepDirty: false })
    clearErrors()
    setSuccessMessage(null)
    setErrorMessage(null)
  }, [isOpen, mode, actionData, reset, clearErrors])

  const onSubmit = (data: BusinessSubSegmentFormData) => {
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
        businessSubSegmentId: data.businessSubSegmentId.trim(),
        businessSubSegmentName: data.businessSubSegmentName.trim(),
        businessSubSegmentDescription: data.businessSubSegmentDescription.trim(),
        businessSegmentName: data.businessSegmentName.trim(),
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
            setSuccessMessage('Business Sub-Segment updated successfully.')
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
              'Failed to update business sub-segment'
            setErrorMessage(message)
          },
        }
      )
    } else {
      const createPayload = {
        businessSubSegmentId: data.businessSubSegmentId.trim(),
        businessSubSegmentName: data.businessSubSegmentName.trim(),
        businessSubSegmentDescription: data.businessSubSegmentDescription?.trim() || '',
        businessSegmentName: data.businessSegmentName.trim(),
      }

      const emptyFields = []
      if (!createPayload.businessSubSegmentId?.trim()) emptyFields.push('businessSubSegmentId')
      if (!createPayload.businessSubSegmentName?.trim()) emptyFields.push('businessSubSegmentName')
      if (!createPayload.businessSegmentName?.trim()) emptyFields.push('businessSegmentName')

      if (emptyFields.length > 0) {
        setErrorMessage(
          `Required fields cannot be empty: ${emptyFields.join(', ')}`
        )
        return
      }

      createAction.mutate(createPayload as any, {
        onSuccess: () => {
          setSuccessMessage('Business Sub-Segment created successfully.')
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
            'Failed to create business sub-segment'
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

  const labelSx = {
    color: '#6A7282',
    fontFamily: 'Outfit',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '12px',
    letterSpacing: 0,
  }

  const valueSx = {
    fontFamily: 'Outfit',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '14px',
    letterSpacing: 0,
    wordBreak: 'break-word',
  }

  const isViewMode = mode === 'view'

  const renderTextField = (
    name: keyof BusinessSubSegmentFormData,
    label: string,
    type: 'text' | 'number' = 'text',
    gridSize: number = 12,
    required: boolean = true
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        rules={{
          ...(required && {
            required: `${label} is required`,
            minLength: { value: 1, message: `${label} cannot be empty` },
          }),
        }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            type={type}
            label={label}
            fullWidth
            disabled={isSubmitting || isViewMode}
            required={required}
            error={!!fieldState.error}
            helperText={fieldState.error?.message || ''}
            InputLabelProps={{ sx: labelSx }}
            InputProps={{ sx: valueSx }}
            sx={commonFieldStyles}
            onChange={(e) => {
              const value =
                type === 'number' ? Number(e.target.value) : e.target.value
              field.onChange(value)
            }}
          />
        )}
      />
    </Grid>
  )
  const handleResetToLoaded = useCallback(() => {
    const loaded: BusinessSubSegmentFormData =
      mode === 'edit' && actionData
        ? {
            businessSubSegmentId: (actionData as any).businessSubSegmentId ?? '',
            businessSubSegmentName: (actionData as any).businessSubSegmentName ?? '',
            businessSubSegmentDescription: (actionData as any).businessSubSegmentDescription ?? '',
            businessSegmentName: (actionData as any).businessSegmentName ?? '',
          }
        : DEFAULT_VALUES
    reset(loaded, { keepDirty: false })
    clearErrors()
  }, [mode, actionData, reset, clearErrors])

  const onError = (errors: FieldErrors<BusinessSubSegmentFormData>) => {
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
            {mode === 'edit' ? 'Edit Business Sub-Segment' : 'Add Business Sub-Segment'}
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
            {renderTextField(
              'businessSubSegmentId',
              getBusinessSubSegmentLabel('CDL_CS_BUSINESS_SUB_SEGMENT_ID'),
              'text',
              12
            )}
            {renderTextField(
              'businessSubSegmentName',
              getBusinessSubSegmentLabel('CDL_CS_BUSINESS_SUB_SEGMENT_NAME'),
              'text',
              12
            )}
            {renderTextField(
              'businessSubSegmentDescription',
              getBusinessSubSegmentLabel('CDL_CS_BUSINESS_SUB_SEGMENT_DESCRIPTION'),
              'text',
              12,
              false
            )}
            {renderTextField(
              'businessSegmentName',
              getBusinessSubSegmentLabel('CDL_CS_BUSINESS_SEGMENT_NAME'),
              'text',
              12
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
