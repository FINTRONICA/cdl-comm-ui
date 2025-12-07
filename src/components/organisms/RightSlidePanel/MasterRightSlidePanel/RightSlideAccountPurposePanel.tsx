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
  CriticalityDTO,
} from '@/services/api/masterApi/Customer/accountPurposeService'
import { getMasterLabel } from '@/constants/mappings/master/masterMapping'
import { alpha, useTheme } from '@mui/material/styles'
import { buildPanelSurfaceTokens } from '../panelTheme'
import { useTaskStatuses } from '@/hooks/master/CustomerHook/useTaskStatus'
import { idService } from '@/services/api/developerIdService'
import { useApplicationSettings } from '@/hooks/useApplicationSettings'
import { Autocomplete } from '@mui/material'

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
  criticalityOptions?: CriticalityDTO[]
  criticalityLoading?: boolean
  criticalityError?: unknown
  taskStatusLoading?: boolean
  // taskStatusError kept for potential future use
  taskStatusError?: unknown
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
  criticalityOptions: _propCriticalityOptions = [], // eslint-disable-line @typescript-eslint/no-unused-vars
  criticalityLoading: propCriticalityLoading = false,
  criticalityError: propCriticalityError = null,
  taskStatusLoading: propTaskStatusLoading = false,
  taskStatusError: _propTaskStatusError = null, // eslint-disable-line @typescript-eslint/no-unused-vars
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

    const saveAccountPurposeMutation = useSaveAccountPurpose()

  // Fetch full product program data when in edit mode
  const { data: apiAccountPurposeData } = useAccountPurpose(
    mode === 'edit' && actionData?.id ? String(actionData.id) : null
  )

  // Fetch task statuses (optional field, not blocking)
  const { isLoading: taskStatusesLoading } = useTaskStatuses()
  const taskStatusLoading = propTaskStatusLoading ?? taskStatusesLoading
  // Note: taskStatusError is kept for potential future use but not currently displayed

  // Fetch criticality options from application settings
  const { data: criticalityOptions = [], loading: criticalityLoading } = useApplicationSettings('CRITICALITY')
  const effectiveCriticalityLoading = propCriticalityLoading || criticalityLoading
  const effectiveCriticalityError = propCriticalityError || null

  // Dynamic labels
  const getAccountPurposeLabelDynamic = useCallback(
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

  // Initialize business segment ID from form value
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'accountPurposeId' && value.accountPurposeId) {
        setGeneratedId(value.accountPurposeId as string   )
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // Function to generate new account purpose ID
  const handleGenerateNewId = async () => {
    try {
      setIsGeneratingId(true)
      const newIdResponse = idService.generateNewId('AP')
      setGeneratedId(newIdResponse.id)
      setValue('accountPurposeId', newIdResponse.id, {
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

    const currentId = (apiAccountPurposeData?.id || actionData?.id) ?? null
    const shouldReset =
      lastModeRef.current !== mode ||
      (mode === 'edit' && lastResetIdRef.current !== currentId) ||
      (mode === 'edit' && !lastResetIdRef.current && currentId)

    if (mode === 'edit') {
      // Wait for API data to load if we're in edit mode, but use actionData as fallback
      // Note: taskStatus is optional and not blocking form submission

      if (shouldReset && (apiAccountPurposeData || actionData)) {
        const dataToUse = apiAccountPurposeData || actionData
        if (!dataToUse) return

        const accountPurposeId = dataToUse.uuid || `AP-${dataToUse.id}` || ''
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
  }, [
    isOpen,
    mode,
    apiAccountPurposeData,
    actionData,
    taskStatusLoading,
    reset,
  ])

  const validateAccountPurposeField = React.useCallback(
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

        // Validate account purpose ID for new account purposes (not in edit mode)
        if (fieldName === 'accountPurposeId' && mode === 'add') {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return 'Account Purpose ID is required. Please generate an ID.'
          }
        }

        if (
          (fieldName === 'accountPurposeCode' || fieldName === 'accountPurposeName') &&
          value &&
          typeof value === 'string' &&
          value.trim() !== ''
        ) {
          const result = validateAccountPurposeData(allValues)
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

  const onSubmit = async (data: AccountPurposeFormData & { accountPurposeId?: string }) => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)

      // Note: Removed taskStatusLoading check as taskStatus is optional
      if (effectiveCriticalityLoading) {
        setErrorMessage('Please wait for dropdown options to load before submitting.')
        return
      }

      const validatedData = sanitizeAccountPurposeData(data)
      const currentDataToEdit = apiAccountPurposeData || actionData
      const isEditing = Boolean(mode === 'edit' && currentDataToEdit?.id)

      // Validate account purpose ID for new account purposes
      if (!isEditing && !data.accountPurposeId && !generatedId) {
        setErrorMessage('Please generate an Account Purpose ID before submitting.')
        return
      }

      const isValid = await trigger()
      if (!isValid) {
        const errors = []
        if (!data.accountPurposeCode) errors.push('Account Purpose Code is required')
        if (!data.accountPurposeName) errors.push('Account Purpose Name is required')
        if (errors.length > 0) {
          setErrorMessage(`Please fill in the required fields: ${errors.join(', ')}`)
        }
        return
      }

      const accountPurposeId = isEditing ? String(currentDataToEdit?.id || '') : undefined

      // Get the generated account purpose ID (UUID) from form data
      const formAccountPurposeId = data.accountPurposeId || generatedId

      let accountPurposeData: CreateAccountPurposeRequest | UpdateAccountPurposeRequest

      if (isEditing) {
        accountPurposeData = {
          id: currentDataToEdit?.id,
          accountPurposeCode: validatedData.accountPurposeCode,
          accountPurposeName: validatedData.accountPurposeName,
          active: validatedData.active,
          enabled: true,
          deleted: false,
          ...(formAccountPurposeId && { uuid: formAccountPurposeId }),
          ...(validatedData.criticalityDTO && {
            criticalityDTO: { id: validatedData.criticalityDTO.id },
          }),
          ...(validatedData.taskStatusDTO && validatedData.taskStatusDTO.id && {
            taskStatusDTO: { id: validatedData.taskStatusDTO.id },
          }),
        } as UpdateAccountPurposeRequest
      } else {
        accountPurposeData = {
          accountPurposeCode: validatedData.accountPurposeCode,
          accountPurposeName: validatedData.accountPurposeName,
          active: validatedData.active,
          enabled: true,
          deleted: false,
          ...(formAccountPurposeId && { uuid: formAccountPurposeId }),
          ...(validatedData.criticalityDTO && {
            criticalityDTO: { id: validatedData.criticalityDTO.id },
          }),
          ...(validatedData.taskStatusDTO && validatedData.taskStatusDTO.id && {
            taskStatusDTO: { id: validatedData.taskStatusDTO.id },
          }),
        } as CreateAccountPurposeRequest
      }

      const result = await saveAccountPurposeMutation.mutateAsync({
        data: accountPurposeData,
        isEditing,
        ...(accountPurposeId && { accountPurposeId }),
      })

      // Update generatedId with the UUID from the response if available
      if (result?.uuid) {
        setGeneratedId(result.uuid)
      }

      setSuccessMessage(
        isEditing
          ? 'Account Purpose updated successfully!'
          : 'Account Purpose added successfully!'
      )

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
      
      // Refresh will be handled by parent component callbacks

      setTimeout(() => {
        reset()
        setGeneratedId('')
        handleClose()
      }, 1500)
    } catch (error: unknown) {
      let errorMessage = 'Failed to save account purpose. Please try again.'
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
  )

  const renderAccountPurposeIdField = (
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
            validateAccountPurposeField(name, value, formValues as AccountPurposeFormData & { accountPurposeId?: string }),
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
            ? `${getAccountPurposeLabelDynamic('CDL_COMMON_UPDATE')} ${getAccountPurposeLabelDynamic('CDL_MAP_NAME')}`
            : `${getAccountPurposeLabelDynamic('CDL_COMMON_ADD')} ${getAccountPurposeLabelDynamic('CDL_MAP_NAME')}`}
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
            {effectiveCriticalityError && (
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
                getAccountPurposeLabelDynamic('CDL_MAP_ID'),
                12,
                true
              )}
              {renderTextField(
                'accountPurposeCode',
                getAccountPurposeLabelDynamic('CDL_MAP_CODE'),
                12,
                true
              )}
              {renderTextField(
                'accountPurposeName',
                getAccountPurposeLabelDynamic('CDL_MAP_NAME'),
                12,
                true
              )}
              <Grid size={{ xs: 12, md: 12 }}>
                <Controller
                  name="criticalityDTO"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={criticalityOptions}
                      getOptionLabel={(option) => 
                        typeof option === 'object' && option !== null
                          ? (option.displayName || option.settingValue || '')
                          : String(option)
                      }
                      isOptionEqualToValue={(option, value) => 
                        option.id === (typeof value === 'object' && value !== null ? value.id : value)
                      }
                      value={
                        criticalityOptions.find(
                          (opt) => opt.id === (field.value?.id || null)
                        ) || null
                      }
                      onChange={(_, newValue) => {
                        field.onChange(
                          newValue ? { id: newValue.id } : null
                        )
                      }}
                      loading={effectiveCriticalityLoading}
                      disabled={isReadOnly || effectiveCriticalityLoading}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={getAccountPurposeLabelDynamic('CDL_MAP_CRITICALITY')}
                          error={!!errors.criticalityDTO}
                          helperText={errors.criticalityDTO?.message?.toString()}
                          size="medium"
                          InputLabelProps={{ sx: labelSx }}
                          InputProps={{ ...params.InputProps, sx: valueSx }}
                          sx={errors.criticalityDTO ? errorFieldStyles : commonFieldStyles}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
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
                  disabled={saveAccountPurposeMutation.isPending || effectiveCriticalityLoading}
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
                  {getAccountPurposeLabelDynamic('CDL_COMMON_CANCEL')}
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  type="submit"
                  disabled={saveAccountPurposeMutation.isPending || effectiveCriticalityLoading}
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
                      ? getAccountPurposeLabelDynamic('CDL_COMMON_UPDATING')
                      : getAccountPurposeLabelDynamic('CDL_COMMON_ADDING')
                    : mode === 'edit'
                      ? getAccountPurposeLabelDynamic('CDL_COMMON_UPDATE')
                      : getAccountPurposeLabelDynamic('CDL_COMMON_ADD')}
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
