'use client'

import React, { useState } from 'react'
import {
  Box,
  TextField,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material'
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { AccountData } from '../types'
import { Controller, useFormContext } from 'react-hook-form'
// import { useProjectLabels } from '@/hooks/useProjectLabels'
import { useBuildPartnerAssetLabelsWithUtils } from '@/hooks/useBuildPartnerAssetLabels'
import { useCurrencies } from '@/hooks/useFeeDropdowns'
import {
  useValidateBankAccount,
  useSaveOrUpdateBankAccount,
} from '@/hooks/useBankAccount'
import { BankAccountData } from '@/types/bankAccount'
import dayjs from 'dayjs'
import {
  commonFieldStyles,
  datePickerStyles,
  errorFieldStyles,
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
import { validateAccountField } from '../validation/accountZodSchema'

interface Step2Props {
  accounts: AccountData[]
  onAccountsChange: (accounts: AccountData[]) => void
  projectId?: string
  isViewMode?: boolean
}

const Step2: React.FC<Step2Props> = ({ projectId, isViewMode = false }) => {
  const { getLabel } = useBuildPartnerAssetLabelsWithUtils()
  const language = 'EN'

  const {
    data: currencies = [],
    isLoading: currenciesLoading,
    error: currenciesError,
  } = useCurrencies()

  const validateBankAccount = useValidateBankAccount()
  const saveOrUpdateBankAccount = useSaveOrUpdateBankAccount()

  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<{
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

  // Function to check if all backend fields are filled and auto-validate
  const checkAndAutoValidate = (account: AccountData, index: number) => {
    const hasAccountNumber =
      account.trustAccountNumber && account.trustAccountNumber.trim() !== ''
    const hasIban = account.ibanNumber && account.ibanNumber.trim() !== ''
    const hasDateOpened = account.dateOpened
    const hasAccountTitle =
      account.accountTitle && account.accountTitle.trim() !== ''
    const hasCurrency = account.currency && account.currency.trim() !== ''
    const hasId = account.id && account.id !== 9007199254740991

    // If all fields are filled and has an ID (loaded from backend), mark as validated
    if (
      hasAccountNumber &&
      hasIban &&
      hasDateOpened &&
      hasAccountTitle &&
      hasCurrency &&
      hasId
    ) {
      setSuccessIndexes((prev) => {
        if (!prev.includes(index)) {
          return [...prev, index]
        }
        return prev
      })
      setErrorIndex((prev) => (prev === index ? null : prev))

      // Create validated account data
      const bankAccountData: BankAccountData = {
        id: account.id ?? null,
        accountType: ACCOUNT_TYPES[index] || 'TRUST',
        accountNumber: account.trustAccountNumber,
        ibanNumber: account.ibanNumber,
        dateOpened: dayjs(account.dateOpened).toISOString(),
        accountTitle: account.accountTitle,
        currencyCode: account.currency,
        isValidated: true,
        realEstateAssestDTO: {
          id: projectId ? parseInt(projectId) : 9007199254740991,
        },
      }

      // Add to validated accounts array if not already present
      setValidatedAccounts((prev) => {
        const existingIndex = prev.findIndex((acc, idx) => idx === index && acc)
        if (existingIndex === -1 || !prev[index]) {
          const newAccounts = [...prev]
          newAccounts[index] = bankAccountData
          return newAccounts
        }
        return prev
      })
    }
  }

  const validateAccount = async (account: AccountData, index: number) => {
    if (!account.trustAccountNumber) {
      setErrorIndex(index)
      setSuccessIndexes((prev) => prev.filter((i) => i !== index))
      setSnackbarMessage('Account number is required for validation')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return false
    }

    try {
      setValidatingIndex(index)
      setErrorIndex(null)

      // Clear previous validation data before fetching new data (override previous)
      setSuccessIndexes((prev) => prev.filter((i) => i !== index))
      setValidatedAccounts((prev) => {
        const newAccounts = [...prev]
        newAccounts[index] = null as any
        return newAccounts
      })

      // Step 1: Validate account with core banking
      const validationResponse = await validateBankAccount.mutateAsync(
        account.trustAccountNumber
      )

      const dateOpened = dayjs.unix(
        validationResponse.details.lastStatementDate / 1000
      )

      const accountType = ACCOUNT_TYPES[index] || 'TRUST'

      const bankAccountData: BankAccountData = {
        id: (account as any).id ?? null,
        accountType: accountType,
        accountNumber: account.trustAccountNumber, // Keep user's original account number
        ibanNumber: validationResponse.details.iban,
        dateOpened: dateOpened.toISOString(),
        accountTitle: validationResponse.name,
        currencyCode: validationResponse.currencyCode,
        isValidated: true,
        realEstateAssestDTO: {
          id: projectId ? parseInt(projectId) : 9007199254740991, // Use project ID from Step 1, fallback to default
        },
      }

      // Store validated account data (will be saved when "Save and Next" is clicked)
      setValidatedAccounts((prev) => {
        const newAccounts = [...prev]
        newAccounts[index] = bankAccountData
        return newAccounts
      })

      // Update form fields with validation data
      setValue(`accounts.${index}.ibanNumber`, validationResponse.details.iban)
      setValue(`accounts.${index}.dateOpened`, dateOpened)
      setValue(`accounts.${index}.accountTitle`, validationResponse.name)
      setValue(`accounts.${index}.currency`, validationResponse.currencyCode)

      setSuccessIndexes((prev) => [...prev.filter((i) => i !== index), index])
      setSnackbarMessage('Account validated successfully!')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)

      return true
    } catch (error) {
      setErrorIndex(index)
      // Clear validation state on error
      setSuccessIndexes((prev) => prev.filter((i) => i !== index))
      setValidatedAccounts((prev) => {
        const newAccounts = [...prev]
        newAccounts[index] = null as any
        return newAccounts
      })
      setSnackbarMessage(
        error instanceof Error && error.message.includes('save')
          ? 'Validation successful but failed to save account'
          : ERROR_MESSAGES.VALIDATION_FAILED
      )
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return false
    } finally {
      setValidatingIndex(null)
    }
  }

  // Function to save all validated accounts (called on "Save and Next")
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
      // Save or update each account (POST for new, PUT for existing)
      const savePromises = validatedAccounts.map(async (account, index) => {
        // Skip empty slots
        if (!account || !account.isValidated) {
          return null
        }

        const response = await saveOrUpdateBankAccount.mutateAsync(account)

        // Update the account with returned ID if it's a new account
        if (response?.id && (!account.id || account.id === 9007199254740991)) {
          // Update the validated accounts array with the new ID
          setValidatedAccounts((prev) => {
            const newAccounts = [...prev]
            if (newAccounts[index]) {
              newAccounts[index] = {
                ...newAccounts[index],
                id: response.id,
              }
            }
            return newAccounts
          })

          // Update form state with the new ID
          setValue(`accounts.${index}.id`, response.id)
        }

        return response
      })

      await Promise.all(savePromises)

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

  // Watch for account number changes to reset validation state
  React.useEffect(() => {
    const subscription = watch((_value, { name }) => {
      // Check if an account number field changed
      if (name && name.includes('.trustAccountNumber')) {
        const match = name.match(/accounts\.(\d+)\.trustAccountNumber/)
        if (match && match[1]) {
          const index = parseInt(match[1])
          // Reset validation state for this account when account number changes
          setSuccessIndexes((prev) => prev.filter((i) => i !== index))
          setErrorIndex((prev) => (prev === index ? null : prev))
          // Remove from validated accounts (override previous validation)
          setValidatedAccounts((prev) => {
            const newAccounts = [...prev]
            newAccounts[index] = null as any
            return newAccounts
          })
          // Clear the fetched fields so user knows they need to re-validate
          setValue(`accounts.${index}.ibanNumber`, '')
          setValue(`accounts.${index}.dateOpened`, null)
          setValue(`accounts.${index}.accountTitle`, '')
          setValue(`accounts.${index}.currency`, '')
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue])

  // Auto-validate on initial load when all backend fields are filled (for edit mode)
  // But don't auto-validate when user is actively editing
  React.useEffect(() => {
    const watchedAccounts = watch('accounts')
    if (watchedAccounts && Array.isArray(watchedAccounts)) {
      watchedAccounts.forEach((account, index) => {
        // Only auto-validate if this account is not already in success or error state
        // This prevents auto-validation when user is editing
        if (
          account &&
          !successIndexes.includes(index) &&
          errorIndex !== index
        ) {
          checkAndAutoValidate(account, index)
        }
      })
    }
  }, [watch('accounts'), successIndexes, errorIndex])

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

          {ACCOUNT_LABELS.map((_, index) => {
            const isRequired = index === 0 || index === 1 // Trust and Retention are required

            // Get the field label for account number based on account type
            const getAccountNumberLabel = () => {
              switch (index) {
                case 0:
                  return 'Trust Account Number'
                case 1:
                  return 'Retention Account'
                case 2:
                  return 'Sub Construction Account'
                case 3:
                  return 'Corporate Account Number'
                default:
                  return 'Account Number'
              }
            }

            return (
              <Box key={index} mb={4}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name={`accounts.${index}.trustAccountNumber`}
                      control={control}
                      defaultValue=""
                      rules={{
                        validate: (value: any) =>
                          validateAccountField('trustAccountNumber', value),
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          disabled={isViewMode}
                          required={isRequired}
                          label={getAccountNumberLabel()}
                          error={!!errors.accounts?.[index]?.trustAccountNumber}
                          helperText={
                            (errors.accounts?.[index]?.trustAccountNumber
                              ?.message as string) ||
                            'Manual entry - Numerical only (max 15 digits)'
                          }
                          inputProps={{ maxLength: 15 }}
                          InputLabelProps={{ sx: labelSx }}
                          InputProps={{ sx: valueSx }}
                          sx={
                            errors.accounts?.[index]?.trustAccountNumber
                              ? errorFieldStyles
                              : commonFieldStyles
                          }
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name={`accounts.${index}.ibanNumber`}
                      control={control}
                      defaultValue=""
                      rules={{
                        validate: (value: any) =>
                          validateAccountField('trustAccountIban', value),
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          disabled={true} // Always disabled - fetched from backend
                          required={isRequired}
                          label={getLabel('CDL_BPA_ACC_IBAN', language, 'IBAN')}
                          error={!!errors.accounts?.[index]?.ibanNumber}
                          helperText={
                            (errors.accounts?.[index]?.ibanNumber
                              ?.message as string) ||
                            'Fetched from core banking'
                          }
                          inputProps={{ maxLength: 25 }}
                          InputLabelProps={{ sx: labelSx }}
                          InputProps={{ sx: valueSx }}
                          sx={
                            errors.accounts?.[index]?.ibanNumber
                              ? errorFieldStyles
                              : commonFieldStyles
                          }
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
                      rules={{
                        validate: (value: any) =>
                          validateAccountField('trustAccountOpenedDate', value),
                      }}
                      render={({ field }) => (
                        <DatePicker
                          disabled={true} // Always disabled - fetched from backend
                          label={getLabel(
                            'CDL_BPA_ACC_OPENDATE',
                            language,
                            'Account Opening Date'
                          )}
                          value={field.value}
                          onChange={field.onChange}
                          format="DD/MM/YYYY"
                          slots={{
                            openPickerIcon: StyledCalendarIcon,
                          }}
                          slotProps={{
                            textField: {
                              required: isRequired,
                              fullWidth: true,
                              error: !!errors.accounts?.[index]?.dateOpened,
                              helperText:
                                (errors.accounts?.[index]?.dateOpened
                                  ?.message as string) ||
                                'Fetched from core banking',
                              sx: errors.accounts?.[index]?.dateOpened
                                ? errorFieldStyles
                                : datePickerStyles,
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
                      rules={{
                        validate: (value: any) =>
                          validateAccountField('trustAccountTitle', value),
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          disabled={true} // Always disabled - fetched from backend
                          required={isRequired}
                          label={getLabel(
                            'CDL_BPA_ACC_NAME',
                            language,
                            'Account Name'
                          )}
                          error={!!errors.accounts?.[index]?.accountTitle}
                          helperText={
                            (errors.accounts?.[index]?.accountTitle
                              ?.message as string) ||
                            'Fetched from core banking'
                          }
                          inputProps={{ maxLength: 100 }}
                          InputLabelProps={{ sx: labelSx }}
                          InputProps={{ sx: valueSx }}
                          sx={
                            errors.accounts?.[index]?.accountTitle
                              ? errorFieldStyles
                              : commonFieldStyles
                          }
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
                        rules={{
                          validate: (value: any) =>
                            validateAccountField('accountCurrency', value),
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            disabled={true} // Always disabled - fetched from backend
                            required={isRequired}
                            label={
                              currenciesLoading
                                ? 'Loading...'
                                : getLabel(
                                    'CDL_BPA_ACC_CUR',
                                    language,
                                    'Account Currency'
                                  )
                            }
                            placeholder="Enter currency code"
                            error={!!errors.accounts?.[index]?.currency}
                            helperText={
                              errors.accounts?.[index]?.currency?.message
                            }
                            InputLabelProps={{ sx: labelSx }}
                            InputProps={{ sx: valueSx }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                },
                              },
                            }}
                          />
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
                        onClick={() => {
                          const currentAccount = watch(`accounts.${index}`)
                          // Always call API validation when button is clicked
                          // This ensures fresh data is fetched when user changes account number
                          validateAccount(currentAccount, index)
                        }}
                        disabled={isViewMode || validatingIndex === index}
                      >
                        {(() => {
                          if (validatingIndex === index) {
                            return 'Validating...'
                          } else if (errorIndex === index) {
                            return 'Invalidate'
                          } else if (successIndexes.includes(index)) {
                            return 'Validated'
                          } else {
                            return 'Validate'
                          }
                        })()}
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
            success: <span style={{ fontSize: '1.2rem' }}></span>,
            error: <span style={{ fontSize: '1.2rem' }}></span>,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  )
}

export default Step2
