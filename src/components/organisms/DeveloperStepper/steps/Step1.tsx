import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
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
  Typography,
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
import { getBuildPartnerLabel } from '../../../../constants/mappings/buildPartnerMapping'
import { useBuildPartnerLabelsWithCache } from '@/hooks/useBuildPartnerLabelsWithCache'
import { useAppStore } from '@/store'
import { BuildPartnerService } from '../../../../services/api/buildPartnerService'
import { developerIdService } from '../../../../services/api/developerIdService'
import { useDeveloperDropdownLabels } from '../../../../hooks/useDeveloperDropdowns'
import { getDeveloperDropdownLabel } from '../../../../constants/mappings/developerDropdownMapping'
import { validateDeveloperField } from '../../../../lib/validation/developerSchemas'
import {
  commonFieldStyles as sharedCommonFieldStyles,
  selectStyles as sharedSelectStyles,
  datePickerStyles as sharedDatePickerStyles,
  labelSx as sharedLabelSx,
  valueSx as sharedValueSx,
  calendarIconSx as sharedCalendarIconSx,
  cardStyles as sharedCardStyles,
  viewModeInputStyles,
  neutralBorder,
  neutralBorderHover,
} from '../styles'
import { alpha } from '@mui/material/styles'

interface Step1Props {
  isReadOnly?: boolean
  developerId?: string | undefined
}

