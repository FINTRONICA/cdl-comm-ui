import React, { useState, useEffect } from 'react'
import {
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Drawer,
  Box,
  Alert,
  Snackbar,
} from '@mui/material'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import { Controller, useForm } from 'react-hook-form'
import { FormError } from '../../atoms/FormError'
import { zodResolver } from '@hookform/resolvers/zod'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import {
  useSaveProjectIndividualBeneficiary,
  useUpdateProjectIndividualBeneficiary,
} from '@/hooks/useProjects'
import { useValidationStatus } from '@/hooks/useValidation'
// import { useProjectLabels } from '@/hooks/useProjectLabels'
import { useBuildPartnerAssetLabelsWithUtils } from '@/hooks/useBuildPartnerAssetLabels'
import {
  projectBeneficiaryFormValidationSchema,
  type ProjectBeneficiaryFormData,
} from '@/lib/validation/projectBeneficiary.schema'
import { alpha, useTheme } from '@mui/material/styles'
import { buildPanelSurfaceTokens } from './panelTheme'

interface RightSlidePanelProps {
  isOpen: boolean
  onClose: () => void
  onBeneficiaryAdded?: (beneficiary: any) => void
  title?: string
  editingBeneficiary?: any
  bankNames?: unknown[]
  beneficiaryTypes?: unknown[]
  projectId?: string
  buildPartnerId?: string
  dropdownsLoading?: boolean
  dropdownsError?: unknown
}

export const RightSlideProjectBeneficiaryDetailsPanel: React.FC<
  RightSlidePanelProps
