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
} from '@mui/material'
import { Controller, useForm, FieldErrors } from 'react-hook-form'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { getLabelByConfigId as getWorkflowStageTemplateLabel } from '@/constants/mappings/workflowMapping'

import {
  useCreateWorkflowStageTemplate,
  useUpdateWorkflowStageTemplate,
  useWorkflowStageTemplateForm,
} from '@/hooks/workflow'
import type { WorkflowStageTemplate } from '@/services/api/workflowApi'

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

export const RightSlideWorkflowStageTemplatePanel: React.FC<
  RightSlideWorkflowStageTemplatePanelProps
> = ({ isOpen, onClose, mode = 'add', templateData }) => {
  const createTemplate = useCreateWorkflowStageTemplate()
  const updateTemplate = useUpdateWorkflowStageTemplate()

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
    mode: 'onChange',
  })

  const isSubmitting =
    createTemplate.isPending ||
    updateTemplate.isPending ||
    isFormSubmitting ||
    formLoading
  const isViewMode = mode === 'view'

  // Button state logic
  const isFormDirty = isDirty
  const canSave = isFormDirty && !isSubmitting && !isViewMode
  const canReset = isFormDirty && !isSubmitting && !isViewMode

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
      // If it's already a number, return it
      if (typeof workflowDefinitionDTO === 'number') {
        return workflowDefinitionDTO
      }

      // If it's an object with an id property
      if (
        workflowDefinitionDTO &&
        typeof workflowDefinitionDTO === 'object' &&
        workflowDefinitionDTO.id
      ) {
        const id = parseInt(workflowDefinitionDTO.id.toString(), 10)
        return isNaN(id) ? null : id
      }

      // If it's a string, try to parse it
      if (typeof workflowDefinitionDTO === 'string') {
        const id = parseInt(workflowDefinitionDTO, 10)
        return isNaN(id) ? null : id
      }

      return null
    } catch {
      return null
    }
  }

  const onSubmit = (data: StageTemplateFormData) => {
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
        }

        updateTemplate.mutate(
          { id: templateData.id.toString(), updates: updatePayload },
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
      createTemplate.mutate(createPayload, {
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
    console.log('Form validation errors:', errors)
  }

  const renderTextField = (
    name: keyof StageTemplateFormData,
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
    name: keyof StageTemplateFormData,
    label: string,
    options: OptionItem[] | string[],
    gridSize: number = 12,
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
              disabled={
                !!extraProps.disabled ||
                !!extraProps.isLoading ||
                isSubmitting ||
                isViewMode
              }
              label={extraProps.placeholder ?? label}
              sx={{ ...commonFieldStyles(false), ...valueSx }}
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
              ? 'Edit Workflow Stage Template'
              : 'Add Workflow Stage Template '}
          </DialogTitle>
          <IconButton onClick={onClose} size="small">
            <CancelOutlinedIcon />
          </IconButton>
        </Box>
      </Box>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <DialogContent dividers>
          <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
            {renderTextField(
              'name',
              getWorkflowStageTemplateLabel('CDL_ST_NAME'),
              'text',
              12
            )}
            {renderTextField(
              'stageOrder',
              getWorkflowStageTemplateLabel('CDL_ST_ORDER'),
              'number',
              12
            )}
            {renderTextField(
              'stageKey',
              getWorkflowStageTemplateLabel('CDL_ST_KEY'),
              'text',
              12
            )}
            {renderTextField(
              'keycloakGroup',
              getWorkflowStageTemplateLabel('CDL_ST_GROUP'),
              'text',
              12
            )}
            {renderTextField(
              'requiredApprovals',
              getWorkflowStageTemplateLabel('CDL_ST_REQUIRED_APPROVALS'),
              'number',
              12
            )}
            {renderTextField(
              'slaHours',
              getWorkflowStageTemplateLabel('CDL_ST_SLA_HOURS'),
              'number',
              12
            )}

            {renderTextField(
              'description',
              getWorkflowStageTemplateLabel('CDL_ST_DESCRIPTION'),
              'text',
              12
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
