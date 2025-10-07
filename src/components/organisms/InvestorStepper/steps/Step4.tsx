import { useCapitalPartnerLabelsApi } from '@/hooks/useCapitalPartnerLabelsApi'
import { useAppStore } from '@/store'
import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react'
import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { usePaymentModes } from '../../../../hooks/useApplicationSettings1'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { Controller, useFormContext } from 'react-hook-form'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { capitalPartnerBankInfoService } from '../../../../services/api/capitalPartnerBankInfoService'
import { useGetEnhanced } from '@/hooks/useApiEnhanced'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { BankDetailsResponse } from '@/types/capitalPartner'
import {
  mapStep4ToCapitalPartnerBankInfoPayload,
  validateStep4Data,
  type Step4FormData,
} from '../../../../utils/capitalPartnerBankInfoMapper'

// Define missing style variables
const valueSx = {
  fontSize: '14px',
  fontWeight: 500,
  color: '#333',
  lineHeight: 1.4,
}

const labelSx = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#666',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  mb: 0.5,
}

const selectStyles = {
  '& .MuiOutlinedInput-root': {
    height: '32px',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#CAD5E2',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: '#CAD5E2',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563EB',
    },
  },
}

const commonInputStyles = {
  '& .MuiOutlinedInput-root': {
    height: '46px',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#CAD5E2',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: '#CAD5E2',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563EB',
    },
  },
  '& .MuiInputBase-input': {
    padding: '6px 12px',
    fontSize: '14px',
  },
}

interface Step4Props {
  onSaveAndNext?: (data: any) => void
  capitalPartnerId?: number | null
  isEditMode?: boolean
  isViewMode?: boolean
}

export interface Step4Ref {
  handleSaveAndNext: () => Promise<void>
}

