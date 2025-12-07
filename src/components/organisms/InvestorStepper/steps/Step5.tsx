'use client'

import { useCapitalPartnerLabelsApi } from '@/hooks/useCapitalPartnerLabelsApi'
import { useAppStore } from '@/store'
import React from 'react'
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  Checkbox,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { useRouter } from 'next/navigation'
import { useGetEnhanced } from '@/hooks/useApiEnhanced'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import {
  CapitalPartnerResponse,
  PaymentPlanResponse,
  BankDetailsResponse,
  CapitalPartnerUnitResponse,
  CapitalPartnerUnitPurchaseResponse,
} from '@/types/capitalPartner'
import { GlobalLoading } from '@/components/atoms'
import { useTranslatedBasicDetails } from '@/hooks/useTranslatedBasicDetails'
import {
  DocumentItem,
  ApiDocumentResponse,
  PaginatedDocumentResponse,
} from '../../DeveloperStepper/developerTypes'
import { buildPartnerService } from '@/services/api/buildPartnerService'
import { mapApiToDocumentItem } from '../../DocumentUpload/configs/buildPartnerConfig'
import { useTheme, alpha } from '@mui/material/styles'
import {
  labelSx as sharedLabelSx,
  valueSx as sharedValueSx,
  cardStyles as sharedCardStyles,
  primaryButtonSx,
} from '../styles'

const fieldBoxSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
}

const renderDisplayField = (
  label: string,
  value: string | number | null = '-',
  labelStyles: Record<string, unknown>,
  valueStyles: Record<string, unknown>
) => (
  <Box sx={fieldBoxSx}>
    <Typography sx={labelStyles}>{label}</Typography>
    <Typography sx={valueStyles}>{value || '-'}</Typography>
  </Box>
)

const renderCheckboxField = (
  label: string,
  checked: boolean,
  valueStyles: Record<string, unknown>
) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
    <Checkbox checked={checked} disabled sx={{ p: 0, pr: 1 }} color="primary" />
    <Typography sx={valueStyles}>{label}</Typography>
  </Box>
)

