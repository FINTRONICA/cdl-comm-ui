import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
  useTheme,
  SxProps,
  Theme,
  alpha,
} from '@mui/material'
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { Controller, useFormContext } from 'react-hook-form'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { getAgreementLabel } from '@/constants/mappings/master/Entity/agreementMapping'
import { useAgreementLabelsWithCache, useAgreement, useCustomerDetailsByCif } from '@/hooks'
import { useApplicationSettings } from '@/hooks/useApplicationSettings'
import { useAppStore } from '@/store'
import { validateAgreementField } from '@/lib/validation/masterValidation/agreementSchemas'
import {
  commonFieldStyles as sharedCommonFieldStyles,
  selectStyles as sharedSelectStyles,
  labelSx as sharedLabelSx,
  valueSx as sharedValueSx,
  cardStyles as sharedCardStyles,
  viewModeInputStyles,
  neutralBorder,
  neutralBorderHover,
} from '../styles'

interface Step1Props {
  isReadOnly?: boolean
  agreementId?: string | undefined
}

const Step1 = ({ isReadOnly = false, agreementId }: Step1Props) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const textPrimary = isDark ? '#FFFFFF' : '#1E2939'
  const textSecondary = isDark ? '#CBD5E1' : '#6B7280'
  const fieldStyles = React.useMemo(() => {
    if (typeof sharedCommonFieldStyles === 'function') {
      return sharedCommonFieldStyles(theme)
    }
    return sharedCommonFieldStyles
  }, [theme])
  
  const selectFieldStyles = React.useMemo(() => {
    if (typeof sharedSelectStyles === 'function') {
      return sharedSelectStyles(theme)
    }
    return sharedSelectStyles
  }, [theme])
  
  const labelStyles = React.useMemo(() => {
    if (typeof sharedLabelSx === 'function') {
      return sharedLabelSx(theme)
    }
    return sharedLabelSx
  }, [theme])
  
  const valueStyles = React.useMemo(() => {
    if (typeof sharedValueSx === 'function') {
      return sharedValueSx(theme)
    }
    return sharedValueSx
  }, [theme])
  
  const cardBaseStyles = React.useMemo(() => {
    if (typeof sharedCardStyles === 'function') {
      return sharedCardStyles(theme)
    }
    return sharedCardStyles
  }, [theme])
  const viewModeStyles = viewModeInputStyles(theme)
  const neutralBorderColor = neutralBorder(theme)
  const neutralBorderHoverColor = neutralBorderHover(theme)
  const focusBorder = theme.palette.primary.main
  // Check if we're in edit mode (existing agreement)
  const isEditMode = !!agreementId
  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext()

  // State for agreement ID generation
  const [generatedId, setGeneratedId] = useState<string>('')
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false)
  const [isFetchingDetails, setIsFetchingDetails] = useState<boolean>(false)

  // Dynamic label support
  const { data: agreementLabels, getLabel } = useAgreementLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  const getAgreementLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getAgreementLabel(configId)

      if (agreementLabels) {
        return getLabel(configId, currentLanguage, fallback)
      }
      return fallback
    },
    [agreementLabels, currentLanguage, getLabel]
  )

  // Initialize agreement ID from form value
  useEffect(() => {
    const subscription = watch((value) => {
      if (value.id) {
        setGeneratedId(String(value.id))
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // Use React Query hooks instead of direct API calls
  // CRITICAL FIX: Only fetch agreement if we have an ID (edit mode)
  // This prevents unnecessary API calls when creating new agreements
  const { data: agreement } = useAgreement(agreementId || '')
  
  // CRITICAL FIX: Debounce CIF watching to prevent API calls on every keystroke
  const currentCif = watch('primaryEscrowCifNumber')
  
  // CRITICAL FIX: Get CIF from agreement data (edit mode) or form (create mode)
  // In edit mode, prioritize agreement data; in create mode, use form value
  const cifValue = React.useMemo(() => {
    // In edit mode, use agreement CIF if available, otherwise fall back to form value
    if (isEditMode && agreement?.primaryEscrowCifNumber) {
      return agreement.primaryEscrowCifNumber
    }
    return currentCif || ''
  }, [isEditMode, agreement?.primaryEscrowCifNumber, currentCif])
  
  // CRITICAL FIX: Initialize debouncedCif from form value (which should be populated after form reset)
  // Then update it when agreement loads in edit mode
  const [debouncedCif, setDebouncedCif] = useState<string>(currentCif || '')
  
  // CRITICAL FIX: Update debouncedCif based on mode
  // In edit mode, update immediately when agreement loads; in create mode, debounce
  useEffect(() => {
    if (isEditMode) {
      // In edit mode, use CIF immediately when agreement loads (no debounce)
      // This ensures customer details are fetched as soon as agreement data is available
      if (cifValue && cifValue.trim() !== '' && cifValue !== debouncedCif) {
        setDebouncedCif(cifValue)
      }
    } else {
      // In create mode, debounce user input to prevent API calls on every keystroke
      const timer = setTimeout(() => {
        if (cifValue !== debouncedCif) {
          setDebouncedCif(cifValue || '')
        }
      }, 500)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isEditMode, cifValue, debouncedCif])
  
  // Only fetch customer details when CIF is debounced and valid
  // CRITICAL FIX: Skip minimum length check in edit mode to allow fetching for short CIFs like "1"
  const { data: customerDetails, refetch: refetchCustomerDetails, error: customerDetailsError, isLoading: isLoadingCustomerDetails } = useCustomerDetailsByCif(
    debouncedCif,
    { skipMinimumLength: isEditMode } // Allow fetching even for short CIFs in edit mode
  )

  // CRITICAL FIX: Auto-fetch customer details immediately when agreement loads in edit mode
  // This ensures clientName is populated even if not in agreement response
  useEffect(() => {
    // Only auto-fetch in edit mode when we have agreement and CIF
    if (!isEditMode || !agreement || !debouncedCif || debouncedCif.trim() === '') {
      return
    }

    // Auto-fetch if we don't have customer details yet
    // Check if query is enabled and not already loading/fetched
    const shouldFetch = !customerDetails && !isLoadingCustomerDetails && !customerDetailsError
    
    if (shouldFetch) {
      // Trigger fetch for customer details - errors are handled silently
      refetchCustomerDetails().catch(() => {
        // Silently handle errors - customer might not exist (404) or server error (500)
        // This is expected behavior, don't show error to user
      })
    }
  }, [isEditMode, agreement, debouncedCif, customerDetails, customerDetailsError, isLoadingCustomerDetails, refetchCustomerDetails])

  // CRITICAL FIX: Populate clientName and productManagerName when agreement or customer details load
  // This ensures fields are populated even if they're not in the initial form reset
  // This effect runs whenever agreement or customerDetails changes to populate missing fields
  // It also runs after form reset to re-populate fields
  useEffect(() => {
    if (!isEditMode || !agreement) {
      return
    }

    // Use a small delay to ensure form reset has completed (if it happens)
    // This ensures we populate after any form reset operations
    const timeoutId = setTimeout(() => {
      const currentClientName = watch('clientName')
      const currentProductManagerName = watch('productManagerName')
      
      // Priority 1: Use clientName from agreement if available
      if (agreement?.clientName && (!currentClientName || currentClientName.trim() === '')) {
        setValue('clientName', agreement.clientName, {
          shouldValidate: true,
          shouldDirty: false,
        })
        // Trigger validation to clear any error messages
        setTimeout(() => {
          trigger('clientName').catch(() => {
            // Ignore validation errors
          })
        }, 50)
      }
      // Priority 2: Use clientName from customer details if agreement doesn't have it
      else if (!agreement?.clientName && customerDetails?.name?.shortName && (!currentClientName || currentClientName.trim() === '')) {
        // CRITICAL FIX: If clientName is not in agreement but we have customer details, use shortName
        setValue('clientName', customerDetails.name.shortName, {
          shouldValidate: true,
          shouldDirty: false,
        })
        setTimeout(() => {
          trigger('clientName').catch(() => {
            // Ignore validation errors
          })
        }, 50)
      }
      
      // Populate productManagerName if it exists in API response and form field is empty
      if (agreement?.productManagerName && (!currentProductManagerName || currentProductManagerName.trim() === '')) {
        setValue('productManagerName', agreement.productManagerName, {
          shouldValidate: true,
          shouldDirty: false,
        })
      } else if (!agreement?.productManagerName && customerDetails?.name?.firstName && (!currentProductManagerName || currentProductManagerName.trim() === '')) {
        // If productManagerName is not in agreement but we have customer details, use firstName
        setValue('productManagerName', customerDetails.name.firstName, {
          shouldValidate: true,
          shouldDirty: false,
        })
      }
    }, 300) // Small delay to ensure form reset has completed

    return () => clearTimeout(timeoutId)
  }, [isEditMode, agreement, agreement?.clientName, agreement?.productManagerName, customerDetails, customerDetails?.name?.shortName, customerDetails?.name?.firstName, setValue, trigger, watch])

  // Handle Fetch Details button click
  const handleFetchDetails = async () => {
    const currentCif = watch('primaryEscrowCifNumber')
    if (!currentCif || !currentCif.trim()) {
      return
    }

    try {
      setIsFetchingDetails(true)
      // Refetch customer details using React Query
      const { data: fetchedCustomerDetails, error: fetchError } = await refetchCustomerDetails()
      
      // CRITICAL FIX: Handle errors gracefully - don't show 404/500 errors to user
      // These are expected (customer might not exist or server issue)
      if (fetchError) {
        // Check if it's a 404 (customer not found) or 500 (server error)
        const isExpectedError = fetchError && typeof fetchError === 'object' && 'response' in fetchError
          ? (fetchError as { response?: { status?: number } }).response?.status === 404
          : false
        
        // Only clear fields if it's not a 404 (customer not found is expected)
        if (!isExpectedError) {
          setValue('productManagerName', '', {
            shouldValidate: false,
            shouldDirty: false,
          })
          setValue('clientName', '', {
            shouldValidate: false,
            shouldDirty: false,
          })
        }
        setIsFetchingDetails(false)
        return
      }
      
      if (!fetchedCustomerDetails) {
        setIsFetchingDetails(false)
        return
      }

      // Map API response to form fields:
      // name.firstName -> productManagerName
      // name.shortName -> clientName
      // Handle missing fields gracefully
      const productManagerName = fetchedCustomerDetails?.name?.firstName || ''
      const clientName = fetchedCustomerDetails?.name?.shortName || ''

      // Populate only the name fields from customer details
      setValue('productManagerName', productManagerName, {
            shouldValidate: true,
        shouldDirty: true,
      })
      setValue('clientName', clientName, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } catch (error) {
      // CRITICAL FIX: Silently handle errors - don't show to user
      // Customer details fetch failures are expected (customer might not exist)
      // Clear fields on unexpected errors only
      const isExpectedError = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { status?: number } }).response?.status === 404
        : false
      
      if (!isExpectedError) {
      setValue('productManagerName', '', {
        shouldValidate: false,
            shouldDirty: false,
          })
      setValue('clientName', '', {
        shouldValidate: false,
        shouldDirty: false,
      })
      }
    } finally {
      setIsFetchingDetails(false)
    }
  }

  // Function to generate new agreement ID
  const handleGenerateNewId = async () => {
    try {
      setIsGeneratingId(true)
      // Generate a simple ID - can be replaced with actual service call
      const newId = `AGR-${Date.now()}`
      setGeneratedId(newId)
      setValue('id', newId, {
        shouldValidate: true,
        shouldDirty: true,
      })
      } catch {
      // Handle error silently
    } finally {
      setIsGeneratingId(false)
    }
  }

  // Dropdown data (Fees + Deal Priority)
  const {
    data: feesOptions = [],
    loading: feesLoading,
    error: feesError,
  } = useApplicationSettings('FEE')
  const {
    data: dealPriorityOptions = [],
    loading: dealPriorityLoading,
    error: dealPriorityError,
  } = useApplicationSettings('DEAL_PRIORITY')
  const dropdownsLoading = feesLoading || dealPriorityLoading

  // Display label resolution for dropdowns
  const getDisplayLabel = (option: unknown, fallback: string) => {
    if (option && typeof option === 'object' && 'displayName' in option) {
      return String((option as { displayName: string }).displayName)
    }
    if (option && typeof option === 'object' && 'settingValue' in option) {
      return String((option as { settingValue: string }).settingValue)
    }
    return fallback
  }

  const dropdownsError: Error | null =
    feesError || dealPriorityError
      ? new Error('Failed to load dropdown options')
      : null

  const renderTextField = (
    name: string,
    label: string,
    defaultValue = '',
    gridSize: number = 6,
    disabled = false,
    required = false
  ) => (
    <Grid key={`field-${name}`} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue === undefined ? '' : defaultValue}
        rules={{
          required: required ? `${label} is required` : false,
          validate: (value: unknown) => validateAgreementField(0, name, value),
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label={label}
            fullWidth
            required={required}
            disabled={disabled || isReadOnly}
            error={!!errors[name]}
            helperText={errors[name]?.message?.toString()}
            InputLabelProps={{
              sx: {
                ...labelStyles,
                ...(!!errors[name] && {
                  color: theme.palette.error.main,
                  '&.Mui-focused': { color: theme.palette.error.main },
                  '&.MuiFormLabel-filled': { color: theme.palette.error.main },
                }),
              },
            }}
            InputProps={{
              sx: {
                ...valueStyles,
                ...(isReadOnly && {
                  color: textSecondary,
                }),
              },
            }}
            sx={{
              ...(typeof fieldStyles === 'object' ? fieldStyles : {}),
              ...(disabled && {
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
              ...(!!errors[name] &&
                !isReadOnly && {
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme.palette.error.main,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.error.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.error.main,
                    },
                  },
                }),
            }}
          />
        )}
      />
    </Grid>
  )

  // New render function for API-driven dropdowns (for future use)
  const renderApiSelectField = (
    name: string,
    label: string,
    options: unknown[],
    gridSize: number = 6,
    loading = false,
    required = false
  ) => {
    return (
      <Grid key={`field-${name}`} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          rules={{
            required: required ? `${label} is required` : false,
            validate: (value: unknown) => {
              // First check if required and empty
              if (
                required &&
                (!value ||
                  value === '' ||
                  value === null ||
                  value === undefined)
              ) {
                return `${label} is required`
              }
              // Then run additional validation
              const validationResult = validateAgreementField(0, name, value as unknown)
              // validateDeveloperField returns true if valid, or an error message string if invalid
              return validationResult
            },
          }}
          defaultValue=""
          render={({ field, fieldState: { error } }) => {
            const normalizedValue =
              field.value !== undefined && field.value !== null
                ? String(field.value)
                : ''
            return (
            <FormControl fullWidth error={!!error} required={required}>
              <InputLabel sx={labelStyles}>
                {loading ? `Loading...` : label}
              </InputLabel>
              <Select
                {...field}
                value={normalizedValue}
                input={<OutlinedInput label={loading ? `Loading...` : label} />}
                label={loading ? `Loading...` : label}
                IconComponent={KeyboardArrowDownIcon}
                disabled={loading || isReadOnly}
                  sx={
                    typeof selectFieldStyles === 'object' && typeof valueStyles === 'object'
                      ? ({
                  ...selectFieldStyles,
                  ...valueStyles,
                  ...(isReadOnly && {
                    backgroundColor: viewModeStyles.backgroundColor,
                    color: textSecondary,
                  }),
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: `1px solid ${neutralBorderColor}`,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    border: `1px solid ${neutralBorderHoverColor}`,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    border: `2px solid ${focusBorder}`,
                  },
                        } as SxProps<Theme>)
                      : ({
                          ...(isReadOnly && {
                            backgroundColor: viewModeStyles.backgroundColor,
                            color: textSecondary,
                          }),
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: `1px solid ${neutralBorderColor}`,
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            border: `1px solid ${neutralBorderHoverColor}`,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            border: `2px solid ${focusBorder}`,
                          },
                        } as SxProps<Theme>)
                  }
                onChange={(event) => {
                  const selectedValue = event.target.value as string
                  const selectedId = Number(selectedValue)
                  if (!selectedValue || Number.isNaN(selectedId)) {
                    field.onChange('')
                    return
                  }
                  field.onChange(selectedId)
                }}
              >
                  {options.map((option, index) => {
                    const optionObj = option as { id?: string | number; settingValue?: string; configId?: string }
                    return (
                  <MenuItem
                        key={optionObj.id || optionObj.configId || index}
                        value={String(optionObj.id || optionObj.configId || '')}
                  >
                    {getDisplayLabel(
                          option,
                          optionObj.settingValue || optionObj.configId || 'Option'
                    )}
                  </MenuItem>
                    )
                  })}
              </Select>
              {error && (
                <FormHelperText
                  error
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '12px',
                    marginLeft: '14px',
                    marginRight: '14px',
                    marginTop: '4px',
                  }}
                >
                  {error?.message?.toString()}
                </FormHelperText>
              )}
            </FormControl>
            )
          }}
          />
        </Grid>
      )
    }



  const renderTextFieldWithButton = (
    name: string,
    label: string,
    buttonText: string,
    gridSize: number = 6,
    required = false
  ) => (
    <Grid key={`agreement-step1-field-with-button-${name}`} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        rules={{
          required: required ? `${label} is required` : false,
        }}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label={label}
            required={required}
            disabled={isReadOnly}
            error={!!errors[name]}
            helperText={errors[name]?.message?.toString()}
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
                      '&:disabled': {
                        background: theme.palette.action.disabledBackground,
                        color: theme.palette.action.disabled,
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
                    disabled={isReadOnly || isFetchingDetails}
                  >
                    {isFetchingDetails ? 'Fetching...' : buttonText}
                  </Button>
                </InputAdornment>
              ),
              sx: valueStyles,
            }}
            InputLabelProps={{
              sx: {
                ...labelStyles,
                ...(!!errors[name] && {
                  color: theme.palette.error.main,
                  '&.Mui-focused': { color: theme.palette.error.main },
                  '&.MuiFormLabel-filled': { color: theme.palette.error.main },
                }),
              },
            }}
            sx={{
              ...fieldStyles,
              ...(isReadOnly && {
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
        )}
      />
    </Grid>
  )

  const renderAgreementIdField = (
    name: string,
    label: string,
    gridSize: number = 6,
    required = false
  ) => (
    <Grid key={`field-${name}`} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        rules={{
          required: required ? `${label} is required` : false,
        }}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label={label}
            required={required}
            value={field.value || generatedId}
            error={!!errors[name]}
            helperText={errors[name]?.message?.toString()}
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
                ...(!!errors[name] && {
                  color: theme.palette.error.main,
                  '&.Mui-focused': { color: theme.palette.error.main },
                  '&.MuiFormLabel-filled': { color: theme.palette.error.main },
                }),
              },
            }}
            sx={{
              ...fieldStyles,
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
        )}
      />
    </Grid>
  )

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card
        sx={{
          ...cardBaseStyles,
          width: '84%',
          margin: '0 auto',
        }}
      >
        <CardContent sx={{ color: textPrimary }}>
          {/* Show error if dropdowns fail to load */}
          {dropdownsError && (
            <Box
              sx={{
                mb: 2,
                p: 1,
                bgcolor: isDark
                  ? alpha(theme.palette.error.main, 0.15)
                  : '#fef2f2',
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.error.main, 0.4)}`,
              }}
            >
              <Typography variant="body2" color="error">
                ⚠️ Failed to load dropdown options. Using fallback values.
              </Typography>
            </Box>
          )}

          <Grid container rowSpacing={4} columnSpacing={2}>
            {renderAgreementIdField(
              'id',
              getAgreementLabelDynamic('CDL_ESCROW_AGREEMENT_ID'),
              6,
              true
            )}
            {renderTextFieldWithButton(
              'primaryEscrowCifNumber',
              getAgreementLabelDynamic('CDL_ESCROW_CIF_NUMBER'),
              'Fetch Details',
              6,
              true
            )}
            <Grid key="field-productManagerName" size={{ xs: 12, md: 6 }}>
              <Controller
                name="productManagerName"
                control={control}
                defaultValue=""
                rules={{
                  required: `${getAgreementLabelDynamic('CDL_ESCROW_PRODUCT_MANAGET_NAME')} is required`,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={`${getAgreementLabelDynamic('CDL_ESCROW_PRODUCT_MANAGET_NAME')}`}
                    fullWidth
                    required={true}
                    disabled={true}
                    error={!!errors['productManagerName']}
                    helperText={errors['productManagerName']?.message?.toString()}
                    InputLabelProps={{ sx: labelStyles }}
                    InputProps={{
                      sx: {
                        ...valueStyles,
                        color: textSecondary,
                      },
                    }}
                    sx={{
                      ...fieldStyles,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: viewModeStyles.backgroundColor,
                        '& fieldset': {
                          borderColor: viewModeStyles.borderColor,
                        },
                        '&:hover fieldset': {
                          borderColor: viewModeStyles.borderColor,
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid key="field-clientName" size={{ xs: 12, md: 6 }}>
              <Controller
                name="clientName"
                control={control}
                defaultValue=""
                rules={{
                  required: `${getAgreementLabelDynamic('CDL_ESCROW_CLIENT_NAME')} is required`,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={`${getAgreementLabelDynamic('CDL_ESCROW_CLIENT_NAME')}`}
                    fullWidth
                    required={true}
                    disabled={true}
                    error={!!errors['clientName']}
                    helperText={errors['clientName']?.message?.toString()}
                    InputLabelProps={{ sx: labelStyles }}
                    InputProps={{
                      sx: {
                        ...valueStyles,
                        color: textSecondary,
                      },
                    }}
                    sx={{
                      ...fieldStyles,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: viewModeStyles.backgroundColor,
                        '& fieldset': {
                          borderColor: viewModeStyles.borderColor,
                        },
                        '&:hover fieldset': {
                          borderColor: viewModeStyles.borderColor,
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
            {renderTextField(
              'relationshipManagerName',
              getAgreementLabelDynamic('CDL_ESCROW_RM_NAME'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'operatingLocationCode',
              getAgreementLabelDynamic('CDL_ESCROW_OPERATING_LOCATION_CODE'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'customField1',
              getAgreementLabelDynamic('CDL_ESCROW_CUSTOM_FIELD_1'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'customField2',
              getAgreementLabelDynamic('CDL_ESCROW_CUSTOM_FIELD_2'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'customField3',
              getAgreementLabelDynamic('CDL_ESCROW_CUSTOM_FIELD_3'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'customField4',
              getAgreementLabelDynamic('CDL_ESCROW_CUSTOM_FIELD_4'),
              '',
              6,
              false,
              true
            )}
            {/* {renderApiSelectField(
              'agreementParametersDTO.id',
              getAgreementLabelDynamic('CDL_ESCROW_AGREEMENT_PARAMETERS_DTO'),
              agreementParameters,
              6,
              dropdownsLoading,
              true
            )}
          
           {renderApiSelectField(
                'agreementParametersDTO.id',
                getAgreementLabelDynamic('CDL_ESCROW_AGREEMENT_PARAMETERS_DTO'),
                agreementRegulatoryAuthoritiesOptions,
                6,
                dropdownsLoading,
                true
              )}
              {renderApiSelectField(
                'agreementFeeScheduleDTO.id',
                getAgreementLabelDynamic('CDL_ESCROW_AGREEMENT_FEE_SCHEDULE_DTO'),
                agreementFeeScheduleOptions,
                6,
                dropdownsLoading,
                true
              )}
              {renderApiSelectField(
                'clientNameDTO.id',
                getAgreementLabelDynamic('CDL_ESCROW_CLIENT_NAME_DTO'),
                clientNameOptions,
                6,
                dropdownsLoading,
                true
              )}
              {renderApiSelectField(
                'businessSegmentDTO.id',
                getAgreementLabelDynamic('CDL_ESCROW_BUSINESS_SEGMENT_DTO'),
                businessSegmentOptions,
                6,
                dropdownsLoading,
                true
              )}
              {renderApiSelectField(
                'businessSubSegmentDTO.id',
                getAgreementLabelDynamic('CDL_ESCROW_BUSINESS_SUB_SEGMENT_DTO'),
                businessSubSegmentOptions,
                6,
                dropdownsLoading,
                true
              )}
              {renderApiSelectField(
                'dealStatusDTO.id',
                getAgreementLabelDynamic('CDL_ESCROW_DEAL_STATUS_DTO'),
                dealStatusOptions,
                6,
                dropdownsLoading,
                true
              )} */}
              
              {/* {renderApiSelectField(
                'dealTypeDTO.id',
                getAgreementLabelDynamic('CDL_ESCROW_DEAL_TYPE_DTO'),
                dealTypeOptions,
                6,
                dropdownsLoading,
                true
              )}
              {renderApiSelectField(
                'dealSubTypeDTO.id',
                getAgreementLabelDynamic('CDL_ESCROW_DEAL_SUB_TYPE_DTO'),
                dealSubTypeOptions,
                6,
                dropdownsLoading,
                true
              )}
              {renderApiSelectField(
                'productProgramDTO.id',
                getAgreementLabelDynamic('CDL_ESCROW_PRODUCT_PROGRAM_DTO'),
                productProgramOptions,
                6,
                dropdownsLoading,
                true
              )} */}
              {renderApiSelectField(
                'feesDTO.id',
                getAgreementLabelDynamic('CDL_ESCROW_FEES_DTO'),
                feesOptions,
                6,
                dropdownsLoading,
                true
              )}
              {renderApiSelectField(
                'dealPriorityDTO.id',
                getAgreementLabelDynamic('CDL_ESCROW_DEAL_PRIORITY_DTO'),
                dealPriorityOptions,
                6,
                dropdownsLoading,
                true
              )} 
            
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  )
}

export default Step1
