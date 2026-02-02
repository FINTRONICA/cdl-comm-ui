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
  FormControlLabel,
  Checkbox,
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
import { getWorkflowLabelsByCategory as getWorkflowAmountRuleLabel } from '@/constants/mappings/workflowMapping'
import { getWorkflowAmountRuleValidationRules } from '@/lib/validation/workflowAmountRuleSchemas'
import { FormError } from '../../atoms/FormError'
import { useWorkflowAmountRuleLabelsWithCache } from '@/hooks/workflow/useWorkflowAmountRuleLabelsWithCache'
import { useAppStore } from '@/store'

import {
  useCreateWorkflowAmountRule,
  useUpdateWorkflowAmountRule,
  useWorkflowAmountRuleForm,
  useFindAllWorkflowDefinitions,
} from '@/hooks/workflow'
import type {
  WorkflowAmountRuleUIData,
  CreateWorkflowAmountRuleRequest,
  UpdateWorkflowAmountRuleRequest,
} from '@/services/api/workflowApi'
import { alpha, useTheme } from '@mui/material/styles'
import { buildPanelSurfaceTokens } from './panelTheme'

interface RightSlideWorkflowAmountRulePanelProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'add' | 'edit' | 'view'
  amountRuleData?: WorkflowAmountRuleUIData | null
}

type AmountRuleFormData = {
  currency: string
  minAmount: number
  maxAmount: number
  priority: number
  requiredMakers: number
  requiredCheckers: number
  workflowDefinitionName: string
  enabled: boolean
}

interface WorkflowDefinition {
  id: string | number
  name: string
  version: number
}

const DEFAULT_VALUES: AmountRuleFormData = {
  currency: '',
  minAmount: 100,
  maxAmount: 100,
  priority: 1,
  requiredMakers: 1,
  requiredCheckers: 1,
  workflowDefinitionName: '',
  enabled: true,
}

// Styles will be defined inside component to access theme

export const RightSlideWorkflowAmountRulePanel: React.FC<
  RightSlideWorkflowAmountRulePanelProps
