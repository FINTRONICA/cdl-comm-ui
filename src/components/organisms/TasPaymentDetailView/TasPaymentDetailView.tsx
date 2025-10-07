import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Grid,
  CircularProgress,
  Chip,
} from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import {
  fundEgressService,
  FundEgressData,
} from '@/services/api/fundEgressService'

interface TasPaymentDetailViewProps {
  paymentId: string
  onEdit?: (() => void) | undefined
  onClose?: (() => void) | undefined
}

const TasPaymentDetailView: React.FC<TasPaymentDetailViewProps> = ({
  paymentId,
  onEdit,
  onClose,
}) => {
  const [fundEgressData, setFundEgressData] = useState<FundEgressData | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!paymentId) {
          setError('No payment ID provided')
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
  }, [paymentId])

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
        <Typography sx={{ ml: 2 }}>Loading...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Error loading
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
        {onClose && (
          <Button onClick={onClose} sx={{ mt: 2 }}>
            Close
          </Button>
        )}
      </Box>
    )
  }

  if (!fundEgressData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No payment data found</Typography>
      </Box>
    )
  }

  const generalDetails = [
    {
      gridSize: 6,
      label: 'Payment Reference Number*',
      value: fundEgressData.fePaymentRefNumber || '-',
    },
    {
      gridSize: 6,
      label: 'Payment Date*',
      value: fundEgressData.fePaymentDate || '-',
    },
    {
      gridSize: 6,
      label: 'Build Partner*',
      value: fundEgressData.buildPartnerDTO?.bpName || '-',
    },
    {
      gridSize: 6,
      label: 'Real Estate Asset*',
      value: fundEgressData.realEstateAssestDTO?.reaName || '-',
    },
    {
      gridSize: 6,
      label: 'Payment Type*',
      value: fundEgressData.voucherPaymentTypeDTO?.name || '-',
    },
    {
      gridSize: 6,
      label: 'Payment Status*',
      value: fundEgressData.fePaymentStatus || '-',
    },
    {
      gridSize: 6,
      label: 'Payment Currency*',
      value: fundEgressData.paymentCurrencyDTO?.name || '-',
    },
    {
      gridSize: 6,
      label: 'Invoice Date*',
      value: fundEgressData.feInvoiceDate || '-',
    },
  ]

  const expenseType = [
    {
      gridSize: 6,
      label: 'Payment Sub Type*',
      value: fundEgressData.voucherPaymentSubTypeDTO?.name || '-',
    },
    {
      gridSize: 6,
      label: 'Expense Type*',
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
      label: 'Debit/Credit to Escrow (AED)*',
      value: fundEgressData.feDebitFromEscrow || '0',
    },
    {
      gridSize: 3,
      label: 'Current Eligible Amount*',
      value: fundEgressData.feCurEligibleAmt || '0',
    },
    {
      gridSize: 3,
      label: 'Debit from Retention (AED)*',
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

        maxHeight: '100vh',
        overflow: 'auto',
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
            TAS Payment Details
          </Typography>
          {onEdit && (
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
              Edit
            </Button>
          )}
        </Box>
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

export default TasPaymentDetailView