const Step1 = ({ isReadOnly = false, developerId }: Step1Props) => {
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
    () => (sharedCardStyles as any)(theme),
    [theme]
  )
  const viewModeStyles = viewModeInputStyles(theme)
  const neutralBorderColor = neutralBorder(theme)
  const neutralBorderHoverColor = neutralBorderHover(theme)
  const focusBorder = theme.palette.primary.main
  // Check if we're in edit mode (existing developer)
  const isEditMode = !!developerId
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext()

  // State for developer ID generation
  const [generatedId, setGeneratedId] = useState<string>('')
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false)

  // Developer dropdown data
  const {
    regulatoryAuthorities,
    isLoading: dropdownsLoading,
    error: dropdownsError,
    getDisplayLabel,
  } = useDeveloperDropdownLabels()

  // Dynamic label support (Phase 1: foundation)
  const { data: buildPartnerLabels, getLabel } =
    useBuildPartnerLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  const getBuildPartnerLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getBuildPartnerLabel(configId)

      if (buildPartnerLabels) {
        return getLabel(configId, currentLanguage, fallback)
      }
      return fallback
    },
    [buildPartnerLabels, currentLanguage, getLabel]
  )

  // Initialize developer ID from form value
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'bpDeveloperId' && value.bpDeveloperId) {
        setGeneratedId(value.bpDeveloperId)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // Handle Fetch Details button click
  const handleFetchDetails = async () => {
    const currentCif = watch('bpCifrera')
    if (!currentCif) {
      return
    }

    try {
      const buildPartnerService = new BuildPartnerService()
      const customerDetails =
        await buildPartnerService.getCustomerDetailsByCif(currentCif)

      // Populate only the name fields from customer details and clear validation errors
      setValue('bpName', customerDetails.name.firstName, {
        shouldValidate: true,
        shouldDirty: true,
      })
      setValue('bpNameLocal', customerDetails.name.shortName, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } catch (error) {
      // You might want to show a user-friendly error message here
    }
  }

  // Function to generate new developer ID
  const handleGenerateNewId = async () => {
    try {
      setIsGeneratingId(true)
      const newIdResponse = developerIdService.generateNewId()
      setGeneratedId(newIdResponse.id)
      setValue('bpDeveloperId', newIdResponse.id, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } catch (error) {
      // Handle error silently
    } finally {
      setIsGeneratingId(false)
    }
  }

  // Prepopulate regulator in edit mode based on existing details
  useEffect(() => {
    if (!isEditMode || !developerId) return

    const currentId = watch('bpRegulatorDTO.id')
    if (currentId) return

    const loadExisting = async () => {
      try {
        const svc = new BuildPartnerService()
        const details = await svc.getBuildPartner(developerId)
        const regulatorId = (details as any)?.bpRegulatorDTO?.id
        if (regulatorId) {
          setValue('bpRegulatorDTO.id', regulatorId, {
            shouldValidate: true,
            shouldDirty: false,
          })
        }
      } catch {
        // ignore; leave empty if fetch fails
      }
    }

    loadExisting()
  }, [isEditMode, developerId, setValue, watch])

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
        defaultValue={defaultValue === undefined ? '' : defaultValue}
        rules={{
          required: required ? `${label} is required` : false,
          validate: (value: any) => validateDeveloperField(0, name, value),
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
            validate: (value: any) => {
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
              const validationResult = validateDeveloperField(0, name, value)
              // validateDeveloperField returns true if valid, or an error message string if invalid
              return validationResult
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
                    {getDisplayLabel(
                      option as any,
                      getDeveloperDropdownLabel(
                        (option as { configId?: string }).configId || ''
                      )
                    )}
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
                onChange={(e) => field.onChange(e.target.checked)}
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

  const renderDeveloperIdField = (
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
          ...(cardBaseStyles as any),
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
            {renderDeveloperIdField(
              'bpDeveloperId',
              getBuildPartnerLabelDynamic('CDL_BP_ID'),
              6,
              true
            )}
            {renderTextFieldWithButton(
              'bpCifrera',
              getBuildPartnerLabelDynamic('CDL_BP_CIF'),
              'Fetch Details',
              6,
              true
            )}
            {renderTextField(
              'bpDeveloperRegNo',
              getBuildPartnerLabelDynamic('CDL_BP_REGNO'),
              '',
              6,
              false,
              true
            )}
            {renderDatePickerField(
              'bpOnboardingDate',
              getBuildPartnerLabelDynamic('CDL_BP_REGDATE'),
              6,
              true
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="bpName"
                control={control}
                defaultValue=""
                rules={{
                  required: `${getBuildPartnerLabelDynamic('CDL_BP_NAME')} is required`,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={`${getBuildPartnerLabelDynamic('CDL_BP_NAME')}`}
                    fullWidth
                    required={true}
                    disabled={true}
                    error={!!errors['bpName']}
                    helperText={errors['bpName']?.message?.toString()}
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="bpNameLocal"
                control={control}
                defaultValue=""
                rules={{
                  required: `${getBuildPartnerLabelDynamic('CDL_BP_NAME_LOCALE')} is required`,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={`${getBuildPartnerLabelDynamic('CDL_BP_NAME_LOCALE')}`}
                    fullWidth
                    required={true}
                    disabled={true}
                    error={!!errors['bpNameLocal']}
                    helperText={errors['bpNameLocal']?.message?.toString()}
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
              'bpMasterName',
              getBuildPartnerLabelDynamic('CDL_BP_MASTER')
            )}
            {renderApiSelectField(
              'bpRegulatorDTO.id',
              getBuildPartnerLabelDynamic('CDL_BP_REGULATORY_AUTHORITY'),
              regulatoryAuthorities,
              6,
              dropdownsLoading,
              true
            )}
            {renderTextField(
              'bpContactAddress',
              getBuildPartnerLabelDynamic('CDL_BP_ADDRESS'),
              '',
              12,
              false,
              false
            )}
            {renderTextField(
              'bpMobile',
              getBuildPartnerLabelDynamic('CDL_BP_MOBILE'),
              '',
              4,
              false,
              false
            )}
            {renderTextField(
              'bpEmail',
              getBuildPartnerLabelDynamic('CDL_BP_EMAIL'),
              '',
              4,
              false,
              false
            )}
            {renderTextField(
              'bpFax',
              getBuildPartnerLabelDynamic('CDL_BP_FAX'),
              '',
              4,
              false,
              false
            )}
            {renderTextField(
              'bpLicenseNo',
              getBuildPartnerLabelDynamic('CDL_BP_LICENSE'),
              '',
              6,
              false,
              true
            )}
            {renderDatePickerField(
              'bpLicenseExpDate',
              getBuildPartnerLabelDynamic('CDL_BP_LICENSE_VALID'),
              6,
              true
            )}
            {renderCheckboxField(
              'bpWorldCheckFlag',
              getBuildPartnerLabelDynamic('CDL_BP_WORLD_STATUS'),
              3
            )}
            {renderCheckboxField('bpMigratedData', 'Migrated Data', 3)}
            {renderTextField(
              'bpWorldCheckRemarks',
              getBuildPartnerLabelDynamic('CDL_BP_WORLD_REMARKS')
            )}
            {renderTextField(
              'bpremark',
              getBuildPartnerLabelDynamic('CDL_BP_NOTES')
            )}
            {renderTextField('bpContactTel', 'Account Contact Number')}
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  )
}

export default Step1
