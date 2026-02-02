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
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  OutlinedInput,
} from '@mui/material'
import { Controller, useForm, FieldErrors } from 'react-hook-form'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { getWorkflowLabelsByCategory as getWorkflowAmountStageOverrideLabel } from '@/constants/mappings/workflowMapping'
import {
  WorkflowAmountStageOverrideSchemas,
  getWorkflowAmountStageOverrideValidationRules,
} from '@/lib/validation/workflowAmountStageOverrideSchemas'
import { FormError } from '../../atoms/FormError'
import { useBuildWorkflowAmountStageOverrideLabelsWithCache } from '@/hooks/workflow'
import { useAppStore } from '@/store'

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
import { validateStageOrderAndRequiredApprovals } from '@/lib/validation'
import { alpha, useTheme } from '@mui/material/styles'
import { buildPanelSurfaceTokens } from './panelTheme'

interface RightSlideWorkflowAmountStageOverridePanelProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'add' | 'edit' | 'view'
  stageOverrideData?: WorkflowAmountStageOverrideUIData | null
}

type StageOverrideFormData = {
  stageOrder: number | string
  requiredApprovals: number | string
  keycloakGroup: string
  stageKey: string
  amountRuleName: string
}

const DEFAULT_VALUES: StageOverrideFormData = {
  stageOrder: '',
  requiredApprovals: '',
  keycloakGroup: '',
  stageKey: '',
  amountRuleName: '',
}

// Styles will be defined inside component to access theme

export const RightSlideWorkflowAmountStageOverridePanel: React.FC<
  RightSlideWorkflowAmountStageOverridePanelProps
