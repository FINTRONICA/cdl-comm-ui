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
  useSaveBusinessSegment,
  useBusinessSegment,
} from '@/hooks/master/CustomerHook/useBusinessSegment'
import {
  validateBusinessSegmentData,
  sanitizeBusinessSegmentData,
  type BusinessSegmentFormData,
} from '@/lib/validation/masterValidation/businessSegmentSchemas'
import type {
  CreateBusinessSegmentRequest,
  UpdateBusinessSegmentRequest,
  BusinessSegment,
  TaskStatusDTO,
} from '@/services/api/masterApi/Customer/businessSegmentService'
import { getMasterLabel } from '@/constants/mappings/master/masterMapping'
import { alpha, useTheme } from '@mui/material/styles'
import { buildPanelSurfaceTokens } from '../panelTheme'
import { useTaskStatuses } from '@/hooks/master/CustomerHook/useTaskStatus'
import { idService } from '@/services/api/developerIdService'

interface RightSlideBusinessSegmentPanelProps {
  isOpen: boolean
  onClose: () => void
  onBusinessSegmentAdded?: (businessSegment: BusinessSegment) => void
  onBusinessSegmentUpdated?: (
    businessSegment: BusinessSegment,
    index: number
  ) => void
  title?: string
  mode?: 'add' | 'edit'
  actionData?: BusinessSegment | null
  businessSegmentIndex?: number | undefined
  taskStatusOptions?: TaskStatusDTO[]
  taskStatusLoading?: boolean
  taskStatusError?: unknown
}

export const RightSlideBusinessSegmentPanel: React.FC<
  RightSlideBusinessSegmentPanelProps
