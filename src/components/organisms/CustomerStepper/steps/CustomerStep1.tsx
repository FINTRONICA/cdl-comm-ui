'use client'

import React, { useState } from 'react'
import {
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
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { Controller, useFormContext } from 'react-hook-form'
import { CustomerData } from '../customerTypes'
import { DROPDOWN_OPTIONS } from '../constants'
import { CUSTOMER_FIELD_CONFIG } from '../../../../constants/mappings/customerMapping'

interface CustomerStep1Props {
  isReadOnly?: boolean
}

const CustomerStep1: React.FC<CustomerStep1Props> = ({ isReadOnly = false }) => {
  const { control, setValue, formState: { errors } } = useFormContext<CustomerData>()

  // State for customer ID generation
  const [customerId, setCustomerId] = useState<string>('')
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false)

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

  // Generate Customer ID function
  const handleGenerateId = async () => {
    setIsGeneratingId(true)
    try {
      // Simulate API call - replace with actual service
      const generatedId = `CUST-${Date.now().toString().slice(-6)}`
      setCustomerId(generatedId)
      setValue('customerId', generatedId)
    } catch (error) {
      console.error('Error generating customer ID:', error)
    } finally {
      setIsGeneratingId(false)
    }
  }


  // Render customer ID field
  const renderCustomerIdField = (
    name: keyof CustomerData,
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
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value)
              field.onChange(e)
            }}
            error={!!errors[name]}
            helperText={errors[name]?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    sx={{
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
                    onClick={handleGenerateId}
                    disabled={isReadOnly || isGeneratingId}
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

  // Render regular text field
  const renderTextField = (
    name: keyof CustomerData,
    label: string,
    required: boolean = false,
    gridSize: number = 6
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        rules={required ? { required: `${label} is required` } : {}}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label={label}
            error={!!errors[name]}
            helperText={errors[name]?.message}
            InputProps={{ sx: valueSx }}
            InputLabelProps={{ sx: labelSx }}
            sx={commonFieldStyles}
          />
        )}
      />
    </Grid>
  )

  // Render select field
  const renderSelectField = (
    name: keyof CustomerData,
    label: string,
    options: Array<{ value: string | number; label: string }>,
    required: boolean = false,
    gridSize: number = 6
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        rules={required ? { required: `${label} is required` } : {}}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors[name]}>
            <InputLabel sx={labelSx}>{label}</InputLabel>
            <Select
              {...field}
              label={label}
              IconComponent={KeyboardArrowDownIcon}
              sx={selectStyles}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Typography sx={valueSx}>{option.label}</Typography>
                </MenuItem>
              ))}
            </Select>
            {errors[name] && (
              <FormHelperText>{errors[name]?.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    </Grid>
  )

  // Render checkbox field
  const renderCheckboxField = (
    name: 'cifExist',
    label: string,
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
                checked={field.value}
                sx={{
                  color: '#2563EB',
                  '&.Mui-checked': {
                    color: '#2563EB',
                  },
                }}
              />
            }
            label={
              <Typography sx={{ ...valueSx, fontSize: '14px' }}>
                {label}
              </Typography>
            }
          />
        )}
      />
    </Grid>
  )


  return (
    <Card
      sx={{
        boxShadow: 'none',
        backgroundColor: '#FFFFFFBF',
        width: '84%',
        margin: '0 auto',
      }}
    >
      <CardContent>
        <Grid container rowSpacing={4} columnSpacing={2}>
          {renderCustomerIdField(
            'customerId',
            `${CUSTOMER_FIELD_CONFIG.CDL_CS_ID}*`
          )}
          {renderTextField(
            'partyCif',
            CUSTOMER_FIELD_CONFIG.CDL_CS_PARTY_CIF
          )}
          {renderTextField(
            'personName',
            `${CUSTOMER_FIELD_CONFIG.CDL_CS_PERSON_NAME}*`,
            true
          )}
          {renderTextField(
            'partyName',
            CUSTOMER_FIELD_CONFIG.CDL_CS_PARTY_NAME
          )}
          {renderTextField(
            'personAddress1',
            CUSTOMER_FIELD_CONFIG.CDL_CS_PERSON_ADDRESS_1
          )}
          {renderTextField(
            'personAddress2',
            CUSTOMER_FIELD_CONFIG.CDL_CS_PERSON_ADDRESS_2
          )}
          {renderTextField(
            'personAddress3',
            CUSTOMER_FIELD_CONFIG.CDL_CS_PERSON_ADDRESS_3
          )}
          {renderTextField(
            'telephoneNo',
            CUSTOMER_FIELD_CONFIG.CDL_CS_TELEPHONE_NO
          )}
          {renderTextField(
            'mobileNo',
            CUSTOMER_FIELD_CONFIG.CDL_CS_MOBILE_NO
          )}
          {renderTextField(
            'emailId',
            CUSTOMER_FIELD_CONFIG.CDL_CS_EMAIL_ID
          )}
          {renderTextField(
            'cifOfPerson',
            CUSTOMER_FIELD_CONFIG.CDL_CS_CIF_OF_PERSON
          )}
          {renderTextField(
            'noticePerson',
            CUSTOMER_FIELD_CONFIG.CDL_CS_NOTICE_PERSON
          )}
          {renderTextField(
            'noticePersonEmailId',
            CUSTOMER_FIELD_CONFIG.CDL_CS_NOTICE_PERSON_EMAIL_ID
          )}
          {renderTextField(
            'cif',
            CUSTOMER_FIELD_CONFIG.CDL_CS_CIF
          )}
          {renderTextField(
            'customerName',
            `${CUSTOMER_FIELD_CONFIG.CDL_CS_NAME}*`,
            true
          )}
          {renderTextField(
            'address1',
            CUSTOMER_FIELD_CONFIG.CDL_CS_ADDRESS_1
          )}
          {renderTextField(
            'address2',
            CUSTOMER_FIELD_CONFIG.CDL_CS_ADDRESS_2
          )}
          {renderTextField(
            'address3',
            CUSTOMER_FIELD_CONFIG.CDL_CS_ADDRESS_3
          )}
          {renderTextField(
            'telephone',
            CUSTOMER_FIELD_CONFIG.CDL_CS_TELEPHONE
          )}
          {renderTextField(
            'mobile',
            CUSTOMER_FIELD_CONFIG.CDL_CS_MOBILE
          )}
          {renderTextField(
            'email',
            CUSTOMER_FIELD_CONFIG.CDL_CS_EMAIL
          )}
          {renderTextField(
            'emiratesId',
            CUSTOMER_FIELD_CONFIG.CDL_CS_EMIRATES_ID
          )}
          {renderTextField(
            'passportDetails',
            CUSTOMER_FIELD_CONFIG.CDL_CS_PASSPORT_DETAILS
          )}
          {renderSelectField(
            'partyConstituent',
            `${CUSTOMER_FIELD_CONFIG.CDL_CS_PARTY_CONSTITUENT}*`,
            DROPDOWN_OPTIONS.partyConstituent,
            true
          )}
          {renderSelectField(
            'role',
            `${CUSTOMER_FIELD_CONFIG.CDL_CS_ROLE}*`,
            DROPDOWN_OPTIONS.role,
            true
          )}
          {renderTextField(
            'rmName',
            CUSTOMER_FIELD_CONFIG.CDL_CS_RM_NAME
          )}
          {renderTextField(
            'backupProjectAccountOwner',
            CUSTOMER_FIELD_CONFIG.CDL_CS_BACKUP_PROJECT_ACCOUNT_OWNER
          )}
          {renderTextField(
            'projectAccountOwner',
            CUSTOMER_FIELD_CONFIG.CDL_CS_PROJECT_ACCOUNT_OWNER
          )}
          {renderTextField(
            'armName',
            CUSTOMER_FIELD_CONFIG.CDL_CS_ARM_NAME
          )}
          {renderTextField(
            'teamLeader',
            CUSTOMER_FIELD_CONFIG.CDL_CS_TEAM_LEADER
          )}
          {renderCheckboxField(
            'cifExist',
            CUSTOMER_FIELD_CONFIG.CDL_CS_CIF_EXIST
          )}
          {renderTextField(
            'remarks',
            CUSTOMER_FIELD_CONFIG.CDL_CS_REMARKS,
            false,
            12
          )}
        </Grid>

      </CardContent>
    </Card>
  )
}

export default CustomerStep1