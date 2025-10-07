'use client'

import React from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Typography,
  Divider,
} from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { CustomerData } from '../customerTypes'

interface CustomerStep2Props {
  isReadOnly?: boolean
}

const CustomerStep2: React.FC<CustomerStep2Props> = ({ isReadOnly = false }) => {
  const { control, watch, setValue, formState: { errors } } = useFormContext<CustomerData>()
  
  const watchedPartySignatories = watch('partySignatories') || []

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

  const addPartySignatory = () => {
    const newSignatory = {
      cifExist: false,
      partyCif: '',
      personName: '',
      personAddress1: '',
      personAddress2: '',
      personAddress3: '',
      telephoneNo: '',
      mobileNo: '',
      emailId: '',
      cifOfPerson: '',
      noticePerson: '',
      noticePersonEmailId: '',
      noticePersonSignature: '',
    }
    setValue('partySignatories', [...watchedPartySignatories, newSignatory])
  }

  const removePartySignatory = (index: number) => {
    if (watchedPartySignatories.length > 1) {
      const updatedSignatories = watchedPartySignatories.filter((_, i) => i !== index)
      setValue('partySignatories', updatedSignatories)
    }
  }

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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              fontSize: '18px',
              lineHeight: '24px',
              color: '#1E2939',
            }}
          >
            Party Signatories
          </Typography>
          {!isReadOnly && (
            <Button
              startIcon={<AddIcon />}
              onClick={addPartySignatory}
              variant="outlined"
              size="small"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                color: '#155DFC',
                borderColor: '#155DFC',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#155DFC',
                  backgroundColor: '#EBF4FF',
                },
              }}
            >
              Add Signatory
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 3, borderColor: '#E5E7EB' }} />

        {watchedPartySignatories.map((_, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
                Signatory {index + 1}
              </Typography>
              {!isReadOnly && watchedPartySignatories.length > 1 && (
                <IconButton
                  onClick={() => removePartySignatory(index)}
                  size="small"
                  sx={{ color: '#DC2626' }}
                >
                  <RemoveIcon />
                </IconButton>
              )}
            </Box>
            
            <Grid container rowSpacing={4} columnSpacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`partySignatories.${index}.cifExist`}
                  control={control}
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
                          CIF Exist
                        </Typography>
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`partySignatories.${index}.partyCif`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Party CIF"
                      InputProps={{ sx: valueSx }}
                      InputLabelProps={{ sx: labelSx }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`partySignatories.${index}.personName`}
                  control={control}
                  rules={{ required: 'Person Name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Person Name"
                      error={!!errors.partySignatories?.[index]?.personName}
                      helperText={errors.partySignatories?.[index]?.personName?.message}
                      InputProps={{ sx: valueSx }}
                      InputLabelProps={{ sx: labelSx }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`partySignatories.${index}.emailId`}
                  control={control}
                  rules={{ 
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email ID"
                      error={!!errors.partySignatories?.[index]?.emailId}
                      helperText={errors.partySignatories?.[index]?.emailId?.message}
                      InputProps={{ sx: valueSx }}
                      InputLabelProps={{ sx: labelSx }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`partySignatories.${index}.mobileNo`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Mobile No"
                      InputProps={{ sx: valueSx }}
                      InputLabelProps={{ sx: labelSx }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`partySignatories.${index}.telephoneNo`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Telephone No"
                      InputProps={{ sx: valueSx }}
                      InputLabelProps={{ sx: labelSx }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 12 }}>
                <Controller
                  name={`partySignatories.${index}.personAddress1`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Address Line 1"
                      InputProps={{ sx: valueSx }}
                      InputLabelProps={{ sx: labelSx }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`partySignatories.${index}.personAddress2`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Address Line 2"
                      InputProps={{ sx: valueSx }}
                      InputLabelProps={{ sx: labelSx }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`partySignatories.${index}.personAddress3`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Address Line 3"
                      InputProps={{ sx: valueSx }}
                      InputLabelProps={{ sx: labelSx }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`partySignatories.${index}.cifOfPerson`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="CIF of Person"
                      InputProps={{ sx: valueSx }}
                      InputLabelProps={{ sx: labelSx }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`partySignatories.${index}.noticePerson`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Notice Person"
                      InputProps={{ sx: valueSx }}
                      InputLabelProps={{ sx: labelSx }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`partySignatories.${index}.noticePersonEmailId`}
                  control={control}
                  rules={{ 
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Notice Person Email ID"
                      error={!!errors.partySignatories?.[index]?.noticePersonEmailId}
                      helperText={errors.partySignatories?.[index]?.noticePersonEmailId?.message}
                      InputProps={{ sx: valueSx }}
                      InputLabelProps={{ sx: labelSx }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name={`partySignatories.${index}.noticePersonSignature`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Notice Person Signature"
                      InputProps={{ sx: valueSx }}
                      InputLabelProps={{ sx: labelSx }}
                      sx={commonFieldStyles}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {index < watchedPartySignatories.length - 1 && (
              <Divider sx={{ mt: 3, borderColor: '#E5E7EB' }} />
            )}
          </Box>
        ))}

        {watchedPartySignatories.length === 0 && (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 4,
              color: '#6B7280',
              fontFamily: 'Outfit, sans-serif'
            }}
          >
            <Typography variant="body1">
              No party signatories added yet. Click "Add Signatory" to get started.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default CustomerStep2