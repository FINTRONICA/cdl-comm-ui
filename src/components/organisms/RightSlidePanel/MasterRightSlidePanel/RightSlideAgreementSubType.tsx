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
import {
  Refresh as RefreshIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { Controller, useForm } from 'react-hook-form'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { alpha, useTheme } from '@mui/material/styles'
import { FormError } from '@/components/atoms/FormError'
import {
  useSaveAgreementSubType,
  useAgreementSubType,
} from '@/hooks/master/CustomerHook/useAgreementSubType'
import { useAllAgreementTypes } from '@/hooks/master/CustomerHook/useAgreementType'
import { useTaskStatuses } from '@/hooks/master/CustomerHook/useTaskStatus'
import type { AgreementType } from '@/services/api/masterApi/Customer/agreementTypeService'
import type {
  CreateAgreementSubTypeRequest,
  UpdateAgreementSubTypeRequest,
  AgreementSubType,
  TaskStatusDTO,
} from '@/services/api/masterApi/Customer/agreementSubTypeService'
import {
  sanitizeAgreementSubTypeData,
  type AgreementSubTypeFormData,
  validateAgreementSubTypeData,
} from '@/lib/validation/masterValidation/agreementSubTypeSchemas'
import { getMasterLabel } from '@/constants/mappings/master/masterMapping'
import { buildPanelSurfaceTokens } from '../panelTheme'
import { idService } from '@/services/api/developerIdService'

interface RightSlideAgreementSubTypePanelProps {
  isOpen: boolean
  onClose: () => void
  onAgreementSubTypeAdded?: (agreementSubType: AgreementSubType) => void
  onAgreementSubTypeUpdated?: (
    agreementSubType: AgreementSubType,
    index: number
  ) => void
  title?: string
  mode?: 'add' | 'edit'
  actionData?: AgreementSubType | null
  agreementSubTypeIndex?: number | undefined
  taskStatusOptions?: TaskStatusDTO[]
  taskStatusLoading?: boolean
  taskStatusError?: unknown
}

interface OptionItem {
  label: string
  value: string | number
  id?: string | number
}

export const RightSlideAgreementSubTypePanel: React.FC<
  RightSlideAgreementSubTypePanelProps
> = ({
  isOpen,
  onClose,
  onAgreementSubTypeAdded,
  onAgreementSubTypeUpdated,
  mode = 'add',
  actionData,
  agreementSubTypeIndex,
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

  // Refs to prevent duplicate API calls and unnecessary resets
  const hasFetchedRef = useRef<boolean>(false)
  const lastResetIdRef = useRef<string | number | null>(null)
  const lastModeRef = useRef<'add' | 'edit' | null>(null)
  const lastIsOpenRef = useRef<boolean>(false)

  // Mutations and queries
  const saveAgreementSubTypeMutation = useSaveAgreementSubType()

  const { data: apiAgreementSubTypeData } = useAgreementSubType(
    isEditMode && actionData?.id ? String(actionData.id) : null
  )

  const { isLoading: taskStatusesLoading } = useTaskStatuses()
  const taskStatusLoading = propTaskStatusLoading || taskStatusesLoading
  const taskStatusError = propTaskStatusError || null

  // Fetch agreement types - FIXED: Prevent double calls
  const {
    data: agreementTypesData,
    isLoading: agreementTypesLoading,
    error: agreementTypesError,
    refetch: refetchAgreementTypes,
  } = useAllAgreementTypes()

  // FIXED: Use ref to ensure API is called only once when panel opens
  useEffect(() => {
    if (isOpen && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      refetchAgreementTypes()
    } else if (!isOpen) {
      hasFetchedRef.current = false
    }
  }, [isOpen, refetchAgreementTypes])

  // Transform agreement types to dropdown options
  const agreementTypeOptions = useMemo<OptionItem[]>(() => {
    if (!agreementTypesData) {
      return []
    }

    const types: AgreementType[] = Array.isArray(agreementTypesData)
      ? agreementTypesData
      : (agreementTypesData as { content?: AgreementType[] })?.content || []

    if (!Array.isArray(types) || types.length === 0) {
      return []
    }

    return types
      .map((type: AgreementType) => ({
        label: type.agreementTypeName || '',
        value: type.id,
        id: type.id,
      }))
      .filter((opt) => opt.label && opt.value)
  }, [agreementTypesData])

  // Dynamic labels
  const getAgreementSubTypeLabelDynamic = useCallback(
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
    watch,
    formState: { errors },
  } = useForm<AgreementSubTypeFormData & { agreementSubTypeId?: string }>({
    defaultValues: {
      agreementSubTypeId: '',
      subTypeName: '',
      subTypeDescription: '',
      agreementTypeDTO: null,
      active: true,
      taskStatusDTO: null,
    },
    mode: 'onChange',
  })

  // Sync generated ID with form
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'agreementSubTypeId' && value.agreementSubTypeId) {
        setGeneratedId(value.agreementSubTypeId)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // Generate new ID handler
  const handleGenerateNewId = useCallback(async () => {
    try {
      setIsGeneratingId(true)
      const newIdResponse = idService.generateNewId('MASU')
      setGeneratedId(newIdResponse.id)
      setValue('agreementSubTypeId', newIdResponse.id, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } catch {
      setErrorMessage('Failed to generate ID. Please try again.')
    } finally {
      setIsGeneratingId(false)
    }
  }, [setValue])

  // Reset form when panel opens/closes or mode/data changes
  useEffect(() => {
    if (!isOpen) {
      if (lastIsOpenRef.current) {
        reset({
          agreementSubTypeId: '',
          subTypeName: '',
          subTypeDescription: '',
          agreementTypeDTO: null,
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

    // Wait for data to load in edit mode
    if (
      isEditMode &&
      (taskStatusLoading ||
        agreementTypesLoading ||
        (!apiAgreementSubTypeData && !actionData))
    ) {
      return
    }

    const currentId = (apiAgreementSubTypeData?.id || actionData?.id) ?? null
    const shouldReset =
      lastModeRef.current !== mode ||
      (isEditMode && lastResetIdRef.current !== currentId)

    if (!shouldReset) {
      return
    }

    if (isEditMode && (apiAgreementSubTypeData || actionData)) {
      const dataToUse = apiAgreementSubTypeData || actionData
      if (!dataToUse) return

      const agreementSubTypeId = dataToUse.uuid || `MASU-${dataToUse.id}` || ''
      setGeneratedId(agreementSubTypeId)

      const agreementTypeId = dataToUse.agreementTypeDTO?.id
      const taskStatusId = dataToUse.taskStatusDTO?.id

      reset(
        {
          agreementSubTypeId: agreementSubTypeId,
          subTypeName: dataToUse.subTypeName || '',
          subTypeDescription: dataToUse.subTypeDescription || '',
          active: dataToUse.active ?? true,
          agreementTypeDTO: agreementTypeId ? { id: agreementTypeId } : null,
          taskStatusDTO: taskStatusId ? { id: taskStatusId } : null,
        },
        {
          keepDefaultValues: false,
        }
      )

      // Set dropdown values after options are loaded
      if (agreementTypeId && agreementTypeOptions.length > 0) {
        const optionExists = agreementTypeOptions.some(
          (opt) => opt.value === agreementTypeId
        )
        if (optionExists) {
          setValue('agreementTypeDTO', { id: agreementTypeId }, {
            shouldValidate: true,
            shouldDirty: false,
          })
        }
      }
      if (taskStatusId) {
        setValue('taskStatusDTO', { id: taskStatusId }, {
          shouldValidate: true,
          shouldDirty: false,
        })
      }

      lastResetIdRef.current = dataToUse.id
      lastModeRef.current = mode
    } else if (!isEditMode) {
      reset({
        agreementSubTypeId: '',
        subTypeName: '',
        subTypeDescription: '',
        agreementTypeDTO: null,
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
    isEditMode,
    apiAgreementSubTypeData,
    actionData,
    taskStatusLoading,
    agreementTypesLoading,
    agreementTypeOptions,
    reset,
    setValue,
  ])

  // Update dropdown values when options become available
  useEffect(() => {
    if (isEditMode && isOpen && agreementTypeOptions.length > 0) {
      const dataToUse = apiAgreementSubTypeData || actionData
      if (dataToUse?.agreementTypeDTO?.id) {
        const agreementTypeId = dataToUse.agreementTypeDTO.id
        const optionExists = agreementTypeOptions.some(
          (opt) => opt.value === agreementTypeId
        )
        if (optionExists) {
          const currentValue = watch('agreementTypeDTO')
          if (
            !currentValue ||
            (currentValue as { id?: number })?.id !== agreementTypeId
          ) {
            setValue('agreementTypeDTO', { id: agreementTypeId }, {
              shouldValidate: false,
              shouldDirty: false,
            })
          }
        }
      }
    }
  }, [
    isEditMode,
    isOpen,
    agreementTypeOptions,
    apiAgreementSubTypeData,
    actionData,
    setValue,
    watch,
  ])

  // Close handler
  const handleClose = useCallback(() => {
    reset()
    setErrorMessage(null)
    setSuccessMessage(null)
    setGeneratedId('')
    onClose()
  }, [reset, onClose])

  // Form submission handler
  const onSubmit = useCallback(
    async (data: AgreementSubTypeFormData & { agreementSubTypeId?: string }) => {
      try {
        setErrorMessage(null)
        setSuccessMessage(null)

        if (taskStatusLoading || agreementTypesLoading) {
          setErrorMessage(
            'Please wait for dropdown options to load before submitting.'
          )
          return
        }

        const validatedData = sanitizeAgreementSubTypeData(data)
        const currentDataToEdit = apiAgreementSubTypeData || actionData
        const isEditing = Boolean(isEditMode && currentDataToEdit?.id)

        // Validate ID for new records
        if (!isEditing && !data.agreementSubTypeId && !generatedId) {
          setErrorMessage(
            'Please generate an Agreement Sub Type ID before submitting.'
          )
          return
        }

        // Validate form
        const isValid = await trigger()
        if (!isValid) {
          const validationErrors: string[] = []
          if (!data.subTypeName?.trim()) {
            validationErrors.push('Agreement Sub Type Name is required')
          }
          if (!data.subTypeDescription?.trim()) {
            validationErrors.push('Agreement Sub Type Description is required')
          }
          if (!data.agreementTypeDTO?.id) {
            validationErrors.push('Agreement Type is required')
          }
          if (validationErrors.length > 0) {
            setErrorMessage(
              `Please fill in the required fields: ${validationErrors.join(', ')}`
            )
          }
          return
        }

        const agreementSubTypeId = isEditing
          ? String(currentDataToEdit?.id || '')
          : undefined
        const formAgreementSubTypeId = data.agreementSubTypeId || generatedId

        // Build request payload
        const basePayload = {
          subTypeName: validatedData.subTypeName,
          subTypeDescription: validatedData.subTypeDescription,
          active: validatedData.active,
          enabled: true,
          deleted: false,
          ...(formAgreementSubTypeId && { uuid: formAgreementSubTypeId }),
          ...(validatedData.agreementTypeDTO?.id && {
            agreementTypeDTO: { id: validatedData.agreementTypeDTO.id },
          }),
          ...(validatedData.taskStatusDTO?.id && {
            taskStatusDTO: { id: validatedData.taskStatusDTO.id },
          }),
        }

        const requestPayload: CreateAgreementSubTypeRequest | UpdateAgreementSubTypeRequest =
          isEditing
            ? {
                ...basePayload,
                id: currentDataToEdit?.id,
              }
            : basePayload

        const result = await saveAgreementSubTypeMutation.mutateAsync({
          data: requestPayload,
          isEditing,
          ...(agreementSubTypeId && { agreementSubTypeId }),
        })

        if (result?.uuid) {
          setGeneratedId(result.uuid)
        }

        setSuccessMessage(
          isEditing
            ? 'Agreement Sub Type updated successfully!'
            : 'Agreement Sub Type added successfully!'
        )

        if (
          isEditMode &&
          onAgreementSubTypeUpdated &&
          agreementSubTypeIndex !== null &&
          agreementSubTypeIndex !== undefined
        ) {
          onAgreementSubTypeUpdated(result as AgreementSubType, agreementSubTypeIndex)
        } else if (onAgreementSubTypeAdded) {
          onAgreementSubTypeAdded(result as AgreementSubType)
        }

        setTimeout(() => {
          reset()
          setGeneratedId('')
          handleClose()
        }, 1500)
      } catch (error: unknown) {
        let errorMsg = 'Failed to save agreement sub type. Please try again.'
        if (error instanceof Error) {
          if (error.message.includes('validation')) {
            errorMsg = 'Please check your input and try again.'
          } else {
            errorMsg = error.message
          }
        }
        setErrorMessage(errorMsg)
      }
    },
    [
      taskStatusLoading,
      agreementTypesLoading,
      apiAgreementSubTypeData,
      actionData,
      isEditMode,
      generatedId,
      trigger,
      saveAgreementSubTypeMutation,
      agreementSubTypeIndex,
      onAgreementSubTypeUpdated,
      onAgreementSubTypeAdded,
      reset,
      handleClose,
    ]
  )

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

  // Render text field
  const renderTextField = useCallback(
    (
      name: 'subTypeName' | 'subTypeDescription',
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
            validate: (value) => {
              if (required && (!value || (typeof value === 'string' && value.trim() === ''))) {
                return `${label} is required`
              }
              const result = validateAgreementSubTypeData({
                [name]: value,
              } as Partial<AgreementSubTypeFormData>)
              if (!result.success) {
                const fieldError = result.errors?.issues.find((issue) =>
                  issue.path.some((p) => String(p) === name)
                )
                return fieldError ? fieldError.message : true
              }
              return true
            },
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
    [control, errors, labelSx, valueSx, errorFieldStyles, commonFieldStyles]
  )

  // Render select field
  const renderSelectField = useCallback(
    (
      name: 'agreementTypeDTO' | 'taskStatusDTO',
      label: string,
      options: OptionItem[],
      gridSize: number = 6,
      required = false,
      loading = false
    ) => (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          rules={{
            required: required ? `${label} is required` : false,
            validate: (value: unknown) => {
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
                <InputLabel sx={labelStyles}>
                  {loading
                    ? getAgreementSubTypeLabelDynamic('CDL_COMMON_LOADING')
                    : label}
                </InputLabel>
                <Select
                  {...field}
                  value={fieldValue}
                  onChange={(e) => {
                    const selectedValue = e.target.value
                    field.onChange(
                      selectedValue ? { id: Number(selectedValue) } : null
                    )
                  }}
                  input={
                    <OutlinedInput
                      label={
                        loading
                          ? getAgreementSubTypeLabelDynamic('CDL_COMMON_LOADING')
                          : label
                      }
                    />
                  }
                  label={
                    loading
                      ? getAgreementSubTypeLabelDynamic('CDL_COMMON_LOADING')
                      : label
                  }
                  sx={{ ...selectStyles, ...valueStyles }}
                  IconComponent={KeyboardArrowDownIcon}
                  disabled={loading || isReadOnly}
                >
                  {loading ? (
                    <MenuItem disabled>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      {getAgreementSubTypeLabelDynamic('CDL_COMMON_LOADING')}
                    </MenuItem>
                  ) : options && options.length > 0 ? (
                    options.map((option) => (
                      <MenuItem
                        key={option.id ?? option.value}
                        value={String(option.value)}
                      >
                        {option.label}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      No {label.toLowerCase()} available
                    </MenuItem>
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
    ),
    [
      control,
      errors,
      labelStyles,
      selectStyles,
      valueStyles,
      isReadOnly,
      getAgreementSubTypeLabelDynamic,
    ]
  )

  // Render ID field
  const renderAgreementSubTypeIdField = useCallback(
    (
      name: 'agreementSubTypeId',
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
            validate: (value) => {
              if (
                required &&
                !isEditMode &&
                (!value || (typeof value === 'string' && value.trim() === ''))
              ) {
                return `${label} is required. Please generate an ID.`
              }
              return true
            },
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
      isEditMode,
      isReadOnly,
      isGeneratingId,
      handleGenerateNewId,
      labelStyles,
      valueStyles,
      fieldStyles,
      viewModeStyles,
      textSecondary,
      theme,
    ]
  )

  const isLoading =
    saveAgreementSubTypeMutation.isPending ||
    taskStatusLoading ||
    agreementTypesLoading

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
          {isEditMode
            ? `${getAgreementSubTypeLabelDynamic('CDL_COMMON_UPDATE')} ${getAgreementSubTypeLabelDynamic('CDL_MAT_NAME')}`
            : `${getAgreementSubTypeLabelDynamic('CDL_COMMON_ADD')} ${getAgreementSubTypeLabelDynamic('CDL_MAT_NAME')}`}
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
            {(taskStatusError || agreementTypesError) && (
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
              {renderAgreementSubTypeIdField(
                'agreementSubTypeId',
                getAgreementSubTypeLabelDynamic('CDL_MATSS_ID'),
                12,
                true
              )}
              {renderTextField(
                'subTypeName',
                getAgreementSubTypeLabelDynamic('CDL_MATSS_NAME'),
                12,
                true
              )}
              {renderTextField(
                'subTypeDescription',
                getAgreementSubTypeLabelDynamic('CDL_MATSS_DESCRIPTION'),
                12,
                true
              )}

              {renderSelectField(
                'agreementTypeDTO',
                getAgreementSubTypeLabelDynamic('CDL_MAT_NAME'),
                agreementTypeOptions,
                12,
                true,
                isLoading
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
                  {getAgreementSubTypeLabelDynamic('CDL_COMMON_CANCEL')}
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
                  {saveAgreementSubTypeMutation.isPending
                    ? isEditMode
                      ? getAgreementSubTypeLabelDynamic('CDL_COMMON_UPDATING')
                      : getAgreementSubTypeLabelDynamic('CDL_COMMON_ADDING')
                    : isEditMode
                      ? getAgreementSubTypeLabelDynamic('CDL_COMMON_UPDATE')
                      : getAgreementSubTypeLabelDynamic('CDL_COMMON_ADD')}
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
