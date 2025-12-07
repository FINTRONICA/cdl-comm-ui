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
  useSaveProductProgram,
  useProductProgram,
} from '@/hooks/master/CustomerHook/useProductProgram'
import {
  validateProductProgramData as validateProductProgramSchema,
  sanitizeProductProgramData,
  type ProductProgramFormData,
} from '@/lib/validation/masterValidation/productProgramSchemas'
import type {
        CreateProductProgramRequest,
  UpdateProductProgramRequest,
  ProductProgram,
  TaskStatusDTO,
} from '@/services/api/masterApi/Customer/productProgramService'
import { getMasterLabel } from '@/constants/mappings/master/masterMapping'
import { alpha, useTheme } from '@mui/material/styles'
import { buildPanelSurfaceTokens } from '../panelTheme'
import { useTaskStatuses } from '@/hooks/master/CustomerHook/useTaskStatus'
import { idService } from '@/services/api/developerIdService'

interface RightSlideProductProgramPanelProps {
  isOpen: boolean
  onClose: () => void
  onProductProgramAdded?: (productProgram: ProductProgram) => void
  onProductProgramUpdated?: (
    productProgram: ProductProgram,
    index: number
  ) => void
  title?: string
  mode?: 'add' | 'edit'
            actionData?: ProductProgram | null
  productProgramIndex?: number | undefined
  taskStatusOptions?: TaskStatusDTO[]
  taskStatusLoading?: boolean
  taskStatusError?: unknown
}

export const RightSlideProductProgramPanel: React.FC<
  RightSlideProductProgramPanelProps
