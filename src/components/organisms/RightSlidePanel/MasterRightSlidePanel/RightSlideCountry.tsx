import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
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
import { Refresh as RefreshIcon } from '@mui/icons-material'
import { Controller, useForm } from 'react-hook-form'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import {
  useSaveCountry,
  useCountry,
} from '@/hooks/master/CustomerHook/useCountry'
import {
  validateCountryData as validateCountrySchema,
  sanitizeCountryData,
  type CountryFormData,
} from '@/lib/validation/masterValidation/countrySchemas'
import type {
  CreateCountryRequest,
  UpdateCountryRequest,
  Country,
  TaskStatusDTO,
} from '@/services/api/masterApi/Customer/countryService'
import { alpha, useTheme } from '@mui/material/styles'
import { buildPanelSurfaceTokens } from '../panelTheme'
import { useTaskStatuses } from '@/hooks/master/CustomerHook/useTaskStatus'
import { idService } from '@/services/api/developerIdService'
import { useCountryLabelsWithCache } from '@/hooks/master/CustomerHook/useCountryLabelsWithCache'

interface RightSlideCountryPanelProps {
  isOpen: boolean
  onClose: () => void
  onCountryAdded?: (country: Country) => void
  onCountryUpdated?: (country: Country, index: number) => void
  title?: string
  mode?: 'add' | 'edit'
  actionData?: Country | null
  countryIndex?: number | undefined
  taskStatusOptions?: TaskStatusDTO[]
  taskStatusLoading?: boolean
  taskStatusError?: unknown
}