> = ({
  isOpen,
  onClose,
  onBusinessSegmentAdded,
  onBusinessSegmentUpdated,
  mode = 'add',
  actionData,
  businessSegmentIndex,
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

  const saveBusinessSegmentMutation = useSaveBusinessSegment()

  // Fetch full business segment data when in edit mode
  const { data: apiBusinessSegmentData } = useBusinessSegment(
    mode === 'edit' && actionData?.id ? String(actionData.id) : null
  )

  // Fetch task statuses
  const { isLoading: taskStatusesLoading } = useTaskStatuses()
  const taskStatusLoading = propTaskStatusLoading || taskStatusesLoading
  const taskStatusError = propTaskStatusError || null

  // Dynamic labels
  const getBusinessSegmentLabelDynamic = useCallback(
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
  } = useForm<BusinessSegmentFormData & { businessSegmentId?: string }>({
    defaultValues: {
      businessSegmentId: '',
      segmentName: '',
      segmentDescription: '',
      active: true,
      taskStatusDTO: null,
    },
    mode: 'onChange',
  })

  // Initialize business segment ID from form value
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'businessSegmentId' && value.businessSegmentId) {
        setGeneratedId(value.businessSegmentId)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // Function to generate new business segment ID
  const handleGenerateNewId = async () => {
    try {
      setIsGeneratingId(true)
      const newIdResponse = idService.generateNewId('MBS')
      setGeneratedId(newIdResponse.id)
      setValue('businessSegmentId', newIdResponse.id, {
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
          businessSegmentId: '',
          segmentName: '',
          segmentDescription: '',
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

    const currentId = (apiBusinessSegmentData?.id || actionData?.id) ?? null
    const shouldReset =
      lastModeRef.current !== mode ||
      (mode === 'edit' && lastResetIdRef.current !== currentId) ||
      (mode === 'edit' && !lastResetIdRef.current && currentId)

    if (mode === 'edit') {
      // Wait for API data to load if we're in edit mode, but use actionData as fallback
      if (taskStatusLoading && !actionData) {
        return
      }

      if (shouldReset && (apiBusinessSegmentData || actionData)) {
        const dataToUse = apiBusinessSegmentData || actionData
        if (!dataToUse) return

        const businessSegmentId = dataToUse.uuid || `MBS-${dataToUse.id}` || ''
        setGeneratedId(businessSegmentId)

        // Handle both API data (segmentName) and table data (businessSegmentName) field names
        const tableData = dataToUse as BusinessSegment & { businessSegmentName?: string; businessSegmentDescription?: string }
        const segmentName = tableData.segmentName || tableData.businessSegmentName || ''
        const segmentDescription = tableData.segmentDescription || tableData.businessSegmentDescription || ''

        reset({
          businessSegmentId: businessSegmentId,
          segmentName: segmentName,
          segmentDescription: segmentDescription,
          active: dataToUse.active ?? true,
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
        businessSegmentId: '',
        segmentName: '',
        segmentDescription: '',
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
    apiBusinessSegmentData,
    actionData,
    taskStatusLoading,
    reset,
  ])

  const validateBusinessSegmentField = React.useCallback(
    (
      fieldName: string,
      value: unknown,
      allValues: BusinessSegmentFormData & { businessSegmentId?: string }
    ) => {
      try {
        const requiredFields: Record<string, string> = {
          segmentName: 'Business Segment Name is required',
          segmentDescription: 'Business Segment Description is required',
        }

        if (requiredFields[fieldName]) {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return requiredFields[fieldName]
          }
        }

        // Validate business segment ID for new business segments (not in edit mode)
        if (fieldName === 'businessSegmentId' && mode === 'add') {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return 'Business Segment ID is required. Please generate an ID.'
          }
        }

        if (
          (fieldName === 'segmentName' || fieldName === 'segmentDescription') &&
          value &&
          typeof value === 'string' &&
          value.trim() !== ''
        ) {
          const result = validateBusinessSegmentData(allValues)
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

  const onSubmit = async (data: BusinessSegmentFormData & { businessSegmentId?: string }) => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)

      if (taskStatusLoading) {
        setErrorMessage('Please wait for dropdown options to load before submitting.')
        return
      }

      const validatedData = sanitizeBusinessSegmentData(data)
      const currentDataToEdit = apiBusinessSegmentData || actionData
      const isEditing = Boolean(mode === 'edit' && currentDataToEdit?.id)

      // Validate business segment ID for new business segments
      if (!isEditing && !data.businessSegmentId && !generatedId) {
        setErrorMessage('Please generate a Business Segment ID before submitting.')
        return
      }

      const isValid = await trigger()
      if (!isValid) {
        const errors = []
        if (!data.segmentName) errors.push('Business Segment Name is required')
        if (!data.segmentDescription) errors.push('Business Segment Description is required')
        if (errors.length > 0) {
          setErrorMessage(`Please fill in the required fields: ${errors.join(', ')}`)
        }
        return
      }
      const businessSegmentId = isEditing ? String(currentDataToEdit?.id || '') : undefined

      // Get the generated business segment ID (UUID) from form data
      const formBusinessSegmentId = data.businessSegmentId || generatedId

      let businessSegmentData: CreateBusinessSegmentRequest | UpdateBusinessSegmentRequest

      if (isEditing) {
        businessSegmentData = {
          id: currentDataToEdit?.id,
          segmentName: validatedData.segmentName,
          segmentDescription: validatedData.segmentDescription,
          active: validatedData.active,
          enabled: true,
          deleted: false,
          ...(formBusinessSegmentId && { uuid: formBusinessSegmentId }),
          ...(validatedData.taskStatusDTO !== null && validatedData.taskStatusDTO?.id && {
            taskStatusDTO: { id: validatedData.taskStatusDTO.id },
          }),
        } as UpdateBusinessSegmentRequest
      } else {
        businessSegmentData = {
          segmentName: validatedData.segmentName,
          segmentDescription: validatedData.segmentDescription,
          active: validatedData.active,
          enabled: true,
          deleted: false,
          ...(formBusinessSegmentId && { uuid: formBusinessSegmentId }),
          ...(validatedData.taskStatusDTO !== null && validatedData.taskStatusDTO?.id && {
            taskStatusDTO: { id: validatedData.taskStatusDTO.id },
          }),
        } as CreateBusinessSegmentRequest
      }

      const result = await saveBusinessSegmentMutation.mutateAsync({
        data: businessSegmentData,
        isEditing,
        ...(businessSegmentId && { businessSegmentId }),
      })

      // Update generatedId with the UUID from the response if available
      if (result?.uuid) {
        setGeneratedId(result.uuid)
      }

      setSuccessMessage(
        isEditing
          ? 'Business Segment updated successfully!'
          : 'Business Segment added successfully!'
      )

      if (
        mode === 'edit' &&
        onBusinessSegmentUpdated &&
        businessSegmentIndex !== null &&
        businessSegmentIndex !== undefined
      ) {
        onBusinessSegmentUpdated(result as BusinessSegment, businessSegmentIndex)
      } else if (onBusinessSegmentAdded) {
        onBusinessSegmentAdded(result as BusinessSegment)
      }
      
      // Refresh will be handled by parent component callbacks

      setTimeout(() => {
        reset()
        setGeneratedId('')
        handleClose()
      }, 1500)
    } catch (error: unknown) {
      let errorMessage = 'Failed to add business segment. Please try again.'
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
    name: 'segmentName' | 'segmentDescription',
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

  const renderBusinessSegmentIdField = (
    name: 'businessSegmentId',
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
            validateBusinessSegmentField(name, value, formValues as BusinessSegmentFormData & { businessSegmentId?: string }),
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
            ? `${getBusinessSegmentLabelDynamic('CDL_COMMON_UPDATE')} ${getBusinessSegmentLabelDynamic('CDL_MBS_NAME')}`
            : `${getBusinessSegmentLabelDynamic('CDL_COMMON_ADD')} ${getBusinessSegmentLabelDynamic('CDL_MBS_NAME')}`}
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
              {renderBusinessSegmentIdField(
                'businessSegmentId',
                getBusinessSegmentLabelDynamic('CDL_MBS_ID'),
                12,
                true
              )}
              {renderTextField(
                'segmentName',
                getBusinessSegmentLabelDynamic('CDL_MBS_NAME'),
                12,
                true
              )}
              {renderTextField(
                'segmentDescription',
                getBusinessSegmentLabelDynamic('CDL_MBS_DESCRIPTION'),
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
                  disabled={saveBusinessSegmentMutation.isPending || taskStatusLoading}
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
                  {getBusinessSegmentLabelDynamic('CDL_COMMON_CANCEL')}
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  type="submit"
                  disabled={saveBusinessSegmentMutation.isPending || taskStatusLoading}
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
                  {saveBusinessSegmentMutation.isPending
                    ? mode === 'edit'
                      ? getBusinessSegmentLabelDynamic('CDL_COMMON_UPDATING')
                      : getBusinessSegmentLabelDynamic('CDL_COMMON_ADDING')
                    : mode === 'edit'
                      ? getBusinessSegmentLabelDynamic('CDL_COMMON_UPDATE')
                      : getBusinessSegmentLabelDynamic('CDL_COMMON_ADD')}
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