> = ({
  isOpen,
  onClose,
  onBeneficiaryAdded,
  editingBeneficiary,
  beneficiaryTypes: propBeneficiaryTypes,
  projectId,
  dropdownsLoading: propDropdownsLoading,
  dropdownsError: propDropdownsError,
}) => {
  const theme = useTheme()
  const tokens = React.useMemo(() => buildPanelSurfaceTokens(theme), [theme])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [toasts, setToasts] = useState<
    Array<{
      id: string
      message: string
      type: 'success' | 'error'
      timestamp: number
    }>
  >([])

  const addBeneficiaryMutation = useSaveProjectIndividualBeneficiary()
  const updateBeneficiaryMutation = useUpdateProjectIndividualBeneficiary()

  const { getLabel } = useBuildPartnerAssetLabelsWithUtils()
  const language = 'EN'

  const addToast = (message: string, type: 'success' | 'error') => {
    const newToast = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: Date.now(),
    }
    setToasts((prev) => [...prev, newToast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== newToast.id))
    }, 4000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const beneficiaryTypes = propBeneficiaryTypes || [
    { id: 1, configId: 'Individual', configValue: 'Individual' },
    { id: 2, configId: 'Company', configValue: 'Company' },
  ]

  const dropdownsLoading = propDropdownsLoading || false
  const dropdownsError = propDropdownsError || null

  const {
    accountValidationResult,
    accountValidationError,
    resetAccountValidation,
    swiftValidationResult,
    swiftValidationError,
    resetSwiftValidation,
  } = useValidationStatus()

  const { control, handleSubmit, reset, trigger } =
    useForm<ProjectBeneficiaryFormData>({
      resolver: zodResolver(projectBeneficiaryFormValidationSchema),
      mode: 'onChange', // Validate on every change
      defaultValues: {
        reaBeneficiaryId: editingBeneficiary?.reaBeneficiaryId || '',
        reaBeneficiaryType: editingBeneficiary?.reaBeneficiaryType || '',
        reaName: editingBeneficiary?.reaName || '',
        reaBankName: editingBeneficiary?.reaBankName || '',
        reaSwiftCode: editingBeneficiary?.reaSwiftCode || '',
        reaRoutingCode: editingBeneficiary?.reaRoutingCode || '',
        reaAccountNumber: editingBeneficiary?.reaAccountNumber || '',
      },
    })

  // Reset form when editing beneficiary changes
  React.useEffect(() => {
    if (editingBeneficiary) {
      // Map display values back to IDs for editing (only for transfer type, bankName is now text)
      const beneficiaryType = beneficiaryTypes.find(
        (type: unknown) =>
          (type as { configValue: string }).configValue ===
          editingBeneficiary.reaBeneficiaryType
      )

      reset({
        reaBeneficiaryId: editingBeneficiary.reaBeneficiaryId || '',
        reaBeneficiaryType:
          (beneficiaryType as { id?: string })?.id?.toString() ||
          editingBeneficiary.reaBeneficiaryType ||
          '',
        reaName: editingBeneficiary.reaName || '',
        reaBankName: editingBeneficiary.reaBankName || '',
        reaSwiftCode: editingBeneficiary.reaSwiftCode || '',
        reaRoutingCode: editingBeneficiary.reaRoutingCode || '',
        reaAccountNumber: editingBeneficiary.reaAccountNumber || '',
      })
    } else {
      reset({
        reaBeneficiaryId: '',
        reaBeneficiaryType: '',
        reaName: '',
        reaBankName: '',
        reaSwiftCode: '',
        reaRoutingCode: '',
        reaAccountNumber: '',
      })
    }
  }, [editingBeneficiary, reset])

  // Watch for validation results and show toasts
  useEffect(() => {
    if (accountValidationResult) {
      if (accountValidationResult.isValid) {
        addToast(
          `Account validation successful: ${accountValidationResult.message}`,
          'success'
        )
      } else {
        addToast(
          `Account validation failed: ${accountValidationResult.message}`,
          'error'
        )
      }
    }
  }, [accountValidationResult])

  useEffect(() => {
    if (swiftValidationResult) {
      if (swiftValidationResult.isValid) {
        addToast(
          `SWIFT/BIC validation successful: ${swiftValidationResult.message}`,
          'success'
        )
      } else {
        addToast(
          `SWIFT/BIC validation failed: ${swiftValidationResult.message}`,
          'error'
        )
      }
    }
  }, [swiftValidationResult])

  useEffect(() => {
    if (accountValidationError) {
      addToast(
        `Account validation error: ${accountValidationError.message}`,
        'error'
      )
    }
  }, [accountValidationError])

  useEffect(() => {
    if (swiftValidationError) {
      addToast(
        `SWIFT/BIC validation error: ${swiftValidationError.message}`,
        'error'
      )
    }
  }, [swiftValidationError])

  const onSubmit = async (data: ProjectBeneficiaryFormData) => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)

      // Trigger validation to highlight required fields
      const isValid = await trigger()

      if (!isValid) {
        return
      }

      const beneficiaryData = {
        // Include ID for updates
        ...(editingBeneficiary?.id && {
          id: parseInt(editingBeneficiary.id.toString()),
        }),
        reabBeneficiaryId: data.reaBeneficiaryId,
        reabTranferTypeDTO: {
          id: parseInt(data.reaBeneficiaryType.toString()) || 0,
        },
        reabName: data.reaName,
        reabBank: data.reaBankName,
        reabSwift: data.reaSwiftCode,
        reabRoutingCode: data.reaRoutingCode,
        reabBeneAccount: data.reaAccountNumber,
        realEstateAssestDTO: [
          {
            id: projectId ? parseInt(projectId) : undefined,
          },
        ],
        // Add deleted and enabled fields when editing
        ...(editingBeneficiary?.id && {
          deleted: false,
          enabled: true,
        }),
      }

      if (editingBeneficiary?.id) {
        // Update existing beneficiary using PUT
        await updateBeneficiaryMutation.mutateAsync({
          id: editingBeneficiary.id.toString(),
          beneficiaryData,
        })
        setSuccessMessage('Beneficiary updated successfully!')
      } else {
        // Add new beneficiary using POST
        await addBeneficiaryMutation.mutateAsync(beneficiaryData)
        setSuccessMessage('Beneficiary added successfully!')
      }

      if (onBeneficiaryAdded) {
        const beneficiaryTypeLabel =
          (
            beneficiaryTypes.find(
              (type: unknown) =>
                (type as { id: string }).id === data.reaBeneficiaryType
            ) as { configValue: string }
          )?.configValue || `Type ${data.reaBeneficiaryType}`

        const beneficiaryForForm = {
          // Map to table column names with display labels
          reaBeneficiaryId: data.reaBeneficiaryId,
          reaBeneficiaryType: beneficiaryTypeLabel,
          reaName: data.reaName,
          reaBankName: data.reaBankName, // Now a text field, use value directly
          reaSwiftCode: data.reaSwiftCode,
          reaRoutingCode: data.reaRoutingCode,
          reaAccountNumber: data.reaAccountNumber,
          // Keep original fields for reference
          reaBeneficiaryTypeId: data.reaBeneficiaryType,
          realEstateAssetDTO: {
            id: projectId ? parseInt(projectId) : undefined,
          },
        }

        onBeneficiaryAdded(beneficiaryForForm)
      }

      // Reset form and close after a short delay
      setTimeout(() => {
        reset()
        onClose()
      }, 1500)
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to add beneficiary. Please try again.'
      setErrorMessage(errorMessage)
    }
  }

  const handleClose = () => {
    reset()
    setErrorMessage(null)
    setSuccessMessage(null)
    resetAccountValidation()
    resetSwiftValidation()
    onClose()
  }

  // Common styles for form components
  const commonFieldStyles = React.useMemo(() => tokens.input, [tokens])
  const errorFieldStyles = React.useMemo(() => tokens.inputError, [tokens])

  const selectStyles = React.useMemo(
    () => ({
      height: '46px',
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

  const labelSx = tokens.label
  const valueSx = tokens.value

  const renderTextField = (
    name: keyof ProjectBeneficiaryFormData,
    label: string,
    defaultValue = '',
    gridSize: number = 6,
    required = false,
    maxLength?: number
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field, fieldState: { error } }) => (
          <>
            <TextField
              {...field}
              label={label}
              fullWidth
              required={required}
              error={!!error}
              inputProps={{ maxLength }}
              InputLabelProps={{ sx: labelSx }}
              InputProps={{ sx: valueSx }}
              sx={error ? errorFieldStyles : commonFieldStyles}
            />
            <FormError
              error={(error?.message as string) || ''}
              touched={true}
            />
          </>
        )}
      />
    </Grid>
  )

  const renderSelectField = (
    name: keyof ProjectBeneficiaryFormData,
    label: string,
    options: unknown[],
    gridSize: number = 6,
    required = false,
    loading = false
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={''}
        render={({ field, fieldState: { error } }) => (
          <FormControl fullWidth error={!!error} required={required}>
            <InputLabel sx={labelSx}>
              {loading ? `Loading...` : label}
            </InputLabel>
            <Select
              {...field}
              label={loading ? `Loading...` : label}
              sx={{
                ...selectStyles,
                ...valueSx,
                '& .MuiOutlinedInput-notchedOutline': {
                  border:
                    theme.palette.mode === 'dark'
                      ? `1px solid ${alpha('#FFFFFF', 0.3)}`
                      : '1px solid #d1d5db',
                  borderRadius: '6px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border:
                    theme.palette.mode === 'dark'
                      ? `1px solid ${alpha('#FFFFFF', 0.5)}`
                      : '1px solid #9ca3af',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: `2px solid ${theme.palette.primary.main}`,
                },
              }}
              IconComponent={KeyboardArrowDownIcon}
              disabled={loading}
            >
              {options.map((option) => (
                <MenuItem
                  key={(option as { configId?: string }).configId}
                  value={(option as { id?: string }).id}
                >
                  {(option as { configValue?: string }).configValue}
                </MenuItem>
              ))}
            </Select>
            <FormError
              error={(error?.message as string) || ''}
              touched={true}
            />
          </FormControl>
        )}
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
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${tokens.dividerColor}`,
            backgroundColor: tokens.paper.backgroundColor as string,
            pr: 3,
            pl: 3,
          }}
        >
          {getLabel(
            'CDL_BPA_BENE_INFO',
            language,
            'Beneficiary Banking Details'
          )}
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

        <form
          noValidate
          onSubmit={(e) => {
            handleSubmit(onSubmit)(e)
          }}
        >
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

            <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
              {renderTextField(
                'reaBeneficiaryId',
                getLabel(
                  'CDL_BPA_BENE_REFID',
                  language,
                  'Beneficiary Reference ID'
                ),
                '',
                6,
                true, // Required
                16 // Max length
              )}
              {renderSelectField(
                'reaBeneficiaryType',
                getLabel('CDL_BPA_BENE_TRANSFER', language, 'Transfer Method'),
                beneficiaryTypes,
                6,
                true, // Required
                dropdownsLoading
              )}
              {renderTextField(
                'reaName',
                getLabel(
                  'CDL_BPA_BENE_NAME',
                  language,
                  'Beneficiary Full Name'
                ),
                '',
                12,
                true, // Required
                35 // Max length
              )}
              {renderTextField(
                'reaBankName',
                getLabel('CDL_BPA_BENE_BANK', language, 'Bank Name'),
                '',
                6,
                true // Required
              )}
              {renderTextField(
                'reaSwiftCode',
                getLabel('CDL_BPA_BENE_BIC', language, 'SWIFT/BIC Code'),
                '',
                6,
                true // Required
              )}
              {renderTextField(
                'reaRoutingCode',
                getLabel('CDL_BPA_BENE_ROUTING', language, 'Routing Number'),
                '',
                6,
                true, // Required
                10 // Max length
              )}
              {renderTextField(
                'reaAccountNumber',
                getLabel('CDL_BPA_BENE_ACC', language, 'Bank Account Number'),
                '',
                6,
                true // Required
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
              backgroundColor: tokens.paper.backgroundColor as string,
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
                    addBeneficiaryMutation.isPending ||
                    updateBeneficiaryMutation.isPending ||
                    dropdownsLoading
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
                  {getLabel('CDL_BPA_CANCEL', language, 'Cancel')}
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  type="submit"
                  disabled={
                    addBeneficiaryMutation.isPending ||
                    updateBeneficiaryMutation.isPending ||
                    dropdownsLoading
                  }
                  onClick={() => {}}
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
                      color: theme.palette.text.disabled,
                    },
                  }}
                >
                  {addBeneficiaryMutation.isPending ||
                  updateBeneficiaryMutation.isPending
                    ? editingBeneficiary?.id
                      ? getLabel('CDL_BPA_UPDATING', language, 'Updating...')
                      : getLabel('CDL_BPA_ADDING', language, 'Adding...')
                    : editingBeneficiary?.id
                      ? getLabel('CDL_BPA_UPDATE', language, 'Update')
                      : getLabel('CDL_BPA_ADD', language, 'Add')}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>

        {/* Toast Notifications */}
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {toasts.map((toast) => (
            <Alert
              key={toast.id}
              severity={toast.type}
              onClose={() => removeToast(toast.id)}
              sx={{
                minWidth: 300,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              {toast.message}
            </Alert>
          ))}
        </Box>

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
