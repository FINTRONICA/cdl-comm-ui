'use client'

import React, { useState, useEffect } from 'react'
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
  CircularProgress,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import {
  fundEgressService,
  FundEgressData,
} from '@/services/api/fundEgressService'
// import { toast } from 'react-hot-toast' // Removed as toast is not used in this component
import { useParams } from 'next/navigation'
import { useManualPaymentLabelsWithCache } from '@/hooks/useManualPaymentLabelsWithCache'
import { MANUAL_PAYMENT_LABELS } from '@/constants/mappings/manualPaymentLabels'

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
  isReadOnly?: boolean
}

const Step2 = ({ onEdit, isReadOnly = false }: Step2Props) => {
  const [fundEgressData, setFundEgressData] = useState<FundEgressData | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()

  // Get dynamic labels
  const { getLabel } = useManualPaymentLabelsWithCache('EN')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get payment ID from URL parameters
        const paymentId = params.id as string

        if (!paymentId) {
          setError('No valid payment ID found in URL')
          setLoading(false)
          return
        }

        // Check if data is already available from parent component
        // to avoid duplicate API calls
        const data = await fundEgressService.getFundEgressById(paymentId)

        if (!data) {
          setError('No data returned from API')
          setLoading(false)
          return
        }

        // Check if data has the expected structure
        if (!data.fePaymentRefNumber && !data.id) {

          setError('Unexpected data structure returned from API')
          setLoading(false)
          return
        }

        setFundEgressData(data)

      } catch (err) {

        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params])

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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography color="error">Error: {error}</Typography>
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
      value: fundEgressData?.fePaymentRefNumber || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.DEVELOPER_NAME,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.DEVELOPER_NAME
        ) + '*',
      value: fundEgressData?.buildPartnerDTO?.bpName || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.DEVELOPER_ID,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.DEVELOPER_ID
        ) + '*',
      value: fundEgressData?.buildPartnerDTO?.bpDeveloperId || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.PROJECT_NAME,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PROJECT_NAME
        ) + '*',
      value: fundEgressData?.realEstateAssestDTO?.reaName || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.PROJECT_ID,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PROJECT_ID
        ) + '*',
      value: fundEgressData?.realEstateAssestDTO?.reaId || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.PROJECT_STATUS,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PROJECT_STATUS
        ) + '*',
      value:
        fundEgressData?.realEstateAssestDTO?.reaAccountStatusDTO
          ?.settingValue || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.ESCROW_ACCOUNT,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.ESCROW_ACCOUNT
        ) + ' Balance*',
      value: fundEgressData?.feCurBalInEscrowAcc || '0',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.SUB_CONSTRUCTION_ACCOUNT,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.SUB_CONSTRUCTION_ACCOUNT
        ) + ' Balance*',
      value: fundEgressData?.feSubConsAccBalance || '0',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.CORPORATE_ACCOUNT,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.CORPORATE_ACCOUNT
        ) + ' Balance*',
      value: fundEgressData?.feCorporateAccBalance || '0',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.RETENTION_ACCOUNT,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.RETENTION_ACCOUNT
        ) + ' Balance*',
      value: fundEgressData?.feCurBalInRetentionAcc || '0',
    },
  ]

  const expenseType = [
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_TYPE,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_TYPE
        ) + '*',
      value: fundEgressData?.voucherPaymentTypeDTO?.name || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_SUB_TYPE,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_SUB_TYPE
        ) + '*',
      value: fundEgressData?.voucherPaymentSubTypeDTO?.name || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.REGULAR_APPROVAL_REF,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.REGULAR_APPROVAL_REF
        ) + '*',
      value: fundEgressData?.feReraApprovedRefNo || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.REGULAR_APPROVAL_DATE,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.REGULAR_APPROVAL_DATE
        ) + '*',
      value: fundEgressData?.feReraApprovedDate || '-',
    },
    {
      gridSize: 3,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.INVOICE_REF,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.INVOICE_REF
        ) + '*',
      value: fundEgressData?.feInvoiceRefNo || '-',
    },
    {
      gridSize: 3,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.INVOICE_CURRENCY,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.INVOICE_CURRENCY
        ) + '*',
      value: fundEgressData?.invoiceCurrencyDTO?.name || '-',
    },
    {
      gridSize: 3,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.INVOICE_VALUE,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.INVOICE_VALUE
        ) + '*',
      value: fundEgressData?.feInvoiceValue || '0',
    },
    {
      gridSize: 3,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.INVOICE_DATE,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.INVOICE_DATE
        ) + '*',
      value: fundEgressData?.feInvoiceDate || '-',
    },
  ]

  const amountDetails = [
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.ENGINEER_APPROVED_AMOUNT,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.ENGINEER_APPROVED_AMOUNT
        ) + '*',
      value: fundEgressData?.feEngineerApprovedAmt || '0',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.TOTAL_ELIGIBLE_AMOUNT,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.TOTAL_ELIGIBLE_AMOUNT
        ) + '*',
      value: fundEgressData?.feTotalEligibleAmtInv || '0',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.AMOUNT_PAID,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.AMOUNT_PAID
        ) + '*',
      value: fundEgressData?.feAmtPaidAgainstInv || '0',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.CAP_EXCEEDED,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.CAP_EXCEEDED
      ),
      value: fundEgressData?.feCapExcedded || '-',
    },
    {
      gridSize: 3,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.TOTAL_AMOUNT_PAID,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.TOTAL_AMOUNT_PAID
        ) + '*',
      value: fundEgressData?.feTotalAmountPaid || '0',
    },
    {
      gridSize: 3,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_CURRENCY,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_CURRENCY
        ) + '*',
      value: fundEgressData?.paymentCurrencyDTO?.name || '-',
    },
    {
      gridSize: 3,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.DEBIT_CREDIT_ESCROW,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.DEBIT_CREDIT_ESCROW
        ) + '*',
      value: fundEgressData?.feDebitFromEscrow || '0',
    },
    {
      gridSize: 3,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.CURRENT_ELIGIBLE_AMOUNT,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.CURRENT_ELIGIBLE_AMOUNT
        ) + '*',
      value: fundEgressData?.feCurEligibleAmt || '0',
    },
    {
      gridSize: 3,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.DEBIT_FROM_RETENTION,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.DEBIT_FROM_RETENTION
        ) + '*',
      value: fundEgressData?.feDebitFromRetention || '0',
    },
    {
      gridSize: 3,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.TOTAL_PAYOUT_AMOUNT,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.TOTAL_PAYOUT_AMOUNT
        ) + '*',
      value: fundEgressData?.feTotalPayoutAmt || '0',
    },
    {
      gridSize: 3,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.AMOUNT_IN_TRANSIT,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.AMOUNT_IN_TRANSIT
        ) + '*',
      value: fundEgressData?.feAmountInTransit || '0',
    },
    {
      gridSize: 3,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.VAT_CAP_EXCEEDED,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.VAT_CAP_EXCEEDED
      ),
      value: fundEgressData?.feVarCapExcedded || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.INVOICE_REF,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.INVOICE_REF
        ) + '*',
      value: fundEgressData?.feInvoiceRefNo || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_SUB_TYPE,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_SUB_TYPE
        ) + '*',
      value: fundEgressData?.voucherPaymentSubTypeDTO?.name || '-',
    },
    {
      gridSize: 3,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.SPECIAL_RATE,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.SPECIAL_RATE
      ),
      value: fundEgressData?.feSpecialRate || false,
    },
    {
      gridSize: 3,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.CORPORATE_AMOUNT,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.CORPORATE_AMOUNT
      ),
      value: fundEgressData?.feCorporatePayment || false,
    },
    {
      gridSize: 3,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.DEAL_REF_NO,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.DEAL_REF_NO
      ),
      value: fundEgressData?.feDealRefNo || '-',
    },
    {
      gridSize: 3,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.PPC_NUMBER,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PPC_NUMBER
      ),
      value: fundEgressData?.fePpcNumber || '-',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.INDICATIVE_RATE,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.INDICATIVE_RATE
      ),
      value: fundEgressData?.feIndicativeRate || '0',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.CORPORATE_CERTIFICATION_FEES,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.CORPORATE_CERTIFICATION_FEES
      ),
      value: fundEgressData?.feCorpCertEngFee || '0',
    },
  ]

  const narrationDetails = [
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.NARRATION_1,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.NARRATION_1
        ) + '*',
      value: fundEgressData?.feNarration1 || '-',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.NARRATION_2,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.NARRATION_2
      ),
      value: fundEgressData?.feNarration2 || '-',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.REMARKS,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.REMARKS
      ),
      value: fundEgressData?.feRemark || '-',
    },
  ]

  const unitCancellation = [
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.UNIT_NO,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.UNIT_NO
        ) + '*',
      value: fundEgressData?.capitalPartnerUnitDTO?.unitNumber || '-',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.TOWER_NAME,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.TOWER_NAME
      ),
      value: fundEgressData?.capitalPartnerUnitDTO?.towerName || '-',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.UNIT_STATUS,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.UNIT_STATUS
      ),
      value: fundEgressData?.capitalPartnerUnitDTO?.unitStatus || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.AMOUNT_RECEIVED,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.AMOUNT_RECEIVED
        ) + '*',
      value: fundEgressData?.feAmtRecdFromUnitHolder || '0',
    },
    {
      gridSize: 3,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.FORFEIT,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.FORFEIT
      ),
      value: fundEgressData?.feForFeit || false,
    },
    {
      gridSize: 3,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.REFUND_TO_UNIT_HOLDER,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.REFUND_TO_UNIT_HOLDER
      ),
      value: fundEgressData?.feRefundToUnitHolder || false,
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.TRANSFER_TO_OTHER_UNIT,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.TRANSFER_TO_OTHER_UNIT
      ),
      value: fundEgressData?.feTransferToOtherUnit || false,
    },
    {
      gridSize: 3,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.FORFEIT_AMOUNT,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.FORFEIT_AMOUNT
      ),
      value: fundEgressData?.feForFeitAmt || '0',
    },
    {
      gridSize: 3,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.REGULATOR_APPROVAL_REF,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.REGULATOR_APPROVAL_REF
      ),
      value: fundEgressData?.feUnitReraApprovedRefNo || '-',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.REGULATOR_APPROVAL_DATE,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.REGULATOR_APPROVAL_DATE
      ),
      value: fundEgressData?.feUnitTransferAppDate || '-',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.CHARGE_MODE,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.CHARGE_MODE
      ),
      value: fundEgressData?.chargedCodeDTO?.name || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_MODE,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_MODE
        ) + '*',
      value: fundEgressData?.paymentModeDTO?.name || '-',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.TRANSACTION_TYPE,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.TRANSACTION_TYPE
      ),
      value: fundEgressData?.transactionTypeDTO?.name || '-',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.AMOUNT_TO_BE_RELEASED,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.AMOUNT_TO_BE_RELEASED
      ),
      value: fundEgressData?.feAmountToBeReleased || '0',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_DATE,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_DATE
        ) + '*',
      value: fundEgressData?.feBeneDateOfPayment || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.VAT_PAYMENT_AMOUNT,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.VAT_PAYMENT_AMOUNT
        ) + '*',
      value: fundEgressData?.feBeneVatPaymentAmt || '0',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.ENGINEER_FEE_PAYMENT_NEEDED,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.ENGINEER_FEE_PAYMENT_NEEDED
      ),
      value: fundEgressData?.feIsEngineerFee || false,
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.ENGINEER_FEES_PAYMENT,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.ENGINEER_FEES_PAYMENT
      ),
      value: fundEgressData?.feCorporatePaymentEngFee || '0',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.BANK_CHARGES,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.BANK_CHARGES
      ),
      value: fundEgressData?.fbbankCharges || '0',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_FROM_CBS,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_FROM_CBS
      ),
      value: fundEgressData?.payoutToBeMadeFromCbsDTO?.name || '-',
    },
    {
      gridSize: 12,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.REVIEW_NOTE,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.REVIEW_NOTE
      ),
      value: fundEgressData?.feDocVerified || false,
    },
  ]

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
            {getLabel(
              MANUAL_PAYMENT_LABELS.SECTION_TITLES.GENERAL_DETAILS,
              'EN',
              MANUAL_PAYMENT_LABELS.FALLBACKS.SECTION_TITLES.GENERAL_DETAILS
            )}
          </Typography>
          {!isReadOnly && (
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

        <Section
          title={getLabel(
            MANUAL_PAYMENT_LABELS.SECTION_TITLES.EXPENSE_TYPE,
            'EN',
            MANUAL_PAYMENT_LABELS.FALLBACKS.SECTION_TITLES.EXPENSE_TYPE
          )}
          fields={expenseType}
        />
        <Section
          title={getLabel(
            MANUAL_PAYMENT_LABELS.SECTION_TITLES.AMOUNT_DETAILS,
            'EN',
            MANUAL_PAYMENT_LABELS.FALLBACKS.SECTION_TITLES.AMOUNT_DETAILS
          )}
          fields={amountDetails}
        />
        <Section
          title={getLabel(
            MANUAL_PAYMENT_LABELS.SECTION_TITLES.NARRATION,
            'EN',
            MANUAL_PAYMENT_LABELS.FALLBACKS.SECTION_TITLES.NARRATION
          )}
          fields={narrationDetails}
        />
        <Section
          title={getLabel(
            MANUAL_PAYMENT_LABELS.SECTION_TITLES.UNIT_CANCELLATION,
            'EN',
            MANUAL_PAYMENT_LABELS.FALLBACKS.SECTION_TITLES.UNIT_CANCELLATION
          )}
          fields={unitCancellation}
        />
      </CardContent>
    </Card>
  )
}

export default Step2
