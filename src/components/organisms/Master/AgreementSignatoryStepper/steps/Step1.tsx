import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  useTheme,
  alpha,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { Controller, useFormContext } from 'react-hook-form'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { getAgreementSignatoryLabel } from '@/constants/mappings/master/Entity/agreementSignatoryMapping'
import { useAgreementSignatoryLabelsWithCache } from '@/hooks'
import { useAppStore } from '@/store'
import { agreementSignatoryService } from '@/services/api/masterApi/Entitie/agreementSignatoryService'
import { validateAgreementSignatoryField } from '@/lib/validation/masterValidation/agreementSignatorySchemasSchemas'
import {
  commonFieldStyles as sharedCommonFieldStyles,
  labelSx as sharedLabelSx,
  valueSx as sharedValueSx,
  cardStyles as sharedCardStyles,
  viewModeInputStyles,
} from '../styles'

interface Step1Props {
  isReadOnly?: boolean
  agreementSignatoryId?: string | undefined
}

const Step1 = ({ isReadOnly = false, agreementSignatoryId }: Step1Props) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const textPrimary = isDark ? '#FFFFFF' : '#1E2939'
  const textSecondary = isDark ? '#CBD5E1' : '#6B7280'
  const fieldStyles = React.useMemo(() => {
    if (typeof sharedCommonFieldStyles === 'function') {
      return sharedCommonFieldStyles(theme)
    }
    return sharedCommonFieldStyles
  }, [theme])

  const labelStyles = React.useMemo(() => {
    if (typeof sharedLabelSx === 'function') {
      return sharedLabelSx(theme)
    }
    return sharedLabelSx
  }, [theme])

  const valueStyles = React.useMemo(() => {
    if (typeof sharedValueSx === 'function') {
      return sharedValueSx(theme)
    }
    return sharedValueSx
  }, [theme])

  const cardBaseStyles = React.useMemo(() => {
    if (typeof sharedCardStyles === 'function') {
      return sharedCardStyles(theme)
    }
    return sharedCardStyles
  }, [theme])
  const viewModeStyles = viewModeInputStyles(theme)

  // Check if we're in edit mode (existing agreement signatory)
  const isEditMode = !!agreementSignatoryId
  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext()

  // Dynamic label support
  const { data: agreementSignatoryLabels, getLabel } =
    useAgreementSignatoryLabelsWithCache()
  const currentLanguage = useAppStore((state) => state.language) || 'EN'

  const getAgreementSignatoryLabelDynamic = useCallback(
    (configId: string): string => {
      const fallback = getAgreementSignatoryLabel(configId)

      if (agreementSignatoryLabels) {
        return getLabel(configId, currentLanguage, fallback)
      }
      return fallback
    },
    [agreementSignatoryLabels, currentLanguage, getLabel]
  )

  // Populate fields when agreement signatory data is loaded (for edit mode)
  useEffect(() => {
    if (!agreementSignatoryId || !isEditMode) {
      return
    }

    let isPopulating = false
    let timeoutId: NodeJS.Timeout | null = null

    const populateFields = async () => {
      if (isPopulating) return
      isPopulating = true

      try {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const agreementSignatory =
          await agreementSignatoryService.getAgreementSignatory(
            agreementSignatoryId
          )

        // Populate fields from API response
        if (agreementSignatory?.partyFullName) {
          setValue('partyFullName', agreementSignatory.partyFullName, {
            shouldValidate: true,
            shouldDirty: false,
          })
        }
        if (agreementSignatory?.addressLine1) {
          setValue('addressLine1', agreementSignatory.addressLine1, {
            shouldValidate: true,
            shouldDirty: false,
          })
        }
        if (agreementSignatory?.addressLine2) {
          setValue('addressLine2', agreementSignatory.addressLine2, {
            shouldValidate: true,
            shouldDirty: false,
          })
        }
        if (agreementSignatory?.addressLine3) {
          setValue('addressLine3', agreementSignatory.addressLine3, {
            shouldValidate: true,
            shouldDirty: false,
          })
        }
        if (agreementSignatory?.signatoryRole) {
          setValue('signatoryRole', agreementSignatory.signatoryRole, {
            shouldValidate: true,
            shouldDirty: false,
          })
        }
        if (agreementSignatory?.notificationContactName) {
          setValue(
            'notificationContactName',
            agreementSignatory.notificationContactName,
            {
              shouldValidate: true,
              shouldDirty: false,
            }
          )
        }
        if (agreementSignatory?.notificationAddressLine1) {
          setValue(
            'notificationAddressLine1',
            agreementSignatory.notificationAddressLine1,
            {
              shouldValidate: true,
              shouldDirty: false,
            }
          )
        }
        if (agreementSignatory?.notificationAddressLine2) {
          setValue(
            'notificationAddressLine2',
            agreementSignatory.notificationAddressLine2,
            {
              shouldValidate: true,
              shouldDirty: false,
            }
          )
        }
        if (agreementSignatory?.notificationAddressLine3) {
          setValue(
            'notificationAddressLine3',
            agreementSignatory.notificationAddressLine3,
            {
              shouldValidate: true,
              shouldDirty: false,
            }
          )
        }
        if (agreementSignatory?.notificationEmailAddress) {
          setValue(
            'notificationEmailAddress',
            agreementSignatory.notificationEmailAddress,
            {
              shouldValidate: true,
              shouldDirty: false,
            }
          )
        }
        if (agreementSignatory?.associationType) {
          setValue('associationType', agreementSignatory.associationType, {
            shouldValidate: true,
            shouldDirty: false,
          })
        }
      } catch (error) {
        console.error(
          'Error fetching agreement signatory data for form population:',
          error
        )
      } finally {
        isPopulating = false
      }
    }

    timeoutId = setTimeout(() => {
      populateFields()
    }, 300)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agreementSignatoryId, isEditMode])

  const renderTextField = (
    name: string,
    label: string,
    defaultValue = '',
    gridSize: number = 6,
    disabled = false,
    required = false
  ) => (
    <Grid key={`field-${name}`} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue === undefined ? '' : defaultValue}
        rules={{
          required: required ? `${label} is required` : false,
          validate: (value: unknown) =>
            validateAgreementSignatoryField(0, name, value),
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label={label}
            fullWidth
            required={required}
            disabled={disabled || isReadOnly}
            error={!!errors[name]}
            helperText={errors[name]?.message?.toString()}
            InputLabelProps={{
              sx: {
                ...labelStyles,
                ...(!!errors[name] && {
                  color: theme.palette.error.main,
                  '&.Mui-focused': { color: theme.palette.error.main },
                  '&.MuiFormLabel-filled': { color: theme.palette.error.main },
                }),
              },
            }}
            InputProps={{
              sx: {
                ...valueStyles,
                ...(isReadOnly && {
                  color: textSecondary,
                }),
              },
            }}
            sx={{
              ...(typeof fieldStyles === 'object' ? fieldStyles : {}),
              ...(disabled && {
                '& .MuiOutlinedInput-root': {
                  backgroundColor: viewModeStyles.backgroundColor,
                  color: textSecondary,
                  '& fieldset': {
                    borderColor: viewModeStyles.borderColor,
                  },
                  '&:hover fieldset': {
                    borderColor: viewModeStyles.borderColor,
                  },
                },
              }),
              ...(!!errors[name] &&
                !isReadOnly && {
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme.palette.error.main,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.error.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.error.main,
                    },
                  },
                }),
            }}
          />
        )}
      />
    </Grid>
  )

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card
        sx={{
          ...cardBaseStyles,
          width: '84%',
          margin: '0 auto',
        }}
      >
        <CardContent sx={{ color: textPrimary }}>
          <Grid container rowSpacing={4} columnSpacing={2}>
            {renderTextField(
              'partyReferenceNumber',
              getAgreementSignatoryLabelDynamic(
                'CDL_ESCROW_AGREEMENT_SIGNATORY_REF_NO'
              ),
              '',
              6,
              false,
              false
            )}
            {renderTextField(
              'partyCustomerReferenceNumber',
              getAgreementSignatoryLabelDynamic(
                'CDL_ESCROW_AGREEMENT_SIGNATORY_CRN_NUMBER'
              ),
              '',
              6,
              false,
              false
            )}
            {renderTextField(
              'partyFullName',
              getAgreementSignatoryLabelDynamic(
                'CDL_ESCROW_AGREEMENT_SIGNATORY_NAME'
              ),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'addressLine1',
              getAgreementSignatoryLabelDynamic(
                'CDL_ESCROW_AGREEMENT_SIGNATORY_ADDRESS_1'
              ),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'addressLine2',
              getAgreementSignatoryLabelDynamic(
                'CDL_ESCROW_AGREEMENT_SIGNATORY_ADDRESS_2'
              ),
              '',
              6,
              false,
              false
            )}
            {renderTextField(
              'addressLine3',
              getAgreementSignatoryLabelDynamic(
                'CDL_ESCROW_AGREEMENT_SIGNATORY_ADDRESS_3'
              ),
              '',
              6,
              false,
              false
            )}
            {renderTextField(
              'signatoryRole',
              getAgreementSignatoryLabelDynamic(
                'CDL_ESCROW_AGREEMENT_SIGNATORY_ROLE'
              ),
              '',
              6,
              false,
              true
            )}
            {renderTextField(
              'notificationContactName',
              getAgreementSignatoryLabelDynamic(
                'CDL_ESCROW_AGREEMENT_SIGNATORY_NOTICE_PERSON'
              ),
              '',
              6,
              false,
              false
            )}
            {renderTextField(
              'notificationAddressLine1',
              getAgreementSignatoryLabelDynamic(
                'CDL_ESCROW_AGREEMENT_SIGNATORY_NOTICE_ADDRESS_1'
              ),
              '',
              6,
              false,
              false
            )}
            {renderTextField(
              'notificationAddressLine2',
              getAgreementSignatoryLabelDynamic(
                'CDL_ESCROW_AGREEMENT_SIGNATORY_NOTICE_ADDRESS_2'
              ),
              '',
              6,
              false,
              false
            )}
            {renderTextField(
              'notificationAddressLine3',
              getAgreementSignatoryLabelDynamic(
                'CDL_ESCROW_AGREEMENT_SIGNATORY_NOTICE_ADDRESS_3'
              ),
              '',
              6,
              false,
              false
            )}
            {renderTextField(
              'notificationEmailAddress',
              getAgreementSignatoryLabelDynamic(
                'CDL_ESCROW_AGREEMENT_SIGNATORY_NOTICE_PERSON_EMAIL'
              ),
              '',
              6,
              false,
              false
            )}
            {renderTextField(
              'associationType',
              getAgreementSignatoryLabelDynamic(
                'CDL_ESCROW_AGREEMENT_SIGNATORY_PARTY_ASSOCIATE_TYPE'
              ),
              '',
              6,
              false,
              false
            )}
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  )
}

export default Step1


