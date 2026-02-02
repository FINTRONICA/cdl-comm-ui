import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  TextField,
  Button,
  Drawer,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { FormError } from '../../atoms/FormError'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useWorkflowAction } from '@/hooks/workflow'
import { useSaveWorkflowAction } from '@/hooks/workflow/useWorkflowActions'
import {
  WorkflowActionSchemas,
  validateAndSanitizeWorkflowActionData,
} from '@/lib/validation/workflowActionSchemas'
import { useWorkflowActionLabelsWithCache } from '@/hooks/workflow/useWorkflowActionLabelsWithCache'
import { getWorkflowLabelsByCategory } from '@/constants/mappings/workflowMapping'
import { useAppStore } from '@/store'
import { alpha, useTheme } from '@mui/material/styles'
import { buildPanelSurfaceTokens } from './panelTheme'
import { sanitizeInput } from '@/utils'

interface WorkflowActionFormData {
  actionKey: string
  actionName: string
  moduleCode: string
  name: string
  description: string
}

interface RightSlidePanelProps {
  isOpen: boolean
  onClose: () => void
  onWorkflowActionAdded?: (workflowAction: WorkflowActionFormData) => void
  onWorkflowActionUpdated?: (
    workflowAction: WorkflowActionFormData,
    index: number
  ) => void
  title?: string
  mode?: 'add' | 'edit'
  workflowActionData?: WorkflowActionFormData | null
  actionData?: WorkflowActionFormData | null
  workflowActionIndex?: number
  editingWorkflowAction?: WorkflowActionFormData | null
  workflowActionLabels?: unknown[]
  workflowActionTypes?: unknown[]
  workflowActionId?: string
  dropdownsLoading?: boolean
  dropdownsError?: unknown
}

