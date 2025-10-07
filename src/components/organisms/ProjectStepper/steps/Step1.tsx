'use client'

import React, { useRef } from 'react'
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
} from '@mui/material'

import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { useFormContext, Controller } from 'react-hook-form'
import { ProjectDetailsData } from '../types'
import { useProjectLabels } from '@/hooks/useProjectLabels'
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
import { VALIDATION_PATTERNS, ERROR_MESSAGES } from '../constants'

interface Step1Props {
  initialData?: Partial<ProjectDetailsData>
  isViewMode?: boolean
}

const Step1: React.FC<Step1Props> = React.memo(({ initialData, isViewMode = false }) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProjectDetailsData>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isGeneratingReaId, setIsGeneratingReaId] = React.useState(false)

  // Phase 2: Use our new label utility hook
  const { getLabel, hasError } = useProjectLabels()

  // Fetch developers data for the dropdown
  const { data: developersData, isLoading: isDevelopersLoading } =
    useBuildPartners(0, 100) // Get first 100 developers

  // Fetch project types for the dropdown
  const { data: projectTypesData, isLoading: isProjectTypesLoading } =
    useProjectTypes()

  // Fetch project statuses for the dropdown
  const { data: projectStatusesData, isLoading: isProjectStatusesLoading } =
    useProjectStatuses()

  // Fetch project currencies for the dropdown
  const { data: projectCurrenciesData, isLoading: isProjectCurrenciesLoading } =
    useProjectCurrencies()

  // Fetch bank account statuses for the dropdown
  const {
    data: bankAccountStatusesData,
    isLoading: isBankAccountStatusesLoading,
  } = useBankAccountStatuses()

  // Fetch blocked payment types for the dropdown
  const {
    data: blockedPaymentTypesData,
    isLoading: isBlockedPaymentTypesLoading,
  } = useBlockedPaymentTypes()

  // Handle developer selection
  const handleDeveloperChange = (selectedCif: string) => {
    const selectedDeveloper = developersData?.content?.find(
      (dev) => dev.bpCifrera === selectedCif
    )
    if (selectedDeveloper) {
      setValue('buildPartnerDTO.id', selectedDeveloper.id)
      setValue('reaCif', selectedCif)
      setValue('reaManagedBy', selectedDeveloper.bpName || '')
      setValue('reaBackupUser', selectedDeveloper.bpMasterName || '')
    }
  }

  // Sanitize initialData to prevent null values
  const sanitizedData = React.useMemo(() => {
    if (!initialData) return {}

    const sanitized: Partial<ProjectDetailsData> = {}
    Object.entries(initialData).forEach(([key, value]) => {
      if (value === null) {
        // Convert null to appropriate default values
        if (key.includes('Date')) {
          ;(sanitized as Record<string, unknown>)[key] = dayjs()
        } else {
          ;(sanitized as Record<string, unknown>)[key] = ''
        }
      } else {
        ;(sanitized as Record<string, unknown>)[key] = value
      }
    })
    return sanitized
  }, [initialData])

  // Removed unused handleUploadClick function

  // Function to generate new REA ID
  const handleGenerateReaId = async () => {
    try {
      setIsGeneratingReaId(true)
      const newIdResponse = idService.generateNewId('REA')
      setValue('reaId', newIdResponse.id)
    } catch (error) {
    } finally {
      setIsGeneratingReaId(false)
    }
  }

  // Watch values for calculations
  const retention = watch('reaRetentionPercent')
  const additionalRetention = watch('reaAdditionalRetentionPercent')

  // Calculate total retention when either value changes
  React.useEffect(() => {
    const retentionNum = parseFloat(retention) || 0
    const additionalRetentionNum = parseFloat(additionalRetention) || 0
    const total = retentionNum + additionalRetentionNum
    setValue('reaTotalRetentionPercent', total.toFixed(2))
  }, [retention, additionalRetention, setValue])

  const StyledCalendarIcon = (
    props: React.ComponentProps<typeof CalendarTodayOutlinedIcon>
  ) => <CalendarTodayOutlinedIcon {...props} sx={calendarIconSx} />

  const selectStyles = {
    height: '46px',
    '& .MuiOutlinedInput-root': {
      height: '46px',
      borderRadius: '8px',
      '& fieldset': {
        borderColor: '#CAD5E2',
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: '#CAD5E2',
      },
      '&.MuiFormControlLabel': {
        borderColor: '#CAD5E2',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2563EB',
      },
    },

    '& .MuiSelect-icon': {
      color: '#666',
    },
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={cardStyles}>
        <CardContent>
          {/* Phase 4: Simple loading and error states */}

          {hasError() && (
            <Box
              sx={{
                mb: 2,
                p: 1,
                bgcolor: '#fef2f2',
                borderRadius: 1,
                border: '1px solid #ef4444',
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
                defaultValue={sanitizedData?.reaId || ''}
                rules={{ required: ERROR_MESSAGES.REQUIRED }}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel('CDL_BPA_REFID', 'System Reference ID*')}
                    error={!!errors.reaId}
                    helperText={errors.reaId?.message}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{
                      sx: valueSx,
                      endAdornment: (
                        <InputAdornment position="end" sx={{ mr: 0 }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={handleGenerateReaId}
                            disabled={isGeneratingReaId}
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
                    sx={errors.reaId ? errorFieldStyles : commonFieldStyles}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="reaCif"
                control={control}
                defaultValue={sanitizedData?.reaCif || ''}
                rules={{ required: ERROR_MESSAGES.REQUIRED }}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.reaCif}
                    sx={errors.reaCif ? errorFieldStyles : commonFieldStyles}
                  >
                    <InputLabel sx={labelSx}>
                      {getLabel('CDL_BPA_BP_CIF', 'Developer CIF/Name*')}
                    </InputLabel>
                    <Select
                      {...field}
                      disabled={isViewMode || isDevelopersLoading}
                      label={getLabel('CDL_BPA_BP_CIF', 'Developer CIF/Name*')}
                      // sx={valueSx}
                      sx={{
                        ...selectStyles,
                        ...valueSx,
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #9ca3af',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          border: '2px solid #2563eb',
                        },
                      }}
                      IconComponent={KeyboardArrowDownIcon}
                      onChange={(e) => {
                        field.onChange(e)
                        handleDeveloperChange(e.target.value)
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                          },
                        },
                      }}
                    >
                      {isDevelopersLoading ? (
                        <MenuItem disabled>Loading...</MenuItem>
                      ) : (
                        developersData?.content?.map((developer) => (
                          <MenuItem
                            key={developer.id}
                            value={developer.bpCifrera || ''}
                          >
                            {developer.bpCifrera || 'No CIF'}-
                            {developer.bpName || 'No Name'}
                          </MenuItem>
                        )) || []
                      )}
                    </Select>
                    {errors.reaCif && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 1.75 }}
                      >
                        {errors.reaCif.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="buildPartnerDTO.id"
                control={control}
                defaultValue={sanitizedData?.buildPartnerDTO?.id || 501}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel('CDL_BPA_BP_ID', 'Developer ID (RERA)*')}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
                    sx={commonFieldStyles}
                    helperText="Auto-filled when developer is selected"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="reaManagedBy"
                control={control}
                defaultValue={sanitizedData?.reaManagedBy || ''}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel('CDL_BPA_BP_NAME', 'Developer Name')}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
                    sx={commonFieldStyles}
                    helperText="Auto-filled when developer is selected"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="reaBackupUser"
                control={control}
                defaultValue={sanitizedData?.reaBackupUser || ''}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel(
                      'CDL_BPA_BP_MASTER',
                      'Master Developer Name'
                    )}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
                    sx={commonFieldStyles}
                    helperText="Auto-filled when developer is selected"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="reaReraNumber"
                control={control}
                defaultValue={sanitizedData?.reaReraNumber || ''}
                rules={{ required: ERROR_MESSAGES.REQUIRED }}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel('CDL_BPA_REGNO', 'Project RERA Number*')}
                    error={!!errors.reaReraNumber}
                    helperText={errors.reaReraNumber?.message}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
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
                defaultValue={sanitizedData?.reaName || ''}
                rules={{ required: ERROR_MESSAGES.REQUIRED }}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel('CDL_BPA_NAME', 'Project Name*')}
                    error={!!errors.reaName}
                    helperText={errors.reaName?.message}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
                    sx={errors.reaName ? errorFieldStyles : commonFieldStyles}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="reaTypeDTO.id"
                control={control}
                defaultValue={sanitizedData?.reaTypeDTO?.id || 51}
                rules={{ required: ERROR_MESSAGES.REQUIRED }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.reaTypeDTO?.id}>
                    <InputLabel sx={labelSx}>
                      {getLabel('CDL_BPA_TYPE', 'Project Type*')}
                    </InputLabel>
                    <Select
                      {...field}
                      disabled={isViewMode || isProjectTypesLoading}
                      label={getLabel('CDL_BPA_TYPE', 'Project Type*')}
                      IconComponent={KeyboardArrowDownIcon}
                      // sx={{ ...selectStyles, ...valueSx }}
                      sx={{
                        ...selectStyles,
                        ...valueSx,
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #9ca3af',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          border: '2px solid #2563eb',
                        },
                      }}
                    >
                      {isProjectTypesLoading ? (
                        <MenuItem disabled>Loading...</MenuItem>
                      ) : (
                        projectTypesData?.map((projectType) => (
                          <MenuItem key={projectType.id} value={projectType.id}>
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
                defaultValue={sanitizedData?.reaLocation || ''}
                rules={{ required: ERROR_MESSAGES.REQUIRED }}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel('CDL_BPA_LOCATION', 'Project Location*')}
                    error={!!errors.reaLocation}
                    helperText={errors.reaLocation?.message}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
                    sx={
                      errors.reaLocation ? errorFieldStyles : commonFieldStyles
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="reaAccountStatusDTO.id"
                control={control}
                defaultValue={sanitizedData?.reaAccountStatusDTO?.id || 55}
                rules={{ required: ERROR_MESSAGES.REQUIRED }}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel('CDL_BPA_CIF', 'Project Account CIF*')}
                    error={!!errors.reaAccountStatusDTO?.id}
                    helperText={errors.reaAccountStatusDTO?.id?.message}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
                    sx={
                      errors.reaAccountStatusDTO?.id
                        ? errorFieldStyles
                        : commonFieldStyles
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="reaStatusDTO.id"
                control={control}
                defaultValue={sanitizedData?.reaStatusDTO?.id || 53}
                rules={{ required: ERROR_MESSAGES.REQUIRED }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.reaStatusDTO?.id}>
                    <InputLabel sx={labelSx}>
                      {getLabel('CDL_BPA_STATUS', 'Project Status*')}
                    </InputLabel>
                    <Select
                      {...field}
                      disabled={isViewMode || isProjectStatusesLoading}
                      label={getLabel('CDL_BPA_STATUS', 'Project Status*')}
                      IconComponent={KeyboardArrowDownIcon}
                      sx={{
                        ...selectStyles,
                        ...valueSx,
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #9ca3af',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          border: '2px solid #2563eb',
                        },
                      }}
                    >
                      {isProjectStatusesLoading ? (
                        <MenuItem disabled>Loading statuses...</MenuItem>
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
                defaultValue={sanitizedData?.reaAccountStatusDTO?.id || 55}
                rules={{ required: ERROR_MESSAGES.REQUIRED }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.reaAccountStatusDTO?.id}>
                    <InputLabel sx={labelSx}>
                      {getLabel(
                        'CDL_BPA_ACC_STATUS',
                        'Project Account Status*'
                      )}
                    </InputLabel>
                    <Select
                      {...field}
                      disabled={isViewMode || isBankAccountStatusesLoading}
                      label={getLabel(
                        'CDL_BPA_ACC_STATUS',
                        'Project Account Status*'
                      )}
                      IconComponent={KeyboardArrowDownIcon}
                      sx={{
                        ...selectStyles,
                        ...valueSx,
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #9ca3af',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          border: '2px solid #2563eb',
                        },
                      }}
                    >
                      {isBankAccountStatusesLoading ? (
                        <MenuItem disabled>
                          Loading account statuses...
                        </MenuItem>
                      ) : (
                        bankAccountStatusesData?.map((status: any) => (
                          <MenuItem key={status.id} value={status.id}>
                            {status.configValue}
                          </MenuItem>
                        )) || []
                      )}
                    </Select>
                    {errors.reaTypeDTO?.id && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 1.75 }}
                      >
                        {errors.reaTypeDTO.id.message}
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
                defaultValue={sanitizedData?.reaAccoutStatusDate || dayjs()}
                render={({ field }) => (
                  <DatePicker
                    disabled={isViewMode}
                    label={getLabel(
                      'CDL_BPA_ACC_STATUS_DATE',
                      'Project Account Status Date'
                    )}
                    value={field.value}
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
                          ? errorFieldStyles
                          : datePickerStyles,
                        InputLabelProps: { sx: labelSx },
                        InputProps: { sx: valueSx, style: { height: '46px' } },
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
                defaultValue={sanitizedData?.reaRegistrationDate || dayjs()}
                rules={{ required: ERROR_MESSAGES.REQUIRED }}
                render={({ field }) => (
                  <DatePicker
                    disabled={isViewMode}
                    label={getLabel(
                      'CDL_BPA_REG_DATE',
                      'Project Registration Date*'
                    )}
                    value={field.value}
                    onChange={field.onChange}
                    format="DD/MM/YYYY"
                    slots={{
                      openPickerIcon: StyledCalendarIcon,
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.reaRegistrationDate,
                        helperText: errors.reaRegistrationDate?.message,
                        sx: errors.reaRegistrationDate
                          ? errorFieldStyles
                          : datePickerStyles,
                        InputLabelProps: { sx: labelSx },
                        InputProps: { sx: valueSx, style: { height: '46px' } },
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
                defaultValue={sanitizedData?.reaStartDate || dayjs()}
                rules={{ required: ERROR_MESSAGES.REQUIRED }}
                render={({ field }) => (
                  <DatePicker
                    disabled={isViewMode}
                    label={getLabel(
                      'CDL_BPA_EST_DATE',
                      'Project Start Date Est.*'
                    )}
                    value={field.value}
                    onChange={field.onChange}
                    format="DD/MM/YYYY"
                    slots={{
                      openPickerIcon: StyledCalendarIcon,
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.reaStartDate,
                        helperText: errors.reaStartDate?.message,
                        sx: errors.reaStartDate
                          ? errorFieldStyles
                          : datePickerStyles,
                        InputLabelProps: { sx: labelSx },
                        InputProps: { sx: valueSx, style: { height: '46px' } },
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
                defaultValue={sanitizedData?.reaCompletionDate || dayjs()}
                rules={{ required: ERROR_MESSAGES.REQUIRED }}
                render={({ field }) => (
                  <DatePicker
                    disabled={isViewMode}
                    label={getLabel(
                      'CDL_BPA_EST_COMPLETION_DATE',
                      'Project Completion Date*'
                    )}
                    value={field.value}
                    onChange={field.onChange}
                    format="DD/MM/YYYY"
                    slots={{
                      openPickerIcon: StyledCalendarIcon,
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.reaCompletionDate,
                        helperText: errors.reaCompletionDate?.message,
                        sx: errors.reaCompletionDate
                          ? errorFieldStyles
                          : datePickerStyles,
                        InputLabelProps: { sx: labelSx },
                        InputProps: { sx: valueSx, style: { height: '46px' } },
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
                defaultValue={sanitizedData?.reaRetentionPercent || '2%'}
                rules={{
                  required: ERROR_MESSAGES.REQUIRED,
                  pattern: {
                    value: VALIDATION_PATTERNS.PERCENTAGE,
                    message: ERROR_MESSAGES.INVALID_PERCENTAGE,
                  },
                }}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel(
                      'CDL_BPA_PRIMARY_RETENTION',
                      'Retention %*'
                    )}
                    error={!!errors.reaRetentionPercent}
                    helperText={errors.reaRetentionPercent?.message}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
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
                defaultValue={
                  sanitizedData?.reaAdditionalRetentionPercent || '3%'
                }
                rules={{
                  pattern: {
                    value: VALIDATION_PATTERNS.PERCENTAGE,
                    message: ERROR_MESSAGES.INVALID_PERCENTAGE,
                  },
                }}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel(
                      'CDL_BPA_SECONDARY_RETENTION',
                      'Additional Retention %'
                    )}
                    error={!!errors.reaAdditionalRetentionPercent}
                    helperText={errors.reaAdditionalRetentionPercent?.message}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
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
                defaultValue={sanitizedData?.reaTotalRetentionPercent || '4%'}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel(
                      'CDL_BPA_AGG_RETENTION',
                      'Total Retention %'
                    )}
                    InputLabelProps={{ sx: labelSx }}
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
                  sanitizedData?.reaRetentionEffectiveDate || dayjs()
                }
                rules={{
                  required: ERROR_MESSAGES.REQUIRED,
                }}
                render={({ field }) => (
                  <DatePicker
                    disabled={isViewMode}
                    label={getLabel(
                      'CDL_BPA_RETENTION_START_DATE',
                      'Retention Effective Start Date*'
                    )}
                    value={field.value}
                    onChange={field.onChange}
                    format="DD/MM/YYYY"
                    slots={{
                      openPickerIcon: StyledCalendarIcon,
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.reaRetentionEffectiveDate,
                        helperText: errors.reaRetentionEffectiveDate?.message,
                        sx: errors.reaRetentionEffectiveDate
                          ? errorFieldStyles
                          : datePickerStyles,
                        InputLabelProps: { sx: labelSx },
                        InputProps: { sx: valueSx, style: { height: '46px' } },
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
                defaultValue={sanitizedData?.reaManagementExpenses || '1100000'}
                rules={{
                  required: ERROR_MESSAGES.REQUIRED,
                  pattern: {
                    value: VALIDATION_PATTERNS.AMOUNT,
                    message: ERROR_MESSAGES.INVALID_AMOUNT,
                  },
                }}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel(
                      'CDL_BPA_MGMT_EXPENSES',
                      'Project Management Expenses*'
                    )}
                    error={!!errors.reaManagementExpenses}
                    helperText={errors.reaManagementExpenses?.message}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
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
                defaultValue={sanitizedData?.reaMarketingExpenses || '550000'}
                rules={{
                  required: ERROR_MESSAGES.REQUIRED,
                  pattern: {
                    value: VALIDATION_PATTERNS.AMOUNT,
                    message: ERROR_MESSAGES.INVALID_AMOUNT,
                  },
                }}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel(
                      'CDL_BPA_MARKETING_COST',
                      'Marketing Expenses*'
                    )}
                    error={!!errors.reaMarketingExpenses}
                    helperText={errors.reaMarketingExpenses?.message}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
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
                defaultValue={sanitizedData?.reaRealEstateBrokerExp || 120000.0}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel(
                      'CDL_BPA_BROK_FEES',
                      'Real Estate Broker Expense'
                    )}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
                    sx={commonFieldStyles}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="reaAdvertisementExp"
                control={control}
                defaultValue={sanitizedData?.reaAdvertisementExp || 60000.0}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel(
                      'CDL_BPA_ADVTG_COST',
                      'Advertising Expense'
                    )}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
                    sx={commonFieldStyles}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="reaLandOwnerName"
                control={control}
                defaultValue={sanitizedData?.reaLandOwnerName || ''}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel(
                      'CDL_BPA_LANDOWNER_NAME',
                      'Land Owner Name'
                    )}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
                    sx={commonFieldStyles}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="reaPercentComplete"
                control={control}
                defaultValue={sanitizedData?.reaPercentComplete || '10%'}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel(
                      'CDL_BPA_ASST_COMP_PER',
                      'Project Completion Percentage'
                    )}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
                    sx={commonFieldStyles}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Controller
                name="reaConstructionCostCurrencyDTO.id"
                control={control}
                defaultValue={
                  sanitizedData?.reaConstructionCostCurrencyDTO?.id || 32
                }
                rules={{ required: ERROR_MESSAGES.REQUIRED }}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.reaConstructionCostCurrencyDTO?.id}
                  >
                    <InputLabel sx={labelSx}>
                      {getLabel('CDL_BPA_TRAN_CUR', 'Currency*')}
                    </InputLabel>
                    <Select
                      {...field}
                      disabled={isViewMode || isProjectCurrenciesLoading}
                      label={getLabel('CDL_BPA_TRAN_CUR', 'Currency*')}
                      IconComponent={KeyboardArrowDownIcon}
                      sx={{ ...selectStyles, ...valueSx }}
                    >
                      {isProjectCurrenciesLoading ? (
                        <MenuItem disabled>Loading currencies...</MenuItem>
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
                defaultValue={sanitizedData?.reaConstructionCost || 5.2e7}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel(
                      'CDL_BPA_ACT_COST',
                      'Actual Construction Cost'
                    )}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
                    sx={commonFieldStyles}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="reaNoOfUnits"
                control={control}
                defaultValue={sanitizedData?.reaNoOfUnits || 120}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel('CDL_BPA_TOTAL_UNIT', 'No. of Units')}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
                    sx={commonFieldStyles}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="reaRemarks"
                control={control}
                defaultValue={sanitizedData?.reaRemarks || ''}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel('CDL_BPA_ADD_NOTES', 'Remarks')}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
                    sx={commonFieldStyles}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="reaSpecialApproval"
                control={control}
                defaultValue={sanitizedData?.reaSpecialApproval || ''}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel(
                      'CDL_BPA_SP_REG_APPROVAL',
                      'Special Approval'
                    )}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
                    sx={commonFieldStyles}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="reaBlockPaymentTypeDTO"
                control={control}
                defaultValue={sanitizedData?.reaBlockPaymentTypeDTO || ''}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.reaBlockPaymentTypeDTO}
                  >
                    <InputLabel sx={labelSx}>
                      {getLabel(
                        'CDL_BPA_RES_PAYMENT_TYPE',
                        'Payment Type to be Blocked'
                      )}
                    </InputLabel>
                    <Select
                      {...field}
                      disabled={isViewMode || isBlockedPaymentTypesLoading}
                      label={getLabel(
                        'CDL_BPA_RES_PAYMENT_TYPE',
                        'Payment Type to be Blocked'
                      )}
                      IconComponent={KeyboardArrowDownIcon}
                      sx={{
                        ...selectStyles,
                        ...valueSx,
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #9ca3af',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          border: '2px solid #2563eb',
                        },
                      }}
                    >
                      {isBlockedPaymentTypesLoading ? (
                        <MenuItem disabled>Loading payment types...</MenuItem>
                      ) : (
                        blockedPaymentTypesData?.map((paymentType: any) => (
                          <MenuItem key={paymentType.id} value={paymentType.id}>
                            {paymentType.configValue}
                          </MenuItem>
                        )) || []
                      )}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="reaManagedBy"
                control={control}
                defaultValue={sanitizedData?.reaManagedBy || 'Developer 2'}
                rules={{ required: ERROR_MESSAGES.REQUIRED }}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel('CDL_BPA_ASS_MANAGER', 'Managed By*')}
                    error={!!errors.reaManagedBy}
                    helperText={errors.reaManagedBy?.message}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
                    sx={
                      errors.reaManagedBy ? errorFieldStyles : commonFieldStyles
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="reaBackupUser"
                control={control}
                defaultValue={sanitizedData?.reaBackupUser || 'Backup User 2'}
                rules={{ required: ERROR_MESSAGES.REQUIRED }}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel('CDL_BPA_BACKUP_MANAGER', 'Backup by')}
                    error={!!errors.reaBackupUser}
                    helperText={errors.reaBackupUser?.message}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
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
                name="reaRelationshipManagerName"
                control={control}
                defaultValue={
                  sanitizedData?.reaRelationshipManagerName || 'Manager 2'
                }
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel('CDL_BPA_RM', 'Relationship Manager')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            variant="contained"
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
                defaultValue={
                  sanitizedData?.reaAssestRelshipManagerName ||
                  'Asset Manager 2'
                }
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel(
                      'CDL_BPA_ARM',
                      'Asset Relationship Manager'
                    )}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
                    sx={commonFieldStyles}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="reaTeamLeadName"
                control={control}
                defaultValue={sanitizedData?.reaTeamLeadName || 'Team Lead 2'}
                render={({ field }) => (
                    <TextField
                    {...field}
                    fullWidth
                    disabled={isViewMode}
                    label={getLabel('CDL_BPA_TL', 'Team Leader Name')}
                    InputLabelProps={{ sx: labelSx }}
                    InputProps={{ sx: valueSx }}
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
})

export default Step1
