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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormHelperText,
} from '@mui/material'
import { Controller, useForm, FieldErrors } from 'react-hook-form'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { toast } from 'react-hot-toast'
import { getLabelByConfigId as getWorkflowStageTemplateLabel } from '@/constants/mappings/workflowMapping'

import {
  useCreateWorkflowStageTemplate,
  useUpdateWorkflowStageTemplate,
  useWorkflowStageTemplateForm,
} from '@/hooks/workflow'
import { getWorkflowStageTemplateValidationRules } from '@/lib/validation'
import { useAuthStore } from '@/store/authStore'
import type { WorkflowStageTemplate } from '@/services/api/workflowApi'
import { alpha, useTheme } from '@mui/material/styles'
import { buildPanelSurfaceTokens } from './panelTheme'

interface RightSlideWorkflowStageTemplatePanelProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'add' | 'edit' | 'view'
  templateData?: WorkflowStageTemplate | null
}

type StageTemplateFormData = {
  stageOrder: number
  stageKey: string
  keycloakGroup: string
  requiredApprovals: number
  name: string
  description: string
  slaHours: number
  workflowDefinitionId: number | string | null
}

const DEFAULT_VALUES: StageTemplateFormData = {
  stageOrder: 1,
  stageKey: '',
  keycloakGroup: '',
  requiredApprovals: 1,
  name: '',
  description: '',
  slaHours: 24,
  workflowDefinitionId: null,
}
// Styles will be defined inside component to access theme

export const RightSlideWorkflowStageTemplatePanel: React.FC<
  RightSlideWorkflowStageTemplatePanelProps
