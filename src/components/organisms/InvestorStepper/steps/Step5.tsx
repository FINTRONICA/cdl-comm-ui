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
  CircularProgress,
  Alert,
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
import { useTranslatedBasicDetails } from '@/hooks/useTranslatedBasicDetails'

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
  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
    <Checkbox checked={checked} disabled sx={{ p: 0, pr: 1 }} />
    <Typography sx={valueSx}>{label}</Typography>
  </Box>
)

const SectionLoader = ({ sectionName }: { sectionName: string }) => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="120px"
    sx={{
      border: '1px solid #E5E7EB',
      borderRadius: 1,
      backgroundColor: '#F9FAFB',
    }}
  >
    <CircularProgress size={24} />
    <Typography sx={{ ml: 2, color: '#6A7282', fontSize: '14px' }}>
      Loading {sectionName}...
    </Typography>
  </Box>
)

const SectionError = ({
  sectionName,
  error,
}: {
  sectionName: string
  error: Error
}) => (
  <Box
    sx={{
      border: '1px solid #FECACA',
      borderRadius: 1,
      backgroundColor: '#FEF2F2',
      p: 2,
    }}
  >
    <Alert severity="error" sx={{ backgroundColor: 'transparent', p: 0 }}>
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
  const { getLabel } = useCapitalPartnerLabelsApi()
  const currentLanguage = useAppStore((state) => state.language)

  const handleEditBasicDetails = () => {
    if (capitalPartnerId) {
      router.push(`/investors/new/${capitalPartnerId}?step=1`)
    }
  }

  const handleEditUnitDetails = () => {
    if (capitalPartnerId) {
      router.push(`/investors/new/${capitalPartnerId}?step=3`)
    }
  }

  const handleEditPaymentPlan = () => {
    if (capitalPartnerId) {
      router.push(`/investors/new/${capitalPartnerId}?step=4`)
    }
  }

  const handleEditBankDetails = () => {
    if (capitalPartnerId) {
      router.push(`/investors/new/${capitalPartnerId}?step=5`)
    }
  }

  const {
    data: capitalPartnerData,
    isLoading: isLoadingBasic,
    error: errorBasic,
  } = useGetEnhanced<CapitalPartnerResponse>(
    API_ENDPOINTS.CAPITAL_PARTNER.GET_BY_ID(capitalPartnerId?.toString() || '')
  )
  const {
    data: paymentPlanData,
    isLoading: isLoadingPayment,
    error: errorPayment,
  } = useGetEnhanced<PaymentPlanResponse[]>(
    `${API_ENDPOINTS.CAPITAL_PARTNER_PAYMENT_PLAN.GET_ALL}?capitalPartnerId.equals=${capitalPartnerId}`
  )
  const {
    data: bankDetailsData,
    isLoading: isLoadingBank,
    error: errorBank,
  } = useGetEnhanced<BankDetailsResponse[]>(
    `${API_ENDPOINTS.CAPITAL_PARTNER_BANK_INFO.GET_ALL}?capitalPartnerId.equals=${capitalPartnerId}`
  )
  const {
    data: unitDetailsData,
    isLoading: isLoadingUnit,
    error: errorUnit,
  } = useGetEnhanced<CapitalPartnerUnitResponse[]>(
    capitalPartnerId
      ? `${API_ENDPOINTS.CAPITAL_PARTNER_UNIT.GET_ALL}?capitalPartnerId.equals=${capitalPartnerId}`
      : '',
    {
      enabled: !!capitalPartnerId,
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
  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
          'CDL_CP_BENEFICIARY_ROUTING_CODE',
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
        label: getLabel('CDL_CP_BIC', currentLanguage, 'BIC'),
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
        label: getLabel('CDL_CP_PROP_NUMBER', currentLanguage, 'Project Name*'),
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
            'CDL_CP_MODIFICATION_FEE_NEEDED',
            currentLanguage,
            'Modification Fee Needed'
          ),
          checked: purchaseData?.cpupModificationFeeNeeded || false,
        },
        {
          label: getLabel(
            'CDL_CP_RESERVATION_BOOKING_FORM',
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
      return <SectionLoader sectionName={sectionName} />
    }
    if (error) {
      return <SectionError sectionName={sectionName} error={error} />
    }
    return content
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
            Basic Details
          </Typography>
          {!isViewMode && (
            <Button
              startIcon={<EditIcon />}
              onClick={handleEditBasicDetails}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '14px',
                lineHeight: '24px',
                letterSpacing: '0.5px',
                verticalAlign: 'middle',
              }}
            >
              Edit
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />
        {renderSectionContent(
          'Basic Details',
          sectionLoadingStates.basicDetails,
          sectionErrorStates.basicDetails,
          <Grid container spacing={3}>
            {basicFields.map((field, idx) => (
              <Grid size={{ xs: 12, md: field.gridSize }} key={`basic-${idx}`}>
                {renderDisplayField(field.label, field.value)}
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
            Unit Details
          </Typography>
          {!isViewMode && (
            <Button
              startIcon={<EditIcon />}
              onClick={handleEditUnitDetails}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '14px',
                lineHeight: '24px',
                letterSpacing: '0.5px',
                verticalAlign: 'middle',
              }}
            >
              Edit
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />
        {renderSectionContent(
          'Unit Details',
          sectionLoadingStates.unitDetails,
          sectionErrorStates.unitDetails,
          <Grid container spacing={3}>
            {unitFields.map((field, idx) => (
              <Grid size={{ xs: 12, md: field.gridSize }} key={`unit-${idx}`}>
                {renderDisplayField(field.label, field.value)}
              </Grid>
            ))}
            {checkboxFieldsRow1.map((field, idx) => (
              <Grid size={{ xs: 12, md: 4 }} key={`checkbox-row1-${idx}`}>
                {renderCheckboxField(field.label, field.checked)}
              </Grid>
            ))}
            {checkboxFieldsRow2.map((field, idx) => (
              <Grid
                size={{ xs: 12, md: field.gridSize }}
                key={`unit-checkbox-row2-${idx}`}
              >
                {renderDisplayField(field.label, field.value)}
              </Grid>
            ))}
            {checkboxFieldsRow3.map((field, idx) => (
              <Grid size={{ xs: 12, md: 4 }} key={`checkbox-row3-${idx}`}>
                {renderCheckboxField(field.label, field.checked)}
              </Grid>
            ))}
            {remainingFields.map((field, idx) => (
              <Grid
                size={{ xs: 12, md: field.gridSize }}
                key={`unit-remaining-${idx}`}
              >
                {renderDisplayField(field.label, field.value)}
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
            Payment Plan
          </Typography>
          {!isViewMode && (
            <Button
              startIcon={<EditIcon />}
              onClick={handleEditPaymentPlan}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '14px',
                lineHeight: '24px',
                letterSpacing: '0.5px',
                verticalAlign: 'middle',
              }}
            >
              Edit
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />
        {renderSectionContent(
          'Payment Plan',
          sectionLoadingStates.paymentPlan,
          sectionErrorStates.paymentPlan,
          paymentPlanData && paymentPlanData.length > 0 ? (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <th
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#6A7282',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      Installment Number
                    </th>
                    <th
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#6A7282',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      Installment Date
                    </th>
                    <th
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#6A7282',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      Booking Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paymentPlanData.map((plan, index) => (
                    <tr
                      key={plan.id || index}
                      style={{ borderBottom: '1px solid #F3F4F6' }}
                    >
                      <td
                        style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: '#1E2939',
                          fontFamily: 'Outfit, sans-serif',
                        }}
                      >
                        {plan.cpppInstallmentNumber || '-'}
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: '#1E2939',
                          fontFamily: 'Outfit, sans-serif',
                        }}
                      >
                        {plan.cpppInstallmentDate
                          ? formatDate(plan.cpppInstallmentDate)
                          : '-'}
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: '#1E2939',
                          fontFamily: 'Outfit, sans-serif',
                        }}
                      >
                        {plan.cpppBookingAmount
                          ? formatCurrency(plan.cpppBookingAmount)
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          ) : (
            <Typography
              sx={{
                color: '#6A7282',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '14px',
                textAlign: 'center',
                py: 2,
              }}
            >
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
            Bank Details
          </Typography>
          {!isViewMode && (
            <Button
              startIcon={<EditIcon />}
              onClick={handleEditBankDetails}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '14px',
                lineHeight: '24px',
                letterSpacing: '0.5px',
                verticalAlign: 'middle',
              }}
            >
              Edit
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />
        {renderSectionContent(
          'Bank Details',
          sectionLoadingStates.bankDetails,
          sectionErrorStates.bankDetails,
          bankDetailsFields.length > 0 ? (
            <Grid container spacing={3}>
              {bankDetailsFields.map((field, idx) => (
                <Grid size={{ xs: 12, md: field.gridSize }} key={`bank-${idx}`}>
                  {renderDisplayField(field.label, field.value)}
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography
              sx={{
                color: '#6A7282',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '14px',
                textAlign: 'center',
                py: 2,
              }}
            >
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
