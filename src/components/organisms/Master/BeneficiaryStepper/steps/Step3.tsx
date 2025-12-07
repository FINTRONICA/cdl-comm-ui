'use client'

import React, { useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
  useTheme,
} from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import { useBeneficiaryLabelsWithCache } from '@/hooks/master/CustomerHook/useBeneficiaryLabelsWithCache'
import { useAppStore } from '@/store'
import { useBeneficiaryById } from '@/hooks/master/CustomerHook/useBeneficiary'
import {
  labelSx as sharedLabelSx,
  valueSx as sharedValueSx,
  cardStyles as sharedCardStyles,
} from '../styles'

interface Step3Props {
  beneficiaryId?: string | undefined
  isReadOnly?: boolean
  onEditStep?: (stepNumber: number) => void
}

const Step3 = ({ beneficiaryId, isReadOnly = false }: Step3Props) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const labelStyles = React.useMemo(() => sharedLabelSx(theme), [theme])
  const valueStyles = React.useMemo(() => sharedValueSx(theme), [theme])
  const cardBaseStyles = React.useMemo(
    () => sharedCardStyles(theme),
    [theme]
  )

  const { control, watch, setValue } = useFormContext()
  const formData = watch()

  // Fetch beneficiary data for review if editing
  const { data: beneficiaryData } = useBeneficiaryById(
    beneficiaryId || null
  )

  // Dynamic label support
  const { getLabel } = useBeneficiaryLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  const getBeneficiaryLabel = useCallback(
    (configId: string, fallback: string): string => {
      return getLabel(configId, currentLanguage, fallback)
    },
    [getLabel, currentLanguage]
  )

  // Populate review data when beneficiary data is loaded
  useEffect(() => {
    if (beneficiaryData && beneficiaryId) {
      // Pre-populate form with beneficiary data for review
      const data = beneficiaryData as unknown as Record<string, unknown>
      Object.keys(data).forEach((key) => {
        if (key in formData) {
          setValue(key, data[key] as unknown)
        }
      })
    }
  }, [beneficiaryData, beneficiaryId, setValue, formData])

  const renderReviewField = (
    label: string,
    value: string | number | null | undefined
  ) => (
    <Box sx={{ mb: 2 }}>
      <Typography sx={labelStyles}>{label}</Typography>
      <Typography sx={valueStyles}>{value || '-'}</Typography>
    </Box>
  )

  return (
    <Card sx={cardBaseStyles}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            ...labelStyles,
            fontSize: '18px',
            fontWeight: 600,
            mb: 3,
            color: isDark ? '#F9FAFB' : '#1E2939',
          }}
        >
          {getBeneficiaryLabel('REVIEW', 'Review')}
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getBeneficiaryLabel('BENEFICIARY_FULL_NAME', 'Beneficiary Full Name'),
              formData.beneficiaryFullName
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getBeneficiaryLabel('BENEFICIARY_ADDRESS', 'Address'),
              formData.beneficiaryAddressLine1
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getBeneficiaryLabel('TELEPHONE_NUMBER', 'Telephone Number'),
              formData.telephoneNumber
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getBeneficiaryLabel('MOBILE_NUMBER', 'Mobile Number'),
              formData.mobileNumber
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getBeneficiaryLabel('ACCOUNT_NUMBER', 'Account Number'),
              formData.beneficiaryAccountNumber
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getBeneficiaryLabel('BANK_NAME', 'Bank Name'),
              formData.beneficiaryBankName
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getBeneficiaryLabel('BANK_IFSC_CODE', 'Bank IFSC Code'),
              formData.bankIfscCode
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getBeneficiaryLabel('ROUTING_CODE', 'Routing Code'),
              formData.bankRoutingCode
            )}
          </Grid>

          {formData.additionalRemarks && (
            <Grid size={{ xs: 12 }}>
              {renderReviewField(
                getBeneficiaryLabel('ADDITIONAL_REMARKS', 'Additional Remarks'),
                formData.additionalRemarks
              )}
            </Grid>
          )}

          {!isReadOnly && (
            <Grid size={{ xs: 12 }}>
              <Controller
                name="termsAccepted"
                control={control}
                rules={{
                  required: 'You must accept the terms and conditions',
                }}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value || false}
                        sx={{
                          color: isDark ? '#CBD5E1' : '#6B7280',
                          '&.Mui-checked': {
                            color: theme.palette.primary.main,
                          },
                        }}
                      />
                    }
                    label={getBeneficiaryLabel(
                      'ACCEPT_TERMS',
                      'I accept the terms and conditions'
                    )}
                  />
                )}
              />
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Step3

