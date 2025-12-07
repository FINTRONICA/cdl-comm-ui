'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
import { useParams } from 'next/navigation'
import {
  buildPartnerService,
  type BuildPartner,
  type BuildPartnerBeneficiaryResponse,
} from '@/services/api/buildPartnerService'
import { formatDate } from '@/utils'
import { GlobalLoading } from '@/components/atoms'
import { useBuildPartnerLabelsWithCache } from '@/hooks/useBuildPartnerLabelsWithCache'
import { getBuildPartnerLabel } from '@/constants/mappings/buildPartnerMapping'
import { useAppStore } from '@/store'

// Hook to detect dark mode
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

const getLabelSx = (isDark: boolean) => ({
  color: isDark ? '#9CA3AF' : '#6B7280',
  fontFamily: 'Outfit, sans-serif',
  fontWeight: 400,
  fontSize: '12px',
  lineHeight: '16px',
  letterSpacing: 0,
  marginBottom: '4px',
})

const getValueSx = (isDark: boolean) => ({
  color: isDark ? '#F9FAFB' : '#1F2937',
  fontFamily: 'Outfit, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
  lineHeight: '20px',
  letterSpacing: 0,
  wordBreak: 'break-word',
})

const fieldBoxSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
  marginBottom: '16px',
}

// Data interfaces
interface ContactData {
  bpcFirstName: string
  bpcLastName: string
  bpcContactEmail: string
  bpcContactmpaddressLine1: string
  bpcContactmpaddressLine2: string
  bpcContactPoBox: string
  bpcCountryMobCode: string
  bpcContactTelNo: string
  bpcContactMobNo: string
  bpcContactFaxNo: string
}

interface FeeData {
  bpFeeCategoryDTO?: { languageTranslationId?: { configValue?: string } }
  bpFeeFrequencyDTO?: { languageTranslationId?: { configValue?: string } }
  debitAmount?: number
  feeCollectionDate?: string
  feeNextRecoveryDate?: string
  feePercentage?: number
  totalAmount?: number
  vatPercentage?: number
  bpFeeCurrencyDTO?: { languageTranslationId?: { configValue?: string } }
}

interface DocumentData {
  id: string
  fileName: string
  documentType: string
  uploadDate: string
  fileSize: number
}

interface Step5Props {
  developerId?: string | undefined
  onEditStep?: ((stepNumber: number) => void) | undefined
  isReadOnly?: boolean
}

