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
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  InputLabel,
  CircularProgress
} from '@mui/material'
import {
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { Controller, useForm } from 'react-hook-form'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import {
  useSaveBusinessSubSegment,
  useBusinessSubSegment,
} from '@/hooks/master/CustomerHook/useBusinessSubSegment'
import { useAllBusinessSegments } from '@/hooks/master/CustomerHook/useBusinessSegment'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'

import {
  validateBusinessSubSegmentData,
  sanitizeBusinessSubSegmentData,
  type BusinessSubSegmentFormData,
} from '@/lib/validation/masterValidation/businessSubSegmentSchemas'
import type {
  CreateBusinessSubSegmentRequest,
  UpdateBusinessSubSegmentRequest,
  BusinessSubSegment,
  TaskStatusDTO,
} from '@/services/api/masterApi/Customer/businessSubSegmentService'
import { getMasterLabel } from '@/constants/mappings/master/masterMapping'
import { alpha, useTheme } from '@mui/material/styles'
import { buildPanelSurfaceTokens } from '../panelTheme'
import { useTaskStatuses } from '@/hooks/master/CustomerHook/useTaskStatus'
import { idService } from '@/services/api/developerIdService'

interface RightSlideBusinessSubSegmentPanelProps {
  isOpen: boolean
  onClose: () => void
  onBusinessSubSegmentAdded?: (businessSubSegment: BusinessSubSegment) => void
  onBusinessSubSegmentUpdated?: (
    businessSubSegment: BusinessSubSegment,
    index: number
  ) => void
  title?: string
  mode?: 'add' | 'edit'
  actionData?: BusinessSubSegment | null
  businessSubSegmentIndex?: number | undefined
  taskStatusOptions?: TaskStatusDTO[]
  taskStatusLoading?: boolean
  taskStatusError?: unknown
}

export const RightSlideBusinessSubSegmentPanel: React.FC<
  RightSlideBusinessSubSegmentPanelProps
> = ({
  isOpen,
  onClose,
  onBusinessSubSegmentAdded,
  onBusinessSubSegmentUpdated,
  mode = 'add',
  actionData,
  businessSubSegmentIndex,
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

  const saveBusinessSubSegmentMutation = useSaveBusinessSubSegment()

  // Fetch full business segment data when in edit mode
  const { data: apiBusinessSubSegmentData } = useBusinessSubSegment(
    mode === 'edit' && actionData?.id ? String(actionData.id) : null
  )

  // Fetch task statuses
  const { isLoading: taskStatusesLoading } = useTaskStatuses()
  const taskStatusLoading = propTaskStatusLoading || taskStatusesLoading
  const taskStatusError = propTaskStatusError || null

  // Fetch all business segments for dropdown
  const {
    data: businessSegmentsData,
    isLoading: businessSegmentsLoading,
    error: businessSegmentsError,
  } = useAllBusinessSegments()

  // Transform business segments to dropdown options
  const businessSegmentOptions = React.useMemo(() => {
    if (!businessSegmentsData || !Array.isArray(businessSegmentsData)) {
      return []
    }
    
    return businessSegmentsData.map((segment) => ({
      label: segment.segmentName,
      value: segment.id,
      id: segment.id,
    }))
  }, [businessSegmentsData])

  // Dynamic labels
  const getBusinessSubSegmentLabelDynamic = useCallback(
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
  } = useForm<BusinessSubSegmentFormData & { businessSubSegmentId?: string }>({
    defaultValues: {
      businessSubSegmentId: '',
      subSegmentName: '',
      subSegmentDescription: '',
      businessSegmentNameDTO: null,
      active: true,
      taskStatusDTO: null,
    },
    mode: 'onChange',
  })

  // Initialize business segment ID from form value
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'businessSubSegmentId' && value.businessSubSegmentId) {
        setGeneratedId(value.businessSubSegmentId)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // Function to generate new business segment ID
  const handleGenerateNewId = async () => {
    try {
      setIsGeneratingId(true)
      const newIdResponse = idService.generateNewId('MBSU')
      setGeneratedId(newIdResponse.id)
      setValue('businessSubSegmentId', newIdResponse.id, {
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
          businessSubSegmentId: '',
          subSegmentName: '',
          subSegmentDescription: '',
          businessSegmentNameDTO: null,
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

    if (mode === 'edit' && (taskStatusLoading || businessSegmentsLoading)) {
      return
    }

    const currentId = (apiBusinessSubSegmentData?.id || actionData?.id) ?? null
    const shouldReset =
      lastModeRef.current !== mode ||
      (mode === 'edit' && lastResetIdRef.current !== currentId)

    if (!shouldReset) {
      return
    }

    if (mode === 'edit' && (apiBusinessSubSegmentData || actionData)) {
      const dataToUse = apiBusinessSubSegmentData || actionData
      if (!dataToUse) return

      const businessSubSegmentId = dataToUse.uuid || `MBSU-${dataToUse.id}` || ''
      setGeneratedId(businessSubSegmentId)

      reset({
        businessSubSegmentId: businessSubSegmentId,
        subSegmentName: dataToUse.subSegmentName || '',
        subSegmentDescription: dataToUse.subSegmentDescription || '',
        active: dataToUse.active ?? true,
        businessSegmentNameDTO: dataToUse.businessSegmentNameDTO?.id
          ? { id: dataToUse.businessSegmentNameDTO.id }
          : null,
        taskStatusDTO: dataToUse.taskStatusDTO?.id
          ? { id: dataToUse.taskStatusDTO.id }
          : null,
      })

      lastResetIdRef.current = dataToUse.id
      lastModeRef.current = mode
    } else if (mode === 'add') {
      reset({
        businessSubSegmentId: '',
        subSegmentName: '',
        subSegmentDescription: '',
        businessSegmentNameDTO: null,
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
    apiBusinessSubSegmentData?.id,
    actionData?.id,
    taskStatusLoading,
    businessSegmentsLoading,
    reset,
  ])

  const validateBusinessSegmentField = React.useCallback(
    (
      fieldName: string,
      value: unknown,
      allValues: BusinessSubSegmentFormData & { businessSubSegmentId?: string }
    ) => {
      try {
        const requiredFields: Record<string, string> = {
          subSegmentName: 'Business Sub Segment Name is required',
          subSegmentDescription: 'Business Sub Segment Description is required',
          businessSegmentNameDTO: 'Business Segment Name is required',
        }

        if (requiredFields[fieldName]) {
          if (fieldName === 'businessSegmentNameDTO') {
            // Validate object with id
            if (!value || (typeof value === 'object' && !('id' in value) || (value as { id?: number })?.id === undefined)) {
              return requiredFields[fieldName]
            }
          } else if (!value || (typeof value === 'string' && value.trim() === '')) {
            return requiredFields[fieldName]
          }
        }

        // Validate business segment ID for new business segments (not in edit mode)
        if (fieldName === 'businessSubSegmentId' && mode === 'add') {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return 'Business Sub Segment ID is required. Please generate an ID.'
          }
        }

        if (
          (fieldName === 'subSegmentName' || fieldName === 'subSegmentDescription') &&
          value &&
          typeof value === 'string' &&
          value.trim() !== ''
        ) {
          const result = validateBusinessSubSegmentData(allValues)
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

  const onSubmit = async (data: BusinessSubSegmentFormData & { businessSubSegmentId?: string }) => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)

      if (taskStatusLoading || businessSegmentsLoading) {
        setErrorMessage('Please wait for dropdown options to load before submitting.')
        return
      }

      const validatedData = sanitizeBusinessSubSegmentData(data)
      const currentDataToEdit = apiBusinessSubSegmentData || actionData
      const isEditing = Boolean(mode === 'edit' && currentDataToEdit?.id)

      // Validate business segment ID for new business segments
      if (!isEditing && !data.businessSubSegmentId && !generatedId) {
        setErrorMessage('Please generate a Business Segment ID before submitting.')
        return
      }

      const isValid = await trigger()
      if (!isValid) {
        const errors = []
        if (!data.subSegmentName) errors.push('Business Sub Segment Name is required')
        if (!data.subSegmentDescription) errors.push('Business Sub Segment Description is required')
        if (!data.businessSegmentNameDTO || !data.businessSegmentNameDTO.id) errors.push('Business Segment Name is required')
        if (errors.length > 0) {
          setErrorMessage(`Please fill in the required fields: ${errors.join(', ')}`)
        }
        return
      }
      const businessSubSegmentId = isEditing ? String(currentDataToEdit?.id || '') : undefined

      // Get the generated business segment ID (UUID) from form data
      const formBusinessSubSegmentId = data.businessSubSegmentId || generatedId

      let businessSubSegmentData: CreateBusinessSubSegmentRequest | UpdateBusinessSubSegmentRequest

      if (isEditing) {
        businessSubSegmentData = {
          id: currentDataToEdit?.id,
          businessSubSegmentName: validatedData.subSegmentName,
          businessSubSegmentDescription: validatedData.subSegmentDescription,
          active: validatedData.active,
          enabled: true,
          deleted: false,
          ...(formBusinessSubSegmentId && { uuid: formBusinessSubSegmentId }),
          ...(validatedData.businessSegmentNameDTO !== null && validatedData.businessSegmentNameDTO?.id && {
            businessSegmentNameDTO: { id: validatedData.businessSegmentNameDTO.id },
          }),
          ...(validatedData.taskStatusDTO !== null && validatedData.taskStatusDTO?.id && {
            taskStatusDTO: { id: validatedData.taskStatusDTO.id },
          }),
        } as UpdateBusinessSubSegmentRequest
      } else {
        businessSubSegmentData = {
          businessSubSegmentName: validatedData.subSegmentName,
          businessSubSegmentDescription: validatedData.subSegmentDescription,
          active: validatedData.active,
          enabled: true,
          deleted: false,
          ...(formBusinessSubSegmentId && { uuid: formBusinessSubSegmentId }),
          ...(validatedData.businessSegmentNameDTO !== null && validatedData.businessSegmentNameDTO?.id && {
            businessSegmentNameDTO: { id: validatedData.businessSegmentNameDTO.id },
          }),
          ...(validatedData.taskStatusDTO !== null && validatedData.taskStatusDTO?.id && {
            taskStatusDTO: { id: validatedData.taskStatusDTO.id },
          }),
        } as CreateBusinessSubSegmentRequest
      }

      const result = await saveBusinessSubSegmentMutation.mutateAsync({
        data: businessSubSegmentData,
        isEditing,
        ...(businessSubSegmentId && { businessSubSegmentId }),
      })

      // Update generatedId with the UUID from the response if available
      if (result?.uuid) {
        setGeneratedId(result.uuid)
      }

      setSuccessMessage(
        isEditing
          ? 'Business Sub Segment updated successfully!'
          : 'Business Sub Segment added successfully!'
      )

      if (
        mode === 'edit' &&
        onBusinessSubSegmentUpdated &&
        businessSubSegmentIndex !== null &&
        businessSubSegmentIndex !== undefined
      ) {
        onBusinessSubSegmentUpdated(result as BusinessSubSegment, businessSubSegmentIndex)
      } else if (onBusinessSubSegmentAdded) {
        onBusinessSubSegmentAdded(result as BusinessSubSegment)
      }
      
      // Refresh will be handled by parent component callbacks

      setTimeout(() => {
        reset()
        setGeneratedId('')
        handleClose()
      }, 1500)
    } catch (error: unknown) {
      let errorMessage = 'Failed to add business sub segment. Please try again.'
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
    name: 'subSegmentName' | 'subSegmentDescription',
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
            validateBusinessSegmentField(name, value, formValues),
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
  type OptionItem = {
    label: string
    value: string | number
    id?: string | number
  }


  const renderSelectField = (
    name: keyof BusinessSubSegmentFormData,
    label: string,
    options?: OptionItem[] | string[],
    gridSize: number = 6,
    required: boolean = true,
    showRedAsterisk: boolean = false,
    extraProps: {
      isLoading?: boolean
      disabled?: boolean
      onChange?: (value: string | number) => void
      placeholder?: string
    } = {}
  ) => {
    const resolvedOptions: OptionItem[] | string[] =
      options && options.length > 0 ? options : []

    return (
      <Grid key={String(name)} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          defaultValue={''}
          rules={
          name === 'businessSegmentNameDTO'
            ? {
                validate: (value: unknown) => {
                  if (required) {
                    if (
                      !value ||
                      typeof value !== 'object' ||
                      value === null ||
                      !('id' in value) ||
                      (value as { id?: number }).id === undefined
                    ) {
                      return `${label} is required`
                    }
                  }
                  return true
                },
              }
            : {}
        }
          render={({ field, fieldState }) => {
            const hasError = !!fieldState.error

            const fieldStyles = hasError
              ? {
                  '& .MuiOutlinedInput-root': {
                    height: '46px',
                    borderRadius: '8px',
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.background.default, 0.9)
                        : theme.palette.background.paper,
                    '& fieldset': {
                      borderColor: theme.palette.error.main,
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.error.main,
                      borderWidth: '2px',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.error.main,
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                  },
                }
              : {
                  '& .MuiOutlinedInput-root': {
                    height: '46px',
                    borderRadius: '8px',
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.background.default, 0.9)
                        : theme.palette.background.paper,
                    '& fieldset': {
                      borderColor:
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.grey[600], 0.7)
                          : '#CAD5E2',
                      borderWidth: '1px',
                    },
                    '&:hover fieldset': {
                      borderColor:
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.grey[300], 0.8)
                          : '#94A3B8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                  },
                }

            const dynamicLabelSx = {
              ...labelSx,
              ...(hasError && {
                color: theme.palette.error.main,
                '& .MuiFormLabel-asterisk': {
                  color: theme.palette.error.main,
                },
              }),
              ...(showRedAsterisk && {
                '& .MuiFormLabel-asterisk': {
                  color: theme.palette.error.main,
                },
              }),
              '&.Mui-focused': {
                color: hasError
                  ? theme.palette.error.main
                  : theme.palette.primary.main,
              },
            }

            return (
              <FormControl
                fullWidth
                error={hasError}
                disabled={!!extraProps.disabled || !!extraProps.isLoading}
              >
                <InputLabel
                  sx={dynamicLabelSx}
                  id={`${String(name)}-label`}
                  required={required}
                >
                  {extraProps.placeholder ?? label}
                </InputLabel>

                <Select
                  labelId={`${String(name)}-label`}
                  id={`${String(name)}-select`}
                  name={field.name}
                  value={
                    name === 'businessSegmentNameDTO'
                      ? (field.value as { id?: number } | null)?.id ?? ''
                      : field.value ?? ''
                  }
                  onChange={(e) => {
                    const val = (e.target as HTMLInputElement).value
                    if (name === 'businessSegmentNameDTO') {
                      // Store as object with id
                      field.onChange(val ? { id: Number(val) } : null)
                      if (extraProps.onChange) extraProps.onChange(Number(val))
                    } else {
                      field.onChange(val)
                      if (extraProps.onChange) extraProps.onChange(val)
                    }
                  }}
                  onBlur={field.onBlur}
                  disabled={!!extraProps.disabled || !!extraProps.isLoading}
                  label={extraProps.placeholder ?? label}
                  sx={{
                    ...valueSx,
                    ...fieldStyles,
                  }}
                  IconComponent={KeyboardArrowDownIcon}
                >
                  {extraProps.isLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      Loading {label.toLowerCase()}...
                    </MenuItem>
                  ) : Array.isArray(resolvedOptions) &&
                    resolvedOptions.length > 0 ? (
                    resolvedOptions.map((opt) =>
                      typeof opt === 'string' ? (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ) : (
                        <MenuItem key={opt.id ?? opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      )
                    )
                  ) : (
                    <MenuItem disabled>
                      No {label.toLowerCase()} available
                    </MenuItem>
                  )}
                </Select>

                {hasError && (
                  <FormHelperText>
                    {fieldState.error?.message ?? 'Supporting text'}
                  </FormHelperText>
                )}
              </FormControl>
            )
          }}
        />
      </Grid>
    )
  }


  const renderBusinessSubSegmentIdField = (
    name: 'businessSubSegmentId',
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
            validateBusinessSegmentField(name, value, formValues as BusinessSubSegmentFormData & { businessSubSegmentId?: string }),
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
            ? `${getBusinessSubSegmentLabelDynamic('CDL_COMMON_UPDATE')} ${getBusinessSubSegmentLabelDynamic('CDL_MBSS_NAME')}`
            : `${getBusinessSubSegmentLabelDynamic('CDL_COMMON_ADD')} ${getBusinessSubSegmentLabelDynamic('CDL_MBSS_NAME')}`}
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
            {(taskStatusError || businessSegmentsError) && (
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
              {renderBusinessSubSegmentIdField(
                'businessSubSegmentId',
                getBusinessSubSegmentLabelDynamic('CDL_MBSS_ID'),
                12,
                true
              )}
              {renderTextField(
                'subSegmentName',
                getBusinessSubSegmentLabelDynamic('CDL_MBSS_NAME'),
                12,
                true
              )}
              {renderTextField(
                'subSegmentDescription',
                getBusinessSubSegmentLabelDynamic('CDL_MBSS_DESCRIPTION'),
                12,
                true
              )}    
            

            {renderSelectField(
              'businessSegmentNameDTO',
              `${getBusinessSubSegmentLabelDynamic('CDL_MBS_NAME')}`,
              businessSegmentOptions as OptionItem[],
              12,
              true,
              true,
              {
                isLoading: businessSegmentsLoading,
                disabled: saveBusinessSubSegmentMutation.isPending || taskStatusLoading,
              }
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
                  disabled={saveBusinessSubSegmentMutation.isPending || taskStatusLoading || businessSegmentsLoading}
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
                  {getBusinessSubSegmentLabelDynamic('CDL_COMMON_CANCEL')}
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  type="submit"
                  disabled={saveBusinessSubSegmentMutation.isPending || taskStatusLoading || businessSegmentsLoading}
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
                  {saveBusinessSubSegmentMutation.isPending
                    ? mode === 'edit'
                      ? getBusinessSubSegmentLabelDynamic('CDL_COMMON_UPDATING')
                      : getBusinessSubSegmentLabelDynamic('CDL_COMMON_ADDING')
                    : mode === 'edit'
                      ? getBusinessSubSegmentLabelDynamic('CDL_COMMON_UPDATE')
                      : getBusinessSubSegmentLabelDynamic('CDL_COMMON_ADD')}
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
