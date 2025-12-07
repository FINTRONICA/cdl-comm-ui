'use client'

import React, { useEffect, useCallback } from 'react'
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
  FormHelperText,
} from '@mui/material'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import { Controller, useForm, FieldErrors } from 'react-hook-form'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { getLabelByConfigId as getWorkflowDefinitionLabel } from '@/constants/mappings/workflowMapping'
import { toast } from 'react-hot-toast'

import {
  useCreateWorkflowDefinition,
  useUpdateWorkflowDefinition,
  useWorkflowDefinitionForm,
} from '@/hooks/workflow'
import type { WorkflowDefinitionUIData } from '@/services/api/workflowApi'
import { getWorkflowDefinitionValidationRules } from '@/lib/validation/workflowDefinitionSchemas'
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

// Styles will be defined inside component to access theme
export const RightSlideWorkflowDefinitionPanel: React.FC<
  RightSlideWorkflowDefinitionPanelProps
> = ({ isOpen, onClose, mode = 'add', definitionData }) => {
  const theme = useTheme()
  const tokens = React.useMemo(() => buildPanelSurfaceTokens(theme), [theme])
  const createDefinition = useCreateWorkflowDefinition()
  const updateDefinition = useUpdateWorkflowDefinition()
  const validationRules = getWorkflowDefinitionValidationRules()

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
    mode: 'onChange',
  })

  const isSubmitting =
    createDefinition.isPending ||
    updateDefinition.isPending ||
    isFormSubmitting ||
    formLoading
  const isViewMode = mode === 'view'

  const isFormDirty = isDirty
  const canSave = isFormDirty && !isSubmitting && !isViewMode
  const canReset = isFormDirty && !isSubmitting && !isViewMode

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
              definitionData.applicationModuleId !== '-'
                ? parseInt(definitionData.applicationModuleId)
                : null,
            workflowActionId:
              definitionData.workflowActionId &&
              definitionData.workflowActionId !== '-'
                ? parseInt(definitionData.workflowActionId)
                : null,
            active: definitionData.enabled ?? true,
          }
        : DEFAULT_VALUES

    reset(values, { keepDirty: false })
    clearErrors()
  }, [isOpen, mode, definitionData, reset, clearErrors])

  const onSubmit = (data: DefinitionFormData) => {
    const createPayload = {
      name: data.name.trim(),
      version: data.version,
      amountBased: Boolean(data.amountBased),
      moduleCode: data.moduleCode.trim(),
      actionCode: data.actionCode.trim(),
      enabled: Boolean(data.active),
      applicationModuleId: data.applicationModuleId || null,
      workflowActionId: data.workflowActionId || null,
    }

    if (mode === 'edit') {
      if (definitionData?.id) {
        const updatePayload = {
          name: data.name.trim(),
          version: data.version,
          amountBased: Boolean(data.amountBased),
          moduleCode: data.moduleCode.trim(),
          actionCode: data.actionCode.trim(),
          enabled: Boolean(data.active),
          applicationModuleId: data.applicationModuleId || null,
          workflowActionId: data.workflowActionId || null,
        }

        updateDefinition.mutate(
          { id: definitionData.id.toString(), updates: updatePayload },
          {
            onSuccess: () => {
              onClose()
            },
            onError: (err: Error | unknown) => {
              const errorMessage =
                err instanceof Error ? err.message : 'Unknown error occurred'
              toast.error(
                `Failed to update workflow definition: ${errorMessage}`
              )
            },
          }
        )
      }
    } else {
      createDefinition.mutate(createPayload, {
        onSuccess: () => {
          onClose()
        },
        onError: (err: Error | unknown) => {
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown error occurred'
          toast.error(`Failed to create workflow definition: ${errorMessage}`)
        },
      })
    }
  }

  const handleResetToLoaded = useCallback(() => {
    const loaded: DefinitionFormData =
      mode === 'edit' && definitionData
        ? {
            name: definitionData.name ?? '',
            version: definitionData.version ?? 1,
            amountBased: definitionData.amountBased ?? false,
            moduleCode: definitionData.moduleCode ?? '',
            actionCode: definitionData.actionCode ?? '',
            applicationModuleId:
              definitionData.applicationModuleId &&
              definitionData.applicationModuleId !== '-'
                ? parseInt(definitionData.applicationModuleId)
                : null,
            workflowActionId:
              definitionData.workflowActionId &&
              definitionData.workflowActionId !== '-'
                ? parseInt(definitionData.workflowActionId)
                : null,
            active: definitionData.enabled ?? true,
          }
        : DEFAULT_VALUES
    reset(loaded, { keepDirty: false })
    clearErrors()
  }, [mode, definitionData, reset, clearErrors])

  const onError = (errors: FieldErrors<DefinitionFormData>) => {
    console.log(errors)
  }

  const renderTextField = (
    name: keyof DefinitionFormData,
    label: string,
    type: 'text' | 'number' = 'text',
    gridSize: number = 12,
    required: boolean = true,
    showRedAsterisk: boolean = false
  ) => {
    const fieldRules =
      validationRules[name as keyof typeof validationRules] || {}

    return (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          rules={fieldRules}
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
              <TextField
                {...field}
                type={type}
                label={label}
                fullWidth
                disabled={isSubmitting || isViewMode}
                required={required}
                error={hasError}
                helperText={
                  hasError ? fieldState.error?.message || 'Invalid input' : ''
                }
                InputLabelProps={{ sx: dynamicLabelSx }}
                InputProps={{
                  sx: valueSx,
                  inputProps: {
                    maxLength:
                      name === 'name' ||
                      name === 'moduleCode' ||
                      name === 'actionCode'
                        ? 100
                        : undefined,
                    pattern:
                      name === 'name'
                        ? '[a-zA-Z\\s\\-_]*'
                        : name === 'moduleCode' || name === 'actionCode'
                          ? '[a-zA-Z\\-_]*'
                          : undefined,
                  },
                }}
                sx={fieldStyles}
                onChange={(e) => {
                  let value = e.target.value

                  if (type === 'number') {
                    // Allow decimal numbers for version
                    const numericValue = value.replace(/[^0-9.]/g, '')

                    // Ensure only one decimal point
                    const parts = numericValue.split('.')
                    if (parts.length > 2) {
                      value = parts[0] + '.' + parts.slice(1).join('')
                    } else {
                      value = numericValue
                    }

                    // Limit to 10
                    const numValue = Number(value)
                    if (!isNaN(numValue) && numValue > 10) {
                      value = '10'
                    }

                    field.onChange(value)
                  } else if (name === 'name') {
                    // Allow letters, spaces, hyphens, underscores - remove numbers
                    const textValue = value.replace(/[0-9]/g, '').slice(0, 100)
                    field.onChange(textValue)
                  } else if (name === 'moduleCode' || name === 'actionCode') {
                    // Allow only letters, hyphens, underscores - remove numbers and spaces
                    const textValue = value
                      .replace(/[0-9\\s]/g, '')
                      .slice(0, 100)
                    field.onChange(textValue)
                  } else {
                    field.onChange(value)
                  }
                }}
                onKeyDown={(e) => {
                  // Prevent number keys for text fields that shouldn't have numbers
                  if (name === 'moduleCode' || name === 'actionCode') {
                    if (e.key >= '0' && e.key <= '9') {
                      e.preventDefault()
                    }
                  }
                }}
              />
            )
          }}
        />
      </Grid>
    )
  }

  type OptionItem = {
    label: string
    value: string | number
    id?: string | number
  }

  const renderSelectField = (
    name: keyof DefinitionFormData,
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

    const fieldRules =
      validationRules[name as keyof typeof validationRules] || {}

    return (
      <Grid key={String(name)} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          defaultValue={''}
          rules={fieldRules}
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
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const val = (e.target as HTMLInputElement).value
                    field.onChange(val)
                    if (extraProps.onChange) extraProps.onChange(val)
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
          width: '460px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${tokens.dividerColor}`,
          backgroundColor: tokens.paper.backgroundColor as string,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <DialogTitle
            sx={{
              p: 0,
              fontSize: '20px',
              fontWeight: 500,
              fontStyle: 'normal',
              color: theme.palette.text.primary,
            }}
          >
            {mode === 'edit'
              ? 'Edit Workflow Definition'
              : 'Add Workflow Definition'}
          </DialogTitle>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <CancelOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <DialogContent
          dividers
          sx={{
            borderColor: tokens.dividerColor,
            backgroundColor: tokens.paper.backgroundColor as string,
          }}
        >
          <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
            {renderTextField(
              'name',
              getWorkflowDefinitionLabel('CDL_WD_NAME'),
              'text',
              12,
              true,
              true
            )}
            {renderTextField(
              'version',
              getWorkflowDefinitionLabel('CDL_WD_VERSION'),
              'number',
              12,
              true,
              true
            )}
            {renderTextField(
              'moduleCode',
              getWorkflowDefinitionLabel('CDL_WD_MODULE_CODE'),
              'text',
              12,
              true,
              true
            )}
            {renderTextField(
              'actionCode',
              getWorkflowDefinitionLabel('CDL_WD_ACTION_CODE'),
              'text',
              12,
              true,
              true
            )}

            {renderSelectField(
              'applicationModuleId',
              `${getWorkflowDefinitionLabel('CDL_WD_APPLICATION_MODULE_ID')}`,
              moduleOptions as OptionItem[],
              12,
              true,
              true,
              {
                isLoading: formLoading,
                disabled: isSubmitting || isViewMode,
              }
            )}
            {renderSelectField(
              'workflowActionId',
              `${getWorkflowDefinitionLabel('CDL_WD_WORKFLOW_ACTION_ID')}`,
              actionOptions.map((option) => ({
                label: option.label,
                value: option.value,
                id: option.id,
              })),
              12,
              true,
              true,
              {
                isLoading: formLoading,
                disabled: isSubmitting || isViewMode,
              }
            )}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 3, mb: 5 }}>
                {renderCheckboxField(
                  'amountBased',
                  getWorkflowDefinitionLabel('CDL_WD_AMOUNT_BASED'),
                  6,
                  { disabled: isSubmitting, defaultValue: false }
                )}

                {renderCheckboxField(
                  'active',
                  getWorkflowDefinitionLabel('CDL_WD_ACTIVE'),
                  6,
                  { disabled: isSubmitting, defaultValue: true }
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        {!isViewMode && (
          <Box
            sx={{
              position: 'relative',
              top: 20,
              left: 0,
              right: 0,
              padding: 2,
              borderTop: `1px solid ${tokens.dividerColor}`,
              backgroundColor: alpha(
                theme.palette.background.paper,
                theme.palette.mode === 'dark' ? 0.92 : 0.9
              ),
              backdropFilter: 'blur(10px)',
            }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleResetToLoaded}
                  disabled={!canReset}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontStyle: 'normal',
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: 0,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    opacity: canReset ? 1 : 0.5,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor:
                      theme.palette.mode === 'dark'
                        ? theme.palette.primary.main
                        : 'transparent',
                  }}
                >
                  Reset
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={!canSave}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontStyle: 'normal',
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: 0,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    opacity: canSave ? 1 : 0.5,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor:
                      theme.palette.mode === 'dark'
                        ? theme.palette.primary.main
                        : 'transparent',
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
                    ? formLoading
                      ? 'Loading...'
                      : mode === 'edit'
                        ? 'Updating...'
                        : 'Creating...'
                    : mode === 'edit'
                      ? 'Update'
                      : 'Save'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </form>
    </Drawer>
  )
}
