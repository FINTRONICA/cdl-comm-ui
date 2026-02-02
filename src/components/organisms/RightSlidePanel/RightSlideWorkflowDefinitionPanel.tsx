'use client'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  Button,
  Drawer,
  Box,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Snackbar,
  OutlinedInput,
} from '@mui/material'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import { Controller, useForm, FieldErrors } from 'react-hook-form'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { getWorkflowLabelsByCategory as getWorkflowDefinitionLabel } from '@/constants/mappings/workflowMapping'
import { getWorkflowDefinitionValidationRules } from '@/lib/validation/workflowDefinitionSchemas'
import { FormError } from '../../atoms/FormError'
import { useWorkflowDefinitionLabelsWithCache } from '@/hooks/workflow/useWorkflowDefinitionLabelsWithCache'
import { useAppStore } from '@/store'
import {
  useCreateWorkflowDefinition,
  useUpdateWorkflowDefinition,
  useWorkflowDefinitionForm,
} from '@/hooks/workflow'
import type { WorkflowDefinitionUIData } from '@/services/api/workflowApi'
import { alpha, useTheme } from '@mui/material/styles'
import { buildPanelSurfaceTokens } from './panelTheme'

interface RightSlideWorkflowDefinitionPanelProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'add' | 'edit' | 'view'
  definitionData?: WorkflowDefinitionUIData | null
}

type DefinitionFormData = {
  name: string
  version: number
  amountBased: boolean
  moduleCode: string
  actionCode: string
  applicationModuleId: number | string | null
  workflowActionId: number | string | null
  active: boolean
}

const DEFAULT_VALUES: DefinitionFormData = {
  name: '',
  version: 1,
  amountBased: false,
  moduleCode: '',
  actionCode: '',
  applicationModuleId: null,
  workflowActionId: null,
  active: true,
}

const RightSlideWorkflowDefinitionPanelComponent: React.FC<
  RightSlideWorkflowDefinitionPanelProps
