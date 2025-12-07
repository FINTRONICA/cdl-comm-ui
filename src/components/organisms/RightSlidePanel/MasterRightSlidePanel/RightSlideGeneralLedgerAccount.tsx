import React, { useState, useCallback } from 'react'
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
  InputAdornment,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { Controller, useForm } from 'react-hook-form'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import {
  useSaveGeneralLedgerAccount,
  useGeneralLedgerAccount,
} from '@/hooks/master/CustomerHook/useGeneralLedgerAccount'
import {
  validateGeneralLedgerAccountData,
  sanitizeGeneralLedgerAccountData,
  type GeneralLedgerAccountFormData,
} from '@/lib/validation/masterValidation/generalLedgerAccountSchemas'
import type {
        CreateGeneralLedgerAccountRequest,
  UpdateGeneralLedgerAccountRequest,
  GeneralLedgerAccount,
  TaskStatusDTO,
} from '@/services/api/masterApi/Customer/generalLedgerAccountService'
import { getMasterLabel } from '@/constants/mappings/master/masterMapping'
import { alpha, useTheme } from '@mui/material/styles'
import { buildPanelSurfaceTokens } from '../panelTheme'
import { useTaskStatuses } from '@/hooks/master/CustomerHook/useTaskStatus'
import { idService } from '@/services/api/developerIdService'

interface RightSlideGeneralLedgerAccountPanelProps {
  isOpen: boolean
  onClose: () => void
  onGeneralLedgerAccountAdded?: (generalLedgerAccount: GeneralLedgerAccount) => void
  onGeneralLedgerAccountUpdated?: (
    generalLedgerAccount: GeneralLedgerAccount,
    index: number
  ) => void
  title?: string
  mode?: 'add' | 'edit'
            actionData?: GeneralLedgerAccount | null
  generalLedgerAccountIndex?: number | undefined
  taskStatusOptions?: TaskStatusDTO[]
  taskStatusLoading?: boolean
  taskStatusError?: unknown
}

    export const RightSlideGeneralLedgerAccountPanel: React.FC<
  RightSlideGeneralLedgerAccountPanelProps
