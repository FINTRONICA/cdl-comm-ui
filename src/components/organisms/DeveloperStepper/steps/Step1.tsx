import React, { useState, useEffect } from 'react'
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
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { Controller, useFormContext } from 'react-hook-form'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { getBuildPartnerLabel } from '../../../../constants/mappings/buildPartnerMapping'
import { BuildPartnerService } from '../../../../services/api/buildPartnerService'
import { developerIdService } from '../../../../services/api/developerIdService'
import { useDeveloperDropdownLabels } from '../../../../hooks/useDeveloperDropdowns'
import { getDeveloperDropdownLabel } from '../../../../constants/mappings/developerDropdownMapping'

interface Step1Props {
  isReadOnly?: boolean
}

const Step1 = ({ isReadOnly = false }: Step1Props) => {
  const router = useRouter()
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext()

  // State for developer ID generation
  const [developerId, setDeveloperId] = useState<string>('')
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false)

  // Developer dropdown data
  const {
    regulatoryAuthorities,
    isLoading: dropdownsLoading,
    error: dropdownsError,
    getDisplayLabel,
  } = useDeveloperDropdownLabels()

  // Initialize developer ID from form value
  useEffect(() => {
    const currentId = watch('bpDeveloperId')
    if (currentId && currentId !== developerId) {
      setDeveloperId(currentId)
    }
  }, [watch, developerId])

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

      // Populate only the name fields from customer details
      setValue('bpName', customerDetails.name.firstName)
      setValue('bpNameLocal', customerDetails.name.shortName)
    } catch (error) {
      // You might want to show a user-friendly error message here
    }
  }

  // Function to generate new developer ID
  const handleGenerateNewId = async () => {
    try {
      setIsGeneratingId(true)
      const newIdResponse = developerIdService.generateNewId()
      setDeveloperId(newIdResponse.id)
      setValue('bpDeveloperId', newIdResponse.id)
    } catch (error) {
      // Handle error silently
    } finally {
      setIsGeneratingId(false)
    }
  }

  // Common styles for form components
  const commonFieldStyles = {
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
      '&.Mui-focused fieldset': {
        borderColor: '#2563EB',
      },
    },
  }

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
      '&.Mui-focused fieldset': {
        borderColor: '#2563EB',
      },
    },
    '& .MuiSelect-icon': {
      color: '#666',
    },
  }

  const datePickerStyles = {
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
      '&.Mui-focused fieldset': {
        borderColor: '#2563EB',
      },
    },
  }

  const labelSx = {
    color: '#6A7282',
    fontFamily: 'Outfit',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '12px',
    letterSpacing: 0,
  }

  const valueSx = {
    color: '#1E2939',
    fontFamily: 'Outfit',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '14px',
    letterSpacing: 0,
    wordBreak: 'break-word',
  }

  const StyledCalendarIcon = (
    props: React.ComponentProps<typeof CalendarTodayOutlinedIcon>
  ) => (
    <CalendarTodayOutlinedIcon
      {...props}
      sx={{
        width: '18px',
        height: '20px',
        position: 'relative',
        top: '2px',
        left: '3px',
        transform: 'rotate(0deg)',
        opacity: 1,
      }}
    />
  )

  const renderTextField = (
    name: string,
    label: string,
    defaultValue = '',
    gridSize: number = 6,
    disabled = false
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue === undefined ? '' : defaultValue}
        render={({ field }) => (
          <TextField
            {...field}
            label={label}
            fullWidth
            disabled={disabled || isReadOnly}
            error={!!errors[name]}
            helperText={errors[name]?.message?.toString()}
            InputLabelProps={{ sx: labelSx }}
            InputProps={{ sx: valueSx }}
            sx={{
              ...commonFieldStyles,
              ...(disabled && {
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#F5F5F5',
                  '& fieldset': {
                    borderColor: '#E0E0E0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#E0E0E0',
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
    required = false,
    loading = false
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} is required` } : {}}
        defaultValue={undefined}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors[name]}>
            <InputLabel sx={labelSx}>
              {loading ? `Loading ${label}...` : label}
            </InputLabel>
            <Select
              {...field}
              label={loading ? `Loading ${label}...` : label}
              sx={{ ...selectStyles, ...valueSx }}
              IconComponent={KeyboardArrowDownIcon}
              disabled={loading || isReadOnly}
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
            {errors[name] && (
              <FormHelperText error>
                {errors[name]?.message?.toString()}
              </FormHelperText>
            )}
          </FormControl>
        )}
      />
    </Grid>
  )

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
                {...field}
                checked={field.value === true}
                disabled={isReadOnly}
                sx={{
                  color: '#CAD5E2',
                  '&.Mui-checked': {
                    color: '#2563EB',
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
    gridSize: number = 6
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={null}
        render={({ field }) => (
          <DatePicker
            label={label}
            value={field.value}
            onChange={field.onChange}
            format="DD/MM/YYYY"
            disabled={isReadOnly}
            slots={{
              openPickerIcon: StyledCalendarIcon,
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors[name],
                helperText: errors[name]?.message?.toString(),
                sx: datePickerStyles,
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
  )

  const renderTextFieldWithButton = (
    name: string,
    label: string,
    buttonText: string,
    gridSize: number = 6
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label={label}
            error={!!errors[name]}
            helperText={errors[name]?.message?.toString()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    sx={{
                      color: '#2563EB',
                      borderRadius: '24px',
                      textTransform: 'none',
                      background: 'var(--UIColors-Blue-100, #DBEAFE)',
                      boxShadow: 'none',
                      '&:hover': {
                        background: '#D0E3FF',
                        boxShadow: 'none',
                      },
                      minWidth: '120px',
                      height: '36px',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 500,
                      fontStyle: 'normal',
                      fontSize: '14px',
                      lineHeight: '24px',
                      letterSpacing: '0.5px',
                      verticalAlign: 'middle',
                    }}
                    onClick={handleFetchDetails}
                    disabled={isReadOnly}
                  >
                    {buttonText}
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
  )

  const renderDeveloperIdField = (
    name: string,
    label: string,
    gridSize: number = 6
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label={label}
            value={developerId}
            error={!!errors[name]}
            helperText={errors[name]?.message?.toString()}
            onChange={(e) => {
              setDeveloperId(e.target.value)
              field.onChange(e)
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ mr: 0 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handleGenerateNewId}
                    disabled={isGeneratingId || isReadOnly}
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
                    {isGeneratingId ? 'Generating...' : 'Generate ID'}
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
  )

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card
        sx={{
          boxShadow: 'none',
          backgroundColor: '#FFFFFFBF',
          width: '84%',
          margin: '0 auto',
        }}
      >
        <CardContent>
          {/* Show error if dropdowns fail to load */}
          {dropdownsError && (
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
                ⚠️ Failed to load dropdown options. Using fallback values.
              </Typography>
            </Box>
          )}

          <Grid container rowSpacing={4} columnSpacing={2}>
            {renderDeveloperIdField(
              'customerID*',
              `${getBuildPartnerLabel('CDL_CS_ID')}*`
            )}
            {/* {renderTextFieldWithButton(
              'bpCifrera',
              `${getBuildPartnerLabel('CDL_BP_CIF')}*`,
              'Fetch Details'
            )} */}
            {renderTextField(
              'bpDeveloperRegNo',
              getBuildPartnerLabel('CDL_CS_PARTY_CIF')
            )}
            {renderTextField(
              'personName',
              getBuildPartnerLabel('CDL_CS_PERSON_NAME')
            )}
            {renderTextField(
              'partyName',
              getBuildPartnerLabel('CDL_CS_PARTY_NAME')
            )}
            {renderTextField(
              'address1',
              getBuildPartnerLabel('CDL_CS_PERSON_ADDRESS_1')
            )}
            {renderTextField(
              'address2',
              getBuildPartnerLabel('CDL_CS_PERSON_ADDRESS_2')
            )}
            {renderTextField(
              'address3',
              getBuildPartnerLabel('CDL_CS_PERSON_ADDRESS_3')
            )}
            {renderTextField(
              'telephoneNo',
              getBuildPartnerLabel('CDL_CS_TELEPHONE_NO')
            )}
            {renderTextField(
              'mobileNo',
              getBuildPartnerLabel('CDL_CS_MOBILE_NO')
            )}
            {renderTextField(
              'emailId',
              getBuildPartnerLabel('CDL_CS_EMAIL_ID')
            )}
            {renderTextField(
              'passportDetails',
              getBuildPartnerLabel('CDL_CS_PASSPORT_DETAILS')
            )}
            {renderTextField(
              'emiratesId',
              getBuildPartnerLabel('CDL_CS_EMIRATES_ID')
            )}

            {renderApiSelectField(
              'partyConstituent',
              `${getBuildPartnerLabel('CDL_CS_PARTY_CONSTITUENT')}*`,
              regulatoryAuthorities,
              6,
              true,
              dropdownsLoading
            )}
            {renderApiSelectField(
              'role',
              `${getBuildPartnerLabel('CDL_CS_ROLE')}*`,
              regulatoryAuthorities,
              6,
              true,
              dropdownsLoading
            )}

            {renderTextField('raName', getBuildPartnerLabel('CDL_CS_RM_NAME'))}

            {renderTextField(
              'projectAccountOwner',
              getBuildPartnerLabel('CDL_CS_BACKUP_PROJECT_ACCOUNT_OWNER')
            )}
            {renderTextField(
              'backupProjectAccountOwner',
              getBuildPartnerLabel('CDL_CS_BACKUP_PROJECT_ACCOUNT_OWNER')
            )}
            {renderTextField(
              'armName',
              getBuildPartnerLabel('CDL_CS_ARM_NAME')
            )}
            {renderTextField(
              'teamLeader',
              getBuildPartnerLabel('CDL_CS_TEAM_LEADER')
            )}
            {renderTextField('remarks', getBuildPartnerLabel('CDL_CS_REMARKS'))}
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  )
}

export default Step1
