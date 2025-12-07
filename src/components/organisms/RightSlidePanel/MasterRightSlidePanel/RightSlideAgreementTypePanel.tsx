import React, { useState, useCallback } from 'react'
import {
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  TextField,
  Button,
  Drawer,
  Box,
  Alert,
  Snackbar,
  InputAdornment,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { Controller, useForm } from 'react-hook-form'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import {
  useSaveAgreementType,
  useAgreementType,
} from '@/hooks/master/CustomerHook/useAgreementType'
import {
  validateAgreementTypeData,
  sanitizeAgreementTypeData,
  type AgreementTypeFormData,
} from '@/lib/validation/masterValidation/agreementTypeSchemas'
import type {
  CreateAgreementTypeRequest,
  UpdateAgreementTypeRequest,
  AgreementType,
  TaskStatusDTO,
} from '@/services/api/masterApi/Customer/agreementTypeService'
import { getMasterLabel } from '@/constants/mappings/master/masterMapping'
import { alpha, useTheme } from '@mui/material/styles'
import { buildPanelSurfaceTokens } from '../panelTheme'
import { useTaskStatuses } from '@/hooks/master/CustomerHook/useTaskStatus'
import { idService } from '@/services/api/developerIdService'

interface RightSlideAgreementTypePanelProps {
  isOpen: boolean
  onClose: () => void
  onAgreementTypeAdded?: (agreementType: AgreementType) => void
  onAgreementTypeUpdated?: (
    agreementType: AgreementType,
    index: number
  ) => void
  title?: string
  mode?: 'add' | 'edit'
        actionData?: AgreementType | null
  agreementTypeIndex?: number | undefined
  taskStatusOptions?: TaskStatusDTO[]
  taskStatusLoading?: boolean
  taskStatusError?: unknown
}

export const RightSlideAgreementTypePanel: React.FC<
  RightSlideAgreementTypePanelProps
> = ({
  isOpen,
  onClose,
  onAgreementTypeAdded,
  onAgreementTypeUpdated,
  mode = 'add',
  actionData,
  agreementTypeIndex,
  taskStatusOptions: _propTaskStatusOptions = [], // eslint-disable-line @typescript-eslint/no-unused-vars
  taskStatusLoading: propTaskStatusLoading = false,
  taskStatusError: propTaskStatusError = null,
}) => {
  const theme = useTheme()
  const tokens = React.useMemo(() => buildPanelSurfaceTokens(theme), [theme])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [generatedId, setGeneratedId] = useState<string>('')
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false)
  
  // Check if we're in edit mode
  const isEditMode = mode === 'edit'
  const isReadOnly = false // Can be made a prop if needed

        const saveAgreementTypeMutation = useSaveAgreementType()

  // Fetch full agreement type data when in edit mode
  const { data: apiAgreementTypeData } = useAgreementType(
    mode === 'edit' && actionData?.id ? String(actionData.id) : null
  )

  // Fetch task statuses
  const { isLoading: taskStatusesLoading } = useTaskStatuses()
  const taskStatusLoading = propTaskStatusLoading || taskStatusesLoading
  const taskStatusError = propTaskStatusError || null

  // Dynamic labels
  const getAgreementTypeLabelDynamic = useCallback(
    (configId: string): string => {
      return getMasterLabel(configId)
    },
    []
  )

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AgreementTypeFormData & { agreementTypeId?: string }>({
    defaultValues: {
      agreementTypeId: '',
      agreementTypeName: '',
      agreementTypeDescription: '',
      active: true,
      taskStatusDTO: null,
    },
    mode: 'onChange',
  })

  // Initialize agreement type ID from form value
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'agreementTypeId' && value.agreementTypeId) {
        setGeneratedId(value.agreementTypeId)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // Function to generate new agreement type ID
  const handleGenerateNewId = async () => {
    try {
      setIsGeneratingId(true)
      const newIdResponse = idService.generateNewId('MAT')
      setGeneratedId(newIdResponse.id)
      setValue('agreementTypeId', newIdResponse.id, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } catch {
      // Handle error silently
    } finally {
      setIsGeneratingId(false)
    }
  }

  // Track the last reset ID and mode to prevent unnecessary resets
  const lastResetIdRef = React.useRef<string | number | null>(null)
  const lastModeRef = React.useRef<'add' | 'edit' | null>(null)
  const lastIsOpenRef = React.useRef<boolean>(false)
  // Reset form when panel opens/closes or mode/data changes
  React.useEffect(() => {
    if (!isOpen) {
      if (lastIsOpenRef.current) {
        reset({
          agreementTypeId: '',
          agreementTypeName: '',
          agreementTypeDescription: '',
          active: true,
          taskStatusDTO: null,
        })
        setGeneratedId('')
        lastResetIdRef.current = null
        lastModeRef.current = null
      }
      lastIsOpenRef.current = false
      return
    }

    if (!lastIsOpenRef.current) {
      lastIsOpenRef.current = true
    }

    if (mode === 'edit' && taskStatusLoading) {
      return
    }

    const currentId = (apiAgreementTypeData?.id || actionData?.id) ?? null
    const shouldReset =
      lastModeRef.current !== mode ||
      (mode === 'edit' && lastResetIdRef.current !== currentId)

    if (!shouldReset) {
      return
    }

    if (mode === 'edit' && (apiAgreementTypeData || actionData)) {
      const dataToUse = apiAgreementTypeData || actionData
      if (!dataToUse) return

      const agreementTypeId = dataToUse.uuid || `MAT-${dataToUse.id}` || ''
      setGeneratedId(agreementTypeId)

      reset({
                agreementTypeId: agreementTypeId,
        agreementTypeName: dataToUse.agreementTypeName || '',
        agreementTypeDescription: dataToUse.agreementTypeDescription || '',
        active: dataToUse.active ?? true,
        taskStatusDTO: dataToUse.taskStatusDTO?.id
          ? { id: dataToUse.taskStatusDTO.id }
          : null,
      })

      lastResetIdRef.current = dataToUse.id
      lastModeRef.current = mode
    } else if (mode === 'add') {
      reset({
        agreementTypeId: '',
        agreementTypeName: '',
        agreementTypeDescription: '',
        active: true,
        taskStatusDTO: null,
      })
      setGeneratedId('')

      lastResetIdRef.current = null
      lastModeRef.current = mode
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOpen,
    mode,
    apiAgreementTypeData?.id,
    actionData?.id,
    taskStatusLoading,
    reset,
  ])

  const validateAgreementTypeField = React.useCallback(
    (
      fieldName: string,
      value: unknown,
      allValues: AgreementTypeFormData & { agreementTypeId?: string }
    ) => {
      try {
        const requiredFields: Record<string, string> = {
          agreementTypeName: 'Agreement Type Name is required',
          agreementTypeDescription: 'Agreement Type Description is required',
        }

        if (requiredFields[fieldName]) {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return requiredFields[fieldName]
          }
        }

        // Validate agreement type ID for new agreement types (not in edit mode)
        if (fieldName === 'agreementTypeId' && mode === 'add') {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return 'Agreement Type ID is required. Please generate an ID.'
          }
        }

        if (
          (fieldName === 'agreementTypeName' || fieldName === 'agreementTypeDescription') &&
          value &&
          typeof value === 'string' &&
          value.trim() !== ''
        ) {
          const result = validateAgreementTypeData(allValues)
          if (result.success) {
            return true
          } else {
            const fieldError = result.errors?.issues.find(
              (issue) => issue.path.some((p) => String(p) === fieldName)
            )
            return fieldError ? fieldError.message : true
          }
        }

        return true
      } catch {
        return true
      }
    },
    [mode]
  )

    const onSubmit = async (data: AgreementTypeFormData & { agreementTypeId?: string }) => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)

      if (taskStatusLoading) {
        setErrorMessage('Please wait for dropdown options to load before submitting.')
        return
      }

      const validatedData = sanitizeAgreementTypeData(data)
      const currentDataToEdit = apiAgreementTypeData || actionData
      const isEditing = Boolean(mode === 'edit' && currentDataToEdit?.id)

      // Validate agreement type ID for new agreement types
      if (!isEditing && !data.agreementTypeId && !generatedId) {
        setErrorMessage('Please generate an Agreement Type ID before submitting.')
        return
      }

      const isValid = await trigger()
      if (!isValid) {
        const errors = []
        if (!data.agreementTypeName) errors.push('Agreement Type Name is required')
        if (!data.agreementTypeDescription) errors.push('Agreement Type Description is required')
        if (errors.length > 0) {
          setErrorMessage(`Please fill in the required fields: ${errors.join(', ')}`)
        }
        return
      }
      const agreementTypeId = isEditing ? String(currentDataToEdit?.id || '') : undefined

      // Get the generated agreement type ID (UUID) from form data
      const formAgreementTypeId = data.agreementTypeId || generatedId

      let agreementTypeData: CreateAgreementTypeRequest | UpdateAgreementTypeRequest

      if (isEditing) {
        agreementTypeData = {
          id: currentDataToEdit?.id,
          agreementTypeName: validatedData.agreementTypeName,
          agreementTypeDescription: validatedData.agreementTypeDescription,
          active: validatedData.active,
          enabled: true,
          deleted: false,
          ...(formAgreementTypeId && { uuid: formAgreementTypeId }),
          ...(validatedData.taskStatusDTO !== null && validatedData.taskStatusDTO?.id && {
            taskStatusDTO: { id: validatedData.taskStatusDTO.id },
          }),
            } as UpdateAgreementTypeRequest
      } else {
        agreementTypeData = {
          agreementTypeName: validatedData.agreementTypeName,
          agreementTypeDescription: validatedData.agreementTypeDescription,
          active: validatedData.active,
          enabled: true,
          deleted: false,
          ...(formAgreementTypeId && { uuid: formAgreementTypeId }),
          ...(validatedData.taskStatusDTO !== null && validatedData.taskStatusDTO?.id && {
            taskStatusDTO: { id: validatedData.taskStatusDTO.id },
          }),
        } as CreateAgreementTypeRequest
      }

      const result = await saveAgreementTypeMutation.mutateAsync({
        data: agreementTypeData,
        isEditing,
        ...(agreementTypeId && { agreementTypeId }),
      })

      // Update generatedId with the UUID from the response if available
      if (result?.uuid) {
        setGeneratedId(result.uuid)
      }

      setSuccessMessage(
        isEditing
          ? 'Agreement Type updated successfully!'
          : 'Agreement Type added successfully!'
      )

      if (
        mode === 'edit' &&
                onAgreementTypeUpdated &&
        agreementTypeIndex !== null &&
        agreementTypeIndex !== undefined
      ) {
        onAgreementTypeUpdated(result as AgreementType, agreementTypeIndex)
      } else if (onAgreementTypeAdded) {
        onAgreementTypeAdded(result as AgreementType)
      }
      
      // Refresh will be handled by parent component callbacks

      setTimeout(() => {
        reset()
        setGeneratedId('')
        handleClose()
      }, 1500)
    } catch (error: unknown) {
      let errorMessage = 'Failed to add agreement type. Please try again.'
      if (error instanceof Error) {
        if (error.message.includes('validation')) {
          errorMessage = 'Please check your input and try again.'
        } else {
          errorMessage = error.message
        }
      }
      setErrorMessage(errorMessage)
    }
  }


  const handleClose = () => {
    reset()
    setErrorMessage(null)
    setSuccessMessage(null)
    setGeneratedId('')
    onClose()
  }
  
  // Style variables
  const isDark = theme.palette.mode === 'dark'
  const textSecondary = isDark ? '#CBD5E1' : '#6B7280'
  const commonFieldStyles = React.useMemo(() => tokens.input, [tokens])
  const errorFieldStyles = React.useMemo(() => tokens.inputError, [tokens])
  const labelSx = tokens.label
  const valueSx = tokens.value
  
  // View mode styles
  const viewModeStyles = React.useMemo(
    () => ({
      backgroundColor: isDark ? alpha('#1E293B', 0.5) : '#F9FAFB',
      borderColor: isDark ? alpha('#FFFFFF', 0.2) : '#E5E7EB',
    }),
    [isDark]
  )
  
  // Field styles for the ID field
  const fieldStyles = React.useMemo(
    () => ({
      ...commonFieldStyles,
    }),
    [commonFieldStyles]
  )
  
  const labelStyles = React.useMemo(
    () => ({
      ...labelSx,
    }),
    [labelSx]
  )
  
  const valueStyles = React.useMemo(
    () => ({
      ...valueSx,
    }),
    [valueSx]
  )

  const renderTextField = (
    name: 'agreementTypeName' | 'agreementTypeDescription',
    label: string,
    gridSize: number = 6,
    required = false
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        rules={{
          validate: (value, formValues) =>
            validateAgreementTypeField(name, value, formValues),
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label={label}
            fullWidth
            required={required}
            error={!!errors[name]}
            helperText={errors[name]?.message?.toString()}
            InputLabelProps={{ sx: labelSx }}
            InputProps={{ sx: valueSx }}
            sx={errors[name] ? errorFieldStyles : commonFieldStyles}
          />
        )}
      />
    </Grid>
  )

  const renderAgreementTypeIdField = (
    name: 'agreementTypeId',
    label: string,
    gridSize: number = 6,
    required = false
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        rules={{
          required: required ? `${label} is required` : false,
          validate: (value, formValues) =>
            validateAgreementTypeField(name, value, formValues as AgreementTypeFormData & { agreementTypeId?: string }),
        }}
        render={({ field }) => {
          const fieldError = errors[name as keyof typeof errors]
          return (
            <TextField
              {...field}
              fullWidth
              label={label}
              required={required}
              value={field.value || generatedId}
              error={!!fieldError}
              helperText={fieldError?.message?.toString()}
            onChange={(e) => {
              setGeneratedId(e.target.value)
              field.onChange(e)
            }}
            disabled={isReadOnly || isEditMode}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ mr: 0 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handleGenerateNewId}
                    disabled={isGeneratingId || isReadOnly || isEditMode}
                    sx={{
                      color: theme.palette.primary.contrastText,
                      borderRadius: '8px',
                      textTransform: 'none',
                      background: theme.palette.primary.main,
                      '&:hover': {
                        background: theme.palette.primary.dark,
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
              sx: valueStyles,
            }}
              InputLabelProps={{
                sx: {
                  ...labelStyles,
                  ...(!!fieldError && {
                    color: theme.palette.error.main,
                    '&.Mui-focused': { color: theme.palette.error.main },
                    '&.MuiFormLabel-filled': { color: theme.palette.error.main },
                  }),
                },
              }}
              sx={{
                ...fieldStyles,
                ...((isReadOnly || isEditMode) && {
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: viewModeStyles.backgroundColor,
                    color: textSecondary,
                    '& fieldset': {
                      borderColor: viewModeStyles.borderColor,
                    },
                    '&:hover fieldset': {
                      borderColor: viewModeStyles.borderColor,
                    },
                  },
                }),
              }}
            />
          )
        }}
      />
    </Grid>
  )

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={handleClose}
        PaperProps={{
          sx: {
            ...tokens.paper,
            width: 460,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 500,
            fontStyle: 'normal',
            fontSize: '20px',
            lineHeight: '28px',
            letterSpacing: '0.15px',
            verticalAlign: 'middle',
            borderBottom: `1px solid ${tokens.dividerColor}`,
            backgroundColor: tokens.paper.backgroundColor as string,
            color: theme.palette.text.primary,
            pr: 3,
            pl: 3,
          }}
        >
          {mode === 'edit'
            ? `${getAgreementTypeLabelDynamic('CDL_COMMON_UPDATE')} ${getAgreementTypeLabelDynamic('CDL_MAT_NAME')}`
            : `${getAgreementTypeLabelDynamic('CDL_COMMON_ADD')} ${getAgreementTypeLabelDynamic('CDL_MAT_NAME')}`}
          <IconButton
            onClick={onClose}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <CancelOutlinedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <DialogContent
            dividers
            sx={{
              borderColor: tokens.dividerColor,
              backgroundColor: tokens.paper.backgroundColor as string,
            }}
          >
            {taskStatusError && (
              <Alert
                severity="error"
                variant="outlined"
                sx={{
                  mb: 2,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(239, 68, 68, 0.08)'
                      : 'rgba(254, 226, 226, 0.4)',
                  borderColor: alpha(theme.palette.error.main, 0.4),
                  color: theme.palette.error.main,
                }}
              >
                Failed to load dropdown options. Please refresh the page.
              </Alert>
            )}

            <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
              {renderAgreementTypeIdField(
                'agreementTypeId',
                        getAgreementTypeLabelDynamic('CDL_MAT_ID'),
                12,
                true
              )}
              {renderTextField(
                'agreementTypeName',
                getAgreementTypeLabelDynamic('CDL_MAT_NAME'),
                12,
                true
              )}
              {renderTextField(
                'agreementTypeDescription',
                getAgreementTypeLabelDynamic('CDL_MAT_DESCRIPTION'),
                12,
                true
              )}
            </Grid>
          </DialogContent>

          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 2,
              display: 'flex',
              gap: 2,
              borderTop: `1px solid ${tokens.dividerColor}`,
              backgroundColor: alpha(
                theme.palette.background.paper,
                theme.palette.mode === 'dark' ? 0.92 : 0.9
              ),
              backdropFilter: 'blur(10px)',
              zIndex: 10,
            }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleClose}
                  disabled={saveAgreementTypeMutation.isPending || taskStatusLoading}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontStyle: 'normal',
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: 0,
                    borderWidth: '1px',
                    borderColor:
                      theme.palette.mode === 'dark'
                        ? theme.palette.primary.main
                        : undefined,
                  }}
                >
                  {getAgreementTypeLabelDynamic('CDL_COMMON_CANCEL')}
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  type="submit"
                  disabled={saveAgreementTypeMutation.isPending || taskStatusLoading}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontStyle: 'normal',
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: 0,
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor:
                      theme.palette.mode === 'dark'
                        ? theme.palette.primary.main
                        : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                      borderColor:
                        theme.palette.mode === 'dark'
                          ? theme.palette.primary.main
                          : 'transparent',
                    },
                    '&:disabled': {
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.grey[600], 0.5)
                          : theme.palette.grey[300],
                      borderColor:
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.primary.main, 0.5)
                          : 'transparent',
                      color: theme.palette.text.disabled,
                    },
                  }}
                >
                    {saveAgreementTypeMutation.isPending
                    ? mode === 'edit'
                      ? getAgreementTypeLabelDynamic('CDL_COMMON_UPDATING')
                      : getAgreementTypeLabelDynamic('CDL_COMMON_ADDING')
                    : mode === 'edit'
                      ? getAgreementTypeLabelDynamic('CDL_COMMON_UPDATE')
                      : getAgreementTypeLabelDynamic('CDL_COMMON_ADD')}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>

        <Snackbar
          open={!!errorMessage}
          autoHideDuration={6000}
          onClose={() => setErrorMessage(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setErrorMessage(null)}
            severity="error"
            sx={{ width: '100%' }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSuccessMessage(null)}
            severity="success"
            sx={{ width: '100%' }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </Drawer>
    </LocalizationProvider>
  )
}