const SectionLoader = ({
  sectionName,
  backgroundColor,
}: {
  sectionName: string
  backgroundColor: string
}) => (
  <Box
    sx={{
      backgroundColor,
      borderRadius: '16px',
      margin: '0 auto',
      width: '100%',
      height: '120px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
    aria-label={`${sectionName} loading`}
    role="status"
  >
    <GlobalLoading fullHeight className="min-h-[120px]" />
  </Box>
)

const SectionError = ({
  sectionName,
  error,
  borderColor,
  backgroundColor,
}: {
  sectionName: string
  error: Error
  borderColor: string
  backgroundColor: string
}) => (
  <Box
    sx={{
      border: `1px solid ${borderColor}`,
      borderRadius: 1,
      backgroundColor,
      p: 2,
    }}
  >
    <Alert
      severity="error"
      sx={{ backgroundColor: 'transparent', color: 'inherit', p: 0 }}
    >
      Failed to load {sectionName}: {error.message}
    </Alert>
  </Box>
)

interface Step5Props {
  capitalPartnerId?: number | null
  isViewMode?: boolean
}

const Step5: React.FC<Step5Props> = ({
  capitalPartnerId,
  isViewMode = false,
}) => {
  const router = useRouter()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { getLabel } = useCapitalPartnerLabelsApi()
  const currentLanguage = useAppStore((state) => state.language)

  const labelStyles = React.useMemo(
    () => (sharedLabelSx as any)(theme),
    [theme]
  )
  const valueStyles = React.useMemo(
    () => ({
      ...(sharedValueSx as any)(theme),
      color: isDark
        ? theme.palette.common.white
        : ((sharedValueSx as any)(theme).color ?? theme.palette.text.primary),
    }),
    [isDark, theme]
  )
  const cardBaseStyles = React.useMemo(
    () => ({
      ...(sharedCardStyles as any)(theme),
      width: '94%',
      margin: '0 auto',
    }),
    [theme]
  )
  const dividerSx = React.useMemo(
    () => ({
      mb: 2,
      borderColor: isDark
        ? alpha(theme.palette.common.white, 0.1)
        : theme.palette.divider,
    }),
    [isDark, theme]
  )
  const editButtonSx = React.useMemo(
    () => ({
      ...(primaryButtonSx as any),
      fontSize: '14px',
      lineHeight: '24px',
      letterSpacing: '0.5px',
      color: isDark ? theme.palette.primary.light : theme.palette.primary.main,
      border: `1px solid ${
        isDark
          ? alpha(theme.palette.primary.light, 0.4)
          : theme.palette.primary.main
      }`,
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        borderColor: theme.palette.primary.main,
      },
    }),
    [isDark, theme]
  )
  const tableContainerStyles = React.useMemo(
    () => ({
      boxShadow: 'none',
      borderRadius: '8px',
      border: `1px solid ${
        isDark
          ? alpha(theme.palette.common.white, 0.12)
          : alpha(theme.palette.divider, 0.7)
      }`,
      backgroundColor: isDark
        ? alpha(theme.palette.background.paper, 0.4)
        : theme.palette.background.paper,
    }),
    [isDark, theme]
  )
  const tableHeaderCellSx = React.useMemo(
    () => ({
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 600,
      fontSize: '14px',
      color: isDark ? theme.palette.common.white : theme.palette.text.primary,
      borderBottom: `1px solid ${
        isDark
          ? alpha(theme.palette.common.white, 0.16)
          : alpha(theme.palette.divider, 0.9)
      }`,
    }),
    [isDark, theme]
  )
  const tableBodyCellSx = React.useMemo(
    () => ({
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: isDark ? theme.palette.common.white : theme.palette.text.primary,
      borderBottom: `1px solid ${
        isDark
          ? alpha(theme.palette.common.white, 0.1)
          : alpha(theme.palette.divider, 0.5)
      }`,
    }),
    [isDark, theme]
  )
  const tableHeadRowSx = React.useMemo(
    () => ({
      backgroundColor: isDark
        ? alpha(theme.palette.common.white, 0.08)
        : alpha('#F9FAFB', 0.9),
    }),
    [isDark, theme]
  )
  const tableRowHoverSx = React.useMemo(
    () => ({
      '&:hover': {
        backgroundColor: isDark
          ? alpha(theme.palette.primary.main, 0.08)
          : alpha('#F9FAFB', 0.9),
      },
    }),
    [isDark, theme]
  )
  const neutralTextSx = React.useMemo(
    () => ({
      color: isDark ? alpha(theme.palette.common.white, 0.7) : '#6A7282',
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
    }),
    [isDark, theme]
  )
  const loaderBackground = React.useMemo(
    () =>
      isDark
        ? alpha(theme.palette.background.paper, 0.3)
        : alpha('#FFFFFF', 0.75),
    [isDark, theme]
  )
  const errorBorderColor = React.useMemo(
    () =>
      isDark
        ? alpha(theme.palette.error.main, 0.5)
        : alpha(theme.palette.error.main, 0.3),
    [isDark, theme]
  )
  const errorBackground = React.useMemo(
    () =>
      isDark
        ? alpha(theme.palette.error.main, 0.1)
        : alpha(theme.palette.error.main, 0.08),
    [isDark, theme]
  )

  const handleEditBasicDetails = () => {
    if (capitalPartnerId) {
      router.push(`/capital-partner/${capitalPartnerId}/step/1`)
    }
  }

  const handleEditUnitDetails = () => {
    if (capitalPartnerId) {
      router.push(`/capital-partner/${capitalPartnerId}/step/3`)
    }
  }

  const handleEditPaymentPlan = () => {
    if (capitalPartnerId) {
      router.push(`/capital-partner/${capitalPartnerId}/step/4`)
    }
  }

  const handleEditBankDetails = () => {
    if (capitalPartnerId) {
      router.push(`/capital-partner/${capitalPartnerId}/step/5`)
    }
  }

  const {
    data: capitalPartnerData,
    isLoading: isLoadingBasic,
    error: errorBasic,
  } = useGetEnhanced<CapitalPartnerResponse>(
    API_ENDPOINTS.CAPITAL_PARTNER.GET_BY_ID(capitalPartnerId?.toString() || ''),
    {},
    {
      enabled: !!capitalPartnerId,
      // Disable caching to always fetch fresh data
      gcTime: 0,
      staleTime: 0,
      // Always refetch when component mounts
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
    }
  )
  const {
    data: paymentPlanData,
    isLoading: isLoadingPayment,
    error: errorPayment,
  } = useGetEnhanced<PaymentPlanResponse[]>(
    `${API_ENDPOINTS.CAPITAL_PARTNER_PAYMENT_PLAN.GET_ALL}?capitalPartnerId.equals=${capitalPartnerId}&deleted.equals=false&enabled.equals=true`,
    {},
    {
      enabled: !!capitalPartnerId,
      // Disable caching to always fetch fresh data
      gcTime: 0,
      staleTime: 0,
      // Always refetch when component mounts
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
    }
  )
  const {
    data: bankDetailsData,
    isLoading: isLoadingBank,
    error: errorBank,
  } = useGetEnhanced<BankDetailsResponse[]>(
    `${API_ENDPOINTS.CAPITAL_PARTNER_BANK_INFO.GET_ALL}?capitalPartnerId.equals=${capitalPartnerId}`,
    {},
    {
      enabled: !!capitalPartnerId,
      // Disable caching to always fetch fresh data
      gcTime: 0,
      staleTime: 0,
      // Always refetch when component mounts
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
    }
  )
  const {
    data: unitDetailsData,
    isLoading: isLoadingUnit,
    error: errorUnit,
  } = useGetEnhanced<CapitalPartnerUnitResponse[]>(
    capitalPartnerId
      ? `${API_ENDPOINTS.CAPITAL_PARTNER_UNIT.GET_ALL}?capitalPartnerId.equals=${capitalPartnerId}`
      : '',
    {},
    {
      enabled: !!capitalPartnerId,
      // Disable caching to always fetch fresh data
      gcTime: 0,
      staleTime: 0,
      // Always refetch when component mounts
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
    }
  )
  const unitId =
    unitDetailsData && unitDetailsData.length > 0
      ? unitDetailsData[0]?.id
      : null
  const isUnitDetailsReady = !isLoadingUnit && !errorUnit && !!unitId
  const {
    data: unitPurchaseData,
    isLoading: isLoadingPurchase,
    error: errorPurchase,
  } = useGetEnhanced<CapitalPartnerUnitPurchaseResponse[]>(
    `${API_ENDPOINTS.CAPITAL_PARTNER_UNIT_PURCHASE.GET_ALL}?capitalPartnerUnitId.equals=${unitId || 0}`,
    {},
    {
      enabled: isUnitDetailsReady && !!unitId,
      // Disable caching to always fetch fresh data
      gcTime: 0,
      staleTime: 0,
      // Always refetch when component mounts
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
    }
  )
  const {
    investorType: translatedInvestorType,
    investorIdType: translatedInvestorIdType,
    nationality: translatedNationality,
    unitStatus: translatedUnitStatus,
    payMode: translatedPayMode,
    loading: loadingTranslations,
  } = useTranslatedBasicDetails(
    capitalPartnerData,
    unitDetailsData,
    bankDetailsData
  )
  const sectionLoadingStates = {
    basicDetails: isLoadingBasic,
    unitDetails: Boolean(
      isLoadingUnit || (isUnitDetailsReady && isLoadingPurchase)
    ),
    paymentPlan: isLoadingPayment,
    bankDetails: isLoadingBank,
  }
  const sectionErrorStates = {
    basicDetails: errorBasic,
    unitDetails: errorUnit || errorPurchase,
    paymentPlan: errorPayment,
    bankDetails: errorBank,
  }
  const [documents, setDocuments] = React.useState<DocumentItem[]>([])
  const [isLoadingDocuments, setIsLoadingDocuments] = React.useState(false)
  const [documentsError, setDocumentsError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (!capitalPartnerId) {
      setDocuments([])
      setDocumentsError(null)
      return
    }

    const loadDocuments = async () => {
      setIsLoadingDocuments(true)
      setDocumentsError(null)

      try {
        const response = await buildPartnerService.getBuildPartnerDocuments(
          capitalPartnerId.toString(),
          'CAPITAL_PARTNER',
          0,
          50
        )

        let apiDocuments: ApiDocumentResponse[] = []

        if (Array.isArray(response)) {
          apiDocuments = response as ApiDocumentResponse[]
        } else if (response && 'content' in response) {
          const paginated = response as PaginatedDocumentResponse
          apiDocuments = paginated?.content ?? []
        }

        const mappedDocuments = apiDocuments.map(mapApiToDocumentItem)
        setDocuments(mappedDocuments)
      } catch (error) {
        setDocumentsError(
          error instanceof Error ? error : new Error('Failed to load documents')
        )
      } finally {
        setIsLoadingDocuments(false)
      }
    }

    loadDocuments()
  }, [capitalPartnerId])
  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }
  const formatDocumentDate = (dateValue?: Date | string | null): string => {
    if (!dateValue) return '-'
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString()
    }
    return formatDate(dateValue)
  }
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
    }).format(amount)
  }
  const getBankDetailsFields = () => {
    if (!bankDetailsData || bankDetailsData.length === 0) return []

    const bankData = bankDetailsData[0]
    if (!bankData) return []

    return [
      {
        gridSize: 6,
        label: getLabel('CDL_CP_PAY_MODE', currentLanguage, 'Pay Mode'),
        value: loadingTranslations ? 'Loading...' : translatedPayMode,
      },
      {
        gridSize: 6,
        label: getLabel('CDL_CP_PAYEE_NAME', currentLanguage, 'Payee Name'),
        value: bankData.cpbiPayeeName || '-',
      },
      {
        gridSize: 6,
        label: getLabel('CDL_CP_BANK_NAME', currentLanguage, 'Bank Name'),
        value: bankData.cpbiBankName || '-',
      },
      {
        gridSize: 6,
        label: getLabel(
          'CDL_CP_ROUTING_CODE',
          currentLanguage,
          'Beneficiary Routing Code'
        ),
        value: bankData.cpbiBeneRoutingCode || '-',
      },
      {
        gridSize: 6,
        label: getLabel(
          'CDL_CP_ACCOUNT_NUMBER',
          currentLanguage,
          'Account Number'
        ),
        value: bankData.cpbiAccountNumber || '-',
      },
      {
        gridSize: 6,
        label: getLabel(
          'CDL_CP_PAYEE_ADDRESS',
          currentLanguage,
          'Payee Address'
        ),
        value: bankData.cpbiPayeeAddress || '-',
      },
      {
        gridSize: 6,
        label: getLabel('CDL_CP_BANK_ADDRESS', currentLanguage, 'Bank Address'),
        value: bankData.cpbiBankAddress || '-',
      },
      {
        gridSize: 6,
        label: getLabel('CDL_CP_BIC_CODE', currentLanguage, 'BIC'),
        value: bankData.cpbiBicCode || '-',
      },
    ]
  }

  const bankDetailsFields = getBankDetailsFields()
  const getBasicFields = () => {
    if (!capitalPartnerData) return []

    return [
      {
        gridSize: 6,
        label: getLabel('CDL_CP_TYPE', currentLanguage, 'Investor Type*'),
        value: loadingTranslations ? 'Loading...' : translatedInvestorType,
      },
      {
        gridSize: 6,
        label: getLabel('CDL_CP_REFID', currentLanguage, 'Investor ID*'),
        value: capitalPartnerData.capitalPartnerId || '-',
      },
      {
        gridSize: 3,
        label: getLabel('CDL_CP_FIRSTNAME', currentLanguage, 'Investor Name*'),
        value: capitalPartnerData.capitalPartnerName || '-',
      },
      {
        gridSize: 3,
        label: getLabel('CDL_CP_MIDDLENAME', currentLanguage, 'Middle Name*'),
        value: capitalPartnerData.capitalPartnerMiddleName || '-',
      },
      {
        gridSize: 6,
        label: getLabel('CDL_CP_LASTNAME', currentLanguage, 'Last Name*'),
        value: capitalPartnerData.capitalPartnerLastName || '-',
      },
      {
        gridSize: 12,
        label: getLabel('CDL_CP_LOCALE_NAME', currentLanguage, 'Arabic Name'),
        value: capitalPartnerData.capitalPartnerLocaleName || '-',
      },
      {
        gridSize: 6,
        label: getLabel(
          'CDL_CP_OWNERSHIP',
          currentLanguage,
          'Ownership Percentage'
        ),
        value:
          capitalPartnerData.capitalPartnerOwnershipPercentage?.toString() ||
          '-',
      },
      {
        gridSize: 6,
        label: getLabel('CDL_CP_ID_TYPE', currentLanguage, 'Investor ID Type*'),
        value: loadingTranslations ? 'Loading...' : translatedInvestorIdType,
      },
      {
        gridSize: 6,
        label: getLabel('CDL_CP_DOC_NO', currentLanguage, 'ID No.'),
        value: capitalPartnerData.capitalPartnerIdNo || '-',
      },
      {
        gridSize: 6,
        label: getLabel('CDL_CP_ID_EXP', currentLanguage, 'ID Expiry Date'),
        value: formatDate(capitalPartnerData.idExpiaryDate),
      },
      {
        gridSize: 6,
        label: getLabel('CDL_CP_NATIONALITY', currentLanguage, 'Nationality*'),
        value: loadingTranslations ? 'Loading...' : translatedNationality,
      },
      {
        gridSize: 6,
        label: getLabel(
          'CDL_CP_TELEPHONE',
          currentLanguage,
          'Account Contact Number'
        ),
        value: capitalPartnerData.capitalPartnerTelephoneNo || '-',
      },
      {
        gridSize: 6,
        label: getLabel('CDL_CP_MOBILE', currentLanguage, 'Mobile Number'),
        value: capitalPartnerData.capitalPartnerMobileNo || '-',
      },
      {
        gridSize: 6,
        label: getLabel('CDL_CP_EMAIL', currentLanguage, 'Email Address'),
        value: capitalPartnerData.capitalPartnerEmail || '-',
      },
    ]
  }

  const basicFields = getBasicFields()
  const getUnitFields = (
    purchaseData?: CapitalPartnerUnitPurchaseResponse | null
  ) => {
    if (!unitDetailsData || unitDetailsData.length === 0) return []

    const unitData = unitDetailsData[0]
    if (!unitData) return []

    return [
      {
        gridSize: 6,
        label: getLabel('CDL_CP_BPA_NAME', currentLanguage, 'Project Name*'),
        value: unitData.realEstateAssestDTO?.reaName || '-',
      },
      {
        gridSize: 6,
        label: getLabel('CDL_CP_PROP_NUMBER', currentLanguage, 'Project ID*'),
        value: unitData.realEstateAssestDTO?.reaId || '-',
      },
      {
        gridSize: 6,
        label: getLabel('CDL_CP_BP_ID', currentLanguage, 'Developer ID*'),
        value: unitData.realEstateAssestDTO?.reaReraNumber || '-',
      },
      {
        gridSize: 6,
        label: getLabel('CDL_CP_BP_NAME', currentLanguage, 'Developer Name*'),
        value: unitData.realEstateAssestDTO?.reaManagedBy || '-',
      },
      {
        gridSize: 3,
        label: getLabel('CDL_CP_FLOOR', currentLanguage, 'Floor'),
        value: unitData.floor || '-',
      },
      {
        gridSize: 3,
        label: getLabel('CDL_CP_NOOF_BED', currentLanguage, 'No. of Bedroom'),
        value: unitData.noofBedroom || '-',
      },
      {
        gridSize: 3,
        label: getLabel(
          'CDL_CP_UNIT_NUMBER',
          currentLanguage,
          'Unit no. Oqood format*'
        ),
        value: unitData.unitRefId || '-',
      },
      {
        gridSize: 3,
        label: getLabel('CDL_CP_UNIT_STATUS', currentLanguage, 'Unit Status*'),
        value: loadingTranslations ? 'Loading...' : translatedUnitStatus,
      },
      {
        gridSize: 6,
        label: getLabel(
          'CDL_CP_BUILDING_NAME',
          currentLanguage,
          'Building Name'
        ),
        value: unitData.towerName || '-',
      },
      {
        gridSize: 6,
        label: getLabel('CDL_CP_PLOT_SIZE', currentLanguage, 'Plot Size*'),
        value: unitData.unitPlotSize || '-',
      },
      {
        gridSize: 6,
        label: getLabel('CDL_CP_PROP_NUMBER', currentLanguage, 'Property ID*'),
        value:
          unitData.propertyIdDTO?.languageTranslationId?.configValue ||
          unitData.propertyIdDTO?.settingValue ||
          '-',
      },
      {
        gridSize: 6,
        label: getLabel('CDL_CP_UNIT_IBAN', currentLanguage, 'Unit IBAN'),
        value: unitData.virtualAccNo || '-',
      },
      {
        gridSize: 3,
        label: getLabel(
          'CDL_CP_REG_FEE',
          currentLanguage,
          'Unit Registration Fees'
        ),
        value: purchaseData?.cpupUnitRegistrationFee
          ? formatCurrency(purchaseData.cpupUnitRegistrationFee)
          : '0.00',
      },
      {
        gridSize: 3,
        label: getLabel('CDL_CP_AGENT_NAME', currentLanguage, 'Agent Name'),
        value: purchaseData?.cpupAgentName || '-',
      },
      {
        gridSize: 3,
        label: getLabel(
          'CDL_CP_AGENT_ID',
          currentLanguage,
          'Agent National ID'
        ),
        value: purchaseData?.cpupAgentId || '-',
      },
      {
        gridSize: 3,
        label: getLabel(
          'CDL_CP_GROSS_PRICE',
          currentLanguage,
          'Gross Sale Price'
        ),
        value: purchaseData?.cpupGrossSaleprice
          ? formatCurrency(purchaseData.cpupGrossSaleprice)
          : '246,578.00',
      },
    ]
  }

  const purchaseDataForUnitFields =
    unitPurchaseData && unitPurchaseData.length > 0 ? unitPurchaseData[0] : null

  const unitFields = getUnitFields(purchaseDataForUnitFields)
  const getCheckboxAndAdditionalFields = () => {
    if (!unitDetailsData || unitDetailsData.length === 0) {
      return {
        checkboxFieldsRow1: [
          {
            label: getLabel(
              'CDL_CP_VAT_APPLICABLE',
              currentLanguage,
              'VAT Applicable'
            ),
            checked: false,
          },
          {
            label: getLabel(
              'CDL_CP_SPA',
              currentLanguage,
              'Sale Purchase Agreement'
            ),
            checked: false,
          },
          {
            label: getLabel(
              'CDL_CP_PAYMENT_PLAN',
              currentLanguage,
              'Project Payment Plan'
            ),
            checked: false,
          },
        ],
        checkboxFieldsRow2: [
          {
            gridSize: 3,
            label: getLabel('CDL_CP_NET_PRICE', currentLanguage, 'Sale Price'),
            value: '-',
          },
          {
            gridSize: 3,
            label: getLabel('CDL_CP_DEED_REF_NO', currentLanguage, 'Deed No'),
            value: '-',
          },
          {
            gridSize: 3,
            label: getLabel(
              'CDL_CP_CONTRACT_NO',
              currentLanguage,
              'Contract No'
            ),
            value: '-',
          },
          {
            gridSize: 3,
            label: getLabel(
              'CDL_CP_AGREEMENT_DATE',
              currentLanguage,
              'Agreement Date'
            ),
            value: '-',
          },
        ],
        checkboxFieldsRow3: [
          {
            label: getLabel(
              'CDL_CP_MODIFICATION_FEE_NEEDED',
              currentLanguage,
              'Modification Fee Needed'
            ),
            checked: false,
          },
          {
            label: getLabel(
              'CDL_CP_RESERVATION_BOOKING_FORM',
              currentLanguage,
              'Reservation Booking Form'
            ),
            checked: false,
          },
          {
            label: getLabel('CDL_CP_OQOOD_PAID', currentLanguage, 'Oqood Paid'),
            checked: false,
          },
        ],
        remainingFields: [
          {
            gridSize: 6,
            label: getLabel(
              'CDL_CP_WORLD_STATUS',
              currentLanguage,
              'World Check'
            ),
            value: 'No',
          },
          {
            gridSize: 6,
            label: getLabel(
              'CDL_CP_WITH_ESCROW',
              currentLanguage,
              'Amount Paid to Developer within Escrow'
            ),
            value: '-',
          },
          {
            gridSize: 6,
            label: getLabel(
              'CDL_CP_OUTSIDE_ESCROW',
              currentLanguage,
              'Amount Paid to Developer out of Escrow'
            ),
            value: '-',
          },
          {
            gridSize: 6,
            label: getLabel(
              'CDL_CP_PARTNER_PAYMENT',
              currentLanguage,
              'Total Amount Paid'
            ),
            value: '-',
          },
          {
            gridSize: 3,
            label: getLabel(
              'CDL_CP_OQOOD_PAID',
              currentLanguage,
              'Oqood Amount Paid'
            ),
            value: '-',
          },
          {
            gridSize: 3,
            label: getLabel(
              'CDL_CP_UNIT_AREA',
              currentLanguage,
              'Unit Area Size'
            ),
            value: '-',
          },
          {
            gridSize: 3,
            label: getLabel(
              'CDL_CP_FORFEIT_AMOUNT',
              currentLanguage,
              'Forfeit Amount'
            ),
            value: '-',
          },
          {
            gridSize: 3,
            label: getLabel('CDL_CP_DLD_FEE', currentLanguage, 'Dld Amount'),
            value: '-',
          },
          {
            gridSize: 6,
            label: getLabel(
              'CDL_CP_REFUND_AMOUNT',
              currentLanguage,
              'Refund Amount'
            ),
            value: '-',
          },
          {
            gridSize: 6,
            label: getLabel(
              'CDL_CP_TRANS_AMT',
              currentLanguage,
              'Transferred Amount'
            ),
            value: '-',
          },
          {
            gridSize: 12,
            label: getLabel('CDL_CP_REMARKS', currentLanguage, 'Remarks'),
            value: '-',
          },
        ],
      }
    }

    const unitData = unitDetailsData[0]
    if (!unitData) {
      return {
        checkboxFieldsRow1: [
          {
            label: getLabel(
              'CDL_CP_VAT_APPLICABLE',
              currentLanguage,
              'VAT Applicable'
            ),
            checked: false,
          },
          {
            label: getLabel(
              'CDL_CP_SPA',
              currentLanguage,
              'Sale Purchase Agreement'
            ),
            checked: false,
          },
          {
            label: getLabel(
              'CDL_CP_PAYMENT_PLAN',
              currentLanguage,
              'Project Payment Plan'
            ),
            checked: false,
          },
        ],
        checkboxFieldsRow2: [
          {
            gridSize: 3,
            label: getLabel('CDL_CP_NET_PRICE', currentLanguage, 'Sale Price'),
            value: '-',
          },
          {
            gridSize: 3,
            label: getLabel('CDL_CP_DEED_REF_NO', currentLanguage, 'Deed No'),
            value: '-',
          },
          {
            gridSize: 3,
            label: getLabel(
              'CDL_CP_CONTRACT_NO',
              currentLanguage,
              'Contract No'
            ),
            value: '-',
          },
          {
            gridSize: 3,
            label: getLabel(
              'CDL_CP_AGREEMENT_DATE',
              currentLanguage,
              'Agreement Date'
            ),
            value: '-',
          },
        ],
        checkboxFieldsRow3: [
          {
            label: getLabel(
              'CDL_CP_MODIFICATION_FEE_NEEDED',
              currentLanguage,
              'Modification Fee Needed'
            ),
            checked: false,
          },
          {
            label: getLabel(
              'CDL_CP_RESERVATION_BOOKING_FORM',
              currentLanguage,
              'Reservation Booking Form'
            ),
            checked: false,
          },
          {
            label: getLabel('CDL_CP_OQOOD_PAID', currentLanguage, 'Oqood Paid'),
            checked: false,
          },
        ],
        remainingFields: [
          {
            gridSize: 6,
            label: getLabel(
              'CDL_CP_WORLD_STATUS',
              currentLanguage,
              'World Check'
            ),
            value: 'No',
          },
          {
            gridSize: 6,
            label: getLabel(
              'CDL_CP_WITH_ESCROW',
              currentLanguage,
              'Amount Paid to Developer within Escrow'
            ),
            value: '-',
          },
          {
            gridSize: 6,
            label: getLabel(
              'CDL_CP_OUTSIDE_ESCROW',
              currentLanguage,
              'Amount Paid to Developer out of Escrow'
            ),
            value: '-',
          },
          {
            gridSize: 6,
            label: getLabel(
              'CDL_CP_PARTNER_PAYMENT',
              currentLanguage,
              'Total Amount Paid'
            ),
            value: '-',
          },
          {
            gridSize: 3,
            label: getLabel(
              'CDL_CP_OQOOD_PAID',
              currentLanguage,
              'Oqood Amount Paid'
            ),
            value: '-',
          },
          {
            gridSize: 3,
            label: getLabel(
              'CDL_CP_UNIT_AREA',
              currentLanguage,
              'Unit Area Size'
            ),
            value: '-',
          },
          {
            gridSize: 3,
            label: getLabel(
              'CDL_CP_FORFEIT_AMOUNT',
              currentLanguage,
              'Forfeit Amount'
            ),
            value: '-',
          },
          {
            gridSize: 3,
            label: getLabel('CDL_CP_DLD_FEE', currentLanguage, 'Dld Amount'),
            value: '-',
          },
          {
            gridSize: 6,
            label: getLabel(
              'CDL_CP_REFUND_AMOUNT',
              currentLanguage,
              'Refund Amount'
            ),
            value: '-',
          },
          {
            gridSize: 6,
            label: getLabel(
              'CDL_CP_TRANS_AMT',
              currentLanguage,
              'Transferred Amount'
            ),
            value: '-',
          },
          {
            gridSize: 12,
            label: getLabel('CDL_CP_REMARKS', currentLanguage, 'Remarks'),
            value: '-',
          },
        ],
      }
    }

    const purchaseData =
      unitPurchaseData && unitPurchaseData.length > 0
        ? unitPurchaseData[0]
        : null

    return {
      checkboxFieldsRow1: [
        {
          label: getLabel(
            'CDL_CP_VAT_APPLICABLE',
            currentLanguage,
            'VAT Applicable'
          ),
          checked: purchaseData?.cpupVatApplicable || false,
        },
        {
          label: getLabel(
            'CDL_CP_SPA',
            currentLanguage,
            'Sale Purchase Agreement'
          ),
          checked: purchaseData?.cpupSalePurchaseAgreement || false,
        },
        {
          label: getLabel(
            'CDL_CP_PAYMENT_PLAN',
            currentLanguage,
            'Project Payment Plan'
          ),
          checked: purchaseData?.cpupProjectPaymentPlan || false,
        },
      ],
      checkboxFieldsRow2: [
        {
          gridSize: 3,
          label: getLabel('CDL_CP_NET_PRICE', currentLanguage, 'Sale Price'),
          value: purchaseData?.cpupSalePrice
            ? formatCurrency(purchaseData.cpupSalePrice)
            : '-',
        },
        {
          gridSize: 3,
          label: getLabel('CDL_CP_DEED_REF_NO', currentLanguage, 'Deed No'),
          value: purchaseData?.cpupDeedNo || '-',
        },
        {
          gridSize: 3,
          label: getLabel('CDL_CP_CONTRACT_NO', currentLanguage, 'Contract No'),
          value: purchaseData?.cpupAgreementNo || '-',
        },
        {
          gridSize: 3,
          label: getLabel(
            'CDL_CP_AGREEMENT_DATE',
            currentLanguage,
            'Agreement Date'
          ),
          value: purchaseData?.cpupAgreementDate
            ? formatDate(purchaseData.cpupAgreementDate)
            : '-',
        },
      ],
      checkboxFieldsRow3: [
        {
          label: getLabel(
            'CDL_CP_FEE_REQ',
            currentLanguage,
            'Modification Fee Needed'
          ),
          checked: purchaseData?.cpupModificationFeeNeeded || false,
        },
        {
          label: getLabel(
            'CDL_CP_BOOKING',
            currentLanguage,
            'Reservation Booking Form'
          ),
          checked: purchaseData?.cpupReservationBookingForm || false,
        },
        {
          label: getLabel('CDL_CP_OQOOD_PAID', currentLanguage, 'Oqood Paid'),
          checked: purchaseData?.cpupOqoodPaid || false,
        },
      ],
      remainingFields: [
        {
          gridSize: 6,
          label: getLabel(
            'CDL_CP_WORLD_STATUS',
            currentLanguage,
            'World Check'
          ),
          value: purchaseData?.cpupWorldCheck ? 'Yes' : 'No',
        },
        {
          gridSize: 6,
          label: getLabel(
            'CDL_CP_WITH_ESCROW',
            currentLanguage,
            'Amount Paid to Developer within Escrow'
          ),
          value: purchaseData?.cpupAmtPaidToDevInEscorw
            ? formatCurrency(purchaseData.cpupAmtPaidToDevInEscorw)
            : '-',
        },
        {
          gridSize: 6,
          label: getLabel(
            'CDL_CP_OUTSIDE_ESCROW',
            currentLanguage,
            'Amount Paid to Developer out of Escrow'
          ),
          value: purchaseData?.cpupAmtPaidToDevOutEscorw
            ? formatCurrency(purchaseData.cpupAmtPaidToDevOutEscorw)
            : '-',
        },
        {
          gridSize: 6,
          label: getLabel(
            'CDL_CP_PARTNER_PAYMENT',
            currentLanguage,
            'Total Amount Paid'
          ),
          value: purchaseData?.cpupTotalAmountPaid
            ? formatCurrency(purchaseData.cpupTotalAmountPaid)
            : '-',
        },
        {
          gridSize: 3,
          label: getLabel(
            'CDL_CP_OQOOD_PAID',
            currentLanguage,
            'Oqood Amount Paid'
          ),
          value: purchaseData?.cpupOqoodAmountPaid || '-',
        },
        {
          gridSize: 3,
          label: getLabel(
            'CDL_CP_UNIT_AREA',
            currentLanguage,
            'Unit Area Size'
          ),
          value: purchaseData?.cpupUnitAreaSize || '-',
        },
        {
          gridSize: 3,
          label: getLabel(
            'CDL_CP_FORFEIT_AMOUNT',
            currentLanguage,
            'Forfeit Amount'
          ),
          value: purchaseData?.cpupForfeitAmount || '-',
        },
        {
          gridSize: 3,
          label: getLabel('CDL_CP_DLD_FEE', currentLanguage, 'Dld Amount'),
          value: purchaseData?.cpupDldAmount || '-',
        },
        {
          gridSize: 6,
          label: getLabel(
            'CDL_CP_REFUND_AMOUNT',
            currentLanguage,
            'Refund Amount'
          ),
          value: purchaseData?.cpupRefundAmount || '-',
        },
        {
          gridSize: 6,
          label: getLabel(
            'CDL_CP_TRANS_AMT',
            currentLanguage,
            'Transferred Amount'
          ),
          value: purchaseData?.cpupTransferredAmount || '-',
        },
        {
          gridSize: 12,
          label: getLabel('CDL_CP_REMARKS', currentLanguage, 'Remarks'),
          value: purchaseData?.cpupRemarks || '-',
        },
      ],
    }
  }

  const {
    checkboxFieldsRow1,
    checkboxFieldsRow2,
    checkboxFieldsRow3,
    remainingFields,
  } = getCheckboxAndAdditionalFields()
  const renderSectionContent = (
    sectionName: string,
    isLoading: boolean,
    error: Error | null,
    content: React.ReactNode
  ) => {
    if (isLoading) {
      return (
        <SectionLoader
          sectionName={sectionName}
          backgroundColor={loaderBackground}
        />
      )
    }
    if (error) {
      return (
        <SectionError
          sectionName={sectionName}
          error={error}
          borderColor={errorBorderColor}
          backgroundColor={errorBackground}
        />
      )
    }
    return content
  }

  return (
    <Card sx={cardBaseStyles}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
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
            {getLabel('CDL_CP_BASIC_INFO', currentLanguage, 'Basic Details')}
          </Typography>
          {!isViewMode && (
            <Button
              startIcon={<EditIcon />}
              onClick={handleEditBasicDetails}
              sx={editButtonSx}
            >
              Edit
            </Button>
          )}
        </Box>
        <Divider sx={dividerSx} />
        {renderSectionContent(
          getLabel('CDL_CP_BASIC_INFO', currentLanguage, 'Basic Details'),
          sectionLoadingStates.basicDetails,
          sectionErrorStates.basicDetails,
          <Grid container spacing={3}>
            {basicFields.map((field, idx) => (
              <Grid size={{ xs: 12, md: field.gridSize }} key={`basic-${idx}`}>
                {renderDisplayField(
                  field.label,
                  field.value,
                  labelStyles,
                  valueStyles
                )}
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>

      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
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
            {getLabel(
              'CDL_CP_DOCUMENTS',
              currentLanguage,
              'Submitted Documents'
            )}
          </Typography>
          {!isViewMode && capitalPartnerId && (
            <Button
              startIcon={<EditIcon />}
              onClick={() =>
                router.push(`/capital-partner/${capitalPartnerId}/step/2`)
              }
              sx={editButtonSx}
            >
              Edit
            </Button>
          )}
        </Box>
        <Divider sx={dividerSx} />
        {renderSectionContent(
          getLabel('CDL_CP_DOCUMENTS', currentLanguage, 'Submitted Documents'),
          isLoadingDocuments,
          documentsError,
          documents.length > 0 ? (
            <TableContainer component={Paper} sx={tableContainerStyles}>
              <Table>
                <TableHead>
                  <TableRow sx={tableHeadRowSx}>
                    <TableCell sx={tableHeaderCellSx}>Name</TableCell>
                    <TableCell sx={tableHeaderCellSx}>Date</TableCell>
                    <TableCell sx={tableHeaderCellSx}>Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id} sx={tableRowHoverSx}>
                      <TableCell sx={tableBodyCellSx}>
                        {doc.name || 'Document'}
                      </TableCell>
                      <TableCell sx={tableBodyCellSx}>
                        {formatDocumentDate(doc.uploadDate)}
                      </TableCell>
                      <TableCell sx={tableBodyCellSx}>
                        {doc.classification || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={neutralTextSx}>
              {getLabel(
                'CDL_CP_NO_DOCUMENTS',
                currentLanguage,
                'No documents uploaded.'
              )}
            </Typography>
          )
        )}
      </CardContent>

      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
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
            {getLabel('CDL_CP_UNIT_DETAILS', currentLanguage, 'Unit Details')}
          </Typography>
          {!isViewMode && (
            <Button
              startIcon={<EditIcon />}
              onClick={handleEditUnitDetails}
              sx={editButtonSx}
            >
              Edit
            </Button>
          )}
        </Box>
        <Divider sx={dividerSx} />
        {renderSectionContent(
          getLabel('CDL_CP_UNIT_DETAILS', currentLanguage, 'Unit Details'),
          sectionLoadingStates.unitDetails,
          sectionErrorStates.unitDetails,
          <Grid container spacing={3}>
            {unitFields.map((field, idx) => (
              <Grid size={{ xs: 12, md: field.gridSize }} key={`unit-${idx}`}>
                {renderDisplayField(
                  field.label,
                  field.value,
                  labelStyles,
                  valueStyles
                )}
              </Grid>
            ))}
            {checkboxFieldsRow1.map((field, idx) => (
              <Grid size={{ xs: 12, md: 4 }} key={`checkbox-row1-${idx}`}>
                {renderCheckboxField(field.label, field.checked, valueStyles)}
              </Grid>
            ))}
            {checkboxFieldsRow2.map((field, idx) => (
              <Grid
                size={{ xs: 12, md: field.gridSize }}
                key={`unit-checkbox-row2-${idx}`}
              >
                {renderDisplayField(
                  field.label,
                  field.value,
                  labelStyles,
                  valueStyles
                )}
              </Grid>
            ))}
            {checkboxFieldsRow3.map((field, idx) => (
              <Grid size={{ xs: 12, md: 4 }} key={`checkbox-row3-${idx}`}>
                {renderCheckboxField(field.label, field.checked, valueStyles)}
              </Grid>
            ))}
            {remainingFields.map((field, idx) => (
              <Grid
                size={{ xs: 12, md: field.gridSize }}
                key={`unit-remaining-${idx}`}
              >
                {renderDisplayField(
                  field.label,
                  field.value,
                  labelStyles,
                  valueStyles
                )}
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>

      {/* Payment Plan Section */}
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
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
            {getLabel('CDL_CP_PAYMENT_PLAN', currentLanguage, 'Payment Plan')}
          </Typography>
          {!isViewMode && (
            <Button
              startIcon={<EditIcon />}
              onClick={handleEditPaymentPlan}
              sx={editButtonSx}
            >
              Edit
            </Button>
          )}
        </Box>
        <Divider sx={dividerSx} />
        {renderSectionContent(
          getLabel('CDL_CP_PAYMENT_PLAN', currentLanguage, 'Payment Plan'),
          sectionLoadingStates.paymentPlan,
          sectionErrorStates.paymentPlan,
          paymentPlanData && paymentPlanData.length > 0 ? (
            <TableContainer component={Paper} sx={tableContainerStyles}>
              <Table>
                <TableHead>
                  <TableRow sx={tableHeadRowSx}>
                    <TableCell sx={tableHeaderCellSx}>
                      {getLabel(
                        'CDL_CP_SEQ_NO',
                        currentLanguage,
                        'Installment Number'
                      )}
                    </TableCell>
                    <TableCell sx={tableHeaderCellSx}>
                      {getLabel(
                        'CDL_CP_DUE_DATE',
                        currentLanguage,
                        'Installment Date'
                      )}
                    </TableCell>
                    <TableCell sx={tableHeaderCellSx}>
                      {getLabel(
                        'CDL_CP_BOOKING_AMOUNT',
                        currentLanguage,
                        'Booking Amount'
                      )}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentPlanData.map((plan, index) => (
                    <TableRow key={plan.id || index} sx={tableRowHoverSx}>
                      <TableCell sx={tableBodyCellSx}>
                        {plan.cpppInstallmentNumber || '-'}
                      </TableCell>
                      <TableCell sx={tableBodyCellSx}>
                        {plan.cpppInstallmentDate
                          ? formatDate(plan.cpppInstallmentDate)
                          : '-'}
                      </TableCell>
                      <TableCell sx={tableBodyCellSx}>
                        {plan.cpppBookingAmount
                          ? formatCurrency(plan.cpppBookingAmount)
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={{ ...neutralTextSx, textAlign: 'center', py: 2 }}>
              No payment plan data available
            </Typography>
          )
        )}
      </CardContent>

      {/* Bank Details Section */}
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
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
            {getLabel('CDL_CP_BANK_DETAILS', currentLanguage, 'Bank Details')}
          </Typography>
          {!isViewMode && (
            <Button
              startIcon={<EditIcon />}
              onClick={handleEditBankDetails}
              sx={editButtonSx}
            >
              Edit
            </Button>
          )}
        </Box>
        <Divider sx={dividerSx} />
        {renderSectionContent(
          getLabel('CDL_CP_BANK_DETAILS', currentLanguage, 'Bank Details'),
          sectionLoadingStates.bankDetails,
          sectionErrorStates.bankDetails,
          bankDetailsFields.length > 0 ? (
            <Grid container spacing={3}>
              {bankDetailsFields.map((field, idx) => (
                <Grid size={{ xs: 12, md: field.gridSize }} key={`bank-${idx}`}>
                  {renderDisplayField(
                    field.label,
                    field.value,
                    labelStyles,
                    valueStyles
                  )}
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography sx={{ ...neutralTextSx, textAlign: 'center', py: 2 }}>
              No bank details available
            </Typography>
          )
        )}
      </CardContent>
    </Card>
  )
}

export default Step5
export type { Step5Props }