> = ({ isOpen, onClose, mode = 'add', amountRuleData }) => {
  const theme = useTheme()
  const tokens = React.useMemo(() => buildPanelSurfaceTokens(theme), [theme])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedWorkflowAmountRuleId, setSelectedWorkflowAmountRuleId] =
    useState<number | null>(null)
  const commonFieldStyles = React.useMemo(() => tokens.input, [tokens])
  const errorFieldStyles = React.useMemo(() => tokens.inputError, [tokens])
  const createAmountRule = useCreateWorkflowAmountRule()
  const updateAmountRule = useUpdateWorkflowAmountRule()

  // Dynamic labels: same pattern used in Build Partner Beneficiary Panel
  const { data: workflowAmountRuleLabels, getLabel } =
    useWorkflowAmountRuleLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'
  const getWorkflowAmountRuleLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getWorkflowAmountRuleLabel(configId)
      if (workflowAmountRuleLabels) {
        return getLabel(configId, currentLanguage, fallback)
      }
      return fallback
    },
    [workflowAmountRuleLabels, currentLanguage, getLabel]
  )

  const { isSubmitting: formLoading } = useWorkflowAmountRuleForm()

  const {
    data: workflowDefinitionsResponse,
    isLoading: workflowDefinitionsLoading,
  } = useFindAllWorkflowDefinitions()

  const workflowDefinitionOptions = useMemo(() => {
    if (!workflowDefinitionsResponse?.content) return []

    return workflowDefinitionsResponse.content.map(
      (def: WorkflowDefinition) => ({
        id: def.id,
        label: def.name,
        value: def.id,
        description: `${def.name} (v${def.version}) - Rule_${def.id}`,
      })
    )
  }, [workflowDefinitionsResponse])

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting: isFormSubmitting, isDirty },
    clearErrors,
  } = useForm<AmountRuleFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const isSubmitting =
    createAmountRule.isPending ||
    updateAmountRule.isPending ||
    isFormSubmitting ||
    formLoading ||
    workflowDefinitionsLoading
  const isViewMode = mode === 'view'

  const handleWorkflowDefinitionChange = useCallback(
    (workflowDefinitionName: string) => {
      const selectedDefinition = workflowDefinitionOptions.find(
        (option) => option.label === workflowDefinitionName
      )
      if (
        selectedDefinition &&
        typeof selectedDefinition.value === 'number'
      ) {
        setSelectedWorkflowAmountRuleId(selectedDefinition.value)
      } else {
        setSelectedWorkflowAmountRuleId(null)
      }
    },
    [workflowDefinitionOptions]
  )

  const extractWorkflowDefinitionId = useCallback(
    (
      workflowDefinitionDTO: string | Record<string, unknown> | number
    ): number | null => {
      if (typeof workflowDefinitionDTO === 'number') {
        return workflowDefinitionDTO
      }

      if (
        workflowDefinitionDTO &&
        typeof workflowDefinitionDTO === 'object' &&
        workflowDefinitionDTO.id
      ) {
        const id = parseInt(String(workflowDefinitionDTO.id), 10)
        return isNaN(id) ? null : id
      }

      if (typeof workflowDefinitionDTO === 'string') {
        const id = parseInt(workflowDefinitionDTO, 10)
        return isNaN(id) ? null : id
      }
      return null
    },
    []
  )

  useEffect(() => {
    if (!isOpen) return

    const extractedWorkflowDefinitionId =
      mode === 'edit' && amountRuleData?.workflowDefinitionDTO
        ? extractWorkflowDefinitionId(amountRuleData.workflowDefinitionDTO)
        : null

    const values: AmountRuleFormData =
      mode === 'edit' && amountRuleData
        ? ({
            currency: amountRuleData.currency ?? '',
            minAmount: amountRuleData.minAmount != null ? amountRuleData.minAmount : 100,
            maxAmount: amountRuleData.maxAmount != null ? amountRuleData.maxAmount : 100,
            priority: amountRuleData.priority != null ? amountRuleData.priority : 1,
            requiredMakers: amountRuleData.requiredMakers != null ? amountRuleData.requiredMakers : 1,
            requiredCheckers: amountRuleData.requiredCheckers != null ? amountRuleData.requiredCheckers : 1,
            workflowDefinitionName:
              amountRuleData.workflowDefinitionDTO?.name || '',
            enabled: amountRuleData.enabled ?? true,
          } as AmountRuleFormData)
        : DEFAULT_VALUES

    if (mode === 'edit' && extractedWorkflowDefinitionId) {
      setSelectedWorkflowAmountRuleId(extractedWorkflowDefinitionId)
    } else if (mode === 'add') {
      setSelectedWorkflowAmountRuleId(null)
    }

    reset(values, { keepDirty: false })
    clearErrors()
    setErrorMessage(null)
  }, [isOpen, mode, amountRuleData, reset, clearErrors, extractWorkflowDefinitionId])

  // Get validation rules from schema
  const validationRules = useMemo(() => getWorkflowAmountRuleValidationRules(), [])

  const onSubmit = async (data: AmountRuleFormData) => {
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

      // Validate workflow definition is selected
      if (!selectedWorkflowAmountRuleId || selectedWorkflowAmountRuleId === 0) {
        setErrorMessage('Workflow Definition is required')
        return
      }

      if (mode === 'edit') {
        if (!amountRuleData?.id) {
          setErrorMessage('Invalid or missing amount rule ID for update')
          return
        }

        const updatePayload: UpdateWorkflowAmountRuleRequest = {
          id: Number(amountRuleData.id),
          currency: data.currency.trim(),
          minAmount: Number(data.minAmount),
          maxAmount: Number(data.maxAmount),
          priority: Number(data.priority),
          requiredMakers: Number(data.requiredMakers),
          requiredCheckers: Number(data.requiredCheckers),
          workflowDefinitionId: selectedWorkflowAmountRuleId,
          enabled: data.enabled,
        }

        await updateAmountRule.mutateAsync({
          id: String(amountRuleData.id),
          updates: updatePayload,
        })

        setSuccessMessage('Workflow amount rule updated successfully!')
        setTimeout(() => {
          reset()
          onClose()
        }, 1500)
      } else {
        const createPayload: CreateWorkflowAmountRuleRequest = {
          currency: data.currency.trim(),
          minAmount: Number(data.minAmount),
          maxAmount: Number(data.maxAmount),
          priority: Number(data.priority),
          requiredMakers: Number(data.requiredMakers),
          requiredCheckers: Number(data.requiredCheckers),
          workflowDefinitionId: selectedWorkflowAmountRuleId,
          workflowId: selectedWorkflowAmountRuleId,
          amountRuleName: `Rule_${selectedWorkflowAmountRuleId}`,
          enabled: data.enabled,
        }

        await createAmountRule.mutateAsync(createPayload)

        setSuccessMessage('Workflow amount rule created successfully!')
        setTimeout(() => {
          reset()
          onClose()
        }, 1500)
      }
    } catch (error: unknown) {
      let errorMsg = 'Failed to save workflow amount rule. Please try again.'

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
    setSelectedWorkflowAmountRuleId(null)
    onClose()
  }

  const onError = (errors: FieldErrors<AmountRuleFormData>) => {
    const firstError = Object.values(errors)[0]
    if (firstError?.message) {
      setErrorMessage(firstError.message as string)
    }
  }

  const labelSx = tokens.label
  const valueSx = tokens.value

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
    name: keyof AmountRuleFormData,
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
          rules={validationRules[name] || {}}
          render={({ field, fieldState }) => {
            const hasError = !!fieldState.error

            return (
              <FormControl
                fullWidth
                error={hasError}
                required={showRedAsterisk}
                disabled={!!extraProps.disabled || !!extraProps.isLoading}
              >
                <InputLabel sx={labelSx}>
                  {extraProps.isLoading
                    ? getWorkflowAmountRuleLabelDynamic('CDL_COMMON_LOADING')
                    : label}
                </InputLabel>
                <Select
                  {...field}
                  value={field.value ?? ''}
                  input={
                    <OutlinedInput
                      label={
                        extraProps.isLoading
                          ? getWorkflowAmountRuleLabelDynamic('CDL_COMMON_LOADING')
                          : label
                      }
                    />
                  }
                  label={
                    extraProps.isLoading
                      ? getWorkflowAmountRuleLabelDynamic('CDL_COMMON_LOADING')
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
                    field.onChange(val)
                    if (extraProps.onChange) extraProps.onChange(val)
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
                      {getWorkflowAmountRuleLabelDynamic('CDL_COMMON_LOADING')}
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
    name: keyof AmountRuleFormData,
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
                      name === 'currency' ? 10 : undefined,
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

  const renderCheckboxField = (
    name: keyof AmountRuleFormData,
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
                  color:
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.grey[600], 0.7)
                      : '#CAD5E2',
                  '&.Mui-checked': {
                    color: theme.palette.primary.main,
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
          ? `${getWorkflowAmountRuleLabelDynamic('CDL_COMMON_UPDATE')} ${getWorkflowAmountRuleLabelDynamic('CDL_WAR_WORKFLOW_AMOUNT_RULE')}`
          : `${getWorkflowAmountRuleLabelDynamic('CDL_COMMON_ADD')} ${getWorkflowAmountRuleLabelDynamic('CDL_WAR_WORKFLOW_AMOUNT_RULE')}`}
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

          {workflowDefinitionsLoading && (
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
              {getWorkflowAmountRuleLabelDynamic('CDL_COMMON_LOADING')}
            </Alert>
          )}
          <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
            {renderTextField(
              'currency',
              getWorkflowAmountRuleLabelDynamic('CDL_WAR_CURRENCY'),
              'text',
              12,
              true
            )}
            {renderTextField(
              'minAmount',
              getWorkflowAmountRuleLabelDynamic('CDL_WAR_MIN_AMOUNT'),
              'number',
              12,
              true
            )}

            {renderTextField(
              'maxAmount',
              getWorkflowAmountRuleLabelDynamic('CDL_WAR_MAX_AMOUNT'),
              'number',
              12,
              true
            )}
            {renderTextField(
              'priority',
              getWorkflowAmountRuleLabelDynamic('CDL_WAR_PRIORITY'),
              'number',
              12,
              true
            )}
            {renderTextField(
              'requiredMakers',
              getWorkflowAmountRuleLabelDynamic('CDL_WAR_REQUIRED_MAKERS'),
              'number',
              12,
              true
            )}
            {renderTextField(
              'requiredCheckers',
              getWorkflowAmountRuleLabelDynamic('CDL_WAR_REQUIRED_CHECKERS'),
              'number',
              12,
              true
            )}
            {renderSelectField(
              'workflowDefinitionName',
              getWorkflowAmountRuleLabelDynamic('CDL_WAR_WORKFLOW_DEFINITION_DTO'),
              workflowDefinitionOptions.map((option) => ({
                label: option.label,
                value: option.label,
                id: option.id,
              })),
              12,
              true,
              {
                isLoading: workflowDefinitionsLoading,
                disabled: isSubmitting || isViewMode,
                onChange: (value: string | number) =>
                  handleWorkflowDefinitionChange(value as string),
              }
            )}
            {/* {renderCheckboxField(
              'enabled',
              getWorkflowAmountRuleLabelDynamic('CDL_COMMON_ENABLED'),
              12,
              { disabled: isSubmitting || isViewMode, defaultValue: true }
            )} */}
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
                  {getWorkflowAmountRuleLabelDynamic('CDL_COMMON_CANCEL')}
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
                      ? getWorkflowAmountRuleLabelDynamic('CDL_COMMON_UPDATING')
                      : getWorkflowAmountRuleLabelDynamic('CDL_COMMON_ADDING')
                    : mode === 'edit'
                      ? getWorkflowAmountRuleLabelDynamic('CDL_COMMON_UPDATE')
                      : getWorkflowAmountRuleLabelDynamic('CDL_COMMON_ADD')}
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
