'use client'

import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react'
import {
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useTheme,
  type Theme,
} from '@mui/material'
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { Controller, useFormContext } from 'react-hook-form'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useBeneficiaryLabelsWithCache } from '@/hooks/master/CustomerHook/useBeneficiaryLabelsWithCache'
import { useAppStore } from '@/store'
import { getMasterLabel } from '@/constants/mappings/master/masterMapping'
import { useAccountTypes, useTransferTypes } from '@/hooks/useApplicationSettings'
import { useRoles } from '@/hooks/useRoles'
import {
  useSaveBeneficiary,
  useBeneficiaryById,
} from '@/hooks/master/CustomerHook/useBeneficiary'
import type { MasterBeneficiaryData } from '@/services/api/masterApi/Customer/beneficiaryService'
import {
  commonFieldStyles as sharedCommonFieldStyles,
  selectStyles as sharedSelectStyles,
  labelSx as sharedLabelSx,
  valueSx as sharedValueSx,
  cardStyles as sharedCardStyles,
  viewModeInputStyles,
  neutralBorder,
  neutralBorderHover,
} from '@/components/organisms/Master/styles'

export interface Step1Ref {
  handleSaveAndNext: () => Promise<void>
}

interface Step1Props {
  isReadOnly?: boolean
  beneficiaryId?: string | undefined
  isEditMode?: boolean
  isViewMode?: boolean
  onSaveAndNext?: (data: { id: number | string }) => void
}

