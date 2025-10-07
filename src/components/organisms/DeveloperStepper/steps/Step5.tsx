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
  CircularProgress,
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

const labelSx = {
  color: '#6B7280',
  fontFamily: 'Outfit, sans-serif',
  fontWeight: 400,
  fontSize: '12px',
  lineHeight: '16px',
  letterSpacing: 0,
  marginBottom: '4px',
}

const valueSx = {
  color: '#1F2937',
  fontFamily: 'Outfit, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
  lineHeight: '20px',
  letterSpacing: 0,
  wordBreak: 'break-word',
}

const fieldBoxSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
  marginBottom: '16px',
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

// Data interfaces
interface ContactData {
  bpcFirstName: string
  bpcLastName: string
  bpcContactEmail: string
  bpcContactAddressLine1: string
  bpcContactAddressLine2: string
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
            documentType: doc.documentTypeDTO?.settingValue || '',
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
        label: 'Contact Name',
        value:
          `${contact.bpcFirstName || ''} ${contact.bpcLastName || ''}`.trim() ||
          '',
        gridSize: 6,
      },
      {
        label: 'Contact Email',
        value: contact.bpcContactEmail || ' ',
        gridSize: 6,
      },
      {
        label: 'Contact Address',
        value:
          `${contact.bpcContactAddressLine1 || ''} ${contact.bpcContactAddressLine2 || ''}`.trim() ||
          '',
        gridSize: 6,
      },
      {
        label: 'Contact P.O. Box',
        value: contact.bpcContactPoBox || '',
        gridSize: 6,
      },
      {
        label: 'Country Code',
        value: contact.bpcCountryMobCode || '',
        gridSize: 3,
      },
      {
        label: 'Tel No.',
        value: contact.bpcContactTelNo || '',
        gridSize: 3,
      },
      {
        label: 'Mobile Number',
        value: contact.bpcContactMobNo || '',
        gridSize: 3,
      },
      { label: 'FAX', value: contact.bpcContactFaxNo || '', gridSize: 3 },
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
        {!isLast && <Divider sx={{ mb: 0, mt: 4 }} />}
      </Box>
    )
  }

  // Render fee fields with actual API data
  const renderFeeFields = (fee: FeeData, title: string, isLast: boolean) => {
    const fields = [
      {
        label: 'Fee Type',
        value: fee.bpFeeCategoryDTO?.languageTranslationId?.configValue || '',
        gridSize: 6,
      },
      {
        label: 'Frequency',
        value: fee.bpFeeFrequencyDTO?.languageTranslationId?.configValue || '',
        gridSize: 6,
      },
      {
        label: 'Debit Amount',
        value: fee.debitAmount?.toString() || '',
        gridSize: 6,
      },
      {
        label: 'Fee to be Collected',
        value: fee.feeCollectionDate
          ? formatDate(fee.feeCollectionDate, 'MMM DD, YYYY')
          : '',
        gridSize: 6,
      },
      {
        label: 'Next Recovery Date',
        value: fee.feeNextRecoveryDate
          ? formatDate(fee.feeNextRecoveryDate, 'MMM DD, YYYY')
          : '',
        gridSize: 6,
      },
      {
        label: 'Fee Percentage',
        value: fee.feePercentage?.toString() || '',
        gridSize: 6,
      },
      {
        label: 'Amount',
        value: fee.totalAmount?.toString() || '',
        gridSize: 6,
      },
      {
        label: 'VAT Percentage',
        value: fee.vatPercentage?.toString() || '',
        gridSize: 6,
      },
      {
        label: 'Currency',
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
        {!isLast && <Divider sx={{ mb: 0, mt: 4 }} />}
      </Box>
    )
  }

  // Render beneficiary fields with actual API data
  const renderBeneficiaryFields = (
    beneficiary: BuildPartnerBeneficiaryResponse,
    title: string,
    isLast: boolean
  ) => {
    const fields = [
      {
        label: 'Transfer Type',
        value: beneficiary.bpbBeneficiaryType || '',
        gridSize: 6,
      },
      {
        label: 'Beneficiary ID',
        value: beneficiary.bpbBeneficiaryId || '',
        gridSize: 6,
      },
      { label: 'Name', value: beneficiary.bpbName || '', gridSize: 6 },
      { label: 'Bank', value: beneficiary.bpbBankName || '', gridSize: 6 },
      {
        label: 'Account Number/IBAN',
        value: beneficiary.bpbAccountNumber || '',
        gridSize: 6,
      },
      {
        label: 'Swift/BIC',
        value: beneficiary.bpbSwiftCode || '',
        gridSize: 6,
      },
      {
        label: 'Routing Code',
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
        {!isLast && <Divider sx={{ mb: 0, mt: 4 }} />}
      </Box>
    )
  }

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading review data...</Typography>
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
          backgroundColor: '#FFFFFF',
          width: '100%',
          margin: '0 auto',
          mb: 3,
          border: '1px solid #E5E7EB',
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
                color: '#1E2939',
              }}
            >
              Developer Details
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
                  color: '#6B7280',
                  borderColor: '#D1D5DB',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#9CA3AF',
                    backgroundColor: '#F9FAFB',
                  },
                }}
              >
                Edit
              </Button>
            )}
          </Box>
          <Divider sx={{ mb: 3, borderColor: '#E5E7EB' }} />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                'Developer ID (RERA)*',
                buildPartnerDetails.bpDeveloperId
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                'Developer CIF (Core Banking)*',
                buildPartnerDetails.bpCifrera
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                'Developer Registration No.',
                buildPartnerDetails.bpDeveloperRegNo
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                'RERA Registration Date*',
                buildPartnerDetails.bpOnboardingDate
                  ? formatDate(
                      buildPartnerDetails.bpOnboardingDate,
                      'MM/DD/YYYY'
                    )
                  : ' '
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                'Developer Name (English)*',
                buildPartnerDetails.bpName
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                'Developer Name (Arabic)*',
                buildPartnerDetails.bpNameLocal
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                'Master Developer (if any)',
                buildPartnerDetails.bpMasterName
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                'Regulator*',
                buildPartnerDetails.bpRegulatorDTO ? ' ' : ' '
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 12 }}>
              {renderDisplayField(
                'Address',
                buildPartnerDetails.bpContactAddress
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              {renderDisplayField('Mobile No.', buildPartnerDetails.bpMobile)}
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              {renderDisplayField('Email', buildPartnerDetails.bpEmail)}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField('FAX No', buildPartnerDetails.bpFax)}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                'License Number (Trade License)*',
                buildPartnerDetails.bpLicenseNo
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField(
                'License Expiry Date*',
                buildPartnerDetails.bpLicenseExpDate
                  ? formatDate(
                      buildPartnerDetails.bpLicenseExpDate,
                      'MM/DD/YYYY'
                    )
                  : ' '
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              {renderCheckboxField(
                'World Check Flag',
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
                'World Check Flag Remarks',
                buildPartnerDetails.bpWorldCheckRemarks
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderDisplayField('Remarks', buildPartnerDetails.bpremark)}
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
            backgroundColor: '#FFFFFF',
            width: '100%',
            margin: '0 auto',
            mb: 3,
            border: '1px solid #E5E7EB',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '18px',
                lineHeight: '24px',
                color: '#1E2939',
                mb: 3,
              }}
            >
              Submitted Documents
            </Typography>
            <TableContainer
              component={Paper}
              sx={{ boxShadow: 'none', border: '1px solid #E5E7EB' }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
                    <TableCell
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#374151',
                        borderBottom: '1px solid #E5E7EB',
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#374151',
                        borderBottom: '1px solid #E5E7EB',
                      }}
                    >
                      Date
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#374151',
                        borderBottom: '1px solid #E5E7EB',
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
                      sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}
                    >
                      <TableCell
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '14px',
                          color: '#374151',
                          borderBottom: '1px solid #E5E7EB',
                        }}
                      >
                        {doc.fileName}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '14px',
                          color: '#374151',
                          borderBottom: '1px solid #E5E7EB',
                        }}
                      >
                        {formatDate(doc.uploadDate, 'DD-MM-YYYY')}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '14px',
                          color: '#374151',
                          borderBottom: '1px solid #E5E7EB',
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
            backgroundColor: '#FFFFFF',
            width: '100%',
            margin: '0 auto',
            mb: 3,
            border: '1px solid #E5E7EB',
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
                  color: '#1E2939',
                }}
              >
                Contact Details
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
                    color: '#6B7280',
                    borderColor: '#D1D5DB',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#9CA3AF',
                      backgroundColor: '#F9FAFB',
                    },
                  }}
                >
                  Edit
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 3, borderColor: '#E5E7EB' }} />
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
            backgroundColor: '#FFFFFF',
            width: '100%',
            margin: '0 auto',
            mb: 3,
            border: '1px solid #E5E7EB',
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
                  color: '#1E2939',
                }}
              >
                Fee Details
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
                    color: '#6B7280',
                    borderColor: '#D1D5DB',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#9CA3AF',
                      backgroundColor: '#F9FAFB',
                    },
                  }}
                >
                  Edit
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 3, borderColor: '#E5E7EB' }} />
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
            backgroundColor: '#FFFFFF',
            width: '100%',
            margin: '0 auto',
            mb: 3,
            border: '1px solid #E5E7EB',
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
                  color: '#1E2939',
                }}
              >
                Beneficiary Details
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
                    color: '#6B7280',
                    borderColor: '#D1D5DB',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#9CA3AF',
                      backgroundColor: '#F9FAFB',
                    },
                  }}
                >
                  Edit
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 3, borderColor: '#E5E7EB' }} />
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
