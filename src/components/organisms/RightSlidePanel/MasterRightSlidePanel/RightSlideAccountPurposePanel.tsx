import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  CircularProgress,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material'
import { FormError } from '@/components/atoms/FormError'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { Controller, useForm } from 'react-hook-form'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { alpha, useTheme } from '@mui/material/styles'
import {
  useSaveAccountPurpose,
  useAccountPurpose,
} from '@/hooks/master/CustomerHook/useAccountPurpose'
import {
  validateAccountPurposeData,
  sanitizeAccountPurposeData,
  type AccountPurposeFormData,
} from '@/lib/validation/masterValidation/accountPurposeSchemas'
import type {
  CreateAccountPurposeRequest,
  UpdateAccountPurposeRequest,
  AccountPurpose,
} from '@/services/api/masterApi/Customer/accountPurposeService'
import { getMasterLabel } from '@/constants/mappings/master/masterMapping'
import { buildPanelSurfaceTokens } from '../panelTheme'
import { idService } from '@/services/api/developerIdService'
import { useApplicationSettings } from '@/hooks/useApplicationSettings'

interface RightSlideAccountPurposePanelProps {
  isOpen: boolean
  onClose: () => void
  onAccountPurposeAdded?: (accountPurpose: AccountPurpose) => void
  onAccountPurposeUpdated?: (
    accountPurpose: AccountPurpose,
    index: number
  ) => void
  title?: string
  mode?: 'add' | 'edit'
            actionData?: AccountPurpose | null
  accountPurposeIndex?: number | null | undefined | string | number
}

export const RightSlideAccountPurposePanel: React.FC<
  RightSlideAccountPurposePanelProps
