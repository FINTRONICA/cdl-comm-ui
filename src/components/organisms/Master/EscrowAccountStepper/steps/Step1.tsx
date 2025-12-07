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
import { useEscrowAccountLabelsWithCache } from '@/hooks/master/CustomerHook/useEscrowAccountLabelsWithCache'
import { useAppStore } from '@/store'
import { useBeneficiaryDropdowns } from '@/hooks/useBeneficiaryDropdowns'
import { useAccountTypes, useTransferTypes, useRoles } from '@/hooks/useApplicationSettings'
import { escrowAccountService } from '@/services/api/masterApi/Customer/escrowAccountService'
import type { MasterEscrowAccountData } from '@/services/api/masterApi/Customer/escrowAccountService'
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
  escrowAccountId?: string | null
  isReadOnly?: boolean
  isViewMode?: boolean
}

const Step1 = forwardRef<Step1Ref, Step1Props>(
  ({ onSaveAndNext, isEditMode, escrowAccountId, isReadOnly = false }, ref) => {
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
  const { getLabel } = useEscrowAccountLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  const getEscrowAccountLabel = useCallback(
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
          {getEscrowAccountLabel(
            'ESCROW_ACCOUNT_DETAILS',
            'Escrow Account Details'
          )}
        </Typography>

        {isLoading ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography>Loading dropdown data...</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Escrow Account Full Name */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="escrowAccountFullName"
                control={control}
                rules={{
                  required: 'Escrow Account Full Name is required',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={getEscrowAccountLabel(
                      'ESCROW_ACCOUNT_FULL_NAME',
                      'Escrow Account Full Name'
                    )}
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.escrowAccountFullName}
                    helperText={
                      errors.escrowAccountFullName?.message as string
                    }
                    sx={fieldStyles}
                  />
                )}
              />
            </Grid>

            {/* Escrow Account Address Line 1 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="escrowAccountAddressLine1"
                control={control}
                rules={{
                  required: 'Address Line 1 is required',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={getEscrowAccountLabel(
                      'ESCROW_ACCOUNT_ADDRESS',
                      'Address Line 1'
                    )}
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.escrowAccountAddressLine1}
                    helperText={
                      errors.escrowAccountAddressLine1?.message as string
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
                    label={getEscrowAccountLabel(
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
                    label={getEscrowAccountLabel(
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
                      {getEscrowAccountLabel('ROLE', 'Role')}
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
                      {getEscrowAccountLabel(
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

            {/* Escrow Account Number */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="escrowAccountNumber"
                control={control}
                rules={{
                  required: 'Account Number is required',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={getEscrowAccountLabel(
                      'ACCOUNT_NUMBER',
                      'Escrow Account No/IBAN'
                    )}
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.escrowAccountNumber}
                    helperText={
                      errors.escrowAccountNumber?.message as string
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
                      {getEscrowAccountLabel(
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

            {/* Escrow Bank Swift/BIC - Dropdown */}
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
                      {getEscrowAccountLabel(
                        'BANK_SWIFT_BIC',
                        'Escrow Bank Swift/BIC'
                      )}
                    </InputLabel>
                    <Select
                      {...field}
                      value={field.value || ''}
                      input={<OutlinedInput label="Escrow Bank Swift/BIC" />}
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

            {/* Escrow Bank Name - Text Field */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="escrowBankName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={getEscrowAccountLabel('BANK_NAME', 'Escrow Bank')}
                    fullWidth
                    disabled={isReadOnly}
                    error={!!errors.escrowBankName}
                    helperText={errors.escrowBankName?.message as string}
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
                    label={getEscrowAccountLabel(
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
            <Grid size={{ xs: 12 }}>
              <Controller
                name="additionalRemarks"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={getEscrowAccountLabel(
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
      const payload: MasterEscrowAccountData = {
        escrowAccountFullName: formData.escrowAccountFullName || '',
        escrowAccountAddressLine1: formData.escrowAccountAddressLine1 || '',
        telephoneNumber: formData.telephoneNumber || '',
        mobileNumber: formData.mobileNumber || '',
        escrowAccountNumber: formData.escrowAccountNumber || '',
        bankIfscCode: formData.bankIfscCode || '',
        escrowBankName: formData.escrowBankName || '',
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
      if (isEditMode && escrowAccountId) {
        response = await escrowAccountService.saveEscrowAccount(
          payload,
          true,
          escrowAccountId
        )
      } else {
        response = await escrowAccountService.saveEscrowAccount(payload, false)
      }

      const responseData = response as { data?: { id?: number | string }; id?: number | string }
      const savedId = responseData?.data?.id || responseData?.id

      if (onSaveAndNext && savedId) {
        onSaveAndNext({ id: savedId })
      }
    } catch (error) {
      throw error
    }
    }, [trigger, watch, isEditMode, escrowAccountId, onSaveAndNext])

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

