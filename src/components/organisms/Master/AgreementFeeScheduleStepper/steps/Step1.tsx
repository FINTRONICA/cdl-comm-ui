import React, { useEffect, useCallback, useState } from 'react'
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
  Button,
  InputAdornment,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material'

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { Controller, useFormContext } from 'react-hook-form'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import {
  AGREEMENT_FEE_SCHEDULE_DTO_SETTING_KEYS,
  getAgreementFeeScheduleLabel,
} from '@/constants/mappings/master/Entity/agreementFeeScheduleMapping'
import { useAgreementFeeScheduleLabelsWithCache } from '@/hooks'
import { useAppStore } from '@/store'
import { agreementFeeScheduleService } from '@/services/api/masterApi/Entitie/agreementFeeScheduleService'
import { validateAgreementFeeScheduleField } from '@/lib/validation/masterValidation/agreementFeeScheduleSchemas'
import { useApplicationSettings } from '@/hooks/useApplicationSettings'
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
  agreementFeeScheduleId?: string | undefined
}

const Step1 = ({ isReadOnly = false, agreementFeeScheduleId }: Step1Props) => {
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
  // Check if we're in edit mode (existing agreement fee schedule)
  const isEditMode = !!agreementFeeScheduleId
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext()

  // State for regulatory reference generation
  const [generatedId, setGeneratedId] = useState<string>('')
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false)

  // Dynamic label support
  const { data: agreementFeeScheduleLabels, getLabel } = useAgreementFeeScheduleLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  const getAgreementFeeScheduleLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getAgreementFeeScheduleLabel(configId)

      if (agreementFeeScheduleLabels) {
        return getLabel(configId, currentLanguage, fallback)
      }
      return fallback
    },
    [agreementFeeScheduleLabels, currentLanguage, getLabel]
  )

  // Fetch dropdown options
  const { data: feeSettings = [], loading: feeLoading } = useApplicationSettings(
    AGREEMENT_FEE_SCHEDULE_DTO_SETTING_KEYS.feeDTO
  )
  const { data: feeTypeSettings = [], loading: feeTypeLoading } = useApplicationSettings(
    AGREEMENT_FEE_SCHEDULE_DTO_SETTING_KEYS.feeTypeDTO
  )
  const { data: feesFrequencySettings = [], loading: feesFrequencyLoading } =
    useApplicationSettings(AGREEMENT_FEE_SCHEDULE_DTO_SETTING_KEYS.feesFrequencyDTO)
  const { data: frequencyBasisSettings = [], loading: frequencyBasisLoading } =
    useApplicationSettings(AGREEMENT_FEE_SCHEDULE_DTO_SETTING_KEYS.frequencyBasisDTO)
  const feeOptions = React.useMemo(
    () =>
      feeSettings.map((item) => ({
        id: item.id,
        settingValue: item.settingValue,
        displayName: item.displayName,
      })),
    [feeSettings]
  )

  const feeTypeOptions = React.useMemo(
    () =>
      feeTypeSettings.map((item) => ({
        id: item.id,
        settingValue: item.settingValue,
        displayName: item.displayName,
      })),
    [feeTypeSettings]
  )

  const feesFrequencyOptions = React.useMemo(
    () =>
      feesFrequencySettings.map((item) => ({
        id: item.id,
        settingValue: item.settingValue,
        displayName: item.displayName,
      })),
    [feesFrequencySettings]
  )

  const frequencyBasisOptions = React.useMemo(
    () =>
      frequencyBasisSettings.map((item) => ({
        id: item.id,
        settingValue: item.settingValue,
        displayName: item.displayName,
      })),
    [frequencyBasisSettings]
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

  const getDtoId = (value: unknown): number | undefined => {
    if (value && typeof value === 'object' && 'id' in value) {
      const idValue = (value as { id?: number | string }).id
      return idValue !== undefined && idValue !== null ? Number(idValue) : undefined
    }
    if (typeof value === 'number') {
      return value
    }
    if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
      return Number(value)
    }
    return undefined
  }

  // Initialize regulatory reference from form value
  useEffect(() => {
    const subscription = watch((value) => {
      if (value.regulatoryRefNo) {
        setGeneratedId(String(value.regulatoryRefNo))
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // Populate fields when agreement fee schedule data is loaded (for edit mode)
  useEffect(() => {
    if (!agreementFeeScheduleId || !isEditMode) {
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
        
        // Fetch agreement fee schedule data to populate fields
        const agreementFeeSchedule = await agreementFeeScheduleService.getAgreementFeeSchedule(agreementFeeScheduleId)
        
        // Populate all fields from agreement fee schedule data
        if (agreementFeeSchedule) {
          const fieldsToPopulate = [
            'regulatoryRefNo',
            'operatingLocation',
            'priorityLevel',
            'transactionRateAmount',
            'debitAccountNumber',
            'creditAccountNumber',
          ]

          fieldsToPopulate.forEach((field) => {
            const value = (agreementFeeSchedule as unknown as Record<string, unknown>)[field]
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

          // Handle date fields
          if (agreementFeeSchedule.effectiveStartDate) {
            const dateValue = watch('effectiveStartDate')
            if (!dateValue) {
              setValue('effectiveStartDate', agreementFeeSchedule.effectiveStartDate, {
                shouldValidate: true,
                shouldDirty: false,
              })
            }
          }

          if (agreementFeeSchedule.effectiveEndDate) {
            const dateValue = watch('effectiveEndDate')
            if (!dateValue) {
              setValue('effectiveEndDate', agreementFeeSchedule.effectiveEndDate, {
                shouldValidate: true,
                shouldDirty: false,
              })
            }
          }

          // Handle DTO fields - extract ID from DTO objects
          const feeId = getDtoId(agreementFeeSchedule.feeDTO)
          if (feeId !== undefined) {
            setValue('feeDTO', { id: feeId }, {
              shouldValidate: false,
              shouldDirty: false,
            })
          }
          const feeTypeId = getDtoId(agreementFeeSchedule.feeTypeDTO)
          if (feeTypeId !== undefined) {
            setValue('feeTypeDTO', { id: feeTypeId }, {
              shouldValidate: false,
              shouldDirty: false,
            })
          }
          const feesFrequencyId = getDtoId(agreementFeeSchedule.feesFrequencyDTO)
          if (feesFrequencyId !== undefined) {
            setValue('feesFrequencyDTO', { id: feesFrequencyId }, {
              shouldValidate: false,
              shouldDirty: false,
            })
          }
          const frequencyBasisId = getDtoId(agreementFeeSchedule.frequencyBasisDTO)
          if (frequencyBasisId !== undefined) {
            setValue('frequencyBasisDTO', { id: frequencyBasisId }, {
              shouldValidate: false,
              shouldDirty: false,
            })
          }
          const agreementTypeId = getDtoId(agreementFeeSchedule.agreementTypeDTO)
          if (agreementTypeId !== undefined) {
            setValue('agreementTypeDTO', { id: agreementTypeId }, {
              shouldValidate: false,
              shouldDirty: false,
            })
          }
          const agreementSubTypeId = getDtoId(agreementFeeSchedule.agreementSubTypeDTO)
          if (agreementSubTypeId !== undefined) {
            setValue('agreementSubTypeDTO', { id: agreementSubTypeId }, {
              shouldValidate: false,
              shouldDirty: false,
            })
          }
          const productProgramId = getDtoId(agreementFeeSchedule.productProgramDTO)
          if (productProgramId !== undefined) {
            setValue('productProgramDTO', { id: productProgramId }, {
              shouldValidate: false,
              shouldDirty: false,
            })
          }
          if (agreementFeeSchedule.escrowAgreementDTO) {
            setValue('escrowAgreementDTO', agreementFeeSchedule.escrowAgreementDTO, {
              shouldValidate: true,
              shouldDirty: false,
            })
          }

          // Handle active field
          if (agreementFeeSchedule.active !== undefined) {
            setValue('active', agreementFeeSchedule.active, {
              shouldValidate: true,
              shouldDirty: false,
            })
          }
        }
      } catch {
        // Error handled silently - form will remain empty
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
  }, [agreementFeeScheduleId, isEditMode])
  const handleGenerateNewId = async () => {
    try {
      setIsGeneratingId(true)
      // Generate a simple ID - can be replaced with actual service call
      const newId = `AGR-${Date.now()}`
      setGeneratedId(newId)
      setValue('regulatoryRefNo', newId, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } catch {
      // Handle error silently
    } finally {
      setIsGeneratingId(false)
    }
  }
  const renderAgreementFeeScheduleRegulatoryRefNoField = (
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
          validate: (value: unknown) => validateAgreementFeeScheduleField(0, name, value),
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

  const renderAgreementFeeScheduleSelectField = (
    name: string,
    configId: string,
    fallbackLabel: string,
    options: { id: number; displayName: string; settingValue: string }[],
    gridMd: number = 6,
    required = false,
    loading = false
  ) => {
    const label = getAgreementFeeScheduleLabelDynamic(configId) || fallbackLabel
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
        <CardContent sx={{ color: textPrimary }}>
          <Grid container rowSpacing={4} columnSpacing={2}>
            
            {renderAgreementFeeScheduleRegulatoryRefNoField(
              'regulatoryRefNo',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_REGULATORY_REF_NO'),
              6,
              false
            )}
             {renderTextField(
              'operatingLocation',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_LOCATION'),
              '',
              6,
              false,
              true
            )}
            
            {renderDateField(
              'effectiveStartDate',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_START_DATE'),
              6,
              true
            )}
            {renderDateField(
              'effectiveEndDate',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_END_DATE'),
              6,
              true
            )}
            

            {renderTextField(
              'priorityLevel',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_PRIORITY_LEVEL'),
              '',
              6,
              false,
              true
            )}


            {renderTextField(
              'transactionRateAmount',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_TRANSACTION_RATE_AMOUNT'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'debitAccountNumber',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_DEBIT_ACCOUNT_NUMBER'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'creditAccountNumber',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_CREDIT_ACCOUNT_NUMBER'),
              '',
              6,
              false,
              true
            )}

            {renderAgreementFeeScheduleSelectField(
              'feeDTO',
              'CDL_AGREEMENT_FEE_SCHEDULE_FEE',
              'Fee',
              feeOptions,
              6,
              false,
              feeLoading
            )}
            {renderAgreementFeeScheduleSelectField(
              'feeTypeDTO',
              'CDL_AGREEMENT_FEE_SCHEDULE_FEE_TYPE',
              'Fee Type',
              feeTypeOptions,
              6,
              false,
              feeTypeLoading
            )}
            {renderAgreementFeeScheduleSelectField(
              'feesFrequencyDTO',
              'CDL_AGREEMENT_FEE_SCHEDULE_FEES_FREQUENCY',
              'Fees Frequency',
              feesFrequencyOptions,
              6,
              false,
              feesFrequencyLoading
            )}
            {renderAgreementFeeScheduleSelectField(
              'frequencyBasisDTO',
              'CDL_AGREEMENT_FEE_SCHEDULE_FREQUENCY_BASIS',
              'Frequency Basis',
              frequencyBasisOptions,
              6,
              false,
              frequencyBasisLoading
            )}
          
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  )
}

export default Step1

