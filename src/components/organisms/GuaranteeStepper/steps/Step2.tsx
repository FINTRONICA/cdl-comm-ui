'use client'

import React, { useEffect } from 'react'
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { useFormContext } from 'react-hook-form'
import { GuaranteeData } from '../guaranteeTypes'
import { useSuretyBondTranslationsByPattern } from '../../../../hooks/useSuretyBondTranslations'
import { useSuretyBond } from '../../../../hooks/useSuretyBonds'
import dayjs from 'dayjs'

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

const fieldBoxSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
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
  <FormControlLabel
    control={<Checkbox checked={checked} disabled />}
    label={label}
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
)

interface SectionProps {
  title: string
  fields: {
    gridSize: number
    label: string
    value: string | number | boolean | null
  }[]
}

const Section = ({ title, fields }: SectionProps) => (
  <Box mb={4}>
    <Typography
      variant="h6"
      fontWeight={600}
      gutterBottom
      sx={{
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 500,
        fontStyle: 'normal',
        fontSize: '18px',
        lineHeight: '28px',
        letterSpacing: '0.15px',
        verticalAlign: 'middle',
      }}
    >
      {title}
    </Typography>

    <Grid container spacing={3} mt={3}>
      {fields.map((field, idx) => (
        <Grid
          size={{ xs: 12, md: field.gridSize }}
          key={`field-${title}-${idx}`}
        >
          {typeof field.value === 'boolean'
            ? renderCheckboxField(field.label, field.value)
            : renderDisplayField(field.label, field.value)}
        </Grid>
      ))}
    </Grid>
  </Box>
)

interface Step2Props {
  onEdit: () => void
  suretyBondId?: string | null
  isViewMode?: boolean
}

