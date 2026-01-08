import React, { useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  useTheme,
  SxProps,
  Theme,
} from '@mui/material'
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { Controller, useFormContext } from 'react-hook-form'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import { getAgreementFeeScheduleLabel } from '@/constants/mappings/master/Entity/agreementFeeScheduleMapping'
import { useAgreementFeeScheduleLabelsWithCache } from '@/hooks'
import { useAppStore } from '@/store'
import { agreementFeeScheduleService } from '@/services/api/masterApi/Entitie/agreementFeeScheduleService'
import { validateAgreementFeeScheduleField } from '@/lib/validation/masterValidation/agreementFeeScheduleSchemas'
import { useFeeCategories, useFeeFrequencies } from '@/hooks/useFeeDropdowns'
import { useAllAgreementTypes } from '@/hooks/master/CustomerHook/useAgreementType'
import { useAgreementSubTypes } from '@/hooks/master/CustomerHook/useAgreementSubType'
import { useAllProductPrograms } from '@/hooks/master/CustomerHook/useProductProgram'
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
  const { data: feeCategories = [], isLoading: feeCategoriesLoading } = useFeeCategories()
  const { data: feeFrequencies = [], isLoading: feeFrequenciesLoading } = useFeeFrequencies()
  const { data: agreementTypes = [], isLoading: agreementTypesLoading } = useAllAgreementTypes()
  const { data: agreementSubTypesResponse, isLoading: agreementSubTypesLoading } = useAgreementSubTypes(0, 1000)
  const { data: productPrograms = [], isLoading: productProgramsLoading } = useAllProductPrograms()

  const agreementSubTypes = agreementSubTypesResponse?.content || []

  // Helper to get display label for dropdown options
  const getDisplayLabel = useCallback((option: {
    settingValue?: string
    agreementTypeName?: string
    subTypeName?: string
    programName?: string
    configValue?: string
    name?: string
    id?: number | string
  } | null | undefined, fallback?: string): string => {
    if (!option) return fallback || ''
    if (option.settingValue) return option.settingValue
    if (option.agreementTypeName) return option.agreementTypeName
    if (option.subTypeName) return option.subTypeName
    if (option.programName) return option.programName
    if (option.configValue) return option.configValue
    if (option.name) return option.name
    return fallback || String(option.id || '')
  }, [])

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
          if (agreementFeeSchedule.feeDTO?.id) {
            setValue('feeDTO', agreementFeeSchedule.feeDTO.id, {
              shouldValidate: true,
              shouldDirty: false,
            })
          }
          if (agreementFeeSchedule.feeTypeDTO?.id) {
            setValue('feeTypeDTO', agreementFeeSchedule.feeTypeDTO.id, {
              shouldValidate: true,
              shouldDirty: false,
            })
          }
          if (agreementFeeSchedule.feesFrequencyDTO?.id) {
            setValue('feesFrequencyDTO', agreementFeeSchedule.feesFrequencyDTO.id, {
              shouldValidate: true,
              shouldDirty: false,
            })
          }
          if (agreementFeeSchedule.frequencyBasisDTO?.id) {
            setValue('frequencyBasisDTO', agreementFeeSchedule.frequencyBasisDTO.id, {
              shouldValidate: true,
              shouldDirty: false,
            })
          }
          if (agreementFeeSchedule.agreementTypeDTO?.id) {
            setValue('agreementTypeDTO', agreementFeeSchedule.agreementTypeDTO.id, {
              shouldValidate: true,
              shouldDirty: false,
            })
          }
          if (agreementFeeSchedule.agreementSubTypeDTO?.id) {
            setValue('agreementSubTypeDTO', agreementFeeSchedule.agreementSubTypeDTO.id, {
              shouldValidate: true,
              shouldDirty: false,
            })
          }
          if (agreementFeeSchedule.productProgramDTO?.id) {
            setValue('productProgramDTO', agreementFeeSchedule.productProgramDTO.id, {
              shouldValidate: true,
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

  const renderSelectField = (
    name: string,
    label: string,
    options: Array<{
      id?: number | string
      settingValue?: string
      agreementTypeName?: string
      subTypeName?: string
      programName?: string
      configValue?: string
      name?: string
      [key: string]: unknown
    }>,
    gridSize: number = 6,
    loading = false,
    required = false
  ) => (
    <Grid key={`field-${name}`} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `${label} is required` : false,
          validate: (value: unknown) => validateAgreementFeeScheduleField(0, name, value),
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
                ...(typeof selectFieldStyles === 'object' ? selectFieldStyles : {}),
                ...(typeof valueStyles === 'object' ? valueStyles : {}),
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
              } as SxProps<Theme>}
            >
              {options.map((option, index) => {
                const optionId = option.id || option.uuid || index
                const optionValue = String(option.id || option.uuid || '')
                return (
                  <MenuItem key={optionId} value={optionValue}>
                    {getDisplayLabel(option, optionValue)}
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
            {renderSelectField(
              'feeDTO',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_FEE'),
              feeCategories,
              6,
              feeCategoriesLoading,
              false
            )}
            {renderSelectField(
              'feeTypeDTO',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_FEE_TYPE'),
              feeCategories, // Using feeCategories as placeholder - TODO: Add specific hook/service
              6,
              feeCategoriesLoading,
              false
            )}
            {renderSelectField(
              'feesFrequencyDTO',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_FEES_FREQUENCY'),
              feeFrequencies,
              6,
              feeFrequenciesLoading,
              false
            )}
            {renderSelectField(
              'frequencyBasisDTO',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_FREQUENCY_BASIS'),
              feeFrequencies, // Using feeFrequencies as placeholder - TODO: Add specific hook/service
              6,
              feeFrequenciesLoading,
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
            {renderSelectField(
              'agreementTypeDTO',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_DEAL_TYPE'),
              agreementTypes,
              6,
              agreementTypesLoading,
              false
            )}
            {renderSelectField(
              'agreementSubTypeDTO',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_DEAL_SUB_TYPE'),
              agreementSubTypes,
              6,
              agreementSubTypesLoading,
              false
            )}
            {renderSelectField(
              'productProgramDTO',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_PRODUCT_PROGRAMME'),
              productPrograms,
              6,
              productProgramsLoading,
              false
            )}
            {renderTextField(
              'priorityLevel',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_DEAL_PRIORITY'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'transactionRateAmount',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_AMOUNT_RATE_PER_TRANSACTION'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'debitAccountNumber',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_DEBIT_ACCOUNT'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'creditAccountNumber',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_CREDIT_TO_ACCOUNT'),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'escrowAgreementDTO',
              getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_ESCROW_AGREEMENT'),
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