> = ({
  isOpen,
  onClose,
  onProductProgramAdded,
  onProductProgramUpdated,
  mode = 'add',
  actionData,
  productProgramIndex,
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

    const saveProductProgramMutation = useSaveProductProgram()

  // Fetch full product program data when in edit mode
  const { data: apiProductProgramData } = useProductProgram(
    mode === 'edit' && actionData?.id ? String(actionData.id) : null
  )

  // Fetch task statuses
  const { isLoading: taskStatusesLoading } = useTaskStatuses()
  const taskStatusLoading = propTaskStatusLoading || taskStatusesLoading
  const taskStatusError = propTaskStatusError || null

  // Dynamic labels
  const getProductProgramLabelDynamic = useCallback(
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
  } = useForm<ProductProgramFormData & { productProgramId?: string }>({
    defaultValues: {
      productProgramId: '',
      programName: '',
      programDescription: '',
      active: true,
      taskStatusDTO: null,
    },
    mode: 'onChange',
  })

  // Initialize business segment ID from form value
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'productProgramId' && value.productProgramId) {
        setGeneratedId(value.productProgramId)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // Function to generate new product program ID
  const handleGenerateNewId = async () => {
    try {
      setIsGeneratingId(true)
      const newIdResponse = idService.generateNewId('MPP')
      setGeneratedId(newIdResponse.id)
      setValue('productProgramId', newIdResponse.id, {
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
          productProgramId: '',
          programName: '',
          programDescription: '',
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

    const currentId = (apiProductProgramData?.id || actionData?.id) ?? null
    const shouldReset =
      lastModeRef.current !== mode ||
      (mode === 'edit' && lastResetIdRef.current !== currentId) ||
      (mode === 'edit' && !lastResetIdRef.current && currentId)

    if (mode === 'edit') {
      // Wait for API data to load if we're in edit mode, but use actionData as fallback
      if (taskStatusLoading && !actionData) {
        return
      }

            if (shouldReset && (apiProductProgramData || actionData)) {
        const dataToUse = apiProductProgramData || actionData
        if (!dataToUse) return

        const productProgramId = dataToUse.uuid || `MPP-${dataToUse.id}` || ''
        setGeneratedId(productProgramId)

        // Handle both API data (segmentName) and table data (businessSegmentName) field names
        const tableData = dataToUse as ProductProgram & { productProgramName?: string; productProgramDescription?: string }
        const programName = tableData.programName || tableData.productProgramName || ''
        const programDescription = tableData.programDescription || tableData.productProgramDescription || ''

        reset({
          productProgramId: productProgramId,
          programName: programName,
          programDescription: programDescription,
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
        productProgramId: '',
        programName: '',
        programDescription: '',
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
    apiProductProgramData,
    actionData,
    taskStatusLoading,
    reset,
  ])

  const validateProductProgramField = React.useCallback(
    (
      fieldName: keyof ProductProgramFormData | 'productProgramId',
      value: unknown,
      allValues: ProductProgramFormData & { productProgramId?: string }
    ): string | boolean => {
      try {
        const requiredFields: Record<string, string> = {
          programName: 'Product Program Name is required',
          programDescription: 'Product Program Description is required',
        }

        if (requiredFields[fieldName]) {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return requiredFields[fieldName]
          }
        }

        // Validate product program ID for new product programs (not in edit mode)
        if (fieldName === 'productProgramId' && mode === 'add') {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return 'Product Program ID is required. Please generate an ID.'
          }
        }

        if (
          (fieldName === 'programName' || fieldName === 'programDescription') &&
          value &&
          typeof value === 'string' &&
          value.trim() !== ''
        ) {
          const result = validateProductProgramSchema(allValues)
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

  const onSubmit = async (data: ProductProgramFormData & { productProgramId?: string }) => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)

      if (taskStatusLoading) {
        setErrorMessage('Please wait for dropdown options to load before submitting.')
        return
      }

      const validatedData = sanitizeProductProgramData(data)
      const currentDataToEdit = apiProductProgramData || actionData
      const isEditing = Boolean(mode === 'edit' && currentDataToEdit?.id)

      // Validate product program ID for new product programs
      if (!isEditing && !data.productProgramId && !generatedId) {
        setErrorMessage('Please generate a Product Program ID before submitting.')
        return
      }

      const isValid = await trigger()
      if (!isValid) {
        const errors = []
        if (!data.programName) errors.push('Product Program Name is required')
        if (!data.programDescription) errors.push('Product Program Description is required')
        if (errors.length > 0) {
          setErrorMessage(`Please fill in the required fields: ${errors.join(', ')}`)
        }
        return
      }
      const productProgramId = isEditing ? String(currentDataToEdit?.id || '') : undefined

      // Get the generated product program ID (UUID) from form data
      const formProductProgramId = data.productProgramId || generatedId

      let productProgramData: CreateProductProgramRequest | UpdateProductProgramRequest

      if (isEditing) {
        productProgramData = {
          id: currentDataToEdit?.id,
          programName: validatedData.programName,
          programDescription: validatedData.programDescription,
          active: validatedData.active,
          enabled: true,
          deleted: false,
          ...(formProductProgramId && { uuid: formProductProgramId }),
          ...(validatedData.taskStatusDTO !== null && validatedData.taskStatusDTO?.id && {
            taskStatusDTO: { id: validatedData.taskStatusDTO.id },
          }),
        } as UpdateProductProgramRequest
      } else {
        productProgramData = {
          programName: validatedData.programName,
          programDescription: validatedData.programDescription,
          active: validatedData.active,
          enabled: true,
          deleted: false,
          ...(formProductProgramId && { uuid: formProductProgramId }),
          ...(validatedData.taskStatusDTO !== null && validatedData.taskStatusDTO?.id && {
            taskStatusDTO: { id: validatedData.taskStatusDTO.id },
          }),
        } as CreateProductProgramRequest
      }

      const result = await saveProductProgramMutation.mutateAsync({
        data: productProgramData,
        isEditing,
        ...(productProgramId && { productProgramId }),
      })

      // Update generatedId with the UUID from the response if available
      if (result?.uuid) {
        setGeneratedId(result.uuid)
      }

      setSuccessMessage(
        isEditing
          ? 'Product Program updated successfully!'
          : 'Product Program added successfully!'
      )

      if (
        mode === 'edit' &&
        onProductProgramUpdated &&
        productProgramIndex !== null &&
        productProgramIndex !== undefined
      ) {
        onProductProgramUpdated(result as ProductProgram, productProgramIndex)
      } else if (onProductProgramAdded) {
        onProductProgramAdded(result as ProductProgram)
      }
      
      // Refresh will be handled by parent component callbacks

      setTimeout(() => {
        reset()
        setGeneratedId('')
        handleClose()
      }, 1500)
    } catch (error: unknown) {
      let errorMessage = 'Failed to add product program. Please try again.'
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
    name: 'programName' | 'programDescription',
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
            validateProductProgramField(name, value, formValues),
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

  const renderProductProgramIdField = (
    name: 'productProgramId',
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
            validateProductProgramField(name, value, formValues as ProductProgramFormData & { productProgramId?: string }),
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
            ? `${getProductProgramLabelDynamic('CDL_COMMON_UPDATE')} ${getProductProgramLabelDynamic('CDL_MPP_NAME')}`
            : `${getProductProgramLabelDynamic('CDL_COMMON_ADD')} ${getProductProgramLabelDynamic('CDL_MPP_NAME')}`}
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
              {renderProductProgramIdField(
                'productProgramId',
                        getProductProgramLabelDynamic('CDL_MPP_ID'),
                12,
                true
              )}
              {renderTextField(
                'programName',
                getProductProgramLabelDynamic('CDL_MPP_NAME'),
                12,
                true
              )}
              {renderTextField(
                'programDescription',
                getProductProgramLabelDynamic('CDL_MPP_DESCRIPTION'),
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
                  disabled={saveProductProgramMutation.isPending || taskStatusLoading}
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
                  {getProductProgramLabelDynamic('CDL_COMMON_CANCEL')}
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  type="submit"
                  disabled={saveProductProgramMutation.isPending || taskStatusLoading}
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
                  {saveProductProgramMutation.isPending
                    ? mode === 'edit'
                      ? getProductProgramLabelDynamic('CDL_COMMON_UPDATING')
                      : getProductProgramLabelDynamic('CDL_COMMON_ADDING')
                    : mode === 'edit'
                      ? getProductProgramLabelDynamic('CDL_COMMON_UPDATE')
                      : getProductProgramLabelDynamic('CDL_COMMON_ADD')}
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
