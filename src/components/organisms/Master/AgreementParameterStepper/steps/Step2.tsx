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
  agreementParameterService,
  type AgreementParameter,
} from '@/services/api/masterApi/Entitie/agreementParameterService'
import { formatDate } from '@/utils'
import { GlobalLoading } from '@/components/atoms'
import { useAgreementParameterLabelsWithCache } from '@/hooks'
import { getAgreementParameterLabel } from '@/constants/mappings/master/Entity/agreementParameterMapping'
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
interface DocumentData {
  id: string
  fileName: string
  documentType: string
  uploadDate: string
  fileSize: number
}

interface Step2Props {
  agreementParameterId?: string | undefined
  onEditStep?: ((stepNumber: number) => void) | undefined
  isReadOnly?: boolean
}

const Step2 = ({ agreementParameterId: propAgreementParameterId, onEditStep, isReadOnly = false }: Step2Props) => {
  const params = useParams()
  const agreementParameterId = propAgreementParameterId || (params.id as string)
  const isDarkMode = useIsDarkMode()

  const [agreementParameterDetails, setAgreementParameterDetails] = useState<AgreementParameter | null>(
    null
  )
  const [documentData, setDocumentData] = useState<DocumentData[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dynamic labels helper
  const { data: agreementParameterLabels, getLabel } = useAgreementParameterLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'
  const getAgreementParameterLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getAgreementParameterLabel(configId)
      return agreementParameterLabels
        ? getLabel(configId, currentLanguage, fallback)
        : fallback
    },
    [agreementParameterLabels, currentLanguage, getLabel]
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

  useEffect(() => {
    const fetchAllData = async () => {
      if (!agreementParameterId || agreementParameterId.trim() === '') {
        console.warn('[Step3] Agreement Parameter ID is missing or empty:', agreementParameterId)
        setError('Agreement Parameter ID is required to load review data')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [details, documents] = await Promise.allSettled([
          agreementParameterService.getAgreementParameter(agreementParameterId),
          agreementParameterService.getAgreementParameterDocuments(agreementParameterId, 'AGREEMENT_PARAMETER'),
        ])

        // Extract values from Promise.allSettled results
        const detailsResult =
          details.status === 'fulfilled' ? details.value : null

        const documentsResult =
          documents.status === 'fulfilled' ? documents.value : null

        setAgreementParameterDetails(detailsResult as AgreementParameter)

        // Handle paginated responses for documents
        let documentArray: unknown[] = []
        if (Array.isArray(documentsResult)) {
          documentArray = documentsResult
        } else if (
          documentsResult &&
          typeof documentsResult === 'object' &&
          'content' in documentsResult
        ) {
          const content = (documentsResult as { content?: unknown[] }).content
          documentArray = Array.isArray(content) ? content : []
        }

        setDocumentData(
          documentArray.map((doc) => {
            const docObj = doc as {
              id?: number | string
              documentName?: string
              documentTypeDTO?: {
                languageTranslationId?: { configValue?: string }
              }
              uploadDate?: string
              documentSize?: string
            }
            return {
              id: docObj.id?.toString() || '',
              fileName: docObj.documentName || '',
              documentType:
                docObj.documentTypeDTO?.languageTranslationId?.configValue || '',
              uploadDate: docObj.uploadDate || '',
              fileSize: parseInt(docObj.documentSize || '0'),
            }
          })
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [agreementParameterId])

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
  if (!agreementParameterDetails) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No agreement parameter details found.</Alert>
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
              {getAgreementParameterLabelDynamic('CDL_AGREEMENT_PARAMETER_DETAILS')}
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
                getAgreementParameterLabelDynamic('CDL_AGREEMENT_PARAMETER_REF_NO'),
                agreementParameterDetails.id?.toString() || '-'
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementParameterLabelDynamic('CDL_AGREEMENT_PARAMETER_EFFECTIVE_DATE'),
                agreementParameterDetails.agreementEffectiveDate
                  ? formatDate(agreementParameterDetails.agreementEffectiveDate, 'DD/MM/YYYY')
                  : '-'
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementParameterLabelDynamic('CDL_AGREEMENT_PARAMETER_EXPIRY_DATE'),
                agreementParameterDetails.agreementExpiryDate
                  ? formatDate(agreementParameterDetails.agreementExpiryDate, 'DD/MM/YYYY')
                  : '-'
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementParameterLabelDynamic('CDL_AGREEMENT_PARAMETER_REMARKS'),
                agreementParameterDetails.agreementRemarks
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementParameterLabelDynamic('CDL_AGREEMENT_PARAMETER_PERMITTED_INVESTMENT_ALLOWED'),
                agreementParameterDetails.permittedInvestmentAllowedDTO?.languageTranslationId?.configValue ||
                agreementParameterDetails.permittedInvestmentAllowedDTO?.settingValue ||
                '-'
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementParameterLabelDynamic('CDL_AGREEMENT_PARAMETER_AMENDMENT_ALLOWED'),
                agreementParameterDetails.amendmentAllowedDTO?.languageTranslationId?.configValue ||
                agreementParameterDetails.amendmentAllowedDTO?.settingValue ||
                '-'
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementParameterLabelDynamic('CDL_AGREEMENT_PARAMETER_DEAL_CLOSURE_BASIS'),
                agreementParameterDetails.dealClosureBasisDTO?.languageTranslationId?.configValue ||
                agreementParameterDetails.dealClosureBasisDTO?.settingValue ||
                '-'
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementParameterLabelDynamic('CDL_AGREEMENT_PARAMETER_ESCROW_AGREEMENT'),
                agreementParameterDetails.escrowAgreementDTO || '-'
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementParameterLabelDynamic('CDL_AGREEMENT_PARAMETER_ACTIVE'),
                agreementParameterDetails.active ? 'Yes' : 'No'
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
    </Box>
  )
}

export default Step2


