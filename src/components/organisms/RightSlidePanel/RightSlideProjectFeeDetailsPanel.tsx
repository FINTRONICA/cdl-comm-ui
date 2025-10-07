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
import { useSaveProjectIndividualFee } from '@/hooks/useProjects'
import { projectFeeValidationSchema } from '@/lib/validation/feeSchemas'
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
  onFeeAdded?: (fee: any) => void
  title?: string
  projectId?: string
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

export const RightSlideProjectFeeDetailsPanel: React.FC<
  RightSlidePanelProps
> = ({ isOpen, onClose, onFeeAdded, projectId, buildPartnerId }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const addFeeMutation = useSaveProjectIndividualFee()

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
        reafCategoryDTO: {
          id: parseInt(data.feeType) || 0,
        },
        reafFrequencyDTO: {
          id: parseInt(data.frequency) || 0,
        },
        reafAccountTypeDTO: {
          id: parseInt(data.debitAccount) || 0,
        },
        reafDebitAmount: parseFloat(data.debitAmount?.replace(/,/g, '')) || 0,
        reafTotalAmount: parseFloat(data.totalAmount?.replace(/,/g, '')) || 0,
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
          parseFloat(data.feePercentage?.replace(/%/g, '')) || 0,
        reafVatPercentage:
          parseFloat(data.vatPercentage?.replace(/%/g, '')) || 0,
        reafCurrencyDTO: {
          id: parseInt(data.currency) || 0,
        },
        realEstateAssestDTO: {
          id: projectId ? parseInt(projectId) : undefined,
        },
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

      

      await addFeeMutation.mutateAsync(feeData)

      setSuccessMessage('Fee added successfully!')

      if (onFeeAdded) {
        // Convert dropdown IDs to display names
        const feeTypeLabel =
          feeCategories.find((cat) => cat.id === parseInt(data.feeType))
            ?.configValue || `Fee Type ${data.feeType}`
        const frequencyLabel =
          feeFrequencies.find((freq) => freq.id === parseInt(data.frequency))
            ?.configValue || `Frequency ${data.frequency}`

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
    reset()
    setErrorMessage(null)
    setSuccessMessage(null)
    onClose()
  }

  // Common styles for form components
  const commonFieldStyles = {
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
  }

  const errorFieldStyles = {
    '& .MuiOutlinedInput-root': {
      height: '46px',
      borderRadius: '8px',
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
      color: '#475569',
      fontSize: '20px',
    },
  }

  const labelSx = {
    color: '#6A7282',
    fontFamily: 'Outfit',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '12px',
    letterSpacing: 0,
  }

  const valueSx = {
    color: '#1E2939',
    fontFamily: 'Outfit',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '14px',
    letterSpacing: 0,
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
              sx={{
                ...selectStyles,
                ...valueSx,
                ...({
                  backgroundColor: '#F9FAFB',
                  color: '#6B7280',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E5E7EB',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E5E7EB',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E5E7EB',
                  },
                }),
                '& .MuiOutlinedInput-notchedOutline': {
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: '1px solid #9ca3af',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: '2px solid #2563eb',
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
                  style: { height: '46px' },
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
            width: 460,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(15px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
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
          Add Project Fee Details
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

            <Grid container rowSpacing={4} columnSpacing={2} mt={3}>
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
                    letterSpacing: 0,
                  }}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  type="submit"
                  disabled={addFeeMutation.isPending || dropdownsLoading}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontStyle: 'normal',
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: 0,
                    backgroundColor: '#2563EB',
                    color: '#fff',
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
