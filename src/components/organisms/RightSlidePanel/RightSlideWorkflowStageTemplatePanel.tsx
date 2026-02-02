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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Snackbar,
  OutlinedInput,
} from '@mui/material'
import { Controller, useForm, FieldErrors } from 'react-hook-form'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { getWorkflowLabelsByCategory as getWorkflowStageTemplateLabel } from '@/constants/mappings/workflowMapping'
import { getWorkflowStageTemplateValidationRules } from '@/lib/validation/workflowStageTemplateSchemas'
import { FormError } from '../../atoms/FormError'
import { useBuildWorkflowStageTemplateLabelsWithCache } from '@/hooks/workflow/useWorkflowStageTemplateLabelsWithCache'
import { useAppStore } from '@/store'

import {
  useCreateWorkflowStageTemplate,
  useUpdateWorkflowStageTemplate,
  useWorkflowStageTemplateForm,
} from '@/hooks/workflow'
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const commonFieldStyles = React.useMemo(() => tokens.input, [tokens])
  const errorFieldStyles = React.useMemo(() => tokens.inputError, [tokens])
  const createTemplate = useCreateWorkflowStageTemplate()
  const updateTemplate = useUpdateWorkflowStageTemplate()
  const user = useAuthStore((s) => s.user)

  // Dynamic labels: same pattern used in Build Partner Beneficiary Panel
  const { data: workflowStageTemplateLabels, getLabel } =
    useBuildWorkflowStageTemplateLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'
  const getWorkflowStageTemplateLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getWorkflowStageTemplateLabel(configId)
      if (workflowStageTemplateLabels) {
        return getLabel(configId, currentLanguage, fallback)
      }
      return fallback
    },
    [workflowStageTemplateLabels, currentLanguage, getLabel]
  )

  const { workflowDefinitionOptions, isLoading: formLoading } =
    useWorkflowStageTemplateForm()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting: isFormSubmitting, isDirty },
    clearErrors,
  } = useForm<StageTemplateFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const isSubmitting =
    createTemplate.isPending ||
    updateTemplate.isPending ||
    isFormSubmitting ||
    formLoading
  const isViewMode = mode === 'view'

  const labelSx = tokens.label
  const valueSx = tokens.value

  // Get validation rules from schema - same pattern as reference
  const validationRules = useMemo(
    () => getWorkflowStageTemplateValidationRules(),
    []
  )

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
              ? (() => {
                  const extracted = extractWorkflowDefinitionId(
                    templateData.workflowDefinitionDTO
                  )
                  // Convert to number if possible, otherwise keep as string
                  if (extracted === null) return null
                  if (typeof extracted === 'number') return extracted
                  const num = parseInt(String(extracted), 10)
                  return isNaN(num) ? extracted : num
                })()
              : null,
          }
        : DEFAULT_VALUES

    reset(values, { keepDirty: false })
    clearErrors()
    setErrorMessage(null)
  }, [isOpen, mode, templateData, reset, clearErrors])

  const extractWorkflowDefinitionId = (
    workflowDefinitionDTO:
      | string
      | number
      | Record<string, unknown>
      | null
      | undefined
  ): number | string | null => {
    try {
      // Handle null/undefined
      if (
        workflowDefinitionDTO === null ||
        workflowDefinitionDTO === undefined
      ) {
        return null
      }

      // Handle number directly
      if (typeof workflowDefinitionDTO === 'number') {
        return isNaN(workflowDefinitionDTO) ? null : workflowDefinitionDTO
      }

      // Handle object with id property
      if (
        workflowDefinitionDTO &&
        typeof workflowDefinitionDTO === 'object' &&
        'id' in workflowDefinitionDTO
      ) {
        const id = workflowDefinitionDTO.id
        if (typeof id === 'number') {
          return isNaN(id) ? null : id
        }
        if (typeof id === 'string') {
          const parsedId = parseInt(id, 10)
          return isNaN(parsedId) ? id : parsedId
        }
        return null
      }

      // Handle string (could be numeric string or non-numeric)
      if (typeof workflowDefinitionDTO === 'string') {
        const trimmed = workflowDefinitionDTO.trim()
        if (
          trimmed === '' ||
          trimmed === '-' ||
          trimmed === 'null' ||
          trimmed === 'undefined'
        ) {
          return null
        }
        // Try to parse as number
        const parsedId = parseInt(trimmed, 10)
        // If it's a valid number string, return the number
        if (!isNaN(parsedId) && String(parsedId) === trimmed) {
          return parsedId
        }
        // Otherwise return the string as-is (might be needed for some APIs)
        return trimmed
      }

      return null
    } catch {
      return null
    }
  }

  const onSubmit = async (data: StageTemplateFormData) => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)

      if (isSubmitting) {
        return
      }

      // Only check isDirty for edit mode, not for add mode
      if (mode === 'edit' && !isDirty) {
        setErrorMessage('No changes to save.')
        return
      }

      const workflowDefinitionDTO = data.workflowDefinitionId
        ? String(data.workflowDefinitionId)
        : ''

      // Sanitize and validate input data
      const sanitizedStageKey = data.stageKey.trim().replace(/[^A-Za-z_-]/g, '')
      const sanitizedKeycloakGroup = data.keycloakGroup.trim().replace(/[^A-Za-z0-9._-]/g, '')
      const sanitizedName = data.name.trim().replace(/[0-9]/g, '')

      const createPayload = {
        stageOrder: Math.max(1, Math.min(10, data.stageOrder)),
        stageKey: sanitizedStageKey,
        keycloakGroup: sanitizedKeycloakGroup,
        requiredApprovals: Math.max(1, Math.min(10, data.requiredApprovals)),
        name: sanitizedName,
        description: data.description.trim().slice(0, 500),
        slaHours: Math.max(1, Math.min(9999, data.slaHours)),
        workflowDefinitionDTO: workflowDefinitionDTO,
        createdBy: user?.name || 'system',
      }

      if (mode === 'edit') {
        if (!templateData?.id) {
          setErrorMessage('Invalid or missing template ID for update')
          return
        }

        // Sanitize and validate input data
        const sanitizedStageKey = data.stageKey.trim().replace(/[^A-Za-z_-]/g, '')
        const sanitizedKeycloakGroup = data.keycloakGroup.trim().replace(/[^A-Za-z0-9._-]/g, '')
        const sanitizedName = data.name.trim().replace(/[0-9]/g, '')

        const updatePayload = {
          id: templateData.id.toString(),
          stageOrder: Math.max(1, Math.min(10, data.stageOrder)),
          stageKey: sanitizedStageKey,
          keycloakGroup: sanitizedKeycloakGroup,
          requiredApprovals: Math.max(1, Math.min(10, data.requiredApprovals)),
          name: sanitizedName,
          description: data.description.trim().slice(0, 500),
          slaHours: Math.max(1, Math.min(9999, data.slaHours)),
          workflowDefinitionDTO: workflowDefinitionDTO,
          updatedBy: user?.name || 'system',
        }

        await updateTemplate.mutateAsync({
          id: templateData.id.toString(),
          updates: updatePayload,
        })

        setSuccessMessage('Workflow stage template updated successfully!')
        setTimeout(() => {
          reset()
          onClose()
        }, 1500)
      } else {
        await createTemplate.mutateAsync(createPayload)

        setSuccessMessage('Workflow stage template created successfully!')
        setTimeout(() => {
          reset()
          onClose()
        }, 1500)
      }
    } catch (error: unknown) {
      let errorMsg = 'Failed to save workflow stage template. Please try again.'

      if (error instanceof Error) {
        if (error.message.includes('validation')) {
          errorMsg = 'Please check your input and try again.'
        } else {
          errorMsg = error.message
        }
      }

      setErrorMessage(errorMsg)
    }
  }

  const handleClose = () => {
    reset()
    setErrorMessage(null)
    setSuccessMessage(null)
    onClose()
  }

  const onError = (errors: FieldErrors<StageTemplateFormData>) => {
    const firstError = Object.values(errors)[0]
    if (firstError?.message) {
      setErrorMessage(firstError.message as string)
    }
  }

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
        backgroundColor:
          theme.palette.mode === 'dark'
            ? alpha('#1E293B', 0.5) // Darker background for inputs in dark mode
            : '#FFFFFF', // White background for inputs in light mode
        '& fieldset': {
          borderColor:
            theme.palette.mode === 'dark'
              ? alpha('#FFFFFF', 0.3) // White border with opacity for dark mode
              : '#CAD5E2', // Light border for light mode
          borderWidth: '1px',
        },
        '&:hover fieldset': {
          borderColor:
            theme.palette.mode === 'dark'
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
    name: keyof StageTemplateFormData,
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
                    ? getWorkflowStageTemplateLabelDynamic('CDL_COMMON_LOADING')
                    : label}
                </InputLabel>
                <Select
                  {...field}
                  value={field.value ?? ''}
                  input={
                    <OutlinedInput
                      label={
                        extraProps.isLoading
                          ? getWorkflowStageTemplateLabelDynamic(
                              'CDL_COMMON_LOADING'
                            )
                          : label
                      }
                    />
                  }
                  label={
                    extraProps.isLoading
                      ? getWorkflowStageTemplateLabelDynamic(
                          'CDL_COMMON_LOADING'
                        )
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
                    const numVal =
                      val === '' ? null : isNaN(Number(val)) ? val : Number(val)
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
                      {getWorkflowStageTemplateLabelDynamic(
                        'CDL_COMMON_LOADING'
                      )}
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

  const renderTextField = (
    name: keyof StageTemplateFormData,
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
                      name === 'description'
                        ? 500
                        : name === 'stageKey'
                          ? 50
                          : name === 'keycloakGroup'
                            ? 100
                            : name === 'name'
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
          ? `${getWorkflowStageTemplateLabelDynamic('CDL_COMMON_UPDATE')} ${getWorkflowStageTemplateLabelDynamic('CDL_WST_WORKFLOW_STAGE_TEMPLATE')}`
          : `${getWorkflowStageTemplateLabelDynamic('CDL_COMMON_ADD')} ${getWorkflowStageTemplateLabelDynamic('CDL_WST_WORKFLOW_STAGE_TEMPLATE')}`}
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
              {getWorkflowStageTemplateLabelDynamic('CDL_COMMON_LOADING')}
            </Alert>
          )}

          <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
            {renderTextField(
              'name',
              getWorkflowStageTemplateLabelDynamic('CDL_WST_NAME'),
              'text',
              12,
              true
            )}
            {renderTextField(
              'stageOrder',
              getWorkflowStageTemplateLabelDynamic('CDL_WST_ORDER'),
              'number',
              12,
              true
            )}
            {renderTextField(
              'stageKey',
              getWorkflowStageTemplateLabelDynamic('CDL_WST_KEY'),
              'text',
              12,
              true
            )}
            {renderTextField(
              'keycloakGroup',
              getWorkflowStageTemplateLabelDynamic('CDL_WST_GROUP'),
              'text',
              12,
              true
            )}
            {renderTextField(
              'requiredApprovals',
              getWorkflowStageTemplateLabelDynamic(
                'CDL_WST_REQUIRED_APPROVALS'
              ),
              'number',
              12,
              true
            )}
            {renderTextField(
              'slaHours',
              getWorkflowStageTemplateLabelDynamic('CDL_WST_SLA_HOURS'),
              'number',
              12,
              true
            )}

            {renderTextField(
              'description',
              getWorkflowStageTemplateLabelDynamic('CDL_WST_DESCRIPTION'),
              'text',
              12,
              false
            )}

            {renderSelectField(
              'workflowDefinitionId',
              getWorkflowStageTemplateLabelDynamic(
                'CDL_WST_WORKFLOW_DEFINITION_DTO'
              ),
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
                  {getWorkflowStageTemplateLabelDynamic('CDL_COMMON_CANCEL')}
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
                      ? getWorkflowStageTemplateLabelDynamic(
                          'CDL_COMMON_UPDATING'
                        )
                      : getWorkflowStageTemplateLabelDynamic(
                          'CDL_COMMON_ADDING'
                        )
                    : mode === 'edit'
                      ? getWorkflowStageTemplateLabelDynamic(
                          'CDL_COMMON_UPDATE'
                        )
                      : getWorkflowStageTemplateLabelDynamic('CDL_COMMON_ADD')}
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
