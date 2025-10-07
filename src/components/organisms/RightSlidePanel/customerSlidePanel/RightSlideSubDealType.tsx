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
import { getLabelByConfigId as getDealSubTypeLabel } from '@/constants/mappings/customerMapping'

interface RightSlideSubDealTypePanelProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'add' | 'edit' | 'view'
  actionData?: WorkflowActionUIData | null
}

type DealSubTypeFormData = {
  dealSubTypeId: string
  dealSubTypeName: string
  dealSubTypeDescription: string
  dealTypeName: string
}

const DEFAULT_VALUES: DealSubTypeFormData = {
  dealSubTypeId: '',
  dealSubTypeName: '',
  dealSubTypeDescription: '',
  dealTypeName: '',
}

export const RightSlideSubDealTypePanel: React.FC<
  RightSlideSubDealTypePanelProps
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
  } = useForm<DealSubTypeFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  })

  // isSubmitting overall: either react-hook-form isSubmitting OR our API hooks are pending
  const isSubmitting =
    createAction.isPending || updateAction.isPending || isFormSubmitting

  // Load values when opening / changing mode
  useEffect(() => {
    if (!isOpen) return

    const values: DealSubTypeFormData =
      mode === 'edit' && actionData
        ? {
            dealSubTypeId: (actionData as any).dealSubTypeId ?? '',
            dealSubTypeName: (actionData as any).dealSubTypeName ?? '',
            dealSubTypeDescription: (actionData as any).dealSubTypeDescription ?? '',
            dealTypeName: (actionData as any).dealTypeName ?? '',
          }
        : DEFAULT_VALUES

    reset(values, { keepDirty: false })
    clearErrors()
    setSuccessMessage(null)
    setErrorMessage(null)
  }, [isOpen, mode, actionData, reset, clearErrors])

  const onSubmit = (data: DealSubTypeFormData) => {
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
        dealSubTypeId: data.dealSubTypeId.trim(),
        dealSubTypeName: data.dealSubTypeName.trim(),
        dealSubTypeDescription: data.dealSubTypeDescription.trim(),
        dealTypeName: data.dealTypeName.trim(),
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
            setSuccessMessage('Deal Sub-Type updated successfully.')
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
              'Failed to update deal sub-type'
            setErrorMessage(message)
          },
        }
      )
    } else {
      const createPayload = {
        dealSubTypeId: data.dealSubTypeId.trim(),
        dealSubTypeName: data.dealSubTypeName.trim(),
        dealSubTypeDescription: data.dealSubTypeDescription?.trim() || '',
        dealTypeName: data.dealTypeName.trim(),
      }

      const emptyFields = []
      if (!createPayload.dealSubTypeId?.trim()) emptyFields.push('dealSubTypeId')
      if (!createPayload.dealSubTypeName?.trim()) emptyFields.push('dealSubTypeName')
      if (!createPayload.dealTypeName?.trim()) emptyFields.push('dealTypeName')

      if (emptyFields.length > 0) {
        setErrorMessage(
          `Required fields cannot be empty: ${emptyFields.join(', ')}`
        )
        return
      }

      createAction.mutate(createPayload as any, {
        onSuccess: () => {
          setSuccessMessage('Deal Sub-Type created successfully.')
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
            'Failed to create deal sub-type'
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
    name: keyof DealSubTypeFormData,
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
    const loaded: DealSubTypeFormData =
      mode === 'edit' && actionData
        ? {
            dealSubTypeId: (actionData as any).dealSubTypeId ?? '',
            dealSubTypeName: (actionData as any).dealSubTypeName ?? '',
            dealSubTypeDescription: (actionData as any).dealSubTypeDescription ?? '',
            dealTypeName: (actionData as any).dealTypeName ?? '',
          }
        : DEFAULT_VALUES
    reset(loaded, { keepDirty: false })
    clearErrors()
  }, [mode, actionData, reset, clearErrors])

  const onError = (errors: FieldErrors<DealSubTypeFormData>) => {
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
            {mode === 'edit' ? 'Edit Deal Sub-Type' : 'Add Deal Sub-Type'}
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
              'dealSubTypeId',
              getDealSubTypeLabel('CDL_CS_DEAL_SUB_TYPE_ID'),
              'text',
              12
            )}
            {renderTextField(
              'dealSubTypeName',
              getDealSubTypeLabel('CDL_CS_DEAL_SUB_TYPE_NAME'),
              'text',
              12
            )}
            {renderTextField(
              'dealSubTypeDescription',
              getDealSubTypeLabel('CDL_CS_DEAL_SUB_TYPE_DESCRIPTION'),
              'text',
              12,
              false
            )}
            {renderTextField(
              'dealTypeName',
              getDealSubTypeLabel('CDL_CS_DEAL_TYPE_NAME'),
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
