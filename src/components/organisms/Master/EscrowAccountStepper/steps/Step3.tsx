'use client'

import React, { useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
} from '@mui/material'
import { useFormContext } from 'react-hook-form'
import { useEscrowAccountLabelsWithCache } from '@/hooks/master/CustomerHook/useEscrowAccountLabelsWithCache'
import { useAppStore } from '@/store'
import { useEscrowAccountById } from '@/hooks/master/CustomerHook/useEscrowAccount'
import {
  labelSx as sharedLabelSx,
  valueSx as sharedValueSx,
  cardStyles as sharedCardStyles,
} from '../styles'

interface Step3Props {
  escrowAccountId?: string | undefined
  isReadOnly?: boolean
  onEditStep?: (stepNumber: number) => void
}

const Step3 = ({ escrowAccountId, isReadOnly = false }: Step3Props) => {
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

  // Fetch escrow account data for review if editing
  const { data: escrowAccountData } = useEscrowAccountById(
    escrowAccountId || null
  )

  // Dynamic label support
  const { getLabel } = useEscrowAccountLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  const getEscrowAccountLabel = useCallback(
    (configId: string, fallback: string): string => {
      return getLabel(configId, currentLanguage, fallback)
    },
    [getLabel, currentLanguage]
  )

  // Populate review data when escrow account data is loaded
  useEffect(() => {
    if (escrowAccountData && escrowAccountId) {
      // Pre-populate form with escrow account data for review
      const data = escrowAccountData as unknown as Record<string, unknown>
      Object.keys(data).forEach((key) => {
        if (key in formData) {
          setValue(key, data[key] as unknown)
        }
      })
    }
  }, [escrowAccountData, escrowAccountId, setValue, formData])

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
          {getEscrowAccountLabel('REVIEW', 'Review')}
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getEscrowAccountLabel('ESCROW_ACCOUNT_FULL_NAME', 'Escrow Account Full Name'),
              formData.escrowAccountFullName
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getEscrowAccountLabel('ESCROW_ACCOUNT_ADDRESS', 'Address'),
              formData.escrowAccountAddressLine1
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getEscrowAccountLabel('TELEPHONE_NUMBER', 'Telephone Number'),
              formData.telephoneNumber
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getEscrowAccountLabel('MOBILE_NUMBER', 'Mobile Number'),
              formData.mobileNumber
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getEscrowAccountLabel('ACCOUNT_NUMBER', 'Account Number'),
              formData.escrowAccountNumber
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getEscrowAccountLabel('BANK_NAME', 'Bank Name'),
              formData.escrowBankName
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getEscrowAccountLabel('BANK_IFSC_CODE', 'Bank IFSC Code'),
              formData.bankIfscCode
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getEscrowAccountLabel('ROUTING_CODE', 'Routing Code'),
              formData.bankRoutingCode
            )}
          </Grid>

          {formData.additionalRemarks && (
            <Grid size={{ xs: 12 }}>
              {renderReviewField(
                getEscrowAccountLabel('ADDITIONAL_REMARKS', 'Additional Remarks'),
                formData.additionalRemarks
              )}
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Step3

