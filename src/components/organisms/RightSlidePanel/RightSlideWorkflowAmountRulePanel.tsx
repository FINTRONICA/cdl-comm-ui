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
  Snackbar,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material'
import { Controller, useForm, FieldErrors } from 'react-hook-form'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { getLabelByConfigId as getWorkflowAmountRuleLabel } from '@/constants/mappings/workflowMapping'

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
  active: boolean
}

interface WorkflowDefinition {
  id: string | number
  name: string
  version: number
}

const DEFAULT_VALUES: AmountRuleFormData = {
  currency: '',
  minAmount: 0,
  maxAmount: 0,
  priority: 0,
  requiredMakers: 0,
  requiredCheckers: 0,
  workflowDefinitionName: '',
  active: false,
}

const selectStyles = {
  height: '46px',
  '& .MuiOutlinedInput-root': {
    height: '46px',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#CAD5E2',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: '#CAD5E2',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563EB',
    },
  },
  '& .MuiSelect-icon': {
    color: '#666',
  },
}

export const RightSlideWorkflowAmountRulePanel: React.FC<
  RightSlideWorkflowAmountRulePanelProps
> = ({ isOpen, onClose, mode = 'add', amountRuleData }) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedWorkflowAmountRuleId, setSelectedWorkflowAmountRuleId] =
    useState<number | null>(null)
  const createAmountRule = useCreateWorkflowAmountRule()
  const updateAmountRule = useUpdateWorkflowAmountRule()

  const { isSubmitting: formLoading } = useWorkflowAmountRuleForm()

  // Fetch workflow definitions for dropdown
  const {
    data: workflowDefinitionsResponse,
    isLoading: workflowDefinitionsLoading,
  } = useFindAllWorkflowDefinitions()

  // Transform workflow definitions for dropdown
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
    mode: 'onChange',
  })

  const isSubmitting =
    createAmountRule.isPending ||
    updateAmountRule.isPending ||
    isFormSubmitting ||
    formLoading ||
    workflowDefinitionsLoading
  const isViewMode = mode === 'view'

  // Button state logic
  const isFormDirty = isDirty
  const canSave = isFormDirty && !isSubmitting && !isViewMode
  const canReset = isFormDirty && !isSubmitting && !isViewMode

  // Handle workflow definition selection
  const handleWorkflowDefinitionChange = useCallback(
    (workflowDefinitionName: string) => {
      // Find the workflow definition ID for the selected name
      const selectedDefinition = workflowDefinitionOptions.find(
        (option) => option.label === workflowDefinitionName
      )
      if (selectedDefinition && typeof selectedDefinition.value === 'number') {
        setSelectedWorkflowAmountRuleId(selectedDefinition.value)
      } else {
        setSelectedWorkflowAmountRuleId(null)
      }
    },
    [workflowDefinitionOptions]
  )

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

  useEffect(() => {
    if (
      workflowDefinitionsResponse?.content &&
      workflowDefinitionsResponse.content.length > 0 &&
      !selectedWorkflowAmountRuleId
    ) {
      const firstDefinition = workflowDefinitionsResponse.content[0]
      if (firstDefinition && typeof firstDefinition.id === 'number') {
        setSelectedWorkflowAmountRuleId(firstDefinition.id)
      }
    }
  }, [workflowDefinitionsResponse, selectedWorkflowAmountRuleId])

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
            minAmount: amountRuleData.minAmount ?? 0,
            maxAmount: amountRuleData.maxAmount ?? 0,
            priority: amountRuleData.priority ?? 0,
            requiredMakers: amountRuleData.requiredMakers ?? 0,
            requiredCheckers: amountRuleData.requiredCheckers ?? 0,
            workflowDefinitionName:
              amountRuleData.workflowDefinitionDTO?.name || '',
            active: amountRuleData.active ?? false,
          } as AmountRuleFormData)
        : DEFAULT_VALUES

    if (mode === 'edit' && extractedWorkflowDefinitionId) {
      setSelectedWorkflowAmountRuleId(extractedWorkflowDefinitionId)
    }

    reset(values, { keepDirty: false })
    clearErrors()
    setSuccessMessage(null)
    setErrorMessage(null)
  }, [
    isOpen,
    mode,
    amountRuleData,
    reset,
    clearErrors,
    workflowDefinitionOptions,
  ])

  const onSubmit = (data: AmountRuleFormData) => {
    setSuccessMessage(null)
    setErrorMessage(null)

    if (mode === 'edit') {
      if (!amountRuleData?.id) {
        setErrorMessage('Invalid or missing amount rule ID for update')
        return
      }

      const updatePayload: UpdateWorkflowAmountRuleRequest = {
        id: Number(amountRuleData.id),
        currency: data.currency.trim(),
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        priority: data.priority,
        requiredMakers: data.requiredMakers,
        requiredCheckers: data.requiredCheckers,
        workflowDefinitionId: selectedWorkflowAmountRuleId || 0,
        active: data.active,
      }

      updateAmountRule.mutate(
        { id: String(amountRuleData.id), updates: updatePayload },
        {
          onSuccess: () => {
            setSuccessMessage('Workflow amount rule updated successfully.')
            setTimeout(() => onClose(), 1000)
          },
          onError: (err: Error | unknown) => {
            const error = err as Error & {
              response?: {
                data?: {
                  message?: string
                  details?: string
                  error?: string
                }
                status?: number
                statusText?: string
              }
            }
            const errorMessage =
              error?.response?.data?.message ||
              error?.response?.data?.details ||
              error?.response?.data?.error ||
              error?.message ||
              `Failed to update workflow amount rule (Status: ${error?.response?.status})`
            setErrorMessage(errorMessage)
          },
        }
      )
    } else {
      const createPayload: CreateWorkflowAmountRuleRequest = {
        currency: data.currency.trim(),
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        priority: data.priority,
        requiredMakers: data.requiredMakers,
        requiredCheckers: data.requiredCheckers,
        workflowDefinitionId: selectedWorkflowAmountRuleId || 0,
        workflowId: selectedWorkflowAmountRuleId || 0,
        amountRuleName: `Rule_${selectedWorkflowAmountRuleId || ''}`,
        active: data.active,
      }

      createAmountRule.mutate(createPayload, {
        onSuccess: () => {
          setSuccessMessage('Workflow amount rule created successfully.')
          setTimeout(() => onClose(), 1000)
        },
        onError: (err: Error | unknown) => {
          const error = err as Error & {
            response?: {
              data?: {
                message?: string
                details?: string
                error?: string
              }
              status?: number
              statusText?: string
            }
          }
          const errorMessage =
            error?.response?.data?.message ||
            error?.response?.data?.details ||
            error?.response?.data?.error ||
            error?.message ||
            `Failed to create workflow amount rule (Status: ${error?.response?.status})`
          setErrorMessage(errorMessage)
        },
      })
    }
  }

  const handleResetToLoaded = useCallback(() => {
    const loaded: AmountRuleFormData =
      mode === 'edit' && amountRuleData
        ? {
            currency: amountRuleData.currency ?? '',
            minAmount: amountRuleData.minAmount ?? 0,
            maxAmount: amountRuleData.maxAmount ?? 0,
            priority: amountRuleData.priority ?? 0,
            requiredMakers: amountRuleData.requiredMakers ?? 0,
            requiredCheckers: amountRuleData.requiredCheckers ?? 0,
            workflowDefinitionName:
              amountRuleData.workflowDefinitionDTO?.name || '',
            active: amountRuleData.active ?? false,
          }
        : DEFAULT_VALUES
    reset(loaded, { keepDirty: false })
    clearErrors()

    // Reset workflow definition ID
    if (mode === 'edit' && amountRuleData?.workflowDefinitionDTO?.id) {
      setSelectedWorkflowAmountRuleId(
        Number(amountRuleData.workflowDefinitionDTO.id)
      )
    } else if (
      workflowDefinitionsResponse?.content &&
      workflowDefinitionsResponse.content.length > 0
    ) {
      const firstDefinition = workflowDefinitionsResponse.content[0]
      if (firstDefinition && typeof firstDefinition.id === 'number') {
        setSelectedWorkflowAmountRuleId(firstDefinition.id)
      }
    }
  }, [mode, amountRuleData, reset, clearErrors, workflowDefinitionsResponse])

  const onError = (errors: FieldErrors<AmountRuleFormData>) => {
    console.log(errors)
  }
  // Common styles for form components
  const commonFieldStyles = (hasError: boolean) => ({
    '& .MuiOutlinedInput-root': {
      height: '46px',
      borderRadius: '8px',
      '& fieldset': {
        borderColor: hasError ? '#ef4444' : '#CAD5E2',
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: hasError ? '#ef4444' : '#CAD5E2',
      },
      '&.Mui-focused fieldset': {
        borderColor: hasError ? '#ef4444' : '#2563EB',
      },
    },
  })

  const labelSx = {
    color: '#6A7282',
    fontFamily: 'Outfit',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '12px',
    letterSpacing: 0,
  }

  const valueSx = {
    fontFamily: 'Outfit',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '14px',
    letterSpacing: 0,
    wordBreak: 'break-word',
  }

  const renderTextField = (
    name: keyof AmountRuleFormData,
    label: string,
    type: 'text' | 'number' = 'text',
    gridSize: number = 12
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <TextField
            name={field.name}
            value={field.value || ''}
            type={type}
            label={label}
            fullWidth
            disabled={isSubmitting || isViewMode}
            InputLabelProps={{ sx: labelSx }}
            InputProps={{
              sx: valueSx,
            }}
            sx={commonFieldStyles(false)}
            onChange={(e) => {
              const value =
                type === 'number' ? Number(e.target.value) : e.target.value
              if (type === 'number' && typeof value === 'number' && value < 0) {
                field.onChange(0)
              } else {
                field.onChange(value)
              }
            }}
            onBlur={field.onBlur}
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
    name: keyof AmountRuleFormData,
    label: string,
    options: OptionItem[] | string[],
    gridSize: number = 6,
    extraProps: {
      isLoading?: boolean
      disabled?: boolean
      onChange?: (value: string | number) => void
      placeholder?: string
    } = {}
  ) => (
    <Grid key={String(name)} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={''}
        render={({ field }) => {
          return (
            <FormControl fullWidth>
              <InputLabel sx={labelSx}>
                {extraProps.placeholder ?? label}
              </InputLabel>

              <Select
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const val = (e.target as HTMLInputElement).value

                  field.onChange(val)
                  if (extraProps.onChange) extraProps.onChange(val)
                }}
                disabled={!!extraProps.disabled || !!extraProps.isLoading}
                label={extraProps.placeholder ?? label}
                sx={{ ...selectStyles, ...valueSx }}
                IconComponent={KeyboardArrowDownIcon}
              >
                {extraProps.isLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Loading {label.toLowerCase()}...
                  </MenuItem>
                ) : Array.isArray(options) && options.length > 0 ? (
                  options.map((opt) =>
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
            </FormControl>
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
      onChange?: (value: boolean) => void // 👈 allow custom onChange too
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

  // Prevent drawer from closing when clicking inside the form
  const handleDrawerClose = (
    _event: React.KeyboardEvent | React.MouseEvent,
    reason?: string
  ) => {
    // Only close on backdrop click or escape key, not on form interactions
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
          width: '460px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid #E5E7EB' }}>
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
            }}
          >
            {mode === 'edit'
              ? 'Edit Workflow Amount Rule'
              : mode === 'view'
                ? 'View Workflow Amount Rule'
                : 'Add New Workflow Amount Rule'}
          </DialogTitle>
          <IconButton onClick={onClose} size="small">
            <CancelOutlinedIcon />
          </IconButton>
        </Box>
      </Box>

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <DialogContent dividers>
          {/* Error message at the top */}
          {errorMessage && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="error" onClose={() => setErrorMessage(null)}>
                {errorMessage}
              </Alert>
            </Box>
          )}

          <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
            {renderTextField(
              'currency',
              getWorkflowAmountRuleLabel('CDL_WAR_CURRENCY'),
              'text',
              12
            )}
            {renderTextField(
              'minAmount',
              getWorkflowAmountRuleLabel('CDL_WAR_MIN_AMOUNT'),
              'number',
              12
            )}

            {renderTextField(
              'maxAmount',
              getWorkflowAmountRuleLabel('CDL_WAR_MAX_AMOUNT'),
              'number',
              12
            )}
            {renderTextField(
              'priority',
              getWorkflowAmountRuleLabel('CDL_WAR_PRIORITY'),
              'number',
              12
            )}
            {renderTextField(
              'requiredMakers',
              getWorkflowAmountRuleLabel('CDL_WAR_REQUIRED_MAKERS'),
              'number',
              12
            )}
            {renderTextField(
              'requiredCheckers',
              getWorkflowAmountRuleLabel('CDL_WAR_REQUIRED_CHECKERS'),
              'number',
              12
            )}
            {renderSelectField(
              'workflowDefinitionName',
              `${getWorkflowAmountRuleLabel('CDL_WAR_WORKFLOW_DEFINITION')}`,

              workflowDefinitionOptions.map((option) => ({
                label: option.label,
                value: option.label,
                id: option.id,
              })),
              12,
              {
                isLoading: workflowDefinitionsLoading,
                disabled: isSubmitting || isViewMode,
                onChange: (value: string | number) =>
                  handleWorkflowDefinitionChange(value as string),
              }
            )}

            <Grid size={{ xs: 12 }}>
              {renderCheckboxField(
                'active',
                getWorkflowAmountRuleLabel('CDL_WAR_ACTIVE'),
                3,
                { disabled: isSubmitting, defaultValue: true }
              )}
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
                  }}
                >
                  {isSubmitting && (
                    <CircularProgress
                      size={20}
                      sx={{
                        color: 'white',
                      }}
                    />
                  )}
                  {isSubmitting
                    ? mode === 'edit'
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
        {/* {!isViewMode && (
          <div className="relative left-0 right-0 p-2 top-5">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6">
                <Button
                  onClick={handleResetToLoaded}
                  disabled={!canReset}
                  className={`
                            w-full relative flex items-center justify-center gap-1
                            font-['Outfit',sans-serif] font-medium not-italic text-sm leading-5
                            ${canReset ? 'opacity-100' : 'opacity-50'}
                            bg-gray-200 text-black rounded px-4 py-2
                          `}
                >
                  Reset
                </Button>
              </div>

              <div className="col-span-6">
                <Button
                  type="submit"
                  disabled={!canSave}
                  className={`
                            w-full relative flex items-center justify-center gap-1
                            font-['Outfit',sans-serif] font-medium not-italic text-sm leading-5
                            ${canSave ? 'opacity-100' : 'opacity-50'}
                            bg-blue-600 text-white rounded px-4 py-2
                          `}
                >
                  {isSubmitting && (
                    <CircularProgress
                      size={20}
                      sx={{
                        color: 'white',
                      }}
                    />
                  )}
                  {isSubmitting
                    ? mode === 'edit'
                      ? 'Updating...'
                      : 'Creating...'
                    : mode === 'edit'
                      ? 'Update'
                      : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        )} */}
      </form>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setErrorMessage(null)} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Drawer>
  )
}
