import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  CircularProgress,
  Chip,
} from '@mui/material'
import { useParams } from 'next/navigation'
import {
  fundEgressService,
  FundEgressData,
} from '@/services/api/fundEgressService'
import { useManualPaymentLabelsWithCache } from '@/hooks/useManualPaymentLabelsWithCache'
import { MANUAL_PAYMENT_LABELS } from '@/constants/mappings/manualPaymentLabels'

const TasStep2: React.FC = () => {
  const [fundEgressData, setFundEgressData] = useState<FundEgressData | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()

  // Use translation hook for TAS payment labels (same as manual payment)
  const { getLabel } = useManualPaymentLabelsWithCache('EN')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get payment ID from URL parameters
        const paymentId = params.id as string

        if (!paymentId || paymentId.startsWith('temp_')) {
          setError('No valid payment ID found in URL')
          setLoading(false)
          return
        }

        const data = await fundEgressService.getFundEgressById(paymentId)

        if (!data) {
          setError('No data returned from API')
          setLoading(false)
          return
        }

        setFundEgressData(data)
      } catch (err) {
        console.error('Failed to fetch fund egress data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params])

  const renderDisplayField = (label: string, value: any) => (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: '12px', fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontSize: '14px', fontWeight: 400 }}>
        {value || '-'}
      </Typography>
    </Box>
  )

  const renderCheckboxField = (label: string, value: boolean) => (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: '12px', fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Chip
        label={value ? 'Yes' : 'No'}
        color={value ? 'success' : 'default'}
        size="small"
        sx={{ mt: 0.5 }}
      />
    </Box>
  )

  const Section: React.FC<{ title: string; fields: any[] }> = ({
    title,
    fields,
  }) => (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h6"
        sx={{ fontSize: '16px', fontWeight: 600, mb: 2, color: '#1E2939' }}
      >
        {title}
      </Typography>
      <Grid container spacing={3}>
        {fields.map((field, idx) => (
          <Grid
            size={{ xs: 12, md: field.gridSize }}
            key={`field-${field.label}-${idx}`}
          >
            {typeof field.value === 'boolean'
              ? renderCheckboxField(field.label, field.value)
              : renderDisplayField(field.label, field.value)}
          </Grid>
        ))}
      </Grid>
    </Box>
  )

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading TAS payment details...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Error loading TAS payment details
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      </Box>
    )
  }

  if (!fundEgressData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No TAS payment data found</Typography>
      </Box>
    )
  }

  const generalDetails = [
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.TAS_REFERENCE,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.TAS_REFERENCE
        ) + '*',
      value: fundEgressData.fePaymentRefNumber || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.INVOICE_DATE,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.INVOICE_DATE
        ) + '*',
      value: fundEgressData.fePaymentDate || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.DEVELOPER_NAME,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.DEVELOPER_NAME
        ) + '*',
      value: fundEgressData.buildPartnerDTO?.bpName || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.PROJECT_NAME,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PROJECT_NAME
        ) + '*',
      value: fundEgressData.realEstateAssestDTO?.reaName || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_TYPE,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_TYPE
        ) + '*',
      value: fundEgressData.voucherPaymentTypeDTO?.name || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.PROJECT_STATUS,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PROJECT_STATUS
        ) + '*',
      value: fundEgressData.fePaymentStatus || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.INVOICE_CURRENCY,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.INVOICE_CURRENCY
        ) + '*',
      value: fundEgressData.paymentCurrencyDTO?.name || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.INVOICE_DATE,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.INVOICE_DATE
        ) + '*',
      value: fundEgressData.feInvoiceDate || '-',
    },
  ]

  const expenseType = [
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_SUB_TYPE,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_SUB_TYPE
        ) + '*',
      value: fundEgressData.voucherPaymentSubTypeDTO?.name || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.SECTION_TITLES.EXPENSE_TYPE,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.SECTION_TITLES.EXPENSE_TYPE
        ) + '*',
      value: fundEgressData.voucherPaymentTypeDTO?.name || '-',
    },
  ]

  const amountDetails = [
    {
      gridSize: 6,
      label: 'Engineer Approved Amount*',
      value: fundEgressData.feEngineerApprovedAmt || '0',
    },
    {
      gridSize: 6,
      label: 'Total Eligible Amount (Invoice)*',
      value: fundEgressData.feTotalEligibleAmtInv || '0',
    },
    {
      gridSize: 6,
      label: 'Amount Paid against Invoice*',
      value: fundEgressData.feAmtPaidAgainstInv || '0',
    },
    {
      gridSize: 6,
      label: 'Cap Exceeded',
      value: fundEgressData.feCapExcedded || '-',
    },
    {
      gridSize: 3,
      label: 'Total Amount paid (Payment Type)*',
      value: fundEgressData.feTotalAmountPaid || '0',
    },
    {
      gridSize: 3,
      label: 'Debit/Credit to Escrow*',
      value: fundEgressData.feDebitFromEscrow || '0',
    },
    {
      gridSize: 3,
      label: 'Current Eligible Amount*',
      value: fundEgressData.feCurEligibleAmt || '0',
    },
    {
      gridSize: 3,
      label: 'Debit from Retention*',
      value: fundEgressData.feDebitFromRetention || '0',
    },
    {
      gridSize: 3,
      label: 'Total Payout Amount*',
      value: fundEgressData.feTotalPayoutAmt || '0',
    },
    {
      gridSize: 3,
      label: 'Amount in Transit*',
      value: fundEgressData.feAmountInTransit || '0',
    },
    {
      gridSize: 3,
      label: 'VAT Cap Exceeded',
      value: fundEgressData.feVarCapExcedded || '-',
    },
    {
      gridSize: 3,
      label: 'Invoice Ref no.*',
      value: fundEgressData.feInvoiceRefNo || '-',
    },
    {
      gridSize: 3,
      label: 'Special Rate',
      value: fundEgressData.feSpecialRate || false,
    },
    {
      gridSize: 3,
      label: 'Corporate Amount',
      value: fundEgressData.feCorporatePayment || false,
    },
    {
      gridSize: 3,
      label: 'Deal Ref No',
      value: fundEgressData.feDealRefNo || '-',
    },
    {
      gridSize: 3,
      label: 'PPC Number',
      value: fundEgressData.fePpcNumber || '-',
    },
    {
      gridSize: 6,
      label: 'Indicative Rate',
      value: fundEgressData.feIndicativeRate || '0',
    },
  ]

  const narrationDetails = [
    {
      gridSize: 12,
      label: 'Narration*',
      value: fundEgressData.feNarration1 || '-',
    },
    { gridSize: 12, label: 'Remarks', value: fundEgressData.feRemark || '-' },
  ]

  return (
    <Card
      sx={{
        maxWidth: '100%',
        width: '100%',
        margin: '0',
        maxHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      <CardContent>
        <Typography
          variant="h5"
          fontWeight={600}
          sx={{ fontFamily: 'Outfit', fontSize: '20px', mb: 2 }}
        >
          {getLabel(
            MANUAL_PAYMENT_LABELS.STEPS.REVIEW,
            'EN',
            MANUAL_PAYMENT_LABELS.FALLBACKS.STEPS.REVIEW
          )}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3} mb={4} mt={3}>
          {generalDetails.map((field, idx) => (
            <Grid
              size={{ xs: 12, md: field.gridSize }}
              key={`field-${field.label}-${idx}`}
            >
              {typeof field.value === 'boolean'
                ? renderCheckboxField(field.label, field.value)
                : renderDisplayField(field.label, field.value)}
            </Grid>
          ))}
        </Grid>

        <Section title="Expense Type" fields={expenseType} />
        <Section title="Amount Details" fields={amountDetails} />
        <Section title="Narration" fields={narrationDetails} />
      </CardContent>
    </Card>
  )
}

export default TasStep2
