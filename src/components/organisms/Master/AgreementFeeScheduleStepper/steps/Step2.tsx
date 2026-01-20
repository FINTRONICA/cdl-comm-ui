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
import { useQuery } from '@tanstack/react-query'
import { agreementFeeScheduleService } from '@/services/api/masterApi/Entitie/agreementFeeScheduleService'
import { formatDate } from '@/utils'
import { GlobalLoading } from '@/components/atoms'
import { useAgreementFeeScheduleLabelsWithCache, useAgreementFeeSchedule } from '@/hooks'
import {
  AGREEMENT_FEE_SCHEDULE_DTO_SETTING_KEYS,
  getAgreementFeeScheduleLabel,
} from '@/constants/mappings/master/Entity/agreementFeeScheduleMapping'
import { useAppStore } from '@/store'
import { useApplicationSettings } from '@/hooks/useApplicationSettings'
import { useFeeCategories } from '@/hooks/useFeeDropdowns'

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

interface Step2Props {
  agreementFeeScheduleId?: string | undefined
  onEditStep?: ((stepNumber: number) => void) | undefined
  isReadOnly?: boolean
}

const Step2 = ({ agreementFeeScheduleId: propAgreementFeeScheduleId, onEditStep, isReadOnly = false }: Step2Props) => {
  const params = useParams()
  const agreementFeeScheduleId = propAgreementFeeScheduleId || (params.id as string)
  const isDarkMode = useIsDarkMode()

  // Use React Query for agreement fee schedule details
  const { data: agreementFeeScheduleDetails, isLoading: isLoadingDetails, error: detailsError } = useAgreementFeeSchedule(
    agreementFeeScheduleId && agreementFeeScheduleId.trim() !== '' ? agreementFeeScheduleId : ''
  )

  // Use React Query for documents
  const { data: documentsResponse, error: documentsError } = useQuery({
    queryKey: ['agreementFeeScheduleDocuments', agreementFeeScheduleId, 'AGREEMENT_FEE_SCHEDULE'],
    queryFn: async () => {
      if (!agreementFeeScheduleId || agreementFeeScheduleId.trim() === '') {
        return null
      }
      return await agreementFeeScheduleService.getAgreementFeeScheduleDocuments(
        agreementFeeScheduleId,
        'AGREEMENT_FEE_SCHEDULE',
        0,
        1000 // Fetch all documents for review
      )
    },
    enabled: !!agreementFeeScheduleId && agreementFeeScheduleId.trim() !== '',
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      // Disable retry on 500 errors to prevent retry storms
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } }
        if (httpError.response?.status === 500) {
          return false
        }
      }
      return failureCount < 1
    },
  })

  // Only show loading if details are loading (documents are optional)
  const loading = isLoadingDetails
  // Only show error if details fail (documents errors are non-critical)
  const error = detailsError
    ? (detailsError as Error).message
    : null
  // Documents error is non-critical - log it but don't block the UI
  const documentsErrorMsg = documentsError
    ? (documentsError as Error).message
    : null

  // Dynamic labels helper
  const { data: agreementFeeScheduleLabels, getLabel } = useAgreementFeeScheduleLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'
  const getAgreementFeeScheduleLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getAgreementFeeScheduleLabel(configId)
      return agreementFeeScheduleLabels
        ? getLabel(configId, currentLanguage, fallback)
        : fallback
    },
    [agreementFeeScheduleLabels, currentLanguage, getLabel]
  )

  const { data: feeSettings = [] } = useApplicationSettings(
    AGREEMENT_FEE_SCHEDULE_DTO_SETTING_KEYS.feeDTO
  )
  const { data: feeTypeSettings = [] } = useApplicationSettings(
    AGREEMENT_FEE_SCHEDULE_DTO_SETTING_KEYS.feeTypeDTO
  )
  const { data: feesFrequencySettings = [] } = useApplicationSettings(
    AGREEMENT_FEE_SCHEDULE_DTO_SETTING_KEYS.feesFrequencyDTO
  )
  const { data: frequencyBasisSettings = [] } = useApplicationSettings(
    AGREEMENT_FEE_SCHEDULE_DTO_SETTING_KEYS.frequencyBasisDTO
  )
  const { data: feeCategories = [] } = useFeeCategories()

  const getSettingValueById = useCallback(
    (
      settings: Array<{ id: number; displayName: string; settingValue?: string }>,
      id?: number | string | null
    ) => {
      if (id === null || id === undefined || id === '') return '-'
      const idString = String(id)
      const found = settings.find((item) => String(item.id) === idString)
      return found?.displayName || found?.settingValue || '-'
    },
    []
  )

  const getFeeCategoryById = useCallback(
    (
      categories: Array<{ id: number; configValue?: string; settingValue?: string }>,
      id?: number | string | null
    ) => {
      if (id === null || id === undefined || id === '') return '-'
      const idString = String(id)
      const found = categories.find((item) => String(item.id) === idString)
      return found?.configValue || found?.settingValue || '-'
    },
    []
  )

  const getSettingDisplayValue = useCallback(
    (setting?: {
      settingValue?: string
      languageTranslationId?: { configValue?: string }
      id?: number
    } | null) => {
      if (!setting) return '-'
      return (
        setting.languageTranslationId?.configValue ||
        setting.settingValue ||
        '-'
      )
    },
    []
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

  // Process documents data from React Query response
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

  // Error state - only show if details failed (critical error)
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        {documentsErrorMsg && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Note: Could not load documents. {documentsErrorMsg}
          </Alert>
        )}
      </Box>
    )
  }

  // Show warning if documents failed but details loaded successfully
  const showDocumentsWarning = documentsErrorMsg && !error && agreementFeeScheduleDetails

  // No data state
  if (!agreementFeeScheduleDetails) {
    if (!agreementFeeScheduleId || agreementFeeScheduleId.trim() === '') {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="info">Agreement Fee Schedule ID is required to load review data.</Alert>
        </Box>
      )
    }
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No agreement fee schedule details found.</Alert>
        {documentsErrorMsg && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Note: Could not load documents. {documentsErrorMsg}
          </Alert>
        )}
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {showDocumentsWarning && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Note: Could not load documents. {documentsErrorMsg}
        </Alert>
      )}
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
              {getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_DETAILS')}
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
                getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_ID'),
                agreementFeeScheduleDetails.id?.toString() || '-'
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_START_DATE'),
                agreementFeeScheduleDetails.effectiveStartDate
                  ? formatDate(agreementFeeScheduleDetails.effectiveStartDate, 'DD/MM/YYYY')
                  : '-'
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_END_DATE'),
                agreementFeeScheduleDetails.effectiveEndDate
                  ? formatDate(agreementFeeScheduleDetails.effectiveEndDate, 'DD/MM/YYYY')
                  : '-'
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_LOCATION'),
                agreementFeeScheduleDetails.operatingLocation
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_DEAL_PRIORITY'),
                agreementFeeScheduleDetails.priorityLevel
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_AMOUNT_RATE_PER_TRANSACTION'),
                agreementFeeScheduleDetails.transactionRateAmount
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_DEBIT_ACCOUNT'),
                agreementFeeScheduleDetails.debitAccountNumber
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_CREDIT_TO_ACCOUNT'),
                agreementFeeScheduleDetails.creditAccountNumber
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_FEE'),
                getSettingDisplayValue(agreementFeeScheduleDetails.feeDTO) !== '-'
                  ? getSettingDisplayValue(agreementFeeScheduleDetails.feeDTO)
                  : getSettingValueById(feeSettings, agreementFeeScheduleDetails.feeDTO?.id) !== '-'
                    ? getSettingValueById(feeSettings, agreementFeeScheduleDetails.feeDTO?.id)
                    : getFeeCategoryById(feeCategories, agreementFeeScheduleDetails.feeDTO?.id)
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_FEE_TYPE'),
                getSettingDisplayValue(agreementFeeScheduleDetails.feeTypeDTO) !== '-'
                  ? getSettingDisplayValue(agreementFeeScheduleDetails.feeTypeDTO)
                  : getSettingValueById(feeTypeSettings, agreementFeeScheduleDetails.feeTypeDTO?.id) !== '-'
                    ? getSettingValueById(feeTypeSettings, agreementFeeScheduleDetails.feeTypeDTO?.id)
                    : getFeeCategoryById(feeCategories, agreementFeeScheduleDetails.feeTypeDTO?.id)
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_FEES_FREQUENCY'),
                getSettingDisplayValue(agreementFeeScheduleDetails.feesFrequencyDTO) !== '-'
                  ? getSettingDisplayValue(agreementFeeScheduleDetails.feesFrequencyDTO)
                  : getSettingValueById(
                      feesFrequencySettings,
                      agreementFeeScheduleDetails.feesFrequencyDTO?.id
                    )
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAgreementFeeScheduleLabelDynamic('CDL_AGREEMENT_FEE_SCHEDULE_FREQUENCY_BASIS'),
                getSettingDisplayValue(agreementFeeScheduleDetails.frequencyBasisDTO) !== '-'
                  ? getSettingDisplayValue(agreementFeeScheduleDetails.frequencyBasisDTO)
                  : getSettingValueById(
                      frequencyBasisSettings,
                      agreementFeeScheduleDetails.frequencyBasisDTO?.id
                    )
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
