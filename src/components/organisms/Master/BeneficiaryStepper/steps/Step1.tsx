'use client'

import React, { useCallback, useImperativeHandle, forwardRef } from 'react'
import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import { useBeneficiaryLabelsWithCache } from '@/hooks/master/CustomerHook/useBeneficiaryLabelsWithCache'
import { useAppStore } from '@/store'
import { useBeneficiaryDropdowns } from '@/hooks/useBeneficiaryDropdowns'
import { useAccountTypes, useTransferTypes, useRoles } from '@/hooks/useApplicationSettings'
import { beneficiaryService } from '@/services/api/masterApi/Customer/beneficiaryService'
import type { MasterBeneficiaryData } from '@/services/api/masterApi/Customer/beneficiaryService'
import type { ApplicationSettingItem } from '@/hooks/useApplicationSettings'
import {
  commonFieldStyles as sharedCommonFieldStyles,
  selectStyles as sharedSelectStyles,
  labelSx as sharedLabelSx,
  cardStyles as sharedCardStyles,
} from '../styles'

export interface Step1Ref {
  handleSaveAndNext: () => Promise<void>
}

interface Step1Props {
  onSaveAndNext?: (data: { id: number | string }) => void
  isEditMode?: boolean
  beneficiaryId?: string | null
  isReadOnly?: boolean
  isViewMode?: boolean
}