> = ({ isOpen, onClose, mode = 'add', definitionData }) => {
  const theme = useTheme()
  const tokens = React.useMemo(() => buildPanelSurfaceTokens(theme), [theme])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const commonFieldStyles = React.useMemo(() => tokens.input, [tokens])
  const errorFieldStyles = React.useMemo(() => tokens.inputError, [tokens])
  const createDefinition = useCreateWorkflowDefinition()
  const updateDefinition = useUpdateWorkflowDefinition()

  // Dynamic labels: same pattern used in Build Partner Beneficiary Panel
  const { data: workflowDefinitionLabels, getLabel } =
    useWorkflowDefinitionLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'
  const getWorkflowDefinitionLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getWorkflowDefinitionLabel(configId)
      if (workflowDefinitionLabels) {
        return getLabel(configId, currentLanguage, fallback)
      }
      return fallback
    },
    [workflowDefinitionLabels, currentLanguage, getLabel]
  )

  const {
    moduleOptions,
    actionOptions,
    isLoading: formLoading,
  } = useWorkflowDefinitionForm()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting: isFormSubmitting, isDirty },
    clearErrors,
  } = useForm<DefinitionFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const isSubmitting =
    createDefinition.isPending ||
    updateDefinition.isPending ||
    isFormSubmitting ||
    formLoading
  const isViewMode = mode === 'view'
  const labelSx = tokens.label
  const valueSx = tokens.value

  useEffect(() => {
    if (!isOpen) return

    const values: DefinitionFormData =
      mode === 'edit' && definitionData
        ? {
            name: definitionData.name ?? '',
            version: definitionData.version ?? 1,
            amountBased: definitionData.amountBased ?? false,
            moduleCode: definitionData.moduleCode ?? '',
            actionCode: definitionData.actionCode ?? '',
            applicationModuleId:
              definitionData.applicationModuleId &&
              definitionData.applicationModuleId !== '-' &&
              String(definitionData.applicationModuleId).trim() !== ''
                ? (() => {
                    const parsed = parseInt(String(definitionData.applicationModuleId), 10)
                    return isNaN(parsed) ? null : parsed
                  })()
                : null,
            workflowActionId:
              definitionData.workflowActionId &&
              definitionData.workflowActionId !== '-' &&
              String(definitionData.workflowActionId).trim() !== ''
                ? (() => {
                    const parsed = parseInt(String(definitionData.workflowActionId), 10)
                    return isNaN(parsed) ? null : parsed
                  })()
                : null,
            active: definitionData.enabled ?? true,
          }
        : DEFAULT_VALUES

    reset(values, { keepDirty: false })
    clearErrors()
    setErrorMessage(null)
  }, [isOpen, mode, definitionData, reset, clearErrors])

  // Get validation rules from schema
  const validationRules = useMemo(() => getWorkflowDefinitionValidationRules(), [])

  const onSubmit = useCallback(
    async (data: DefinitionFormData) => {
      try {
        setErrorMessage(null)
        setSuccessMessage(null)
        if (isSubmitting) {
          return
        }
        if (mode === 'edit' && !isDirty) {
          setErrorMessage('No changes to save.')
          return
        }

        const payload = {
          name: data.name.trim(),
          version:
            typeof data.version === 'string'
              ? parseFloat(data.version)
              : Number(data.version),
          amountBased: Boolean(data.amountBased),
          moduleCode: data.moduleCode.trim(),
          actionCode: data.actionCode.trim(),
          enabled: Boolean(data.active),
          applicationModuleId:
            data.applicationModuleId && data.applicationModuleId !== null
              ? Number(data.applicationModuleId)
              : null,
          workflowActionId:
            data.workflowActionId && data.workflowActionId !== null
              ? Number(data.workflowActionId)
              : null,
        }

        if (mode === 'edit') {
          if (!definitionData?.id) {
            setErrorMessage('Invalid or missing definition ID for update')
            return
          }

          await updateDefinition.mutateAsync({
            id: definitionData.id.toString(),
            updates: payload,
          })

          setSuccessMessage('Workflow definition updated successfully!')
          setTimeout(() => {
            reset()
            onClose()
          }, 1500)
        } else {
          await createDefinition.mutateAsync(payload)

          setSuccessMessage('Workflow definition created successfully!')
          setTimeout(() => {
            reset()
            onClose()
          }, 1500)
        }
      } catch (error: unknown) {
        let errorMsg = 'Failed to save workflow definition. Please try again.'

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
      isSubmitting,
      mode,
      isDirty,
      definitionData?.id,
      updateDefinition,
      createDefinition,
      reset,
      onClose,
    ]
  )

  const handleClose = () => {
    reset()
    setErrorMessage(null)
    setSuccessMessage(null)
    onClose()
  }

  const onError = (errors: FieldErrors<DefinitionFormData>) => {
    const firstError = Object.values(errors)[0]
    if (firstError?.message) {
      setErrorMessage(firstError.message as string)
    }
  }

  const renderTextField = (
    name: keyof DefinitionFormData,
    label: string,
    type: 'text' | 'number' = 'text',
    gridSize: number = 12,
    required: boolean = true
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        rules={validationRules[name] || {}}
        render={({ field, fieldState }) => {
          const hasError = !!fieldState.error

          return (
            <>
              <TextField
                {...field}
                type={type}
                label={label}
                fullWidth
                disabled={isSubmitting || isViewMode}
                required={required}
                error={hasError}
                InputLabelProps={{ sx: labelSx }}
                InputProps={{
                  sx: valueSx,
                  inputProps: {
                    maxLength:
                      name === 'name' ||
                      name === 'moduleCode' ||
                      name === 'actionCode'
                        ? 100
                        : undefined,
                  },
                }}
                sx={hasError ? errorFieldStyles : commonFieldStyles}
              />
              <FormError
                error={hasError ? (fieldState.error?.message as string) : ''}
                touched={true}
              />
            </>
          )
        }}
      />
    </Grid>
  )

  type OptionItem = {
    label: string
    value: string | number
    id?: string | number
  }

  const selectStyles = useMemo(
    () => ({
      height: '46px',
      borderRadius: '8px',
      '& .MuiOutlinedInput-root': {
        height: '46px',
        borderRadius: '8px',
        backgroundColor: theme.palette.mode === 'dark'
          ? alpha('#1E293B', 0.5) // Darker background for inputs in dark mode
          : '#FFFFFF', // White background for inputs in light mode
        '& fieldset': {
          borderColor: theme.palette.mode === 'dark'
            ? alpha('#FFFFFF', 0.3) // White border with opacity for dark mode
            : '#CAD5E2', // Light border for light mode
          borderWidth: '1px',
        },
        '&:hover fieldset': {
          borderColor: theme.palette.mode === 'dark'
            ? alpha('#FFFFFF', 0.5) // Brighter on hover for dark mode
            : '#94A3B8', // Darker on hover for light mode
        },
        '&.Mui-focused fieldset': {
          borderColor: theme.palette.primary.main,
          borderWidth: '1px',
        },
      },
      '& .MuiSelect-icon': {
        color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#666', // White icon in dark mode, gray in light mode
        fontSize: '20px',
      },
      '& .MuiInputBase-input': {
        color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#111827', // White text in dark mode, dark text in light mode
      },
    }),
    [theme]
  )

  const renderSelectField = (
    name: keyof DefinitionFormData,
    label: string,
    options?: OptionItem[] | string[],
    gridSize: number = 6,
    required: boolean = true,
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
          rules={validationRules[name] || {}}
          render={({ field, fieldState }) => {
            const hasError = !!fieldState.error

            return (
              <FormControl
                fullWidth
                error={hasError}
                required={required}
                disabled={!!extraProps.disabled || !!extraProps.isLoading}
              >
                <InputLabel sx={labelSx}>
                  {extraProps.isLoading
                    ? getWorkflowDefinitionLabelDynamic('CDL_COMMON_LOADING')
                    : label}
                </InputLabel>
                <Select
                  {...field}
                  value={field.value ?? ''}
                  input={
                    <OutlinedInput
                      label={
                        extraProps.isLoading
                          ? getWorkflowDefinitionLabelDynamic('CDL_COMMON_LOADING')
                          : label
                      }
                    />
                  }
                  label={
                    extraProps.isLoading
                      ? getWorkflowDefinitionLabelDynamic('CDL_COMMON_LOADING')
                      : label
                  }
                  sx={{ ...selectStyles, ...valueSx }}
                  IconComponent={KeyboardArrowDownIcon}
                  disabled={
                    !!extraProps.disabled ||
                    !!extraProps.isLoading ||
                    isSubmitting ||
                    isViewMode
                  }
                  onChange={(e) => {
                    const val = (e.target as HTMLInputElement).value
                    const numVal = val === '' ? null : (isNaN(Number(val)) ? val : Number(val))
                    field.onChange(numVal)
                    if (extraProps.onChange && numVal !== null) {
                      extraProps.onChange(numVal)
                    }
                  }}
                  onBlur={field.onBlur}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 280,
                      },
                    },
                  }}
                >
                  {extraProps.isLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      {getWorkflowDefinitionLabelDynamic('CDL_COMMON_LOADING')}
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
                <FormError
                  error={hasError ? (fieldState.error?.message as string) : ''}
                  touched={true}
                />
              </FormControl>
            )
          }}
        />
      </Grid>
    )
  }

  const renderCheckboxField = (
    name: keyof DefinitionFormData,
    label?: string,
    gridSize: number = 6,
    extraProps: {
      disabled?: boolean
      defaultValue?: boolean
      onChange?: (value: boolean) => void
    } = {}
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={extraProps.defaultValue ?? false}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!field.value}
                onChange={(e) => {
                  const val = (e.target as HTMLInputElement).checked
                  field.onChange(val)
                  if (extraProps.onChange) extraProps.onChange(val)
                }}
                disabled={extraProps.disabled}
                sx={{
                  color: '#CAD5E2',
                  '&.Mui-checked': {
                    color: '#2563EB',
                  },
                }}
              />
            }
            label={
              label ??
              name
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())
            }
            sx={{
              '& .MuiFormControlLabel-label': {
                fontFamily: 'Outfit, sans-serif',
                fontStyle: 'normal',
                fontSize: '14px',
                lineHeight: '24px',
                letterSpacing: '0.5px',
                verticalAlign: 'middle',
              },
            }}
          />
        )}
      />
    </Grid>
  )

  const handleDrawerClose = (
    _event: React.KeyboardEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      onClose()
    }
  }
  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={handleDrawerClose}
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
          ? `${getWorkflowDefinitionLabelDynamic('CDL_COMMON_UPDATE')} ${getWorkflowDefinitionLabelDynamic('CDL_WD_WORKFLOW_DEFINITION')}`
          : `${getWorkflowDefinitionLabelDynamic('CDL_COMMON_ADD')} ${getWorkflowDefinitionLabelDynamic('CDL_WD_WORKFLOW_DEFINITION')}`}
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

      <form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
        <DialogContent
          dividers
          sx={{
            borderColor: tokens.dividerColor,
            backgroundColor: tokens.paper.backgroundColor as string,
          }}
        >
          {errorMessage && (
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
              {errorMessage}
            </Alert>
          )}

          {formLoading && (
            <Alert
              severity="info"
              variant="outlined"
              sx={{
                mb: 2,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(59, 130, 246, 0.08)'
                    : 'rgba(219, 234, 254, 0.4)',
                borderColor: alpha(theme.palette.info.main, 0.4),
                color: theme.palette.info.main,
              }}
            >
              {getWorkflowDefinitionLabelDynamic('CDL_COMMON_LOADING')}
            </Alert>
          )}
          <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
            {renderTextField(
              'name',
              getWorkflowDefinitionLabelDynamic('CDL_WD_NAME'),
              'text',
              12,
              true
            )}
            {renderTextField(
              'version',
              getWorkflowDefinitionLabelDynamic('CDL_WD_VERSION'),
              'number',
              12,
              true
            )}
            {renderTextField(
              'moduleCode',
              getWorkflowDefinitionLabelDynamic('CDL_WD_MODULE_CODE'),
              'text',
              12,
              true
            )}
            {renderTextField(
              'actionCode',
              getWorkflowDefinitionLabelDynamic('CDL_WD_ACTION_CODE'),
              'text',
              12,
              true
            )}
            {/* {renderSelectField(
              'applicationModuleId',
              getWorkflowDefinitionLabelDynamic('CDL_WD_APPLICATION_MODULE_DTO'),
              moduleOptions.map((option) => ({
                label: option.label,
                value: option.value,
                id: option.id,
              })),
              12,
              true,
              {
                isLoading: formLoading,
                disabled: isSubmitting || isViewMode,
              }
            )} */}
            {renderSelectField(
              'workflowActionId',
              getWorkflowDefinitionLabelDynamic('CDL_WD_WORKFLOW_ACTION_DTO'),
              actionOptions.map((option) => ({
                label: option.label,
                value: option.value,
                id: option.id,
              })),
              12,
              true,
              {
                isLoading: formLoading,
                disabled: isSubmitting || isViewMode,
              }
            )}
            {/* <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 3, mb: 5 }}>
                {renderCheckboxField(
                  'amountBased',
                  getWorkflowDefinitionLabelDynamic('CDL_WD_AMOUNT_BASED'),
                  6,
                  { disabled: isSubmitting, defaultValue: false }
                )}

               
              </Box>
            </Grid> */}
          </Grid>
        </DialogContent>

        {!isViewMode && (
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
                  disabled={isSubmitting}
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
                  {getWorkflowDefinitionLabelDynamic('CDL_COMMON_CANCEL')}
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  type="submit"
                  disabled={isSubmitting}
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
                  {isSubmitting && (
                    <CircularProgress
                      size={20}
                      sx={{
                        color: theme.palette.primary.contrastText,
                      }}
                    />
                  )}
                  {isSubmitting
                    ? mode === 'edit'
                      ? getWorkflowDefinitionLabelDynamic('CDL_COMMON_UPDATING')
                      : getWorkflowDefinitionLabelDynamic('CDL_COMMON_ADDING')
                    : mode === 'edit'
                      ? getWorkflowDefinitionLabelDynamic('CDL_COMMON_UPDATE')
                      : getWorkflowDefinitionLabelDynamic('CDL_COMMON_ADD')}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </form>

      {/* Error and Success Notifications */}
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
  )
}

export const RightSlideWorkflowDefinitionPanel = React.memo(
  RightSlideWorkflowDefinitionPanelComponent
)
