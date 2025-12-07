import React, { useState } from 'react'
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
  OutlinedInput,
} from '@mui/material'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import { Controller, useForm } from 'react-hook-form'
import { FormError } from '../../atoms/FormError'
import { zodResolver } from '@hookform/resolvers/zod'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import {
  useSaveProjectIndividualFee,
  useUpdateProjectIndividualFee,
} from '@/hooks/useProjects'
import {
  projectFeeValidationSchema,
  feeDetailsFormValidationSchema,
  type FeeDetailsFormData,
} from '@/lib/validation/feeSchemas'
import { convertDatePickerToZonedDateTime } from '@/utils'
import { useFeeDropdownLabels } from '@/hooks/useFeeDropdowns'
import { getFeeCategoryLabel } from '@/constants/mappings/feeDropdownMapping'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import { useProjectLabels } from '@/hooks/useProjectLabels'
import dayjs from 'dayjs'
import { alpha, useTheme } from '@mui/material/styles'
import { buildPanelSurfaceTokens } from './panelTheme'

interface RightSlidePanelProps {
  isOpen: boolean
  onClose: () => void
  onFeeAdded?: (fee: any) => void
  title?: string
  editingFee?: any
  projectId?: string
  buildPartnerId?: string
}

// Use the FeeDetailsFormData type from validation schema

export const RightSlideProjectFeeDetailsPanel: React.FC<
  RightSlidePanelProps
