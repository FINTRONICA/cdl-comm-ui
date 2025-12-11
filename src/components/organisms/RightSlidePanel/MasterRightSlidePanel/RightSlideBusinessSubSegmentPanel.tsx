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
  CircularProgress,
  OutlinedInput,
} from '@mui/material'
import { Refresh as RefreshIcon, KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import { Controller, useForm } from 'react-hook-form'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { alpha, useTheme } from '@mui/material/styles'

import { FormError } from '../../../atoms/FormError'
import {
  useSaveBusinessSubSegment,
  useBusinessSubSegment,
} from '@/hooks/master/CustomerHook/useBusinessSubSegment'
import { useAllBusinessSegments } from '@/hooks/master/CustomerHook/useBusinessSegment'
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

type TableDataWithBusinessSubSegmentFields = BusinessSubSegment & {
  businessSubSegmentName?: string
  businessSubSegmentDescription?: string
}

type OptionItem = {
  label: string
  value: string | number
  id?: string | number
}

const DEFAULT_FORM_VALUES: BusinessSubSegmentFormData & { businessSubSegmentId?: string } = {
  businessSubSegmentId: '',
  subSegmentName: '',
  subSegmentDescription: '',
  businessSegmentNameDTO: null,
  active: true,
  taskStatusDTO: null,
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
  taskStatusOptions: _propTaskStatusOptions = [],
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

  const saveBusinessSubSegmentMutation = useSaveBusinessSubSegment()

  // Fetch full business segment data when in edit mode
  const editId = useMemo(
    () => (mode === 'edit' && actionData?.id ? String(actionData.id) : null),
    [mode, actionData?.id]
  )
  const { data: apiBusinessSubSegmentData } = useBusinessSubSegment(editId)

  // Fetch task statuses
  const { isLoading: taskStatusesLoading } = useTaskStatuses()
  const taskStatusLoading = propTaskStatusLoading || taskStatusesLoading
  const taskStatusError = propTaskStatusError || null

  // Fetch all business segments for dropdown - memoized to prevent unnecessary refetches
  const {
    data: businessSegmentsData,
    isLoading: businessSegmentsLoading,
    error: businessSegmentsError,
  } = useAllBusinessSegments()

  // Transform business segments to dropdown options
  const businessSegmentOptions = useMemo(() => {
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
    (configId: string): string => getMasterLabel(configId),
    []
  )

  // Helper: Extract field values from data source (handles both API and table data formats)
  const extractFieldValues = useCallback(
    (data: BusinessSubSegment | TableDataWithBusinessSubSegmentFields) => {
      const tableData = data as TableDataWithBusinessSubSegmentFields
      return {
        subSegmentName:
          tableData.subSegmentName || tableData.businessSubSegmentName || '',
        subSegmentDescription:
          tableData.subSegmentDescription ||
          tableData.businessSubSegmentDescription ||
          '',
        businessSubSegmentId: data.uuid || `MBSS-${data.id}` || '',
      }
    },
    []
  )

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<BusinessSubSegmentFormData & { businessSubSegmentId?: string }>({
    defaultValues: DEFAULT_FORM_VALUES,
    mode: 'onChange',
  })

  // Function to generate new business segment ID
  const handleGenerateNewId = useCallback(async () => {
    try {
      setIsGeneratingId(true)
      const newIdResponse = idService.generateNewId('MBSU')
      setGeneratedId(newIdResponse.id)
      setValue('businessSubSegmentId', newIdResponse.id, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } catch (error) {
      setErrorMessage('Failed to generate ID. Please try again.')
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
        reset(DEFAULT_FORM_VALUES)
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

    // Wait for dropdowns to load in edit mode
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

      const { subSegmentName, subSegmentDescription, businessSubSegmentId } =
        extractFieldValues(dataToUse)
      setGeneratedId(businessSubSegmentId)

      // Extract businessSegmentNameDTO - handle both API format (object) and table format (string/id)
      let businessSegmentNameDTOValue: { id: number } | null = null
      const tableData = dataToUse as TableDataWithBusinessSubSegmentFields

      // Check if it's an object (API format)
      if (
        dataToUse.businessSegmentNameDTO &&
        typeof dataToUse.businessSegmentNameDTO === 'object' &&
        'id' in dataToUse.businessSegmentNameDTO
      ) {
        businessSegmentNameDTOValue = { id: dataToUse.businessSegmentNameDTO.id }
      }
      // Check if it's a string (table format)
      else if (
        tableData.businessSegmentNameDTO &&
        typeof (tableData.businessSegmentNameDTO as unknown) === 'string'
      ) {
        const segmentNameStr = tableData.businessSegmentNameDTO as unknown as string
        const matchingSegment = businessSegmentOptions.find(
          (opt) => opt.label === segmentNameStr || String(opt.id) === segmentNameStr
        )
        if (matchingSegment) {
          businessSegmentNameDTOValue = { id: matchingSegment.id }
        }
      }

      reset({
        businessSubSegmentId: businessSubSegmentId,
        subSegmentName: subSegmentName,
        subSegmentDescription: subSegmentDescription,
        active: dataToUse.active ?? true,
        businessSegmentNameDTO: businessSegmentNameDTOValue,
        taskStatusDTO: dataToUse.taskStatusDTO?.id
          ? { id: dataToUse.taskStatusDTO.id }
          : null,
      })

      lastResetIdRef.current = dataToUse.id
      lastModeRef.current = mode
    } else if (mode === 'add') {
      reset(DEFAULT_FORM_VALUES)
      setGeneratedId('')
      lastResetIdRef.current = null
      lastModeRef.current = mode
    }
  }, [
    isOpen,
    mode,
    apiBusinessSubSegmentData?.id,
    actionData?.id,
    taskStatusLoading,
    businessSegmentsLoading,
    reset,
    extractFieldValues,
    businessSegmentOptions,
  ])

  const validateBusinessSegmentField = useCallback(
    (
      fieldName: string,
      value: unknown,
      allValues: BusinessSubSegmentFormData & { businessSubSegmentId?: string }
    ) => {
      try {
        // Validate business segment ID for new business segments (not in edit mode)
        if (fieldName === 'businessSubSegmentId' && mode === 'add') {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return 'Business Sub Segment ID is required. Please generate an ID.'
          }
        }

        // Use schema validation for all fields
        const result = validateBusinessSubSegmentData(allValues)
        if (!result.success && result.errors) {
          const fieldError = result.errors.issues.find((issue) =>
            issue.path.some((p) => String(p) === fieldName)
          )
          if (fieldError) {
            return fieldError.message
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
    async (data: BusinessSubSegmentFormData & { businessSubSegmentId?: string }) => {
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

        // Validate using schema
        const validationResult = validateBusinessSubSegmentData(data)
        if (!validationResult.success) {
          const fieldErrors =
            validationResult.errors?.issues.map((issue) => {
              const fieldName = issue.path.join('.')
              return `${fieldName}: ${issue.message}`
            }) || []
          setErrorMessage(`Please fix the validation errors: ${fieldErrors.join(', ')}`)
          return
        }

        const isValid = await trigger()
        if (!isValid) {
          setErrorMessage('Please fix the form errors before submitting.')
          return
        }

        // Get the business sub segment ID for the update call
        const businessSubSegmentId =
          isEditing && currentDataToEdit?.id ? String(currentDataToEdit.id) : undefined

        // Get the generated business segment ID (UUID) from form data
        const formBusinessSubSegmentId = data.businessSubSegmentId || generatedId

        let businessSubSegmentData: CreateBusinessSubSegmentRequest | UpdateBusinessSubSegmentRequest

        if (isEditing) {
          businessSubSegmentData = {
            id: currentDataToEdit?.id,
            subSegmentName: validatedData.subSegmentName,
            subSegmentDescription: validatedData.subSegmentDescription,
            active: validatedData.active,
            enabled: true,
            deleted: false,
            ...(formBusinessSubSegmentId && { uuid: formBusinessSubSegmentId }),
            ...(validatedData.businessSegmentNameDTO !== null &&
              validatedData.businessSegmentNameDTO?.id && {
                businessSegmentNameDTO: { id: validatedData.businessSegmentNameDTO.id },
              }),
            ...(validatedData.taskStatusDTO !== null &&
              validatedData.taskStatusDTO?.id && {
                taskStatusDTO: { id: validatedData.taskStatusDTO.id },
              }),
          } as UpdateBusinessSubSegmentRequest
        } else {
          businessSubSegmentData = {
            subSegmentName: validatedData.subSegmentName,
            subSegmentDescription: validatedData.subSegmentDescription,
            businessSegmentNameDTO: validatedData.businessSegmentNameDTO,
            active: validatedData.active,
            enabled: true,
            deleted: false,
            ...(formBusinessSubSegmentId && { uuid: formBusinessSubSegmentId }),
            ...(validatedData.taskStatusDTO !== null &&
              validatedData.taskStatusDTO?.id && {
                taskStatusDTO: { id: validatedData.taskStatusDTO.id },
              }),
          } as CreateBusinessSubSegmentRequest
        }

        const result = await saveBusinessSubSegmentMutation.mutateAsync({
          data: businessSubSegmentData,
          isEditing,
          ...(businessSubSegmentId && { businessSegmentId: businessSubSegmentId }),
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

        setTimeout(() => {
          reset(DEFAULT_FORM_VALUES)
          setGeneratedId('')
          handleClose()
        }, 1500)
      } catch (error: unknown) {
        let errorMessage = 'Failed to save business sub segment. Please try again.'
        if (error instanceof Error) {
          if (error.message.includes('validation')) {
            errorMessage = 'Please check your input and try again.'
          } else {
            errorMessage = error.message
          }
        }
        setErrorMessage(errorMessage)
      }
    },
    [
      taskStatusLoading,
      businessSegmentsLoading,
      apiBusinessSubSegmentData,
      actionData,
      mode,
      generatedId,
      trigger,
      saveBusinessSubSegmentMutation,
      businessSubSegmentIndex,
      onBusinessSubSegmentUpdated,
      onBusinessSubSegmentAdded,
      reset,
    ]
  )

  const handleClose = useCallback(() => {
    reset(DEFAULT_FORM_VALUES)
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

  // Select styles with theme-aware colors
  const selectStyles = useMemo(
    () => ({
      height: '46px',
      borderRadius: '8px',
      backgroundColor: isDark
        ? alpha('#1E293B', 0.5)
        : theme.palette.background.paper,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: isDark ? alpha('#FFFFFF', 0.3) : alpha('#000000', 0.23),
        borderWidth: '1px',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: isDark ? alpha('#FFFFFF', 0.5) : alpha('#000000', 0.87),
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

  const renderTextField = useCallback(
    (
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
    ),
    [control, errors, labelSx, valueSx, errorFieldStyles, commonFieldStyles, validateBusinessSegmentField]
  )

  const renderSelectField = useCallback(
    (
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
      const loading = extraProps.isLoading || false
      const displayLabel = loading
        ? getBusinessSubSegmentLabelDynamic('CDL_COMMON_LOADING')
        : extraProps.placeholder ?? label

      return (
        <Grid key={String(name)} size={{ xs: 12, md: gridSize }}>
          <Controller
            name={name}
            control={control}
            defaultValue={name === 'businessSegmentNameDTO' ? null : ''}
            rules={{
              validate: (value: unknown, formValues) => {
                const fieldData = { ...formValues, [name]: value }
                const result = validateBusinessSubSegmentData(fieldData)
                if (!result.success && result.errors) {
                  const fieldError = result.errors.issues.find((issue) =>
                    issue.path.some((p) => String(p) === name)
                  )
                  if (fieldError) {
                    return fieldError.message
                  }
                }
                return true
              },
            }}
            render={({ field }) => {
              const selectValue =
                name === 'businessSegmentNameDTO'
                  ? (field.value as { id?: number } | null)?.id ?? ''
                  : field.value ?? ''

              return (
                <FormControl
                  fullWidth
                  error={!!errors[name]}
                  required={required}
                  disabled={!!extraProps.disabled || loading}
                >
                  <InputLabel sx={labelSx}>{displayLabel}</InputLabel>
                  <Select
                    name={field.name}
                    value={selectValue}
                    onChange={(e) => {
                      const val = (e.target as HTMLInputElement).value
                      if (name === 'businessSegmentNameDTO') {
                        field.onChange(val ? { id: Number(val) } : null)
                        if (extraProps.onChange) extraProps.onChange(Number(val))
                      } else {
                        field.onChange(val)
                        if (extraProps.onChange) extraProps.onChange(val)
                      }
                    }}
                    onBlur={field.onBlur}
                    input={<OutlinedInput label={displayLabel} />}
                    label={displayLabel}
                    sx={{ ...selectStyles, ...valueSx }}
                    IconComponent={KeyboardArrowDownIcon}
                    disabled={!!extraProps.disabled || loading}
                  >
                    {loading ? (
                      <MenuItem disabled>
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        {getBusinessSubSegmentLabelDynamic('CDL_COMMON_LOADING')}{' '}
                        {label.toLowerCase()}...
                      </MenuItem>
                    ) : Array.isArray(resolvedOptions) && resolvedOptions.length > 0 ? (
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
                      <MenuItem disabled>No {label.toLowerCase()} available</MenuItem>
                    )}
                  </Select>
                  <FormError
                    error={(errors[name]?.message as string) || ''}
                    touched={true}
                  />
                </FormControl>
              )
            }}
          />
        </Grid>
      )
    },
    [
      control,
      errors,
      labelSx,
      valueSx,
      selectStyles,
      getBusinessSubSegmentLabelDynamic,
    ]
  )

  const renderBusinessSubSegmentIdField = useCallback(
    (
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
              validateBusinessSegmentField(
                name,
                value,
                formValues as BusinessSubSegmentFormData & { businessSubSegmentId?: string }
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
                  sx: valueSx,
                }}
                InputLabelProps={{
                  sx: {
                    ...labelSx,
                    ...(!!fieldError && {
                      color: theme.palette.error.main,
                      '&.Mui-focused': { color: theme.palette.error.main },
                      '&.MuiFormLabel-filled': { color: theme.palette.error.main },
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
      validateBusinessSegmentField,
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
            ? `${getBusinessSubSegmentLabelDynamic('CDL_COMMON_UPDATE')} ${getBusinessSubSegmentLabelDynamic('CDL_MBSS_NAME')}`
            : `${getBusinessSubSegmentLabelDynamic('CDL_COMMON_ADD')} ${getBusinessSubSegmentLabelDynamic('CDL_MBSS_NAME')}`}
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
                getBusinessSubSegmentLabelDynamic('CDL_MBS_NAME'),
                businessSegmentOptions as OptionItem[],
                12,
                true,
                true,
                {
                  isLoading: businessSegmentsLoading,
                  disabled:
                    saveBusinessSubSegmentMutation.isPending || taskStatusLoading,
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
                  disabled={
                    saveBusinessSubSegmentMutation.isPending ||
                    taskStatusLoading ||
                    businessSegmentsLoading
                  }
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
                  disabled={
                    saveBusinessSubSegmentMutation.isPending ||
                    taskStatusLoading ||
                    businessSegmentsLoading
                  }
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