const Step2 = ({ onEdit, suretyBondId, isViewMode }: Step2Props) => {
  const { watch, setValue } = useFormContext<GuaranteeData>()
  const formData = watch()

  // Use surety bond translations for labels
  const { translations: sbTranslations, loading: sbTranslationsLoading } =
    useSuretyBondTranslationsByPattern('CDL_SB_')

  // Fetch surety bond data by ID if provided
  const {
    suretyBond,
    loading: suretyBondLoading,
    error: suretyBondError,
  } = useSuretyBond(suretyBondId || '')

  // Prepopulate form data when surety bond data is loaded
  useEffect(() => {
    if (suretyBond && suretyBondId) {
      setValue('guaranteeRefNo', suretyBond.suretyBondReferenceNumber || '')
      setValue(
        'guaranteeType',
        suretyBond.suretyBondTypeDTO?.id?.toString() || ''
      )
      setValue(
        'guaranteeDate',
        suretyBond.suretyBondDate ? dayjs(suretyBond.suretyBondDate) : null
      )
      setValue('projectCif', '') // This would need to be fetched from the real estate asset
      setValue(
        'projectName',
        suretyBond.realEstateAssestDTO?.id?.toString() || ''
      )
      setValue(
        'developerName',
        suretyBond.buildPartnerDTO?.id?.toString() || ''
      )
      setValue('openEndedGuarantee', suretyBond.suretyBondOpenEnded || false)
      setValue('projectCompletionDate', null) // This would need to be fetched from the real estate asset
      setValue('noOfAmendments', suretyBond.suretyBondNoOfAmendment || '')
      setValue(
        'guaranteeExpirationDate',
        suretyBond.suretyBondExpirationDate
          ? dayjs(suretyBond.suretyBondExpirationDate)
          : null
      )
      setValue('guaranteeAmount', (suretyBond.suretyBondAmount || 0).toString())
      setValue(
        'suretyBondNewReadingAmendment',
        suretyBond.suretyBondNewReadingAmendment || ''
      )
      setValue('issuerBank', suretyBond.issuerBankDTO?.id?.toString() || '')
      setValue('status', '') // This would need to be mapped from the status field
    }
  }, [suretyBond, suretyBondId, setValue])

  // Helper function to get translated label
  const getTranslatedLabel = (configId: string, fallback: string): string => {
    if (sbTranslationsLoading || !sbTranslations.length) {
      return fallback
    }

    const translation = sbTranslations.find((t) => t.configId === configId)
    return translation?.configValue || fallback
  }

  const generalDetails = [
    {
      gridSize: 6,
      label: getTranslatedLabel('CDL_SB_REF_NO', 'Guarantee Reference Number*'),
      value: suretyBond?.suretyBondReferenceNumber || '-',
    },
    {
      gridSize: 6,
      label: getTranslatedLabel('CDL_SB_TYPE', 'Guarantee Type*'),
      value: suretyBond?.suretyBondTypeDTO?.settingValue || '-',
    },
    {
      gridSize: 6,
      label: getTranslatedLabel('CDL_SB_DATE', 'Guarantee Date*'),
      value: suretyBond?.suretyBondDate
        ? dayjs(suretyBond.suretyBondDate).format('DD/MM/YYYY')
        : '-',
    },
    {
      gridSize: 6,
      label: getTranslatedLabel('CDL_SB_BPA_CIF', 'Project CIF*'),
      value: suretyBond?.realEstateAssestDTO?.reaCif || '-',
    },
    {
      gridSize: 6,
      label: getTranslatedLabel('CDL_SB_BPA_NAME', 'Project Name*'),
      value: suretyBond?.realEstateAssestDTO?.reaName || '-',
    },
    {
      gridSize: 6,
      label: getTranslatedLabel('CDL_SB_BP_NAME', 'Developer/Contractor Name*'),
      value: suretyBond?.realEstateAssestDTO?.reaManagedBy || '-',
    },
  ]

  const guaranteeDetails = [
    {
      gridSize: 3,
      label: getTranslatedLabel('CDL_SB_OPEN_ENDED', 'Open Ended Guarantee'),
      value: suretyBond?.suretyBondOpenEnded || false,
    },
    {
      gridSize: 3,
      label: getTranslatedLabel(
        'CDL_SB_BPA_COMPLETION_DATE',
        'Project Completion Date'
      ),
      value: suretyBond?.realEstateAssestDTO?.reaCompletionDate
        ? dayjs(suretyBond.realEstateAssestDTO.reaCompletionDate).format(
            'DD/MM/YYYY'
          )
        : '-',
    },
    {
      gridSize: 3,
      label: getTranslatedLabel('CDL_SB_NO_OF_AMEND', 'No of Amendments'),
      value: suretyBond?.suretyBondNoOfAmendment || '-',
    },
    {
      gridSize: 3,
      label: getTranslatedLabel(
        'CDL_SB_EXPIARY_DATE',
        'Guarantee Expiration Date*'
      ),
      value: suretyBond?.suretyBondExpirationDate
        ? dayjs(suretyBond.suretyBondExpirationDate).format('DD/MM/YYYY')
        : '-',
    },
    {
      gridSize: 4,
      label: getTranslatedLabel('CDL_SB_AMOUNT', 'Guarantee Amount*'),
      value: suretyBond?.suretyBondAmount
        ? `$${suretyBond.suretyBondAmount.toLocaleString()}`
        : '0',
    },
    {
      gridSize: 4,
      label: getTranslatedLabel(
        'CDL_SB_NEW_READING',
        'New Reading (Amendments)'
      ),
      value: suretyBond?.suretyBondNewReadingAmendment || '-',
    },
    {
      gridSize: 4,
      label: getTranslatedLabel('CDL_SB_BANK', 'Issuer Bank*'),
      value: suretyBond?.issuerBankDTO?.fiName || '-',
    },
    {
      gridSize: 4,
      label: getTranslatedLabel('CDL_SB_STATUS', 'Status*'),
      value: suretyBond?.suretyBondStatusDTO?.settingValue || '-',
    },
  ]

  const documentDetails = [
    {
      gridSize: 12,
      label: getTranslatedLabel('CDL_SB_DOCUMENTS', 'Uploaded Documents'),
      value: formData.documents?.length
        ? `${formData.documents.length} document(s) uploaded`
        : 'No documents uploaded',
    },
  ]

  // Show loading state while fetching surety bond data
  if (suretyBondId && suretyBondLoading) {
    return (
      <Card
        sx={{
          boxShadow: 'none',
          backgroundColor: '#FFFFFFBF',
          width: '94%',
          margin: '0 auto',
        }}
      >
        <CardContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <Box textAlign="center">
              <Typography variant="h6" sx={{ mb: 2 }}>
                {getTranslatedLabel(
                  'CDL_SB_LOADING',
                  'Loading Surety Bond Details...'
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getTranslatedLabel(
                  'CDL_SB_LOADING_DESC',
                  'Please wait while we fetch the data'
                )}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )
  }

  // Show error state if there's an error fetching surety bond data
  if (suretyBondId && suretyBondError) {
    return (
      <Card
        sx={{
          boxShadow: 'none',
          backgroundColor: '#FFFFFFBF',
          width: '94%',
          margin: '0 auto',
        }}
      >
        <CardContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <Box textAlign="center">
              <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                {getTranslatedLabel(
                  'CDL_SB_ERROR',
                  'Error Loading Surety Bond'
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {suretyBondError}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                sx={{ textTransform: 'none' }}
              >
                {getTranslatedLabel('CDL_SB_RETRY', 'Try Again')}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      sx={{
        boxShadow: 'none',
        backgroundColor: '#FFFFFFBF',
        width: '94%',
        margin: '0 auto',
      }}
    >
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{ fontFamily: 'Outfit', fontSize: '20px' }}
          >
            {getTranslatedLabel('CDL_SB_DETAILS', 'Guarantee Details')}
          </Typography>
          {!isViewMode && (
            <Button
              startIcon={<EditIcon />}
              onClick={onEdit}
              sx={{
                fontSize: '14px',
                textTransform: 'none',
                color: '#2563EB',
                '&:hover': {
                  backgroundColor: '#DBEAFE',
                },
              }}
            >
              {getTranslatedLabel('CDL_SB_EDIT', 'Edit')}
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Section
          title={getTranslatedLabel(
            'CDL_SB_GENERAL_INFO',
            'General Information'
          )}
          fields={generalDetails}
        />
        <Section
          title={getTranslatedLabel(
            'CDL_SB_GUARANTEE_INFO',
            'Guarantee Information'
          )}
          fields={guaranteeDetails}
        />
        <Section
          title={getTranslatedLabel('CDL_SB_DOCUMENTS_SECTION', 'Documents')}
          fields={documentDetails}
        />
      </CardContent>
    </Card>
  )
}

export default Step2
