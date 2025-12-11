import React, { useState, useEffect, useCallback } from 'react'
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  useTheme,
} from '@mui/material'
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { Controller, useFormContext } from 'react-hook-form'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { getPartyLabel } from '@/constants/mappings/master/partyMapping'
import { usePartyLabelsWithCache } from '@/hooks/master/CustomerHook/usePartyLabelsWithCache'
import { useAppStore } from '@/store'
import { partyService } from '@/services/api/masterApi/Customer/partyService'
import { usePartiesForDropdown } from '@/hooks/master/CustomerHook/useParty'
import {
  commonFieldStyles as sharedCommonFieldStyles,
  selectStyles as sharedSelectStyles,
  datePickerStyles as sharedDatePickerStyles,
  labelSx as sharedLabelSx,
  valueSx as sharedValueSx,
  cardStyles as sharedCardStyles,
  viewModeInputStyles,
  neutralBorder,
  neutralBorderHover,
} from '../styles'

interface Step2Props {
  isReadOnly?: boolean
  partyId?: string | undefined
}

const Step2 = ({ isReadOnly = false, partyId }: Step2Props) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const textPrimary = isDark ? '#FFFFFF' : '#1E2939'
  const textSecondary = isDark ? '#CBD5E1' : '#6B7280'
  const fieldStyles = React.useMemo(
    () => sharedCommonFieldStyles(theme),
    [theme]
  )
  const selectFieldStyles = React.useMemo(
    () => sharedSelectStyles(theme),
    [theme]
  )
  const dateFieldStyles = React.useMemo(
    () => sharedDatePickerStyles(theme),
    [theme]
  )
  const labelStyles = React.useMemo(() => sharedLabelSx(theme), [theme])
  const valueStyles = React.useMemo(() => sharedValueSx(theme), [theme])
  const cardBaseStyles = React.useMemo(
    () => (sharedCardStyles as (t: ReturnType<typeof useTheme>) => Record<string, unknown>)(theme),
    [theme]
  )
  const viewModeStyles = viewModeInputStyles(theme)
  const neutralBorderColor = neutralBorder(theme)
  const neutralBorderHoverColor = neutralBorderHover(theme)
  const focusBorder = theme.palette.primary.main
  // Check if we're in edit mode (existing developer)
  const isEditMode = !!partyId
  const {
    control,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext()

  // State for developer ID generation
  const [generatedId, setGeneratedId] = useState<string>('')
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false)

  // Fetch parties for dropdown
  const { data: partyOptions = [], isLoading: loadingParties } =
    usePartiesForDropdown()

  // Dynamic label support (Phase 1: foundation)
  const { data: partyLabels, getLabel } = usePartyLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  const getPartyLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getPartyLabel(configId)

      if (partyLabels) {
        return getLabel(configId, currentLanguage, fallback)
      }
      return fallback
    },
    [partyLabels, currentLanguage, getLabel]
  )

  // Initialize authorized signatory ID from form value
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'id' && value.id) {
        setGeneratedId(value.id)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])
  

  // Handle Fetch Details button click
  const handleFetchDetails = async () => {
    const currentCif = watch('customerCifNumber')
    if (!currentCif || !currentCif.trim()) {
      return
    }

    try {
      const customerDetails =
        await partyService.getCustomerDetailsByCif(currentCif.trim())

      // Clear any existing errors for fields we're about to populate
      clearErrors([
        'signatoryFullName',
        'addressLine1',
        'addressLine2',
        'addressLine3',
        'emailAddress',
        'telephoneNumber',
        'mobileNumber',
      ] as (keyof typeof errors)[])

      // Populate fields from customer details (matching Step1 pattern)
      if (customerDetails?.name?.firstName) {
        setValue('signatoryFullName', customerDetails.name.firstName, {
          shouldValidate: false, // Don't validate immediately to avoid errors
          shouldDirty: true,
        })
      }
      
      // Populate address fields if available
      if (customerDetails?.contact?.address) {
        if (customerDetails.contact.address.line1) {
          setValue('addressLine1', customerDetails.contact.address.line1, {
            shouldValidate: false,
            shouldDirty: true,
          })
        }
        if (customerDetails.contact.address.line2) {
          setValue('addressLine2', customerDetails.contact.address.line2, {
            shouldValidate: false,
            shouldDirty: true,
          })
        }
        // Combine city, state, country for addressLine3
        const addressLine3Parts = [
          customerDetails.contact.address.city,
          customerDetails.contact.address.state,
          customerDetails.contact.address.country,
        ].filter(Boolean)
        if (addressLine3Parts.length > 0) {
          setValue('addressLine3', addressLine3Parts.join(', '), {
            shouldValidate: false,
            shouldDirty: true,
          })
        }
      }
      
      // Populate contact fields if available
      if (customerDetails?.contact?.preferredEmail) {
        setValue('emailAddress', customerDetails.contact.preferredEmail, {
          shouldValidate: false,
          shouldDirty: true,
        })
      }
      if (customerDetails?.contact?.preferredPhone) {
        const phoneNumber = customerDetails.contact.preferredPhone
        setValue('telephoneNumber', phoneNumber, {
          shouldValidate: false,
          shouldDirty: true,
        })
        setValue('mobileNumber', phoneNumber, {
          shouldValidate: false,
          shouldDirty: true,
        })
      }
      
      // Trigger validation after a short delay to ensure fields are set
      setTimeout(() => {
        // Re-validate the populated fields
        setValue('signatoryFullName', watch('signatoryFullName'), {
          shouldValidate: true,
        })
      }, 100)
      
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[PartyStepper Step2] Error fetching customer details:', error)
      }
    }
  }

  // Function to generate new authorized signatory ID
  const handleGenerateNewId = async () => {
    try {
      setIsGeneratingId(true)
      // Generate a temporary ID - in production this would come from the API
      const tempId = `AS-${Date.now()}`
      setGeneratedId(tempId)
      setValue('id', tempId, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } catch {
      // Handle error silently
    } finally {
      setIsGeneratingId(false)
    }
  }

  // Load existing authorized signatory data when in edit mode
  useEffect(() => {
    if (!isEditMode || !partyId) return

    const loadExisting = async () => {
      try {
        const authorizedSignatories =
          await partyService.getPartyAuthorizedSignatory(partyId)
        if (
          authorizedSignatories &&
          Array.isArray(authorizedSignatories) &&
          authorizedSignatories.length > 0
        ) {
          const firstSignatory = authorizedSignatories[0]
          // Load cifExistsDTO if available
          if (
            firstSignatory &&
            firstSignatory.cifExistsDTO &&
            typeof firstSignatory.cifExistsDTO === 'object' &&
            'id' in firstSignatory.cifExistsDTO
          ) {
            setValue(
              'cifExistsDTO.id',
              (firstSignatory.cifExistsDTO as { id?: number }).id,
              {
                shouldValidate: true,
                shouldDirty: false,
              }
            )
          }
          // Load partyDTO if available
          if (
            firstSignatory &&
            firstSignatory.partyDTO &&
            typeof firstSignatory.partyDTO === 'object' &&
            'id' in firstSignatory.partyDTO
          ) {
            const partyIdValue = (firstSignatory.partyDTO as { id?: number }).id
            if (partyIdValue) {
              setValue('partyDropdown', partyIdValue.toString(), {
              shouldValidate: true,
              shouldDirty: false,
            })
              setValue(
                'partyDTO',
                { id: partyIdValue },
                {
                  shouldValidate: true,
                  shouldDirty: false,
                }
              )
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[PartyStepper Step2] Error loading existing authorized signatory data:', error)
        }
      }
    }

    loadExisting()
  }, [isEditMode, partyId, setValue])

  // Handle party selection from dropdown
  const handlePartySelection = useCallback(
    (partyIdValue: string) => {
      const selectedParty = partyOptions.find(
        (party) => party.settingValue === partyIdValue
      )

      if (selectedParty) {
        // Set partyDTO as an object with id property to match transformer expectations
        setValue(
          'partyDTO',
          { id: parseInt(selectedParty.settingValue) },
          {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          }
        )
        // Clear any prior manual errors for this field
        clearErrors(['partyDTO'] as (keyof typeof errors)[])
      }
    },
    [partyOptions, setValue, clearErrors]
  )

  const renderTextField = (
    name: string,
    label: string,
    defaultValue = '',
    gridSize: number = 6,
    disabled = false,
    required = false
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue === undefined || defaultValue === null ? '' : defaultValue}
        rules={{
          required: required ? `${label} is required` : false,
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
            value={field.value ?? ''}
            onChange={(e) => {
              field.onChange(e.target.value)
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
            InputProps={{
              sx: {
                ...valueStyles,
                ...((isReadOnly || disabled) && {
                  color: textSecondary,
                }),
              },
            }}
            sx={{
              ...fieldStyles,
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

  // New render function for API-driven dropdowns
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderApiSelectField = (
    name: string,
    label: string,
    options: unknown[],
    gridSize: number = 6,
    loading = false,
    required = false
  ) => {
    return (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
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
              return true
            },
          }}
          defaultValue=""
          render={({ field, fieldState: { error } }) => (
            <FormControl fullWidth error={!!error} required={required}>
              <InputLabel sx={labelStyles}>
                {loading ? `Loading...` : label}
              </InputLabel>
              <Select
                {...field}
                value={field.value || ''}
                input={<OutlinedInput label={loading ? `Loading...` : label} />}
                label={loading ? `Loading...` : label}
                IconComponent={KeyboardArrowDownIcon}
                disabled={loading || isReadOnly}
                sx={{
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
                }}
              >
                {options.map((option) => (
                  <MenuItem
                    key={(option as { configId?: string }).configId}
                    value={(option as { id?: string }).id}
                  >
                    {(option as { name?: string; label?: string }).name || 
                     (option as { label?: string }).label || 
                     (option as { id?: string }).id || 
                     'Unknown'}
                  </MenuItem>
                ))}
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
          )}
        />
      </Grid>
    )
  }

  // Render function for party dropdown (matching reference pattern)
  const renderPartySelectField = (
    name: string,
    configId: string,
    fallbackLabel: string,
    options: { id: number; displayName: string; settingValue: string }[],
    gridMd: number = 6,
    required = false,
    loading = false
  ) => {
    const label = getPartyLabelDynamic(configId) || fallbackLabel
    return (
      <Grid size={{ xs: 12, md: gridMd }}>
        <Controller
          name={name}
          control={control}
          rules={required ? { required: `${label} is required` } : {}}
          defaultValue={''}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors[name]} required={required}>
              <InputLabel sx={labelStyles} required={required}>
                {loading ? `Loading...` : label}
              </InputLabel>
              <Select
                {...field}
                label={loading ? `Loading...` : label}
                required={required}
                sx={[
                  selectFieldStyles,
                  valueStyles,
                  {
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: `1px solid ${neutralBorderColor}`,
                      borderRadius: '6px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: `1px solid ${neutralBorderHoverColor}`,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: `2px solid ${theme.palette.primary.main}`,
                    },
                  },
                  isReadOnly && {
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: viewModeStyles.backgroundColor,
                      '& fieldset': {
                        borderColor: viewModeStyles.borderColor,
                      },
                      '&:hover fieldset': {
                        borderColor: viewModeStyles.borderColor,
                      },
                    },
                    '& .MuiSelect-select': {
                      color: viewModeStyles.textColor,
                    },
                  },
                  !!errors[name] && !isReadOnly
                    ? {
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: `1px solid ${theme.palette.error.main}`,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          border: `1px solid ${theme.palette.error.main}`,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          border: `1px solid ${theme.palette.error.main}`,
                        },
                      }
                    : null,
                ]}
                IconComponent={KeyboardArrowDownIcon}
                disabled={loading || isReadOnly}
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e)
                  handlePartySelection(e.target.value as string)
                }}
              >
                {options.map((option) => (
                  <MenuItem key={option.id} value={option.settingValue}>
                    {option.displayName}
                  </MenuItem>
                ))}
              </Select>
              {errors[name] && (
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
                  {errors[name]?.message?.toString()}
                </FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderCheckboxField = (
    name: string,
    label?: string,
    gridSize: number = 6
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={field.value === true}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  field.onChange(e.target.checked)
                }
                disabled={isReadOnly}
                sx={{
                  color: neutralBorderColor,
                  '&.Mui-checked': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            }
            label={
              label ??
              name
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())
            }
            sx={{
              '& .MuiFormControlLabel-label': {
                fontFamily: 'Outfit, sans-serif',
                fontStyle: 'normal',
                fontSize: '14px',
                lineHeight: '24px',
                letterSpacing: '0.5px',
                verticalAlign: 'middle',
                color: textPrimary,
              },
            }}
          />
        )}
      />
    </Grid>
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderDatePickerField = (
    name: string,
    label: string,
    gridSize: number = 6,
    required = false
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={null}
        rules={{
          required: required ? `${label} is required` : false,
        }}
        render={({ field }) => (
          <DatePicker
            label={label}
            value={field.value}
            onChange={field.onChange}
            format="DD/MM/YYYY"
            disabled={isReadOnly}
            slots={{
              openPickerIcon: CalendarTodayOutlinedIcon,
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                required: required,
                error: !!errors[name],
                helperText: errors[name]?.message?.toString(),
                sx: dateFieldStyles,
                InputLabelProps: { sx: labelStyles },
                InputProps: {
                  sx: valueStyles,
                  style: { height: '46px' },
                },
              },
            }}
          />
        )}
      />
    </Grid>
  )

  const renderTextFieldWithButton = (
    name: string,
    label: string,
    buttonText: string,
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
            value={field.value ?? ''}
            onChange={(e) => {
              field.onChange(e.target.value)
            }}
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

  // Note: renderPartyIdField is kept for potential future use but not currently used in Step2
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderPartyIdField = (
    name: string,
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
        }}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label={label}
            required={required}
            value={field.value || generatedId || ''}
            error={!!errors[name]}
            helperText={errors[name]?.message?.toString()}
            onChange={(e) => {
              const value = e.target.value
              setGeneratedId(value)
              field.onChange(value)
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
          <Grid container rowSpacing={4} columnSpacing={2}>
            {renderTextFieldWithButton(
              'customerCifNumber',
              getPartyLabelDynamic(
                'CDL_MP_AUTHORIZED_SIGNATORY_CUSTOMER_CIF_NUMBER'
              ),
              'Fetch Details',
              6,
              true
            )}
            {renderPartySelectField(
              'partyDropdown',
              'CDL_MP_AUTHORIZED_SIGNATORY_PARTY_SELECT',
              'Party',
              partyOptions,
              6,
              true,
              loadingParties
            )}
            {renderTextField(
              'signatoryFullName',
              getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_NAME'),
              '',
              6,
              false, // Keep editable after fetch
              true
            )}
            {renderTextField(
              'emailAddress',
              getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_EMAIL_ID'),
              '',
              6,
              false, // Keep editable after fetch
              false
            )}
            {renderTextField(
              'telephoneNumber',
              getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_TELEPHONE_NO'),
              '',
              6,
              false, // Keep editable after fetch
              false
            )}
            {renderTextField(
              'mobileNumber',
              getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_MOBILE_NO'),
              '',
              6,
              false, // Keep editable after fetch
              false
            )}

            {renderTextField(
              'addressLine1',
              getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_ADDRESS_1'),
              '',
              4,
              false, // Keep editable after fetch
              true
            )}
            {renderTextField(
              'addressLine2',
              getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_ADDRESS_2'),
              '',
              4,
              false, // Keep editable after fetch
              true
            )}
            {renderTextField(
              'addressLine3',
              getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_ADDRESS_3'),
              '',
              4,
              false, // Keep editable after fetch
              true
            )}

            {renderTextField(
              'notificationContactName',
              getPartyLabelDynamic(
                'CDL_MP_AUTHORIZED_SIGNATORY_NOTIFICATION_CONTACT_NAME'
              ),
              '',
              6,
              false,
              false
            )}
            {renderTextField(
              'notificationEmailAddress',
              getPartyLabelDynamic(
                'CDL_MP_AUTHORIZED_SIGNATORY_NOTIFICATION_EMAIL'
              ),
              '',
              6,
              false,
              false
            )}
            {renderTextField(
              'notificationSignatureFile',
              getPartyLabelDynamic(
                'CDL_MP_AUTHORIZED_SIGNATORY_NOTIFICATION_SIGNATURE_FILE'
              ),
              '',
              6,
              false,
              false
            )}
            {renderTextField(
              'notificationSignatureMimeType',
              getPartyLabelDynamic(
                'CDL_MP_AUTHORIZED_SIGNATORY_NOTIFICATION_SIGNATURE_MIME_TYPE'
              ),
              '',
              6,
              false,
              false
            )}

            {renderTextField(
              'teamLeaderName',
              getPartyLabelDynamic('CDL_MP_PARTY_TEAM_LEADER_NAME'),
              '',
              6,
              false,
              false
            )}

            {renderTextField(
              'additionalRemarks',
              getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_REMARKS'),
              '',
              6,
              false,
              false
            )}

            {/* {renderTextFieldWithButton(
              'signatoryCifNumber',
              getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_CIF_NUMBER'),
              'Fetch Details',
              6,
              true
            )} */}
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  )
}

export default Step2