> = ({ isOpen, onClose, onFeeAdded, editingFee, projectId }) => {
  const theme = useTheme()
  const tokens = React.useMemo(() => buildPanelSurfaceTokens(theme), [theme])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  // Add dynamic labels hook
  const { getLabel } = useProjectLabels()

  const addFeeMutation = useSaveProjectIndividualFee()
  const updateFeeMutation = useUpdateProjectIndividualFee()

  const {
    feeCategories,
    feeFrequencies,
    currencies,
    debitAccounts,
    isLoading: dropdownsLoading,
    categoriesLoading,
    frequenciesLoading,
    currenciesLoading,
    accountsLoading,
    error: dropdownsError,
    getDisplayLabel,
  } = useFeeDropdownLabels()

  const { control, handleSubmit, reset } = useForm<FeeDetailsFormData>({
    resolver: zodResolver(feeDetailsFormValidationSchema),
    mode: 'onChange', // Validate on every change for real-time feedback
    defaultValues: {
      feeType: '',
      frequency: '',
      debitAmount: '',
      debitAccount: '',
      feeToBeCollected: null,
      nextRecoveryDate: null,
      feePercentage: '',
      vatPercentage: '',
      currency: '',
      totalAmount: '',
    },
  })

  // Reset form when editing fee changes - only when dropdowns are loaded
  React.useEffect(() => {
    // Don't reset if dropdowns are still loading
    if (dropdownsLoading) return

    setIsResetting(true)

    if (editingFee) {
      // Map display values back to IDs for editing
      const feeCategory = feeCategories.find(
        (category: unknown) =>
          (category as { configValue: string }).configValue ===
          editingFee.FeeType
      )
      const feeFrequency = feeFrequencies.find(
        (frequency: unknown) =>
          (frequency as { configValue: string }).configValue ===
          editingFee.Frequency
      )
      const debitAccount = debitAccounts.find(
        (account: unknown) =>
          (account as { configValue: string }).configValue ===
          editingFee.DebitAccount
      )
      const currency = currencies.find(
        (curr: unknown) =>
          (curr as { configValue: string }).configValue === editingFee.Currency
      )

      const resetData = {
        feeType:
          (feeCategory as { id?: number })?.id?.toString() ||
          editingFee.FeeType ||
          '',
        frequency:
          (feeFrequency as { id?: number })?.id?.toString() ||
          editingFee.Frequency ||
          '',
        debitAmount: editingFee.DebitAmount
          ? editingFee.DebitAmount.toString()
          : '',
        debitAccount:
          (debitAccount as { id?: number })?.id?.toString() ||
          editingFee.DebitAccount ||
          '',
        feeToBeCollected: editingFee.Feetobecollected
          ? dayjs(editingFee.Feetobecollected, 'DD/MM/YYYY')
          : null,
        nextRecoveryDate: editingFee.NextRecoveryDate
          ? dayjs(editingFee.NextRecoveryDate, 'DD/MM/YYYY')
          : null,
        feePercentage: editingFee.FeePercentage
          ? editingFee.FeePercentage.toString()
          : '',
        vatPercentage: editingFee.VATPercentage
          ? editingFee.VATPercentage.toString()
          : '',
        currency:
          (currency as { id?: number })?.id?.toString() ||
          editingFee.Currency ||
          '',
        totalAmount: editingFee.Amount ? editingFee.Amount.toString() : '',
      }

      reset(resetData)
    } else {
      reset({
        feeType: '',
        frequency: '',
        debitAmount: '',
        debitAccount: '',
        feeToBeCollected: null,
        nextRecoveryDate: null,
        feePercentage: '',
        vatPercentage: '',
        currency: '',
        totalAmount: '',
      })
    }

    // Reset the flag after a short delay to allow form to settle
    setTimeout(() => setIsResetting(false), 100)
  }, [
    editingFee,
    reset,
    feeCategories,
    feeFrequencies,
    debitAccounts,
    currencies,
    dropdownsLoading,
  ])

  const onSubmit = async (data: FeeDetailsFormData) => {
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

      // Basic validation check - let zod handle the detailed validation
      if (
        !data.feeType ||
        !data.frequency ||
        !data.debitAccount ||
        !data.feeToBeCollected ||
        !data.debitAmount ||
        !data.totalAmount
      ) {
        setErrorMessage('Please fill in all required fields')
        return
      }
      const feeData = {
        // Include ID for updates
        ...(editingFee?.id && { id: parseInt(editingFee.id.toString()) }),
        reafCategoryDTO: {
          id: parseInt(data.feeType) || 0,
        },
        reafFrequencyDTO: {
          id: parseInt(data.frequency) || 0,
        },
        reafAccountTypeDTO: {
          id: parseInt(data.debitAccount) || 0,
        },
        reafDebitAmount:
          parseFloat(data.debitAmount?.replace(/,/g, '') || '0') || 0,
        reafTotalAmount:
          parseFloat(data.totalAmount?.replace(/,/g, '') || '0') || 0,
        reafCollectionDate: data.feeToBeCollected
          ? convertDatePickerToZonedDateTime(
              (data.feeToBeCollected as any).format('YYYY-MM-DD')
            )
          : '',
        reafNextRecoveryDate: data.nextRecoveryDate
          ? convertDatePickerToZonedDateTime(
              (data.nextRecoveryDate as any).format('YYYY-MM-DD')
            )
          : '',
        reafFeePercentage:
          parseFloat(data.feePercentage?.replace(/%/g, '') || '0') || 0,
        reafVatPercentage:
          parseFloat(data.vatPercentage?.replace(/%/g, '') || '0') || 0,
        reafCurrencyDTO: {
          id: parseInt(data.currency || '0') || 0,
        },
        realEstateAssestDTO: {
          id: projectId ? parseInt(projectId) : undefined,
        },
        // Add deleted and enabled fields when editing
        ...(editingFee?.id && {
          deleted: false,
          enabled: true,
        }),
      }

      const validationResult = projectFeeValidationSchema.safeParse(feeData)
      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(
          (issue) => issue.message
        )

        const feeTypeErrors = validationResult.error.issues.filter(
          (issue) =>
            issue.path.some(
              (path) =>
                typeof path === 'string' &&
                (path.includes('reafCategoryDTO') || path.includes('feeType'))
            ) ||
            issue.message.toLowerCase().includes('fee') ||
            issue.message.toLowerCase().includes('category')
        )

        if (feeTypeErrors.length > 0) {
        }

        setErrorMessage(errorMessages.join(', '))
        return
      }

      if (editingFee?.id) {
        // Update existing fee using PUT
        await updateFeeMutation.mutateAsync({
          id: editingFee.id.toString(),
          feeData,
        })
        setSuccessMessage('Fee updated successfully!')
      } else {
        // Add new fee using POST
        await addFeeMutation.mutateAsync(feeData)
        setSuccessMessage('Fee added successfully!')
      }

      if (onFeeAdded) {
        // Convert dropdown IDs to display names
        const feeTypeLabel =
          feeCategories.find((cat) => cat.id === parseInt(data.feeType))
            ?.configValue || `Fee Type ${data.feeType}`
        const frequencyLabel =
          feeFrequencies.find((freq) => freq.id === parseInt(data.frequency))
            ?.configValue || `Frequency ${data.frequency}`

        // Get display labels for currency and debit account
        const currencyLabel =
          currencies.find((curr) => curr.id === parseInt(data.currency))
            ?.configValue || `Currency ${data.currency}`
        const debitAccountLabel =
          debitAccounts.find((acc) => acc.id === parseInt(data.debitAccount))
            ?.configValue || `Account ${data.debitAccount}`

        const feeForForm = {
          // Map to table column names with display labels
          FeeType: feeTypeLabel,
          Frequency: frequencyLabel,
          DebitAmount: data.debitAmount,
          Feetobecollected:
            data.feeToBeCollected &&
            (data.feeToBeCollected as { isValid?: boolean }).isValid
              ? (
                  data.feeToBeCollected as {
                    format: (format: string) => string
                  }
                ).format('DD/MM/YYYY')
              : '',
          NextRecoveryDate:
            data.nextRecoveryDate &&
            (data.nextRecoveryDate as { isValid?: boolean }).isValid
              ? (
                  data.nextRecoveryDate as {
                    format: (format: string) => string
                  }
                ).format('DD/MM/YYYY')
              : '',
          FeePercentage: data.feePercentage,
          VATPercentage: data.vatPercentage,
          Amount: data.totalAmount,
          Currency: currencyLabel,
          DebitAccount: debitAccountLabel,
          // Keep original fields for reference
          feeType: data.feeType,
          frequency: data.frequency,
          debitAccount: data.debitAccount,
          currency: data.currency,
          debitAmount: data.debitAmount,
          feeToBeCollected: data.feeToBeCollected,
          nextRecoveryDate: data.nextRecoveryDate,
          feePercentage: data.feePercentage,
          vatPercentage: data.vatPercentage,
          totalAmount: data.totalAmount,
          realEstateAssetDTO: {
            id: projectId ? parseInt(projectId) : undefined,
          },
        }

        onFeeAdded(feeForForm)
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
          : 'Failed to add fee. Please try again.'
      setErrorMessage(errorMessage)
    }
  }

  const handleClose = () => {
    setIsResetting(true)
    reset()
    setErrorMessage(null)
    setSuccessMessage(null)
    setTimeout(() => setIsResetting(false), 100)
    onClose()
  }

  // Common styles for form components
  const commonFieldStyles = React.useMemo(() => tokens.input, [tokens])
  const errorFieldStyles = React.useMemo(() => tokens.inputError, [tokens])
  const labelSx = tokens.label
  const valueSx = tokens.value

  const selectStyles = React.useMemo(
    () => ({
      height: '46px',
      '& .MuiOutlinedInput-root': {
        height: '46px',
        borderRadius: '8px',
        backgroundColor: alpha('#1E293B', 0.5), // Darker background for inputs
        '& fieldset': {
          borderColor: alpha('#FFFFFF', 0.3), // White border with opacity
        borderWidth: '1px',
        },
        '&:hover fieldset': {
          borderColor: alpha('#FFFFFF', 0.5), // Brighter on hover
        },
        '&.Mui-focused fieldset': {
          borderColor: theme.palette.primary.main,
        },
      },
      '& .MuiSelect-icon': {
        color: '#FFFFFF', // White icon
        fontSize: '20px',
      },
      '& .MuiInputBase-input': {
        color: '#FFFFFF', // White text in inputs
      },
    }),
    [theme]
  )

  const renderTextField = (
    name: keyof FeeDetailsFormData,
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
              error={!!error && !isResetting}
              inputProps={{ maxLength }}
              InputLabelProps={{ sx: labelSx }}
              InputProps={{ sx: valueSx }}
              sx={error && !isResetting ? errorFieldStyles : commonFieldStyles}
            />
            {!isResetting && (
              <FormError
                error={(error?.message as string) || ''}
                touched={true}
              />
            )}
          </>
        )}
      />
    </Grid>
  )

  const renderApiSelectField = (
    name: keyof FeeDetailsFormData,
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
          <FormControl
            fullWidth
            error={!!error && !isResetting}
            required={required}
          >
            <InputLabel sx={labelSx}>
              {loading ? `Loading...` : label}
            </InputLabel>
            <Select
              {...field}
              input={<OutlinedInput label={loading ? `Loading...` : label} />}
              label={loading ? `Loading...` : label}
              sx={{ ...selectStyles, ...valueSx }}
              IconComponent={KeyboardArrowDownIcon}
              disabled={loading}
            >
              {options.map((option) => (
                <MenuItem
                  key={(option as { configId?: string }).configId}
                  value={(option as { id?: string }).id}
                >
                  {getDisplayLabel(
                    option as any,
                    getFeeCategoryLabel(
                      (option as { configId?: string }).configId
                    )
                  )}
                </MenuItem>
              ))}
            </Select>
            {!isResetting && (
              <FormError
                error={(error?.message as string) || ''}
                touched={true}
              />
            )}
          </FormControl>
        )}
      />
    </Grid>
  )

  const renderDatePickerField = (
    name: keyof FeeDetailsFormData,
    label: string,
    gridSize: number = 6,
    required = false
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={null}
        render={({ field, fieldState: { error } }) => (
          <>
            <DatePicker
              label={label}
              value={(field.value as any) || null}
              onChange={field.onChange}
              format="DD/MM/YYYY"
              slots={{
                openPickerIcon: CalendarTodayOutlinedIcon,
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required,
                  error: !!error && !isResetting,
                  sx:
                    error && !isResetting
                      ? errorFieldStyles
                      : commonFieldStyles,
                  InputLabelProps: { sx: labelSx },
                  InputProps: {
                    sx: valueSx,
                    style: { height: '46px' },
                  },
                },
              }}
            />
            {!isResetting && (
              <FormError
                error={(error?.message as string) || ''}
                touched={true}
              />
            )}
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
            backgroundColor: tokens.paper.backgroundColor,
            color: theme.palette.text.primary,
            pr: 3,
            pl: 3,
          }}
        >
          {getLabel('CDL_BPA_FEES', 'Escrow Fee & Collection Details')}
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

            {/* Show form validation errors */}
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

            <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
              {/* Fee Category * - Mandatory Dropdown */}
              {renderApiSelectField(
                'feeType',
                getLabel('CDL_BPA_FEES_TYPE', 'Type of Fee'),
                feeCategories,
                6,
                true, // Required
                categoriesLoading
              )}
              {renderApiSelectField(
                'frequency',
                getLabel('CDL_BPA_FEES_FREQUENCY', 'Collection Frequency'),
                feeFrequencies,
                6,
                true, // Required
                frequenciesLoading
              )}
              {renderApiSelectField(
                'currency',
                getLabel('CDL_BPA_FEES_CURRENCY', 'Transaction Currency'),
                currencies,
                6,
                false, // Not required
                currenciesLoading
              )}
              {renderApiSelectField(
                'debitAccount',
                getLabel('CDL_BPA_FEES_ACCOUNT', 'Designated Debit Account'),
                debitAccounts,
                6,
                true, // Required
                accountsLoading
              )}
              {renderDatePickerField(
                'feeToBeCollected',
                getLabel('CDL_BPA_FEE_COLLECTION_DATE', 'Fee Collection Date'),
                6,
                true // Required
              )}
              {renderDatePickerField(
                'nextRecoveryDate',
                getLabel('CDL_BPA_FEES_DATE', 'Next Collection Date'),
                6,
                false // Not required
              )}
              {renderTextField(
                'feePercentage',
                getLabel('CDL_BPA_FEES_RATE', 'Fee Rate (%)'),
                '2%',
                6,
                false // Not required
              )}
              {renderTextField(
                'debitAmount',
                getLabel('CDL_BPA_FEES_AMOUNT', 'Fee Amount'),
                '50,000',
                6,
                true, // Required
                10 // Max length
              )}

              {/* VAT Percentage - Optional */}
              {renderTextField(
                'vatPercentage',
                getLabel('CDL_BPA_FEES_VAT', 'Applicable VAT (%)'),
                '18%',
                6,
                false // Not required
              )}

              {/* Total Amount - Required */}
              {renderTextField(
                'totalAmount',
                getLabel('CDL_BPA_FEES_TOTAL_AMOUNT', 'Collected Amount'),
                '50,000',
                12,
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
                  disabled={addFeeMutation.isPending || dropdownsLoading}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontStyle: 'normal',
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: '0.01em',
                    borderRadius: '8px',
                    borderWidth: '1px',
                    borderColor: theme.palette.mode === 'dark' 
                      ? theme.palette.primary.main 
                      : tokens.dividerColor,
                    color: theme.palette.text.secondary,
                    textTransform: 'none',
                    height: '44px',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.action.hover, 0.1)
                          : alpha(theme.palette.action.hover, 0.05),
                    },
                  }}
                >
                  {getLabel('CDL_BPA_CANCEL', 'Cancel')}
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={addFeeMutation.isPending || dropdownsLoading}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontStyle: 'normal',
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: '0.01em',
                    borderRadius: '8px',
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    textTransform: 'none',
                    height: '44px',
                    boxShadow: 'none',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: theme.palette.mode === 'dark' 
                      ? theme.palette.primary.main 
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                      borderColor: theme.palette.mode === 'dark' 
                        ? theme.palette.primary.main 
                        : 'transparent',
                      boxShadow:
                        theme.palette.mode === 'dark'
                          ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    },
                    '&:disabled': {
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.grey[600], 0.5)
                          : theme.palette.grey[300],
                      borderColor: theme.palette.mode === 'dark' 
                        ? alpha(theme.palette.primary.main, 0.5) 
                        : 'transparent',
                      color: theme.palette.text.disabled,
                    },
                  }}
                >
                  {addFeeMutation.isPending
                    ? getLabel('CDL_BPA_ADDING', 'Adding...')
                    : getLabel('CDL_BPA_ADD', 'Add')}
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
