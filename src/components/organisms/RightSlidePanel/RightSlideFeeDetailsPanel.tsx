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
  FormHelperText,
  Button,
  Drawer,
  Box,
  Alert,
  Snackbar,
} from '@mui/material'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import { Controller, useForm } from 'react-hook-form'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { useSaveBuildPartnerIndividualFee } from '@/hooks/useBuildPartners'
import { feeValidationSchema } from '@/lib/validation'
import { convertDatePickerToZonedDateTime } from '@/utils'
import { useFeeDropdownLabels } from '@/hooks/useFeeDropdowns'
import { getFeeCategoryLabel } from '@/constants/mappings/feeDropdownMapping'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'

interface RightSlidePanelProps {
  isOpen: boolean
  onClose: () => void
  onFeeAdded?: (fee: FeeFormData) => void
  title?: string
  buildPartnerId?: string
}

interface FeeFormData {
  feeType: string
  frequency: string
  debitAmount: string
  debitAccount: string
  feeToBeCollected: unknown
  nextRecoveryDate: unknown
  feePercentage: string
  vatPercentage: string
  currency: string
  totalAmount: string
}

export const RightSlideFeeDetailsPanel: React.FC<RightSlidePanelProps> = ({
  isOpen,
  onClose,
  onFeeAdded,
  buildPartnerId,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const addFeeMutation = useSaveBuildPartnerIndividualFee()

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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeeFormData>({
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

  const onSubmit = async (data: FeeFormData) => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)

      const feeData = {
        bpFeeCategoryDTO: {
          id: parseInt(data.feeType) || 0,
        },
        bpFeeFrequencyDTO: {
          id: parseInt(data.frequency) || 0,
        },
        bpAccountTypeDTO: {
          id: parseInt(data.debitAccount) || 0,
        },
        debitAmount: parseFloat(data.debitAmount?.replace(/,/g, '')) || 0,
        totalAmount: parseFloat(data.totalAmount?.replace(/,/g, '')) || 0,
        feeCollectionDate: data.feeToBeCollected
          ? convertDatePickerToZonedDateTime(
              (data.feeToBeCollected as any).format('YYYY-MM-DD')
            )
          : '',
        feeNextRecoveryDate: data.nextRecoveryDate
          ? convertDatePickerToZonedDateTime(
              (data.nextRecoveryDate as any).format('YYYY-MM-DD')
            )
          : '',
        feePercentage: parseFloat(data.feePercentage?.replace(/%/g, '')) || 0,
        vatPercentage: parseFloat(data.vatPercentage?.replace(/%/g, '')) || 0,
        bpFeeCurrencyDTO: {
          id: parseInt(data.currency) || 0,
        },
        buildPartnerDTO: {
          id: buildPartnerId ? parseInt(buildPartnerId) : undefined,
        },
      }

      const validationResult = feeValidationSchema.safeParse(feeData)
      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(
          (issue) => issue.message
        )

        const feeTypeErrors = validationResult.error.issues.filter(
          (issue) =>
            issue.path.some(
              (path) =>
                typeof path === 'string' &&
                (path.includes('bpFeeCategoryDTO') || path.includes('feeType'))
            ) ||
            issue.message.toLowerCase().includes('fee') ||
            issue.message.toLowerCase().includes('category')
        )

        if (feeTypeErrors.length > 0) {
          console.log('🚨 Fee Type Specific Validation Errors:', {
            feeTypeErrors,
            feeTypeValue: data.feeType,
            feeTypeParsed: parseInt(data.feeType) || 0,
            feeTypeIsValid:
              !isNaN(parseInt(data.feeType)) && parseInt(data.feeType) > 0,
          })
        }

        setErrorMessage(errorMessages.join(', '))
        return
      }

      console.log('📋 Fee data being sent to backend:', feeData)

      await addFeeMutation.mutateAsync({
        data: feeData,
        isEditing: false, // false for adding new fee
        developerId: buildPartnerId,
      })

      setSuccessMessage('Fee added successfully!')

      if (onFeeAdded) {
        // Convert dropdown IDs to display names
        const feeTypeLabel =
          getDisplayLabel(feeCategories, data.feeType) ||
          `Fee Type ${data.feeType}`
        const frequencyLabel =
          getDisplayLabel(feeFrequencies, data.frequency) ||
          `Frequency ${data.frequency}`
        const currencyLabel =
          getDisplayLabel(currencies, data.currency) ||
          `Currency ${data.currency}`
        const accountLabel =
          getDisplayLabel(debitAccounts, data.debitAccount) ||
          `Account ${data.debitAccount}`

        const feeForForm = {
          // Map to table column names (uppercase) with display labels
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
                ).format('MMM DD, YYYY')
              : '',
          NextRecoveryDate:
            data.nextRecoveryDate &&
            (data.nextRecoveryDate as { isValid?: boolean }).isValid
              ? (
                  data.nextRecoveryDate as {
                    format: (format: string) => string
                  }
                ).format('MMM DD, YYYY')
              : '',
          FeePercentage: data.feePercentage,
          VATPercentage: data.vatPercentage,
          Amount: data.totalAmount,
          // Keep original fields for reference
          feeType: data.feeType,
          frequency: data.frequency,
          debitAccount: data.debitAccount,
          currency: data.currency,
          buildPartnerDTO: {
            id: buildPartnerId ? parseInt(buildPartnerId) : undefined,
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
      console.error('Error adding fee:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to add fee. Please try again.'
      setErrorMessage(errorMessage)
    }
  }

  const handleClose = () => {
    reset()
    setErrorMessage(null)
    setSuccessMessage(null)
    onClose()
  }

  // Common styles for form components
  const commonFieldStyles = {
    '& .MuiOutlinedInput-root': {
      height: '48px',
      borderRadius: '12px',
      backgroundColor: '#F8FAFC',
      '& fieldset': {
        borderColor: '#CAD5E2',
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: '#CAD5E2',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2563EB',
        borderWidth: '2px',
      },
    },
    '& .MuiInputBase-input': {
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: 400,
      color: '#1E293B',
    },
  }

  const errorFieldStyles = {
    '& .MuiOutlinedInput-root': {
      height: '48px',
      borderRadius: '12px',
      backgroundColor: '#FEF2F2',
      '& fieldset': {
        borderColor: '#EF4444',
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: '#DC2626',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#EF4444',
        borderWidth: '2px',
      },
    },
    '& .MuiInputBase-input': {
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: 400,
      color: '#1E293B',
    },
  }

  const selectStyles = {
    height: '48px',
    '& .MuiOutlinedInput-root': {
      height: '48px',
      borderRadius: '12px',
      backgroundColor: '#F8FAFC',
      '& fieldset': {
        borderColor: '#CAD5E2',
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: '#CAD5E2',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2563EB',
        borderWidth: '2px',
      },
    },
    '& .MuiSelect-icon': {
      color: '#475569',
      fontSize: '20px',
    },
    '& .MuiInputBase-input': {
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: 400,
      color: '#1E293B',
    },
  }

  const labelSx = {
    color: '#475569',
    fontFamily: 'Outfit, sans-serif',
    fontWeight: 500,
    fontStyle: 'normal',
    fontSize: '14px',
    letterSpacing: '0.01em',
    marginBottom: '4px',
  }

  const valueSx = {
    color: '#1E293B',
    fontFamily: 'Outfit, sans-serif',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '14px',
    letterSpacing: '0.01em',
    wordBreak: 'break-word',
  }

  const renderTextField = (
    name: keyof FeeFormData,
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
        rules={required ? { required: `${label} is required` } : {}}
        render={({ field }) => (
          <TextField
            {...field}
            label={label}
            fullWidth
            error={!!errors[name]}
            helperText={errors[name]?.message?.toString() || ''}
            InputLabelProps={{ sx: labelSx }}
            InputProps={{ sx: valueSx }}
            sx={errors[name] ? errorFieldStyles : commonFieldStyles}
          />
        )}
      />
    </Grid>
  )

  // New render function for API-driven dropdowns
  const renderApiSelectField = (
    name: keyof FeeFormData,
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
        rules={required ? { required: `${label} is required` } : {}}
        defaultValue={''}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors[name]}>
            <InputLabel sx={labelSx}>
              {loading ? `Loading ${label}...` : label}
            </InputLabel>
            <Select
              {...field}
              label={loading ? `Loading ${label}...` : label}
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
            {errors[name] && (
              <FormHelperText error>
                {errors[name]?.message?.toString()}
              </FormHelperText>
            )}
          </FormControl>
        )}
      />
    </Grid>
  )

  const renderDatePickerField = (
    name: keyof FeeFormData,
    label: string,
    gridSize: number = 6,
    required = false
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} is required` } : {}}
        defaultValue={null}
        render={({ field }) => (
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
                error: !!errors[name],
                helperText: errors[name]?.message?.toString() || '',
                sx: errors[name] ? errorFieldStyles : commonFieldStyles,
                InputLabelProps: { sx: labelSx },
                InputProps: {
                  sx: valueSx,
                  style: { height: '48px' },
                },
              },
            }}
          />
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
            width: 480,
            borderRadius: '16px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CAD5E2',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
          }}
        >
          Add Fee Details
          <IconButton onClick={handleClose}>
            <CancelOutlinedIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            {/* Show error if dropdowns fail to load */}
            {dropdownsError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Failed to load dropdown options. Please refresh the page.
              </Alert>
            )}

            <Grid container rowSpacing={3} columnSpacing={2} mt={2}>
              {renderApiSelectField(
                'feeType',
                'Fee Type',
                feeCategories,
                6,
                false,
                categoriesLoading
              )}
              {renderApiSelectField(
                'frequency',
                'Frequency',
                feeFrequencies,
                6,
                false,
                frequenciesLoading
              )}
              {renderApiSelectField(
                'debitAccount',
                'Debit Account',
                debitAccounts,
                6,
                false,
                accountsLoading
              )}
              {renderDatePickerField(
                'feeToBeCollected',
                'Fee to be Collected',
                6,
                false
              )}
              {renderDatePickerField(
                'nextRecoveryDate',
                'Next Recovery Date',
                6,
                false
              )}
              {renderTextField(
                'feePercentage',
                'Fee Percentage',
                '2%',
                6,
                false
              )}
              {renderTextField(
                'debitAmount',
                'Debit Amount',
                '50,000',
                6,
                false
              )}
              {renderTextField(
                'vatPercentage',
                'VAT Percentage',
                '18%',
                6,
                false
              )}
              {renderApiSelectField(
                'currency',
                'Currency',
                currencies,
                6,
                false,
                currenciesLoading
              )}
              {renderTextField(
                'totalAmount',
                'Amount Received',
                '50,000',
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
                    borderColor: '#CAD5E2',
                    color: '#475569',
                    textTransform: 'none',
                    height: '44px',
                    '&:hover': {
                      borderColor: '#CAD5E2',
                      backgroundColor: '#F8FAFC',
                    },
                  }}
                >
                  Cancel
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
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    textTransform: 'none',
                    height: '44px',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: '#1D4ED8',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    },
                    '&:disabled': {
                      backgroundColor: '#94A3B8',
                      color: '#FFFFFF',
                    },
                  }}
                >
                  {addFeeMutation.isPending ? 'Adding...' : 'Add'}
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
