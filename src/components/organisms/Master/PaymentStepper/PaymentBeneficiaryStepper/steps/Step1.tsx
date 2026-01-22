import React, { useCallback } from 'react'
import {
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useTheme,
} from '@mui/material'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { Controller, useFormContext } from 'react-hook-form'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { getPaymentBeneficiaryLabel } from '@/constants/mappings/master/paymentMapping'
import { usePaymentBeneficiaryLabelsWithCache } from '@/hooks/master/PaymentHook'
import { useAppStore } from '@/store'
import { validateStandingInstructionBeneficiaryField } from '@/lib/validation/masterValidation/paymentBeneficiarySchemas'
import { useCurrencies, usePaymentModes } from '@/hooks/useApplicationSettings'
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
  paymentBeneficiaryId?: string | undefined
}

const Step1 = ({ isReadOnly = false, paymentBeneficiaryId }: Step1Props) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
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
  
  const selectFieldStyles = React.useMemo(() => {
    if (typeof sharedSelectStyles === 'function') {
      return sharedSelectStyles(theme)
    }
    return sharedSelectStyles
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
  
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext()

  // Dynamic label support
  const { data: paymentBeneficiaryLabels, getLabel } = usePaymentBeneficiaryLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'
  const { data: paymentModeSettings = [], loading: paymentModeLoading } = usePaymentModes()
  const { data: currencySettings = [], loading: currencyLoading } = useCurrencies()

  const paymentModeOptions = React.useMemo(
    () =>
      paymentModeSettings.map((item) => ({
        id: item.id,
        settingValue: item.settingValue,
        displayName: item.displayName,
      })),
    [paymentModeSettings]
  )

  const currencyOptions = React.useMemo(
    () =>
      currencySettings.map((item) => ({
        id: item.id,
        settingValue: item.settingValue,
        displayName: item.displayName,
      })),
    [currencySettings]
  )

  const getPaymentBeneficiaryLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getPaymentBeneficiaryLabel(configId)

      if (paymentBeneficiaryLabels) {
        return getLabel(configId, currentLanguage, fallback)
      }
      return fallback
    },
    [paymentBeneficiaryLabels, currentLanguage, getLabel]
  )

  const resolveSx = (styles: unknown) => {
    if (typeof styles === 'function') {
      return styles(theme) as Record<string, unknown>
    }
    if (Array.isArray(styles)) {
      return Object.assign({}, ...styles) as Record<string, unknown>
    }
    if (styles && typeof styles === 'object') {
      return styles as Record<string, unknown>
    }
    return {}
  }

  const renderTextField = (
    name: string,
    label: string,
    defaultValue = '',
    gridSize: number = 6,
    disabled = false,
    required = false,
    type: 'text' | 'number' = 'text'
  ) => (
    <Grid key={`field-${name}`} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue === undefined ? '' : defaultValue}
        rules={{
          required: required ? `${label} is required` : false,
          validate: (value: unknown) => validateStandingInstructionBeneficiaryField(0, name, value),
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label={label}
            fullWidth
            type={type}
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

  const renderSelectField = (
    name: string,
    configId: string,
    fallbackLabel: string,
    options: { id: number; displayName: string; settingValue: string }[],
    gridMd: number = 6,
    required = false,
    loading = false
  ) => {
    const label = getPaymentBeneficiaryLabelDynamic(configId) || fallbackLabel
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
                {loading ? 'Loading...' : label}
              </InputLabel>
              <Select
                {...field}
                label={loading ? 'Loading...' : label}
                required={required}
                sx={{
                  ...resolveSx(selectFieldStyles),
                  ...resolveSx(valueStyles),
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: `1px solid ${neutralBorderColor}`,
                    borderRadius: '6px',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    border: `1px solid ${neutralBorderHoverColor}`,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    border: `2px solid ${focusBorder}`,
                  },
                  ...(isReadOnly && {
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
                  }),
                  ...(!!errors[name] &&
                    !isReadOnly && {
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: `1px solid ${theme.palette.error.main}`,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: `1px solid ${theme.palette.error.main}`,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: `1px solid ${theme.palette.error.main}`,
                      },
                    }),
                }}
                IconComponent={KeyboardArrowDownIcon}
                disabled={loading || isReadOnly}
                value={
                  typeof field.value === 'object' && field.value?.id
                    ? options.find((opt) => opt.id === field.value.id)?.settingValue || ''
                    : field.value || ''
                }
                onChange={(e) => {
                  const selectedValue = e.target.value as string
                  const selectedOption = options.find(
                    (opt) => opt.settingValue === selectedValue
                  )
                  if (selectedOption) {
                    setValue(name, { id: selectedOption.id }, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  } else {
                    setValue(name, null, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card
        sx={{
          ...cardBaseStyles,
          width: '84%',
          margin: '0 auto',
        }}
      >
        <CardContent>
          <Grid container rowSpacing={4} columnSpacing={2}>
            {renderTextField(
              'beneficiaryAccountNumber',
              getPaymentBeneficiaryLabelDynamic('CDL_PAYMENT_BENEFICIARY_ACCOUNT_NUMBER'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'beneficiaryBankIfscCode',
              getPaymentBeneficiaryLabelDynamic('CDL_PAYMENT_BENEFICIARY_IFSC_CODE'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'creditAmountCap',
              getPaymentBeneficiaryLabelDynamic('CDL_PAYMENT_CREDIT_AMOUNT_CAP'),
              '',
              6,
              false,
              true,
              'number'
            )}
            {renderTextField(
              'creditAmount',
              getPaymentBeneficiaryLabelDynamic('CDL_PAYMENT_CREDIT_AMOUNT'),
              '',
              6,
              false,
              true,
              'number'
            )}
            {renderTextField(
              'transferPriorityLevel',
              getPaymentBeneficiaryLabelDynamic('CDL_PAYMENT_TRANSFER_PRIORITY_LEVELP'),
              '',
              6,
              false,
              true,
              'number'
            )}
            {renderTextField(
              'creditSharePercentage',
              getPaymentBeneficiaryLabelDynamic('CDL_PAYMENT_CREDIT_SHARE_PERCENTAGE'),
              '',
              6,
              false,
              true,
              'number'
            )}
            {renderSelectField(
              'currencyDTO',
              'CDL_PAYMENT_CURRENCY_DTO',
              'Currency',
              currencyOptions,
              6,
              false,
              currencyLoading
            )}
            {renderTextField(
              'currencyCode',
              getPaymentBeneficiaryLabelDynamic('CDL_PAYMENT_CURRENCY_CODE'),
              '',
              6,
              false,
              true
            )}
            {renderSelectField(
              'paymentModeDTO',
              'CDL_PAYMENT_PAYMENT_MODE_DTO',
              'Payment Mode',
              paymentModeOptions,
              6,
              false,
              paymentModeLoading
            )}
            {renderTextField(
              'paymentModeCode',
              getPaymentBeneficiaryLabelDynamic('CDL_PAYMENT_PAYMENT_MODE_CODE'),
              '',
              6,
              false,
              true
            )}
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  )
}

export default Step1


