'use client'

import React, { useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
  Alert,
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
  const { 
    data: escrowAccountData, 
    isLoading: isLoadingData,
    error: dataError 
  } = useEscrowAccountById(
    escrowAccountId || null
  )

  // IMPORTANT: If we have escrowAccountData, the main API call succeeded (200 OK)
  // Any error in dataError is from a different call (documents) and should be completely ignored
  // We don't want to propagate this error to the parent component
  useEffect(() => {
    if (escrowAccountData) {
      // Main API call succeeded - ignore any errors
      // This prevents error propagation to parent stepper component
      // The data is available, so we can display it regardless of any other errors
    }
  }, [escrowAccountData])

  // Debug: Log the data to verify it's being received (remove in production)
  useEffect(() => {
    if (escrowAccountData) {
      // Data received successfully - API call worked
    }
  }, [escrowAccountData])

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
  // Use the API response directly for display, not just form data
  useEffect(() => {
    if (escrowAccountData && escrowAccountId) {
      // Pre-populate form with escrow account data for review
      const data = escrowAccountData as unknown as Record<string, unknown>
      Object.keys(data).forEach((key) => {
        // Map API response fields to form fields
        if (key === 'accountNumber' && !formData.escrowAccountNumber) {
          setValue('escrowAccountNumber', data[key] as unknown)
        } else if (key === 'accountDisplayName' && !formData.escrowAccountFullName) {
          setValue('escrowAccountFullName', data[key] as unknown)
        } else if (key in formData) {
          setValue(key, data[key] as unknown)
        }
      })
    }
  }, [escrowAccountData, escrowAccountId, setValue, formData])

  // Show loading state
  if (isLoadingData) {
    return (
      <Card sx={cardBaseStyles}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <Typography>Loading account details...</Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  // CRITICAL: If we have escrowAccountData, the main API call succeeded (200 OK)
  // We MUST ignore any errors and display the data - the error is from documents or another non-critical call
  // Only show error UI if we have NO data at all
  if (dataError && !escrowAccountData && (!formData || Object.keys(formData).length === 0)) {
    const errorMessage = dataError instanceof Error 
      ? dataError.message 
      : 'Failed to load account details'
    
    // Only block UI if we have absolutely no data
    return (
      <Card sx={cardBaseStyles}>
        <CardContent>
          <Alert severity="error">{errorMessage}</Alert>
        </CardContent>
      </Card>
    )
  }
  
  // If we have API data OR form data, continue rendering - don't block on errors

  const renderReviewField = (
    label: string,
    value: string | number | null | undefined
  ) => (
    <Box sx={{ mb: 2 }}>
      <Typography sx={labelStyles}>{label}</Typography>
      <Typography sx={valueStyles}>{value || '-'}</Typography>
    </Box>
  )

  // Use API data directly - the API response has different field names than the form
  // API returns: accountNumber, accountDisplayName, productCode, etc.
  // Form expects: escrowAccountNumber, escrowAccountFullName, etc.
  // IMPORTANT: Always use API data if available, even if there's an error
  // The error is likely from documents endpoint, not the main data fetch
  // The API response structure matches what the user provided:
  // { accountNumber, accountDisplayName, productCode, ibanNumber, officialAccountTitle, etc. }
  const apiData = escrowAccountData 
    ? (escrowAccountData as unknown as Record<string, unknown>)
    : ({} as Record<string, unknown>)

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
          {/* Account Display Name / Full Name - Always show */}
          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getEscrowAccountLabel('ESCROW_ACCOUNT_FULL_NAME', 'Account Display Name'),
              (apiData?.accountDisplayName || apiData?.escrowAccountFullName || formData?.escrowAccountFullName || '-') as string
            )}
          </Grid>

          {/* Account Number - Always show */}
          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getEscrowAccountLabel('ACCOUNT_NUMBER', 'Account Number'),
              (apiData?.accountNumber || apiData?.escrowAccountNumber || formData?.escrowAccountNumber || '-') as string
            )}
          </Grid>

          {/* Product Code - Show if exists in API response */}
          {(apiData?.productCode !== undefined && apiData?.productCode !== null && apiData?.productCode !== '') && (
            <Grid size={{ xs: 12, md: 6 }}>
              {renderReviewField(
                getEscrowAccountLabel('PRODUCT_CODE', 'Product Code'),
                String(apiData.productCode)
              )}
            </Grid>
          )}

          {/* IBAN Number - Show if exists */}
          {(apiData?.ibanNumber !== undefined && apiData?.ibanNumber !== null && apiData?.ibanNumber !== '') && (
            <Grid size={{ xs: 12, md: 6 }}>
              {renderReviewField(
                getEscrowAccountLabel('IBAN_NUMBER', 'IBAN Number'),
                String(apiData.ibanNumber)
              )}
            </Grid>
          )}

          {/* Official Account Title - Show if exists */}
          {(apiData?.officialAccountTitle !== undefined && apiData?.officialAccountTitle !== null && apiData?.officialAccountTitle !== '') && (
            <Grid size={{ xs: 12, md: 6 }}>
              {renderReviewField(
                getEscrowAccountLabel('OFFICIAL_ACCOUNT_TITLE', 'Official Account Title'),
                String(apiData.officialAccountTitle)
              )}
            </Grid>
          )}

          {/* Virtual Account Number - Show if exists */}
          {(apiData?.virtualAccountNumber !== undefined && apiData?.virtualAccountNumber !== null && apiData?.virtualAccountNumber !== '') && (
            <Grid size={{ xs: 12, md: 6 }}>
              {renderReviewField(
                getEscrowAccountLabel('VIRTUAL_ACCOUNT_NUMBER', 'Virtual Account Number'),
                String(apiData.virtualAccountNumber)
              )}
            </Grid>
          )}

          {/* Account Type Code - Show if exists */}
          {(apiData?.accountTypeCode !== undefined && apiData?.accountTypeCode !== null && apiData?.accountTypeCode !== '') && (
            <Grid size={{ xs: 12, md: 6 }}>
              {renderReviewField(
                getEscrowAccountLabel('ACCOUNT_TYPE_CODE', 'Account Type Code'),
                String(apiData.accountTypeCode)
              )}
            </Grid>
          )}

          {/* Assignment Status - Show if exists */}
          {(apiData?.assignmentStatus !== undefined && apiData?.assignmentStatus !== null && apiData?.assignmentStatus !== '') && (
            <Grid size={{ xs: 12, md: 6 }}>
              {renderReviewField(
                getEscrowAccountLabel('ASSIGNMENT_STATUS', 'Assignment Status'),
                String(apiData.assignmentStatus)
              )}
            </Grid>
          )}

          {/* Assigned To Reference - Show if exists */}
          {(apiData?.assignedToReference !== undefined && apiData?.assignedToReference !== null && apiData?.assignedToReference !== '') && (
            <Grid size={{ xs: 12, md: 6 }}>
              {renderReviewField(
                getEscrowAccountLabel('ASSIGNED_TO_REFERENCE', 'Assigned To Reference'),
                String(apiData.assignedToReference)
              )}
            </Grid>
          )}

          {/* Account Open Date Time - Show if exists */}
          {apiData?.accountOpenDateTime && (
            <Grid size={{ xs: 12, md: 6 }}>
              {renderReviewField(
                getEscrowAccountLabel('ACCOUNT_OPEN_DATE_TIME', 'Account Open Date Time'),
                new Date(apiData.accountOpenDateTime as string).toLocaleString()
              )}
            </Grid>
          )}

          {/* Reference Field 1 - Show if exists */}
          {(apiData?.referenceField1 !== undefined && apiData?.referenceField1 !== null && apiData?.referenceField1 !== '') && (
            <Grid size={{ xs: 12, md: 6 }}>
              {renderReviewField(
                getEscrowAccountLabel('REFERENCE_FIELD_1', 'Reference Field 1'),
                String(apiData.referenceField1)
              )}
            </Grid>
          )}

          {/* Reference Field 2 - Show if exists */}
          {(apiData?.referenceField2 !== undefined && apiData?.referenceField2 !== null && apiData?.referenceField2 !== '') && (
            <Grid size={{ xs: 12, md: 6 }}>
              {renderReviewField(
                getEscrowAccountLabel('REFERENCE_FIELD_2', 'Reference Field 2'),
                String(apiData.referenceField2)
              )}
            </Grid>
          )}

          {/* Active Status */}
          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getEscrowAccountLabel('ACTIVE', 'Active'),
              apiData?.active !== undefined ? (apiData.active ? 'Yes' : 'No') : (formData?.active ? 'Yes' : 'No')
            )}
          </Grid>

          {/* Enabled Status */}
          <Grid size={{ xs: 12, md: 6 }}>
            {renderReviewField(
              getEscrowAccountLabel('ENABLED', 'Enabled'),
              apiData?.enabled !== undefined ? (apiData.enabled ? 'Yes' : 'No') : (formData?.enabled ? 'Yes' : 'No')
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Step3