> = ({
  isOpen,
  onClose,
        onGeneralLedgerAccountAdded,
  onGeneralLedgerAccountUpdated,
  mode = 'add',
  actionData,
  generalLedgerAccountIndex,
  taskStatusOptions: _propTaskStatusOptions = [], // eslint-disable-line @typescript-eslint/no-unused-vars
  taskStatusLoading: propTaskStatusLoading = false,
  taskStatusError: propTaskStatusError = null,
}) => {
  const theme = useTheme()
  const tokens = React.useMemo(() => buildPanelSurfaceTokens(theme), [theme])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [generatedId, setGeneratedId] = useState<string>('')
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false)
  
  // Check if we're in edit mode
  const isEditMode = mode === 'edit'
  const isReadOnly = false // Can be made a prop if needed

    const saveGeneralLedgerAccountMutation = useSaveGeneralLedgerAccount()

  // Fetch full product program data when in edit mode
  const { data: apiGeneralLedgerAccountData } = useGeneralLedgerAccount(
    mode === 'edit' && actionData?.id ? String(actionData.id) : null
  )

  // Fetch task statuses
  const { isLoading: taskStatusesLoading } = useTaskStatuses()
  const taskStatusLoading = propTaskStatusLoading || taskStatusesLoading
  const taskStatusError = propTaskStatusError || null

  // Dynamic labels
  const getGeneralLedgerAccountLabelDynamic = useCallback(
    (configId: string): string => {
      return getMasterLabel(configId)
    },
    []
  )

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GeneralLedgerAccountFormData & { generalLedgerAccountId?: string }>({
    defaultValues: {
      generalLedgerAccountId: '',
     ledgerAccountNumber: '',
        branchIdentifierCode: '',
        ledgerAccountDescription:'',
        ledgerAccountTypeCode: '',  
      active: true,
      taskStatusDTO: null,
    },
    mode: 'onChange',
  })

  // Initialize general ledger account ID from form value
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'generalLedgerAccountId' && value.generalLedgerAccountId) {
        setGeneratedId(value.generalLedgerAccountId)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // Function to generate new product program ID
  const handleGenerateNewId = async () => {
    try {
      setIsGeneratingId(true)
      const newIdResponse = idService.generateNewId('GLA')
      setGeneratedId(newIdResponse.id)
      setValue('generalLedgerAccountId', newIdResponse.id, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } catch {
      // Handle error silently
    } finally {
      setIsGeneratingId(false)
    }
  }

  // Track the last reset ID and mode to prevent unnecessary resets
  const lastResetIdRef = React.useRef<string | number | null>(null)
  const lastModeRef = React.useRef<'add' | 'edit' | null>(null)
  const lastIsOpenRef = React.useRef<boolean>(false)
  // Reset form when panel opens/closes or mode/data changes
  React.useEffect(() => {
    if (!isOpen) {
      if (lastIsOpenRef.current) {
        reset({
          generalLedgerAccountId: '',
          ledgerAccountNumber: '',
          branchIdentifierCode: '',
          ledgerAccountDescription: '',
          ledgerAccountTypeCode: '',
          active: true,
          taskStatusDTO: null,
        })
        setGeneratedId('')
        lastResetIdRef.current = null
        lastModeRef.current = null
      }
      lastIsOpenRef.current = false
      return
    }

    if (!lastIsOpenRef.current) {
      lastIsOpenRef.current = true
    }

    const currentId = (apiGeneralLedgerAccountData?.id || actionData?.id) ?? null
    const shouldReset =
      lastModeRef.current !== mode ||
      (mode === 'edit' && lastResetIdRef.current !== currentId) ||
      (mode === 'edit' && !lastResetIdRef.current && currentId)

    if (mode === 'edit') {
      // Wait for API data to load if we're in edit mode, but use actionData as fallback
      if (taskStatusLoading && !actionData) {
        return
      }

            if (shouldReset && (apiGeneralLedgerAccountData || actionData)) {
        const dataToUse = apiGeneralLedgerAccountData || actionData
        if (!dataToUse) return

        const generalLedgerAccountId = dataToUse.uuid || `GLA-${dataToUse.id}` || ''
        setGeneratedId(generalLedgerAccountId)

        reset({
          generalLedgerAccountId: generalLedgerAccountId,
          ledgerAccountNumber: dataToUse.ledgerAccountNumber || '',
          branchIdentifierCode: dataToUse.branchIdentifierCode || '',
          ledgerAccountDescription: dataToUse.ledgerAccountDescription || '',
          ledgerAccountTypeCode: dataToUse.ledgerAccountTypeCode || '',
          active: dataToUse.active ?? true,
          taskStatusDTO: dataToUse.taskStatusDTO?.id
            ? { id: dataToUse.taskStatusDTO.id }
            : null,
        })

        lastResetIdRef.current = dataToUse.id
        lastModeRef.current = mode
      } else if (!shouldReset) {
        return
      }
    } else if (mode === 'add') {
      reset({
        generalLedgerAccountId: '',
        ledgerAccountNumber: '',
        branchIdentifierCode: '',
        ledgerAccountDescription: '',
        ledgerAccountTypeCode: '',
        active: true,
        taskStatusDTO: null,
      })
      setGeneratedId('')

      lastResetIdRef.current = null
      lastModeRef.current = mode
    }
  }, [
    isOpen,
    mode,
        apiGeneralLedgerAccountData,
    actionData,
    taskStatusLoading,
    reset,
  ])


  const handleFetchDetails = useCallback(() => {
    // TODO: Implement fetch details logic when API is available
    console.log('Fetch details clicked')
  }, [])

  const renderTextFieldWithButton = (
    name: string,
    label: string,
    buttonText: string,
    gridSize: number = 6,
    required = false
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name as keyof GeneralLedgerAccountFormData}
        control={control}
        defaultValue=""
        rules={{
          required: required ? `${label} is required` : false,
          validate: (value, formValues) => {
            const fieldName = name as keyof GeneralLedgerAccountFormData
            return validateGeneralLedgerAccountField(fieldName, value, formValues as GeneralLedgerAccountFormData & { generalLedgerAccountId?: string })
          },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label={label}
            required={required}
            disabled={isReadOnly}
            error={!!errors[name as keyof typeof errors]}
            helperText={errors[name as keyof typeof errors]?.message?.toString()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      color: theme.palette.primary.contrastText,
                      borderRadius: '8px',
                      textTransform: 'none',
                      background: theme.palette.primary.main,
                      '&:hover': {
                        background: theme.palette.primary.dark,
                      },
                      minWidth: '100px',
                      height: '32px',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 500,
                      fontStyle: 'normal',
                      fontSize: '11px',
                      lineHeight: '14px',
                      letterSpacing: '0.3px',
                      px: 1,
                    }}
                    onClick={handleFetchDetails}
                    disabled={isReadOnly}
                  >
                    {buttonText}
                  </Button>
                </InputAdornment>
              ),
              sx: valueStyles,
            }}
            InputLabelProps={{
              sx: {
                ...labelStyles,
                ...(!!errors[name as keyof typeof errors] && {
                  color: theme.palette.error.main,
                  '&.Mui-focused': { color: theme.palette.error.main },
                  '&.MuiFormLabel-filled': { color: theme.palette.error.main },
                }),
              },
            }}
            sx={[
              fieldStyles,
              isReadOnly && {
                '& .MuiOutlinedInput-root': {
                  backgroundColor: viewModeStyles.backgroundColor,
                  color: textSecondary,
                  '& fieldset': {
                    borderColor: viewModeStyles.borderColor,
                  },
                  '&:hover fieldset': {
                    borderColor: viewModeStyles.borderColor,
                  },
                },
              },
            ]}
          />
        )}
      />
    </Grid>
  )
    const validateGeneralLedgerAccountField = React.useCallback(
    (
      fieldName: keyof GeneralLedgerAccountFormData | 'generalLedgerAccountId',
      value: unknown,
      allValues: GeneralLedgerAccountFormData & { generalLedgerAccountId?: string }
    ): string | boolean => {
      try {
        const requiredFields: Record<string, string> = {
          ledgerAccountNumber: 'General Ledger Account Number is required',
          branchIdentifierCode: 'Branch Identifier Code is required',
          ledgerAccountDescription: 'General Ledger Account Description is required',
          ledgerAccountTypeCode: 'General Ledger Account Type Code is required',
        }

        if (requiredFields[fieldName]) {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return requiredFields[fieldName]
          }
        }

        // Validate product program ID for new product programs (not in edit mode)
        if (fieldName === 'generalLedgerAccountId' && mode === 'add') {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return 'General Ledger Account ID is required. Please generate an ID.'
          }
        }

        if (
          (fieldName === 'ledgerAccountNumber' || fieldName === 'ledgerAccountDescription' || fieldName === 'ledgerAccountTypeCode' || fieldName === 'branchIdentifierCode') &&
          value &&
          typeof value === 'string' &&
          value.trim() !== ''
        ) {
          const result = validateGeneralLedgerAccountData(allValues)
          if (result.success) {
            return true
          } else {
            const fieldError = result.errors?.issues.find(
              (issue) => issue.path.some((p) => String(p) === fieldName)
            )
            return fieldError ? fieldError.message : true
          }
        }

        return true
      } catch {
        return true
      }
    },
    [mode]
  )

  const onSubmit = async (data: GeneralLedgerAccountFormData & { generalLedgerAccountId?: string }) => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)

      if (taskStatusLoading) {
        setErrorMessage('Please wait for dropdown options to load before submitting.')
        return
      }

        const validatedData = sanitizeGeneralLedgerAccountData(data)
      const currentDataToEdit = apiGeneralLedgerAccountData || actionData
      const isEditing = Boolean(mode === 'edit' && currentDataToEdit?.id)

      // Validate general ledger account ID for new accounts
      if (!isEditing && !data.generalLedgerAccountId && !generatedId) {
        setErrorMessage('Please generate a General Ledger Account ID before submitting.')
        return
      }

      const generalLedgerAccountData: CreateGeneralLedgerAccountRequest | UpdateGeneralLedgerAccountRequest = {
        ledgerAccountNumber: validatedData.ledgerAccountNumber,
        branchIdentifierCode: validatedData.branchIdentifierCode,
        ledgerAccountDescription: validatedData.ledgerAccountDescription,
        ledgerAccountTypeCode: validatedData.ledgerAccountTypeCode,
        active: validatedData.active,
        enabled: true,
        deleted: false,
        ...(generatedId && { uuid: generatedId }),
        ...(validatedData.taskStatusDTO !== null && validatedData.taskStatusDTO?.id && {
          taskStatusDTO: { id: validatedData.taskStatusDTO.id },
        }),
      } as CreateGeneralLedgerAccountRequest | UpdateGeneralLedgerAccountRequest

      const generalLedgerAccountId = isEditing ? (currentDataToEdit?.id ? String(currentDataToEdit.id) : undefined) : undefined

      const result = await saveGeneralLedgerAccountMutation.mutateAsync({
        data: generalLedgerAccountData,
        isEditing,
        ...(generalLedgerAccountId && { generalLedgerAccountId }),
      })

      // Update generatedId with the UUID from the response if available
      if (result?.uuid) {
        setGeneratedId(result.uuid)
      }

      setSuccessMessage(
        isEditing
          ? 'General Ledger Account updated successfully!'
          : 'General Ledger Account added successfully!'
      )

      if (
        mode === 'edit' &&
        onGeneralLedgerAccountUpdated &&
        generalLedgerAccountIndex !== null &&
        generalLedgerAccountIndex !== undefined
      ) {
        onGeneralLedgerAccountUpdated(result as GeneralLedgerAccount, generalLedgerAccountIndex)
      } else if (onGeneralLedgerAccountAdded) {
        onGeneralLedgerAccountAdded(result as GeneralLedgerAccount)
      }
      
      // Refresh will be handled by parent component callbacks

      setTimeout(() => {
        reset()
        setGeneratedId('')
        handleClose()
      }, 1500)
    } catch (error: unknown) {
      let errorMessage = 'Failed to add general ledger account. Please try again.'
      if (error instanceof Error) {
        if (error.message.includes('validation')) {
          errorMessage = 'Please check your input and try again.'
        } else {
          errorMessage = error.message
        }
      }
      setErrorMessage(errorMessage)
    }
  }


  const handleClose = () => {
    reset()
    setErrorMessage(null)
    setSuccessMessage(null)
    setGeneratedId('')
    onClose()
  }
  
  // Style variables
  const isDark = theme.palette.mode === 'dark'
  const textSecondary = isDark ? '#CBD5E1' : '#6B7280'
  const commonFieldStyles = React.useMemo(() => tokens.input, [tokens])
  const labelSx = tokens.label
  const valueSx = tokens.value
  
  // View mode styles
  const viewModeStyles = React.useMemo(
    () => ({
      backgroundColor: isDark ? alpha('#1E293B', 0.5) : '#F9FAFB',
      borderColor: isDark ? alpha('#FFFFFF', 0.2) : '#E5E7EB',
    }),
    [isDark]
  )
  
  // Field styles for the ID field
  const fieldStyles = React.useMemo(
    () => {
      if (typeof commonFieldStyles === 'object' && commonFieldStyles !== null) {
        return { ...commonFieldStyles }
      }
      return {}
    },
    [commonFieldStyles]
  )
  
  const labelStyles = React.useMemo(
    () => ({
      ...labelSx,
    }),
    [labelSx]
  )
  
  const valueStyles = React.useMemo(
    () => ({
      ...valueSx,
    }),
    [valueSx]
  )

  const renderGeneralLedgerAccountIdField = (
    name: 'generalLedgerAccountId',
    label: string,
    gridSize: number = 6,
    required = false
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        rules={{
          required: required ? `${label} is required` : false,
          validate: (value, formValues) =>
            validateGeneralLedgerAccountField(name, value, formValues as GeneralLedgerAccountFormData & { generalLedgerAccountId?: string }),
        }}
        render={({ field }) => {
          const fieldError = errors[name as keyof typeof errors]
          return (
            <TextField
              {...field}
              fullWidth
              label={label}
              required={required}
              value={field.value || generatedId}
              error={!!fieldError}
              helperText={fieldError?.message?.toString()}
              onChange={(e) => {
                setGeneratedId(e.target.value)
                field.onChange(e)
              }}
              disabled={isReadOnly || isEditMode}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ mr: 0 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={handleGenerateNewId}
                      disabled={isGeneratingId || isReadOnly || isEditMode}
                      sx={{
                        color: theme.palette.primary.contrastText,
                        borderRadius: '8px',
                        textTransform: 'none',
                        background: theme.palette.primary.main,
                        '&:hover': {
                          background: theme.palette.primary.dark,
                        },
                        minWidth: '100px',
                        height: '32px',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 500,
                        fontStyle: 'normal',
                        fontSize: '11px',
                        lineHeight: '14px',
                        letterSpacing: '0.3px',
                        px: 1,
                      }}
                    >
                      {isGeneratingId ? 'Generating...' : 'Generate ID'}
                    </Button>
                  </InputAdornment>
                ),
                sx: valueStyles,
              }}
              InputLabelProps={{
                sx: {
                  ...labelStyles,
                  ...(!!fieldError && {
                    color: theme.palette.error.main,
                    '&.Mui-focused': { color: theme.palette.error.main },
                    '&.MuiFormLabel-filled': { color: theme.palette.error.main },
                  }),
                },
              }}
              sx={{
                ...(typeof fieldStyles === 'object' && fieldStyles ? fieldStyles : {}),
                ...((isReadOnly || isEditMode) && {
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: viewModeStyles.backgroundColor,
                    color: textSecondary,
                    '& fieldset': {
                      borderColor: viewModeStyles.borderColor,
                    },
                    '&:hover fieldset': {
                      borderColor: viewModeStyles.borderColor,
                    },
                  },
                }),
              }}
            />
          )
        }}
      />
    </Grid>
  )

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={handleClose}
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
            ? `${getGeneralLedgerAccountLabelDynamic('CDL_COMMON_UPDATE')} ${getGeneralLedgerAccountLabelDynamic('CDL_MGLA_NAME')}`
            : `${getGeneralLedgerAccountLabelDynamic('CDL_COMMON_ADD')} ${getGeneralLedgerAccountLabelDynamic('CDL_MGLA_NAME')}`}
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
            {taskStatusError && (
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

            <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
              {renderGeneralLedgerAccountIdField(
                'generalLedgerAccountId',
                        getGeneralLedgerAccountLabelDynamic('CDL_MGLA_ID'),
                12,
                true
              )}

{renderTextFieldWithButton(
              'ledgerAccountNumber',
              getGeneralLedgerAccountLabelDynamic('CDL_MGLA_ACCOUNT_NUMBER'),
              'Fetch Details',
              12,
              true
            )}
             {renderTextFieldWithButton(
              'branchIdentifierCode',
              getGeneralLedgerAccountLabelDynamic('CDL_MGLA_IDENTIFIER_CODE'),
              'Fetch Details',
              12,
              true
            )}
            {renderTextFieldWithButton(
              'ledgerAccountDescription',
              getGeneralLedgerAccountLabelDynamic('CDL_MGLA_DESCRIPTION'),
              'Fetch Details',
              12,
              true
            )}
            {renderTextFieldWithButton(
              'ledgerAccountTypeCode',
              getGeneralLedgerAccountLabelDynamic('CDL_MGLA_TYPE_CODE'),
              'Fetch Details',
              12,
              true
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
                  disabled={saveGeneralLedgerAccountMutation.isPending || taskStatusLoading}
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
                  {getGeneralLedgerAccountLabelDynamic('CDL_COMMON_CANCEL')}
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  type="submit"
                  disabled={saveGeneralLedgerAccountMutation.isPending || taskStatusLoading}
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
                  {saveGeneralLedgerAccountMutation.isPending
                    ? mode === 'edit'
                      ? getGeneralLedgerAccountLabelDynamic('CDL_COMMON_UPDATING')
                      : getGeneralLedgerAccountLabelDynamic('CDL_COMMON_ADDING')
                    : mode === 'edit'
                      ? getGeneralLedgerAccountLabelDynamic('CDL_COMMON_UPDATE')
                      : getGeneralLedgerAccountLabelDynamic('CDL_COMMON_ADD')}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>

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
