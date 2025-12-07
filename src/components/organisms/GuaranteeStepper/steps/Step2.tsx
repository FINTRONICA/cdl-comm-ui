'use client'

import React, { useEffect, useState } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material'
import { GlobalLoading } from '@/components/atoms'
import EditIcon from '@mui/icons-material/Edit'
import { useFormContext } from 'react-hook-form'
import { GuaranteeData } from '../guaranteeTypes'
import { useSuretyBondLabelsWithCache } from '@/hooks/useSuretyBondLabelsWithCache'
import { getSuretyBondLabel } from '@/constants/mappings/suretyBondMapping'
import { useAppStore } from '@/store'
import { useSuretyBond } from '../../../../hooks/useSuretyBonds'
import { useApplicationSettings } from '../../../../hooks/useApplicationSettings'
import { BuildPartnerService } from '../../../../services/api/buildPartnerService'
import dayjs from 'dayjs'
import { formatDate } from '@/utils'

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
  isDark: boolean
  renderDisplayField: (
    label: string,
    value: string | number | null
  ) => React.ReactElement
  renderCheckboxField: (label: string, checked: boolean) => React.ReactElement
}

const Section = ({
  title,
  fields,
  isDark,
  renderDisplayField,
  renderCheckboxField,
}: SectionProps) => (
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
        color: isDark ? '#F9FAFB' : '#1E2939',
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

interface DocumentData {
  id: string
  fileName: string
  documentType: string
  uploadDate: string
}

interface Step2Props {
  onEdit: () => void
  onEditDocuments?: () => void
  suretyBondId?: string | null
  isViewMode?: boolean
}

const Step2 = ({
  onEdit,
  onEditDocuments,
  suretyBondId,
  isViewMode,
}: Step2Props) => {
  const { setValue } = useFormContext<GuaranteeData>()
  const [documents, setDocuments] = useState<DocumentData[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const isDarkMode = useIsDarkMode()

  // Standardized surety bond label resolver
  const language = useAppStore((s) => s.language) || 'EN'
  const { getLabel } = useSuretyBondLabelsWithCache(language)

  const renderDisplayField = (
    label: string,
    value: string | number | null = '-'
  ) => (
    <Box sx={fieldBoxSx}>
      <Typography sx={getLabelSx(isDarkMode)}>{label}</Typography>
      <Typography sx={getValueSx(isDarkMode)}>{value || '-'}</Typography>
    </Box>
  )

  // Fetch surety bond types for displaying type displayName
  const { data: guaranteeTypes, loading: guaranteeTypesLoading } =
    useApplicationSettings('SURETY_BOND_TYPE')

  // Fetch surety bond statuses for displaying status displayName
  const { data: guaranteeStatuses, loading: guaranteeStatusesLoading } =
    useApplicationSettings('SURETY_BOND_STATUS')

  // Fetch surety bond data by ID if provided
  const {
    suretyBond,
    loading: suretyBondLoading,
    error: suretyBondError,
  } = useSuretyBond(suretyBondId || '')

  // Prepopulate form data when surety bond data is loaded
  useEffect(() => {
    if (suretyBond && suretyBondId) {
      setValue('guaranteeRefNo', suretyBond.suretyBondReferenceNumber || '')
      setValue(
        'guaranteeType',
        suretyBond.suretyBondTypeDTO?.id?.toString() || ''
      )
      setValue(
        'guaranteeDate',
        suretyBond.suretyBondDate ? dayjs(suretyBond.suretyBondDate) : null
      )
      setValue('projectCif', '') // This would need to be fetched from the real estate asset
      setValue(
        'projectName',
        suretyBond.realEstateAssestDTO?.id?.toString() || ''
      )
      setValue(
        'developerName',
        suretyBond.buildPartnerDTO?.id?.toString() || ''
      )
      setValue('openEndedGuarantee', suretyBond.suretyBondOpenEnded || false)
      setValue('projectCompletionDate', null) // This would need to be fetched from the real estate asset
      setValue('noOfAmendments', suretyBond.suretyBondNoOfAmendment || '')
      setValue(
        'guaranteeExpirationDate',
        suretyBond.suretyBondExpirationDate
          ? dayjs(suretyBond.suretyBondExpirationDate)
          : null
      )
      setValue('guaranteeAmount', (suretyBond.suretyBondAmount || 0).toString())
      setValue(
        'suretyBondNewReadingAmendment',
        suretyBond.suretyBondNewReadingAmendment || ''
      )
      setValue('issuerBank', suretyBond.issuerBankDTO?.id?.toString() || '')
      setValue('status', suretyBond.suretyBondStatusDTO?.id?.toString() || '')
    }
  }, [suretyBond, suretyBondId, setValue])

  // Fetch documents when surety bond ID is available
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!suretyBondId) {
        setDocuments([])
        return
      }

      try {
        setLoadingDocuments(true)
        const buildPartnerService = new BuildPartnerService()
        const docResponse = await buildPartnerService.getBuildPartnerDocuments(
          suretyBondId,
          'SURETY_BOND',
          0,
          100
        )
        const mappedDocuments: DocumentData[] = docResponse.content.map(
          (doc: any) => ({
            id: doc.id?.toString() || `doc_${Date.now()}`,
            fileName: doc.documentName || 'Unknown Document',
            documentType:
              doc.documentTypeDTO?.languageTranslationId?.configValue ||
              doc.documentTypeDTO?.settingValue ||
              'N/A',
            uploadDate: doc.uploadDate || '',
          })
        )
        setDocuments(mappedDocuments)
      } catch (error) {
        console.error('Failed to fetch documents:', error)
        setDocuments([])
      } finally {
        setLoadingDocuments(false)
      }
    }

    fetchDocuments()
  }, [suretyBondId])

  // Helper function to get translated label with mapping fallback
  const getTranslatedLabel = (configId: string, fallback?: string): string =>
    getLabel(configId, language, fallback ?? getSuretyBondLabel(configId))

  // Helper function to get type display name from settingValue
  const getTypeDisplayName = (settingValue: string | undefined): string => {
    if (!settingValue || guaranteeTypesLoading || !guaranteeTypes) {
      return '-'
    }

    const matchingType = guaranteeTypes.find(
      (type) => type.settingValue === settingValue
    )
    return matchingType?.displayName || settingValue
  }

  // Helper function to get status display name from settingValue
  const getStatusDisplayName = (settingValue: string | undefined): string => {
    if (!settingValue || guaranteeStatusesLoading || !guaranteeStatuses) {
      return '-'
    }

    const matchingStatus = guaranteeStatuses.find(
      (status) => status.settingValue === settingValue
    )
    return matchingStatus?.displayName || settingValue
  }

  const generalDetails = [
    {
      gridSize: 6,
      label: getTranslatedLabel('CDL_SB_REF_NO'),
      value: suretyBond?.suretyBondReferenceNumber || '-',
    },
    {
      gridSize: 6,
      label: getTranslatedLabel('CDL_SB_TYPE'),
      value: getTypeDisplayName(suretyBond?.suretyBondTypeDTO?.settingValue),
    },
    {
      gridSize: 6,
      label: getTranslatedLabel('CDL_SB_DATE'),
      value: suretyBond?.suretyBondDate
        ? dayjs(suretyBond.suretyBondDate).format('DD/MM/YYYY')
        : '-',
    },
    {
      gridSize: 6,
      label: getTranslatedLabel('CDL_SB_BPA_CIF'),
      value: suretyBond?.realEstateAssestDTO?.reaCif || '-',
    },
    {
      gridSize: 6,
      label: getTranslatedLabel('CDL_SB_BPA_NAME'),
      value: suretyBond?.realEstateAssestDTO?.reaName || '-',
    },
    {
      gridSize: 6,
      label: getTranslatedLabel('CDL_SB_BP_NAME'),
      value: suretyBond?.realEstateAssestDTO?.buildPartnerDTO?.bpName || '-',
    },
  ]

  const guaranteeDetails = [
    {
      gridSize: 3,
      label: getTranslatedLabel('CDL_SB_OPEN_ENDED'),
      value: suretyBond?.suretyBondOpenEnded || false,
    },
    {
      gridSize: 3,
      label: getTranslatedLabel('CDL_SB_BPA_COMPLETION_DATE'),
      value: suretyBond?.realEstateAssestDTO?.reaCompletionDate
        ? dayjs(suretyBond.realEstateAssestDTO.reaCompletionDate).format(
            'DD/MM/YYYY'
          )
        : '-',
    },
    {
      gridSize: 3,
      label: getTranslatedLabel('CDL_SB_NO_OF_AMEND'),
      value: suretyBond?.suretyBondNoOfAmendment || '-',
    },
    {
      gridSize: 3,
      label: getTranslatedLabel('CDL_SB_EXPIARY_DATE'),
      value: suretyBond?.suretyBondExpirationDate
        ? dayjs(suretyBond.suretyBondExpirationDate).format('DD/MM/YYYY')
        : '-',
    },
    {
      gridSize: 4,
      label: getTranslatedLabel('CDL_SB_AMOUNT'),
      value: suretyBond?.suretyBondAmount
        ? `${suretyBond.suretyBondAmount.toLocaleString()}`
        : '0',
    },
    {
      gridSize: 4,
      label: getTranslatedLabel('CDL_SB_NEW_READING'),
      value: suretyBond?.suretyBondNewReadingAmendment || '-',
    },
    {
      gridSize: 4,
      label: getTranslatedLabel('CDL_SB_BANK'),
      value: suretyBond?.issuerBankDTO?.fiName || '-',
    },
    {
      gridSize: 4,
      label: getTranslatedLabel('CDL_SB_STATUS'),
      value: getStatusDisplayName(
        suretyBond?.suretyBondStatusDTO?.settingValue
      ),
    },
  ]

  // Show loading state while fetching surety bond data
  if (suretyBondId && suretyBondLoading) {
    return (
      <Card
        sx={{
          boxShadow: 'none',
          backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
          border: isDarkMode ? '1px solid #334155' : '1px solid #E5E7EB',
          width: '94%',
          margin: '0 auto',
        }}
      >
        <CardContent>
          <Box
            sx={{
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
              borderRadius: '16px',
              margin: '0 auto',
              width: '100%',
              height: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GlobalLoading fullHeight className="min-h-[200px]" />
          </Box>
        </CardContent>
      </Card>
    )
  }

  // Show error state if there's an error fetching surety bond data
  if (suretyBondId && suretyBondError) {
    return (
      <Card
        sx={{
          boxShadow: 'none',
          backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
          border: isDarkMode ? '1px solid #334155' : '1px solid #E5E7EB',
          width: '94%',
          margin: '0 auto',
        }}
      >
        <CardContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <Box textAlign="center">
              <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                {getTranslatedLabel(
                  'CDL_SB_ERROR',
                  'Error Loading Surety Bond'
                )}
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 2, color: isDarkMode ? '#CBD5E1' : 'text.secondary' }}
              >
                {suretyBondError}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                sx={{ textTransform: 'none' }}
              >
                {getTranslatedLabel('CDL_SB_RETRY')}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      sx={{
        boxShadow: 'none',
        backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
        border: isDarkMode ? '1px solid #334155' : '1px solid #E5E7EB',
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
            sx={{
              fontFamily: 'Outfit',
              fontSize: '20px',
              color: isDarkMode ? '#F9FAFB' : '#1E2939',
            }}
          >
            {getTranslatedLabel('CDL_SB_DETAILS')}
          </Typography>
          {!isViewMode && (
            <Button
              startIcon={<EditIcon />}
              onClick={onEdit}
              sx={{
                fontSize: '14px',
                textTransform: 'none',
                color: isDarkMode ? '#93C5FD' : '#2563EB',
                borderColor: isDarkMode ? '#334155' : 'transparent',
                '&:hover': {
                  backgroundColor: isDarkMode
                    ? 'rgba(51, 65, 85, 0.3)'
                    : '#DBEAFE',
                },
              }}
            >
              {getTranslatedLabel('CDL_SB_EDIT')}
            </Button>
          )}
        </Box>
        <Divider
          sx={{ mb: 2, borderColor: isDarkMode ? '#334155' : '#E5E7EB' }}
        />

        <Section
          title={getTranslatedLabel('CDL_SB_GENERAL_INFO')}
          fields={generalDetails}
          isDark={isDarkMode}
          renderDisplayField={renderDisplayField}
          renderCheckboxField={renderCheckboxField}
        />
        <Section
          title={getTranslatedLabel('CDL_SB_GUARANTEE_INFO')}
          fields={guaranteeDetails}
          isDark={isDarkMode}
          renderDisplayField={renderDisplayField}
          renderCheckboxField={renderCheckboxField}
        />

        {/* Documents Section */}
        <Box mb={4}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
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
              {getTranslatedLabel('CDL_SB_DOCUMENTS_SECTION', 'Documents')}
            </Typography>
            {!isViewMode && onEditDocuments && (
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
                {getTranslatedLabel('CDL_SB_EDIT', 'Edit')}
              </Button>
            )}
          </Box>
          <Divider
            sx={{ mb: 2, borderColor: isDarkMode ? '#334155' : '#E5E7EB' }}
          />
          {loadingDocuments ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={24} />
              <Typography sx={{ ml: 2 }}>Loading documents...</Typography>
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
                    sx={{ backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB' }}
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
                  {documents.map((doc, index) => (
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
                        {doc.uploadDate
                          ? formatDate(doc.uploadDate, 'DD/MM/YYYY')
                          : '-'}
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
          ) : (
            <Typography sx={{ ...getValueSx(isDarkMode), py: 2 }}>
              {getTranslatedLabel(
                'CDL_SB_NO_DOCUMENTS',
                'No documents uploaded'
              )}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default Step2