> = ({ isOpen, onClose, mode = 'add', templateData }) => {
  const theme = useTheme()
  const tokens = React.useMemo(() => buildPanelSurfaceTokens(theme), [theme])
  const createTemplate = useCreateWorkflowStageTemplate()
  const updateTemplate = useUpdateWorkflowStageTemplate()
  const user = useAuthStore((s) => s.user)

  const { workflowDefinitionOptions, isLoading: formLoading } =
    useWorkflowStageTemplateForm()

  const validationRules = getWorkflowStageTemplateValidationRules()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting: isFormSubmitting, isDirty },
    clearErrors,
    trigger,
  } = useForm<StageTemplateFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const isSubmitting =
    createTemplate.isPending ||
    updateTemplate.isPending ||
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

    const values: StageTemplateFormData =
      mode === 'edit' && templateData
        ? {
            stageOrder: templateData.stageOrder ?? 1,
            stageKey: templateData.stageKey ?? '',
            keycloakGroup: templateData.keycloakGroup ?? '',
            requiredApprovals: templateData.requiredApprovals ?? 1,
            name: templateData.name ?? '',
            description: templateData.description ?? '',
            slaHours: templateData.slaHours ?? 24,
            workflowDefinitionId: templateData.workflowDefinitionDTO
              ? extractWorkflowDefinitionId(templateData.workflowDefinitionDTO)
              : null,
          }
        : DEFAULT_VALUES

    reset(values, { keepDirty: false })
    clearErrors()
  }, [isOpen, mode, templateData, reset, clearErrors])

  const extractWorkflowDefinitionId = (
    workflowDefinitionDTO: string | Record<string, unknown>
  ): number | null => {
    try {
      if (typeof workflowDefinitionDTO === 'number') {
        return workflowDefinitionDTO
      }

      if (
        workflowDefinitionDTO &&
        typeof workflowDefinitionDTO === 'object' &&
        workflowDefinitionDTO.id
      ) {
        const id = parseInt(workflowDefinitionDTO.id.toString(), 10)
        return isNaN(id) ? null : id
      }

      if (typeof workflowDefinitionDTO === 'string') {
        const id = parseInt(workflowDefinitionDTO, 10)
        return isNaN(id) ? null : id
      }

      return null
    } catch {
      return null
    }
  }

  const onSubmit = async (data: StageTemplateFormData) => {
    try {
      const isValid = await trigger()
      if (!isValid) {
        return
      }
      const workflowDefinitionDTO = data.workflowDefinitionId
        ? String(data.workflowDefinitionId)
        : ''

      // Create payload with only the required fields for CREATE
      const createPayload = {
        stageOrder: data.stageOrder,
        stageKey: data.stageKey.trim(),
        keycloakGroup: data.keycloakGroup.trim(),
        requiredApprovals: data.requiredApprovals,
        name: data.name.trim(),
        description: data.description.trim(),
        slaHours: data.slaHours,
        workflowDefinitionDTO: workflowDefinitionDTO,
        createdBy: user?.name || 'system',
      }

      if (mode === 'edit') {
        if (templateData?.id) {
          // Create update payload with only the required fields
          const updatePayload = {
            id: templateData.id.toString(),
            stageOrder: data.stageOrder,
            stageKey: data.stageKey.trim(),
            keycloakGroup: data.keycloakGroup.trim(),
            requiredApprovals: data.requiredApprovals,
            name: data.name.trim(),
            description: data.description.trim(),
            slaHours: data.slaHours,
            workflowDefinitionDTO: workflowDefinitionDTO,
            updatedBy: user?.name || 'system',
          }

          updateTemplate.mutate(
            { id: templateData.id.toString(), updates: updatePayload },
            {
              onSuccess: () => {
                toast.success('Workflow stage template updated successfully!')
                onClose()
              },
              onError: (err: Error | unknown) => {
                const error = err as Error & {
                  response?: { data?: { message?: string } }
                }
                const message =
                  error?.response?.data?.message ||
                  error?.message ||
                  'Failed to update workflow stage template'
                toast.error(message)
              },
            }
          )
        }
      } else {
        createTemplate.mutate(createPayload, {
          onSuccess: () => {
            toast.success('Workflow stage template created successfully!')
            onClose()
          },
          onError: (err: Error | unknown) => {
            const error = err as Error & {
              response?: { data?: { message?: string } }
            }
            const message =
              error?.response?.data?.message ||
              error?.message ||
              'Failed to create workflow stage template'
            toast.error(message)
          },
        })
      }
    } catch (error) {
      throw error
    } finally {
    }
  }

  const handleResetToLoaded = useCallback(() => {
    const loaded: StageTemplateFormData =
      mode === 'edit' && templateData
        ? {
            stageOrder: templateData.stageOrder ?? 1,
            stageKey: templateData.stageKey ?? '',
            keycloakGroup: templateData.keycloakGroup ?? '',
            requiredApprovals: templateData.requiredApprovals ?? 1,
            name: templateData.name ?? '',
            description: templateData.description ?? '',
            slaHours: templateData.slaHours ?? 24,
            workflowDefinitionId: templateData.workflowDefinitionDTO
              ? extractWorkflowDefinitionId(templateData.workflowDefinitionDTO)
              : null,
          }
        : DEFAULT_VALUES
    reset(loaded, { keepDirty: false })
    clearErrors()
  }, [mode, templateData, reset, clearErrors])

  const onError = (errors: FieldErrors<StageTemplateFormData>) => {
    console.log(errors)
  }

  type OptionItem = {
    label: string
    value: string | number
    id?: string | number
  }

  const renderSelectField = (
    name: keyof StageTemplateFormData,
    label: string,
    options?: OptionItem[] | string[],
    gridSize: number = 6,
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
          rules={validationRules[name] || {}}
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
                  required={true}
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
                  disabled={
                    !!extraProps.disabled ||
                    !!extraProps.isLoading ||
                    isSubmitting ||
                    isViewMode
                  }
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
                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
                )}
              </FormControl>
            )
          }}
        />
      </Grid>
    )
  }

  const renderTextField = (
    name: keyof StageTemplateFormData,
    label: string,
    type: 'text' | 'number' = 'text',
    gridSize: number = 12,
    required: boolean = true
  ) => {
    const fieldRules = validationRules[name] || {}

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

            const labelStyles = {
              ...labelSx,
              color: hasError ? theme.palette.error.main : tokens.label.color,
              '& .MuiFormLabel-asterisk': {
                color: required ? theme.palette.error.main : 'inherit',
              },
              '&.Mui-focused': {
                color: hasError
                  ? theme.palette.error.main
                  : theme.palette.primary.main,
              },
            }

            return (
              <Box>
                <TextField
                  {...field}
                  type={type}
                  label={label}
                  fullWidth
                  disabled={isSubmitting || isViewMode}
                  required={required}
                  error={hasError}
                  helperText={hasError ? fieldState.error?.message : ''}
                  InputLabelProps={{ sx: labelStyles }}
                  InputProps={{
                    sx: valueSx,
                    inputProps: {
                      maxLength:
                        name === 'description'
                          ? 500
                          : name === 'stageKey'
                            ? 50
                            : name === 'keycloakGroup'
                              ? 100
                              : name === 'name'
                                ? 100
                                : name === 'stageOrder'
                                  ? 2
                                  : name === 'requiredApprovals'
                                    ? 2
                                    : name === 'slaHours'
                                      ? 4
                                      : undefined,
                    },
                  }}
                  sx={fieldStyles}
                  onChange={(e) => {
                    let value = e.target.value

                    if (type === 'text') {
                      if (name === 'name') {
                        value = value.replace(/[0-9]/g, '').slice(0, 100)
                      } else if (name === 'stageKey') {
                        value = value
                          .replace(/[0-9]/g, '')
                          .replace(/[^A-Za-z_-]/g, '')
                          .slice(0, 50)
                      } else if (name === 'keycloakGroup') {
                        value = value
                          .replace(/[^A-Za-z0-9._-]/g, '')
                          .slice(0, 100)
                      } else if (name === 'description') {
                        value = value.slice(0, 500)
                      }
                    } else if (type === 'number') {
                      if (name === 'stageOrder') {
                        if (value === '') {
                          value = value
                        } else {
                          const numValue = parseInt(value)
                          if (!isNaN(numValue)) {
                            if (numValue > 10) {
                              value = '10'
                            } else if (numValue < 0 && value.length > 1) {
                              value = '0'
                            }
                          }
                        }
                        value = value.slice(0, 2)
                      } else if (name === 'requiredApprovals') {
                        if (value === '') {
                          value = value
                        } else {
                          const numValue = parseInt(value)
                          if (!isNaN(numValue)) {
                            if (numValue > 10) {
                              value = '10'
                            } else if (numValue < 0 && value.length > 1) {
                              value = '0'
                            }
                          }
                        }
                        value = value.slice(0, 2)
                      } else if (name === 'slaHours') {
                        if (value === '') {
                          value = value
                        } else {
                          const numValue = parseInt(value)
                          if (!isNaN(numValue)) {
                            if (numValue > 9999) {
                              value = '9999'
                            }
                          }
                        }
                        value = value.slice(0, 4)
                      }
                    }

                    const finalValue = type === 'number' ? Number(value) : value
                    field.onChange(finalValue)
                  }}
                  onBlur={(e) => {
                    let value = e.target.value

                    if (name === 'stageKey') {
                      value = value
                        .replace(/[0-9]/g, '')
                        .replace(/[^A-Za-z_-]/g, '')
                      if (value !== e.target.value) {
                        field.onChange(value)
                      }
                    }

                    if (type === 'number') {
                      if (name === 'stageOrder') {
                        const numValue = parseInt(value) || 0
                        if (numValue < 0) {
                          value = '0'
                        } else if (numValue > 10) {
                          value = '10'
                        }
                      } else if (name === 'requiredApprovals') {
                        const numValue = parseInt(value) || 0
                        if (numValue < 0) {
                          value = '0'
                        } else if (numValue > 10) {
                          value = '10'
                        }
                      } else if (name === 'slaHours') {
                        const numValue = parseInt(value) || 0
                        if (numValue < 1) {
                          value = '1'
                        } else if (numValue > 9999) {
                          value = '9999'
                        }
                      }

                      field.onChange(Number(value))
                    }

                    field.onBlur()
                  }}
                />
              </Box>
            )
          }}
        />
      </Grid>
    )
  }

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
          backgroundColor: tokens.paper.backgroundColor,
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
              ? 'Edit Workflow Stage Template'
              : 'Add Workflow Stage Template '}
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
              getWorkflowStageTemplateLabel('CDL_ST_NAME'),
              'text',
              12,
              true
            )}
            {renderTextField(
              'stageOrder',
              getWorkflowStageTemplateLabel('CDL_ST_ORDER'),
              'number',
              12,
              true
            )}
            {renderTextField(
              'stageKey',
              getWorkflowStageTemplateLabel('CDL_ST_KEY'),
              'text',
              12,
              true
            )}
            {renderTextField(
              'keycloakGroup',
              getWorkflowStageTemplateLabel('CDL_ST_GROUP'),
              'text',
              12,
              true
            )}
            {renderTextField(
              'requiredApprovals',
              getWorkflowStageTemplateLabel('CDL_ST_REQUIRED_APPROVALS'),
              'number',
              12,
              true
            )}
            {renderTextField(
              'slaHours',
              getWorkflowStageTemplateLabel('CDL_ST_SLA_HOURS'),
              'number',
              12,
              true
            )}

            {renderTextField(
              'description',
              getWorkflowStageTemplateLabel('CDL_ST_DESCRIPTION'),
              'text',
              12,
              false
            )}

            {renderSelectField(
              'workflowDefinitionId',
              getWorkflowStageTemplateLabel('CDL_ST_WORKFLOW_DEFINITION'),
              workflowDefinitionOptions.map((option) => ({
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