> = ({ isOpen, onClose, mode = 'add', stageOverrideData }) => {
  const theme = useTheme()
  const tokens = React.useMemo(() => buildPanelSurfaceTokens(theme), [theme])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const commonFieldStyles = React.useMemo(() => tokens.input, [tokens])
  const errorFieldStyles = React.useMemo(() => tokens.inputError, [tokens])
  const [selectedWorkflowAmountRuleId, setSelectedWorkflowAmountRuleId] =
    useState<number | null>(null)

  // Dynamic labels: same pattern used in Build Partner Beneficiary Panel
  const { data: workflowAmountStageOverrideLabels, getLabel } =
    useBuildWorkflowAmountStageOverrideLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'
  const getWorkflowAmountStageOverrideLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getWorkflowAmountStageOverrideLabel(configId)
      if (workflowAmountStageOverrideLabels) {
        return getLabel(configId, currentLanguage, fallback)
      }
      return fallback
    },
    [workflowAmountStageOverrideLabels, currentLanguage, getLabel]
  )

  // Get validation rules from schema
  const validationRules = useMemo(
    () => getWorkflowAmountStageOverrideValidationRules(),
    []
  )

  const { data: workflowAmountRulesData, isLoading: isLoadingRules } =
    useWorkflowAmountRules(0, 100)
  const createStageOverride = useCreateWorkflowAmountStageOverride()
  const updateStageOverride = useUpdateWorkflowAmountStageOverride()

  const availableAmountRuleNames = useMemo(() => {
    if (!workflowAmountRulesData?.content) return []

    const amountRuleNames = workflowAmountRulesData.content.map((rule) => ({
      amountRuleName: rule.amountRuleName?.trim() || `RULE_${rule.id}`,
      id: rule.id,
      workflowDefinitionName:
        typeof rule.workflowDefinitionDTO === 'object' &&
        rule.workflowDefinitionDTO !== null
          ? (rule.workflowDefinitionDTO as { name?: string }).name || ''
          : '',
    }))

    const uniqueAmountRuleNames = amountRuleNames.filter(
      (item, index, self) =>
        index ===
        self.findIndex((t) => t.amountRuleName === item.amountRuleName)
    )

    return uniqueAmountRuleNames.map((item) => {
      const label = item.workflowDefinitionName
        ? `${item.workflowDefinitionName}(${item.amountRuleName})`
        : item.amountRuleName
      return { ...item, label }
    })
  }, [workflowAmountRulesData])

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting: isFormSubmitting, isDirty },
    clearErrors,
    watch,
    setError,
    setValue,
  } = useForm<StageOverrideFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const isSubmitting =
    createStageOverride.isPending ||
    updateStageOverride.isPending ||
    isFormSubmitting ||
    isLoadingRules
  const isViewMode = mode === 'view'

  const labelSx = tokens.label
  const valueSx = tokens.value

  // Validation function using WorkflowAmountStageOverrideSchemas - same pattern as reference
  const validateWorkflowAmountStageOverrideField = useCallback(
    (
      fieldName: string,
      value: unknown,
      allValues: StageOverrideFormData
    ): string | true => {
      try {
        // Simple required checks first so empty required fields show errors immediately
        const requiredFields: Record<string, string> = {
          keycloakGroup: 'Keycloak Group is required',
          stageKey: 'Stage Key is required',
          amountRuleName: 'Amount Rule Name is required',
        }

        if (requiredFields[fieldName]) {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return requiredFields[fieldName]
          }
        }

        // Validate using schema if available
        const workflowAmountStageOverrideForValidation = {
          stageOrder:
            allValues.stageOrder === '' ? 0 : Number(allValues.stageOrder),
          requiredApprovals:
            allValues.requiredApprovals === ''
              ? 0
              : Number(allValues.requiredApprovals),
          keycloakGroup: allValues.keycloakGroup || '',
          stageKey: allValues.stageKey || '',
          amountRuleName: allValues.amountRuleName || '',
          workflowAmountRuleId: selectedWorkflowAmountRuleId || 0,
        }

        if (
          WorkflowAmountStageOverrideSchemas?.workflowAmountStageOverrideForm
        ) {
          const result =
            WorkflowAmountStageOverrideSchemas.workflowAmountStageOverrideForm.safeParse(
              workflowAmountStageOverrideForValidation
            )

          if (!result.success) {
            const fieldError = result.error.issues.find((issue) =>
              issue.path.includes(fieldName)
            )
            return fieldError ? fieldError.message : true
          }
        }

        return true
      } catch {
        return true
      }
    },
    [selectedWorkflowAmountRuleId]
  )

  const handleAmountRuleNameChange = useCallback(
    (amountRuleName: string) => {
      if (!amountRuleName || amountRuleName.trim() === '') {
        setSelectedWorkflowAmountRuleId(null)
        return
      }
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

  useEffect(() => {
    if (
      workflowAmountRulesData?.content &&
      workflowAmountRulesData.content.length > 0 &&
      !selectedWorkflowAmountRuleId &&
      mode === 'add'
    ) {
      const firstRule = workflowAmountRulesData.content[0]
      if (firstRule && typeof firstRule.id === 'number') {
        setSelectedWorkflowAmountRuleId(firstRule.id)
        // Set the default amountRuleName value in the form
        const defaultRuleName = firstRule.amountRuleName?.trim() || `RULE_${firstRule.id}`
        setValue('amountRuleName', defaultRuleName, {
          shouldValidate: false,
        })
      }
    }
  }, [workflowAmountRulesData, selectedWorkflowAmountRuleId, mode, setValue])

  const watchedStageOrder = watch('stageOrder')
  const watchedRequiredApprovals = watch('requiredApprovals')

  useEffect(() => {
    if (!isOpen) return

    // Clear previous cross-field errors
    clearErrors(['stageOrder', 'requiredApprovals'])

    // Auto-set requiredApprovals to 0 when stageOrder is 0
    const stageOrderValue =
      watchedStageOrder === '' || watchedStageOrder === null
        ? 0
        : Number(watchedStageOrder)
    if (
      stageOrderValue === 0 &&
      watchedRequiredApprovals !== '' &&
      watchedRequiredApprovals !== null &&
      Number(watchedRequiredApprovals) > 0
    ) {
      setValue('requiredApprovals', 0)
    }

    const validationResult = validateStageOrderAndRequiredApprovals(
      watchedStageOrder,
      watchedRequiredApprovals
    )

    if (validationResult !== true) {
      if (
        validationResult.includes(
          'At least one of Stage Order or Required Approvals must be greater than 0'
        )
      ) {
        setError('stageOrder', {
          type: 'manual',
          message: validationResult,
        })
        setError('requiredApprovals', {
          type: 'manual',
          message: validationResult,
        })
      } else {
        setError('requiredApprovals', {
          type: 'manual',
          message: validationResult,
        })
      }
    }
  }, [
    watchedStageOrder,
    watchedRequiredApprovals,
    isOpen,
    clearErrors,
    setError,
    setValue,
  ])

  useEffect(() => {
    if (!isOpen) return

    const values: StageOverrideFormData =
      mode === 'edit' && stageOverrideData
        ? {
            stageOrder: stageOverrideData.stageOrder ?? '',
            requiredApprovals: stageOverrideData.requiredApprovals ?? '',
            keycloakGroup: stageOverrideData.keycloakGroup ?? '',
            stageKey: stageOverrideData.stageKey ?? '',
            amountRuleName: '',
          }
        : DEFAULT_VALUES

    // Set the workflow amount rule ID for edit mode
    if (mode === 'edit' && stageOverrideData?.workflowAmountRuleId) {
      setSelectedWorkflowAmountRuleId(stageOverrideData.workflowAmountRuleId)
    }

    reset(values, { keepDirty: false })
    clearErrors()
    setErrorMessage(null)
  }, [isOpen, mode, stageOverrideData, reset, clearErrors])

  // Set amountRuleName in edit mode after rules data is loaded
  useEffect(() => {
    if (
      !isOpen ||
      mode !== 'edit' ||
      !stageOverrideData?.workflowAmountRuleId ||
      !workflowAmountRulesData?.content ||
      availableAmountRuleNames.length === 0
    ) {
      return
    }

    const ruleId = stageOverrideData.workflowAmountRuleId

    // Find the rule in the loaded data
    const rule = workflowAmountRulesData.content.find(
      (r) => r.id === ruleId
    )

    // Find the matching option in availableAmountRuleNames
    const matchingOption = availableAmountRuleNames.find(
      (opt) => opt.id === ruleId
    )

    if (matchingOption && typeof matchingOption.id === 'number') {
      // Use the exact format from availableAmountRuleNames to ensure it matches
      const amountRuleName = matchingOption.amountRuleName
      // Set the form value to match the dropdown format exactly
      setValue('amountRuleName', amountRuleName, { shouldValidate: false })
      setSelectedWorkflowAmountRuleId(matchingOption.id)
    } else if (rule && typeof rule.id === 'number') {
      // Fallback: construct the name if not in availableAmountRuleNames
      const amountRuleName = `RULE_${rule.id}`
      setValue('amountRuleName', amountRuleName, { shouldValidate: false })
      setSelectedWorkflowAmountRuleId(rule.id)
    } else if (ruleId && typeof ruleId === 'number') {
      // Last fallback: use the workflowAmountRuleName from stageOverrideData or construct it
      const amountRuleName =
        stageOverrideData.workflowAmountRuleName ||
        `RULE_${ruleId}`
      // Normalize to uppercase RULE_ format to match dropdown
      const normalizedName = amountRuleName.toUpperCase().startsWith('RULE_')
        ? amountRuleName.toUpperCase()
        : `RULE_${ruleId}`
      setValue('amountRuleName', normalizedName, { shouldValidate: false })
      setSelectedWorkflowAmountRuleId(ruleId)
    }
  }, [
    isOpen,
    mode,
    stageOverrideData,
    workflowAmountRulesData,
    availableAmountRuleNames,
    setValue,
    setSelectedWorkflowAmountRuleId,
  ])

  const onSubmit = useCallback(
    async (data: StageOverrideFormData) => {
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

        if (!selectedWorkflowAmountRuleId || selectedWorkflowAmountRuleId <= 0) {
          setErrorMessage('Please select a valid workflow amount rule')
          return
        }

        const validationResult = validateStageOrderAndRequiredApprovals(
          data.stageOrder,
          data.requiredApprovals
        )

        if (validationResult !== true) {
          setErrorMessage(validationResult)
          return
        }

        const stageOrderValue =
          data.stageOrder === '' || data.stageOrder === null
            ? 0
            : Number(data.stageOrder)
        const requiredApprovalsValue =
          data.requiredApprovals === '' || data.requiredApprovals === null
            ? 0
            : Number(data.requiredApprovals)

        // Validate numeric values
        if (isNaN(stageOrderValue) || isNaN(requiredApprovalsValue)) {
          setErrorMessage('Invalid numeric values for stage order or required approvals')
          return
        }

        // Validate range
        if (stageOrderValue < 0 || stageOrderValue > 10) {
          setErrorMessage('Stage Order must be between 0 and 10')
          return
        }

        if (requiredApprovalsValue < 0 || requiredApprovalsValue > 10) {
          setErrorMessage('Required Approvals must be between 0 and 10')
          return
        }

        if (stageOrderValue === 0 && requiredApprovalsValue === 0) {
          setErrorMessage(
            'At least one of Stage Order or Required Approvals must be greater than 0'
          )
          return
        }

        // Sanitize string inputs
        const keycloakGroup = (data.keycloakGroup || '').trim()
        const stageKey = (data.stageKey || '').trim()

        if (!keycloakGroup || keycloakGroup.length === 0) {
          setErrorMessage('Keycloak Group is required')
          return
        }

        if (!stageKey || stageKey.length === 0) {
          setErrorMessage('Stage Key is required')
          return
        }

        // Validate string lengths
        if (keycloakGroup.length > 100) {
          setErrorMessage('Keycloak Group must be 100 characters or less')
          return
        }

        if (stageKey.length > 50) {
          setErrorMessage('Stage Key must be 50 characters or less')
          return
        }

        if (mode === 'edit') {
          if (!stageOverrideData?.id || typeof stageOverrideData.id !== 'number') {
            setErrorMessage('Invalid or missing stage override ID for update')
            return
          }

          const updatePayload: UpdateWorkflowAmountStageOverrideRequest = {
            id: stageOverrideData.id,
            stageOrder: stageOrderValue,
            requiredApprovals: requiredApprovalsValue,
            keycloakGroup,
            stageKey,
            workflowAmountRuleId: selectedWorkflowAmountRuleId,
          }

          await updateStageOverride.mutateAsync({
            id: stageOverrideData.id.toString(),
            updates: updatePayload,
          })

          setSuccessMessage(
            'Workflow amount stage override updated successfully!'
          )
          setTimeout(() => {
            reset()
            onClose()
          }, 1500)
        } else {
          const createPayload: CreateWorkflowAmountStageOverrideRequest = {
            stageOrder: stageOrderValue,
            requiredApprovals: requiredApprovalsValue,
            keycloakGroup,
            stageKey,
            workflowAmountRuleId: selectedWorkflowAmountRuleId,
          }

          await createStageOverride.mutateAsync(createPayload)

          setSuccessMessage(
            'Workflow amount stage override created successfully!'
          )
          setTimeout(() => {
            reset()
            onClose()
          }, 1500)
        }
      } catch (error: unknown) {
        let errorMsg =
          'Failed to save workflow amount stage override. Please try again.'

        if (error instanceof Error) {
          if (error.message.includes('validation')) {
            errorMsg = 'Please check your input and try again.'
          } else {
            errorMsg = error.message
          }
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          errorMsg = String(error.message) || errorMsg
        }

        setErrorMessage(errorMsg)
      }
    },
    [
      isSubmitting,
      mode,
      isDirty,
      selectedWorkflowAmountRuleId,
      stageOverrideData,
      updateStageOverride,
      createStageOverride,
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

  const onError = (_errors: FieldErrors<StageOverrideFormData>) => {
    // No error handling needed since validation is removed
  }

  // Handle number field input restrictions
  const handleNumberFieldChange = useCallback(
    (name: string, value: string, field: any) => {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 2)
      if (numericValue === '') {
        field.onChange('')
        return
      }

      const numValue = Number(numericValue)

      // Cross-field validation: If stageOrder is 0, requiredApprovals must be 0
      if (name === 'requiredApprovals') {
        const currentStageOrder =
          watchedStageOrder === '' || watchedStageOrder === null
            ? 0
            : Number(watchedStageOrder)
        if (currentStageOrder === 0 && numValue > 0) {
          field.onChange(0)
          return
        }
      }

      // Cross-field validation: If requiredApprovals is 0, stageOrder can be 0
      if (name === 'stageOrder') {
        const currentRequiredApprovals =
          watchedRequiredApprovals === '' || watchedRequiredApprovals === null
            ? 0
            : Number(watchedRequiredApprovals)
        if (currentRequiredApprovals === 0 && numValue === 0) {
          field.onChange(numValue)
          return
        }
      }

      // Limit to max 10
      if (numValue > 10) {
        field.onChange(10)
      } else {
        field.onChange(isNaN(numValue) ? '' : numValue)
      }
    },
    [watchedStageOrder, watchedRequiredApprovals]
  )

  // Handle text field input restrictions (remove numbers for keycloakGroup and stageKey)
  const handleTextFieldChange = useCallback(
    (name: string, value: string, field: any) => {
      if (name === 'keycloakGroup' || name === 'stageKey') {
        const textValue = value.replace(/[0-9]/g, '')
        field.onChange(textValue)
      } else {
        field.onChange(value)
      }
    },
    []
  )

  const renderTextField = (
    name: keyof StageOverrideFormData,
    label: string,
    type: 'text' | 'number' = 'text',
    gridSize: number = 12,
    required: boolean = true
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        rules={
          validationRules[name] || {
            validate: (value, formValues) =>
              validateWorkflowAmountStageOverrideField(name, value, formValues),
          }
        }
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
                      type === 'number'
                        ? 2
                        : name === 'keycloakGroup'
                          ? 100
                          : name === 'stageKey'
                            ? 50
                            : undefined,
                  },
                }}
                sx={hasError ? errorFieldStyles : commonFieldStyles}
                onChange={(e) => {
                  const value = e.target.value
                  if (type === 'number') {
                    handleNumberFieldChange(name, value, field)
                  } else {
                    handleTextFieldChange(name, value, field)
                  }
                }}
                onBlur={field.onBlur}
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
    name: keyof StageOverrideFormData,
    label: string,
    options?: OptionItem[] | string[],
    gridSize: number = 6,
    required: boolean = true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _showRedAsterisk: boolean = false,
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
          rules={{
            validate: (value, formValues) =>
              validateWorkflowAmountStageOverrideField(name, value, formValues),
          }}
          render={({ field, fieldState }) => {
            const hasError = !!fieldState.error
            // Ensure value is always a string, never undefined
            const selectValue = field.value ?? ''

            return (
              <FormControl
                fullWidth
                error={hasError}
                required={required}
                disabled={!!extraProps.disabled || !!extraProps.isLoading}
              >
                <InputLabel sx={labelSx}>
                  {extraProps.isLoading
                    ? getWorkflowAmountStageOverrideLabelDynamic(
                        'CDL_COMMON_LOADING'
                      )
                    : label}
                </InputLabel>
                <Select
                  {...field}
                  value={selectValue}
                  input={
                    <OutlinedInput
                      label={
                        extraProps.isLoading
                          ? getWorkflowAmountStageOverrideLabelDynamic(
                              'CDL_COMMON_LOADING'
                            )
                          : label
                      }
                    />
                  }
                  label={
                    extraProps.isLoading
                      ? getWorkflowAmountStageOverrideLabelDynamic(
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
                    const val = (e.target as HTMLInputElement).value || ''
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
                      {getWorkflowAmountStageOverrideLabelDynamic(
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
          ? `${getWorkflowAmountStageOverrideLabelDynamic('CDL_COMMON_UPDATE')} ${getWorkflowAmountStageOverrideLabelDynamic('CDL_WASO_WORKFLOW_AMOUNT_STAGE_OVERRIDE')}`
          : `${getWorkflowAmountStageOverrideLabelDynamic('CDL_COMMON_ADD')} ${getWorkflowAmountStageOverrideLabelDynamic('CDL_WASO_WORKFLOW_AMOUNT_STAGE_OVERRIDE')}`}
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

          {isLoadingRules && (
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
              {getWorkflowAmountStageOverrideLabelDynamic('CDL_COMMON_LOADING')}
            </Alert>
          )}

          <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
            {renderTextField(
              'stageOrder',
              getWorkflowAmountStageOverrideLabelDynamic(
                'CDL_WASO_STAGE_ORDER'
              ),
              'number',
              12,
              true
            )}
            {renderTextField(
              'requiredApprovals',
              getWorkflowAmountStageOverrideLabelDynamic(
                'CDL_WASO_REQUIRED_APPROVALS'
              ),
              'number',
              12,
              true
            )}
            {renderTextField(
              'keycloakGroup',
              getWorkflowAmountStageOverrideLabelDynamic(
                'CDL_WASO_KEYCLOAK_GROUP'
              ),
              'text',
              12,
              true
            )}
            {renderTextField(
              'stageKey',
              getWorkflowAmountStageOverrideLabelDynamic('CDL_WASO_STAGE_KEY'),
              'text',
              12,
              true
            )}

            {renderSelectField(
              'amountRuleName',
              getWorkflowAmountStageOverrideLabelDynamic(
                'CDL_WAR_WORKFLOW_AMOUNT_RULE'
              ),
              availableAmountRuleNames.map((rule) => ({
                label: rule.label ?? rule.amountRuleName,
                value: rule.amountRuleName,
                id: rule.id,
              })),
              12,
              true,
              false,
              {
                isLoading: isLoadingRules,
                disabled: isSubmitting || isViewMode,
                onChange: (value: string | number) => {
                  const stringValue = String(value || '')
                  handleAmountRuleNameChange(stringValue)
                  // Ensure the form value is set
                  setValue('amountRuleName', stringValue, {
                    shouldValidate: true,
                  })
                },
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
                  {getWorkflowAmountStageOverrideLabelDynamic(
                    'CDL_COMMON_CANCEL'
                  )}
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
                      ? getWorkflowAmountStageOverrideLabelDynamic(
                          'CDL_COMMON_UPDATING'
                        )
                      : getWorkflowAmountStageOverrideLabelDynamic(
                          'CDL_COMMON_ADDING'
                        )
                    : mode === 'edit'
                      ? getWorkflowAmountStageOverrideLabelDynamic(
                          'CDL_COMMON_UPDATE'
                        )
                      : getWorkflowAmountStageOverrideLabelDynamic(
                          'CDL_COMMON_ADD'
                        )}
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
