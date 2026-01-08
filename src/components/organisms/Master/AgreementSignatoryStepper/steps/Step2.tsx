'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
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
import type { AgreementSignatory } from '@/services/api/masterApi/Entitie/agreementSignatoryService'
import { formatDate } from '@/utils'
import { GlobalLoading } from '@/components/atoms'
import {
  useAgreementSignatoryLabelsWithCache,
  useAgreementSignatory,
  useAgreementSignatoryDocuments,
} from '@/hooks'
import { getAgreementSignatoryLabel } from '@/constants/mappings/master/Entity/agreementSignatoryMapping'
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
  agreementSignatoryId?: string | undefined
  onEditStep?: ((stepNumber: number) => void) | undefined
  isReadOnly?: boolean
}

const Step2 = ({
  agreementSignatoryId: propAgreementSignatoryId,
  onEditStep,
  isReadOnly = false,
}: Step2Props) => {
  const params = useParams()
  const agreementSignatoryId =
    propAgreementSignatoryId || (params.id as string)
  const isDarkMode = useIsDarkMode()

  // Use React Query hooks instead of direct API calls - prevents duplicate calls
  const {
    data: agreementSignatoryDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useAgreementSignatory(agreementSignatoryId || '')

  const {
    data: documentsResponse,
    isLoading: isLoadingDocuments,
    error: documentsError,
  } = useAgreementSignatoryDocuments(
    agreementSignatoryId || '',
    'AGREEMENT_SIGNATORY',
    0,
    20
  )

  // Compute loading and error states
  const loading = isLoadingDetails || isLoadingDocuments
  const error = detailsError
    ? (detailsError as Error).message
    : documentsError
      ? (documentsError as Error).message
      : null

  // Dynamic labels helper
  const { data: agreementSignatoryLabels, getLabel } =
    useAgreementSignatoryLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'
  const getAgreementSignatoryLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getAgreementSignatoryLabel(configId)
      return agreementSignatoryLabels
        ? getLabel(configId, currentLanguage, fallback)
        : fallback
    },
    [agreementSignatoryLabels, currentLanguage, getLabel]
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

  // Process document data from React Query response
  const documentData = useMemo(() => {
    if (!documentsResponse) return []

    // Handle paginated responses for documents
    let documentArray: unknown[] = []
    if (Array.isArray(documentsResponse)) {
      documentArray = documentsResponse
    } else if (
      documentsResponse &&
      typeof documentsResponse === 'object' &&
      'content' in documentsResponse
    ) {
      const content = (documentsResponse as { content?: unknown[] }).content
      documentArray = Array.isArray(content) ? content : []
    }

    return documentArray.map((doc) => {
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
  }, [documentsResponse])

  // Check if ID is missing
  if (!agreementSignatoryId || agreementSignatoryId.trim() === '') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Agreement Signatory ID is required</Alert>
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
  if (!agreementSignatoryDetails) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No agreement signatory details found.</Alert>
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
              {getAgreementSignatoryLabelDynamic('CDL_AGREEMENT_SIGNATORY_DETAILS')}
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
                getAgreementSignatoryLabelDynamic(
                  'CDL_ESCROW_AGREEMENT_SIGNATORY_REF_NO'
                ),
                agreementSignatoryDetails.id?.toString() || '-'
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementSignatoryLabelDynamic(
                  'CDL_ESCROW_AGREEMENT_SIGNATORY_NAME'
                ),
                agreementSignatoryDetails.partyFullName
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementSignatoryLabelDynamic(
                  'CDL_ESCROW_AGREEMENT_SIGNATORY_ROLE'
                ),
                agreementSignatoryDetails.signatoryRole
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementSignatoryLabelDynamic(
                  'CDL_ESCROW_AGREEMENT_SIGNATORY_ADDRESS_1'
                ),
                agreementSignatoryDetails.addressLine1
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementSignatoryLabelDynamic(
                  'CDL_ESCROW_AGREEMENT_SIGNATORY_ADDRESS_2'
                ),
                agreementSignatoryDetails.addressLine2
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementSignatoryLabelDynamic(
                  'CDL_ESCROW_AGREEMENT_SIGNATORY_ADDRESS_3'
                ),
                agreementSignatoryDetails.addressLine3
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementSignatoryLabelDynamic(
                  'CDL_ESCROW_AGREEMENT_SIGNATORY_NOTICE_PERSON'
                ),
                agreementSignatoryDetails.notificationContactName
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementSignatoryLabelDynamic(
                  'CDL_ESCROW_AGREEMENT_SIGNATORY_NOTICE_PERSON_EMAIL'
                ),
                agreementSignatoryDetails.notificationEmailAddress
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementSignatoryLabelDynamic(
                  'CDL_ESCROW_AGREEMENT_SIGNATORY_PARTY_ASSOCIATE_TYPE'
                ),
                agreementSignatoryDetails.associationType
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