export const RightSlideCountryPanel: React.FC<RightSlideCountryPanelProps> = ({
  isOpen,
  onClose,
  onCountryAdded,
  onCountryUpdated,
  mode = 'add',
  actionData,
  countryIndex,
  taskStatusOptions: _propTaskStatusOptions = [], // eslint-disable-line @typescript-eslint/no-unused-vars
  taskStatusLoading: propTaskStatusLoading = false,
  taskStatusError: propTaskStatusError = null,
}) => {
  const theme = useTheme()
  const tokens = useMemo(() => buildPanelSurfaceTokens(theme), [theme])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [generatedId, setGeneratedId] = useState<string>('')
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false)

  const isEditMode = mode === 'edit'
  const isReadOnly = false

  const saveCountryMutation = useSaveCountry()

  // Fetch full country data when in edit mode
  const { data: apiCountryData } = useCountry(
    mode === 'edit' && actionData?.id ? String(actionData.id) : null
  )

  // Fetch task statuses
  const { isLoading: taskStatusesLoading } = useTaskStatuses()
  const taskStatusLoading = propTaskStatusLoading || taskStatusesLoading
  const taskStatusError = propTaskStatusError || null

  // Dynamic labels
  const { getCountryLabelDynamic } = useCountryLabelsWithCache()

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CountryFormData & { countryId?: string }>({
    defaultValues: {
      countryId: '',
      description: '',
      active: true,
      taskStatusDTO: null,
    },
    mode: 'onChange',
  })

  // Initialize country ID from form value
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'countryId' && value.countryId) {
        setGeneratedId(value.countryId)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // Function to generate new country ID
  const handleGenerateNewId = useCallback(async () => {
    try {
      setIsGeneratingId(true)
      const newIdResponse = idService.generateNewId('CNT')
      setGeneratedId(newIdResponse.id)
      setValue('countryId', newIdResponse.id, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } catch (error) {
      setErrorMessage(
        'Failed to generate Country ID. Please try again or enter manually.'
      )
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error generating ID:', error)
      }
      // Error is used in console.error above
      void error
    } finally {
      setIsGeneratingId(false)
    }
  }, [setValue])

  // Track the last reset ID and mode to prevent unnecessary resets
  const lastResetIdRef = useRef<string | number | null>(null)
  const lastModeRef = useRef<'add' | 'edit' | null>(null)
  const lastIsOpenRef = useRef<boolean>(false)

  // Reset form when panel opens/closes or mode/data changes
  useEffect(() => {
    if (!isOpen) {
      if (lastIsOpenRef.current) {
        reset({
          countryId: '',
          description: '',
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

    const currentId = (apiCountryData?.id || actionData?.id) ?? null
    const shouldReset =
      lastModeRef.current !== mode ||
      (mode === 'edit' && lastResetIdRef.current !== currentId) ||
      (mode === 'edit' && !lastResetIdRef.current && currentId)

    if (mode === 'edit') {
      // Wait for API data to load if we're in edit mode, but use actionData as fallback
      if (taskStatusLoading && !actionData) {
        return
      }

      if (shouldReset && (apiCountryData || actionData)) {
        const dataToUse = apiCountryData || actionData
        if (!dataToUse) return

        const countryId = dataToUse.uuid || `CNT-${dataToUse.id}` || ''
        setGeneratedId(countryId)

        reset({
          countryId: countryId,
          description: dataToUse.description || '',
          active: dataToUse.active ?? true,
          taskStatusDTO: dataToUse.taskStatusDTO || null,
        })

        lastResetIdRef.current = dataToUse.id
        lastModeRef.current = mode
      } else if (!shouldReset) {
        return
      }
    } else if (mode === 'add') {
      reset({
        countryId: '',
        description: '',
        active: true,
        taskStatusDTO: null,
      })
      setGeneratedId('')

      lastResetIdRef.current = null
      lastModeRef.current = mode
    }
  }, [
    isOpen,
    mode,
    apiCountryData,
    actionData,
    taskStatusLoading,
    reset,
  ])

  const validateCountryField = useCallback(
    (
      fieldName: keyof CountryFormData | 'countryId',
      value: unknown,
      allValues: CountryFormData & { countryId?: string }
    ): string | boolean => {
      try {
        // Validate country ID for new countries (not in edit mode)
        if (fieldName === 'countryId' && mode === 'add') {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return 'Country ID is required. Please generate an ID.'
          }
        }

        // Validate description field
        if (fieldName === 'description') {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return 'Description is required'
          }
          if (typeof value === 'string' && value.length > 500) {
            return 'Description must be 500 characters or less'
          }
        }

        // Run full schema validation for description
        if (
          fieldName === 'description' &&
          value &&
          typeof value === 'string' &&
          value.trim() !== ''
        ) {
          const result = validateCountrySchema(allValues)
          if (result.success) {
            return true
          } else {
            const fieldError = result.errors?.issues.find((issue) =>
              issue.path.some((p) => String(p) === fieldName)
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

  const onSubmit = useCallback(
    async (data: CountryFormData & { countryId?: string }) => {
      try {
        setErrorMessage(null)
        setSuccessMessage(null)

        if (taskStatusLoading) {
          setErrorMessage(
            'Please wait for dropdown options to load before submitting.'
          )
          return
        }

        const validatedData = sanitizeCountryData(data)
        const currentDataToEdit = apiCountryData || actionData
        const isEditing = Boolean(mode === 'edit' && currentDataToEdit?.id)

        // Validate country ID for new countries
        if (!isEditing && !data.countryId && !generatedId) {
          setErrorMessage('Please generate a Country ID before submitting.')
          return
        }

        // Validate required fields
        if (!validatedData.description || validatedData.description.trim() === '') {
          setErrorMessage('Description is required.')
          return
        }

        const isValid = await trigger()
        if (!isValid) {
          const validationErrors: string[] = []
          if (!data.description || data.description.trim() === '') {
            validationErrors.push('Description is required')
          }
          if (validationErrors.length > 0) {
            setErrorMessage(
              `Please fill in the required fields: ${validationErrors.join(', ')}`
            )
          }
          return
        }

        const countryId = isEditing
          ? String(currentDataToEdit?.id || '')
          : undefined

        // Get the generated country ID (UUID) from form data
        const formCountryId = data.countryId || generatedId

        let countryData: CreateCountryRequest | UpdateCountryRequest

        if (isEditing) {
          countryData = {
            id: currentDataToEdit?.id,
            description: validatedData.description,
            active: validatedData.active,
            enabled: true,
            deleted: false,
            taskStatusDTO: validatedData.taskStatusDTO,
            ...(formCountryId && { uuid: formCountryId }),
          } as UpdateCountryRequest
        } else {
          countryData = {
            description: validatedData.description,
            active: validatedData.active,
            enabled: true,
            deleted: false,
            taskStatusDTO: validatedData.taskStatusDTO,
            ...(formCountryId && { uuid: formCountryId }),
          } as CreateCountryRequest
        }

        const result = await saveCountryMutation.mutateAsync({
          data: countryData,
          isEditing,
          ...(countryId && { countryId }),
        })

        // Update generatedId with the UUID from the response if available
        if (result?.uuid) {
          setGeneratedId(result.uuid)
        }

        setSuccessMessage(
          isEditing
            ? 'Country updated successfully!'
            : 'Country added successfully!'
        )

        if (
          mode === 'edit' &&
          onCountryUpdated &&
          countryIndex !== null &&
          countryIndex !== undefined
        ) {
          onCountryUpdated(result as Country, countryIndex)
        } else if (onCountryAdded) {
          onCountryAdded(result as Country)
        }

        // Auto-close after success
        setTimeout(() => {
          reset()
          setGeneratedId('')
          onClose()
        }, 1500)
      } catch (error: unknown) {
        let errorMessage = 'Failed to save country. Please try again.'
        if (error instanceof Error) {
          if (error.message.includes('validation')) {
            errorMessage = 'Please check your input and try again.'
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.'
          } else {
            errorMessage = error.message || errorMessage
          }
        }
        setErrorMessage(errorMessage)
      }
    },
    [
      taskStatusLoading,
      apiCountryData,
      actionData,
      mode,
      generatedId,
      trigger,
      saveCountryMutation,
      countryIndex,
      onCountryUpdated,
      onCountryAdded,
      reset,
      onClose,
    ]
  )

  const handleClose = useCallback(() => {
    reset()
    setErrorMessage(null)
    setSuccessMessage(null)
    setGeneratedId('')
    onClose()
  }, [reset, onClose])

  // Style variables
  const isDark = theme.palette.mode === 'dark'
  const textSecondary = isDark ? '#CBD5E1' : '#6B7280'
  const commonFieldStyles = useMemo(() => tokens.input, [tokens])
  const errorFieldStyles = useMemo(() => tokens.inputError, [tokens])
  const labelSx = tokens.label
  const valueSx = tokens.value

  // View mode styles
  const viewModeStyles = useMemo(
    () => ({
      backgroundColor: isDark ? alpha('#1E293B', 0.5) : '#F9FAFB',
      borderColor: isDark ? alpha('#FFFFFF', 0.2) : '#E5E7EB',
    }),
    [isDark]
  )

  // Field styles for the ID field
  const fieldStyles = useMemo(
    () => ({
      ...commonFieldStyles,
    }),
    [commonFieldStyles]
  )

  const labelStyles = useMemo(
    () => ({
      ...labelSx,
    }),
    [labelSx]
  )

  const valueStyles = useMemo(
    () => ({
      ...valueSx,
    }),
    [valueSx]
  )

  const renderTextField = useCallback(
    (
      name: 'description',
      label: string,
      gridSize: number = 6,
      required = false
    ) => (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          rules={{
            required: required ? `${label} is required` : false,
            validate: (value, formValues) =>
              validateCountryField(name, value, formValues),
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
    ),
    [control, errors, labelSx, valueSx, errorFieldStyles, commonFieldStyles, validateCountryField]
  )

  const renderCountryIdField = useCallback(
    (
      name: 'countryId',
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
              validateCountryField(
                name,
                value,
                formValues as CountryFormData & { countryId?: string }
              ),
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
                      '&.MuiFormLabel-filled': {
                        color: theme.palette.error.main,
                      },
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
    ),
    [
      control,
      errors,
      generatedId,
      isReadOnly,
      isEditMode,
      handleGenerateNewId,
      isGeneratingId,
      theme,
      valueStyles,
      labelStyles,
      fieldStyles,
      viewModeStyles,
      textSecondary,
      validateCountryField,
    ]
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
            ? `${getCountryLabelDynamic('CDL_COMMON_UPDATE')} ${getCountryLabelDynamic('CDL_MCNT_NAME')}`
            : `${getCountryLabelDynamic('CDL_COMMON_ADD')} ${getCountryLabelDynamic('CDL_MCNT_NAME')}`}
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
              {renderCountryIdField(
                'countryId',
                getCountryLabelDynamic('CDL_MCNT_ID'),
                12,
                true
              )}

              {renderTextField(
                'description',
                getCountryLabelDynamic('CDL_MCNT_DESCRIPTION'),
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
                  disabled={saveCountryMutation.isPending || taskStatusLoading}
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
                  {getCountryLabelDynamic('CDL_COMMON_CANCEL')}
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  type="submit"
                  disabled={saveCountryMutation.isPending || taskStatusLoading}
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
                  {saveCountryMutation.isPending
                    ? mode === 'edit'
                      ? getCountryLabelDynamic('CDL_COMMON_UPDATING')
                      : getCountryLabelDynamic('CDL_COMMON_ADDING')
                    : mode === 'edit'
                      ? getCountryLabelDynamic('CDL_COMMON_UPDATE')
                      : getCountryLabelDynamic('CDL_COMMON_ADD')}
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
