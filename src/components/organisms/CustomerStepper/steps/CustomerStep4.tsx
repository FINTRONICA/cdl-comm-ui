'use client'

import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Button,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { useFormContext } from 'react-hook-form'
import { CustomerData } from '../customerTypes'

interface CustomerStep4Props {
  customerId?: string
  onEditStep?: ((stepNumber: number) => void) | undefined
  isReadOnly?: boolean
}

const CustomerStep4: React.FC<CustomerStep4Props> = ({ 
  customerId: _customerId, 
  onEditStep, 
  isReadOnly = false 
}) => {
  const { watch } = useFormContext<CustomerData>()
  
  const formData = watch()

  const labelSx = {
    color: '#6B7280',
    fontFamily: 'Outfit, sans-serif',
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: 0,
    marginBottom: '4px',
  }

  const valueSx = {
    color: '#1F2937',
    fontFamily: 'Outfit, sans-serif',
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: 0,
    wordBreak: 'break-word',
  }

  const fieldBoxSx = {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
    marginBottom: '16px',
  }

  const renderDisplayField = (
    label: string,
    value: string | number | null = '-'
  ) => (
    <Box sx={fieldBoxSx}>
      <Typography sx={labelSx}>{label}</Typography>
      <Typography sx={valueSx}>{value || '-'}</Typography>
    </Box>
  )

  const renderCheckboxField = (label: string, checked: boolean) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
      <Typography sx={valueSx}>
        {checked ? '✓' : '✗'} {label}
      </Typography>
    </Box>
  )

  return (
    <Box sx={{ width: '100%', pb: 3 }}>
      {/* Customer Details Section */}
      <Card
        sx={{
          boxShadow: 'none',
          backgroundColor: '#FFFFFFBF',
          width: '94%',
          margin: '0 auto',
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '18px',
                lineHeight: '24px',
                color: '#1E2939',
              }}
            >
              Customer Details
            </Typography>
            {!isReadOnly && (
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                onClick={() => onEditStep?.(0)}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#6B7280',
                  borderColor: '#D1D5DB',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#9CA3AF',
                    backgroundColor: '#F9FAFB',
                  },
                }}
              >
                Edit
              </Button>
            )}
          </Box>
          <Divider sx={{ mb: 3, borderColor: '#E5E7EB' }} />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField('Customer ID', formData.customerId)}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField('Party CIF', formData.partyCif)}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField('Person Name', formData.personName)}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField('Party Name', formData.partyName)}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField('Email ID', formData.emailId)}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField('Mobile No', formData.mobileNo)}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField('Telephone No', formData.telephoneNo)}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField('Emirates ID', formData.emiratesId)}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField('Passport Details', formData.passportDetails)}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField('Party Constituent', formData.partyConstituent)}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField('Role', formData.role)}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField('RM Name', formData.rmName)}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField('Team Leader', formData.teamLeader)}
            </Grid>
            <Grid size={{ xs: 12, md: 12 }}>
              {renderCheckboxField('CIF Exist', formData.cifExist)}
            </Grid>
            <Grid size={{ xs: 12, md: 12 }}>
              {renderDisplayField('Remarks', formData.remarks)}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Party Signatories Section */}
      {formData.partySignatories && formData.partySignatories.length > 0 && (
        <Card
          sx={{
            boxShadow: 'none',
            backgroundColor: '#FFFFFFBF',
            width: '94%',
            margin: '0 auto',
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography
                variant="h6"
                fontWeight={600}
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
                  startIcon={<EditIcon />}
                  variant="outlined"
                  onClick={() => onEditStep?.(1)}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#6B7280',
                    borderColor: '#D1D5DB',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#9CA3AF',
                      backgroundColor: '#F9FAFB',
                    },
                  }}
                >
                  Edit
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 3, borderColor: '#E5E7EB' }} />
            <Grid container spacing={3}>
              {formData.partySignatories.map((signatory, index) => (
                <Grid key={index} size={{ xs: 12 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 500,
                        fontStyle: 'normal',
                        fontSize: '16px',
                        lineHeight: '28px',
                        letterSpacing: '0.15px',
                        verticalAlign: 'middle',
                        mb: 2,
                      }}
                    >
                      Signatory {index + 1}
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        {renderCheckboxField('CIF Exist', signatory.cifExist)}
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        {renderDisplayField('Party CIF', signatory.partyCif)}
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        {renderDisplayField('Person Name', signatory.personName)}
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        {renderDisplayField('Email ID', signatory.emailId)}
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        {renderDisplayField('Mobile No', signatory.mobileNo)}
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        {renderDisplayField('Telephone No', signatory.telephoneNo)}
                      </Grid>
                      <Grid size={{ xs: 12, md: 12 }}>
                        {renderDisplayField('Address Line 1', signatory.personAddress1)}
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        {renderDisplayField('Address Line 2', signatory.personAddress2)}
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        {renderDisplayField('Address Line 3', signatory.personAddress3)}
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        {renderDisplayField('CIF of Person', signatory.cifOfPerson)}
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        {renderDisplayField('Notice Person', signatory.noticePerson)}
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        {renderDisplayField('Notice Person Email', signatory.noticePersonEmailId)}
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        {renderDisplayField('Notice Person Signature', signatory.noticePersonSignature)}
                      </Grid>
                    </Grid>
                    {index < formData.partySignatories.length - 1 && (
                      <Divider sx={{ mt: 3, borderColor: '#E5E7EB' }} />
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Documents Section */}
      {formData.documents && formData.documents.length > 0 && (
        <Card
          sx={{
            boxShadow: 'none',
            backgroundColor: '#FFFFFFBF',
            width: '94%',
            margin: '0 auto',
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '18px',
                  lineHeight: '24px',
                  color: '#1E2939',
                }}
              >
                Uploaded Documents
              </Typography>
              {!isReadOnly && (
                <Button
                  startIcon={<EditIcon />}
                  variant="outlined"
                  onClick={() => onEditStep?.(2)}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#6B7280',
                    borderColor: '#D1D5DB',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#9CA3AF',
                      backgroundColor: '#F9FAFB',
                    },
                  }}
                >
                  Edit
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 3, borderColor: '#E5E7EB' }} />
            <Grid container spacing={3}>
              {formData.documents.map((doc, index) => (
                <Grid key={index} size={{ xs: 12, md: 6 }}>
                  <Box sx={fieldBoxSx}>
                    <Typography sx={labelSx}>Document {index + 1}</Typography>
                    <Typography sx={valueSx}>
                      {doc.name || doc.url || 'No file name'}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default CustomerStep4