const Step5 = ({ developerId, onEditStep, isReadOnly = false }: Step5Props) => {
  const params = useParams()
  const buildPartnerId = developerId || (params.id as string)
  const isDarkMode = useIsDarkMode()

  const [buildPartnerDetails, setBuildPartnerDetails] =
    useState<BuildPartner | null>(null)
  const [contactData, setContactData] = useState<ContactData[]>([])
  const [feeData, setFeeData] = useState<FeeData[]>([])
  const [beneficiaryData, setBeneficiaryData] = useState<
    BuildPartnerBeneficiaryResponse[]
  >([])
  const [documentData, setDocumentData] = useState<DocumentData[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dynamic labels helper (same as other steps)
  const { data: buildPartnerLabels, getLabel } =
    useBuildPartnerLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'
  const getBuildPartnerLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getBuildPartnerLabel(configId)
      return buildPartnerLabels
        ? getLabel(configId, currentLanguage, fallback)
        : fallback
    },
    [buildPartnerLabels, currentLanguage, getLabel]
  )

  // Render helper functions with dark mode support
  const renderDisplayField = useCallback(
    (label: string, value: string | number | null = '-') => (
      <Box sx={fieldBoxSx}>
        <Typography sx={getLabelSx(isDarkMode)}>{label}</Typography>
        <Typography sx={getValueSx(isDarkMode)}>{value || '-'}</Typography>
      </Box>
    ),
    [isDarkMode]
  )

  const renderCheckboxField = useCallback(
    (label: string, checked: boolean) => (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Checkbox checked={checked} disabled sx={{ p: 0, pr: 1 }} />
        <Typography sx={getValueSx(isDarkMode)}>{label}</Typography>
      </Box>
    ),
    [isDarkMode]
  )

  useEffect(() => {
    const fetchAllData = async () => {
      if (!buildPartnerId) {
        setError('Build Partner ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel

        const [details, contacts, fees, beneficiaries, documents] =
          await Promise.allSettled([
            buildPartnerService.getBuildPartner(buildPartnerId),
            buildPartnerService.getBuildPartnerContact(buildPartnerId),
            buildPartnerService.getBuildPartnerFees(buildPartnerId),
            buildPartnerService.getBuildPartnerBeneficiaries(buildPartnerId),
            buildPartnerService.getBuildPartnerDocuments(
              buildPartnerId,
              'BUILD_PARTNER'
            ),
          ])

        // Extract values from Promise.allSettled results
        const detailsResult =
          details.status === 'fulfilled' ? details.value : null
        const contactsResult =
          contacts.status === 'fulfilled' ? contacts.value : null
        const feesResult = fees.status === 'fulfilled' ? fees.value : null
        const beneficiariesResult =
          beneficiaries.status === 'fulfilled' ? beneficiaries.value : null
        const documentsResult =
          documents.status === 'fulfilled' ? documents.value : null

        setBuildPartnerDetails(detailsResult as BuildPartner)

        // Handle paginated responses for contacts
        let contactArray: ContactData[] = []
        if (Array.isArray(contactsResult)) {
          contactArray = contactsResult as ContactData[]
        } else if (
          contactsResult &&
          typeof contactsResult === 'object' &&
          'content' in contactsResult
        ) {
          contactArray = Array.isArray((contactsResult as any).content)
            ? ((contactsResult as any).content as ContactData[])
            : []
        }
        setContactData(contactArray)

        // Handle paginated responses for fees
        let feeArray: FeeData[] = []
        if (Array.isArray(feesResult)) {
          feeArray = feesResult as FeeData[]
        } else if (
          feesResult &&
          typeof feesResult === 'object' &&
          'content' in feesResult
        ) {
          feeArray = Array.isArray((feesResult as any).content)
            ? ((feesResult as any).content as FeeData[])
            : []
        }
        setFeeData(feeArray)

        // Handle different possible beneficiary response formats
        let beneficiaryArray: BuildPartnerBeneficiaryResponse[] = []
        if (Array.isArray(beneficiariesResult)) {
          beneficiaryArray =
            beneficiariesResult as BuildPartnerBeneficiaryResponse[]
        } else if (
          beneficiariesResult &&
          typeof beneficiariesResult === 'object'
        ) {
          // If it's an object with a content property (paginated response)
          const beneficiariesObj = beneficiariesResult as any
          if (
            beneficiariesObj.content &&
            Array.isArray(beneficiariesObj.content)
          ) {
            beneficiaryArray =
              beneficiariesObj.content as BuildPartnerBeneficiaryResponse[]
          } else {
            // If it's a single beneficiary object, wrap it in an array
            beneficiaryArray = [
              beneficiariesResult as BuildPartnerBeneficiaryResponse,
            ]
          }
        }
        setBeneficiaryData(beneficiaryArray)

        // Handle paginated responses for documents
        let documentArray: any[] = []
        if (Array.isArray(documentsResult)) {
          documentArray = documentsResult
        } else if (
          documentsResult &&
          typeof documentsResult === 'object' &&
          'content' in documentsResult
        ) {
          documentArray = Array.isArray((documentsResult as any).content)
            ? (documentsResult as any).content
            : []
        }

        setDocumentData(
          documentArray.map((doc) => ({
            id: doc.id?.toString() || '',
            fileName: doc.documentName || '',
            documentType:
              doc.documentTypeDTO?.languageTranslationId?.configValue || '',
            uploadDate: doc.uploadDate || '',
            fileSize: parseInt(doc.documentSize || '0'),
          }))
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [buildPartnerId])

  // Render contact fields with actual API data
  const renderContactFields = (
    contact: ContactData,
    title: string,
    isLast: boolean
  ) => {
    const fields = [
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_AUTH_NAME'),
        value:
          `${contact.bpcFirstName || ''} ${contact.bpcLastName || ''}`.trim() ||
          '',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_EMAIL_ADDRESS'),
        value: contact.bpcContactEmail || ' ',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_BUSINESS_ADDRESS'),
        value:
          `${contact.bpcContactmpaddressLine1 || ''} ${contact.bpcContactmpaddressLine2 || ''}`.trim() ||
          '',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_POBOX'),
        value: contact.bpcContactPoBox || '',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_COUNTRY_CODE'),
        value: contact.bpcCountryMobCode || '',
        gridSize: 3,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_TELEPHONE_NUMBER'),
        value: contact.bpcContactTelNo || '',
        gridSize: 3,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_MOBILE_NUMBER'),
        value: contact.bpcContactMobNo || '',
        gridSize: 3,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_FAX_NUMBER'),
        value: contact.bpcContactFaxNo || '',
        gridSize: 3,
      },
    ]
    return (
      <Box sx={{ mb: 0 }}>
        <Typography
          sx={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 500,
            fontStyle: 'normal',
            fontSize: '16px',
            lineHeight: '28px',
            letterSpacing: '0.15px',
            verticalAlign: 'middle',
            mb: 2,
            color: isDarkMode ? '#F9FAFB' : '#1E2939',
          }}
        >
          {title}
        </Typography>
        <Grid container spacing={3}>
          {fields.map((field, idx) => (
            <Grid
              size={{ xs: 12, md: field.gridSize || 6 }}
              key={`${title}-${idx}`}
            >
              {renderDisplayField(
                field.label,
                field.value as string | number | null
              )}
            </Grid>
          ))}
        </Grid>
        {!isLast && (
          <Divider
            sx={{
              mb: 0,
              mt: 4,
              borderColor: isDarkMode ? '#334155' : '#E5E7EB',
            }}
          />
        )}
      </Box>
    )
  }

  // Render fee fields with actual API data
  const renderFeeFields = (fee: FeeData, title: string, isLast: boolean) => {
    const fields = [
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_FEES_TYPE'),
        value: fee.bpFeeCategoryDTO?.languageTranslationId?.configValue || '',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_FEES_FREQUENCY'),
        value: fee.bpFeeFrequencyDTO?.languageTranslationId?.configValue || '',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_FEES_ACCOUNT'),
        value:
          (fee as any)?.bpAccountTypeDTO?.languageTranslationId?.configValue ||
          (fee as any)?.bpAccountTypeDTO?.settingValue ||
          '',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_FEES_AMOUNT'),
        value: fee.debitAmount?.toString() || '',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_FEES_TOTAL'),
        value: fee.feeCollectionDate
          ? formatDate(fee.feeCollectionDate, 'DD/MM/YYYY')
          : '',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_FEES_DATE'),
        value: fee.feeNextRecoveryDate
          ? formatDate(fee.feeNextRecoveryDate, 'DD/MM/YYYY')
          : '',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_FEES_RATE'),
        value: fee.feePercentage?.toString() || '',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_FEES_TOTAL_AMOUNT'),
        value: fee.totalAmount?.toString() || '',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_FEES_VAT'),
        value: fee.vatPercentage?.toString() || '',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_FEES_CURRENCY'),
        value: fee.bpFeeCurrencyDTO?.languageTranslationId?.configValue || '',
        gridSize: 6,
      },
    ]
    return (
      <Box sx={{ mb: 0 }}>
        <Typography
          sx={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 500,
            fontStyle: 'normal',
            fontSize: '16px',
            lineHeight: '28px',
            letterSpacing: '0.15px',
            verticalAlign: 'middle',
            mb: 2,
            color: isDarkMode ? '#F9FAFB' : '#1E2939',
          }}
        >
          {title}
        </Typography>
        <Grid container spacing={3}>
          {fields.map((field, idx) => (
            <Grid
              size={{ xs: 12, md: field.gridSize || 6 }}
              key={`${title}-${idx}`}
            >
              {renderDisplayField(
                field.label,
                field.value as string | number | null
              )}
            </Grid>
          ))}
        </Grid>
        {!isLast && (
          <Divider
            sx={{
              mb: 0,
              mt: 4,
              borderColor: isDarkMode ? '#334155' : '#E5E7EB',
            }}
          />
        )}
      </Box>
    )
  }

  // Render beneficiary fields with actual API data
  const renderBeneficiaryFields = (
    beneficiary: BuildPartnerBeneficiaryResponse | any,
    title: string,
    isLast: boolean
  ) => {
    const fields = [
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_BENE_PAYMODE'),
        value:
          beneficiary?.bpbTransferTypeDTO?.languageTranslationId?.configValue ||
          beneficiary.bpbBeneficiaryType ||
          '',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_BENE_REF'),
        value: beneficiary.bpbBeneficiaryId || '',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_BENE_NAME'),
        value: beneficiary.bpbName || '',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_BENE_BANK'),
        value: beneficiary.bpbBankName || '',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_BENE_ACCOUNT'),
        value: beneficiary.bpbAccountNumber || '',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_BENE_BIC'),
        value: beneficiary.bpbSwiftCode || '',
        gridSize: 6,
      },
      {
        label: getBuildPartnerLabelDynamic('CDL_BP_BENE_ROUTING'),
        value: beneficiary.bpbRoutingCode || '',
        gridSize: 6,
      },
    ]
    return (
      <Box sx={{ mb: 0 }}>
        <Typography
          sx={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 500,
            fontStyle: 'normal',
            fontSize: '16px',
            lineHeight: '28px',
            letterSpacing: '0.15px',
            verticalAlign: 'middle',
            mb: 2,
            color: isDarkMode ? '#F9FAFB' : '#1E2939',
          }}
        >
          {title}
        </Typography>
        <Grid container spacing={3}>
          {fields.map((field, idx) => (
            <Grid
              size={{ xs: 12, md: field.gridSize || 6 }}
              key={`${title}-${idx}`}
            >
              {renderDisplayField(
                field.label,
                field.value as string | number | null
              )}
            </Grid>
          ))}
        </Grid>
        {!isLast && (
          <Divider
            sx={{
              mb: 0,
              mt: 4,
              borderColor: isDarkMode ? '#334155' : '#E5E7EB',
            }}
          />
        )}
      </Box>
    )
  }

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          backgroundColor: isDarkMode ? '#101828' : '#FFFFFFBF',
          borderRadius: '16px',
          margin: '0 auto',
          width: '100%',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GlobalLoading fullHeight className="min-h-[400px]" />
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    )
  }

  // No data state
  if (!buildPartnerDetails) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No build partner details found.</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Card
        sx={{
          boxShadow: 'none',
          backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
          width: '100%',
          margin: '0 auto',
          mb: 3,
          border: isDarkMode ? '1px solid #334155' : '1px solid #E5E7EB',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '18px',
                lineHeight: '24px',
                color: isDarkMode ? '#F9FAFB' : '#1E2939',
              }}
            >
              {getBuildPartnerLabelDynamic('CDL_BP_DETAILS')}
            </Typography>
            {!isReadOnly && (
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                onClick={() => {
                  onEditStep?.(0)
                }}
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
            sx={{
              mb: 3,
              borderColor: isDarkMode ? '#334155' : '#E5E7EB',
            }}
          />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getBuildPartnerLabelDynamic('CDL_BP_ID'),
                buildPartnerDetails.bpDeveloperId
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getBuildPartnerLabelDynamic('CDL_BP_CIF'),
                buildPartnerDetails.bpCifrera
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getBuildPartnerLabelDynamic('CDL_BP_REGNO'),
                buildPartnerDetails.bpDeveloperRegNo
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getBuildPartnerLabelDynamic('CDL_BP_REGDATE'),
                buildPartnerDetails.bpOnboardingDate
                  ? formatDate(
                      buildPartnerDetails.bpOnboardingDate,
                      'DD/MM/YYYY'
                    )
                  : ' '
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getBuildPartnerLabelDynamic('CDL_BP_NAME'),
                buildPartnerDetails.bpName
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getBuildPartnerLabelDynamic('CDL_BP_NAME_LOCALE'),
                buildPartnerDetails.bpNameLocal
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getBuildPartnerLabelDynamic('CDL_BP_MASTER'),
                buildPartnerDetails.bpMasterName
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getBuildPartnerLabelDynamic('CDL_BP_REGULATORY_AUTHORITY'),
                (buildPartnerDetails.bpRegulatorDTO as any)
                  ?.languageTranslationId?.configValue || null
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 12 }}>
              {renderDisplayField(
                getBuildPartnerLabelDynamic('CDL_BP_ADDRESS'),
                buildPartnerDetails.bpContactAddress
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              {renderDisplayField(
                getBuildPartnerLabelDynamic('CDL_BP_MOBILE'),
                buildPartnerDetails.bpMobile
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              {renderDisplayField(
                getBuildPartnerLabelDynamic('CDL_BP_EMAIL'),
                buildPartnerDetails.bpEmail
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getBuildPartnerLabelDynamic('CDL_BP_FAX'),
                buildPartnerDetails.bpFax
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getBuildPartnerLabelDynamic('CDL_BP_LICENSE'),
                buildPartnerDetails.bpLicenseNo
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getBuildPartnerLabelDynamic('CDL_BP_LICENSE_VALID'),
                buildPartnerDetails.bpLicenseExpDate
                  ? formatDate(
                      buildPartnerDetails.bpLicenseExpDate,
                      'DD/MM/YYYY'
                    )
                  : ' '
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              {renderCheckboxField(
                getBuildPartnerLabelDynamic('CDL_BP_WORLD_STATUS'),
                buildPartnerDetails.bpWorldCheckFlag === 'true'
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              {renderCheckboxField(
                'Migrated Data',
                buildPartnerDetails.bpMigratedData === true
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getBuildPartnerLabelDynamic('CDL_BP_WORLD_REMARKS'),
                buildPartnerDetails.bpWorldCheckRemarks
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getBuildPartnerLabelDynamic('CDL_BP_NOTES'),
                buildPartnerDetails.bpremark
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                'Account Contact Number',
                buildPartnerDetails.bpContactTel
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Submitted Documents Section */}
      {documentData.length > 0 && (
        <Card
          sx={{
            boxShadow: 'none',
            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            width: '100%',
            margin: '0 auto',
            mb: 3,
            border: isDarkMode ? '1px solid #334155' : '1px solid #E5E7EB',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '18px',
                  lineHeight: '24px',
                  color: isDarkMode ? '#F9FAFB' : '#1E2939',
                }}
              >
                Submitted Documents
              </Typography>
              {!isReadOnly && (
                <Button
                  startIcon={<EditIcon />}
                  variant="outlined"
                  onClick={() => {
                    onEditStep?.(1)
                  }}
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
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: isDarkMode ? '#F9FAFB' : '#374151',
                        borderBottom: isDarkMode
                          ? '1px solid #334155'
                          : '1px solid #E5E7EB',
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: isDarkMode ? '#F9FAFB' : '#374151',
                        borderBottom: isDarkMode
                          ? '1px solid #334155'
                          : '1px solid #E5E7EB',
                      }}
                    >
                      Date
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: isDarkMode ? '#F9FAFB' : '#374151',
                        borderBottom: isDarkMode
                          ? '1px solid #334155'
                          : '1px solid #E5E7EB',
                      }}
                    >
                      Type
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documentData.map((doc, index) => (
                    <TableRow
                      key={doc.id || index}
                      sx={{
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#334155' : '#F9FAFB',
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '14px',
                          color: isDarkMode ? '#E5E7EB' : '#374151',
                          borderBottom: isDarkMode
                            ? '1px solid #334155'
                            : '1px solid #E5E7EB',
                        }}
                      >
                        {doc.fileName}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '14px',
                          color: isDarkMode ? '#E5E7EB' : '#374151',
                          borderBottom: isDarkMode
                            ? '1px solid #334155'
                            : '1px solid #E5E7EB',
                        }}
                      >
                        {formatDate(doc.uploadDate, 'DD/MM/YYYY')}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '14px',
                          color: isDarkMode ? '#E5E7EB' : '#374151',
                          borderBottom: isDarkMode
                            ? '1px solid #334155'
                            : '1px solid #E5E7EB',
                        }}
                      >
                        {doc.documentType}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Contact Details Section */}
      {contactData.length > 0 && (
        <Card
          sx={{
            boxShadow: 'none',
            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            width: '100%',
            margin: '0 auto',
            mb: 3,
            border: isDarkMode ? '1px solid #334155' : '1px solid #E5E7EB',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '18px',
                  lineHeight: '24px',
                  color: isDarkMode ? '#F9FAFB' : '#1E2939',
                }}
              >
                {getBuildPartnerLabelDynamic('CDL_BP_CONTACT')}
              </Typography>
              {!isReadOnly && (
                <Button
                  startIcon={<EditIcon />}
                  variant="outlined"
                  onClick={() => {
                    onEditStep?.(2)
                  }}
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
              sx={{
                mb: 3,
                borderColor: isDarkMode ? '#334155' : '#E5E7EB',
              }}
            />
            <Grid container spacing={3}>
              {contactData.map((contact, index) => (
                <Grid size={{ xs: 12 }} key={index}>
                  {renderContactFields(
                    contact,
                    `Contact ${index + 1}`,
                    index === contactData.length - 1
                  )}
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Fee Details Section */}
      {feeData.length > 0 && (
        <Card
          sx={{
            boxShadow: 'none',
            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            width: '100%',
            margin: '0 auto',
            mb: 3,
            border: isDarkMode ? '1px solid #334155' : '1px solid #E5E7EB',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '18px',
                  lineHeight: '24px',
                  color: isDarkMode ? '#F9FAFB' : '#1E2939',
                }}
              >
                {getBuildPartnerLabelDynamic('CDL_BP_FEES')}
              </Typography>
              {!isReadOnly && (
                <Button
                  startIcon={<EditIcon />}
                  variant="outlined"
                  onClick={() => {
                    onEditStep?.(3)
                  }}
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
              sx={{
                mb: 3,
                borderColor: isDarkMode ? '#334155' : '#E5E7EB',
              }}
            />
            <Grid container spacing={3}>
              {feeData.map((fee, index) => (
                <Grid size={{ xs: 12 }} key={index}>
                  {renderFeeFields(
                    fee,
                    `Fee ${index + 1}`,
                    index === feeData.length - 1
                  )}
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Beneficiary Details Section */}
      {beneficiaryData.length > 0 && (
        <Card
          sx={{
            boxShadow: 'none',
            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            width: '100%',
            margin: '0 auto',
            mb: 3,
            border: isDarkMode ? '1px solid #334155' : '1px solid #E5E7EB',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '18px',
                  lineHeight: '24px',
                  color: isDarkMode ? '#F9FAFB' : '#1E2939',
                }}
              >
                {getBuildPartnerLabelDynamic('CDL_BP_BENE_INFO')}
              </Typography>
              {!isReadOnly && (
                <Button
                  startIcon={<EditIcon />}
                  variant="outlined"
                  onClick={() => {
                    onEditStep?.(4)
                  }}
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
              sx={{
                mb: 3,
                borderColor: isDarkMode ? '#334155' : '#E5E7EB',
              }}
            />
            <Grid container spacing={3}>
              {beneficiaryData.map((beneficiary, index) => (
                <Grid size={{ xs: 12 }} key={beneficiary.id || index}>
                  {renderBeneficiaryFields(
                    beneficiary,
                    `Beneficiary ${index + 1}`,
                    index === beneficiaryData.length - 1
                  )}
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default Step5
