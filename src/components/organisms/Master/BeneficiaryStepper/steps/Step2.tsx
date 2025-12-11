'use client'

import React, { useEffect, useCallback, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
  Button,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { useFormContext } from 'react-hook-form'
import { useBeneficiaryLabelsWithCache } from '@/hooks/master/CustomerHook/useBeneficiaryLabelsWithCache'
import { useAppStore } from '@/store'
import { useBeneficiaryById } from '@/hooks/master/CustomerHook/useBeneficiary'
import { getMasterLabel } from '@/constants/mappings/master/masterMapping'

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
  beneficiaryId?: string | undefined
  isReadOnly?: boolean
  onEditStep?: (stepNumber: number) => void
}

const Step2 = ({ beneficiaryId, isReadOnly = false, onEditStep }: Step2Props) => {
  const theme = useTheme()
  const isDarkMode = useIsDarkMode()
  const { watch, setValue } = useFormContext()
  const formData = watch()

  // Fetch beneficiary data for review if editing
  const { data: beneficiaryData } = useBeneficiaryById(
    beneficiaryId || null
  )

  // Dynamic label support
  const { getLabel } = useBeneficiaryLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  const getBeneficiaryLabel = useCallback(
    (configId: string, fallback: string): string => {
      const fallbackLabel = getMasterLabel(configId) || fallback
      return getLabel(configId, currentLanguage, fallbackLabel)
    },
    [getLabel, currentLanguage]
  )

  // Populate review data when beneficiary data is loaded
  useEffect(() => {
    if (beneficiaryData && beneficiaryId) {
      // Pre-populate form with beneficiary data for review
      const data = beneficiaryData as unknown as Record<string, unknown>
      
      // Map API response fields to form fields
      if (data.beneficiaryFullName) {
        setValue('beneficiaryFullName', data.beneficiaryFullName, {
          shouldValidate: false,
          shouldDirty: false,
        })
      }
      if (data.beneficiaryAddressLine1) {
        setValue('beneficiaryAddressLine1', data.beneficiaryAddressLine1, {
          shouldValidate: false,
          shouldDirty: false,
        })
      }
      if (data.telephoneNumber) {
        setValue('telephoneNumber', data.telephoneNumber, {
          shouldValidate: false,
          shouldDirty: false,
        })
      }
      if (data.mobileNumber) {
        setValue('mobileNumber', data.mobileNumber, {
          shouldValidate: false,
          shouldDirty: false,
        })
      }
      if (data.beneficiaryAccountNumber) {
        setValue('beneficiaryAccountNumber', data.beneficiaryAccountNumber, {
          shouldValidate: false,
          shouldDirty: false,
        })
      }
      if (data.bankIfscCode) {
        setValue('bankIfscCode', data.bankIfscCode, {
          shouldValidate: false,
          shouldDirty: false,
        })
      }
      if (data.beneficiaryBankName) {
        setValue('beneficiaryBankName', data.beneficiaryBankName, {
          shouldValidate: false,
          shouldDirty: false,
        })
      }
      if (data.bankRoutingCode) {
        setValue('bankRoutingCode', data.bankRoutingCode, {
          shouldValidate: false,
          shouldDirty: false,
        })
      }
      if (data.additionalRemarks) {
        setValue('additionalRemarks', data.additionalRemarks, {
          shouldValidate: false,
          shouldDirty: false,
        })
      }

      // Set DTO fields
      if (data.accountTypeDTO && typeof data.accountTypeDTO === 'object' && 'id' in data.accountTypeDTO) {
        setValue('accountTypeDTO', { id: (data.accountTypeDTO as { id: number }).id }, {
          shouldValidate: false,
          shouldDirty: false,
        })
      }
      if (data.transferTypeDTO && typeof data.transferTypeDTO === 'object' && 'id' in data.transferTypeDTO) {
        setValue('transferTypeDTO', { id: (data.transferTypeDTO as { id: number }).id }, {
          shouldValidate: false,
          shouldDirty: false,
        })
      }
      if (data.roleDTO && typeof data.roleDTO === 'object' && 'id' in data.roleDTO) {
        setValue('roleDTO', { id: (data.roleDTO as { id: number }).id }, {
          shouldValidate: false,
          shouldDirty: false,
        })
      }
    }
  }, [beneficiaryData, beneficiaryId, setValue])

  // Render display field helper
  const renderDisplayField = useCallback(
    (label: string, value: string | number | null | undefined) => {
      if (!value || value === null || value === undefined || String(value).trim() === '') {
        return null
      }
      return (
        <Box sx={fieldBoxSx}>
          <Typography sx={getLabelSx(isDarkMode)}>{label}</Typography>
          <Typography sx={getValueSx(isDarkMode)}>{String(value)}</Typography>
        </Box>
      )
    },
    [isDarkMode]
  )

  // Get display value for DTO fields
  const getDTODisplayValue = useCallback((dto: unknown): string => {
    if (!dto || typeof dto !== 'object') return '-'
    const dtoObj = dto as { languageTranslationId?: { configValue?: string }; settingValue?: string; id?: number }
    return dtoObj.languageTranslationId?.configValue || dtoObj.settingValue || (dtoObj.id ? String(dtoObj.id) : '-')
  }, [])

  // Get field value - prioritize form data (user input) over API data
  // Returns null if field is empty, so we can conditionally render
  const getFieldValue = useCallback((fieldName: string): string | number | null | undefined => {
    // First check form data (current user input) - this is what user actually entered
    const formValue = (formData as Record<string, unknown>)[fieldName]
    if (formValue !== undefined && formValue !== null && formValue !== '') {
      const stringValue = String(formValue).trim()
      if (stringValue !== '') {
        return formValue as string | number | null | undefined
      }
    }
    // Don't fallback to API data - only show what user entered
    return null
  }, [formData])
  
  // Check if field has a value (for conditional rendering)
  const hasFieldValue = useCallback((fieldName: string): boolean => {
    const value = getFieldValue(fieldName)
    return value !== null && value !== undefined && value !== ''
  }, [getFieldValue])

  return (
    <Box sx={{ width: '100%' }}>
      <Card
        sx={{
          boxShadow: 'none',
          backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
          width: '100%',
          margin: '0 auto',
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
              {getBeneficiaryLabel('CDL_MB_BENEFICIARY_DETAILS', 'Beneficiary Details')}
            </Typography>
            {!isReadOnly && onEditStep && (
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                onClick={() => {
                  onEditStep(0)
                }}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  textTransform: 'none',
                  fontSize: '12px',
                  borderColor: isDarkMode ? '#475569' : '#CBD5E1',
                  color: isDarkMode ? '#CBD5E1' : '#64748B',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                  },
                }}
              >
                Edit
              </Button>
            )}
          </Box>

          <Grid container spacing={3}>
            {hasFieldValue('beneficiaryFullName') && (
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField(
                  getBeneficiaryLabel('CDL_MB_BENEFICIARY_NAME', 'Beneficiary Full Name'),
                  getFieldValue('beneficiaryFullName')
                )}
              </Grid>
            )}

            {hasFieldValue('beneficiaryAddressLine1') && (
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField(
                  getBeneficiaryLabel('CDL_MB_BENEFICIARY_ADDRESS', 'Address'),
                  getFieldValue('beneficiaryAddressLine1')
                )}
              </Grid>
            )}

            {hasFieldValue('telephoneNumber') && (
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField(
                  getBeneficiaryLabel('CDL_MB_BENEFICIARY_TELEPHONE_NO', 'Telephone Number'),
                  getFieldValue('telephoneNumber')
                )}
              </Grid>
            )}

            {hasFieldValue('mobileNumber') && (
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField(
                  getBeneficiaryLabel('CDL_MB_BENEFICIARY_MOBILE_NO', 'Mobile Number'),
                  getFieldValue('mobileNumber')
                )}
              </Grid>
            )}

            {hasFieldValue('beneficiaryAccountNumber') && (
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField(
                  getBeneficiaryLabel('CDL_MB_BENEFICIARY_ACCOUNT_NUMBER', 'Account Number'),
                  getFieldValue('beneficiaryAccountNumber')
                )}
              </Grid>
            )}

            {hasFieldValue('beneficiaryBankName') && (
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField(
                  getBeneficiaryLabel('CDL_MB_BENEFICIARY_BANK_NAME', 'Bank Name'),
                  getFieldValue('beneficiaryBankName')
                )}
              </Grid>
            )}

            {hasFieldValue('bankIfscCode') && (
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField(
                  getBeneficiaryLabel('CDL_MB_BENEFICIARY_BANK_IFSC_CODE', 'Bank IFSC Code'),
                  getFieldValue('bankIfscCode')
                )}
              </Grid>
            )}

            {hasFieldValue('bankRoutingCode') && (
              <Grid size={{ xs: 12, md: 6 }}>
                {renderDisplayField(
                  getBeneficiaryLabel('CDL_MB_BENEFICIARY_ROUTING_CODE', 'Routing Code'),
                  getFieldValue('bankRoutingCode')
                )}
              </Grid>
            )}

            {(() => {
              const accountType = formData.accountTypeDTO
              const accountTypeValue = accountType ? getDTODisplayValue(accountType) : null
              return accountType && accountTypeValue && accountTypeValue !== '-' ? (
                <Grid size={{ xs: 12, md: 6 }}>
                  {renderDisplayField(
                    getBeneficiaryLabel('CDL_MB_BENEFICIARY_ACCOUNT_TYPE', 'Account Type'),
                    accountTypeValue
                  )}
                </Grid>
              ) : null
            })()}

            {(() => {
              const transferType = formData.transferTypeDTO
              const transferTypeValue = transferType ? getDTODisplayValue(transferType) : null
              return transferType && transferTypeValue && transferTypeValue !== '-' ? (
                <Grid size={{ xs: 12, md: 6 }}>
                  {renderDisplayField(
                    getBeneficiaryLabel('CDL_MB_BENEFICIARY_TRANSFER_TYPE', 'Transfer Type'),
                    transferTypeValue
                  )}
                </Grid>
              ) : null
            })()}

            {(() => {
              const role = formData.roleDTO
              const roleValue = role ? getDTODisplayValue(role) : null
              return role && roleValue && roleValue !== '-' ? (
                <Grid size={{ xs: 12, md: 6 }}>
                  {renderDisplayField(
                    getBeneficiaryLabel('CDL_MB_BENEFICIARY_ROLE', 'Role'),
                    roleValue
                  )}
                </Grid>
              ) : null
            })()}

            {hasFieldValue('additionalRemarks') && (
              <Grid size={{ xs: 12 }}>
                {renderDisplayField(
                  getBeneficiaryLabel('CDL_MB_BENEFICIARY_REMARKS', 'Additional Remarks'),
                  getFieldValue('additionalRemarks')
                )}
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Step2
