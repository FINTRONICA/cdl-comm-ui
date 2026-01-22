import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useTheme,
  type Theme,
} from '@mui/material'
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { Controller, useFormContext } from 'react-hook-form'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { getPartyLabel } from '@/constants/mappings/master/partyMapping'
import { usePartyLabelsWithCache } from '@/hooks/master/CustomerHook/usePartyLabelsWithCache'
import { useAppStore } from '@/store'
import { usePartyStepStatus } from '@/hooks/master/CustomerHook/useParty'
import { useApplicationSettings } from '@/hooks/useApplicationSettings'
import { useRoles } from '@/hooks/useRoles'
import { partyService } from '@/services/api/masterApi/Customer/partyService'
import {
  commonFieldStyles as sharedCommonFieldStyles,
  selectStyles as sharedSelectStyles,
  labelSx as sharedLabelSx,
  valueSx as sharedValueSx,
  cardStyles as sharedCardStyles,
  viewModeInputStyles,
  neutralBorder,
  neutralBorderHover,
} from '@/components/organisms/Master/styles'

interface Step1Props {
  isReadOnly?: boolean
  partyId?: string | undefined
}

const Step1 = ({ isReadOnly = false, partyId }: Step1Props) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const textPrimary = isDark ? '#FFFFFF' : '#1E2939'
  const textSecondary = isDark ? '#CBD5E1' : '#6B7280'
  const fieldStyles = React.useMemo(
    () => (sharedCommonFieldStyles as (theme: Theme) => Record<string, unknown>)(theme),
    [theme]
  )
  const selectFieldStyles = React.useMemo(
    () => (sharedSelectStyles as (theme: Theme) => Record<string, unknown>)(theme),
    [theme]
  )
  const labelStyles = React.useMemo(
    () => (sharedLabelSx as (theme: Theme) => Record<string, unknown>)(theme),
    [theme]
  )
  const valueStyles = React.useMemo(
    () => (sharedValueSx as (theme: Theme) => Record<string, unknown>)(theme),
    [theme]
  )
  const cardBaseStyles = React.useMemo(
    () => (sharedCardStyles as (theme: Theme) => Record<string, unknown>)(theme),
    [theme]
  )
  const viewModeStyles = (viewModeInputStyles as (theme: Theme) => Record<string, unknown>)(theme)
  const neutralBorderColor = (neutralBorder as (theme: Theme) => string)(theme)
  const neutralBorderHoverColor = (neutralBorderHover as (theme: Theme) => string)(theme)
  const focusBorder = theme.palette.primary.main
  // Check if we're in edit mode (existing developer)
  const isEditMode = !!partyId
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext()

  // State for developer ID generation
  const [generatedId, setGeneratedId] = useState<string>('')
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false)

  // Dynamic label support (Phase 1: foundation)
  const { data: partyLabels, getLabel } = usePartyLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  // Dropdown data (matching Beneficiary Step1 pattern)
  const { data: partyConstituents = [], loading: partyConstituentsLoading } =
    useApplicationSettings('PARTY_CONSTITUENT')
  const { data: rolesData, isLoading: rolesLoading } = useRoles(0, 999)

  const partyConstituentOptions = useMemo(
    () =>
      partyConstituents.map((item) => ({
        id: item.id,
        settingValue: item.settingValue,
        displayName: item.displayName,
      })),
    [partyConstituents]
  )

  const roleOptions = useMemo(() => {
    if (!rolesData || !Array.isArray(rolesData)) return []
    return rolesData.map((role) => ({
      id: role.id,
      settingValue: String(role.id),
      displayName: role.name || `Role ${role.id}`,
    }))
  }, [rolesData])

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

  // Initialize party ID from form value
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
    const currentCif = watch('partyCifNumber')
    if (!currentCif || !currentCif.trim()) {
      return
    }

    try {
      await partyService.getCustomerDetailsByCif(currentCif.trim())
    } catch {
      // Silently handle errors
    }
  }

  // Function to generate new developer ID
  const handleGenerateNewId = async () => {
    try {
      setIsGeneratingId(true)
      // Generate a temporary ID - in production this would come from the API
      const tempId = `PARTY-${Date.now()}`
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

  // Use React Query hook to get party data - prevents duplicate API calls
  const { data: stepStatus } = usePartyStepStatus(partyId || '')

  // Prepopulate dropdowns in edit mode based on existing details
  // This ensures dropdown fields are populated when editing existing party
  useEffect(() => {
    if (!isEditMode || !partyId) return

    // Use data from React Query hook instead of making direct API call
    const details = stepStatus?.stepData?.step1
    if (!details) return

    // Load partyConstituentDTO if available (matching Beneficiary Step1 pattern)
    if (details.partyConstituentDTO && typeof details.partyConstituentDTO === 'object' && 'id' in details.partyConstituentDTO) {
      const constituentId = (details.partyConstituentDTO as { id?: number }).id
      if (constituentId) {
        setValue('partyConstituentDTO', { id: constituentId }, {
          shouldValidate: true,
          shouldDirty: false,
        })
      }
    }
    // Load roleDTO if available
    if (details.roleDTO && typeof details.roleDTO === 'object' && 'id' in details.roleDTO) {
      const roleId = (details.roleDTO as { id?: number }).id
      if (roleId) {
        setValue('roleDTO', { id: roleId }, {
          shouldValidate: true,
          shouldDirty: false,
        })
      }
    }
    // Load taskStatusDTO if available
    if (details.taskStatusDTO && typeof details.taskStatusDTO === 'object' && 'id' in details.taskStatusDTO) {
      const taskStatusId = (details.taskStatusDTO as { id?: number }).id
      if (taskStatusId) {
        setValue('taskStatusDTO.id', taskStatusId, {
          shouldValidate: true,
          shouldDirty: false,
        })
      }
    }
  }, [isEditMode, partyId, setValue, stepStatus?.stepData?.step1])

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
                ...(isReadOnly && {
                  color: textSecondary,
                }),
              },
            }}
            sx={{
              ...(fieldStyles as Record<string, unknown>),
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
            } as Record<string, unknown>}
          />
        )}
      />
    </Grid>
  )

  const renderApiSelectField = (
    name: string,
    configId: string,
    fallbackLabel: string,
    options: { id: string | number; displayName: string; settingValue: string }[],
    gridMd: number = 6,
    required = false,
    loading = false
  ) => {
    const label = getPartyLabelDynamic(configId) || fallbackLabel
    return (
      <Grid key={name} size={{ xs: 12, md: gridMd }}>
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
                      border: `2px solid ${focusBorder}`,
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
                value={
                  typeof field.value === 'object' && field.value?.id !== undefined
                    ? options.find(
                        (opt) => String(opt.id) === String(field.value.id)
                      )?.settingValue || ''
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
              ...(fieldStyles as Record<string, unknown>),
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
            } as Record<string, unknown>}
          />
        )}
      />
    </Grid>
  )

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
              ...(fieldStyles as Record<string, unknown>),
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
            } as Record<string, unknown>}
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
            {renderPartyIdField(
              'id',
              getPartyLabelDynamic('CDL_MP_PARTY_ID'),
              6,
              true
            )}
            {renderTextFieldWithButton(
              'partyCifNumber',
              getPartyLabelDynamic('CDL_MP_PARTY_CIF_NUMBER'),
              'Fetch Details',
              6,
              true
            )}
            {renderTextField(
              'partyFullName',
              getPartyLabelDynamic('CDL_MP_PARTY_NAME'),
              '',
              6,
              false,
              true
            )} 
            {renderTextField(
              'emailAddress',
              getPartyLabelDynamic('CDL_MP_PARTY_EMAIL'),
              '',
              6,
              false,
              false
            )}
             {renderTextField(
              'telephoneNumber',
              getPartyLabelDynamic('CDL_MP_PARTY_TELEPHONE_NO'),
              '',
              6,
              false,
              false
            )}
            {renderTextField(
              'mobileNumber',
              getPartyLabelDynamic('CDL_MP_PARTY_MOBILE_NO'),
              '',
              6,
              false,
              false
            )}
            {renderApiSelectField(
              'partyConstituentDTO',
              'CDL_MP_PARTY_CONSTITUENT_DTO',
              getPartyLabel('CDL_MP_PARTY_CONSTITUENT_DTO'),
              partyConstituentOptions,
              6,
              false,
              partyConstituentsLoading
            )}
            {renderApiSelectField(
              'roleDTO',
              'CDL_MP_PARTY_ROLE_DTO',
              getPartyLabel('CDL_MP_PARTY_ROLE_DTO'),
              roleOptions,
              6,
              false,
              rolesLoading
            )}
            {renderTextField(
              'addressLine1',
              getPartyLabelDynamic('CDL_MP_PARTY_ADDRESS_1'),
              '',
              4,
              false,
              true
            )}
            {renderTextField(
              'addressLine2',
              getPartyLabelDynamic('CDL_MP_PARTY_ADDRESS_2'),
              '',
              4,
              false,
              true
            )}
            {renderTextField(
              'addressLine3',
              getPartyLabelDynamic('CDL_MP_PARTY_ADDRESS_3'),
              '',
              4,
              false,
              true
            )}
           
           {renderTextField(
              'assistantRelationshipManagerName',
              getPartyLabelDynamic('CDL_MP_PARTY_ARM_NAME'),
              '',
              6,
              false,
              false
            )}
              {renderTextField(
              'relationshipManagerName',
              getPartyLabelDynamic('CDL_MP_PARTY_RM_NAME'),
              '',
              6,
              false,
              false
            )}

            {renderTextField(
              'bankIdentifier',
              getPartyLabelDynamic('CDL_MP_PARTY_BANK_IDENTIFIER'),
              '',
              6,
              false,
              false
            )}
            {renderTextField(
              'passportIdentificationDetails',
              getPartyLabelDynamic(
                'CDL_MP_PARTY_PASSPORT_IDENTIFICATION_DETAILS'
              ),
              '',
              6,
              false,
              false
            )}
            {renderTextField(
              'projectAccountOwnerName',
              getPartyLabelDynamic('CDL_MP_PARTY_PROJECT_ACCOUNT_OWNER_NAME'),
              '',
              6,
              false,
              false
            )} {renderTextField(
              'backupProjectAccountOwnerName',
              getPartyLabelDynamic(
                'CDL_MP_PARTY_BACKUP_PROJECT_ACCOUNT_OWNER_NAME'
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
              getPartyLabelDynamic('CDL_MP_PARTY_REMARKS'),
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
