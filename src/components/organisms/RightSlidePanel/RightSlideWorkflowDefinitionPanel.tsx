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
} from '@mui/material'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import { Controller, useForm, FieldErrors } from 'react-hook-form'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { getLabelByConfigId as getWorkflowDefinitionLabel } from '@/constants/mappings/workflowMapping'

import {
  useCreateWorkflowDefinition,
  useUpdateWorkflowDefinition,
  useWorkflowDefinitionForm,
} from '@/hooks/workflow'
import type { WorkflowDefinitionUIData } from '@/services/api/workflowApi'

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

export const RightSlideWorkflowDefinitionPanel: React.FC<
  RightSlideWorkflowDefinitionPanelProps
> = ({ isOpen, onClose, mode = 'add', definitionData }) => {
  const createDefinition = useCreateWorkflowDefinition()
  const updateDefinition = useUpdateWorkflowDefinition()

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

  // Button state logic
  const isFormDirty = isDirty
  const canSave = isFormDirty && !isSubmitting && !isViewMode
  const canReset = isFormDirty && !isSubmitting && !isViewMode

  // Load values when opening / changing mode
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
            active: definitionData.active ?? true,
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
      active: Boolean(data.active),
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
          active: Boolean(data.active),
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
              console.log(err)
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
          console.log(err)
        },
      })
    }
  }

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
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    '&.Mui-focused': {
      color: '#2563EB',
    },
  }

  const valueSx = {
    fontSize: '14px',
    color: '#111827',
    '&::placeholder': {
      color: '#9CA3AF',
      opacity: 1,
    },
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
            active: definitionData.active ?? true,
          }
        : DEFAULT_VALUES
    reset(loaded, { keepDirty: false })
    clearErrors()
  }, [mode, definitionData, reset, clearErrors])

  const onError = (errors: FieldErrors<DefinitionFormData>) => {
    console.log('Form validation errors:', errors)
  }

  const renderTextField = (
    name: keyof DefinitionFormData,
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

  type OptionItem = {
    id?: string | number
    label: string
    value: string | number
  }

  // make options optional
  const renderSelectField = (
    name: keyof DefinitionFormData,
    label: string,
    options?: OptionItem[] | string[],
    gridSize: number = 6,
    extraProps: {
      isLoading?: boolean
      disabled?: boolean
      onChange?: (value: string | number) => void
      placeholder?: string
    } = {}
  ) => {
    // fallback: if caller didn't pass options, use moduleOptions (must be in scope)
    const resolvedOptions: OptionItem[] | string[] =
      options && options.length > 0
        ? options
        : typeof moduleOptions !== 'undefined'
          ? moduleOptions.map((op: any) => ({
              label: op.label,
              value: op.value,
              id: op.id,
            }))
          : [] // empty array if no fallback

    return (
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
                sx={{ ...commonFieldStyles(false), ...valueSx }}
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
            </FormControl>
          )}
        />
      </Grid>
    )
  }

  const renderCheckboxField = (
    name: string,
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
              ? 'Edit Workflow Definition'
              : 'Add Workflow Definition'}
          </DialogTitle>
          <IconButton onClick={onClose} size="small">
            <CancelOutlinedIcon />
          </IconButton>
        </Box>
      </Box>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <DialogContent dividers>
          {/* Error messages removed - silent error handling */}

          <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
            {renderTextField(
              'name',
              getWorkflowDefinitionLabel('CDL_WD_NAME'),
              'text',
              12
            )}
            {renderTextField(
              'version',
              getWorkflowDefinitionLabel('CDL_WD_VERSION'),
              'number',
              12
            )}
            {renderTextField(
              'moduleCode',
              getWorkflowDefinitionLabel('CDL_WD_MODULE_CODE'),
              'text',
              12
            )}
            {renderTextField(
              'actionCode',
              getWorkflowDefinitionLabel('CDL_WD_ACTION_CODE'),
              'text',
              12
            )}

            {renderSelectField(
              'applicationModuleId',
              `${getWorkflowDefinitionLabel('CDL_WD_APPLICATION_MODULE_ID')}`, // dynamic label here
              moduleOptions.map((option) => ({
                label: option.label,
                value: option.value,
                id: option.id,
              })),
              12,
              {
                isLoading: formLoading,
                disabled: isSubmitting || isViewMode,
              }
            )}
            {renderSelectField(
              'workflowActionId',
              `${getWorkflowDefinitionLabel('CDL_WD_WORKFLOW_ACTION_ID')}`, // dynamic label
              actionOptions.map((option) => ({
                label: option.label,
                value: option.value,
                id: option.id,
              })),
              12,
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
                  3,
                  { disabled: isSubmitting, defaultValue: false }
                )}

                {renderCheckboxField(
                  'active',
                  getWorkflowDefinitionLabel('CDL_WD_ACTIVE'),
                  3,
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
        {/* 
        {!isViewMode && (
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
                    ? formLoading
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

      {/* All alerts and snackbars removed - silent error handling */}
    </Drawer>
  )
}
