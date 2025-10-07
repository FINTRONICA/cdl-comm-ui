'use client'

import React, { useState } from 'react'
import {
  Box,
  TextField,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Button,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { AccountData } from '../types'
import { Controller, useFormContext } from 'react-hook-form'
import { useProjectLabels } from '@/hooks/useProjectLabels'
import { useCurrencies } from '@/hooks/useFeeDropdowns'
import {
  useValidateBankAccount,
  useSaveMultipleBankAccounts,
} from '@/hooks/useBankAccount'
import { BankAccountData } from '@/types/bankAccount'
import dayjs from 'dayjs'
import {
  commonFieldStyles,
  selectStyles,
  datePickerStyles,
  labelSx,
  valueSx,
  cardStyles,
  calendarIconSx,
} from '../styles'
import {
  ACCOUNT_TYPES,
  ACCOUNT_LABELS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../constants'

interface Step2Props {
  accounts: AccountData[]
  onAccountsChange: (accounts: AccountData[]) => void
  projectId?: string
  isViewMode?: boolean
}

const Step2: React.FC<Step2Props> = React.memo(({ projectId, isViewMode = false }) => {
  
  const { getLabel } = useProjectLabels()

  const {
    data: currencies = [],
    isLoading: currenciesLoading,
    error: currenciesError,
  } = useCurrencies()

  const validateBankAccount = useValidateBankAccount()
  const saveMultipleBankAccounts = useSaveMultipleBankAccounts()

  const getDisplayLabel = (currency: any, fallbackValue?: string): string => {
    return currency?.configValue || fallbackValue || 'Unknown'
  }

  const { control, watch, setValue } = useFormContext<{
    accounts: AccountData[]
  }>()

  const [errorIndex, setErrorIndex] = useState<number | null>(null)
  const [successIndexes, setSuccessIndexes] = useState<number[]>([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'error'
  )
  const [validatedAccounts, setValidatedAccounts] = useState<BankAccountData[]>(
    []
  )
  const [validatingIndex, setValidatingIndex] = useState<number | null>(null)

  const validateAccount = async (account: AccountData, index: number) => {
    if (!account.trustAccountNumber) {
      setErrorIndex(index)
      setSuccessIndexes(prev => prev.filter(i => i !== index))
      setSnackbarMessage('Account number is required for validation')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return false
    }

    try {
      setValidatingIndex(index)
      setErrorIndex(null)
      // Don't reset successIndex to preserve previously validated accounts

      const validationResponse = await validateBankAccount.mutateAsync(
        account.trustAccountNumber
      )

      // Convert Unix timestamp to dayjs date
      const dateOpened = dayjs.unix(
        validationResponse.details.lastStatementDate / 1000
      )

      // Get the correct account type for this index
      const accountType = ACCOUNT_TYPES[index] || 'TRUST'

      // Create the bank account data object
      const bankAccountData: BankAccountData = {
        accountType: accountType,
        accountNumber: validationResponse.accountNumber,
        ibanNumber: validationResponse.details.iban,
        dateOpened: dateOpened.format('YYYY-MM-DD'),
        accountTitle: validationResponse.name,
        currencyCode: validationResponse.currencyCode,
        isValidated: true,
        realEstateAssestDTO: {
          id: projectId ? parseInt(projectId) : 9007199254740991, // Use project ID from Step 1, fallback to default
        },
      }

      // Add to validated accounts array
      setValidatedAccounts((prev) => {
        const newAccounts = [...prev]
        newAccounts[index] = bankAccountData
        return newAccounts
      })

      // Update form fields with validated data using setValue

      // Find the correct currency ID from the dropdown options
      const currencyOption = currencies.find(
        (c) => c.configValue === validationResponse.currencyCode
      )
      const currencyId = currencyOption ? currencyOption.id : 32 // Default to ID 32 if not found

      setValue(`accounts.${index}.ibanNumber`, validationResponse.details.iban)
      setValue(`accounts.${index}.dateOpened`, dateOpened)
      setValue(`accounts.${index}.accountTitle`, validationResponse.name)
      setValue(`accounts.${index}.currency`, currencyId.toString())

      setSuccessIndexes(prev => [...prev.filter(i => i !== index), index])
      setSnackbarMessage(SUCCESS_MESSAGES.STEP_SAVED)
      setSnackbarSeverity('success')
      setSnackbarOpen(true)

      return true
    } catch (error) {
      setErrorIndex(index)
      // Remove the current account from success indexes if it was previously validated
      setSuccessIndexes(prev => prev.filter(i => i !== index))
      setSnackbarMessage(ERROR_MESSAGES.VALIDATION_FAILED)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return false
    } finally {
      setValidatingIndex(null)
    }
  }

  // Function to save all validated accounts
  const saveAllValidatedAccounts = async () => {
    const accountsToSave = validatedAccounts.filter(
      (account) => account && account.isValidated
    )

    if (accountsToSave.length === 0) {
      setSnackbarMessage(ERROR_MESSAGES.NO_VALIDATED_ACCOUNTS)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return false
    }

    try {
      await saveMultipleBankAccounts.mutateAsync(accountsToSave)
      setSnackbarMessage(SUCCESS_MESSAGES.ACCOUNTS_SAVED)
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
      return true
    } catch (error) {
      setSnackbarMessage(ERROR_MESSAGES.ACCOUNT_SAVE_FAILED)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return false
    }
  }

  React.useEffect(() => {
    ;(window as any).saveStep2Accounts = saveAllValidatedAccounts
    ;(window as any).step2ValidatedAccounts = validatedAccounts
  }, [validatedAccounts])

  const StyledCalendarIcon = (
    props: React.ComponentProps<typeof CalendarTodayOutlinedIcon>
  ) => <CalendarTodayOutlinedIcon {...props} sx={calendarIconSx} />

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={cardStyles}>
        <CardContent>
          {/* Show error if currencies fail to load */}
          {currenciesError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load currency options. Please refresh the page.
            </Alert>
          )}

          {/* Show info if using fallback currencies */}
          {!currenciesLoading &&
            !currenciesError &&
            currencies.length === 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Using default currency options. API data not available.
              </Alert>
            )}

          {ACCOUNT_LABELS.map((label, index) => {
            return (
              <Box key={index} mb={4}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name={`accounts.${index}.trustAccountNumber`}
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                          label={label}
                          InputLabelProps={{ sx: labelSx }}
                          InputProps={{ sx: valueSx }}
                          sx={commonFieldStyles}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name={`accounts.${index}.ibanNumber`}
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                          label="IBAN Number*"
                          InputLabelProps={{ sx: labelSx }}
                          InputProps={{ sx: valueSx }}
                          sx={commonFieldStyles}
                        />
                      )}
                    />
                  </Grid>

                  {/* Date Opened */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Controller
                      name={`accounts.${index}.dateOpened`}
                      control={control}
                      defaultValue={null}
                      render={({ field }) => (
                  <DatePicker
                    disabled={isViewMode}
                    label={getLabel(
                            'CDL_BPA_DATE_OPENED',
                            'Date Opened*'
                          )}
                          value={field.value}
                          onChange={field.onChange}
                          format="DD/MM/YYYY"
                          slots={{
                            openPickerIcon: StyledCalendarIcon,
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              sx: datePickerStyles,
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

                  {/* Account Title */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Controller
                      name={`accounts.${index}.accountTitle`}
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                          label="Account Title*"
                          InputLabelProps={{ sx: labelSx }}
                          InputProps={{ sx: valueSx }}
                          sx={commonFieldStyles}
                        />
                      )}
                    />
                  </Grid>

                  {/* Currency + Validate */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box display="flex" alignItems="center">
                      <Controller
                        name={`accounts.${index}.currency`}
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel sx={labelSx}>
                              {currenciesLoading
                                ? 'Loading...'
                                : getLabel('CDL_BPA_CURRENCY', 'Currency*')}
                            </InputLabel>
                    <Select
                      {...field}
                      disabled={isViewMode}
                              label={
                                currenciesLoading
                                  ? 'Loading...'
                                  : getLabel('CDL_BPA_CURRENCY', 'Currency*')
                              }
                              IconComponent={KeyboardArrowDownIcon}
                              sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                },
                              }}
                            >
                              {currencies.length > 0
                                ? currencies.map((currency) => (
                                    <MenuItem
                                      key={currency.id}
                                      value={currency.id.toString()}
                                    >
                                      {getDisplayLabel(
                                        currency,
                                        currency.configValue
                                      )}
                                    </MenuItem>
                                  ))
                                : // Fallback to hardcoded currencies if API fails
                                  [
                                    <MenuItem key="AED" value="AED">
                                      AED
                                    </MenuItem>,
                                    <MenuItem key="USD" value="USD">
                                      USD
                                    </MenuItem>,
                                    <MenuItem key="EUR" value="EUR">
                                      EUR
                                    </MenuItem>,
                                  ]}
                            </Select>
                          </FormControl>
                        )}
                      />
                      <Button
                        variant="contained"
                        startIcon={
                          errorIndex === index ? (
                            <HighlightOffOutlinedIcon
                              sx={{ fontSize: 20, mt: '1px' }}
                            />
                          ) : successIndexes.includes(index) ? (
                            <VerifiedOutlinedIcon
                              sx={{ fontSize: 20, mt: '1px' }}
                            />
                          ) : null
                        }
                        sx={{
                          ml: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '8px',
                          textTransform: 'none',
                          boxShadow: 'none',

                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 500,
                          fontStyle: 'normal',
                          fontSize: '14px',
                          lineHeight: '20px',
                          letterSpacing: '0px',

                          backgroundColor:
                            errorIndex === index
                              ? '#FEE2E2'
                              : successIndexes.includes(index)
                                ? '#D1FAE5'
                                : '#E6F0FF',
                          color:
                            errorIndex === index
                              ? '#EF4444'
                              : successIndexes.includes(index)
                                ? '#059669'
                                : '#2563EB',
                          minWidth: '120px',
                          height: '40px',
                          '& .MuiButton-startIcon': {
                            marginRight: '8px',
                          },
                          '&:hover': {
                            backgroundColor:
                              errorIndex === index
                                ? '#FECACA'
                                : successIndexes.includes(index)
                                  ? '#A7F3D0'
                                  : '#D0E3FF',
                          },
                        }}
                        onClick={() =>
                          validateAccount(watch(`accounts.${index}`), index)
                        }
                        disabled={isViewMode || validatingIndex === index}
                      >
                        {validatingIndex === index
                          ? 'Validating...'
                          : errorIndex === index
                            ? 'Invalidate'
                            : successIndexes.includes(index)
                              ? 'Validated'
                              : 'Validate'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>

                {index < ACCOUNT_LABELS.length - 1 && (
                  <Divider sx={{ my: 3, mt: 4, mb: 4 }} />
                )}
              </Box>
            )
          })}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%', fontFamily: 'Outfit, sans-serif' }}
          iconMapping={{
            success: <span style={{ fontSize: '1.2rem' }}>✅</span>,
            error: <span style={{ fontSize: '1.2rem' }}>❌</span>,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  )
})

export default Step2