const Step1 = forwardRef<Step1Ref, Step1Props>(
  ({ isReadOnly = false, beneficiaryId, isEditMode = false, isViewMode = false, onSaveAndNext }, ref) => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const textPrimary = isDark ? '#FFFFFF' : '#1E2939'
    const textSecondary = isDark ? '#CBD5E1' : '#6B7280'
    const fieldStyles = React.useMemo(
      () => (sharedCommonFieldStyles as (theme: Theme) => Record<string, unknown>)(theme),
      [theme]
    )
    const selectFieldStyles = React.useMemo(
      () => (sharedSelectStyles as (theme: Theme) => Record<string, unknown>)(theme),
      [theme]
    )
    const labelStyles = React.useMemo(
      () => (sharedLabelSx as (theme: Theme) => Record<string, unknown>)(theme),
      [theme]
    )
    const valueStyles = React.useMemo(
      () => (sharedValueSx as (theme: Theme) => Record<string, unknown>)(theme),
      [theme]
    )
    const cardBaseStyles = React.useMemo(
      () => (sharedCardStyles as (theme: Theme) => Record<string, unknown>)(theme),
      [theme]
    )
    const viewModeStyles = (viewModeInputStyles as (theme: Theme) => {
      backgroundColor: string
      borderColor: string
      textColor: string
    })(theme)
    const neutralBorderColor = (neutralBorder as (theme: Theme) => string)(theme)
    const neutralBorderHoverColor = (neutralBorderHover as (theme: Theme) => string)(theme)

    const {
      control,
      watch,
      setValue,
      trigger,
      formState: { errors },
    } = useFormContext()

    // State for beneficiary ID generation
    const [generatedId, setGeneratedId] = useState<string>('')
    const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false)

    // Ref to prevent double API calls (fixes StrictMode double-call issue)
    const hasLoadedDataRef = useRef(false)
    const isLoadingRef = useRef(false)

    // Use React Query hook instead of direct API call to prevent double calls
    const { data: beneficiaryDataFromHook } = useBeneficiaryById(
      isEditMode && beneficiaryId ? beneficiaryId : null
    )

    // Dynamic label support
    const { data: beneficiaryLabels, getLabel } = useBeneficiaryLabelsWithCache()
    const currentLanguage = useAppStore((state) => state.language) || 'EN'

    // Fetch dropdown options
    const { data: accountTypes = [], loading: accountTypesLoading } = useAccountTypes()
    const { data: transferTypes = [], loading: transferTypesLoading } = useTransferTypes()
    const { data: rolesData, isLoading: rolesLoading } = useRoles(0, 999)
    
    // Transform roles data to match expected format
    // useRoles returns Role[] directly, not a paginated response
    const roles: { id: number; displayName: string; settingValue: string }[] = React.useMemo(() => {
      if (!rolesData || !Array.isArray(rolesData)) return []
      return rolesData.map((role) => {
        const roleId = role.id || (role as { roleId?: number }).roleId || 0
        const roleName = (role as { roleName?: string }).roleName || (role as { name?: string }).name || `Role ${roleId}`
        return {
          id: Number(roleId),
          settingValue: String(roleId),
          displayName: roleName,
        }
      })
    }, [rolesData])

    // Transform account types and transfer types to match expected format
    const accountTypeOptions = React.useMemo(() => {
      return accountTypes.map((item) => ({
        id: item.id,
        settingValue: item.settingValue,
        displayName: item.displayName,
      }))
    }, [accountTypes])

    const transferTypeOptions = React.useMemo(() => {
      return transferTypes.map((item) => ({
        id: item.id,
        settingValue: item.settingValue,
        displayName: item.displayName,
      }))
    }, [transferTypes])

    const getBeneficiaryLabelDynamic = useCallback(
      (configId: string): string => {
        const fallback = getMasterLabel(configId)
        if (beneficiaryLabels) {
          return getLabel(configId, currentLanguage, fallback)
        }
        return fallback
      },
      [beneficiaryLabels, currentLanguage, getLabel]
    )

    // Initialize beneficiary ID from form value
    useEffect(() => {
      const subscription = watch((value, { name }) => {
        if (name === 'id' && value.id) {
          setGeneratedId(value.id)
        }
      })
      return () => subscription.unsubscribe()
    }, [watch])

    // Load existing beneficiary data in edit mode
    // FIXED: Use React Query hook data instead of direct API call to prevent double calls
    useEffect(() => {
      if (!isEditMode || !beneficiaryId) return
      if (hasLoadedDataRef.current || isLoadingRef.current) return
      if (!beneficiaryDataFromHook) return

      isLoadingRef.current = true
      try {
        const details = beneficiaryDataFromHook

        // Set ID field first - this is critical for edit mode
        // Use the uuid if available, otherwise format as BENEFICIARY-{id}
        const displayId = details.uuid || `BENEFICIARY-${details.id || beneficiaryId}`
        setGeneratedId(displayId)
        setValue('id', displayId, {
          shouldValidate: false,
          shouldDirty: false,
        })

        // If uuid is null, we should update it with the formatted ID
        // This will be saved on the next update
        if (!details.uuid) {
          setValue('uuid', displayId, {
            shouldValidate: false,
            shouldDirty: false,
          })
        }

        // Set basic fields
        if (details.beneficiaryFullName) {
          setValue('beneficiaryFullName', details.beneficiaryFullName, {
            shouldValidate: false,
            shouldDirty: false,
          })
        }
        if (details.beneficiaryAddressLine1) {
          setValue('beneficiaryAddressLine1', details.beneficiaryAddressLine1, {
            shouldValidate: false,
            shouldDirty: false,
          })
        }
        if (details.telephoneNumber) {
          setValue('telephoneNumber', details.telephoneNumber, {
            shouldValidate: false,
            shouldDirty: false,
          })
        }
        if (details.mobileNumber) {
          setValue('mobileNumber', details.mobileNumber, {
            shouldValidate: false,
            shouldDirty: false,
          })
        }
        if (details.beneficiaryAccountNumber) {
          setValue('beneficiaryAccountNumber', details.beneficiaryAccountNumber, {
            shouldValidate: false,
            shouldDirty: false,
          })
        }
        if (details.bankIfscCode) {
          setValue('bankIfscCode', details.bankIfscCode, {
            shouldValidate: false,
            shouldDirty: false,
          })
        }
        if (details.beneficiaryBankName) {
          setValue('beneficiaryBankName', details.beneficiaryBankName, {
            shouldValidate: false,
            shouldDirty: false,
          })
        }
        if (details.bankRoutingCode) {
          setValue('bankRoutingCode', details.bankRoutingCode, {
            shouldValidate: false,
            shouldDirty: false,
          })
        }
        if (details.additionalRemarks) {
          setValue('additionalRemarks', details.additionalRemarks, {
            shouldValidate: false,
            shouldDirty: false,
          })
        }

        // Set DTO fields as objects with id property
        if (details.accountTypeDTO?.id) {
          setValue('accountTypeDTO', { id: details.accountTypeDTO.id }, {
            shouldValidate: false,
            shouldDirty: false,
          })
        }
        if (details.transferTypeDTO?.id) {
          setValue('transferTypeDTO', { id: details.transferTypeDTO.id }, {
            shouldValidate: false,
            shouldDirty: false,
          })
        }
        if (details.roleDTO?.id) {
          setValue('roleDTO', { id: details.roleDTO.id }, {
            shouldValidate: false,
            shouldDirty: false,
          })
        }

        hasLoadedDataRef.current = true
        } catch {
          hasLoadedDataRef.current = false // Reset on error to allow retry
        } finally {
        isLoadingRef.current = false
      }
    }, [isEditMode, beneficiaryId, beneficiaryDataFromHook, setValue])

    // Reset refs when beneficiaryId changes (for navigation between different beneficiaries)
    useEffect(() => {
      hasLoadedDataRef.current = false
      isLoadingRef.current = false
    }, [beneficiaryId])

    // Function to generate new beneficiary ID
    const handleGenerateNewId = async () => {
      try {
        setIsGeneratingId(true)
        const tempId = `BENEFICIARY-${Date.now()}`
        setGeneratedId(tempId)
        setValue('id', tempId, {
          shouldValidate: true,
          shouldDirty: true,
        })
      } catch {
        // Handle error silently
      } finally {
        setIsGeneratingId(false)
      }
    }

    // Save mutation hook
    const saveBeneficiaryMutation = useSaveBeneficiary()

    // Expose handleSaveAndNext via ref
    useImperativeHandle(ref, () => ({
      handleSaveAndNext: async () => {
        try {
          // Trigger validation for required fields only
          const isValid = await trigger([
            'beneficiaryFullName',
            'beneficiaryAddressLine1',
            'telephoneNumber',
            'mobileNumber',
            'beneficiaryAccountNumber',
            'bankIfscCode',
            'beneficiaryBankName',
          ])

          if (!isValid) {
            throw new Error('Please fix validation errors before proceeding')
          }

          const formData = watch()
          
          // Get the generated ID from form or state
          let generatedIdValue = formData.id || formData.uuid || generatedId
          
          // If no generated ID exists and we're creating new, generate one
          if (!isEditMode && (!generatedIdValue || !String(generatedIdValue).startsWith('BENEFICIARY-'))) {
            generatedIdValue = `BENEFICIARY-${Date.now()}`
            setGeneratedId(generatedIdValue)
            setValue('id', generatedIdValue, {
              shouldValidate: true,
              shouldDirty: true,
            })
            setValue('uuid', generatedIdValue, {
              shouldValidate: false,
              shouldDirty: true,
            })
          }
          
          // Ensure we have a properly formatted UUID
          if (!generatedIdValue || !String(generatedIdValue).startsWith('BENEFICIARY-')) {
            // Format existing ID or generate new one
            if (isEditMode && beneficiaryId) {
              generatedIdValue = `BENEFICIARY-${beneficiaryId}`
            } else {
              generatedIdValue = `BENEFICIARY-${Date.now()}`
            }
            setGeneratedId(generatedIdValue)
            setValue('uuid', generatedIdValue, {
              shouldValidate: false,
              shouldDirty: true,
            })
          }
          
          // Prepare payload matching backend structure
          const payload: Record<string, unknown> = {
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
          }

          // For updates (PUT), include the beneficiary ID in the payload
          if (isEditMode && beneficiaryId) {
            payload.id = Number(beneficiaryId)
          } else {
            // For new beneficiaries (POST), include uuid and deleted
            payload.uuid = String(generatedIdValue)
            payload.deleted = formData.deleted ?? false
            payload.enabled = formData.enabled ?? true
          }

          // Only include DTOs if they have valid IDs, omit if null
          // DTOs should be just { id: number } - backend will handle the rest
          if (formData.accountTypeDTO?.id) {
            payload.accountTypeDTO = { id: Number(formData.accountTypeDTO.id) }
          }
          if (formData.transferTypeDTO?.id) {
            payload.transferTypeDTO = { id: Number(formData.transferTypeDTO.id) }
          }
          if (formData.roleDTO?.id) {
            payload.roleDTO = { id: Number(formData.roleDTO.id) }
          }

          const response = await saveBeneficiaryMutation.mutateAsync({
            data: payload as unknown as MasterBeneficiaryData,
            isEditing: isEditMode,
            ...(beneficiaryId && { beneficiaryId }),
          })

          // Extract ID from response - handle different response structures
          let savedId: number | string | undefined
          
          if (response) {
            // StepSaveResponse has a data property that might contain the beneficiary object
            if (response.data && typeof response.data === 'object') {
              const data = response.data as Record<string, unknown>
              savedId = (data.id as number | string) || (data.uuid as string) || undefined
            }
            // Check if response has id directly
            else if ((response as unknown as { id?: number | string })?.id) {
              savedId = (response as unknown as { id: number | string }).id
            }
          }
          
          // Fallback to beneficiaryId if available (for edit mode)
          if (!savedId && beneficiaryId) {
            savedId = beneficiaryId
          }
          
          if (onSaveAndNext && savedId) {
            onSaveAndNext({ id: savedId })
          } else if (!savedId) {
            throw new Error('Failed to save beneficiary: No ID returned from server')
          }
        } catch (error: unknown) {
          const errorData = error as {
            response?: { data?: { message?: string } }
            message?: string
          }
          const errorMessage =
            errorData?.response?.data?.message ||
            errorData?.message ||
            'Failed to save beneficiary. Please try again.'
          throw new Error(errorMessage)
        }
      },
    }), [trigger, watch, isEditMode, beneficiaryId, onSaveAndNext, saveBeneficiaryMutation, generatedId, setValue])

    const renderTextField = (
      name: string,
      label: string,
      defaultValue = '',
      gridSize: number = 6,
      disabled = false,
      required = false
    ) => (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValue === undefined || defaultValue === null ? '' : defaultValue}
          rules={{
            required: required ? `${label} is required` : false,
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label={label}
              fullWidth
              required={required}
              disabled={disabled || isReadOnly || isViewMode}
              error={!!errors[name]}
              helperText={errors[name]?.message?.toString()}
              value={field.value ?? ''}
              onChange={(e) => {
                field.onChange(e.target.value)
              }}
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
                ...(fieldStyles as Record<string, unknown>),
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
              } as Record<string, unknown>}
            />
          )}
        />
      </Grid>
    )

    const renderBeneficiaryIdField = (
      name: string,
      label: string,
      gridSize: number = 6,
      required = false
    ) => (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          defaultValue=""
          rules={{
            required: required ? `${label} is required` : false,
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label={label}
              required={required}
              value={field.value || generatedId || ''}
              error={!!errors[name]}
              helperText={errors[name]?.message?.toString()}
              onChange={(e) => {
                const value = e.target.value
                setGeneratedId(value)
                field.onChange(value)
              }}
              disabled={isReadOnly || isEditMode || isViewMode}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ mr: 0 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={handleGenerateNewId}
                      disabled={isGeneratingId || isReadOnly || isEditMode || isViewMode}
                      sx={{
                        color: theme.palette.primary.contrastText,
                        borderRadius: '8px',
                        textTransform: 'none',
                        background: theme.palette.primary.main,
                        '&:hover': {
                          background: theme.palette.primary.dark,
                        },
                        minWidth: '100px',
                        height: '32px',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 500,
                        fontStyle: 'normal',
                        fontSize: '11px',
                        lineHeight: '14px',
                        letterSpacing: '0.3px',
                        px: 1,
                      }}
                    >
                      {isGeneratingId ? 'Generating...' : 'Generate ID'}
                    </Button>
                  </InputAdornment>
                ),
                sx: valueStyles,
              }}
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
              sx={{
                ...(fieldStyles as Record<string, unknown>),
                ...((isReadOnly || isEditMode || isViewMode) && {
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
              } as Record<string, unknown>}
            />
          )}
        />
      </Grid>
    )

    const renderBeneficiarySelectField = (
      name: string,
      configId: string,
      fallbackLabel: string,
      options: { id: number; displayName: string; settingValue: string }[],
      gridMd: number = 6,
      required = false,
      loading = false
    ) => {
      const label = getBeneficiaryLabelDynamic(configId) || fallbackLabel
      return (
        <Grid size={{ xs: 12, md: gridMd }}>
          <Controller
            name={name}
            control={control}
            rules={required ? { required: `${label} is required` } : {}}
            defaultValue={''}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors[name]} required={required}>
                <InputLabel sx={labelStyles} required={required}>
                  {loading ? `Loading...` : label}
                </InputLabel>
                <Select
                  {...field}
                  label={loading ? `Loading...` : label}
                  required={required}
                  sx={[
                    selectFieldStyles,
                    valueStyles,
                    {
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: `1px solid ${neutralBorderColor}`,
                        borderRadius: '6px',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: `1px solid ${neutralBorderHoverColor}`,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: `2px solid ${theme.palette.primary.main}`,
                      },
                    },
                    (isReadOnly || isViewMode) && {
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: viewModeStyles.backgroundColor,
                        '& fieldset': {
                          borderColor: viewModeStyles.borderColor,
                        },
                        '&:hover fieldset': {
                          borderColor: viewModeStyles.borderColor,
                        },
                      },
                      '& .MuiSelect-select': {
                        color: viewModeStyles.textColor,
                      },
                    },
                    !!errors[name] && !isReadOnly && !isViewMode
                      ? {
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: `1px solid ${theme.palette.error.main}`,
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            border: `1px solid ${theme.palette.error.main}`,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            border: `1px solid ${theme.palette.error.main}`,
                          },
                        }
                      : null,
                  ]}
                  IconComponent={KeyboardArrowDownIcon}
                  disabled={loading || isReadOnly || isViewMode}
                  value={
                    typeof field.value === 'object' && field.value?.id
                      ? options.find((opt) => opt.id === field.value.id)?.settingValue || ''
                      : field.value || ''
                  }
                  onChange={(e) => {
                    const selectedValue = e.target.value as string
                    const selectedOption = options.find(
                      (opt) => opt.settingValue === selectedValue
                    )
                    if (selectedOption) {
                      setValue(name, { id: selectedOption.id }, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    } else {
                      setValue(name, null, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                  }}
                >
                  {options.map((option) => (
                    <MenuItem key={option.id} value={option.settingValue}>
                      {option.displayName}
                    </MenuItem>
                  ))}
                </Select>
                {errors[name] && (
                  <FormHelperText
                    error
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '12px',
                      marginLeft: '14px',
                      marginRight: '14px',
                      marginTop: '4px',
                    }}
                  >
                    {errors[name]?.message?.toString()}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>
      )
    }
    const renderTextFieldWithButtonIFSC = (
      name: string,
      label: string,
      buttonText: string,
      gridSize: number = 6,
      required = false
    ) => (
      <Grid key={name} size={{ xs: 12, md: gridSize }}>
        <Controller
          name={name}
          control={control}
          defaultValue=""
          rules={{
            required: required ? `${label} is required` : false,
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label={label}
              required={required}
              disabled={isReadOnly}
              error={!!errors[name]}
              helperText={errors[name]?.message?.toString()}
              value={field.value ?? ''}
              onChange={(e) => {
                field.onChange(e.target.value)
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        color: theme.palette.primary.contrastText,
                        borderRadius: '8px',
                        textTransform: 'none',
                        background: theme.palette.primary.main,
                        '&:hover': {
                          background: theme.palette.primary.dark,
                        },
                        minWidth: '100px',
                        height: '32px',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 500,
                        fontStyle: 'normal',
                        fontSize: '11px',
                        lineHeight: '14px',
                        letterSpacing: '0.3px',
                        px: 1,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                      }}
                      disabled={isReadOnly || isViewMode || !field.value?.trim()}
                    >
                      {buttonText}
                    </Button>
                  </InputAdornment>
                ),
                sx: valueStyles,
              }}
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
              sx={{
                ...(fieldStyles as Record<string, unknown>),
                ...(isReadOnly && {
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
              } as Record<string, unknown>}
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
              {renderBeneficiaryIdField(
                'id',
                getBeneficiaryLabelDynamic('CDL_MB_BENEFICIARY_ID'),
                6,
                false
              )}
              {renderTextField(
                'beneficiaryFullName',
                getBeneficiaryLabelDynamic('CDL_MB_BENEFICIARY_NAME'),
                '',
                6,
                false,
                true
              )}
              {renderTextField(
                'beneficiaryAddressLine1',
                getBeneficiaryLabelDynamic('CDL_MB_BENEFICIARY_ADDRESS'),
                '',
                6,
                false,
                true
              )}
              {renderTextField(
                'mobileNumber',
                getBeneficiaryLabelDynamic('CDL_MB_BENEFICIARY_MOBILE_NO'),
                '',
                6,
                false,
                true
              )}
              {renderTextField(
                'telephoneNumber',
                getBeneficiaryLabelDynamic('CDL_MB_BENEFICIARY_TELEPHONE_NO'),
                '',
                6,
                false,
                false
              )}
              {renderBeneficiarySelectField(
                'roleDTO',
                'CDL_MB_BENEFICIARY_ROLE',
                'Beneficiary Role',
                roles,
                6,
                false,
                rolesLoading
              )}
              {renderBeneficiarySelectField(
                'transferTypeDTO',
                'CDL_MB_BENEFICIARY_TRANSFER_TYPE',
                'Transfer Type',
                transferTypeOptions,
                6,
                false,
                transferTypesLoading
              )}
              {renderTextField(
                'beneficiaryAccountNumber',
                getBeneficiaryLabelDynamic('CDL_MB_BENEFICIARY_ACCOUNT_NUMBER'),
                '',
                6,
                false,
                true
              )}
              {renderBeneficiarySelectField(
                'accountTypeDTO',
                'CDL_MB_BENEFICIARY_ACCOUNT_TYPE',
                'Account Type',
                accountTypeOptions,
                6,
                false,
                accountTypesLoading
              )}
              {renderTextFieldWithButtonIFSC(
                'bankIfscCode',
                getBeneficiaryLabelDynamic('CDL_MB_BENEFICIARY_BANK_IFSC_CODE'),
                'Fetch Details',
                6,
                true
              )}
              {renderTextField(
                'beneficiaryBankName',
                getBeneficiaryLabelDynamic('CDL_MB_BENEFICIARY_BANK_NAME'),
                '',
                6,
                false,
                true
              )}
              {renderTextField(
                'bankRoutingCode',
                getBeneficiaryLabelDynamic('CDL_MB_BENEFICIARY_ROUTING_CODE'),
                '',
                6,
                false,
                false
              )}
              {renderTextField(
                'additionalRemarks',
                getBeneficiaryLabelDynamic('CDL_MB_BENEFICIARY_REMARKS'),
                '',
                12,
                false,
                false
              )}
            </Grid>
          </CardContent>
        </Card>
      </LocalizationProvider>
    )
  }
)

Step1.displayName = 'Step1'

export default Step1