const Step4 = forwardRef<Step4Ref, Step4Props>(
  (
    { onSaveAndNext, capitalPartnerId, isEditMode, isViewMode = false },
    ref
  ) => {
    const {
      control,
      watch,
      setValue,
      formState: { errors },
    } = useFormContext()
    const { getLabel } = useCapitalPartnerLabelsApi()
    const currentLanguage = useAppStore((state) => state.language)

    // Debug: Log when component mounts and props change
    useEffect(() => {}, [capitalPartnerId])

    // State for API operations
    const [saveError, setSaveError] = useState<string | null>(null)

    // Fetch dropdown data using our hooks
    const {
      data: paymentModes,
      loading: loadingPaymentModes,
      error: paymentModesError,
    } = usePaymentModes()

    // Load existing bank data when in edit mode
    const { data: existingBankData, isLoading: isLoadingExistingBank } =
      useGetEnhanced<BankDetailsResponse[]>(
        `${API_ENDPOINTS.CAPITAL_PARTNER_BANK_INFO.GET_ALL}?capitalPartnerId.equals=${capitalPartnerId || 0}`,
        {},
        {
          enabled: Boolean(isEditMode && capitalPartnerId),
        }
      )

    // Pre-populate form when existing data is loaded
    useEffect(() => {
      if (
        isEditMode &&
        existingBankData &&
        existingBankData.length > 0 &&
        !isLoadingExistingBank
      ) {
        const bankData = existingBankData[0]
        if (!bankData) return // Safety check

        setValue('payMode', bankData.payModeDTO?.settingValue || '')
        setValue('payeeName', bankData.cpbiPayeeName || '')
        setValue('accountNumber', bankData.cpbiAccountNumber || '')
        setValue('payeeAddress', bankData.cpbiPayeeAddress || '')
        setValue('bankName', bankData.cpbiBankName || '')
        setValue('bankAddress', bankData.cpbiBankAddress || '')
        setValue('beneficiaryRoutingCode', bankData.cpbiBeneRoutingCode || '')
        setValue('bic', bankData.cpbiBicCode || '')
      }
    }, [existingBankData, isLoadingExistingBank, isEditMode, setValue])

    // Function to handle save and next
    const handleSaveAndNext = async () => {
      try {
        setSaveError(null)

        // Check if we have capitalPartnerId from Step1
        if (!capitalPartnerId) {
          setSaveError('Capital Partner ID is required from Step1')
          throw new Error('Capital Partner ID is required from Step1')
        }

        // Get current form data
        const formData: Step4FormData = {
          payMode: watch('payMode'),
          accountNumber: watch('accountNumber'),
          payeeName: watch('payeeName'),
          payeeAddress: watch('payeeAddress'),
          bankName: watch('bankName'),
          bankAddress: watch('bankAddress'),
          beneficiaryRoutingCode: watch('beneficiaryRoutingCode'),
          bic: watch('bic'),
        }

        // Validate form data
        const validationErrors = validateStep4Data(formData)
        if (validationErrors.length > 0) {
          setSaveError(validationErrors.join(', '))
          throw new Error(validationErrors.join(', '))
        }

        // Map form data to API payload
        const payload = mapStep4ToCapitalPartnerBankInfoPayload(
          formData,
          capitalPartnerId,
          paymentModes
        )

        // Call API to save bank info data
        let response
        if (isEditMode && existingBankData && existingBankData.length > 0) {
          // Update existing bank info
          const existingBankId = existingBankData[0]?.id
          if (existingBankId) {
            // Add the id to the payload for update requests
            const updatePayload = {
              ...payload,
              id: existingBankId,
            }
            response =
              await capitalPartnerBankInfoService.updateCapitalPartnerBankInfo(
                existingBankId,
                updatePayload
              )
          } else {
            // Fallback to create if no existing ID
            response =
              await capitalPartnerBankInfoService.createCapitalPartnerBankInfo(
                payload
              )
          }
        } else {
          // Create new bank info
          response =
            await capitalPartnerBankInfoService.createCapitalPartnerBankInfo(
              payload
            )
        }

        // Call parent callback if provided
        if (onSaveAndNext) {
          onSaveAndNext(response)
        }
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : 'Failed to save data'
        )
        throw error // Re-throw to let parent handle the error
      }
    }

    // Expose the save function to parent component
    useImperativeHandle(
      ref,
      () => ({
        handleSaveAndNext,
      }),
      [handleSaveAndNext]
    )

    const renderTextField = (
      name: string,
      configId: string,
      fallbackLabel: string,
      defaultValue = ''
    ) => {
      const label = getLabel(configId, currentLanguage, fallbackLabel)
      return (
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name={name}
            control={control}
            defaultValue={defaultValue}
            render={({ field }) => (
              <TextField
                {...field}
                label={label}
                fullWidth
                disabled={isViewMode}
                InputLabelProps={{ sx: labelSx }}
                InputProps={{ sx: valueSx }}
                sx={commonInputStyles}
              />
            )}
          />
        </Grid>
      )
    }

    // Render function for API-driven dropdowns
    const renderApiSelectField = (
      name: string,
      configId: string,
      fallbackLabel: string,
      options: { id: number; displayName: string; settingValue: string }[],
      gridSize: number = 6,
      required = false,
      loading = false
    ) => {
      const label = getLabel(configId, currentLanguage, fallbackLabel)
      return (
        <Grid size={{ xs: 12, md: gridSize }}>
          <Controller
            name={name}
            control={control}
            rules={required ? { required: `${label} is required` } : {}}
            defaultValue={''}
            render={({ field }) => (
              <FormControl
                fullWidth
                error={!!errors[name]}
                sx={commonInputStyles}
              >
                <InputLabel sx={labelSx}>
                  {loading ? `Loading ${label}...` : label}
                </InputLabel>
                <Select
                  {...field}
                  label={loading ? `Loading ${label}...` : label}
                  sx={{
                    ...selectStyles,
                    ...valueSx,
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid #9ca3af',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: '2px solid #2563eb',
                    },
                  }}
                  IconComponent={KeyboardArrowDownIcon}
                  disabled={loading || isViewMode}
                >
                  {options.map((option) => (
                    <MenuItem key={option.id} value={option.settingValue}>
                      {option.displayName}
                    </MenuItem>
                  ))}
                </Select>
                {errors[name] && (
                  <FormHelperText error>
                    {errors[name]?.message?.toString()}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>
      )
    }

    const getFallbackOptions = (key: string) => {
      switch (key) {
        case 'payMode':
          return [
            {
              id: 1,
              displayName: 'TT (Telegraphic Transfer)',
              settingValue: 'TT',
            },
            { id: 2, displayName: 'Cash', settingValue: 'CASH' },
            { id: 3, displayName: 'Cheque', settingValue: 'CHEQUE' },
          ]
        default:
          return []
      }
    }

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Card
          sx={{
            boxShadow: 'none',
            backgroundColor: '#FFFFFFBF',
            width: '84%',
            margin: '0 auto',
          }}
        >
          <CardContent>
            {/* Show error if dropdowns fail to load */}
            {paymentModesError && (
              <Box
                sx={{
                  mb: 2,
                  p: 1,
                  bgcolor: '#fef2f2',
                  borderRadius: 1,
                  border: '1px solid #ef4444',
                }}
              >
                <Typography variant="body2" color="error">
                  ⚠️ Failed to load dropdown options. Using fallback values.
                </Typography>
              </Box>
            )}

            {/* Show save error */}
            {saveError && (
              <Box
                sx={{
                  mb: 2,
                  p: 1,
                  bgcolor: '#fef2f2',
                  borderRadius: 1,
                  border: '1px solid #ef4444',
                }}
              >
                <Typography variant="body2" color="error">
                  ⚠️ {saveError}
                </Typography>
              </Box>
            )}

            <Grid container rowSpacing={4} columnSpacing={2}>
              {renderApiSelectField(
                'payMode',
                'CDL_CP_PAY_MODE',
                'Pay Mode*',
                paymentModes?.length
                  ? paymentModes
                  : getFallbackOptions('payMode'),
                6,
                true,
                loadingPaymentModes
              )}
              {renderTextField(
                'accountNumber',
                'CDL_CP_ACCOUNT_NUMBER',
                'Account Number'
              )}
              {renderTextField('payeeName', 'CDL_CP_PAYEE_NAME', 'Payee Name')}
              {renderTextField(
                'payeeAddress',
                'CDL_CP_PAYEE_ADDRESS',
                'Payee Address'
              )}
              {renderTextField('bankName', 'CDL_CP_BANK_NAME', 'Bank Name')}
              {renderTextField(
                'bankAddress',
                'CDL_CP_BANK_ADDRESS',
                'Bank Address'
              )}
              {renderTextField(
                'beneficiaryRoutingCode',
                'CDL_CP_ROUTING_CODE',
                'Beneficiary Routing Code'
              )}
              {renderTextField('bic', 'DL_CP_BIC_CODE', 'BIC')}
            </Grid>
          </CardContent>
        </Card>
      </LocalizationProvider>
    )
  }
)

Step4.displayName = 'Step4'

export default Step4
