import React, { useCallback } from 'react'
import {
  Card,
  CardContent,
  Grid,
  TextField,
  useTheme,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { Controller, useFormContext } from 'react-hook-form'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { getPaymentBeneficiaryLabel } from '@/constants/mappings/master/paymentMapping'
import { usePaymentBeneficiaryLabelsWithCache } from '@/hooks/master/PaymentHook'
import { useAppStore } from '@/store'
import { validateStandingInstructionBeneficiaryField } from '@/lib/validation/masterValidation/paymentBeneficiarySchemas'
import {
  commonFieldStyles as sharedCommonFieldStyles,
  labelSx as sharedLabelSx,
  valueSx as sharedValueSx,
  cardStyles as sharedCardStyles,
  viewModeInputStyles,
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
  
  const isEditMode = !!paymentBeneficiaryId
  const {
    control,
    formState: { errors },
  } = useFormContext()

  // Dynamic label support
  const { data: paymentBeneficiaryLabels, getLabel } = usePaymentBeneficiaryLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

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
            {renderTextField(
              'currencyCode',
              getPaymentBeneficiaryLabelDynamic('CDL_PAYMENT_CURRENCY_CODE'),
              '',
              6,
              false,
              true
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


