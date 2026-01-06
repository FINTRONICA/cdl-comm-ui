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
  partyService,
  type Party,
  type PartyAuthorizedSignatoryResponse,
} from '@/services/api/masterApi/Customer/partyService'
import { formatDate } from '@/utils'
import { GlobalLoading } from '@/components/atoms'
import { usePartyLabelsWithCache } from '@/hooks/master/CustomerHook/usePartyLabelsWithCache'
import { getPartyLabel } from '@/constants/mappings/master/partyMapping'
import { useAppStore } from '@/store'
import { AuthorizedSignatoryData } from '../partyTypes'

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

interface DocumentData {
  id: string
  fileName: string
  documentType: string
  uploadDate: string
  fileSize: number
}

interface Step3Props {
  partyId?: string | undefined
  onEditStep?: ((stepNumber: number) => void) | undefined
  isReadOnly?: boolean
}

const Step3 = ({ partyId: propPartyId, onEditStep, isReadOnly = false }: Step3Props) => {
  const params = useParams()
  const partyId = propPartyId || (params.id as string)
  const isDarkMode = useIsDarkMode()

  const [partyDetails, setPartyDetails] = useState<Party | null>(null)
  const [authorizedSignatoryData, setAuthorizedSignatoryData] = useState<AuthorizedSignatoryData[]>([])
  const [documentData, setDocumentData] = useState<DocumentData[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dynamic labels helper
  const { data: partyLabels, getLabel } = usePartyLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'
  const getPartyLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getPartyLabel(configId)
      return partyLabels
        ? getLabel(configId, currentLanguage, fallback)
        : fallback
    },
    [partyLabels, currentLanguage, getLabel]
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
      // Try to get partyId from multiple sources
      const effectivePartyId = propPartyId || (params.id as string) || partyId
      
      if (!effectivePartyId || effectivePartyId === 'undefined' || effectivePartyId === 'null') {
        setError('Party ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [details, authorizedSignatories, documents] = await Promise.allSettled([
          partyService.getParty(effectivePartyId),
          partyService.getPartyAuthorizedSignatory(effectivePartyId),
          partyService.getPartyDocuments(effectivePartyId, 'PARTY', 0, 20),
        ])

        // Extract values from Promise.allSettled results
        const detailsResult = details.status === 'fulfilled' ? details.value : null
        const authorizedSignatoriesResult = authorizedSignatories.status === 'fulfilled' ? authorizedSignatories.value : null
        const documentsResult = documents.status === 'fulfilled' ? documents.value : null

        setPartyDetails(detailsResult as Party)

        // Handle authorized signatories
        let signatoryArray: AuthorizedSignatoryData[] = []
        if (Array.isArray(authorizedSignatoriesResult)) {
          signatoryArray = authorizedSignatoriesResult.map((as: PartyAuthorizedSignatoryResponse) => ({
            id: as.id,
            customerCifNumber: as.customerCifNumber,
            signatoryFullName: as.signatoryFullName,
            addressLine1: as.addressLine1,
            addressLine2: as.addressLine2,
            addressLine3: as.addressLine3,
            telephoneNumber: as.telephoneNumber,
            mobileNumber: as.mobileNumber,
            emailAddress: as.emailAddress,
            notificationContactName: as.notificationContactName,
            signatoryCifNumber: as.signatoryCifNumber,
            notificationEmailAddress: as.notificationEmailAddress,
            notificationSignatureFile: as.notificationSignatureFile,
            notificationSignatureMimeType: as.notificationSignatureMimeType,
            active: as.active,
            cifExistsDTO: as.cifExistsDTO,
            partyDTO: as.partyDTO,
            notificationSignatureDTO: as.notificationSignatureDTO,
            enabled: as.enabled ?? null,
            deleted: as.deleted ?? null,
            authorizedSignatoryStatusDate: null, // Not available from API response
          } as AuthorizedSignatoryData))
        }
        setAuthorizedSignatoryData(signatoryArray)

        // Handle paginated responses for documents
        let documentArray: DocumentData[] = []
        if (documentsResult && typeof documentsResult === 'object' && 'content' in documentsResult) {
          const docs = documentsResult as { content: unknown[] }
          if (Array.isArray(docs.content)) {
            documentArray = docs.content.map((doc: unknown) => {
              const docObj = doc as { id?: number | string; documentName?: string; documentTypeDTO?: { languageTranslationId?: { configValue?: string } }; uploadDate?: string; documentSize?: string }
              return {
                id: docObj.id?.toString() || '',
                fileName: docObj.documentName || '',
                documentType: docObj.documentTypeDTO?.languageTranslationId?.configValue || '',
                uploadDate: docObj.uploadDate || '',
                fileSize: parseInt(docObj.documentSize || '0'),
              }
            })
          }
        }

        setDocumentData(documentArray)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [propPartyId, params.id, partyId])

  // Render authorized signatory fields
  const renderAuthorizedSignatoryFields = useCallback(
    (authorizedSignatory: AuthorizedSignatoryData, title: string, isLast: boolean) => {
      const fields = [
        {
          label: getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_NAME'),
          value: authorizedSignatory.signatoryFullName || '-',
          gridSize: 6,
        },
        {
          label: getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_EMAIL_ID'),
          value: authorizedSignatory.emailAddress || '-',
          gridSize: 6,
        },
        {
          label: getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_ADDRESS_1'),
          value: authorizedSignatory.addressLine1 || '-',
          gridSize: 6,
        },
        {
          label: getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_ADDRESS_2'),
          value: authorizedSignatory.addressLine2 || '-',
          gridSize: 6,
        },
        {
          label: getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_ADDRESS_3'),
          value: authorizedSignatory.addressLine3 || '-',
          gridSize: 6,
        },
        {
          label: getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_TELEPHONE_NO'),
          value: authorizedSignatory.telephoneNumber || '-',
          gridSize: 3,
        },
        {
          label: getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_MOBILE_NO'),
          value: authorizedSignatory.mobileNumber || '-',
          gridSize: 3,
        },
        {
          label: getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_CIF_NUMBER'),
          value: authorizedSignatory.signatoryCifNumber || '-',
          gridSize: 6,
        },
        {
          label: getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_NOTIFICATION_CONTACT_NAME'),
          value: authorizedSignatory.notificationContactName || '-',
          gridSize: 6,
        },
        {
          label: getPartyLabelDynamic('CDL_MP_AUTHORIZED_SIGNATORY_NOTIFICATION_EMAIL'),
          value: authorizedSignatory.notificationEmailAddress || '-',
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
    },
    [isDarkMode, getPartyLabelDynamic, renderDisplayField]
  )

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
  if (!partyDetails) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No party details found.</Alert>
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
              {getPartyLabelDynamic('CDL_PARTY_DETAILS')}
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
                getPartyLabelDynamic('CDL_MP_PARTY_ID'),
                partyDetails.id?.toString() || '-'
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getPartyLabelDynamic('CDL_MP_PARTY_CIF_NUMBER'),
                partyDetails.partyCifNumber
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getPartyLabelDynamic('CDL_MP_PARTY_NAME'),
                partyDetails.partyFullName
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getPartyLabelDynamic('CDL_MP_PARTY_ADDRESS_1'),
                partyDetails.addressLine1
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getPartyLabelDynamic('CDL_MP_PARTY_ADDRESS_2'),
                partyDetails.addressLine2
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getPartyLabelDynamic('CDL_MP_PARTY_ADDRESS_3'),
                partyDetails.addressLine3
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {renderDisplayField(
                getPartyLabelDynamic('CDL_MP_PARTY_TELEPHONE_NO'),
                partyDetails.telephoneNumber
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {renderDisplayField(
                getPartyLabelDynamic('CDL_MP_PARTY_MOBILE_NO'),
                partyDetails.mobileNumber
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {renderDisplayField(
                getPartyLabelDynamic('CDL_MP_PARTY_EMAIL'),
                partyDetails.emailAddress
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getPartyLabelDynamic('CDL_MP_PARTY_BANK_IDENTIFIER'),
                partyDetails.bankIdentifier
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getPartyLabelDynamic('CDL_MP_PARTY_PASSPORT_IDENTIFICATION_DETAILS'),
                partyDetails.passportIdentificationDetails
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getPartyLabelDynamic('CDL_MP_PARTY_PROJECT_ACCOUNT_OWNER_NAME'),
                partyDetails.projectAccountOwnerName
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getPartyLabelDynamic('CDL_MP_PARTY_BACKUP_PROJECT_ACCOUNT_OWNER_NAME'),
                partyDetails.backupProjectAccountOwnerName
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getPartyLabelDynamic('CDL_MP_PARTY_ARM_NAME'),
                partyDetails.assistantRelationshipManagerName
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getPartyLabelDynamic('CDL_MP_PARTY_TEAM_LEADER_NAME'),
                partyDetails.teamLeaderName
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getPartyLabelDynamic('CDL_MP_PARTY_RM_NAME'),
                partyDetails.relationshipManagerName
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getPartyLabelDynamic('CDL_MP_PARTY_REMARKS'),
                partyDetails.additionalRemarks
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

      {/* Authorized Signatory Details Section */}
      {authorizedSignatoryData.length > 0 && (
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
                {getPartyLabelDynamic('CDL_AUTHORIZED_SIGNATORY_DETAILS')}
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
              {authorizedSignatoryData.map((signatory, index) => (
                <Grid size={{ xs: 12 }} key={signatory.id || index}>
                  {renderAuthorizedSignatoryFields(
                    signatory,
                    `Authorized Signatory ${index + 1}`,
                    index === authorizedSignatoryData.length - 1
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

export default Step3