const Step1 = forwardRef<Step1Ref, Step1Props>(
  ({ onSaveAndNext, isEditMode, beneficiaryId, isReadOnly = false }, ref) => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const fieldStyles = React.useMemo(
      () => sharedCommonFieldStyles(theme),
      [theme]
    )
    const selectFieldStyles = React.useMemo(
      () => sharedSelectStyles(theme),
      [theme]
    )
    const labelStyles = React.useMemo(() => sharedLabelSx(theme), [theme])
    const cardBaseStyles = React.useMemo(
      () => sharedCardStyles(theme),
      [theme]
    )

    const {
      control,
      watch,
      trigger,
      formState: { errors },
    } = useFormContext()

  // Dynamic label support
  const { getLabel } = useBeneficiaryLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  const getBeneficiaryLabel = useCallback(
    (configId: string, fallback: string): string => {
      return getLabel(configId, currentLanguage, fallback)
    },
    [getLabel, currentLanguage]
  )

  // Dropdown data - using application settings API
  const {
    bankNames,
    isLoading: dropdownsLoading,
    getDisplayLabel,
  } = useBeneficiaryDropdowns()

  const { data: accountTypes = [], loading: accountTypesLoading } = useAccountTypes()
  const { data: transferTypes = [], loading: transferTypesLoading } = useTransferTypes()
  const { data: roles = [], loading: rolesLoading } = useRoles()

  const isLoading = dropdownsLoading || accountTypesLoading || transferTypesLoading || rolesLoading

  const cardContent = (
    <Card sx={cardBaseStyles}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            ...labelStyles,
            fontSize: '18px',
            fontWeight: 600,
            mb: 3,
            color: isDark ? '#F9FAFB' : '#1E2939',
          }}
        >
          {getBeneficiaryLabel(
            'BENEFICIARY_DETAILS',
            'Beneficiary Details'
          )}
        </Typography>

        {isLoading ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography>Loading dropdown data...</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Beneficiary Full Name */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="beneficiaryFullName"
                control={control}
                rules={{
                  required: 'Beneficiary Full Name is required',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={getBeneficiaryLabel(
                      'BENEFICIARY_FULL_NAME',
                      'Beneficiary Full Name'
                    )}
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.beneficiaryFullName}
                    helperText={
                      errors.beneficiaryFullName?.message as string
                    }
                    sx={fieldStyles}
                  />
                )}
              />
            </Grid>

            {/* Beneficiary Address Line 1 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="beneficiaryAddressLine1"
                control={control}
                rules={{
                  required: 'Address Line 1 is required',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={getBeneficiaryLabel(
                      'BENEFICIARY_ADDRESS',
                      'Address Line 1'
                    )}
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.beneficiaryAddressLine1}
                    helperText={
                      errors.beneficiaryAddressLine1?.message as string
                    }
                    sx={fieldStyles}
                  />
                )}
              />
            </Grid>

            {/* Telephone Number */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="telephoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={getBeneficiaryLabel(
                      'TELEPHONE_NUMBER',
                      'Telephone Number'
                    )}
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.telephoneNumber}
                    helperText={errors.telephoneNumber?.message as string}
                    sx={fieldStyles}
                  />
                )}
              />
            </Grid>

            {/* Mobile Number */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="mobileNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={getBeneficiaryLabel(
                      'MOBILE_NUMBER',
                      'Mobile Number'
                    )}
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.mobileNumber}
                    helperText={errors.mobileNumber?.message as string}
                    sx={fieldStyles}
                  />
                )}
              />
            </Grid>

            {/* Role - Dropdown */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="roleDTO"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.roleDTO}
                    disabled={isReadOnly}
                    sx={selectFieldStyles}
                  >
                    <InputLabel>
                      {getBeneficiaryLabel('ROLE', 'Role')}
                    </InputLabel>
                    <Select
                      value={field.value?.id || ''}
                      onChange={(e) =>
                        field.onChange({ id: Number(e.target.value) })
                      }
                      input={<OutlinedInput label="Role" />}
                    >
                      {roles.map((option: ApplicationSettingItem) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.displayName || option.settingValue || `Role ${option.id}`}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.roleDTO && (
                      <FormHelperText>
                        {errors.roleDTO.message as string}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Transfer Type - Dropdown */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="transferTypeDTO"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.transferTypeDTO}
                    disabled={isReadOnly}
                    sx={selectFieldStyles}
                  >
                    <InputLabel>
                      {getBeneficiaryLabel(
                        'TRANSFER_TYPE',
                        'Transfer Type'
                      )}
                    </InputLabel>
                    <Select
                      value={field.value?.id || ''}
                      onChange={(e) =>
                        field.onChange({ id: Number(e.target.value) })
                      }
                      input={<OutlinedInput label="Transfer Type" />}
                    >
                      {transferTypes.map((option: ApplicationSettingItem) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.displayName || option.settingValue || `Transfer Type ${option.id}`}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.transferTypeDTO && (
                      <FormHelperText>
                        {errors.transferTypeDTO.message as string}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Beneficiary Account Number */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="beneficiaryAccountNumber"
                control={control}
                rules={{
                  required: 'Account Number is required',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={getBeneficiaryLabel(
                      'ACCOUNT_NUMBER',
                      'Beneficiary Account No/IBAN'
                    )}
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.beneficiaryAccountNumber}
                    helperText={
                      errors.beneficiaryAccountNumber?.message as string
                    }
                    sx={fieldStyles}
                  />
                )}
              />
            </Grid>

            {/* Account Type - Dropdown */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="accountTypeDTO"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.accountTypeDTO}
                    disabled={isReadOnly}
                    sx={selectFieldStyles}
                  >
                    <InputLabel>
                      {getBeneficiaryLabel(
                        'ACCOUNT_TYPE',
                        'Account Type'
                      )}
                    </InputLabel>
                    <Select
                      value={field.value?.id || ''}
                      onChange={(e) =>
                        field.onChange({ id: Number(e.target.value) })
                      }
                      input={<OutlinedInput label="Account Type" />}
                    >
                      {accountTypes.map((option: ApplicationSettingItem) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.displayName || option.settingValue || `Account Type ${option.id}`}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.accountTypeDTO && (
                      <FormHelperText>
                        {errors.accountTypeDTO.message as string}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Beneficiary Bank Swift/BIC - Dropdown */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="bankIfscCode"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.bankIfscCode}
                    disabled={isReadOnly}
                    sx={selectFieldStyles}
                  >
                    <InputLabel>
                      {getBeneficiaryLabel(
                        'BANK_SWIFT_BIC',
                        'Beneficiary Bank Swift/BIC'
                      )}
                    </InputLabel>
                    <Select
                      {...field}
                      value={field.value || ''}
                      input={<OutlinedInput label="Beneficiary Bank Swift/BIC" />}
                    >
                      {bankNames.map((option) => (
                        <MenuItem key={option.id} value={getDisplayLabel(option)}>
                          {getDisplayLabel(option)}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.bankIfscCode && (
                      <FormHelperText>
                        {errors.bankIfscCode.message as string}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Beneficiary Bank Name - Text Field */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="beneficiaryBankName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={getBeneficiaryLabel('BANK_NAME', 'Beneficiary Bank')}
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.beneficiaryBankName}
                    helperText={errors.beneficiaryBankName?.message as string}
                    sx={fieldStyles}
                  />
                )}
              />
            </Grid>

            {/* Bank Routing Code */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="bankRoutingCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={getBeneficiaryLabel(
                      'ROUTING_CODE',
                      'Routing Code'
                    )}
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.bankRoutingCode}
                    helperText={errors.bankRoutingCode?.message as string}
                    sx={fieldStyles}
                  />
                )}
              />
            </Grid>

            {/* Additional Remarks */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="additionalRemarks"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={getBeneficiaryLabel(
                      'ADDITIONAL_REMARKS',
                      'Additional Remarks'
                    )}
                    fullWidth
                    multiline
                    rows={4}
                    disabled={isReadOnly}
                    error={!!errors.additionalRemarks}
                    helperText={errors.additionalRemarks?.message as string}
                    sx={fieldStyles}
                  />
                )}
              />
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
    )

    const handleSaveAndNext = useCallback(async () => {
      try {

      const isValid = await trigger()
      if (!isValid) {
        return
      }

      const formData = watch()
      const payload: MasterBeneficiaryData = {
        beneficiaryFullName: formData.beneficiaryFullName || '',
        beneficiaryAddressLine1: formData.beneficiaryAddressLine1 || '',
        telephoneNumber: formData.telephoneNumber || '',
        mobileNumber: formData.mobileNumber || '',
        beneficiaryAccountNumber: formData.beneficiaryAccountNumber || '',
        bankIfscCode: formData.bankIfscCode || '',
        beneficiaryBankName: formData.beneficiaryBankName || '',
        bankRoutingCode: formData.bankRoutingCode || '',
        additionalRemarks: formData.additionalRemarks || '',
        active: formData.active ?? true,
        enabled: formData.enabled ?? true,
        deleted: formData.deleted ?? false,
        accountTypeDTO: formData.accountTypeDTO?.id
          ? { id: formData.accountTypeDTO.id }
          : null,
        transferTypeDTO: formData.transferTypeDTO?.id
          ? { id: formData.transferTypeDTO.id }
          : null,
        roleDTO: formData.roleDTO?.id
          ? { id: Number(formData.roleDTO.id) }
          : null,
      }

      let response
      if (isEditMode && beneficiaryId) {
        response = await beneficiaryService.saveBeneficiary(
          payload,
          true,
          beneficiaryId
        )
      } else {
        response = await beneficiaryService.saveBeneficiary(payload, false)
      }

      const responseData = response as { data?: { id?: number | string }; id?: number | string }
      const savedId = responseData?.data?.id || responseData?.id

      if (onSaveAndNext && savedId) {
        onSaveAndNext({ id: savedId })
      }
    } catch (error) {
      throw error
    }
    }, [trigger, watch, isEditMode, beneficiaryId, onSaveAndNext])

    useImperativeHandle(
      ref,
      () => ({
        handleSaveAndNext,
      }),
      [handleSaveAndNext]
    )

    return cardContent
  }
)

Step1.displayName = 'Step1'

export default Step1

