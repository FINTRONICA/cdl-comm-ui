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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
import { buildPartnerService } from '@/services/api/buildPartnerService'
import { DocumentItem } from '../../DeveloperStepper/developerTypes'

const useIsDarkMode = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return isDark
}

// Utility function to format date from ISO to dd/mm/yyyy
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  } catch (error) {
    return '-'
  }
}

const getLabelSx = (isDark: boolean) => ({
  color: isDark ? '#9CA3AF' : '#6A7282',
  fontFamily: 'Outfit',
  fontWeight: 400,
  fontStyle: 'normal',
  fontSize: '12px',
  letterSpacing: 0,
})

const getValueSx = (isDark: boolean) => ({
  color: isDark ? '#F9FAFB' : '#1E2939',
  fontFamily: 'Outfit',
  fontWeight: 400,
  fontStyle: 'normal',
  fontSize: '14px',
  letterSpacing: 0,
  wordBreak: 'break-word',
})

const fieldBoxSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
}

const renderDisplayField = (
  label: string,
  value: string | number | null = '-',
  isDarkMode: boolean
) => (
  <Box sx={fieldBoxSx}>
    <Typography sx={getLabelSx(isDarkMode)}>{label}</Typography>
    <Typography sx={getValueSx(isDarkMode)}>{value || '-'}</Typography>
  </Box>
)

const renderCheckboxField = (
  label: string,
  checked: boolean,
  isDarkMode: boolean
) => (
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
        color: isDarkMode ? '#E2E8F0' : undefined,
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

const Section = ({
  title,
  fields,
  isDarkMode,
}: SectionProps & { isDarkMode: boolean }) => (
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
        color: isDarkMode ? '#F9FAFB' : undefined,
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
            ? renderCheckboxField(field.label, field.value, isDarkMode)
            : renderDisplayField(field.label, field.value, isDarkMode)}
        </Grid>
      ))}
    </Grid>
  </Box>
)

interface Step2Props {
  onEdit: () => void
  onEditDocuments?: () => void
  isReadOnly?: boolean
}

