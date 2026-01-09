import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { Controller, useFormContext } from 'react-hook-form'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import { getAccountLabel } from '@/constants/mappings/master/Entity/accountMapping'
import { useAccountLabelsWithCache } from '@/hooks'
import { useAppStore } from '@/store'
import { accountService } from '@/services/api/masterApi/Entitie/accountService'
import { validateAccountField } from '@/lib/validation/masterValidation/accountSchemasSchemas'
import {
  commonFieldStyles as sharedCommonFieldStyles,
  labelSx as sharedLabelSx,
  valueSx as sharedValueSx,
  cardStyles as sharedCardStyles,
  viewModeInputStyles,
  neutralBorder,
  neutralBorderHover,
} from '../styles'

interface Step1Props {
  isReadOnly?: boolean
  accountId?: string | undefined
}

const Step1 = ({ isReadOnly = false, accountId }: Step1Props) => {
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
  // Check if we're in edit mode (existing account)
  const isEditMode = !!accountId
  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext()

  // State for account ID generation
  const [generatedId, setGeneratedId] = useState<string>('')
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false)

  // Dynamic label support
  const { data: accountLabels, getLabel } = useAccountLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  const getAccountLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getAccountLabel(configId)

      if (accountLabels) {
        return getLabel(configId, currentLanguage, fallback)
      }
      return fallback
    },
    [accountLabels, currentLanguage, getLabel]
  )

  // Initialize account ID from form value
  useEffect(() => {
    const subscription = watch((value) => {
      if (value.id) {
        setGeneratedId(String(value.id))
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // Populate fields when account data is loaded (for edit mode)
  useEffect(() => {
    if (!accountId || !isEditMode) {
      return
    }

    let isPopulating = false
    let timeoutId: NodeJS.Timeout | null = null
    
    const populateFields = async () => {
      if (isPopulating) return
      isPopulating = true
      
      try {
        // Wait a bit for form reset to complete
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Fetch account data to populate fields
        const account = await accountService.getAccount(accountId)
        
        // Populate all fields from account data
        if (account) {
          const fieldsToPopulate = [
            'accountNumber',
            'productCode',
            'accountDisplayName',
            'ibanNumber',
            'officialAccountTitle',
            'virtualAccountNumber',
            'accountTypeCode',
            'assignmentStatus',
            'assignedToReference',
            'referenceField1',
            'referenceField2',
          ]

          fieldsToPopulate.forEach((field) => {
            const value = (account as Record<string, unknown>)[field]
            if (value !== undefined && value !== null) {
              const currentValue = watch(field)
              if (!currentValue || String(currentValue).trim() === '') {
                setValue(field, String(value), {
                  shouldValidate: true,
                  shouldDirty: false,
                })
              }
            }
          })

          // Handle date field
          if (account.accountOpenDateTime) {
            const dateValue = watch('accountOpenDateTime')
            if (!dateValue) {
              setValue('accountOpenDateTime', account.accountOpenDateTime, {
                shouldValidate: true,
                shouldDirty: false,
              })
            }
          }

          // Handle active field
          if (account.active !== undefined) {
            setValue('active', account.active, {
              shouldValidate: true,
              shouldDirty: false,
            })
          }
        }
      } catch (error) {
        // Error fetching account data - form will remain empty
    } finally {
        isPopulating = false
      }
    }
    
    // Use a timeout to ensure form reset has completed
    timeoutId = setTimeout(() => {
      populateFields()
    }, 300)
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, isEditMode])

  // Function to generate new account ID
  const handleGenerateNewId = async () => {
    try {
      setIsGeneratingId(true)
      // Generate a simple ID - can be replaced with actual service call
      const newId = `ACC-${Date.now()}`
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
          validate: (value: unknown) => validateAccountField(0, name, value),
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

  const renderAccountIdField = (
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

  const renderDateField = (
    name: string,
    label: string,
    gridSize: number = 6,
    required = false
  ) => (
    <Grid key={`field-${name}`} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `${label} is required` : false,
        }}
        render={({ field }) => {
          const value = field.value
          const dateValue = value
            ? dayjs(value)
            : null

          return (
            <DatePicker
              label={label}
              value={dateValue}
              onChange={(newValue: Dayjs | null) => {
                const dateString = newValue ? newValue.toISOString() : ''
                field.onChange(dateString)
              }}
              disabled={isReadOnly}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required,
                  error: !!errors[name],
                  helperText: errors[name]?.message?.toString(),
                  InputLabelProps: {
                    sx: labelStyles,
                  },
                  sx: {
                    ...fieldStyles,
                    ...(isReadOnly && {
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: viewModeStyles.backgroundColor,
                        color: textSecondary,
                        '& fieldset': {
                          borderColor: viewModeStyles.borderColor,
                        },
                      },
                    }),
                  },
                },
              }}
            />
          )
        }}
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
            {renderAccountIdField(
              'id',
              getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_ID'),
              6,
              false
            )}
            {renderTextField(
              'accountNumber',
              getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_NO'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'productCode',
              getAccountLabelDynamic('CDL_ESCROW_PRODUCT_CODE'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'accountDisplayName',
              getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_DISPLAY_NAME'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'ibanNumber',
              getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_IBAN_NUMBER'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'officialAccountTitle',
              getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_OFFICIAL_ACCOUNT_TITLE'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'virtualAccountNumber',
              getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_VIRTUAL_ACCOUNT'),
              '',
              6,
              false,
              false
            )}
            {renderTextField(
              'accountTypeCode',
              getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_TYPE'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'assignmentStatus',
              getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_ASSIGNMENT_STATUS'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'assignedToReference',
              getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_ASSIGNED'),
              '',
              6,
              false,
              false
            )}
            {renderDateField(
              'accountOpenDateTime',
              getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_OPENING_DATE'),
              6,
              true
            )}
            {renderTextField(
              'referenceField1',
              getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_LOOKUP_FIELD_1'),
              '',
              6,
              false,
              false
            )}
            {renderTextField(
              'referenceField2',
              getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_LOOKUP_FIELD_2'),
              '',
              6,
              false,
              false
            )}
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  )
}

export default Step1
