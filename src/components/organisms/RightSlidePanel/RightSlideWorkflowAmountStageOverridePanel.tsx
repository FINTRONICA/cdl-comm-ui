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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { Controller, useForm, FieldErrors } from 'react-hook-form'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { getLabelByConfigId as getWorkflowAmountStageOverrideLabel } from '@/constants/mappings/workflowMapping'

import {
  useCreateWorkflowAmountStageOverride,
  useUpdateWorkflowAmountStageOverride,
  useWorkflowAmountRules,
} from '@/hooks/workflow'
import type {
  WorkflowAmountStageOverrideUIData,
  CreateWorkflowAmountStageOverrideRequest,
  UpdateWorkflowAmountStageOverrideRequest,
} from '@/services/api/workflowApi'

interface RightSlideWorkflowAmountStageOverridePanelProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'add' | 'edit' | 'view'
  stageOverrideData?: WorkflowAmountStageOverrideUIData | null
}

type StageOverrideFormData = {
  stageOrder: number
  requiredApprovals: number
  keycloakGroup: string
  stageKey: string
  amountRuleName: string
}

const DEFAULT_VALUES: StageOverrideFormData = {
  stageOrder: 0,
  requiredApprovals: 0,
  keycloakGroup: '',
  stageKey: '',
  amountRuleName: '',
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

export const RightSlideWorkflowAmountStageOverridePanel: React.FC<
  RightSlideWorkflowAmountStageOverridePanelProps
> = ({ isOpen, onClose, mode = 'add', stageOverrideData }) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedWorkflowAmountRuleId, setSelectedWorkflowAmountRuleId] =
    useState<number | null>(null)

  const createStageOverride = useCreateWorkflowAmountStageOverride()
  const updateStageOverride = useUpdateWorkflowAmountStageOverride()

  // Fetch available workflow amount rules
  const { data: workflowAmountRulesData, isLoading: isLoadingRules } =
    useWorkflowAmountRules(0, 100)

  // Get unique amount rule names from workflow amount rules
  const availableAmountRuleNames = useMemo(() => {
    if (!workflowAmountRulesData?.content) return []

    const amountRuleNames = workflowAmountRulesData.content.map((rule) => ({
      amountRuleName: `RULE_${rule.id}`,
      id: rule.id,
    }))

    // Remove duplicates based on amountRuleName
    const uniqueAmountRuleNames = amountRuleNames.filter(
      (item, index, self) =>
        index ===
        self.findIndex((t) => t.amountRuleName === item.amountRuleName)
    )

    return uniqueAmountRuleNames
  }, [workflowAmountRulesData])

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting: isFormSubmitting, isDirty },
    clearErrors,
  } = useForm<StageOverrideFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  })

  const isSubmitting =
    createStageOverride.isPending ||
    updateStageOverride.isPending ||
    isFormSubmitting ||
    isLoadingRules
  const isViewMode = mode === 'view'

  const isFormDirty = isDirty
  const canSave = isFormDirty && !isSubmitting && !isViewMode
  const canReset = isFormDirty && !isSubmitting && !isViewMode

  // Handle amount rule name selection
  const handleAmountRuleNameChange = useCallback(
    (amountRuleName: string) => {
      // Find the rule ID for the selected amount rule name
      const selectedRule = availableAmountRuleNames.find(
        (rule) => rule.amountRuleName === amountRuleName
      )
      if (selectedRule && typeof selectedRule.id === 'number') {
        setSelectedWorkflowAmountRuleId(selectedRule.id)
      } else {
        setSelectedWorkflowAmountRuleId(null)
      }
    },
    [availableAmountRuleNames]
  )

  // Auto-select first workflow amount rule when data is loaded
  useEffect(() => {
    if (
      workflowAmountRulesData?.content &&
      workflowAmountRulesData.content.length > 0 &&
      !selectedWorkflowAmountRuleId
    ) {
      const firstRule = workflowAmountRulesData.content[0]
      if (firstRule && typeof firstRule.id === 'number') {
        setSelectedWorkflowAmountRuleId(firstRule.id)
      }
    }
  }, [workflowAmountRulesData, selectedWorkflowAmountRuleId])

  // Load values when opening / changing mode
  useEffect(() => {
    if (!isOpen) return

    const values: StageOverrideFormData =
      mode === 'edit' && stageOverrideData
        ? {
            stageOrder: stageOverrideData.stageOrder ?? 0,
            requiredApprovals: stageOverrideData.requiredApprovals ?? 0,
            keycloakGroup: stageOverrideData.keycloakGroup ?? '',
            stageKey: stageOverrideData.stageKey ?? '',
            amountRuleName:
              stageOverrideData.workflowAmountRuleName ||
              `RULE_${stageOverrideData.workflowAmountRuleId}`,
          }
        : DEFAULT_VALUES

    // Set the workflow amount rule ID for edit mode
    if (mode === 'edit' && stageOverrideData?.workflowAmountRuleId) {
      setSelectedWorkflowAmountRuleId(stageOverrideData.workflowAmountRuleId)
    }

    reset(values, { keepDirty: false })
    clearErrors()
    setSuccessMessage(null)
    setErrorMessage(null)
  }, [isOpen, mode, stageOverrideData, reset, clearErrors])

  const onSubmit = (data: StageOverrideFormData) => {
    // Clear previous messages
    setSuccessMessage(null)
    setErrorMessage(null)

    if (mode === 'edit') {
      // Update flow - prepare update payload
      if (typeof stageOverrideData?.id !== 'number') {
        setErrorMessage('Invalid or missing stage override ID for update')
        return
      }

      const updatePayload: UpdateWorkflowAmountStageOverrideRequest = {
        id: stageOverrideData.id,
        stageOrder: data.stageOrder,
        requiredApprovals: data.requiredApprovals,
        keycloakGroup: data.keycloakGroup.trim(),
        stageKey: data.stageKey.trim(),
        workflowAmountRuleId: selectedWorkflowAmountRuleId!,
      }

      updateStageOverride.mutate(
        { id: stageOverrideData.id.toString(), updates: updatePayload },
        {
          onSuccess: () => {
            setSuccessMessage(
              'Workflow amount stage override updated successfully.'
            )
            // Close panel after a short delay to show success message
            setTimeout(() => {
              onClose()
            }, 1000)
          },
          onError: (err: Error | unknown) => {
            console.log(err)
            const error = err as Error & {
              response?: {
                data?: {
                  message?: string
                  details?: Record<string, unknown>
                  errors?: Record<string, unknown>
                }
                status?: number
                statusText?: string
                headers?: Record<string, string>
              }
              config?: {
                url?: string
                method?: string
                data?: Record<string, unknown>
                headers?: Record<string, string>
              }
            }

            const errorMessage =
              error?.response?.data?.message ||
              error?.message ||
              'Failed to update workflow amount stage override'
            setErrorMessage(errorMessage)
          },
        }
      )
    } else {
      // Create flow - prepare create payload
      const createPayload: CreateWorkflowAmountStageOverrideRequest = {
        stageOrder: data.stageOrder,
        requiredApprovals: data.requiredApprovals,
        keycloakGroup: data.keycloakGroup.trim(),
        stageKey: data.stageKey.trim(),
        workflowAmountRuleId: selectedWorkflowAmountRuleId!,
      }

      createStageOverride.mutate(createPayload, {
        onSuccess: () => {
          setSuccessMessage(
            'Workflow amount stage override created successfully.'
          )
          // Close panel after a short delay to show success message
          setTimeout(() => {
            onClose()
          }, 1000)
        },
        onError: (err: Error | unknown) => {
          console.log(err)
          const error = err as Error & {
            response?: { data?: { message?: string } }
          }

          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            'Failed to create workflow amount stage override'
          setErrorMessage(errorMessage)
        },
      })
    }
  }

  const handleResetToLoaded = useCallback(() => {
    const loaded: StageOverrideFormData =
      mode === 'edit' && stageOverrideData
        ? {
            stageOrder: stageOverrideData.stageOrder ?? 0,
            requiredApprovals: stageOverrideData.requiredApprovals ?? 0,
            keycloakGroup: stageOverrideData.keycloakGroup ?? '',
            stageKey: stageOverrideData.stageKey ?? '',
            amountRuleName:
              stageOverrideData.workflowAmountRuleName ||
              `RULE_${stageOverrideData.workflowAmountRuleId}`, // Set the amount rule name
          }
        : DEFAULT_VALUES
    reset(loaded, { keepDirty: false })
    clearErrors()

    // Reset workflow amount rule ID
    if (mode === 'edit' && stageOverrideData?.workflowAmountRuleId) {
      setSelectedWorkflowAmountRuleId(stageOverrideData.workflowAmountRuleId)
    } else if (
      workflowAmountRulesData?.content &&
      workflowAmountRulesData.content.length > 0
    ) {
      const firstRule = workflowAmountRulesData.content[0]
      if (firstRule && typeof firstRule.id === 'number') {
        setSelectedWorkflowAmountRuleId(firstRule.id)
      }
    }
  }, [mode, stageOverrideData, reset, clearErrors, workflowAmountRulesData])

  const onError = (errors: FieldErrors<StageOverrideFormData>) => {
    console.log(errors)
    // No error handling needed since validation is removed
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
    name: keyof StageOverrideFormData,
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
              // Prevent negative numbers for number inputs
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

  // Reusable select renderer (TypeScript + React Hook Form + MUI)
  type OptionItem = {
    label: string
    value: string | number
    id?: string | number
  }

  const renderSelectField = (
    name: keyof StageOverrideFormData,
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
        render={({ field }) => (
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
                <MenuItem disabled>No {label.toLowerCase()} available</MenuItem>
              )}
            </Select>
          </FormControl>
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
              ? 'Edit Workflow Amount Stage Overriden'
              : 'Add New Workflow Amount Stage '}
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
              'stageOrder',
              getWorkflowAmountStageOverrideLabel('CDL_WASO_STAGE_ORDER'),
              'number',
              12
            )}
            {renderTextField(
              'requiredApprovals',
              getWorkflowAmountStageOverrideLabel(
                'CDL_WASO_REQUIRED_APPROVALS'
              ),
              'number',
              12
            )}
            {renderTextField(
              'keycloakGroup',
              getWorkflowAmountStageOverrideLabel('CDL_WASO_KEYCLOAK_GROUP'),
              'text',
              12
            )}
            {renderTextField(
              'stageKey',
              getWorkflowAmountStageOverrideLabel('CDL_WASO_STAGE_KEY'),
              'text',
              12
            )}
            {renderSelectField(
              'amountRuleName',
              getWorkflowAmountStageOverrideLabel(
                'CDL_WAR_WORKFLOW_AMOUNT_RULE'
              ),
              availableAmountRuleNames.map((rule) => ({
                label: rule.amountRuleName,
                value: rule.amountRuleName,
                id: rule.id,
              })),
              12,
              {
                isLoading: isLoadingRules,
                disabled: isSubmitting || isViewMode,
                onChange: (value: string | number) =>
                  handleAmountRuleNameChange(value as string),
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
                    ? isLoadingRules
                      ? 'Loading rules...'
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
                    ? isLoadingRules
                      ? 'Loading...'
                      : mode === 'edit'
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
    </Drawer>
  )
}
