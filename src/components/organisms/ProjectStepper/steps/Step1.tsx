'use client'

import React from 'react'
import {
  Box,
  Button,
  Typography,
  TextField,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  InputAdornment,
  Autocomplete,
  Paper,
  useTheme,
  alpha,
} from '@mui/material'

import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useFormContext, Controller } from 'react-hook-form'
import { ProjectDetailsData } from '../types'
// import { useProjectLabels } from '@/hooks/useProjectLabels'
// import { useBuildPartnerAssetLabels } from '@/hooks/useBuildPartnerAssetLabels'
import { useBuildPartnerAssetLabelsWithUtils } from '@/hooks/useBuildPartnerAssetLabels'
import { useBuildPartners } from '@/hooks/useBuildPartners'
import {
  useProjectTypes,
  useProjectStatuses,
  useProjectCurrencies,
  useBankAccountStatuses,
  useBlockedPaymentTypes,
} from '@/hooks/useProjectDropdowns'
import { idService } from '@/services/api/developerIdService'
import {
  commonFieldStyles,
  selectStyles,
  errorFieldStyles,
  datePickerStyles,
  labelSx,
  valueSx,
  cardStyles,
  calendarIconSx,
} from '../styles'
import {
  step1ValidationSchema,
  validateStep1Field,
} from '../validation/step1ZodSchema'

interface Step1Props {
  initialData?: Partial<ProjectDetailsData>
  isViewMode?: boolean
  projectId?: string | undefined
}