> = ({
  isOpen,
  onClose,
  onAccountPurposeAdded,
  onAccountPurposeUpdated,
  mode = 'add',
  actionData,
  accountPurposeIndex,
}) => {
  const theme = useTheme()
  const tokens = useMemo(() => buildPanelSurfaceTokens(theme), [theme])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [generatedId, setGeneratedId] = useState<string>('')
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false)
  
  const isEditMode = mode === 'edit'
  const isReadOnly = false

    const saveAccountPurposeMutation = useSaveAccountPurpose()

  // Fetch full account purpose data when in edit mode
  const { data: apiAccountPurposeData } = useAccountPurpose(
    isEditMode && actionData?.id ? String(actionData.id) : null
  )

  // Fetch criticality options from application settings
  // FIXED: React Query handles caching, no need for manual refetch prevention
  const {
    data: criticalityOptions = [],
    loading: criticalityLoading,
    error: criticalityError,
  } = useApplicationSettings('CRITICALITY')

  // Memoized label getter
  const getAccountPurposeLabel = useCallback(
    (configId: string): string => {
      return getMasterLabel(configId)
    },
    []
  )

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<AccountPurposeFormData & { accountPurposeId?: string }>({
    defaultValues: {
      accountPurposeId: '',
      accountPurposeCode: '',
      accountPurposeName: '',
      active: true,
      criticalityDTO: null,
      taskStatusDTO: null,
    },
    mode: 'onChange',
  })

  // Track form reset state to prevent unnecessary resets
  const lastResetIdRef = useRef<string | number | null>(null)
  const lastModeRef = useRef<'add' | 'edit' | null>(null)
  const lastIsOpenRef = useRef<boolean>(false)

  // Reset form when panel opens/closes or mode/data changes
  useEffect(() => {
    if (!isOpen) {
      if (lastIsOpenRef.current) {
        reset({
          accountPurposeId: '',
          accountPurposeCode: '',
          accountPurposeName: '',
          active: true,
          criticalityDTO: null,
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

    const currentId =
      (apiAccountPurposeData?.id || actionData?.id) ?? null
    const shouldReset =
      lastModeRef.current !== mode ||
      (mode === 'edit' && lastResetIdRef.current !== currentId) ||
      (mode === 'edit' && !lastResetIdRef.current && currentId)

    if (mode === 'edit') {
      if (shouldReset && (apiAccountPurposeData || actionData)) {
        const dataToUse = apiAccountPurposeData || actionData
        if (!dataToUse) return

        const accountPurposeId =
          dataToUse.uuid || `AP-${dataToUse.id}` || ''
        setGeneratedId(accountPurposeId)

        reset({
          accountPurposeId: accountPurposeId,
          accountPurposeCode: dataToUse.accountPurposeCode || '',
          accountPurposeName: dataToUse.accountPurposeName || '',
          active: dataToUse.active ?? true,
          criticalityDTO: dataToUse.criticalityDTO?.id
            ? { id: dataToUse.criticalityDTO.id }
            : null,
          taskStatusDTO: dataToUse.taskStatusDTO?.id
            ? { id: dataToUse.taskStatusDTO.id }
            : null,
        })

        lastResetIdRef.current = dataToUse.id
        lastModeRef.current = mode
      } else if (!shouldReset) {
        return
      }
    } else if (mode === 'add') {
      reset({
        accountPurposeId: '',
        accountPurposeCode: '',
        accountPurposeName: '',
        active: true,
        criticalityDTO: null,
        taskStatusDTO: null,
      })
      setGeneratedId('')
      lastResetIdRef.current = null
      lastModeRef.current = mode
    }
  }, [isOpen, mode, apiAccountPurposeData, actionData, reset])

  // Generate new ID handler
  const handleGenerateNewId = useCallback(async () => {
    try {
      setIsGeneratingId(true)
      const newIdResponse = idService.generateNewId('AP')
      setGeneratedId(newIdResponse.id)
      setValue('accountPurposeId', newIdResponse.id, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to generate ID'
      setErrorMessage(`Failed to generate ID: ${errorMsg}. Please try again.`)
    } finally {
      setIsGeneratingId(false)
    }
  }, [setValue])

  // Field validation
  const validateAccountPurposeField = useCallback(
    (
      fieldName: keyof AccountPurposeFormData | 'accountPurposeId',
      value: unknown,
      allValues: AccountPurposeFormData & { accountPurposeId?: string }
    ): string | boolean => {
      try {
        const requiredFields: Record<string, string> = {
          accountPurposeCode: 'Account Purpose Code is required',
          accountPurposeName: 'Account Purpose Name is required',
        }

        if (requiredFields[fieldName]) {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return requiredFields[fieldName]
          }
        }

        // Validate account purpose ID for new account purposes
        if (fieldName === 'accountPurposeId' && mode === 'add') {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return 'Account Purpose ID is required. Please generate an ID.'
          }
        }

        // Validate field length and format using schema
        if (
          (fieldName === 'accountPurposeCode' ||
            fieldName === 'accountPurposeName') &&
          value &&
          typeof value === 'string' &&
          value.trim() !== ''
        ) {
          const result = validateAccountPurposeData(allValues)
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
        // Silent fail for validation errors
        return true
      }
    },
    [mode]
  )

  // Form submission handler
  const onSubmit = useCallback(
    async (data: AccountPurposeFormData & { accountPurposeId?: string }) => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)

        // Wait for criticality options to load
        if (criticalityLoading) {
          setErrorMessage(
            'Please wait for dropdown options to load before submitting.'
          )
        return
      }

      const validatedData = sanitizeAccountPurposeData(data)
      const currentDataToEdit = apiAccountPurposeData || actionData
      const isEditing = Boolean(mode === 'edit' && currentDataToEdit?.id)

        // Validate account purpose ID for new account purposes
      if (!isEditing && !data.accountPurposeId && !generatedId) {
          setErrorMessage(
            'Please generate an Account Purpose ID before submitting.'
          )
        return
      }

        // Trigger validation
      const isValid = await trigger()
      if (!isValid) {
          const validationErrors: string[] = []
          if (!data.accountPurposeCode?.trim()) {
            validationErrors.push('Account Purpose Code is required')
          }
          if (!data.accountPurposeName?.trim()) {
            validationErrors.push('Account Purpose Name is required')
          }
          if (validationErrors.length > 0) {
            setErrorMessage(
              `Please fill in the required fields: ${validationErrors.join(', ')}`
            )
        }
        return
      }

        const accountPurposeId = isEditing
          ? String(currentDataToEdit?.id || '')
          : undefined
      const formAccountPurposeId = data.accountPurposeId || generatedId

        // Build request payload
        const basePayload = {
          accountPurposeCode: validatedData.accountPurposeCode,
          accountPurposeName: validatedData.accountPurposeName,
          active: validatedData.active,
          enabled: true,
          deleted: false,
          ...(formAccountPurposeId && { uuid: formAccountPurposeId }),
          ...(validatedData.criticalityDTO && {
            criticalityDTO: { id: validatedData.criticalityDTO.id },
          }),
          ...(validatedData.taskStatusDTO &&
            validatedData.taskStatusDTO.id && {
            taskStatusDTO: { id: validatedData.taskStatusDTO.id },
          }),
        }

        const requestPayload: CreateAccountPurposeRequest | UpdateAccountPurposeRequest =
          isEditing
            ? {
                ...basePayload,
                id: currentDataToEdit?.id,
              }
            : basePayload

        // Submit mutation
      const result = await saveAccountPurposeMutation.mutateAsync({
          data: requestPayload,
        isEditing,
        ...(accountPurposeId && { accountPurposeId }),
      })

        // Update generatedId with UUID from response
      if (result?.uuid) {
        setGeneratedId(result.uuid)
      }

      setSuccessMessage(
        isEditing
          ? 'Account Purpose updated successfully!'
          : 'Account Purpose added successfully!'
      )

        // Call appropriate callback
      if (
        mode === 'edit' &&
        onAccountPurposeUpdated &&
        accountPurposeIndex !== null &&
        accountPurposeIndex !== undefined
      ) {
        onAccountPurposeUpdated(result as AccountPurpose, Number(accountPurposeIndex))
      } else if (onAccountPurposeAdded) {
        onAccountPurposeAdded(result as AccountPurpose)
      }
      
        // Close panel after delay
      setTimeout(() => {
        reset()
        setGeneratedId('')
          onClose()
      }, 1500)
    } catch (error: unknown) {
        let errorMsg = 'Failed to save account purpose. Please try again.'
      if (error instanceof Error) {
        if (error.message.includes('validation')) {
            errorMsg = 'Please check your input and try again.'
        } else {
            errorMsg = error.message || errorMsg
          }
        }
        setErrorMessage(errorMsg)
      }
    },
    [
      mode,
      apiAccountPurposeData,
      actionData,
      generatedId,
      criticalityLoading,
      trigger,
      saveAccountPurposeMutation,
      accountPurposeIndex,
      onAccountPurposeAdded,
      onAccountPurposeUpdated,
      reset,
      onClose,
    ]
  )

  // Close handler
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
  
  // Select styles matching reference code
  const selectStyles = useMemo(
    () => ({
      height: '46px',
      borderRadius: '8px',
      backgroundColor: isDark
        ? alpha('#1E293B', 0.5)
        : theme.palette.background.paper,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: isDark
          ? alpha('#FFFFFF', 0.3)
          : alpha('#000000', 0.23),
        borderWidth: '1px',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: isDark
          ? alpha('#FFFFFF', 0.5)
          : alpha('#000000', 0.87),
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
      '& .MuiSelect-icon': {
        color: isDark ? '#FFFFFF' : theme.palette.text.primary,
      },
      '& .MuiInputBase-input': {
        color: isDark ? '#FFFFFF' : theme.palette.text.primary,
      },
    }),
    [theme, isDark]
  )

  const viewModeStyles = useMemo(
    () => ({
      backgroundColor: isDark ? alpha('#1E293B', 0.5) : '#F9FAFB',
      borderColor: isDark ? alpha('#FFFFFF', 0.2) : '#E5E7EB',
    }),
    [isDark]
  )

  // Render text field helper
  const renderTextField = useCallback(
    (
    name: 'accountPurposeCode' | 'accountPurposeName',
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
            validateAccountPurposeField(name, value, formValues),
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
    [
      control,
      errors,
      labelSx,
      valueSx,
      errorFieldStyles,
      commonFieldStyles,
      validateAccountPurposeField,
    ]
  )

  // Render account purpose ID field helper
  const renderAccountPurposeIdField = useCallback(
    (
    name: 'accountPurposeId',
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
              validateAccountPurposeField(
                name,
                value,
                formValues as AccountPurposeFormData & {
                  accountPurposeId?: string
                }
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
                        disabled={
                          isGeneratingId || isReadOnly || isEditMode
                        }
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
                  sx: valueSx,
            }}
              InputLabelProps={{
                sx: {
                    ...labelSx,
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
                  ...commonFieldStyles,
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
      valueSx,
      labelSx,
      commonFieldStyles,
      viewModeStyles,
      textSecondary,
      validateAccountPurposeField,
    ]
  )

  // Render select field for criticality
  const renderSelectField = useCallback(
    (
      name: 'criticalityDTO',
      label: string,
      options: typeof criticalityOptions,
      gridSize: number = 6,
      required = false,
      loading = false
    ) => (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          rules={{
            validate: (value) => {
              if (required) {
                if (
                  !value ||
                  (typeof value === 'object' &&
                    value !== null &&
                    !('id' in value)) ||
                  (typeof value === 'object' &&
                    value !== null &&
                    'id' in value &&
                    (value as { id?: number }).id === undefined)
                ) {
                  return `${label} is required`
                }
              }
              return true
            },
          }}
          defaultValue={null}
          render={({ field }) => {
            const fieldValue =
              typeof field.value === 'object' &&
              field.value !== null &&
              'id' in field.value
                ? String(field.value.id)
                : field.value
                  ? String(field.value)
                  : ''

            return (
              <FormControl
                fullWidth
                error={!!errors[name]}
                required={required}
                disabled={loading || isReadOnly}
              >
                <InputLabel sx={labelSx}>
                  {loading
                    ? getAccountPurposeLabel('CDL_COMMON_LOADING')
                    : label}
                </InputLabel>
                <Select
                  {...field}
                  value={fieldValue}
                  onChange={(e) => {
                    const selectedValue = e.target.value
                    const selectedOption = options.find(
                      (opt) => String(opt.id) === String(selectedValue)
                    )
                    field.onChange(
                      selectedOption ? { id: selectedOption.id } : null
                    )
                  }}
                  input={
                    <OutlinedInput
                      label={
                        loading
                          ? getAccountPurposeLabel('CDL_COMMON_LOADING')
                          : label
                      }
                    />
                  }
                  label={
                    loading
                      ? getAccountPurposeLabel('CDL_COMMON_LOADING')
                      : label
                  }
                  sx={{ ...selectStyles, ...valueSx }}
                  IconComponent={KeyboardArrowDownIcon}
                  disabled={loading || isReadOnly}
                >
                  {loading ? (
                    <MenuItem disabled>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      {getAccountPurposeLabel('CDL_COMMON_LOADING')}
                    </MenuItem>
                  ) : options && options.length > 0 ? (
                    options.map((option) => (
                      <MenuItem key={option.id} value={String(option.id)}>
                        {option.displayName || option.settingValue || ''}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      No {label.toLowerCase()} available
                    </MenuItem>
                  )}
                </Select>
                {errors[name] && (
                  <FormError
                    error={(errors[name]?.message as string) || ''}
                    touched={true}
                  />
                )}
              </FormControl>
            )
          }}
        />
      </Grid>
    ),
    [
      control,
      errors,
      labelSx,
      selectStyles,
      valueSx,
      isReadOnly,
      getAccountPurposeLabel,
    ]
  )

  const isLoading =
    saveAccountPurposeMutation.isPending || criticalityLoading

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
            ? `${getAccountPurposeLabel('CDL_COMMON_UPDATE')} ${getAccountPurposeLabel('CDL_MAP_NAME')}`
            : `${getAccountPurposeLabel('CDL_COMMON_ADD')} ${getAccountPurposeLabel('CDL_MAP_NAME')}`}
          <IconButton
            onClick={handleClose}
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
            {criticalityError && (
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
              {renderAccountPurposeIdField(
                'accountPurposeId',
                getAccountPurposeLabel('CDL_MAP_ID'),
                12,
                true
              )}
              {renderTextField(
                'accountPurposeCode',
                getAccountPurposeLabel('CDL_MAP_CODE'),
                12,
                true
              )}
              {renderTextField(
                'accountPurposeName',
                getAccountPurposeLabel('CDL_MAP_NAME'),
                12,
                true
              )}
              {renderSelectField(
                'criticalityDTO',
                getAccountPurposeLabel('CDL_MAP_CRITICALITY'),
                criticalityOptions,
                12,
                false,
                criticalityLoading
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
                  disabled={isLoading}
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
                  {getAccountPurposeLabel('CDL_COMMON_CANCEL')}
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  type="submit"
                  disabled={isLoading}
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
                  {saveAccountPurposeMutation.isPending
                    ? mode === 'edit'
                      ? getAccountPurposeLabel('CDL_COMMON_UPDATING')
                      : getAccountPurposeLabel('CDL_COMMON_ADDING')
                    : mode === 'edit'
                      ? getAccountPurposeLabel('CDL_COMMON_UPDATE')
                      : getAccountPurposeLabel('CDL_COMMON_ADD')}
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
