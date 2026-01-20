'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
import { formatDate } from '@/utils'
import { GlobalLoading } from '@/components/atoms'
import { useAccountLabelsWithCache, useAccount, useAccountDocuments } from '@/hooks'
import {
  ACCOUNT_DTO_SETTING_KEYS,
  getAccountLabel,
} from '@/constants/mappings/master/Entity/accountMapping'
import { useAppStore } from '@/store'
import { useApplicationSettings } from '@/hooks/useApplicationSettings'
import { useFormContext } from 'react-hook-form'

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
  accountId?: string | undefined
  onEditStep?: ((stepNumber: number) => void) | undefined
  isReadOnly?: boolean
}

const Step2 = ({ accountId: propAccountId, onEditStep, isReadOnly = false }: Step2Props) => {
  const params = useParams()
  const accountId = propAccountId || (params.id as string)
  const isDarkMode = useIsDarkMode()
  const { getValues } = useFormContext()

  // FIXED: Use React Query hooks instead of useEffect
  const {
    data: accountDetails,
    isLoading: isLoadingAccount,
    error: accountError,
  } = useAccount(accountId || '')

  const {
    data: documentsResponse,
    error: documentsError,
  } = useAccountDocuments(accountId || '', 'ACCOUNT', 0, 100) // Fetch all documents for review

  // Process document data from React Query response
  const documentData = useMemo(() => {
    if (!documentsResponse) return []

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

  // Only show loading if account details are loading (documents are optional)
  const loading = isLoadingAccount
  // Only show error if account details fail (documents errors are non-critical)
  const error = accountError
    ? (accountError instanceof Error ? accountError.message : 'Failed to fetch account details')
    : null
  // Documents error is non-critical - log it but don't block the UI
  const documentsErrorMsg = documentsError
    ? (documentsError instanceof Error ? documentsError.message : 'Failed to load documents')
    : null

  const { data: accountCategorySettings = [] } = useApplicationSettings(
    ACCOUNT_DTO_SETTING_KEYS.accountTypeDTO
  )
  const { data: taxPaymentSettings = [] } = useApplicationSettings(
    ACCOUNT_DTO_SETTING_KEYS.taxPaymentDTO
  )
  const { data: primaryAccountSettings = [] } = useApplicationSettings(
    ACCOUNT_DTO_SETTING_KEYS.primaryAccountDTO
  )
  const { data: bulkUploadProcessingSettings = [] } = useApplicationSettings(
    ACCOUNT_DTO_SETTING_KEYS.bulkUploadProcessingDTO
  )
  const { data: unitaryPaymentSettings = [] } = useApplicationSettings(
    ACCOUNT_DTO_SETTING_KEYS.unitaryPaymentDTO
  )

  const accountCategoryOptions = useMemo(
    () =>
      accountCategorySettings.map((item) => ({
        id: item.id,
        label: item.displayName || item.settingValue,
      })),
    [accountCategorySettings]
  )
  const taxPaymentOptions = useMemo(
    () =>
      taxPaymentSettings.map((item) => ({
        id: item.id,
        label: item.displayName || item.settingValue,
      })),
    [taxPaymentSettings]
  )
  const primaryAccountOptions = useMemo(
    () =>
      primaryAccountSettings.map((item) => ({
        id: item.id,
        label: item.displayName || item.settingValue,
      })),
    [primaryAccountSettings]
  )
  const bulkUploadProcessingOptions = useMemo(
    () =>
      bulkUploadProcessingSettings.map((item) => ({
        id: item.id,
        label: item.displayName || item.settingValue,
      })),
    [bulkUploadProcessingSettings]
  )
  const unitaryPaymentOptions = useMemo(
    () =>
      unitaryPaymentSettings.map((item) => ({
        id: item.id,
        label: item.displayName || item.settingValue,
      })),
    [unitaryPaymentSettings]
  )

  const getDtoLabel = useCallback(
    (value: unknown, options: Array<{ id: number; label: string }>) => {
      if (value && typeof value === 'object') {
        const valueObj = value as {
          id?: number | string
          displayName?: string
          settingValue?: string
          name?: string
          languageTranslationId?: { configValue?: string }
        }
        const directLabel =
          valueObj.languageTranslationId?.configValue ||
          valueObj.displayName ||
          valueObj.settingValue ||
          valueObj.name
        if (directLabel) return directLabel
        if (valueObj.id !== undefined) {
          const option = options.find((item) => item.id === Number(valueObj.id))
          return option?.label || '-'
        }
      }
      if (typeof value === 'number' || typeof value === 'string') {
        const option = options.find((item) => item.id === Number(value))
        return option?.label || '-'
      }
      return '-'
    },
    []
  )

  const formValues = getValues()
  const hasFormData =
    !!formValues?.accountNumber ||
    !!formValues?.productCode ||
    !!formValues?.accountDisplayName
  const displayAccountDetails =
    accountDetails ||
    (hasFormData ? (formValues as unknown as typeof accountDetails) : null)

  // Dynamic labels helper
  const { data: accountLabels, getLabel } = useAccountLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'
  const getAccountLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getAccountLabel(configId)
      return accountLabels
        ? getLabel(configId, currentLanguage, fallback)
        : fallback
    },
    [accountLabels, currentLanguage, getLabel]
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

  // Error state - only show if account details failed (critical error)
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

  // Show warning if documents failed but account details loaded successfully
  const showDocumentsWarning = documentsErrorMsg && !error && displayAccountDetails

  // No data state
  if (!displayAccountDetails) {
    if (!accountId || accountId.trim() === '') {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="info">Account ID is required to load review data.</Alert>
        </Box>
      )
    }
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No account details found.</Alert>
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
              {getAccountLabelDynamic('CDL_ACCOUNT_DETAILS')}
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
                getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_ID'),
                displayAccountDetails.id?.toString() || '-'
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_NO'),
                displayAccountDetails.accountNumber
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAccountLabelDynamic('CDL_ESCROW_PRODUCT_CODE'),
                displayAccountDetails.productCode
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_DISPLAY_NAME'),
                displayAccountDetails.accountDisplayName
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_IBAN_NUMBER'),
                displayAccountDetails.ibanNumber
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_OFFICIAL_ACCOUNT_TITLE'),
                displayAccountDetails.officialAccountTitle
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_VIRTUAL_ACCOUNT'),
                displayAccountDetails.virtualAccountNumber
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_TYPE'),
                displayAccountDetails.accountTypeCode
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_TYPE_DTO'),
                getDtoLabel(
                  displayAccountDetails.accountTypeDTO,
                  accountCategoryOptions
                )
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAccountLabelDynamic('CDL_ESCROW_TAX_PAYMENT_DTO'),
                getDtoLabel(displayAccountDetails.taxPaymentDTO, taxPaymentOptions)
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAccountLabelDynamic('CDL_ESCROW_PRIMARY_ACCOUNT_DTO'),
                getDtoLabel(
                  displayAccountDetails.primaryAccountDTO,
                  primaryAccountOptions
                )
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAccountLabelDynamic('CDL_ESCROW_BULK_UPLOAD_PROCESSING_DTO'),
                getDtoLabel(
                  displayAccountDetails.bulkUploadProcessingDTO,
                  bulkUploadProcessingOptions
                )
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAccountLabelDynamic('CDL_ESCROW_UNITARY_PAYMENT_DTO'),
                getDtoLabel(
                  displayAccountDetails.unitaryPaymentDTO,
                  unitaryPaymentOptions
                )
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_ASSIGNMENT_STATUS'),
                displayAccountDetails.assignmentStatus
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_ASSIGNED'),
                displayAccountDetails.assignedToReference
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_OPENING_DATE'),
                displayAccountDetails.accountOpenDateTime
                  ? formatDate(displayAccountDetails.accountOpenDateTime, 'DD/MM/YYYY')
                  : '-'
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_LOOKUP_FIELD_1'),
                displayAccountDetails.referenceField1
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                getAccountLabelDynamic('CDL_ESCROW_ACCOUNT_LOOKUP_FIELD_2'),
                displayAccountDetails.referenceField2
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