export const RightSlideWorkflowActionPanel: React.FC<RightSlidePanelProps> = ({
  isOpen,
  onClose,
  onWorkflowActionAdded,
  onWorkflowActionUpdated,
  mode = 'add',
  workflowActionData,
  actionData,
  workflowActionIndex,
  editingWorkflowAction,
  workflowActionLabels: _propWorkflowActionLabels, // eslint-disable-line @typescript-eslint/no-unused-vars
  workflowActionTypes: _propWorkflowActionTypes, // eslint-disable-line @typescript-eslint/no-unused-vars
  workflowActionId,
  dropdownsLoading: propDropdownsLoading,
  dropdownsError: propDropdownsError,
}) => {
  const theme = useTheme()
  const tokens = React.useMemo(() => buildPanelSurfaceTokens(theme), [theme])
  // Use actionData or workflowActionData if provided (new prop), otherwise fall back to editingWorkflowAction (legacy)
  const dataToEdit = actionData || workflowActionData || editingWorkflowAction
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const addWorkflowActionMutation = useSaveWorkflowAction()

  // Determine the ID to fetch - use workflowActionId prop, or id from dataToEdit
  const editId =
    mode === 'edit'
      ? workflowActionId ||
        (dataToEdit as { id?: string | number })?.id?.toString() ||
        null
      : null

  // Fetch full workflow action data when in edit mode
  const {
    data: apiWorkflowActionData,
    isLoading: isLoadingWorkflowAction,
    error: workflowActionError,
  } = useWorkflowAction(editId)

  const dropdownsLoading = propDropdownsLoading || false
  const dropdownsError = propDropdownsError || null

  // Dynamic labels: same pattern used in Step4 & Contact Details
  const workflowActionLabelsHook = useWorkflowActionLabelsWithCache()
  const workflowActionLabels = workflowActionLabelsHook.data
  const getLabel = workflowActionLabelsHook.getLabel
  const currentLanguage = useAppStore((state) => state.language) || 'EN'
  const getWorkflowActionLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getWorkflowLabelsByCategory(configId)
      if (workflowActionLabels)
        return getLabel(configId, currentLanguage, fallback)
      return fallback
    },
    [workflowActionLabels, currentLanguage, getLabel]
  )

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<WorkflowActionFormData>({
    defaultValues: {
      actionKey: dataToEdit?.actionKey || '',
      actionName: dataToEdit?.actionName || '',
      moduleCode: dataToEdit?.moduleCode || '',
      name: dataToEdit?.name || '',
      description: dataToEdit?.description || '',
    },
    mode: 'onChange', // Enable real-time validation
  })

  // Reset form when editing workflow action changes
  useEffect(() => {
    if (isOpen && mode === 'edit' && (apiWorkflowActionData || dataToEdit)) {
      // Use API data if available, otherwise use table data
      const dataToUse = (apiWorkflowActionData ||
        dataToEdit) as WorkflowActionFormData & { id?: string | number }

      // Wait for dropdowns to load
      if (dropdownsLoading || isLoadingWorkflowAction) {
        return
      }

      // Map display values back to IDs for editing
      reset({
        actionKey: dataToUse.actionKey || '',
        actionName: dataToUse.actionName || '',
        moduleCode: dataToUse.moduleCode || '',
        name: dataToUse.name || '',
        description: dataToUse.description || '',
      })
    } else if (isOpen && mode === 'add') {
      reset({
        actionKey: '',
        actionName: '',
        moduleCode: '',
        name: '',
        description: '',
      })
    } else if (!isOpen) {
      // Reset everything when closing
      reset({
        actionKey: '',
        actionName: '',
        moduleCode: '',
        name: '',
        description: '',
      })
    }
  }, [
    isOpen,
    mode,
    apiWorkflowActionData,
    dataToEdit,
    dropdownsLoading,
    isLoadingWorkflowAction,
    reset,
  ])

  // Validation function using WorkflowActionSchemas
  const validateWorkflowActionField = (
    fieldName: string,
    value: string | undefined,
    allValues: WorkflowActionFormData
  ) => {
    try {
      // Simple required checks first so empty required fields show errors immediately
      const requiredFields: Record<string, string> = {
        actionKey: 'This field cannot be empty or spaces only',
        actionName: 'This field cannot be empty or spaces only',
        moduleCode: 'This field cannot be empty or spaces only',
        name: 'This field cannot be empty or spaces only',
        // Description is optional, not required
      }

      if (requiredFields[fieldName]) {
        const sanitizedValue = sanitizeInput(value ?? '')
        if (!sanitizedValue) {
          return requiredFields[fieldName]
        }
      }

      // Transform form data to match WorkflowActionSchemas format
      const workflowActionForValidation = {
        actionKey: sanitizeInput(allValues.actionKey),
        actionName: sanitizeInput(allValues.actionName),
        moduleCode: sanitizeInput(allValues.moduleCode),
        name: sanitizeInput(allValues.name),
        description: sanitizeInput(allValues.description || ''),
      }

      // Validate using WorkflowActionSchemas.workflowActionForm
      const result = WorkflowActionSchemas.workflowActionForm.safeParse(
        workflowActionForValidation
      )

      if (result.success) {
        return true
      } else {
        // Find the specific field error
        const fieldError = result.error.issues.find((issue) =>
          issue.path.includes(fieldName)
        )

        return fieldError ? 'Invalid input' : true
      }
    } catch {
      return true // Return true on error to avoid blocking the form
    }
  }

  const onSubmit = useCallback(
    async (data: WorkflowActionFormData) => {
      try {
        setErrorMessage(null)
        setSuccessMessage(null)

        // Check if dropdown data is still loading
        if (dropdownsLoading) {
          setErrorMessage(
            'Please wait for dropdown options to load before submitting.'
          )
          return
        }

        // Validate form fields individually to provide better error messages
        const isValid = await trigger()

        if (!isValid) {
          const hasEmptyRequiredFields = [
            data.actionKey,
            data.actionName,
            data.moduleCode,
            data.name,
          ].some((value) => !sanitizeInput(value ?? ''))

          setErrorMessage(
            hasEmptyRequiredFields
              ? 'This field cannot be empty or spaces only'
              : 'Invalid input'
          )
          return
        }

        let validatedData: WorkflowActionFormData
        try {
          const parsedData = validateAndSanitizeWorkflowActionData(data)
          validatedData = {
            ...parsedData,
            description: parsedData.description ?? '',
          }
        } catch {
          setErrorMessage('Invalid input')
          return
        }

        const hasId =
          !!(dataToEdit && (dataToEdit as { id?: string | number }).id) ||
          !!(
            apiWorkflowActionData &&
            (apiWorkflowActionData as { id?: string | number }).id
          ) ||
          !!workflowActionId
        const isEditing = mode === 'edit' && hasId
        const idToUse = isEditing
          ? (apiWorkflowActionData as { id?: string | number })?.id ||
            (dataToEdit as { id?: string | number })?.id ||
            workflowActionId
          : undefined

        // Build payload according to API structure
        const workflowActionPayload: {
          actionKey: string
          actionName: string
          moduleCode: string
          name: string
          description: string
          id?: number
        } = {
          actionKey: validatedData.actionKey,
          actionName: validatedData.actionName,
          moduleCode: validatedData.moduleCode,
          name: validatedData.name,
          description: validatedData.description || '',
        }

        // For updates, include the id
        if (isEditing && idToUse) {
          workflowActionPayload.id =
            typeof idToUse === 'string' ? parseInt(idToUse, 10) : idToUse
        }

        const mutationParams: {
          data: typeof workflowActionPayload
          isEditing: boolean
          workflowActionId?: string
        } = {
          data: workflowActionPayload,
          isEditing: isEditing,
        }

        if (idToUse) {
          mutationParams.workflowActionId = idToUse.toString()
        }

        await addWorkflowActionMutation.mutateAsync(mutationParams)

        setSuccessMessage(
          isEditing
            ? 'Workflow Action updated successfully!'
            : 'Workflow Action added successfully!'
        )

        // Prepare data for callback
        const workflowActionForForm = {
          actionKey: validatedData.actionKey,
          actionName: validatedData.actionName,
          moduleCode: validatedData.moduleCode,
          name: validatedData.name,
          description: validatedData.description || '',
        }

        // Call appropriate callback based on mode
        if (
          mode === 'edit' &&
          onWorkflowActionUpdated &&
          workflowActionIndex !== null &&
          workflowActionIndex !== undefined
        ) {
          onWorkflowActionUpdated(workflowActionForForm, workflowActionIndex)
        } else if (onWorkflowActionAdded) {
          onWorkflowActionAdded(workflowActionForForm)
        }

        setTimeout(() => {
          reset()
          onClose()
        }, 1500)
      } catch (error: unknown) {
        let errorMessage = 'Failed to save workflow action. Please try again.'

        if (error instanceof Error) {
          if (error.message.includes('validation')) {
            errorMessage = 'Please check your input and try again.'
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.'
          } else {
            errorMessage = error.message || errorMessage
          }
        }

        setErrorMessage(errorMessage)
        console.error('Workflow action save error:', error)
      }
    },
    [
      dropdownsLoading,
      trigger,
      dataToEdit,
      apiWorkflowActionData,
      workflowActionId,
      mode,
      addWorkflowActionMutation,
      onWorkflowActionUpdated,
      workflowActionIndex,
      onWorkflowActionAdded,
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

  const commonFieldStyles = useMemo(() => tokens.input, [tokens])
  const errorFieldStyles = useMemo(() => tokens.inputError, [tokens])
  const labelSx = useMemo(() => tokens.label, [tokens])
  const valueSx = useMemo(() => tokens.value, [tokens])

  const renderTextField = (
    name: keyof WorkflowActionFormData,
    label: string,
    defaultValue = '',
    gridSize: number = 6,
    required = false
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={{
          validate: (value, formValues) =>
            validateWorkflowActionField(name, value, formValues),
        }}
        render={({ field }) => (
          <>
            <TextField
              {...field}
              onBlur={(event) => {
                const sanitizedValue = sanitizeInput(event.target.value)
                setValue(name, sanitizedValue, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
                field.onBlur()
              }}
              label={label}
              fullWidth
              required={required}
              error={!!errors[name]}
              InputLabelProps={{ sx: labelSx }}
              InputProps={{ sx: valueSx }}
              sx={errors[name] ? errorFieldStyles : commonFieldStyles}
            />
            <FormError
              error={(errors[name]?.message as string) || ''}
              touched={true}
            />
          </>
        )}
      />
    </Grid>
  )

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={onClose}
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
            backgroundColor:
              typeof tokens.paper.backgroundColor === 'string'
                ? tokens.paper.backgroundColor
                : undefined,
            color: theme.palette.text.primary,
            pr: 3,
            pl: 3,
          }}
        >
          {mode === 'edit'
            ? `${getWorkflowActionLabelDynamic('CDL_COMMON_UPDATE')} ${getWorkflowActionLabelDynamic('CDL_WA_WORKFLOW_ACTION')}`
            : `${getWorkflowActionLabelDynamic('CDL_COMMON_ADD')} ${getWorkflowActionLabelDynamic('CDL_WA_WORKFLOW_ACTION')}`}
          <IconButton
            onClick={onClose}
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


        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <DialogContent
            dividers
            sx={{
              borderColor: tokens.dividerColor,
              backgroundColor: tokens.paper.backgroundColor as string,
            }}
          >
            {/* Show error if dropdowns fail to load */}
            {dropdownsError && (
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
                Failed to load dropdown options. Please refresh the page.
              </Alert>
            )}

            {/* Show error if workflow action fails to load in edit mode */}
            {mode === 'edit' && workflowActionError && (
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
                Failed to load workflow action data. Please try again.
              </Alert>
            )}

            {/* Show loading state when fetching workflow action */}
            {mode === 'edit' && isLoadingWorkflowAction && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  py: 4,
                }}
              >
                <CircularProgress size={40} />
              </Box>
            )}

            <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
              {renderTextField(
                'actionKey',
                getWorkflowActionLabelDynamic('CDL_WA_ACTION_KEY'),
                '',
                12,
                true
              )}
              {renderTextField(
                'actionName',
                getWorkflowActionLabelDynamic('CDL_WA_ACTION_NAME'),
                '',
                12,
                true
              )}
              {renderTextField(
                'moduleCode',
                getWorkflowActionLabelDynamic('CDL_WA_MODULE_CODE'),
                '',
                12,
                true
              )}
              {renderTextField(
                'name',
                getWorkflowActionLabelDynamic('CDL_WA_NAME'),
                '',
                12,
                true
              )}
              {renderTextField(
                'description',
                getWorkflowActionLabelDynamic('CDL_WA_DESCRIPTION'),
                '',
                12,
                false
              )}
            </Grid>
          </DialogContent>

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
                  disabled={
                    addWorkflowActionMutation.isPending ||
                    dropdownsLoading ||
                    (mode === 'edit' && isLoadingWorkflowAction)
                  }
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
                  {getWorkflowActionLabelDynamic('CDL_COMMON_CANCEL')}
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  type="submit"
                  disabled={
                    addWorkflowActionMutation.isPending ||
                    dropdownsLoading ||
                    (mode === 'edit' && isLoadingWorkflowAction)
                  }
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
                  {addWorkflowActionMutation.isPending
                    ? mode === 'edit'
                      ? getWorkflowActionLabelDynamic('CDL_COMMON_UPDATING')
                      : getWorkflowActionLabelDynamic('CDL_COMMON_ADDING')
                    : mode === 'edit'
                      ? getWorkflowActionLabelDynamic('CDL_COMMON_UPDATE')
                      : getWorkflowActionLabelDynamic('CDL_COMMON_ADD')}
                </Button>
              </Grid>
            </Grid>
          </Box>
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
    </LocalizationProvider>
  )
}