const Step1: React.FC<Step1Props> = React.memo(
  ({ initialData, isViewMode = false, projectId }) => {
    const theme = useTheme()
    const {
      control,
      watch,
      setValue,
      getValues,
      setError,
      trigger,
      formState: { errors },
    } = useFormContext<ProjectDetailsData>()
    const [isGeneratingReaId, setIsGeneratingReaId] = React.useState(false)

    // Check if we're in edit mode (editing existing project)
    const isEditMode = React.useMemo(() => !!projectId, [projectId])

    // Phase 2: Use our new label utility hook
    // const { getLabel, hasError } = useProjectLabels()
    /**
     * TODO Delete this variable hasError
     */
    const hasError = false
    const { getLabel } = useBuildPartnerAssetLabelsWithUtils()
    const language = 'EN'
    const { data: developersData, isLoading: isDevelopersLoading } =
      useBuildPartners(0, 100)

    const { data: projectTypesData, isLoading: isProjectTypesLoading } =
      useProjectTypes()

    const { data: projectStatusesData, isLoading: isProjectStatusesLoading } =
      useProjectStatuses()

    const {
      data: projectCurrenciesData,
      isLoading: isProjectCurrenciesLoading,
    } = useProjectCurrencies()

    const {
      data: bankAccountStatusesData,
      isLoading: isBankAccountStatusesLoading,
    } = useBankAccountStatuses()

    const {
      data: blockedPaymentTypesData,
      isLoading: isBlockedPaymentTypesLoading,
    } = useBlockedPaymentTypes()

    const handleDeveloperChange = (selectedCif: string) => {
      const selectedDeveloper = developersData?.content?.find(
        (dev) => dev.bpCifrera === selectedCif
      )

      if (selectedDeveloper) {
        // Check if this is a "No CIF - No Name" entry
        const isNoCif =
          !selectedCif ||
          selectedCif.trim() === '' ||
          selectedCif.toLowerCase().includes('no cif') ||
          !selectedDeveloper.bpCifrera ||
          selectedDeveloper.bpCifrera.trim() === ''

        if (isNoCif) {
          // Clear all auto-filled fields for "No CIF - No Name" entries
          setValue('buildPartnerDTO.id', null as any)
          setValue('buildPartnerDTO.bpCifrera', '')
          setValue('buildPartnerDTO.bpName', '')
          setValue('buildPartnerDTO.bpMasterName', '')
        } else {
          // Populate fields normally for valid CIF entries
          setValue('buildPartnerDTO.id', selectedDeveloper.id)
          setValue('buildPartnerDTO.bpCifrera', selectedCif)
          setValue('buildPartnerDTO.bpName', selectedDeveloper.bpName || '')

          // Set Master Build Partner Asset Name from bpMasterName
          if (!getValues('buildPartnerDTO.bpMasterName')) {
            setValue(
              'buildPartnerDTO.bpMasterName',
              selectedDeveloper.bpMasterName || ''
            )
          }
        }
      } else {
        // If no developer found, clear all fields
        setValue('buildPartnerDTO.id', null as any)
        setValue('buildPartnerDTO.bpCifrera', '')
        setValue('buildPartnerDTO.bpName', '')
        setValue('buildPartnerDTO.bpMasterName', '')
      }
    }

    const buildPartnerId = watch('buildPartnerDTO.id')

    const setReaCifFromBuildPartnerId = React.useCallback(() => {
      const currentBuildPartnerId =
        buildPartnerId || getValues('buildPartnerDTO.id')

      const developersList = (developersData as any)?.content || []

      if (currentBuildPartnerId && developersList.length > 0) {
        const normalizedId =
          typeof currentBuildPartnerId === 'string'
            ? parseInt(currentBuildPartnerId, 10)
            : Number(currentBuildPartnerId)

        const matchingDeveloper = developersList.find((dev: any) => {
          const devId =
            typeof dev.id === 'string' ? parseInt(dev.id, 10) : Number(dev.id)
          return devId === normalizedId
        })

        if (matchingDeveloper?.bpCifrera) {
          const currentBpCifrera = getValues('buildPartnerDTO.bpCifrera')

          if (
            !currentBpCifrera ||
            currentBpCifrera === '' ||
            currentBpCifrera !== matchingDeveloper.bpCifrera
          ) {
            const valueToSet = String(matchingDeveloper.bpCifrera || '')

            setValue('buildPartnerDTO.bpCifrera', valueToSet, {
              shouldValidate: false,
              shouldDirty: false,
              shouldTouch: false,
            })

            if (matchingDeveloper.bpName) {
              setValue('buildPartnerDTO.bpName', matchingDeveloper.bpName, {
                shouldValidate: false,
                shouldDirty: false,
              })
            }
          }
        }
      }
    }, [buildPartnerId, developersData, setValue, getValues])

    const buildPartnerOptions = React.useMemo(() => {
      const developersList = (developersData as any)?.content || []

      if (!developersList || developersList.length === 0) {
        return []
      }

      const seen = new Set<number>()
      const options: Array<{
        value: string
        label: string
        buildPartner: any
      }> = []

      for (const developer of developersList) {
        if (
          !developer ||
          !developer.id ||
          (!developer.bpCifrera && !developer.bpName)
        ) {
          continue
        }

        if (seen.has(developer.id)) {
          continue
        }
        seen.add(developer.id)

        const displayLabel = `${developer.bpCifrera || 'No CIF'} - ${developer.bpName || 'No Name'}`

        options.push({
          value: developer.bpCifrera || '',
          label: displayLabel,
          buildPartner: developer,
        })
      }

      return options
    }, [developersData])

    const sanitizedData = React.useMemo(() => {
      if (!projectId || !initialData) return {}
      return initialData
    }, [initialData, projectId])
    React.useEffect(() => {
      if (typeof window !== 'undefined') {
        ;(window as any).step1Validation = async () => {
          const formData = getValues()
          const result = step1ValidationSchema.safeParse(formData)

          if (!result.success) {
            // Set errors in the form
            const errors: Record<string, any> = {}
            result.error.issues.forEach((err: any) => {
              const path = err.path.join('.')
              errors[path] = { message: err.message }
            })
            setError('root', { message: 'Validation failed' })
            Object.keys(errors).forEach((key) => {
              setError(key as any, { message: errors[key].message })
            })
            return { isValid: false, errors }
          }

          return { isValid: true, errors: {} }
        }
      }
    }, [getValues, setError])

    // Function to generate new REA ID
    const handleGenerateReaId = async () => {
      try {
        setIsGeneratingReaId(true)
        const newIdResponse = idService.generateNewId('REA')
        setValue('reaId', newIdResponse.id)
        // Trigger validation to clear any existing errors
        await trigger('reaId')
      } catch (error) {
      } finally {
        setIsGeneratingReaId(false)
      }
    }

    const retention = watch('reaRetentionPercent')
    const additionalRetention = watch('reaAdditionalRetentionPercent')
    React.useEffect(() => {
      // Only calculate if at least one retention value is provided
      const retentionStr = String(retention || '').trim()
      const additionalRetentionStr = String(additionalRetention || '').trim()

      // If both are empty, clear the aggregate retention field
      if (!retentionStr && !additionalRetentionStr) {
        setValue('reaTotalRetentionPercent', '')
        return
      }

      const retentionNum = parseFloat(retentionStr) || 0
      const additionalRetentionNum = parseFloat(additionalRetentionStr) || 0
      const total = retentionNum + additionalRetentionNum

      // Only set if there's an actual value to calculate
      if (total > 0) {
        setValue('reaTotalRetentionPercent', total.toFixed(2))
      } else {
        setValue('reaTotalRetentionPercent', '')
      }
    }, [retention, additionalRetention, setValue])

    React.useEffect(() => {
      const developersList = (developersData as any)?.content || []
      const currentBuildPartnerId =
        buildPartnerId || getValues('buildPartnerDTO.id')
      const currentBpCifrera = getValues('buildPartnerDTO.bpCifrera')

      if (
        developersList.length > 0 &&
        currentBuildPartnerId &&
        (!currentBpCifrera || currentBpCifrera === '')
      ) {
        const timeoutId = setTimeout(() => {
          setReaCifFromBuildPartnerId()

          setTimeout(() => {
            const afterSet = getValues('buildPartnerDTO.bpCifrera')
            if (!afterSet || afterSet === '') {
              setReaCifFromBuildPartnerId()
            }
          }, 200)
        }, 300)

        return () => {
          clearTimeout(timeoutId)
        }
      }
      return undefined
    }, [developersData, buildPartnerId, setReaCifFromBuildPartnerId, getValues])

    React.useEffect(() => {
      const currentBuildPartnerId = buildPartnerId
      const currentBpCifrera = getValues('buildPartnerDTO.bpCifrera')
      const developersList = (developersData as any)?.content || []

      if (
        currentBuildPartnerId &&
        (!currentBpCifrera || currentBpCifrera === '') &&
        developersList.length > 0
      ) {
        const timeoutId = setTimeout(() => {
          setReaCifFromBuildPartnerId()
        }, 500)

        return () => clearTimeout(timeoutId)
      }
      return undefined
    }, [buildPartnerId, developersData, setReaCifFromBuildPartnerId, getValues])

    const StyledCalendarIcon = (
      props: React.ComponentProps<typeof CalendarTodayOutlinedIcon>
    ) => <CalendarTodayOutlinedIcon {...props} sx={calendarIconSx(theme)} />

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Card sx={cardStyles(theme)}>
          <CardContent>
            {/* Phase 4: Simple loading and error states */}

            {hasError && (
              <Box
                sx={{
                  mb: 2,
                  p: 1,
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.error.main, 0.15)
                      : '#fef2f2',
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.error.main}`,
                }}
              >
                <Typography variant="body2" color="error">
                  Labels loading failed, using fallbacks
                </Typography>
              </Box>
            )}

            <Grid container rowSpacing={4} columnSpacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="reaId"
                  control={control}
                  {...(sanitizedData?.reaId !== undefined && {
                    defaultValue: sanitizedData.reaId,
                  })}
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field('reaId', value),
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isGeneratingReaId || isViewMode || isEditMode}
                      label={getLabel(
                        'CDL_BPA_REFID',
                        language,
                        'System Reference ID'
                      )}
                      error={!!errors.reaId}
                      helperText={errors.reaId?.message}
                      required={true}
                      InputLabelProps={{
                        sx: labelSx(theme),
                        shrink: !!field.value,
                      }}
                      InputProps={{
                        sx: valueSx(theme),
                        endAdornment: (
                          <InputAdornment position="end" sx={{ mr: 0 }}>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<RefreshIcon />}
                              onClick={handleGenerateReaId}
                              disabled={
                                isGeneratingReaId || isViewMode || isEditMode
                              }
                              sx={{
                                color: '#FFFFFF',
                                borderRadius: '8px',
                                textTransform: 'none',
                                background: '#2563EB',
                                '&:hover': {
                                  background: '#1D4ED8',
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
                              {isGeneratingReaId
                                ? 'Generating...'
                                : 'Generate ID'}
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                      sx={
                        errors.reaId
                          ? (errorFieldStyles as any)(theme)
                          : (commonFieldStyles as any)(theme)
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="buildPartnerDTO.bpCifrera"
                  control={control}
                  {...(sanitizedData?.buildPartnerDTO?.bpCifrera !==
                    undefined && {
                    defaultValue: sanitizedData.buildPartnerDTO.bpCifrera,
                  })}
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field('buildPartnerDTO.bpCifrera', value),
                  }}
                  render={({ field }) => {
                    // Find the selected option by matching bpCifrera value
                    const currentBpCifrera = field.value
                    const currentBuildPartnerId = watch('buildPartnerDTO.id')

                    // Find the selected option - prioritize exact CIF match
                    const selectedOption =
                      buildPartnerOptions.find((opt) => {
                        // First priority: match by bpCifrera value
                        if (
                          currentBpCifrera &&
                          opt.value === currentBpCifrera
                        ) {
                          return true
                        }
                        // Second priority: match by ID if available
                        if (
                          currentBuildPartnerId &&
                          opt.buildPartner?.id === currentBuildPartnerId
                        ) {
                          return true
                        }
                        return false
                      }) || null

                    return (
                      <Autocomplete
                        key={`autocomplete-${currentBpCifrera || currentBuildPartnerId || 'empty'}`}
                        value={selectedOption}
                        onChange={(_event, newValue) => {
                          if (newValue) {
                            const bpCifrera = newValue.value || ''
                            const partnerId = newValue.buildPartner?.id

                            field.onChange(bpCifrera)

                            setValue('buildPartnerDTO.id', partnerId, {
                              shouldDirty: true,
                              shouldTouch: false,
                            })

                            handleDeveloperChange(bpCifrera)

                            trigger('buildPartnerDTO.bpCifrera')
                            trigger('buildPartnerDTO.id')
                          } else {
                            field.onChange('')
                            setValue('buildPartnerDTO.id', null as any, {
                              shouldDirty: true,
                              shouldTouch: false,
                            })
                            setValue('buildPartnerDTO.bpName', '', {
                              shouldDirty: true,
                              shouldTouch: false,
                            })
                            setValue('buildPartnerDTO.bpMasterName', '', {
                              shouldDirty: true,
                              shouldTouch: false,
                            })
                          }
                        }}
                        options={buildPartnerOptions}
                        getOptionLabel={(option) => option.label || ''}
                        isOptionEqualToValue={(option, value) => {
                          if (!option || !value) return false
                          if (
                            option.value &&
                            value.value &&
                            option.value === value.value
                          ) {
                            return true
                          }
                          if (
                            option.buildPartner?.id &&
                            value.buildPartner?.id &&
                            option.buildPartner.id === value.buildPartner.id
                          ) {
                            return true
                          }
                          return false
                        }}
                        renderOption={(props, option) => (
                          <li
                            {...props}
                            key={option.buildPartner?.id || option.value}
                          >
                            {option.label}
                          </li>
                        )}
                        loading={isDevelopersLoading}
                        disabled={isViewMode || isDevelopersLoading}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={getLabel(
                              'CDL_BPA_BP_CIF',
                              language,
                              'Build Partner Asset CIF/Name'
                            )}
                            error={!!errors.buildPartnerDTO?.bpCifrera}
                            helperText={
                              errors.buildPartnerDTO?.bpCifrera?.message
                            }
                            required={!isViewMode}
                            size="medium"
                            InputLabelProps={{ sx: (labelSx as any)(theme) }}
                            InputProps={{
                              ...params.InputProps,
                              sx: (valueSx as any)(theme),
                            }}
                            sx={
                              errors.buildPartnerDTO?.bpCifrera
                                ? (errorFieldStyles as any)(theme)
                                : (commonFieldStyles as any)(theme)
                            }
                          />
                        )}
                        PaperComponent={({ children, ...props }: any) => (
                          <Paper
                            {...props}
                            sx={{
                              borderRadius: '12px',
                              boxShadow:
                                theme.palette.mode === 'dark'
                                  ? '0 10px 25px rgba(0, 0, 0, 0.5)'
                                  : '0 10px 25px rgba(0, 0, 0, 0.1)',
                              border:
                                theme.palette.mode === 'dark'
                                  ? `1px solid ${alpha('#FFFFFF', 0.2)}`
                                  : '1px solid #E5E7EB',
                              backgroundColor:
                                theme.palette.mode === 'dark'
                                  ? alpha(theme.palette.background.paper, 0.95)
                                  : '#FFFFFF',
                              marginTop: '8px',
                              maxHeight: '300px',
                            }}
                          >
                            {children}
                          </Paper>
                        )}
                        sx={
                          {
                            '& .MuiAutocomplete-inputRoot': {
                              ...(selectStyles(theme) as any),
                              '& .MuiOutlinedInput-notchedOutline': {
                                border: errors.buildPartnerDTO?.bpCifrera
                                  ? `1px solid ${theme.palette.error.main}`
                                  : theme.palette.mode === 'dark'
                                    ? `1px solid ${alpha('#FFFFFF', 0.3)}`
                                    : '1px solid #d1d5db',
                                borderRadius: '6px',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                border: errors.buildPartnerDTO?.bpCifrera
                                  ? `1px solid ${theme.palette.error.main}`
                                  : theme.palette.mode === 'dark'
                                    ? `1px solid ${alpha('#FFFFFF', 0.5)}`
                                    : '1px solid #9ca3af',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                                {
                                  border: errors.buildPartnerDTO?.bpCifrera
                                    ? `2px solid ${theme.palette.error.main}`
                                    : `2px solid ${theme.palette.primary.main}`,
                                },
                            },
                          } as any
                        }
                      />
                    )
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="buildPartnerDTO.bpCifrera"
                  control={control}
                  {...(sanitizedData?.buildPartnerDTO?.bpCifrera !==
                    undefined && {
                    defaultValue: sanitizedData.buildPartnerDTO.bpCifrera,
                  })}
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field('buildPartnerDTO.bpCifrera', value),
                  }}
                  render={({ field }) => {
                    return (
                      <TextField
                        {...field}
                        value={field.value || ''}
                        fullWidth
                        disabled={true}
                        label={getLabel(
                          'CDL_BPA_BP_ID',
                          language,
                          'Build Partner Assest ID (RERA)121212'
                        )}
                        required={true}
                        InputLabelProps={{
                          sx: labelSx(theme),
                          shrink: !!field.value,
                        }}
                        InputProps={{ sx: valueSx(theme) }}
                        sx={(commonFieldStyles as any)(theme)}
                        helperText="Auto-filled when Build Partner Assest is selected"
                      />
                    )
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="buildPartnerDTO.bpName"
                  control={control}
                  {...(sanitizedData?.buildPartnerDTO?.bpName !== undefined && {
                    defaultValue: sanitizedData.buildPartnerDTO.bpName,
                  })}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value || ''}
                      fullWidth
                      disabled={true}
                      label={getLabel(
                        'CDL_BPA_BP_NAME',
                        language,
                        'Build Partner Assest Name 123323'
                      )}
                      required={true}
                      InputLabelProps={{
                        sx: labelSx(theme),
                        shrink: !!field.value,
                      }}
                      InputProps={{ sx: valueSx(theme) }}
                      sx={(commonFieldStyles as any)(theme)}
                      helperText="Auto-filled when Build Partner Assest is selected"
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="buildPartnerDTO.bpMasterName"
                  control={control}
                  defaultValue={
                    sanitizedData?.buildPartnerDTO?.bpMasterName || ''
                  }
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field('buildPartnerDTO.bpMasterName', value),
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value || ''}
                      fullWidth
                      disabled={true}
                      label={getLabel(
                        'CDL_BPA_BPA_NAME',
                        language,
                        'Master Build Partner Assest Name'
                      )}
                      error={!!errors.buildPartnerDTO?.bpMasterName}
                      helperText={
                        errors.buildPartnerDTO?.bpMasterName?.message ||
                        'Auto-filled when Build Partner Assest is selected'
                      }
                      InputLabelProps={{
                        sx: labelSx(theme),
                        shrink: !!field.value,
                      }}
                      InputProps={{ sx: valueSx(theme) }}
                      sx={
                        errors.buildPartnerDTO?.bpMasterName
                          ? errorFieldStyles(theme)
                          : commonFieldStyles
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="reaReraNumber"
                  control={control}
                  {...(sanitizedData?.reaReraNumber !== undefined && {
                    defaultValue: sanitizedData.reaReraNumber,
                  })}
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field('reaReraNumber', value),
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode || isEditMode}
                      label={getLabel(
                        'CDL_BPA_REGNO',
                        language,
                        'Project RERA Number'
                      )}
                      required={true}
                      error={!!errors.reaReraNumber}
                      helperText={errors.reaReraNumber?.message}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={
                        errors.reaReraNumber
                          ? errorFieldStyles
                          : commonFieldStyles
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="reaName"
                  control={control}
                  {...(sanitizedData?.reaName !== undefined && {
                    defaultValue: sanitizedData.reaName,
                  })}
                  rules={{
                    validate: (value: any) => {
                      const result = validateStep1Field('reaName', value)
                      return result
                    },
                  }}
                  render={({ field }) => {
                    const hasError = !!errors.reaName
                    return (
                      <TextField
                        {...field}
                        fullWidth
                        disabled={isViewMode}
                        label={getLabel('CDL_BPA_NAME', language, 'Asset Name')}
                        error={hasError}
                        helperText={errors.reaName?.message}
                        required={true}
                        InputLabelProps={{ sx: labelSx }}
                        InputProps={{ sx: valueSx(theme) }}
                        sx={
                          hasError
                            ? errorFieldStyles(theme)
                            : commonFieldStyles(theme)
                        }
                      />
                    )
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="reaTypeDTO.id"
                  control={control}
                  {...(sanitizedData?.reaTypeDTO?.id !== undefined && {
                    defaultValue: sanitizedData.reaTypeDTO.id,
                  })}
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field('reaTypeDTO.id', value),
                  }}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={!!errors.reaTypeDTO?.id}
                      required
                    >
                      <InputLabel sx={labelSx(theme)}>
                        {getLabel('CDL_BPA_TYPE', language, 'Asset Type')}
                      </InputLabel>
                      <Select
                        {...field}
                        value={field.value || ''}
                        disabled={isViewMode || isProjectTypesLoading}
                        label={getLabel('CDL_BPA_TYPE', language, 'Asset Type')}
                        IconComponent={KeyboardArrowDownIcon}
                        // sx={{ ...selectStyles, ...valueSx }}
                        sx={{
                          ...selectStyles(theme),
                          ...valueSx(theme),
                          '& .MuiOutlinedInput-notchedOutline': {
                            border:
                              theme.palette.mode === 'dark'
                                ? `1px solid ${alpha('#FFFFFF', 0.3)}`
                                : '1px solid #d1d5db',
                            borderRadius: '6px',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            border:
                              theme.palette.mode === 'dark'
                                ? `1px solid ${alpha('#FFFFFF', 0.5)}`
                                : '1px solid #9ca3af',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            border: `2px solid ${theme.palette.primary.main}`,
                          },
                        }}
                      >
                        {isProjectTypesLoading ? (
                          <MenuItem disabled>Loading...</MenuItem>
                        ) : (
                          projectTypesData?.map((projectType) => (
                            <MenuItem
                              key={projectType.id}
                              value={projectType.id}
                            >
                              {projectType.configValue}
                            </MenuItem>
                          )) || []
                        )}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 12 }}>
                <Controller
                  name="reaLocation"
                  control={control}
                  {...(sanitizedData?.reaLocation !== undefined && {
                    defaultValue: sanitizedData.reaLocation,
                  })}
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field('reaLocation', value),
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_LOCATION',
                        language,
                        'Asset Location'
                      )}
                      error={!!errors.reaLocation}
                      helperText={errors.reaLocation?.message}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={
                        errors.reaLocation
                          ? (errorFieldStyles as any)(theme)
                          : (commonFieldStyles as any)(theme)
                      }
                      required={true}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="reaCif"
                  control={control}
                  {...(sanitizedData?.reaCif !== undefined && {
                    defaultValue: sanitizedData.reaCif,
                  })}
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field('reaCif', value),
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_CIF',
                        language,
                        'Project Account CIF'
                      )}
                      error={!!errors.reaCif}
                      helperText={errors.reaCif?.message}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={
                        errors.reaCif
                          ? (errorFieldStyles as any)(theme)
                          : (commonFieldStyles as any)(theme)
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="reaStatusDTO.id"
                  control={control}
                  {...(sanitizedData?.reaStatusDTO?.id !== undefined && {
                    defaultValue: sanitizedData.reaStatusDTO.id,
                  })}
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field('reaStatusDTO.id', value),
                  }}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={!!errors.reaStatusDTO?.id}
                      required
                    >
                      <InputLabel sx={labelSx(theme)}>
                        {getLabel('CDL_BPA_STATUS', language, 'Project Status')}
                      </InputLabel>
                      <Select
                        {...field}
                        value={field.value || ''}
                        disabled={isViewMode || isProjectStatusesLoading}
                        label={getLabel(
                          'CDL_BPA_STATUS',
                          language,
                          'Project Status'
                        )}
                        IconComponent={KeyboardArrowDownIcon}
                        sx={{
                          ...selectStyles(theme),
                          ...valueSx(theme),
                          '& .MuiOutlinedInput-notchedOutline': {
                            border:
                              theme.palette.mode === 'dark'
                                ? `1px solid ${alpha('#FFFFFF', 0.3)}`
                                : '1px solid #d1d5db',
                            borderRadius: '6px',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            border:
                              theme.palette.mode === 'dark'
                                ? `1px solid ${alpha('#FFFFFF', 0.5)}`
                                : '1px solid #9ca3af',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            border: `2px solid ${theme.palette.primary.main}`,
                          },
                        }}
                      >
                        {isProjectStatusesLoading ? (
                          <MenuItem disabled>Loading...</MenuItem>
                        ) : (
                          projectStatusesData?.map((projectStatus) => (
                            <MenuItem
                              key={projectStatus.id}
                              value={projectStatus.id}
                            >
                              {projectStatus.configValue}
                            </MenuItem>
                          )) || []
                        )}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="reaAccountStatusDTO.id"
                  control={control}
                  {...(sanitizedData?.reaAccountStatusDTO?.id !== undefined && {
                    defaultValue: sanitizedData.reaAccountStatusDTO.id,
                  })}
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field('reaAccountStatusDTO.id', value),
                  }}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={!!errors.reaAccountStatusDTO?.id}
                      required
                    >
                      <InputLabel sx={labelSx(theme)}>
                        {getLabel(
                          'CDL_BPA_ACC_STATUS',
                          language,
                          'Project Account Status'
                        )}
                      </InputLabel>
                      <Select
                        {...field}
                        value={field.value || ''}
                        disabled={isViewMode || isBankAccountStatusesLoading}
                        label={getLabel(
                          'CDL_BPA_ACC_STATUS',
                          language,
                          'Project Account Status'
                        )}
                        IconComponent={KeyboardArrowDownIcon}
                        sx={{
                          ...selectStyles(theme),
                          ...valueSx(theme),
                          '& .MuiOutlinedInput-notchedOutline': {
                            border:
                              theme.palette.mode === 'dark'
                                ? `1px solid ${alpha('#FFFFFF', 0.3)}`
                                : '1px solid #d1d5db',
                            borderRadius: '6px',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            border:
                              theme.palette.mode === 'dark'
                                ? `1px solid ${alpha('#FFFFFF', 0.5)}`
                                : '1px solid #9ca3af',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            border: `2px solid ${theme.palette.primary.main}`,
                          },
                        }}
                      >
                        {isBankAccountStatusesLoading ? (
                          <MenuItem disabled>Loading...</MenuItem>
                        ) : (
                          bankAccountStatusesData?.map((status: any) => (
                            <MenuItem key={status.id} value={status.id}>
                              {status.configValue}
                            </MenuItem>
                          )) || []
                        )}
                      </Select>
                      {errors.reaAccountStatusDTO?.id && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, ml: 1.75 }}
                        >
                          {errors.reaAccountStatusDTO.id.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Controller
                  name="reaAccoutStatusDate"
                  control={control}
                  {...(sanitizedData?.reaAccoutStatusDate !== undefined && {
                    defaultValue: sanitizedData.reaAccoutStatusDate,
                  })}
                  render={({ field }) => (
                    <DatePicker
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_ACC_STATUS_DATE',
                        language,
                        'Project Account Status Date'
                      )}
                      value={field.value || null}
                      onChange={field.onChange}
                      format="DD/MM/YYYY"
                      slots={{
                        openPickerIcon: StyledCalendarIcon,
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.reaAccoutStatusDate,
                          helperText: errors.reaAccoutStatusDate?.message,
                          sx: errors.reaAccoutStatusDate
                            ? errorFieldStyles(theme)
                            : (datePickerStyles as any)(theme),
                          InputLabelProps: { sx: labelSx(theme) },
                          InputProps: {
                            sx: valueSx(theme),
                            style: { height: '46px' },
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Controller
                  name="reaRegistrationDate"
                  control={control}
                  {...(sanitizedData?.reaRegistrationDate !== undefined && {
                    defaultValue: sanitizedData.reaRegistrationDate,
                  })}
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field('reaRegistrationDate', value),
                  }}
                  render={({ field }) => (
                    <DatePicker
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_REG_DATE',
                        language,
                        'Project Registration Date'
                      )}
                      value={field.value || null}
                      onChange={field.onChange}
                      format="DD/MM/YYYY"
                      slots={{
                        openPickerIcon: StyledCalendarIcon,
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !!errors.reaRegistrationDate,
                          helperText: errors.reaRegistrationDate?.message,
                          sx: errors.reaRegistrationDate
                            ? errorFieldStyles(theme)
                            : (datePickerStyles as any)(theme),
                          InputLabelProps: { sx: labelSx(theme) },
                          InputProps: {
                            sx: valueSx(theme),
                            style: { height: '46px' },
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Controller
                  name="reaStartDate"
                  control={control}
                  {...(sanitizedData?.reaStartDate !== undefined && {
                    defaultValue: sanitizedData.reaStartDate,
                  })}
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field('reaStartDate', value),
                  }}
                  render={({ field }) => (
                    <DatePicker
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_EST_DATE',
                        language,
                        'Project Start Date Est.*'
                      )}
                      value={field.value || null}
                      onChange={field.onChange}
                      format="DD/MM/YYYY"
                      slots={{
                        openPickerIcon: StyledCalendarIcon,
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !!errors.reaStartDate,
                          helperText: errors.reaStartDate?.message,
                          sx: errors.reaStartDate
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

              <Grid size={{ xs: 12, md: 3 }}>
                <Controller
                  name="reaCompletionDate"
                  control={control}
                  {...(sanitizedData?.reaCompletionDate !== undefined && {
                    defaultValue: sanitizedData.reaCompletionDate,
                  })}
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field('reaCompletionDate', value),
                  }}
                  render={({ field }) => (
                    <DatePicker
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_EST_COMPLETION_DATE',
                        language,
                        'Project Completion Date*'
                      )}
                      value={field.value || null}
                      onChange={field.onChange}
                      format="DD/MM/YYYY"
                      slots={{
                        openPickerIcon: StyledCalendarIcon,
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !!errors.reaCompletionDate,
                          helperText: errors.reaCompletionDate?.message,
                          sx: errors.reaCompletionDate
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

              <Grid size={{ xs: 12, md: 3 }}>
                <Controller
                  name="reaRetentionPercent"
                  control={control}
                  {...(sanitizedData?.reaRetentionPercent !== undefined && {
                    defaultValue: sanitizedData.reaRetentionPercent,
                  })}
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field('reaRetentionPercent', value),
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_PRIMARY_RETENTION',
                        language,
                        'Retention %'
                      )}
                      error={!!errors.reaRetentionPercent}
                      helperText={errors.reaRetentionPercent?.message}
                      required={true}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={
                        errors.reaRetentionPercent
                          ? errorFieldStyles
                          : commonFieldStyles
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Controller
                  name="reaAdditionalRetentionPercent"
                  control={control}
                  {...(sanitizedData?.reaAdditionalRetentionPercent !==
                    undefined && {
                    defaultValue: sanitizedData.reaAdditionalRetentionPercent,
                  })}
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field(
                        'reaAdditionalRetentionPercent',
                        value
                      ),
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_SECONDARY_RETENTION',
                        language,
                        'Additional Retention %'
                      )}
                      error={!!errors.reaAdditionalRetentionPercent}
                      helperText={errors.reaAdditionalRetentionPercent?.message}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={
                        errors.reaAdditionalRetentionPercent
                          ? errorFieldStyles
                          : commonFieldStyles
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Controller
                  name="reaTotalRetentionPercent"
                  control={control}
                  {...(sanitizedData?.reaTotalRetentionPercent !==
                    undefined && {
                    defaultValue: sanitizedData.reaTotalRetentionPercent,
                  })}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_AGG_RETENTION',
                        language,
                        'Total Retention %'
                      )}
                      InputLabelProps={{
                        sx: labelSx(theme),
                        shrink: !!field.value,
                      }}
                      InputProps={{ sx: valueSx }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Controller
                  name="reaRetentionEffectiveDate"
                  control={control}
                  defaultValue={
                    sanitizedData?.reaRetentionEffectiveDate || null
                  }
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field('reaRetentionEffectiveDate', value),
                  }}
                  render={({ field }) => (
                    <DatePicker
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_RETENTION_START_DATE',
                        language,
                        'Retention Effective Start Date'
                      )}
                      value={field.value || null}
                      onChange={field.onChange}
                      format="DD/MM/YYYY"
                      slots={{
                        openPickerIcon: StyledCalendarIcon,
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !!errors.reaRetentionEffectiveDate,
                          helperText: errors.reaRetentionEffectiveDate?.message,
                          sx: errors.reaRetentionEffectiveDate
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

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="reaManagementExpenses"
                  control={control}
                  {...(sanitizedData?.reaManagementExpenses !== undefined && {
                    defaultValue: sanitizedData.reaManagementExpenses,
                  })}
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field('reaManagementExpenses', value),
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_MGMT_EXPENSES',
                        language,
                        'Asset Management Expenses'
                      )}
                      error={!!errors.reaManagementExpenses}
                      helperText={errors.reaManagementExpenses?.message}
                      required={true}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={
                        errors.reaManagementExpenses
                          ? errorFieldStyles
                          : commonFieldStyles
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="reaMarketingExpenses"
                  control={control}
                  {...(sanitizedData?.reaMarketingExpenses !== undefined && {
                    defaultValue: sanitizedData.reaMarketingExpenses,
                  })}
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field('reaMarketingExpenses', value),
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_MARKETING_COST',
                        language,
                        'Marketing Expenses'
                      )}
                      error={!!errors.reaMarketingExpenses}
                      helperText={errors.reaMarketingExpenses?.message}
                      required={true}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={
                        errors.reaMarketingExpenses
                          ? errorFieldStyles
                          : commonFieldStyles
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="reaRealEstateBrokerExp"
                  control={control}
                  {...(sanitizedData?.reaRealEstateBrokerExp !== undefined &&
                    sanitizedData?.reaRealEstateBrokerExp !== null && {
                      defaultValue: sanitizedData.reaRealEstateBrokerExp,
                    })}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_BROK_FEES',
                        language,
                        'Real Estate Broker Expense'
                      )}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="reaAdvertisementExp"
                  control={control}
                  {...(sanitizedData?.reaAdvertisementExp !== undefined && {
                    defaultValue: sanitizedData.reaAdvertisementExp,
                  })}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_ADVTG_COST',
                        language,
                        'Advertising Expense'
                      )}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="reaLandOwnerName"
                  control={control}
                  {...(sanitizedData?.reaLandOwnerName !== undefined && {
                    defaultValue: sanitizedData.reaLandOwnerName,
                  })}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_LANDOWNER_NAME',
                        language,
                        'Land Owner Name'
                      )}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="reaPercentComplete"
                  control={control}
                  {...(sanitizedData?.reaPercentComplete !== undefined && {
                    defaultValue: sanitizedData.reaPercentComplete,
                  })}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_ASST_COMP_PER',
                        language,
                        'Project Completion Percentage'
                      )}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <Controller
                  name="reaConstructionCostCurrencyDTO.id"
                  control={control}
                  {...(sanitizedData?.reaConstructionCostCurrencyDTO?.id !==
                    undefined &&
                    sanitizedData?.reaConstructionCostCurrencyDTO?.id !==
                      null && {
                      defaultValue:
                        sanitizedData.reaConstructionCostCurrencyDTO.id,
                    })}
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field(
                        'reaConstructionCostCurrencyDTO.id',
                        value
                      ),
                  }}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={!!errors.reaConstructionCostCurrencyDTO?.id}
                      required
                    >
                      <InputLabel sx={labelSx(theme)}>
                        {getLabel('CDL_BPA_TRAN_CUR', language, 'Currency')}
                      </InputLabel>
                      <Select
                        {...field}
                        value={field.value || ''}
                        disabled={isViewMode || isProjectCurrenciesLoading}
                        label={getLabel(
                          'CDL_BPA_TRAN_CUR',
                          language,
                          'Currency'
                        )}
                        IconComponent={KeyboardArrowDownIcon}
                        sx={{
                          ...selectStyles(theme),
                          ...valueSx(theme),
                          '& .MuiOutlinedInput-notchedOutline': {
                            border:
                              theme.palette.mode === 'dark'
                                ? `1px solid ${alpha('#FFFFFF', 0.3)}`
                                : '1px solid #d1d5db',
                            borderRadius: '6px',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            border:
                              theme.palette.mode === 'dark'
                                ? `1px solid ${alpha('#FFFFFF', 0.5)}`
                                : '1px solid #9ca3af',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            border: `2px solid ${theme.palette.primary.main}`,
                          },
                        }}
                      >
                        {isProjectCurrenciesLoading ? (
                          <MenuItem disabled>Loading...</MenuItem>
                        ) : (
                          projectCurrenciesData?.map((currency: any) => (
                            <MenuItem key={currency.id} value={currency.id}>
                              {currency.configValue}
                            </MenuItem>
                          )) || []
                        )}
                      </Select>
                      {errors.reaConstructionCostCurrencyDTO?.id && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, ml: 1.75 }}
                        >
                          {errors.reaConstructionCostCurrencyDTO.id.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="reaConstructionCost"
                  control={control}
                  {...(sanitizedData?.reaConstructionCost !== undefined && {
                    defaultValue: sanitizedData.reaConstructionCost,
                  })}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_ACT_COST',
                        language,
                        'Actual Construction Cost'
                      )}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="reaNoOfUnits"
                  control={control}
                  {...(sanitizedData?.reaNoOfUnits !== undefined && {
                    defaultValue: sanitizedData.reaNoOfUnits,
                  })}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_TOTAL_UNIT',
                        language,
                        'No. of Units'
                      )}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="reaRemarks"
                  control={control}
                  {...(sanitizedData?.reaRemarks !== undefined && {
                    defaultValue: sanitizedData.reaRemarks,
                  })}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel('CDL_BPA_ADD_NOTES', language, 'Remarks')}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="reaSpecialApproval"
                  control={control}
                  {...(sanitizedData?.reaSpecialApproval !== undefined && {
                    defaultValue: sanitizedData.reaSpecialApproval,
                  })}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_SP_REG_APPROVAL',
                        language,
                        'Special Approval 123456'
                      )}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="reaBlockPaymentTypeDTO.id"
                  control={control}
                  {...(sanitizedData?.reaBlockPaymentTypeDTO?.id !==
                    undefined &&
                    sanitizedData?.reaBlockPaymentTypeDTO?.id !== null && {
                      defaultValue: sanitizedData.reaBlockPaymentTypeDTO.id,
                    })}
                  render={({ field }) => {
                    return (
                      <FormControl
                        fullWidth
                        error={!!errors.reaBlockPaymentTypeDTO?.id}
                      >
                        <InputLabel sx={labelSx(theme)}>
                          {getLabel(
                            'CDL_BPA_RES_PAYMENT_TYPE',
                            language,
                            'Payment Type to be Blocked'
                          )}
                        </InputLabel>
                        <Select
                          {...field}
                          value={field.value || ''}
                          disabled={isViewMode || isBlockedPaymentTypesLoading}
                          label={getLabel(
                            'CDL_BPA_RES_PAYMENT_TYPE',
                            language,
                            'Payment Type to be Blocked'
                          )}
                          IconComponent={KeyboardArrowDownIcon}
                          sx={{
                            ...selectStyles(theme),
                            ...valueSx(theme),
                            '& .MuiOutlinedInput-notchedOutline': {
                              border:
                                theme.palette.mode === 'dark'
                                  ? `1px solid ${alpha('#FFFFFF', 0.3)}`
                                  : '1px solid #d1d5db',
                              borderRadius: '6px',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              border:
                                theme.palette.mode === 'dark'
                                  ? `1px solid ${alpha('#FFFFFF', 0.5)}`
                                  : '1px solid #9ca3af',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              border: `2px solid ${theme.palette.primary.main}`,
                            },
                          }}
                        >
                          {isBlockedPaymentTypesLoading ? (
                            <MenuItem disabled>Loading...</MenuItem>
                          ) : (
                            blockedPaymentTypesData?.map((paymentType: any) => (
                              <MenuItem
                                key={paymentType.id}
                                value={paymentType.id}
                              >
                                {paymentType.configValue}
                              </MenuItem>
                            )) || []
                          )}
                        </Select>
                      </FormControl>
                    )
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="reaManagedBy"
                  control={control}
                  {...(sanitizedData?.reaManagedBy !== undefined && {
                    defaultValue: sanitizedData.reaManagedBy,
                  })}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_ASS_MANAGER',
                        language,
                        'Managed By'
                      )}
                      error={!!errors.reaManagedBy}
                      helperText={errors.reaManagedBy?.message}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={
                        errors.reaManagedBy
                          ? errorFieldStyles
                          : commonFieldStyles
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="reaBackupUser"
                  control={control}
                  {...(sanitizedData?.reaBackupUser !== undefined && {
                    defaultValue: sanitizedData.reaBackupUser,
                  })}
                  rules={{
                    validate: (value: any) =>
                      validateStep1Field('reaBackupUser', value),
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_BACKUP_MANAGER',
                        language,
                        'Backup Manager'
                      )}
                      error={!!errors.reaBackupUser}
                      helperText={errors.reaBackupUser?.message}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={
                        errors.reaBackupUser
                          ? errorFieldStyles
                          : commonFieldStyles
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="reamprelationshipManagerName"
                  control={control}
                  {...(sanitizedData?.reamprelationshipManagerName !==
                    undefined && {
                    defaultValue: sanitizedData.reamprelationshipManagerName,
                  })}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_RM',
                        language,
                        'Relationship Manager'
                      )}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              variant="contained"
                              size="small"
                              disabled={isViewMode}
                              sx={{
                                color: '#FFFFFF',
                                borderRadius: '8px',
                                textTransform: 'none',
                                background: '#2563EB',
                                '&:hover': {
                                  background: '#1D4ED8',
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
                              onClick={() => {
                                // Add your fetch logic here
                              }}
                            >
                              Fetch Details
                            </Button>
                          </InputAdornment>
                        ),
                        sx: valueSx,
                      }}
                      InputLabelProps={{ sx: labelSx }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="reaAssestRelshipManagerName"
                  control={control}
                  {...(sanitizedData?.reaAssestRelshipManagerName !==
                    undefined && {
                    defaultValue: sanitizedData.reaAssestRelshipManagerName,
                  })}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_ARM',
                        language,
                        'Asset Relationship Manager'
                      )}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="reaTeamLeadName"
                  control={control}
                  {...(sanitizedData?.reaTeamLeadName !== undefined && {
                    defaultValue: sanitizedData.reaTeamLeadName,
                  })}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      disabled={isViewMode}
                      label={getLabel(
                        'CDL_BPA_TL',
                        language,
                        'Team Leader Name12345'
                      )}
                      InputLabelProps={{ sx: (labelSx as any)(theme) }}
                      InputProps={{ sx: (valueSx as any)(theme) }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </LocalizationProvider>
    )
  }
)

export default Step1