const Step2 = ({ onEdit, onEditDocuments, isReadOnly = false }: Step2Props) => {
  const [fundEgressData, setFundEgressData] = useState<FundEgressData | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const params = useParams()
  const isDarkMode = useIsDarkMode()

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

        // Fetch documents if payment ID exists
        if (paymentId) {
          try {
            setLoadingDocuments(true)
            const docResponse =
              await buildPartnerService.getBuildPartnerDocuments(
                paymentId,
                'PAYMENTS',
                0,
                100
              )
            const mappedDocuments: DocumentItem[] = docResponse.content.map(
              (doc: any) => ({
                id: doc.id?.toString() || `doc_${Date.now()}`,
                name: doc.documentName || 'Unknown Document',
                size: doc.documentSize
                  ? parseInt(doc.documentSize.replace(' bytes', ''))
                  : 0,
                type: 'application/pdf',
                uploadDate: doc.uploadDate
                  ? new Date(doc.uploadDate)
                  : new Date(),
                status: 'completed' as const,
                url: doc.location,
                classification:
                  doc.documentTypeDTO?.languageTranslationId?.configValue ||
                  doc.documentType?.settingValue ||
                  'N/A',
              })
            )
            setDocuments(mappedDocuments)
          } catch (docErr) {
            console.error('Failed to fetch documents:', docErr)
          } finally {
            setLoadingDocuments(false)
          }
        }
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
      value:
        (fundEgressData?.realEstateAssestDTO as any)?.reaCif ||
        fundEgressData?.realEstateAssestDTO?.reaId ||
        '-',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.PROJECT_STATUS,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PROJECT_STATUS
      ),
      value:
        (fundEgressData?.realEstateAssestDTO?.reaAccountStatusDTO as any)
          ?.languageTranslationId?.configValue ||
        fundEgressData?.realEstateAssestDTO?.reaAccountStatusDTO
          ?.settingValue ||
        (fundEgressData?.realEstateAssestDTO?.reaAccountStatusDTO as any)
          ?.name ||
        '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.ESCROW_ACCOUNT,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.ESCROW_ACCOUNT
        ) + '*',
      value: fundEgressData?.escrowAccountNumber || '-',
    },
    {
      gridSize: 6,
      label: 'Current Balance in Escrow Account*',
      value: fundEgressData?.feCurBalInEscrowAcc || '0',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.SUB_CONSTRUCTION_ACCOUNT,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.SUB_CONSTRUCTION_ACCOUNT
      ),
      value: fundEgressData?.constructionAccountNumber || '-',
    },
    {
      gridSize: 6,
      label: 'Current Balance in Sub Construction Account*',
      value: fundEgressData?.feSubConsAccBalance || '0',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.CORPORATE_ACCOUNT,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.CORPORATE_ACCOUNT
        ) + '*',
      value: fundEgressData?.corporateAccountNumber || '-',
    },
    {
      gridSize: 6,
      label: 'Current Balance in Corporate Account*',
      value: fundEgressData?.feCorporateAccBalance || '0',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.RETENTION_ACCOUNT,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.RETENTION_ACCOUNT
      ),
      value: fundEgressData?.retentionAccountNumber || '-',
    },
    {
      gridSize: 6,
      label: 'Current Balance in Retention Account*',
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
      value:
        (fundEgressData?.expenseTypeDTO as any)?.languageTranslationId
          ?.configValue ||
        fundEgressData?.voucherPaymentTypeDTO?.name ||
        '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_SUB_TYPE,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_SUB_TYPE
        ) + '*',
      value:
        (fundEgressData?.expenseSubTypeDTO as any)?.languageTranslationId
          ?.configValue ||
        fundEgressData?.voucherPaymentSubTypeDTO?.name ||
        '-',
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
      value: formatDate(fundEgressData?.feReraApprovedDate),
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
      value:
        fundEgressData?.invoiceCurrencyDTO?.languageTranslationId
          ?.configValue || '-',
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
      value: formatDate(fundEgressData?.feInvoiceDate),
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
      value:
        fundEgressData?.paymentCurrencyDTO?.languageTranslationId
          ?.configValue || '-',
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

  const paymentExecution = [
    {
      gridSize: 4,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.REGULATOR_APPROVAL_DATE,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.REGULATOR_APPROVAL_DATE
      ),
      value: formatDate(fundEgressData?.feUnitTransferAppDate),
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.CHARGE_MODE,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.CHARGE_MODE
      ),
      value:
        (fundEgressData?.chargedCodeDTO as any)?.languageTranslationId
          ?.configValue || '-',
    },
    {
      gridSize: 6,
      label:
        getLabel(
          MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_MODE,
          'EN',
          MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_MODE
        ) + '*',
      value:
        (fundEgressData?.paymentModeDTO as any)?.languageTranslationId
          ?.configValue || '-',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.TRANSACTION_TYPE,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.TRANSACTION_TYPE
      ),
      value:
        fundEgressData?.transactionTypeDTO?.languageTranslationId
          ?.configValue || '-',
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
      value: formatDate(
        fundEgressData?.feBeneDateOfPayment ||
          fundEgressData?.fePaymentDate ||
          null
      ),
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
      value: (fundEgressData as any)?.fBbankCharges ?? '0',
    },
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.PAYMENT_FROM_CBS,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.PAYMENT_FROM_CBS
      ),
      value:
        (fundEgressData?.payoutToBeMadeFromCbsDTO as any)?.languageTranslationId
          ?.configValue ||
        fundEgressData?.payoutToBeMadeFromCbsDTO?.name ||
        '-',
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
    // Commented out: Unit Number
    // {
    //   gridSize: 6,
    //   label:
    //     getLabel(
    //       MANUAL_PAYMENT_LABELS.FORM_FIELDS.UNIT_NO,
    //       'EN',
    //       MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.UNIT_NO
    //     ) + '*',
    //   value: fundEgressData?.realEstateAssestDTO?.reaNoOfUnits || '-',
    // },
    // Commented out: Tower Name
    // {
    //   gridSize: 6,
    //   label: getLabel(
    //     MANUAL_PAYMENT_LABELS.FORM_FIELDS.TOWER_NAME,
    //     'EN',
    //     MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.TOWER_NAME
    //   ),
    //   value: fundEgressData?.capitalPartnerUnitDTO?.towerName || '-',
    // },
    // Commented out: Unit Status
    // {
    //   gridSize: 6,
    //   label: getLabel(
    //     MANUAL_PAYMENT_LABELS.FORM_FIELDS.UNIT_STATUS,
    //     'EN',
    //     MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.UNIT_STATUS
    //   ),
    //   value: fundEgressData?.capitalPartnerUnitDTO?.unitStatus || '-',
    // },
    // Commented out: Amount Received
    // {
    //   gridSize: 6,
    //   label:
    //     getLabel(
    //       MANUAL_PAYMENT_LABELS.FORM_FIELDS.AMOUNT_RECEIVED,
    //       'EN',
    //       MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.AMOUNT_RECEIVED
    //     ) + '*',
    //   value: fundEgressData?.feAmtRecdFromUnitHolder || '0',
    // },
    // Commented out: Forfeit
    // {
    //   gridSize: 3,
    //   label: getLabel(
    //     MANUAL_PAYMENT_LABELS.FORM_FIELDS.FORFEIT,
    //     'EN',
    //     MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.FORFEIT
    //   ),
    //   value: fundEgressData?.feForFeit || false,
    // },
    // Commented out: Refund to Unit Holder
    // {
    //   gridSize: 3,
    //   label: getLabel(
    //     MANUAL_PAYMENT_LABELS.FORM_FIELDS.REFUND_TO_UNIT_HOLDER,
    //     'EN',
    //     MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.REFUND_TO_UNIT_HOLDER
    //   ),
    //   value: fundEgressData?.feRefundToUnitHolder || false,
    // },
    // Commented out: Transfer to Other Unit
    // {
    //   gridSize: 6,
    //   label: getLabel(
    //     MANUAL_PAYMENT_LABELS.FORM_FIELDS.TRANSFER_TO_OTHER_UNIT,
    //     'EN',
    //     MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.TRANSFER_TO_OTHER_UNIT
    //   ),
    //   value: fundEgressData?.feTransferToOtherUnit || false,
    // },
    // Commented out: Forfeit Amount
    // {
    //   gridSize: 3,
    //   label: getLabel(
    //     MANUAL_PAYMENT_LABELS.FORM_FIELDS.FORFEIT_AMOUNT,
    //     'EN',
    //     MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.FORFEIT_AMOUNT
    //   ),
    //   value: fundEgressData?.feForFeitAmt || '0',
    // },

    // Keep: Regulatory Approval Date
    {
      gridSize: 6,
      label: getLabel(
        MANUAL_PAYMENT_LABELS.FORM_FIELDS.REGULATOR_APPROVAL_DATE,
        'EN',
        MANUAL_PAYMENT_LABELS.FALLBACKS.FORM_FIELDS.REGULATOR_APPROVAL_DATE
      ),
      value: formatDate(fundEgressData?.feUnitTransferAppDate),
    },
  ]

  return (
    <Card
      sx={{
        boxShadow: 'none',
        backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFFBF',
        width: '94%',
        margin: '0 auto',
        border: isDarkMode ? '1px solid #334155' : 'none',
      }}
    >
      <CardContent sx={{ color: isDarkMode ? '#F9FAFB' : 'inherit' }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{
              fontFamily: 'Outfit',
              fontSize: '20px',
              color: isDarkMode ? '#F9FAFB' : undefined,
            }}
          >
            {getLabel(
              MANUAL_PAYMENT_LABELS.SECTION_TITLES.GENERAL_DETAILS,
              'EN',
              MANUAL_PAYMENT_LABELS.FALLBACKS.SECTION_TITLES.GENERAL_DETAILS
            )}
          </Typography>
          {!isReadOnly && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={onEdit}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                color: isDarkMode ? '#93C5FD' : '#6B7280',
                borderColor: isDarkMode ? '#334155' : '#D1D5DB',
                textTransform: 'none',
                '&:hover': {
                  borderColor: isDarkMode ? '#475569' : '#9CA3AF',
                  backgroundColor: isDarkMode
                    ? 'rgba(51, 65, 85, 0.3)'
                    : '#F9FAFB',
                },
              }}
            >
              Edit
            </Button>
          )}
        </Box>
        <Divider
          sx={{ mb: 2, borderColor: isDarkMode ? '#334155' : '#E5E7EB' }}
        />

        <Grid container spacing={3} mb={4} mt={3}>
          {generalDetails.map((field, idx) => (
            <Grid
              size={{ xs: 12, md: field.gridSize }}
              key={`field-${field.label}-${idx}`}
            >
              {typeof field.value === 'boolean'
                ? renderCheckboxField(field.label, field.value, isDarkMode)
                : renderDisplayField(field.label, field.value, isDarkMode)}
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
          isDarkMode={isDarkMode}
        />
        <Section
          title={getLabel(
            MANUAL_PAYMENT_LABELS.SECTION_TITLES.AMOUNT_DETAILS,
            'EN',
            MANUAL_PAYMENT_LABELS.FALLBACKS.SECTION_TITLES.AMOUNT_DETAILS
          )}
          fields={amountDetails}
          isDarkMode={isDarkMode}
        />
        <Section
          title={getLabel(
            MANUAL_PAYMENT_LABELS.SECTION_TITLES.NARRATION,
            'EN',
            MANUAL_PAYMENT_LABELS.FALLBACKS.SECTION_TITLES.NARRATION
          )}
          fields={narrationDetails}
          isDarkMode={isDarkMode}
        />
        <Section
          title={getLabel(
            MANUAL_PAYMENT_LABELS.SECTION_TITLES.UNIT_CANCELLATION,
            'EN',
            MANUAL_PAYMENT_LABELS.FALLBACKS.SECTION_TITLES.UNIT_CANCELLATION
          )}
          fields={unitCancellation}
          isDarkMode={isDarkMode}
        />
        <Section
          title={getLabel(
            MANUAL_PAYMENT_LABELS.PAYMENT_TYPES.OTHERS,
            'EN',
            'Others'
          )}
          fields={paymentExecution}
          isDarkMode={isDarkMode}
        />

        {/* feDocVerified Checkbox - Before Documents */}
        <Box sx={{ mt: 3, mb: 3 }}>
          {renderCheckboxField(
            'Please review the Surety Bond details and documents before submitting the payment. *',
            fundEgressData?.feDocVerified || false,
            isDarkMode
          )}
        </Box>

        {/* Documents Section */}
        <Box mb={4}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '18px',
                lineHeight: '28px',
                letterSpacing: '0.15px',
                verticalAlign: 'middle',
                color: isDarkMode ? '#F9FAFB' : undefined,
              }}
            >
              Documents
            </Typography>
            {!isReadOnly && onEditDocuments && (
              <Button
                startIcon={<EditIcon />}
                onClick={onEditDocuments}
                sx={{
                  fontSize: '14px',
                  textTransform: 'none',
                  color: isDarkMode ? '#93C5FD' : '#2563EB',
                  '&:hover': {
                    backgroundColor: isDarkMode
                      ? 'rgba(51, 65, 85, 0.3)'
                      : '#DBEAFE',
                  },
                }}
              >
                Edit
              </Button>
            )}
          </Box>
          <Divider
            sx={{
              mt: 1,
              mb: 3,
              borderColor: isDarkMode ? '#334155' : '#E5E7EB',
            }}
          />
          {loadingDocuments ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={24} />
              <Typography sx={{ ml: 2, color: isDarkMode ? '#E2E8F0' : '' }}>
                Loading documents...
              </Typography>
            </Box>
          ) : documents.length > 0 ? (
            <TableContainer
              component={Paper}
              sx={{
                boxShadow: 'none',
                border: isDarkMode ? '1px solid #334155' : '1px solid #E5E7EB',
                backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB',
                    }}
                  >
                    <TableCell
                      sx={{
                        ...getLabelSx(isDarkMode),
                        fontWeight: 600,
                        color: isDarkMode ? '#F9FAFB' : '#374151',
                        borderBottom: isDarkMode
                          ? '1px solid #334155'
                          : '1px solid #E5E7EB',
                      }}
                    >
                      Document Name
                    </TableCell>
                    <TableCell
                      sx={{
                        ...getLabelSx(isDarkMode),
                        fontWeight: 600,
                        color: isDarkMode ? '#F9FAFB' : '#374151',
                        borderBottom: isDarkMode
                          ? '1px solid #334155'
                          : '1px solid #E5E7EB',
                      }}
                    >
                      Document Type
                    </TableCell>
                    <TableCell
                      sx={{
                        ...getLabelSx(isDarkMode),
                        fontWeight: 600,
                        color: isDarkMode ? '#F9FAFB' : '#374151',
                        borderBottom: isDarkMode
                          ? '1px solid #334155'
                          : '1px solid #E5E7EB',
                      }}
                    >
                      Upload Date
                    </TableCell>
                    <TableCell
                      sx={{
                        ...getLabelSx(isDarkMode),
                        fontWeight: 600,
                        color: isDarkMode ? '#F9FAFB' : '#374151',
                        borderBottom: isDarkMode
                          ? '1px solid #334155'
                          : '1px solid #E5E7EB',
                      }}
                    >
                      Size
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow
                      key={doc.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#334155' : '#F9FAFB',
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          ...getValueSx(isDarkMode),
                          borderBottom: isDarkMode
                            ? '1px solid #334155'
                            : '1px solid #E5E7EB',
                        }}
                      >
                        {doc.name}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...getValueSx(isDarkMode),
                          borderBottom: isDarkMode
                            ? '1px solid #334155'
                            : '1px solid #E5E7EB',
                        }}
                      >
                        {doc.classification || 'N/A'}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...getValueSx(isDarkMode),
                          borderBottom: isDarkMode
                            ? '1px solid #334155'
                            : '1px solid #E5E7EB',
                        }}
                      >
                        {formatDate(doc.uploadDate?.toISOString())}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...getValueSx(isDarkMode),
                          borderBottom: isDarkMode
                            ? '1px solid #334155'
                            : '1px solid #E5E7EB',
                        }}
                      >
                        {doc.size ? `${(doc.size / 1024).toFixed(2)} KB` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={{ ...getValueSx(isDarkMode), py: 2 }}>
              No documents uploaded
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default Step2
